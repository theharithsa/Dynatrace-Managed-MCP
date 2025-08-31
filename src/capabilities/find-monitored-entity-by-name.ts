import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const FindMonitoredEntityByNameSchema = z.object({
  entityName: z.string().describe('Name of the entity to search for'),
  entityType: z.string().optional().describe('Type of entity (HOST, SERVICE, APPLICATION, etc.)'),
});

// Tool definition
export const findMonitoredEntityByName = {
  definition: {
    name: 'find_monitored_entity_by_name',
    description: 'Find monitored entities by name and optionally by type',
    inputSchema: zodToJsonSchema(FindMonitoredEntityByNameSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = FindMonitoredEntityByNameSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const { entityName, entityType } = parsed.data;
    
    // Build entity selector to search by name
    let entitySelector = `entityName("${entityName}")`;
    if (entityType) {
      entitySelector = `type("${entityType}"),${entitySelector}`;
    }

    const params = new URLSearchParams();
    params.append('entitySelector', entitySelector);

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
        throw new Error(`Failed to find entity: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
