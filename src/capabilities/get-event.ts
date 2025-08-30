import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../authentication/dynatrace-managed-client.js';
import { Event, EventSchema } from '../types/events.js';

const GetEventArgsSchema = z.object({
  eventId: z.string().describe('The ID of the event to retrieve')
});

/**
 * Tool for getting details of a specific event
 */
export const getEventTool: Tool = {
  name: 'get_event',
  description: 'Get detailed information about a specific event by ID',
  inputSchema: {
    type: 'object',
    properties: {
      eventId: {
        type: 'string',
        description: 'The ID of the event to retrieve',
      },
    },
    required: ['eventId'],
  },
};

/**
 * Handler for the get_event tool
 */
export async function handleGetEvent(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const args = GetEventArgsSchema.parse(request.params.arguments || {});
    
    const url = `/events/${encodeURIComponent(args.eventId)}`;
    const response = await client.get<Event>(url);

    // Validate response
    const event = EventSchema.parse(response.data);

    const startTime = new Date(event.startTime).toISOString();
    const endTime = event.endTime ? new Date(event.endTime).toISOString() : 'Ongoing';

    return {
      content: [
        {
          type: 'text',
          text: `## Event Details: ${event.title}\n\n` +
            `**Event ID:** ${event.eventId}\n` +
            `**Event Type:** ${event.eventType}\n` +
            `**Status:** ${event.status}\n` +
            `**Correlation ID:** ${event.correlationId}\n\n` +
            
            `### Timing\n` +
            `**Start Time:** ${startTime}\n` +
            `**End Time:** ${endTime}\n\n` +
            
            `### Entity Information\n` +
            `**Entity:** ${event.entityId.name}\n` +
            `**Entity ID:** ${event.entityId.entityId.id}\n` +
            `**Entity Type:** ${event.entityId.entityId.type}\n\n` +
            
            (event.entityTags && event.entityTags.length > 0 ? 
              `### Entity Tags\n${event.entityTags.map(tag => 
                `• **${tag.key}:** ${tag.value} (${tag.context})`
              ).join('\n')}\n\n` : '') +
            
            (event.managementZones && event.managementZones.length > 0 ? 
              `### Management Zones\n${event.managementZones.map(mz => 
                `• ${mz.name} (${mz.id})`
              ).join('\n')}\n\n` : '') +
            
            `### Event Properties\n` +
            `**Frequent Event:** ${event.frequentEvent ? 'Yes' : 'No'}\n` +
            `**Alert Suppressed:** ${event.suppressAlert ? 'Yes' : 'No'}\n` +
            `**Problem Suppressed:** ${event.suppressProblem ? 'Yes' : 'No'}\n` +
            `**Under Maintenance:** ${event.underMaintenance ? 'Yes' : 'No'}\n\n` +
            
            (event.properties && event.properties.length > 0 ? 
              `### Custom Properties\n${event.properties.map(prop => 
                `• **${prop.key}:** ${prop.value}`
              ).join('\n')}\n` : '')
        }
      ],
    };
  } catch (error) {
    console.error('Error getting event:', error);
    
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
          text: `Failed to get event: ${errorMessage}`,
        }
      ],
      isError: true,
    };
  }
}
