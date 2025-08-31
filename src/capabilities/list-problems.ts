import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListProblemsSchema = z.object({
  from: z.string().optional().describe('Start time (ISO format or relative like now-2h)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
  problemSelector: z.string().optional().describe('Problem selector query'),
  entitySelector: z.string().optional().describe('Entity selector query'),
  fields: z.string().optional().describe('Additional fields to include'),
  pageSize: z.number().optional().describe('Number of problems per page (1-500)'),
});

// Tool definition
export const listProblems = {
  definition: {
    name: 'list_problems',
    description: 'List problems observed within the specified timeframe with comprehensive filtering options',
    inputSchema: zodToJsonSchema(ListProblemsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListProblemsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);
    if (parsed.data.problemSelector) params.append('problemSelector', parsed.data.problemSelector);
    if (parsed.data.entitySelector) params.append('entitySelector', parsed.data.entitySelector);
    if (parsed.data.fields) params.append('fields', parsed.data.fields);
    if (parsed.data.pageSize) params.append('pageSize', parsed.data.pageSize.toString());

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/problems?${params}`,
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
        throw new Error(`Failed to list problems: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
