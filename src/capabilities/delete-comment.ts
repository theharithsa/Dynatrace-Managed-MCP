import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const DeleteCommentSchema = z.object({
  problemId: z.string().describe('The ID of the problem'),
  commentId: z.string().describe('The ID of the comment to delete'),
});

// Tool definition
export const deleteComment = {
  definition: {
    name: 'delete_comment',
    description: 'Delete a comment from a problem',
    inputSchema: zodToJsonSchema(DeleteCommentSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = DeleteCommentSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    try {
      const response = await axios.delete(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/problems/${parsed.data.problemId}/comments/${parsed.data.commentId}`,
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
        throw new Error(`Failed to delete comment: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
