import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const AddCommentSchema = z.object({
  problemId: z.string().describe('The ID of the problem to add comment to'),
  message: z.string().describe('The comment message'),
  userName: z.string().optional().describe('The user name adding the comment'),
  context: z.string().optional().describe('Additional context for the comment'),
});

// Tool definition
export const addComment = {
  definition: {
    name: 'add_comment',
    description: 'Add a comment to a problem',
    inputSchema: zodToJsonSchema(AddCommentSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = AddCommentSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const requestBody = {
      message: parsed.data.message,
      userName: parsed.data.userName,
      context: parsed.data.context,
    };

    try {
      const response = await axios.post(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/problems/${parsed.data.problemId}/comments`,
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
        throw new Error(`Failed to add comment: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
