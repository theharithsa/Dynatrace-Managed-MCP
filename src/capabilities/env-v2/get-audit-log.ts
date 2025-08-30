import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { AuditLogEntry, AuditLogEntrySchema } from '../../types/audit-logs.js';

/**
 * Tool for getting a specific audit log entry
 */
export const getAuditLogTool: Tool = {
  name: 'get_audit_log',
  description: 'Gets the specified entry of the audit log by ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The ID of the required log entry',
      },
    },
    required: ['id'],
  },
};

/**
 * Handler for the get_audit_log tool
 */
export async function handleGetAuditLog(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const id = requestParams?.arguments?.id || requestParams?.id;
    
    if (!id) {
      throw new Error('Audit log ID is required');
    }

    const response = await client.get<AuditLogEntry>(`/auditlogs/${id}`);
    const auditLog = AuditLogEntrySchema.parse(response.data);

    const timestamp = new Date(auditLog.timestamp).toISOString();
    const changes = auditLog.patch ? 
      auditLog.patch.map(p => ({
        operation: p.op,
        path: p.path,
        oldValue: p.oldValue,
        newValue: p.value,
        description: `${p.op.toUpperCase()} operation on ${p.path}${p.oldValue !== undefined ? ` (was: ${JSON.stringify(p.oldValue)})` : ''}${p.value !== undefined ? ` (now: ${JSON.stringify(p.value)})` : ''}`
      })) : [];

    return {
      content: [
        {
          type: 'text',
          text: `## Audit Log Entry Details 📋\n\n` +
            `### Basic Information\n` +
            `**Log ID:** ${auditLog.logId}\n` +
            `**Timestamp:** ${timestamp}\n` +
            `**Event Type:** ${auditLog.eventType}\n` +
            `**Category:** ${auditLog.category}\n` +
            `**Success:** ${auditLog.success ? '✅' : '❌'}\n` +
            `**Environment ID:** ${auditLog.environmentId}\n\n` +
            
            `### User Information\n` +
            `**User:** ${auditLog.user}\n` +
            `**User Type:** ${auditLog.userType}\n` +
            `${auditLog.userOrigin ? `**Origin:** ${auditLog.userOrigin}\n` : ''}` +
            `\n` +
            
            `### Target Entity\n` +
            `${auditLog.entityId ? `**Entity ID:** ${auditLog.entityId}\n` : '**Entity ID:** Not specified\n'}` +
            `\n` +
            
            `### Changes Made\n` +
            `${changes.length > 0 ? 
              changes.map((change, index) => 
                `#### Change ${index + 1}\n` +
                `**Operation:** ${change.operation.toUpperCase()}\n` +
                `**Path:** ${change.path}\n` +
                `${change.oldValue !== undefined ? `**Previous Value:** \`${JSON.stringify(change.oldValue, null, 2)}\`\n` : ''}` +
                `${change.newValue !== undefined ? `**New Value:** \`${JSON.stringify(change.newValue, null, 2)}\`\n` : ''}` +
                `**Description:** ${change.description}\n`
              ).join('\n') :
              '**No changes recorded** - This audit log entry does not contain patch information.\n'
            }` +
            
            `\n### Raw Data\n` +
            `\`\`\`json\n${JSON.stringify(auditLog, null, 2)}\n\`\`\`\n\n` +
            
            `### Related Actions\n` +
            `• **Search related logs:** Use \`filter: "entityId(\\"${auditLog.entityId || 'ENTITY_ID'}\\")"\` to find related entries\n` +
            `• **User activity:** Use \`filter: "user(\\"${auditLog.user}\\")"\` to see other actions by this user\n` +
            `• **Category filter:** Use \`filter: "category(\\"${auditLog.category}\\")"\` to see similar operations`
        }
      ],
    };
  } catch (error) {
    console.error('Error getting audit log entry:', error);
    
    let errorMessage = 'Unknown error occurred';
    let troubleshooting = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (error.message.includes('404')) {
        troubleshooting = `• **Log ID not found:** Verify the log ID "${request.params?.id}" is correct\n` +
                         `• **Log expired:** Check if the audit log entry has been retained\n` +
                         `• **Access permissions:** Ensure your token has 'auditLogs.read' scope`;
      } else if (error.message.includes('400')) {
        troubleshooting = `• **Invalid ID format:** Check that the log ID format is correct\n` +
                         `• **Malformed request:** Verify the ID parameter is properly formatted`;
      } else {
        troubleshooting = `• **API connectivity:** Check network connection to Dynatrace\n` +
                         `• **Authentication:** Verify your API token is valid\n` +
                         `• **Permissions:** Ensure your token has 'auditLogs.read' scope`;
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `## Audit Log Entry Error ❌\n\n` +
            `**Error:** Failed to retrieve audit log entry\n` +
            `**Log ID:** ${request.params?.id || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            troubleshooting
        }
      ],
      isError: true,
    };
  }
}
