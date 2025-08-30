import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../authentication/dynatrace-managed-client.js';
import { EventsResponse, EventsResponseSchema } from '../types/events.js';

const ListEventsArgsSchema = z.object({
  pageSize: z.number().min(1).max(1000).optional().describe('Number of events to return per page (1-1000)'),
  nextPageKey: z.string().optional().describe('Token for pagination to get the next page of results'),
  from: z.string().optional().describe('Start of the requested timeframe (timestamp, human-readable, or relative format like now-2h)'),
  to: z.string().optional().describe('End of the requested timeframe (timestamp, human-readable, or relative format)'),
  eventSelector: z.string().optional().describe('Event selector to filter events (e.g., eventType("HIGH_CPU"), status("OPEN"))'),
  entitySelector: z.string().optional().describe('Entity selector to filter by entities (e.g., type("HOST"), healthState("HEALTHY"))')
});

/**
 * Tool for listing events within a specified timeframe
 */
export const listEventsTool: Tool = {
  name: 'list_events',
  description: 'List events within the specified timeframe with optional filtering by event and entity selectors',
  inputSchema: {
    type: 'object',
    properties: {
      pageSize: {
        type: 'number',
        minimum: 1,
        maximum: 1000,
        description: 'Number of events to return per page (1-1000)',
      },
      nextPageKey: {
        type: 'string',
        description: 'Token for pagination to get the next page of results',
      },
      from: {
        type: 'string',
        description: 'Start of the requested timeframe (timestamp, human-readable format like 2021-01-25T05:57:01.123+01:00, or relative format like now-2h)',
      },
      to: {
        type: 'string',
        description: 'End of the requested timeframe (timestamp, human-readable, or relative format)',
      },
      eventSelector: {
        type: 'string',
        description: 'Event selector to filter events (e.g., eventType("HIGH_CPU"), status("OPEN"), property.severity("HIGH"))',
      },
      entitySelector: {
        type: 'string',
        description: 'Entity selector to filter by entities (e.g., type("HOST"), healthState("HEALTHY"), tag("environment:production"))',
      },
    },
  },
};

/**
 * Handler for the list_events tool
 */
export async function handleListEvents(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const args = ListEventsArgsSchema.parse(request.params.arguments || {});
    
    const queryParams = new URLSearchParams();
    if (args.pageSize) {
      queryParams.append('pageSize', args.pageSize.toString());
    }
    if (args.nextPageKey) {
      queryParams.append('nextPageKey', args.nextPageKey);
    }
    if (args.from) {
      queryParams.append('from', args.from);
    }
    if (args.to) {
      queryParams.append('to', args.to);
    }
    if (args.eventSelector) {
      queryParams.append('eventSelector', args.eventSelector);
    }
    if (args.entitySelector) {
      queryParams.append('entitySelector', args.entitySelector);
    }

    const url = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get<EventsResponse>(url);

    // Validate response
    const validatedData = EventsResponseSchema.parse(response.data);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${validatedData.events.length} events (Total: ${validatedData.totalCount}):\n\n` +
            validatedData.events.map(event => {
              const startTime = new Date(event.startTime).toISOString();
              const endTime = event.endTime ? new Date(event.endTime).toISOString() : 'Ongoing';
              
              return `• **${event.title}** (${event.eventId})\n` +
                `  - Type: ${event.eventType}\n` +
                `  - Status: ${event.status}\n` +
                `  - Entity: ${event.entityId.name} (${event.entityId.entityId.type})\n` +
                `  - Start Time: ${startTime}\n` +
                `  - End Time: ${endTime}\n` +
                `  - Correlation ID: ${event.correlationId}\n` +
                (event.managementZones && event.managementZones.length > 0 ? 
                  `  - Management Zones: ${event.managementZones.map(mz => mz.name).join(', ')}\n` : '') +
                (event.suppressAlert ? `  - Alert Suppressed: Yes\n` : '') +
                (event.suppressProblem ? `  - Problem Suppressed: Yes\n` : '') +
                (event.underMaintenance ? `  - Under Maintenance: Yes\n` : '') +
                (event.frequentEvent ? `  - Frequent Event: Yes\n` : '') +
                (event.properties && event.properties.length > 0 ? 
                  `  - Properties: ${event.properties.map(p => `${p.key}=${p.value}`).join(', ')}\n` : '')
            }).join('\n') +
            (validatedData.warnings && validatedData.warnings.length > 0 ? 
              `\n\n**Warnings:**\n${validatedData.warnings.map(w => `• ${w}`).join('\n')}` : '') +
            (validatedData.nextPageKey ? `\n\n**Next Page Key:** ${validatedData.nextPageKey}` : '')
        }
      ],
    };
  } catch (error) {
    console.error('Error listing events:', error);
    
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
          text: `Failed to list events: ${errorMessage}`,
        }
      ],
      isError: true,
    };
  }
}
