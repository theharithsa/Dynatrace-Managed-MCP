import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// Zod schema for input validation
const GetProblemDetailsSchema = z.object({
  problemId: z.string().describe('Problem ID'),
  fields: z.string().optional().describe('Additional fields to include (evidenceDetails, impactAnalysis, recentComments)'),
});

// Tool definition
export const getProblemDetails = {
  definition: {
    name: 'get_problem_details',
    description: 'Get detailed information about a specific problem by its ID',
    inputSchema: zodToJsonSchema(GetProblemDetailsSchema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = GetProblemDetailsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const { problemId, fields } = parsed.data;
    const params = new URLSearchParams();
    
    if (fields) params.append('fields', fields);

    try {
      const response = await axios.get(
        `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/problems/${problemId}?${params}`,
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
        throw new Error(`Failed to get problem details: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  },
};
