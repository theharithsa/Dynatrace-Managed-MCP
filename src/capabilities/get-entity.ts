import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const GetEntitySchema = z.object({
  entityId: z.string().describe('The ID of the entity to retrieve'),
  from: z.string().optional().describe('Start time for entity data'),
  to: z.string().optional().describe('End time for entity data'),
  fields: z.string().optional().describe('Comma-separated list of fields to include'),
});

// Tool definition
export const getEntity = {
  definition: {
    name: 'get_entity',
    description: 'Get detailed information about a specific entity',
    inputSchema: zodToJsonSchema(GetEntitySchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = GetEntitySchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);
    if (parsed.data.fields) params.append('fields', parsed.data.fields);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/entities/${parsed.data.entityId}?${params}`,
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
        throw new Error(`Failed to get entity: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
