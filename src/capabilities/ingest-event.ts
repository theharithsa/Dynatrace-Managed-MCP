import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../authentication/dynatrace-managed-client.js';
import { EventIngestRequest, EventIngestRequestSchema, EventIngestResponse, EventIngestResponseSchema } from '../types/events.js';

const IngestEventArgsSchema = z.object({
  entitySelector: z.string().describe('Entity selector to specify target entities'),
  eventType: z.enum(['AVAILABILITY_EVENT', 'CUSTOM_ALERT', 'ERROR_EVENT', 'INFO_EVENT', 'PERFORMANCE_EVENT', 'RESOURCE_CONTENTION_EVENT']).describe('Type of the custom event'),
  title: z.string().describe('Title of the event'),
  startTime: z.number().describe('Start time of the event (Unix timestamp in milliseconds)'),
  endTime: z.number().optional().describe('End time of the event (Unix timestamp in milliseconds)'),
  timeout: z.number().optional().describe('Timeout for event processing in minutes'),
  properties: z.record(z.string()).optional().describe('Custom properties for the event as key-value pairs')
});

/**
 * Tool for ingesting a custom event
 */
export const ingestEventTool: Tool = {
  name: 'ingest_event',
  description: 'Ingest a custom event into Dynatrace. The ingestion of custom events is subject to licensing.',
  inputSchema: {
    type: 'object',
    properties: {
      entitySelector: {
        type: 'string',
        description: 'Entity selector to specify target entities (e.g., type("HOST"), entityId("HOST-1234"))',
      },
      eventType: {
        type: 'string',
        enum: ['AVAILABILITY_EVENT', 'CUSTOM_ALERT', 'ERROR_EVENT', 'INFO_EVENT', 'PERFORMANCE_EVENT', 'RESOURCE_CONTENTION_EVENT'],
        description: 'Type of the custom event',
      },
      title: {
        type: 'string',
        description: 'Title of the event',
      },
      startTime: {
        type: 'number',
        description: 'Start time of the event (Unix timestamp in milliseconds)',
      },
      endTime: {
        type: 'number',
        description: 'End time of the event (Unix timestamp in milliseconds)',
      },
      timeout: {
        type: 'number',
        description: 'Timeout for event processing in minutes',
      },
      properties: {
        type: 'object',
        additionalProperties: {
          type: 'string'
        },
        description: 'Custom properties for the event as key-value pairs',
      },
    },
    required: ['entitySelector', 'eventType', 'title', 'startTime'],
  },
};

/**
 * Handler for the ingest_event tool
 */
export async function handleIngestEvent(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const args = IngestEventArgsSchema.parse(request.params.arguments || {});
    
    // Validate the request body
    const eventRequest: EventIngestRequest = EventIngestRequestSchema.parse(args);
    
    const url = `/events/ingest`;
    const response = await client.post<EventIngestResponse>(url, eventRequest);

    // Validate response
    const ingestResponse = EventIngestResponseSchema.parse(response.data);

    const successfulIngests = ingestResponse.eventIngestResults.filter(result => result.status === 'OK');
    const failedIngests = ingestResponse.eventIngestResults.filter(result => result.status !== 'OK');

    return {
      content: [
        {
          type: 'text',
          text: `## Event Ingestion ${successfulIngests.length > 0 ? 'Completed' : 'Failed'}! ${successfulIngests.length > 0 ? '✅' : '❌'}\n\n` +
            `**Title:** ${args.title}\n` +
            `**Event Type:** ${args.eventType}\n` +
            `**Entity Selector:** ${args.entitySelector}\n` +
            `**Start Time:** ${new Date(args.startTime).toISOString()}\n` +
            (args.endTime ? `**End Time:** ${new Date(args.endTime).toISOString()}\n` : '') +
            `**Total Reports:** ${ingestResponse.reportCount}\n\n` +
            
            `### Ingestion Results\n` +
            `**Successful:** ${successfulIngests.length}\n` +
            `**Failed:** ${failedIngests.length}\n\n` +
            
            (successfulIngests.length > 0 ? 
              `### Successful Ingestions\n${successfulIngests.map(result => 
                `• Correlation ID: ${result.correlationId}`
              ).join('\n')}\n\n` : '') +
            
            (failedIngests.length > 0 ? 
              `### Failed Ingestions\n${failedIngests.map(result => 
                `• Correlation ID: ${result.correlationId} - Status: ${result.status}`
              ).join('\n')}\n\n` : '') +
            
            (args.properties && Object.keys(args.properties).length > 0 ? 
              `### Custom Properties\n${Object.entries(args.properties).map(([key, value]) => 
                `• **${key}:** ${value}`
              ).join('\n')}\n` : '') +
            
            `\n*Note: The ingestion of custom events is subject to licensing.*`
        }
      ],
    };
  } catch (error) {
    console.error('Error ingesting event:', error);
    
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
          text: `Failed to ingest event: ${errorMessage}`,
        }
      ],
      isError: true,
    };
  }
}
