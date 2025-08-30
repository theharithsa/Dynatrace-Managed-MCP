import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';

export const deleteCommentTool: Tool = {
  name: 'delete_comment',
  description: 'Delete a specific comment from a problem',
  inputSchema: {
    type: 'object',
    properties: {
      problemId: {
        type: 'string',
        description: 'The ID of the problem containing the comment'
      },
      commentId: {
        type: 'string',
        description: 'The ID of the comment to delete'
      }
    },
    required: ['problemId', 'commentId']
  }
};

export async function deleteComment(
  client: DynatraceManagedClient,
  problemId: string,
  commentId: string
): Promise<boolean> {
  try {
    const response = await client.delete(`/problems/${problemId}/comments/${commentId}`);

    return response.status === 204;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Comment with ID '${commentId}' not found on problem '${problemId}'`);
    }
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
}

/**
 * Handler for the delete_comment tool
 */
export async function handleDeleteComment(
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

    const success = await deleteComment(client, args.problemId, args.commentId);

    if (success) {
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Comment Deleted Successfully**

📊 **Details**:
   • **Problem ID**: ${args.problemId}
   • **Comment ID**: ${args.commentId}`
          }
        ]
      };
    } else {
      throw new Error('Failed to delete comment - unexpected response');
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error deleting comment**: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
