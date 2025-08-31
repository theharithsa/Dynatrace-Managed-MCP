import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const UpdateCommentSchema = z.object({
  problemId: z.string().describe('The ID of the problem'),
  commentId: z.string().describe('The ID of the comment to update'),
  message: z.string().describe('The updated comment message'),
  userName: z.string().optional().describe('The user name updating the comment'),
  context: z.string().optional().describe('Additional context for the comment'),
});

// Tool definition
export const updateComment = {
  definition: {
    name: 'update_comment',
    description: 'Update an existing comment on a problem',
    inputSchema: zodToJsonSchema(UpdateCommentSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = UpdateCommentSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const requestBody = {
      message: parsed.data.message,
      userName: parsed.data.userName,
      context: parsed.data.context,
    };

    try {
      const response = await axios.put(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/problems/${parsed.data.problemId}/comments/${parsed.data.commentId}`,
        requestBody,
        {
          headers: {
            'Authorization': `Api-Token ${dtEnv.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        }],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to update comment: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
