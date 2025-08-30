import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { 
  CommentSchema,
  Comment 
} from '../../types/problems.js';

export const getCommentTool: Tool = {
  name: 'get_comment',
  description: 'Get a specific comment from a problem by comment ID',
  inputSchema: {
    type: 'object',
    properties: {
      problemId: {
        type: 'string',
        description: 'The ID of the problem containing the comment'
      },
      commentId: {
        type: 'string',
        description: 'The ID of the comment to retrieve'
      }
    },
    required: ['problemId', 'commentId']
  }
};

export async function getComment(
  client: DynatraceManagedClient,
  problemId: string,
  commentId: string
): Promise<Comment> {
  try {
    const response = await client.get(`/problems/${problemId}/comments/${commentId}`);

    const validatedResponse = CommentSchema.parse(response.data);

    return validatedResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Comment with ID '${commentId}' not found on problem '${problemId}'`);
    }
    throw new Error(`Failed to get comment: ${error.message}`);
  }
}

/**
 * Handler for the get_comment tool
 */
export async function handleGetComment(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const args = requestParams?.arguments || requestParams;
    
    if (!args.problemId) {
      throw new Error('problemId is required');
    }
    if (!args.commentId) {
      throw new Error('commentId is required');
    }

    const comment = await getComment(client, args.problemId, args.commentId);

    const createdDate = new Date(comment.createdAtTimestamp).toISOString();
    const context = comment.context ? `\n📄 **Context**: ${comment.context}` : '';

    return {
      content: [
        {
          type: 'text',
          text: `# 💬 Comment Details

📊 **Info**:
   • **Comment ID**: ${comment.id}
   • **Author**: ${comment.authorName}
   • **Created**: ${createdDate}

💬 **Content**: ${comment.content}${context}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error getting comment**: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
