import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../authentication/dynatrace-managed-client.js';
import { EventTypeInfo, EventTypeInfoSchema } from '../types/events.js';

const GetEventTypeArgsSchema = z.object({
  eventType: z.string().describe('The event type to retrieve information for')
});

/**
 * Tool for getting details of a specific event type
 */
export const getEventTypeTool: Tool = {
  name: 'get_event_type',
  description: 'Get detailed information about a specific event type',
  inputSchema: {
    type: 'object',
    properties: {
      eventType: {
        type: 'string',
        description: 'The event type to retrieve information for',
      },
    },
    required: ['eventType'],
  },
};

/**
 * Handler for the get_event_type tool
 */
export async function handleGetEventType(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const args = GetEventTypeArgsSchema.parse(request.params.arguments || {});
    
    const url = `/eventTypes/${encodeURIComponent(args.eventType)}`;
    const response = await client.get<EventTypeInfo>(url);

    // Validate response
    const eventType = EventTypeInfoSchema.parse(response.data);

    // Provide severity level context
    const severityContext = {
      'AVAILABILITY': 'Critical issues affecting system availability',
      'CUSTOM_ALERT': 'User-defined alerts and notifications',
      'ERROR': 'Error conditions and exceptions',
      'INFO': 'Informational events and status updates',
      'MONITORING_UNAVAILABLE': 'Issues with monitoring infrastructure',
      'PERFORMANCE': 'Performance degradation and resource issues',
      'RESOURCE': 'Resource contention and capacity issues'
    };

    return {
      content: [
        {
          type: 'text',
          text: `## Event Type Details: ${eventType.displayName}\n\n` +
            `**Type Code:** ${eventType.type}\n` +
            `**Display Name:** ${eventType.displayName}\n` +
            `**Description:** ${eventType.description}\n` +
            `**Severity Level:** ${eventType.severityLevel}\n\n` +
            
            `### Severity Information\n` +
            `**${eventType.severityLevel}:** ${severityContext[eventType.severityLevel as keyof typeof severityContext] || 'Event category for monitoring and alerting'}\n\n` +
            
            `### Usage\n` +
            `This event type can be used in:\n` +
            `• Event selectors: \`eventType("${eventType.type}")\`\n` +
            `• Filtering events by this specific type\n` +
            `• Alerting rules and notifications\n` +
            `• Custom dashboards and reports\n\n` +
            
            `### Examples\n` +
            `• List events of this type: Use event selector \`eventType("${eventType.type}")\`\n` +
            `• Filter by status: \`eventType("${eventType.type}"), status("OPEN")\`\n` +
            `• Combine with entity filter: \`eventType("${eventType.type}"), entityId("HOST-123")\``
        }
      ],
    };
  } catch (error) {
    console.error('Error getting event type:', error);
    
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: `Invalid request parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          }
        ],
        isError: true,
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `Failed to get event type: ${errorMessage}`,
        }
      ],
      isError: true,
    };
  }
}
