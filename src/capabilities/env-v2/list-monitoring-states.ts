import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { MonitoringStatesResponse, MonitoringStatesResponseSchema, MonitoringStatesQueryParams } from '../../types/entities.js';

/**
 * Tool for listing monitoring states of entities
 */
export const listMonitoringStatesTool: Tool = {
  name: 'list_monitoring_states',
  description: 'Lists monitoring states of entities. Only process group instances are supported. Shows agent status, restart requirements, and monitoring issues.',
  inputSchema: {
    type: 'object',
    properties: {
      nextPageKey: {
        type: 'string',
        description: 'The cursor for the next page of results. You can find it in the nextPageKey field of the previous response.',
      },
      pageSize: {
        type: 'number',
        description: 'The amount of monitoring states in a single response payload. The maximal allowed page size is 500. Default is 500.',
        minimum: 1,
        maximum: 500,
      },
      entitySelector: {
        type: 'string',
        description: 'Specifies the process group instances where you\'re querying the state. Use the PROCESS_GROUP_INSTANCE entity type. Examples: type("PROCESS_GROUP_INSTANCE"), entityId("PROCESS_GROUP_INSTANCE-123")',
      },
      from: {
        type: 'string',
        description: 'The start of the requested timeframe. UTC milliseconds, human-readable format, or relative format like "now-24h". Default is "now-24h".',
      },
      to: {
        type: 'string',
        description: 'The end of the requested timeframe. UTC milliseconds, human-readable format, or relative format. Default is current timestamp.',
      },
    },
  },
};

/**
 * Handler for the list_monitoring_states tool
 */
export async function handleListMonitoringStates(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as MonitoringStatesQueryParams;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.nextPageKey) {
      queryParams.append('nextPageKey', params.nextPageKey);
    }
    if (params.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params.entitySelector) {
      queryParams.append('entitySelector', params.entitySelector);
    }
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }

    const queryString = queryParams.toString();
    const endpoint = `/monitoringstate${queryString ? `?${queryString}` : ''}`;
    
    const response = await client.get<MonitoringStatesResponse>(endpoint);
    const monitoringStates = MonitoringStatesResponseSchema.parse(response.data);

    // Process and categorize monitoring states
    const allStates = monitoringStates.monitoringStates.flatMap(group => group.states);
    
    // Group states by severity
    const statesBySeverity = new Map<string, typeof allStates>();
    allStates.forEach(state => {
      if (!statesBySeverity.has(state.severity)) {
        statesBySeverity.set(state.severity, []);
      }
      statesBySeverity.get(state.severity)!.push(state);
    });

    // Group states by state type
    const statesByType = new Map<string, typeof allStates>();
    allStates.forEach(state => {
      if (!statesByType.has(state.state)) {
        statesByType.set(state.state, []);
      }
      statesByType.get(state.state)!.push(state);
    });

    // Sort by severity priority
    const severityOrder = ['error', 'warning', 'info'];
    const sortedSeverities = Array.from(statesBySeverity.entries()).sort(([a], [b]) => {
      const aIndex = severityOrder.indexOf(a);
      const bIndex = severityOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    let formattedOutput = '';
    if (allStates.length === 0) {
      formattedOutput = 'No monitoring states found for the specified entities.';
    } else {
      // Display by severity
      sortedSeverities.forEach(([severity, states]) => {
        const severityIcon = {
          error: '🔴',
          warning: '🟡',
          info: 'ℹ️'
        }[severity] || '⚪';
        
        formattedOutput += `#### ${severityIcon} ${severity.toUpperCase()} (${states.length})\n`;
        
        states.forEach((state, index) => {
          formattedOutput += `**${index + 1}. ${state.entityId}**\n`;
          formattedOutput += `   - **State:** ${state.state.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}\n`;
          formattedOutput += `   - **Severity:** ${severity}\n`;
          
          if (state.parameters && state.parameters.length > 0) {
            const params = state.parameters.map(p => `${p.key}=${p.value}`).join(', ');
            formattedOutput += `   - **Parameters:** ${params}\n`;
          }
          formattedOutput += '\n';
        });
      });
    }

    // Generate statistics
    const stats = {
      totalStates: allStates.length,
      totalGroups: monitoringStates.monitoringStates.length,
      severityBreakdown: Object.fromEntries(
        Array.from(statesBySeverity.entries()).map(([severity, states]) => [severity, states.length])
      ),
      stateTypeBreakdown: Object.fromEntries(
        Array.from(statesByType.entries()).map(([stateType, states]) => [stateType, states.length])
      ),
    };

    // Common state explanations
    const stateExplanations: Record<string, string> = {
      'restart_required_outdated_agent_injected': 'Agent is outdated and requires restart',
      'agent_not_injected': 'OneAgent is not injected into the process',
      'monitoring_disabled': 'Monitoring is disabled for this process',
      'agent_error': 'Agent is experiencing errors',
      'configuration_outdated': 'Agent configuration needs update',
      'restart_required': 'Process restart is required for monitoring',
    };

    return {
      content: [
        {
          type: 'text',
          text: `## Monitoring States 📊\n\n` +
            `### Summary\n` +
            `**Total States:** ${monitoringStates.totalCount}\n` +
            `**Returned:** ${stats.totalStates} states in ${stats.totalGroups} groups\n` +
            `${params.entitySelector ? `**Entity Selector:** \`${params.entitySelector}\`\n` : ''}` +
            `${params.from ? `**Time Range:** ${params.from} → ${params.to || 'now'}\n` : ''}` +
            `${monitoringStates.nextPageKey ? `**Next Page Available:** Yes (${monitoringStates.nextPageKey.substring(0, 20)}...)\n` : '**Next Page Available:** No\n'}` +
            `\n` +
            
            `### Severity Breakdown\n` +
            `${Object.entries(stats.severityBreakdown).map(([severity, count]) => {
              const icon = { error: '🔴', warning: '🟡', info: 'ℹ️' }[severity] || '⚪';
              return `**${icon} ${severity.toUpperCase()}:** ${count} states`;
            }).join('\n')}\n\n` +
            
            `### State Type Breakdown\n` +
            `${Object.entries(stats.stateTypeBreakdown).map(([stateType, count]) => 
              `**${stateType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}:** ${count} occurrences`
            ).join('\n')}\n\n` +
            
            `### Monitoring States by Severity\n` +
            formattedOutput +
            
            `### State Explanations\n` +
            `${Object.entries(stateExplanations).map(([state, explanation]) => 
              `• **${state.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}:** ${explanation}`
            ).join('\n')}\n\n` +
            
            `### Navigation\n` +
            `${monitoringStates.nextPageKey ? `🔄 **Next Page:** Use \`nextPageKey: "${monitoringStates.nextPageKey}"\` to get more results\n` : '✅ **End of Results:** No more pages available\n'}` +
            
            `### Common Monitoring Issues\n` +
            `• **🔴 Agent Errors:** Critical issues requiring immediate attention\n` +
            `• **🟡 Restart Required:** Agent updates need process restart\n` +
            `• **ℹ️ Configuration Changes:** Non-critical configuration updates\n` +
            `• **Agent Not Injected:** OneAgent not properly installed\n` +
            `• **Monitoring Disabled:** Intentionally disabled monitoring\n\n` +
            
            `### Resolution Actions\n` +
            `**For restart_required states:**\n` +
            `• Restart the affected process group instances\n` +
            `• Schedule maintenance windows for critical processes\n` +
            `• Update OneAgent to the latest version\n\n` +
            
            `**For agent_not_injected states:**\n` +
            `• Install OneAgent on the host\n` +
            `• Check process group detection rules\n` +
            `• Verify agent installation permissions\n\n` +
            
            `**For configuration_outdated states:**\n` +
            `• Apply latest configuration changes\n` +
            `• Restart processes if required\n` +
            `• Verify configuration distribution\n\n` +
            
            `### Entity Selector Examples\n` +
            `• **All process group instances:** \`entitySelector: "type(\\"PROCESS_GROUP_INSTANCE\\")"\`\n` +
            `• **Specific process groups:** \`entitySelector: "type(\\"PROCESS_GROUP_INSTANCE\\"),entityName.contains(\\"java\\")"\`\n` +
            `• **By management zone:** \`entitySelector: "type(\\"PROCESS_GROUP_INSTANCE\\"),mzName(\\"Production\\")"\`\n` +
            `• **By host:** \`entitySelector: "type(\\"PROCESS_GROUP_INSTANCE\\"),fromRelationships.runsOn(type(\\"HOST\\"),entityName(\\"hostname\\"))"\`\n` +
            `• **Tagged processes:** \`entitySelector: "type(\\"PROCESS_GROUP_INSTANCE\\"),tag(\\"environment:prod\\")"\`\n\n` +
            
            `### Related Actions\n` +
            `• **Get entity details:** Use \`get_entity\` with specific process group instance IDs\n` +
            `• **List process groups:** Use \`list_entities\` with \`type("PROCESS_GROUP_INSTANCE")\`\n` +
            `• **Check host status:** Use \`list_entities\` with \`type("HOST")\` for underlying hosts\n` +
            `• **Monitor metrics:** Query process metrics for affected entities\n\n` +
            
            `### Monitoring Best Practices\n` +
            `• **Regular Monitoring:** Check monitoring states periodically\n` +
            `• **Automated Alerts:** Set up alerts for critical monitoring states\n` +
            `• **Maintenance Windows:** Plan restarts during low-traffic periods\n` +
            `• **Agent Updates:** Keep OneAgent versions current\n` +
            `• **Documentation:** Track monitoring state changes and resolutions`
        }
      ],
    };
  } catch (error) {
    console.error('Error listing monitoring states:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isUnavailable = errorMessage.includes('503') || errorMessage.includes('Unavailable');
    const isBadRequest = errorMessage.includes('400') || errorMessage.includes('Bad Request');
    
    return {
      content: [
        {
          type: 'text',
          text: `## Monitoring States Error ❌\n\n` +
            `**Error:** Failed to retrieve monitoring states\n` +
            `**Entity Selector:** ${(request.params as any)?.arguments?.entitySelector || (request.params as any)?.entitySelector || 'Not specified'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            
            `${isUnavailable ? 
              `### Service Unavailable\n` +
              `The monitoring states service is currently unavailable.\n\n` +
              `**Possible Reasons:**\n` +
              `• The cluster is under maintenance\n` +
              `• High load on the monitoring states service\n` +
              `• Temporary network connectivity issues\n` +
              `• Service deployment in progress\n\n` +
              
              `**Solutions:**\n` +
              `• Wait a few minutes and retry the request\n` +
              `• Check the Dynatrace cluster status\n` +
              `• Contact your Dynatrace administrator if the issue persists\n` +
              `• Try with a smaller page size or more specific entity selector`
              :
              isBadRequest ?
              `### Invalid Request Data\n` +
              `The request contains invalid or malformed data.\n\n` +
              `**Common Issues:**\n` +
              `• **entitySelector:** Must target PROCESS_GROUP_INSTANCE entities only\n` +
              `• **pageSize:** Must be between 1 and 500\n` +
              `• **nextPageKey:** Must be valid token from previous response\n` +
              `• **Entity selector syntax:** Check for proper escaping and format\n\n` +
              
              `**Valid Examples:**\n` +
              `• **Basic:** \`entitySelector: "type(\\"PROCESS_GROUP_INSTANCE\\")"\`\n` +
              `• **With filter:** \`entitySelector: "type(\\"PROCESS_GROUP_INSTANCE\\"),entityName.contains(\\"java\\")"\`\n` +
              `• **Management zone:** \`entitySelector: "type(\\"PROCESS_GROUP_INSTANCE\\"),mzName(\\"Production\\")"\`\n` +
              `• **Page size:** \`pageSize: 100\` (1-500)\n\n` +
              
              `**Important:** Only PROCESS_GROUP_INSTANCE entities are supported for monitoring states.`
              :
              `### Troubleshooting\n` +
              `• Verify your API token has the 'entities.read' scope\n` +
              `• Ensure entitySelector targets PROCESS_GROUP_INSTANCE entities only\n` +
              `• Check if the pageSize is within allowed limits (1-500)\n` +
              `• Verify the nextPageKey is valid if provided\n` +
              `• Check network connectivity to the cluster\n\n` +
              
              `### Entity Selector Requirements\n` +
              `• **Supported Entity Type:** Only PROCESS_GROUP_INSTANCE\n` +
              `• **Required Format:** \`type("PROCESS_GROUP_INSTANCE")\`\n` +
              `• **Additional Filters:** Can include name, tags, management zones\n` +
              `• **Example:** \`type("PROCESS_GROUP_INSTANCE"),healthState("HEALTHY")\`\n\n` +
              
              `### Alternative Approaches\n` +
              `• **List process group instances:** Use \`list_entities\` with \`type("PROCESS_GROUP_INSTANCE")\`\n` +
              `• **Check specific entities:** Use \`get_entity\` with process group instance IDs\n` +
              `• **Monitor process health:** Use metrics queries for process group monitoring\n` +
              `• **Check host status:** Monitor underlying hosts for infrastructure issues`
            }`
        }
      ],
      isError: true,
    };
  }
}
