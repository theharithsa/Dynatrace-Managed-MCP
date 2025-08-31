import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListMonitoringStatesSchema = z.object({
  entitySelector: z.string().optional().describe('Entity selector to filter entities'),
  pageSize: z.number().optional().describe('Number of monitoring states per page'),
  nextPageKey: z.string().optional().describe('Token for pagination'),
});

// Tool definition
export const listMonitoringStates = {
  definition: {
    name: 'list_monitoring_states',
    description: 'List monitoring states of entities in the environment',
    inputSchema: zodToJsonSchema(ListMonitoringStatesSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListMonitoringStatesSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.entitySelector) params.append('entitySelector', parsed.data.entitySelector);
    if (parsed.data.pageSize) params.append('pageSize', parsed.data.pageSize.toString());
    if (parsed.data.nextPageKey) params.append('nextPageKey', parsed.data.nextPageKey);

    try {
      // Note: Direct monitoring states endpoint may not be available in all Dynatrace Managed versions
      // Try the entities endpoint to get monitoring state information
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/entities?${params}`,
        {
          headers: {
            'Authorization': `Api-Token ${dtEnv.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Filter and transform to show monitoring state information
      const entitiesWithStates = response.data.entities?.map((entity: any) => ({
        entityId: entity.entityId,
        displayName: entity.displayName,
        entityType: entity.type,
        lastSeenTms: entity.lastSeenTms,
        firstSeenTms: entity.firstSeenTms,
        // Note: Monitoring state field may not be directly available
        // This provides entity availability information instead
      }));

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ 
            entities: entitiesWithStates,
            note: "Monitoring states may not be directly available. Entity availability information provided instead."
          }, null, 2),
        }],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to list monitoring states: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
