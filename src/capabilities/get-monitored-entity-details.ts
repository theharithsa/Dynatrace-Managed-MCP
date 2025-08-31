import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const GetMonitoredEntityDetailsSchema = z.object({
  entityId: z.string().describe('Entity ID'),
  fields: z.string().optional().describe('Additional fields to include'),
});

// Tool definition
export const getMonitoredEntityDetails = {
  definition: {
    name: 'get_monitored_entity_details',
    description: 'Get detailed information about a specific monitored entity by its ID',
    inputSchema: zodToJsonSchema(GetMonitoredEntityDetailsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = GetMonitoredEntityDetailsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const { entityId, fields } = parsed.data;
    const params = new URLSearchParams();
    
    if (fields) params.append('fields', fields);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/entities/${entityId}?${params}`,
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
        throw new Error(`Failed to get entity details: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
