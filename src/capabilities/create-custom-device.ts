import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const CreateCustomDeviceSchema = z.object({
  customDeviceId: z.string().describe('The custom device ID'),
  displayName: z.string().describe('Display name for the custom device'),
  ipAddresses: z.array(z.string()).optional().describe('IP addresses of the device'),
  listenPorts: z.array(z.number()).optional().describe('Listen ports of the device'),
  type: z.string().optional().describe('Type of the custom device'),
  favicon: z.string().optional().describe('Favicon URL'),
  configUrl: z.string().optional().describe('Configuration URL'),
  properties: z.record(z.string()).optional().describe('Custom properties'),
});

// Tool definition
export const createCustomDevice = {
  definition: {
    name: 'create_custom_device',
    description: 'Create a custom device in the environment',
    inputSchema: zodToJsonSchema(CreateCustomDeviceSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = CreateCustomDeviceSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    try {
      const response = await axios.post(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/entities/custom`,
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
        throw new Error(`Failed to create custom device: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
