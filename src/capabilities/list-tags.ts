import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListTagsSchema = z.object({
  entitySelector: z.string().describe('Entity selector to filter entities (required)'),
  from: z.string().optional().describe('Start time (ISO format or relative)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
});

// Tool definition
export const listTags = {
  definition: {
    name: 'list_tags',
    description: 'List tags for entities',
    inputSchema: zodToJsonSchema(ListTagsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListTagsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    // entitySelector is required according to API documentation
    params.append('entitySelector', parsed.data.entitySelector);
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/tags?${params}`,
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
        if (error.response?.status === 404) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: "Tag operations may not be available in this Dynatrace Managed environment",
                status: 404,
                suggestion: "Tags may be viewable through the entities endpoint using fields parameter",
                alternative: "Try using list_entities with entitySelector and check entity properties"
              }, null, 2),
            }],
          };
        }
        throw new Error(`Failed to list tags: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
