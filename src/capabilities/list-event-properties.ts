import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../authentication/dynatrace-managed-client.js';
import { EventPropertiesResponse, EventPropertiesResponseSchema } from '../types/events.js';

const ListEventPropertiesArgsSchema = z.object({
  pageSize: z.number().min(1).max(500).optional().describe('Number of event properties to return per page (1-500)'),
  nextPageKey: z.string().optional().describe('Token for pagination to get the next page of results')
});

/**
 * Tool for listing all event properties
 */
export const listEventPropertiesTool: Tool = {
  name: 'list_event_properties',
  description: 'List all event properties with optional pagination',
  inputSchema: {
    type: 'object',
    properties: {
      pageSize: {
        type: 'number',
        minimum: 1,
        maximum: 500,
        description: 'Number of event properties to return per page (1-500)',
      },
      nextPageKey: {
        type: 'string',
        description: 'Token for pagination to get the next page of results',
      },
    },
  },
};

/**
 * Handler for the list_event_properties tool
 */
export async function handleListEventProperties(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const args = ListEventPropertiesArgsSchema.parse(request.params.arguments || {});
    
    const queryParams = new URLSearchParams();
    if (args.pageSize) {
      queryParams.append('pageSize', args.pageSize.toString());
    }
    if (args.nextPageKey) {
      queryParams.append('nextPageKey', args.nextPageKey);
    }

    const url = `/eventProperties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get<EventPropertiesResponse>(url);

    // Validate response
    const validatedData = EventPropertiesResponseSchema.parse(response.data);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${validatedData.eventProperties.length} event properties (Total: ${validatedData.totalCount}):\n\n` +
            validatedData.eventProperties.map(prop => 
              `• **${prop.displayName}** (${prop.key})\n` +
              `  - Description: ${prop.description}\n` +
              `  - Filterable: ${prop.filterable ? 'Yes' : 'No'}\n` +
              `  - Writable: ${prop.writable ? 'Yes' : 'No'}\n`
            ).join('\n') +
            (validatedData.nextPageKey ? `\n\n**Next Page Key:** ${validatedData.nextPageKey}` : '')
        }
      ],
    };
  } catch (error) {
    console.error('Error listing event properties:', error);
    
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
          text: `Failed to list event properties: ${errorMessage}`,
        }
      ],
      isError: true,
    };
  }
}
