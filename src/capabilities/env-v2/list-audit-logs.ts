import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { AuditLogsResponse, AuditLogsResponseSchema, AuditLogsQueryParams } from '../../types/audit-logs.js';

/**
 * Tool for listing audit logs
 */
export const listAuditLogsTool: Tool = {
  name: 'list_audit_logs',
  description: 'Gets the audit log of your Dynatrace environment with filtering and pagination options',
  inputSchema: {
    type: 'object',
    properties: {
      nextPageKey: {
        type: 'string',
        description: 'The cursor for the next page of results. You can find it in the nextPageKey field of the previous response.',
      },
      pageSize: {
        type: 'number',
        description: 'The amount of log entries in a single response payload. The maximal allowed page size is 5000. If not set, 1000 is used.',
        minimum: 1,
        maximum: 5000,
      },
      filter: {
        type: 'string',
        description: 'Filters the audit log. You can use criteria like user("userIdentification"), eventType("value"), category("value"), entityId("id"), etc.',
      },
      from: {
        type: 'string',
        description: 'The start of the requested timeframe. Can be UTC milliseconds, human-readable format, or relative timeframe like "now-2w".',
      },
      to: {
        type: 'string',
        description: 'The end of the requested timeframe. Can be UTC milliseconds, human-readable format, or relative timeframe.',
      },
      sort: {
        type: 'string',
        description: 'The sorting of audit log entries: "timestamp" (oldest first) or "-timestamp" (newest first). Default is "-timestamp".',
        enum: ['timestamp', '-timestamp'],
      },
    },
  },
};

/**
 * Handler for the list_audit_logs tool
 */
export async function handleListAuditLogs(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as AuditLogsQueryParams;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.nextPageKey) {
      queryParams.append('nextPageKey', params.nextPageKey);
    }
    if (params.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params.filter) {
      queryParams.append('filter', params.filter);
    }
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }

    const queryString = queryParams.toString();
    const endpoint = `/auditlogs${queryString ? `?${queryString}` : ''}`;
    
    const response = await client.get<AuditLogsResponse>(endpoint);
    const auditLogs = AuditLogsResponseSchema.parse(response.data);

    // Format the response for better readability
    const formattedLogs = auditLogs.auditLogs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const changes = log.patch ? log.patch.map(p => `${p.op} ${p.path}: ${p.oldValue} → ${p.value}`).join(', ') : 'No changes';
      
      return {
        ...log,
        formattedTimestamp: timestamp,
        summary: `${log.eventType} by ${log.user} on ${log.category}${log.entityId ? ` (${log.entityId})` : ''}`,
        changes: changes,
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: `## Audit Logs 📋\n\n` +
            `### Summary\n` +
            `**Total Count:** ${auditLogs.totalCount}\n` +
            `**Page Size:** ${auditLogs.pageSize}\n` +
            `**Returned:** ${auditLogs.auditLogs.length} entries\n` +
            `${auditLogs.nextPageKey ? `**Next Page Available:** Yes (${auditLogs.nextPageKey.substring(0, 20)}...)\n` : '**Next Page Available:** No\n'}\n\n` +
            
            `### Audit Log Entries\n` +
            formattedLogs.map((log, index) => 
              `#### ${index + 1}. ${log.summary}\n` +
              `**Time:** ${log.formattedTimestamp}\n` +
              `**Event Type:** ${log.eventType}\n` +
              `**Category:** ${log.category}\n` +
              `**User:** ${log.user} (${log.userType})\n` +
              `${log.userOrigin ? `**Origin:** ${log.userOrigin}\n` : ''}` +
              `**Success:** ${log.success ? '✅' : '❌'}\n` +
              `**Log ID:** ${log.logId}\n` +
              `${log.entityId ? `**Entity ID:** ${log.entityId}\n` : ''}` +
              `${log.patch && log.patch.length > 0 ? `**Changes:** ${log.changes}\n` : ''}` +
              `---`
            ).join('\n\n') +
            
            `\n\n### Navigation\n` +
            `${auditLogs.nextPageKey ? `🔄 **Next Page:** Use \`nextPageKey: "${auditLogs.nextPageKey}"\` to get more results\n` : '✅ **End of Results:** No more pages available\n'}` +
            
            `### Filter Examples\n` +
            `• **By User:** \`user("john.doe@company.com")\`\n` +
            `• **By Event Type:** \`eventType("CREATE","UPDATE")\`\n` +
            `• **By Category:** \`category("CONFIG")\`\n` +
            `• **By Entity:** \`entityId("HOST-1234")\`\n` +
            `• **Combined:** \`eventType("CREATE"),category("CONFIG")\`\n\n` +
            
            `### Time Range Examples\n` +
            `• **Last 24 hours:** \`from: "now-1d"\`\n` +
            `• **Last week:** \`from: "now-1w"\`\n` +
            `• **Specific date:** \`from: "2024-01-01T00:00:00Z", to: "2024-01-02T00:00:00Z"\``
        }
      ],
    };
  } catch (error) {
    console.error('Error listing audit logs:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `## Audit Logs Error ❌\n\n` +
            `**Error:** Failed to retrieve audit logs\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            `• Verify your API token has the 'auditLogs.read' scope\n` +
            `• Check if the filter syntax is correct\n` +
            `• Ensure the time range is valid\n` +
            `• Check if the pageSize is within limits (1-5000)\n` +
            `• Verify network connectivity to the cluster`
        }
      ],
      isError: true,
    };
  }
}
