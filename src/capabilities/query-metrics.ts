import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const QueryMetricsSchema = z.object({
  metricSelector: z.string().describe('Metric selector defining which metrics to query'),
  from: z.string().optional().describe('Start time (ISO format or relative)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
  resolution: z.string().optional().describe('Data resolution (e.g., "1m", "5m", "1h")'),
  entitySelector: z.string().optional().describe('Entity selector to filter metrics'),
});

// Tool definition
export const queryMetrics = {
  definition: {
    name: 'query_metrics',
    description: 'Query metric data points for analysis',
    inputSchema: zodToJsonSchema(QueryMetricsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = QueryMetricsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    params.append('metricSelector', parsed.data.metricSelector);
    
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);
    if (parsed.data.resolution) params.append('resolution', parsed.data.resolution);
    if (parsed.data.entitySelector) params.append('entitySelector', parsed.data.entitySelector);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/metrics/query?${params}`,
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
        throw new Error(`Failed to query metrics: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
