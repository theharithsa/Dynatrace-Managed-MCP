import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const AddTagsSchema = z.object({
  entitySelector: z.string().describe('Entity selector to specify entities'),
  tags: z.array(z.object({
    key: z.string().describe('Tag key'),
    value: z.string().optional().describe('Tag value'),
  })).describe('Array of tags to add'),
  from: z.string().optional().describe('Start time (ISO format or relative)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
});

// Tool definition
export const addTags = {
  definition: {
    name: 'add_tags',
    description: 'Add tags to an entity',
    inputSchema: zodToJsonSchema(AddTagsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = AddTagsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    params.append('entitySelector', parsed.data.entitySelector);
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);

    try {
      const response = await axios.post(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/tags?${params}`,
        { tags: parsed.data.tags },
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
                error: "Tag operations may not be supported in this Dynatrace Managed environment",
                status: error.response?.status,
                suggestion: "Manual tagging may need to be done through the Dynatrace UI or configuration API",
                alternative: "Consider using automatic tagging rules in the Dynatrace configuration"
              }, null, 2),
            }],
          };
        }
        throw new Error(`Failed to add tags: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
