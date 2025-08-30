import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { 
  UpdateCommentRequestSchema,
  UpdateCommentRequest 
} from '../../types/problems.js';

export const updateCommentTool: Tool = {
  name: 'update_comment',
  description: 'Update a specific comment on a problem',
  inputSchema: {
    type: 'object',
    properties: {
      problemId: {
        type: 'string',
        description: 'The ID of the problem containing the comment'
      },
      commentId: {
        type: 'string',
        description: 'The ID of the comment to update'
      },
      message: {
        type: 'string',
        description: 'The updated content of the comment'
      },
      context: {
        type: 'string',
        description: 'Optional updated context information for the comment'
      }
    },
    required: ['problemId', 'commentId', 'message']
  }
};

export async function updateComment(
  client: DynatraceManagedClient,
  problemId: string,
  commentId: string,
  request: UpdateCommentRequest
): Promise<boolean> {
  try {
    const validatedRequest = UpdateCommentRequestSchema.parse(request);

    const response = await client.put(`/problems/${problemId}/comments/${commentId}`, validatedRequest);

    return response.status === 204;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Comment with ID '${commentId}' not found on problem '${problemId}'`);
    }
    throw new Error(`Failed to update comment: ${error.message}`);
  }
}

/**
 * Handler for the update_comment tool
 */
export async function handleUpdateComment(
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
    if (!args.message) {
      throw new Error('message is required');
    }

    const updateRequest: UpdateCommentRequest = {
      message: args.message,
      ...(args.context && { context: args.context })
    };

    const success = await updateComment(client, args.problemId, args.commentId, updateRequest);

    if (success) {
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Comment Updated Successfully**

📊 **Details**:
   • **Problem ID**: ${args.problemId}
   • **Comment ID**: ${args.commentId}

💬 **Updated Content**: ${args.message}${args.context ? `\n📄 **Context**: ${args.context}` : ''}`
          }
        ]
      };
    } else {
      throw new Error('Failed to update comment - unexpected response');
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error updating comment**: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
