import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../authentication/dynatrace-managed-client.js';
import { EventTypesResponse, EventTypesResponseSchema } from '../types/events.js';

const ListEventTypesArgsSchema = z.object({
  pageSize: z.number().min(1).max(500).optional().describe('Number of event types to return per page (1-500)'),
  nextPageKey: z.string().optional().describe('Token for pagination to get the next page of results')
});

/**
 * Tool for listing all event types
 */
export const listEventTypesTool: Tool = {
  name: 'list_event_types',
  description: 'List all available event types with optional pagination',
  inputSchema: {
    type: 'object',
    properties: {
      pageSize: {
        type: 'number',
        minimum: 1,
        maximum: 500,
        description: 'Number of event types to return per page (1-500)',
      },
      nextPageKey: {
        type: 'string',
        description: 'Token for pagination to get the next page of results',
      },
    },
  },
};

/**
 * Handler for the list_event_types tool
 */
export async function handleListEventTypes(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const args = ListEventTypesArgsSchema.parse(request.params.arguments || {});
    
    const queryParams = new URLSearchParams();
    if (args.pageSize) {
      queryParams.append('pageSize', args.pageSize.toString());
    }
    if (args.nextPageKey) {
      queryParams.append('nextPageKey', args.nextPageKey);
    }

    const url = `/eventTypes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get<EventTypesResponse>(url);

    // Validate response
    const validatedData = EventTypesResponseSchema.parse(response.data);

    // Group event types by severity level
    const eventTypesBySeverity = validatedData.eventTypeInfos.reduce((acc, eventType) => {
      const severity = eventType.severityLevel;
      if (!acc[severity]) {
        acc[severity] = [];
      }
      acc[severity].push(eventType);
      return acc;
    }, {} as Record<string, typeof validatedData.eventTypeInfos>);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${validatedData.eventTypeInfos.length} event types (Total: ${validatedData.totalCount}):\n\n` +
            Object.entries(eventTypesBySeverity).map(([severity, types]) =>
              `### ${severity} Events\n` +
              types.map(eventType => 
                `• **${eventType.displayName}** (${eventType.type})\n` +
                `  - Description: ${eventType.description}\n`
              ).join('')
            ).join('\n') +
            (validatedData.nextPageKey ? `\n\n**Next Page Key:** ${validatedData.nextPageKey}` : '')
        }
      ],
    };
  } catch (error) {
    console.error('Error listing event types:', error);
    
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
          text: `Failed to list event types: ${errorMessage}`,
        }
      ],
      isError: true,
    };
  }
}
