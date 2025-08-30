import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { 
  CloseProblemRequestSchema, 
  CloseProblemResponseSchema,
  CloseProblemRequest,
  CloseProblemResponse 
} from '../../types/problems.js';

export const closeProblemTool: Tool = {
  name: 'close_problem',
  description: 'Close a specific problem and add a closing comment',
  inputSchema: {
    type: 'object',
    properties: {
      problemId: {
        type: 'string',
        description: 'The ID of the problem to close'
      },
      message: {
        type: 'string',
        description: 'The closing comment message'
      }
    },
    required: ['problemId', 'message']
  }
};

export async function closeProblem(
  client: DynatraceManagedClient,
  problemId: string,
  request: CloseProblemRequest
): Promise<CloseProblemResponse | null> {
  try {
    const validatedRequest = CloseProblemRequestSchema.parse(request);

    const response = await client.post(`/problems/${problemId}/close`, validatedRequest);

    if (response.status === 204) {
      // Problem was already closed
      return null;
    }

    const validatedResponse = CloseProblemResponseSchema.parse(response.data);

    return validatedResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Problem with ID '${problemId}' not found`);
    }
    if (error.response?.status === 204) {
      throw new Error(`Problem '${problemId}' is already closed`);
    }
    throw new Error(`Failed to close problem: ${error.message}`);
  }
}

/**
 * Handler for the close_problem tool
 */
export async function handleCloseProblem(
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

    const result = await closeProblem(client, args.problemId, { message: args.message });

    if (result === null) {
      return {
        content: [
          {
            type: 'text',
            text: `ℹ️ **Problem Already Closed**: Problem ${args.problemId} was already closed.`
          }
        ]
      };
    }

    const closeDate = new Date(result.closeTimestamp).toISOString();

    return {
      content: [
        {
          type: 'text',
          text: `✅ **Problem Closed Successfully**

📊 **Details**:
   • **Problem ID**: ${result.problemId}
   • **Closed At**: ${closeDate}
   • **Closing**: ${result.closing}

💬 **Closing Comment**:
   • **Author**: ${result.comment.authorName}
   • **Created**: ${new Date(result.comment.createdAtTimestamp).toISOString()}
   • **Comment**: ${result.comment.content}
   • **Comment ID**: ${result.comment.id}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error closing problem**: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
