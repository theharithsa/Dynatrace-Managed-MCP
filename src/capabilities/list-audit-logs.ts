import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const ListAuditLogsSchema = z.object({
  from: z.string().optional().describe('Start time (ISO format or relative)'),
  to: z.string().optional().describe('End time (ISO format or relative)'),
  filter: z.string().optional().describe('Filter expression for audit logs'),
  pageSize: z.number().optional().describe('Number of audit logs per page'),
  nextPageKey: z.string().optional().describe('Token for pagination'),
});

// Tool definition
export const listAuditLogs = {
  definition: {
    name: 'list_audit_logs',
    description: 'List audit logs from the environment',
    inputSchema: zodToJsonSchema(ListAuditLogsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = ListAuditLogsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const params = new URLSearchParams();
    
    if (parsed.data.from) params.append('from', parsed.data.from);
    if (parsed.data.to) params.append('to', parsed.data.to);
    if (parsed.data.filter) params.append('filter', parsed.data.filter);
    if (parsed.data.pageSize) params.append('pageSize', parsed.data.pageSize.toString());
    if (parsed.data.nextPageKey) params.append('nextPageKey', parsed.data.nextPageKey);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/auditlogs?${params}`,
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
        throw new Error(`Failed to list audit logs: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
