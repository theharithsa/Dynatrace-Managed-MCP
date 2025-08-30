import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../authentication/dynatrace-managed-client.js';
import { EventProperty, EventPropertySchema } from '../types/events.js';

const GetEventPropertyArgsSchema = z.object({
  propertyKey: z.string().describe('The event property key to retrieve')
});

/**
 * Tool for getting details of a specific event property
 */
export const getEventPropertyTool: Tool = {
  name: 'get_event_property',
  description: 'Get detailed information about a specific event property by key',
  inputSchema: {
    type: 'object',
    properties: {
      propertyKey: {
        type: 'string',
        description: 'The event property key to retrieve',
      },
    },
    required: ['propertyKey'],
  },
};

/**
 * Handler for the get_event_property tool
 */
export async function handleGetEventProperty(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const args = GetEventPropertyArgsSchema.parse(request.params.arguments || {});
    
    const url = `/eventProperties/${encodeURIComponent(args.propertyKey)}`;
    const response = await client.get<EventProperty>(url);

    // Validate response
    const eventProperty = EventPropertySchema.parse(response.data);

    return {
      content: [
        {
          type: 'text',
          text: `## Event Property Details: ${eventProperty.displayName}\n\n` +
            `**Key:** ${eventProperty.key}\n` +
            `**Display Name:** ${eventProperty.displayName}\n` +
            `**Description:** ${eventProperty.description}\n` +
            `**Filterable:** ${eventProperty.filterable ? 'Yes' : 'No'}\n` +
            `**Writable:** ${eventProperty.writable ? 'Yes' : 'No'}\n\n` +
            
            `### Usage Information\n` +
            (eventProperty.filterable ? 
              `• This property can be used in event selector filters\n` : 
              `• This property cannot be used in event selector filters\n`) +
            (eventProperty.writable ? 
              `• This property can be modified when ingesting custom events\n` : 
              `• This property is read-only\n`)
        }
      ],
    };
  } catch (error) {
    console.error('Error getting event property:', error);
    
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
          text: `Failed to get event property: ${errorMessage}`,
        }
      ],
      isError: true,
    };
  }
}
