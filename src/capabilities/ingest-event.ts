import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const IngestEventSchema = z.object({
  eventType: z.string().describe('The type of event to ingest'),
  title: z.string().describe('Event title'),
  description: z.string().optional().describe('Event description'),
  source: z.string().optional().describe('Event source'),
  annotationType: z.string().optional().describe('Annotation type'),
  annotationDescription: z.string().optional().describe('Annotation description'),
  customProperties: z.record(z.string()).optional().describe('Custom properties'),
  entitySelector: z.string().optional().describe('Entity selector for event targets'),
  timeout: z.number().optional().describe('Event timeout in minutes'),
  attachRules: z.object({
    tagRule: z.array(z.object({
      meTypes: z.array(z.string()),
      tags: z.array(z.object({
        context: z.string(),
        key: z.string(),
        value: z.string().optional(),
      })),
    })).optional(),
    entityIds: z.array(z.string()).optional(),
  }).describe('Rules for attaching events to entities (required)'),
});

// Tool definition
export const ingestEvent = {
  definition: {
    name: 'ingest_event',
    description: 'Ingest a custom event into Dynatrace',
    inputSchema: zodToJsonSchema(IngestEventSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = IngestEventSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    try {
      const response = await axios.post(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v1/events`,
        parsed.data,
        {
          headers: {
            'Authorization': `Api-Token ${dtEnv.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        }],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to ingest event: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
