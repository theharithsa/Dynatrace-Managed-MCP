import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListMetricsSchema = z.object({
  metricSelector: z.string().optional().describe('Metric selector to filter metrics'),
  text: z.string().optional().describe('Text filter for metric names'),
  fields: z.string().optional().describe('Comma-separated list of fields to include'),
  pageSize: z.number().optional().describe('Number of metrics per page'),
  nextPageKey: z.string().optional().describe('Token for pagination'),
});

// Tool definition
export const listMetrics = {
  definition: {
    name: 'list_metrics',
    description: 'List available metrics in the environment',
    inputSchema: zodToJsonSchema(ListMetricsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListMetricsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.metricSelector) params.append('metricSelector', parsed.data.metricSelector);
    if (parsed.data.text) params.append('text', parsed.data.text);
    if (parsed.data.fields) params.append('fields', parsed.data.fields);
    if (parsed.data.pageSize) params.append('pageSize', parsed.data.pageSize.toString());
    if (parsed.data.nextPageKey) params.append('nextPageKey', parsed.data.nextPageKey);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/metrics?${params}`,
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
        throw new Error(`Failed to list metrics: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
