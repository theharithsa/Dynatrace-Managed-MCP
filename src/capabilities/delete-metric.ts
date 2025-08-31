import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const DeleteMetricSchema = z.object({
  metricId: z.string().describe('The ID of the metric to delete'),
});

// Tool definition
export const deleteMetric = {
  definition: {
    name: 'delete_metric',
    description: 'Delete a custom metric',
    inputSchema: zodToJsonSchema(DeleteMetricSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = DeleteMetricSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    try {
      const response = await axios.delete(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/metrics/${encodeURIComponent(parsed.data.metricId)}`,
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
        throw new Error(`Failed to delete metric: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
