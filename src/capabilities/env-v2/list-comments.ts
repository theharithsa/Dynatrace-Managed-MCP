import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { 
  CommentsListResponseSchema, 
  ListCommentsParams,
  CommentsListResponse 
} from '../../types/problems.js';

export const listCommentsTool: Tool = {
  name: 'list_comments',
  description: 'Get all comments on a specific problem with pagination',
  inputSchema: {
    type: 'object',
    properties: {
      problemId: {
        type: 'string',
        description: 'The ID of the problem to get comments for'
      },
      nextPageKey: {
        type: 'string',
        description: 'Token for pagination to get the next page of results'
      },
      pageSize: {
        type: 'number',
        description: 'Number of comments to return per page (1-500)',
        minimum: 1,
        maximum: 500
      }
    },
    required: ['problemId']
  }
};

export async function listComments(
  client: DynatraceManagedClient,
  problemId: string,
  params: ListCommentsParams = {}
): Promise<CommentsListResponse> {
  try {
    const queryParams: Record<string, string> = {};
    
    if (params.nextPageKey) queryParams.nextPageKey = params.nextPageKey;
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();

    const response = await client.get(`/problems/${problemId}/comments`, {
      params: queryParams
    });

    const validatedResponse = CommentsListResponseSchema.parse(response.data);

    return validatedResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Problem with ID '${problemId}' not found`);
    }
    throw new Error(`Failed to list comments: ${error.message}`);
  }
}

/**
 * Handler for the list_comments tool
 */
export async function handleListComments(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const args = requestParams?.arguments || requestParams;
    
    if (!args.problemId) {
      throw new Error('problemId is required');
    }

    const result = await listComments(client, args.problemId, args);

    if (result.comments.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `💬 **No Comments Found** for problem ${args.problemId}`
          }
        ]
      };
    }

    // Format the response for better readability
    const formattedComments = result.comments.map((comment, index) => {
      const createdDate = new Date(comment.createdAtTimestamp).toISOString();
      const context = comment.context ? `\n   📄 **Context**: ${comment.context}` : '';
      
      return `${index + 1}. **${comment.authorName}** (${createdDate})
   💬 ${comment.content}${context}
   🔗 **ID**: ${comment.id}`;
    }).join('\n\n');

    const pageInfo = result.nextPageKey ? 
      `\n\n📄 **Page Info**: Showing ${result.pageSize} comments. Use nextPageKey "${result.nextPageKey}" for next page.` : 
      `\n\n📄 **Page Info**: Showing ${result.pageSize} comments (final page).`;

    return {
      content: [
        {
          type: 'text',
          text: `# 💬 Comments for Problem ${args.problemId}\n\n**Total Comments**: ${result.totalCount}\n\n${formattedComments}${pageInfo}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error listing comments**: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
