import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListEntitiesSchema = z.object({
  entitySelector: z.string().optional().describe('Entity selector to filter entities'),
  from: z.string().optional().describe('Start time (ISO format or relative)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
  pageSize: z.number().optional().describe('Number of entities per page'),
  nextPageKey: z.string().optional().describe('Token for pagination'),
  fields: z.string().optional().describe('Comma-separated list of fields to include'),
});

// Tool definition
export const listEntities = {
  definition: {
    name: 'list_entities',
    description: 'List monitored entities in the environment',
    inputSchema: zodToJsonSchema(ListEntitiesSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListEntitiesSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.entitySelector) params.append('entitySelector', parsed.data.entitySelector);
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);
    if (parsed.data.pageSize) params.append('pageSize', parsed.data.pageSize.toString());
    if (parsed.data.nextPageKey) params.append('nextPageKey', parsed.data.nextPageKey);
    if (parsed.data.fields) params.append('fields', parsed.data.fields);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/entities?${params}`,
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
        throw new Error(`Failed to list entities: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
