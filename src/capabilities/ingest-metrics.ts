import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const IngestMetricsSchema = z.object({
  metrics: z.array(z.object({
    metricId: z.string().describe('Metric identifier'),
    dimensions: z.record(z.string()).optional().describe('Metric dimensions'),
    timestamp: z.number().optional().describe('Timestamp in milliseconds'),
    value: z.number().describe('Metric value'),
  })).describe('Array of metrics to ingest'),
});

// Tool definition
export const ingestMetrics = {
  definition: {
    name: 'ingest_metrics',
    description: 'Ingest custom metrics into Dynatrace',
    inputSchema: zodToJsonSchema(IngestMetricsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = IngestMetricsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    // Convert metrics to line protocol format for Dynatrace
    const metricsLines = parsed.data.metrics.map(metric => {
      let line = metric.metricId;
      
      // Add dimensions if provided
      if (metric.dimensions && Object.keys(metric.dimensions).length > 0) {
        const dims = Object.entries(metric.dimensions)
          .map(([key, value]) => `${key}=${value}`)
          .join(',');
        line += `,${dims}`;
      }
      
      // Add value and timestamp
      line += ` ${metric.value}`;
      if (metric.timestamp) {
        line += ` ${metric.timestamp}`;
      }
      
      return line;
    }).join('\n');

    try {
      const response = await axios.post(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/metrics/ingest`,
        metricsLines,
        {
          headers: {
            'Authorization': `Api-Token ${dtEnv.apiToken}`,
            'Content-Type': 'text/plain; charset=utf-8',
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
        throw new Error(`Failed to ingest metrics: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
