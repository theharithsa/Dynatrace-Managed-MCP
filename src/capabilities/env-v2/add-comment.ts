import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { 
  AddCommentRequestSchema,
  AddCommentRequest 
} from '../../types/problems.js';

export const addCommentTool: Tool = {
  name: 'add_comment',
  description: 'Add a new comment to a specific problem',
  inputSchema: {
    type: 'object',
    properties: {
      problemId: {
        type: 'string',
        description: 'The ID of the problem to add a comment to'
      },
      message: {
        type: 'string',
        description: 'The content of the comment'
      },
      context: {
        type: 'string',
        description: 'Optional context information for the comment'
      }
    },
    required: ['problemId', 'message']
  }
};

export async function addComment(
  client: DynatraceManagedClient,
  problemId: string,
  request: AddCommentRequest
): Promise<boolean> {
  try {
    const validatedRequest = AddCommentRequestSchema.parse(request);

    const response = await client.post(`/problems/${problemId}/comments`, validatedRequest);

    return response.status === 201;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Problem with ID '${problemId}' not found`);
    }
    throw new Error(`Failed to add comment: ${error.message}`);
  }
}

/**
 * Handler for the add_comment tool
 */
export async function handleAddComment(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const args = requestParams?.arguments || requestParams;
    
    if (!args.problemId) {
      throw new Error('problemId is required');
    }
    if (!args.message) {
      throw new Error('message is required');
    }

    const commentRequest: AddCommentRequest = {
      message: args.message,
      ...(args.context && { context: args.context })
    };

    const success = await addComment(client, args.problemId, commentRequest);

    if (success) {
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Comment Added Successfully** to problem ${args.problemId}\n\n💬 **Message**: ${args.message}${args.context ? `\n📄 **Context**: ${args.context}` : ''}`
          }
        ]
      };
    } else {
      throw new Error('Failed to add comment - unexpected response');
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error adding comment**: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
