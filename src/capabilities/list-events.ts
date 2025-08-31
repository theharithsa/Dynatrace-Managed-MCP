import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListEventsSchema = z.object({
  from: z.string().optional().describe('Start time (ISO format or relative)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
  eventTypes: z.array(z.string()).optional().describe('Event types to filter by'),
  entitySelector: z.string().optional().describe('Entity selector to filter events'),
  pageSize: z.number().optional().describe('Number of events per page'),
  nextPageKey: z.string().optional().describe('Token for pagination'),
});

// Tool definition
export const listEvents = {
  definition: {
    name: 'list_events',
    description: 'List events in the environment with optional filtering',
    inputSchema: zodToJsonSchema(ListEventsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListEventsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);
    if (parsed.data.eventTypes && parsed.data.eventTypes.length > 0) {
      params.append('eventTypes', parsed.data.eventTypes.join(','));
    }
    if (parsed.data.entitySelector) params.append('entitySelector', parsed.data.entitySelector);
    if (parsed.data.pageSize) params.append('pageSize', parsed.data.pageSize.toString());
    if (parsed.data.nextPageKey) params.append('nextPageKey', parsed.data.nextPageKey);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/events?${params}`,
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
        throw new Error(`Failed to list events: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
