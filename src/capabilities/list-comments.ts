import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListCommentsSchema = z.object({
  problemId: z.string().describe('The ID of the problem to list comments for'),
  pageSize: z.number().optional().describe('Number of comments per page'),
  nextPageKey: z.string().optional().describe('Token for pagination'),
});

// Tool definition
export const listComments = {
  definition: {
    name: 'list_comments',
    description: 'List comments for a specific problem',
    inputSchema: zodToJsonSchema(ListCommentsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListCommentsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.pageSize) params.append('pageSize', parsed.data.pageSize.toString());
    if (parsed.data.nextPageKey) params.append('nextPageKey', parsed.data.nextPageKey);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/problems/${parsed.data.problemId}/comments?${params}`,
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
        throw new Error(`Failed to list comments: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
