import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListEntityTypesSchema = z.object({
  pageSize: z.number().optional().describe('Number of entity types per page'),
  nextPageKey: z.string().optional().describe('Token for pagination'),
});

// Tool definition
export const listEntityTypes = {
  definition: {
    name: 'list_entity_types',
    description: 'List available entity types in the environment',
    inputSchema: zodToJsonSchema(ListEntityTypesSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListEntityTypesSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.pageSize) params.append('pageSize', parsed.data.pageSize.toString());
    if (parsed.data.nextPageKey) params.append('nextPageKey', parsed.data.nextPageKey);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/entityTypes?${params}`,
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
        throw new Error(`Failed to list entity types: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
