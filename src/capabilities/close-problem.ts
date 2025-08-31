import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const CloseProblemSchema = z.object({
  problemId: z.string().describe('The ID of the problem to close'),
  message: z.string().optional().describe('Comment message when closing the problem'),
});

// Tool definition
export const closeProblem = {
  definition: {
    name: 'close_problem',
    description: 'Close a problem',
    inputSchema: zodToJsonSchema(CloseProblemSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = CloseProblemSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const requestBody = parsed.data.message ? { message: parsed.data.message } : {};

    try {
      const response = await axios.post(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/problems/${parsed.data.problemId}/close`,
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
        throw new Error(`Failed to close problem: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
