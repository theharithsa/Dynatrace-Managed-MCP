import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const GetLogsForEntitySchema = z.object({
  entityId: z.string().describe('The entity ID to get logs for'),
  from: z.string().optional().describe('Start time (ISO format or relative)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
  query: z.string().optional().describe('Log query filter'),
  sort: z.enum(['timestamp', '-timestamp']).optional().describe('Sort order'),
  limit: z.number().optional().describe('Maximum number of logs to return'),
  nextPageKey: z.string().optional().describe('Token for pagination'),
});

// Tool definition
export const getLogsForEntity = {
  definition: {
    name: 'get_logs_for_entity',
    description: 'Get logs for a specific entity',
    inputSchema: zodToJsonSchema(GetLogsForEntitySchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = GetLogsForEntitySchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    // Build query with entity filter  
    let queryString = `dt.entity.id="${parsed.data.entityId}"`;
    if (parsed.data.query) {
      queryString += ` AND ${parsed.data.query}`;
    }
    params.append('query', queryString);
    
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);
    if (parsed.data.sort) params.append('sort', parsed.data.sort);
    if (parsed.data.limit) params.append('limit', parsed.data.limit.toString());
    if (parsed.data.nextPageKey) params.append('nextPageKey', parsed.data.nextPageKey);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/logs/search?${params}`,
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
        throw new Error(`Failed to get logs for entity: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
