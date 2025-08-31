import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const DeleteTagsSchema = z.object({
  entitySelector: z.string().describe('Entity selector to specify entities'),
  key: z.string().describe('The key of the tag to be deleted'),
  value: z.string().optional().describe('The value of the tag to be deleted'),
  deleteAllWithKey: z.boolean().optional().describe('If true, all tags with the specified key are deleted'),
  from: z.string().optional().describe('Start time (ISO format or relative)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
});

// Tool definition
export const deleteTags = {
  definition: {
    name: 'delete_tags',
    description: 'Delete tags from an entity',
    inputSchema: zodToJsonSchema(DeleteTagsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = DeleteTagsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    params.append('entitySelector', parsed.data.entitySelector);
    params.append('key', parsed.data.key);
    if (parsed.data.value) params.append('value', parsed.data.value);
    if (parsed.data.deleteAllWithKey !== undefined) params.append('deleteAllWithKey', parsed.data.deleteAllWithKey.toString());
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);

    try {
      const response = await axios.delete(
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
        if (error.response?.status === 404 || error.response?.status === 405) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: "Tag deletion may not be supported in this Dynatrace Managed environment",
                status: error.response?.status,
                suggestion: "Manual tag removal may need to be done through the Dynatrace UI",
                alternative: "Consider modifying automatic tagging rules in the Dynatrace configuration"
              }, null, 2),
            }],
          };
        }
        throw new Error(`Failed to delete tags: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
