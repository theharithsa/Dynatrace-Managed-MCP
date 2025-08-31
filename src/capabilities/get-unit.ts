import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const GetUnitSchema = z.object({
  unitId: z.string().describe('The ID of the unit to retrieve'),
});

// Tool definition
export const getUnit = {
  definition: {
    name: 'get_unit',
    description: 'Get detailed information about a specific unit',
    inputSchema: zodToJsonSchema(GetUnitSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = GetUnitSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/units/${parsed.data.unitId}`,
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
        throw new Error(`Failed to get unit: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
