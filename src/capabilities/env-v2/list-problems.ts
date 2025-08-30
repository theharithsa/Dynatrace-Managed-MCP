import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { 
  ProblemsListResponseSchema, 
  ListProblemsParams,
  ProblemsListResponse 
} from '../../types/problems.js';

export const listProblemsTool: Tool = {
  name: 'list_problems',
  description: 'List problems observed within the specified timeframe with comprehensive filtering and sorting options',
  inputSchema: {
    type: 'object',
    properties: {
      fields: {
        type: 'string',
        description: 'Additional problem properties to include in response (evidenceDetails, impactAnalysis, recentComments). Comma-separated list.'
      },
      nextPageKey: {
        type: 'string',
        description: 'Token for pagination to get the next page of results'
      },
      pageSize: {
        type: 'number',
        description: 'Number of problems to return per page (1-500)',
        minimum: 1,
        maximum: 500
      },
      from: {
        type: 'string',
        description: 'Start of timeframe (timestamp, human-readable format like 2021-01-25T05:57:01.123+01:00, or relative format like now-2h)'
      },
      to: {
        type: 'string',
        description: 'End of timeframe (timestamp, human-readable, or relative format)'
      },
      problemSelector: {
        type: 'string',
        description: 'Filter problems by criteria: status("open"/"closed"), severityLevel, impactLevel, rootCauseEntity, managementZoneIds, etc.'
      },
      entitySelector: {
        type: 'string',
        description: 'Filter by entity scope: type("TYPE"), entityId("id"), tag("key:value"), mzId(123), etc.'
      },
      sort: {
        type: 'string',
        description: 'Sort fields with +/- prefix: +status,-startTime, +relevance (for text search)'
      }
    }
  }
};

export async function listProblems(
  client: DynatraceManagedClient,
  params: ListProblemsParams
): Promise<ProblemsListResponse> {
  try {
    const queryParams: Record<string, string> = {};
    
    if (params.fields) queryParams.fields = params.fields;
    if (params.nextPageKey) queryParams.nextPageKey = params.nextPageKey;
    if (params.pageSize) queryParams.pageSize = params.pageSize.toString();
    if (params.from) queryParams.from = params.from;
    if (params.to) queryParams.to = params.to;
    if (params.problemSelector) queryParams.problemSelector = params.problemSelector;
    if (params.entitySelector) queryParams.entitySelector = params.entitySelector;
    if (params.sort) queryParams.sort = params.sort;

    const response = await client.get('/problems', {
      params: queryParams
    });

    const validatedResponse = ProblemsListResponseSchema.parse(response.data);

    return validatedResponse;
  } catch (error: any) {
    throw new Error(`Failed to list problems: ${error.message}`);
  }
}

/**
 * Handler for the list_problems tool
 */
export async function handleListProblems(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as ListProblemsParams;
    
    const result = await listProblems(client, params);

    // Format the response for better readability
    const formattedProblems = result.problems.map((problem, index) => {
      const startDate = new Date(problem.startTime).toISOString();
      const endDate = problem.endTime ? new Date(problem.endTime).toISOString() : 'Ongoing';
      const affectedEntities = problem.affectedEntities.map(e => `${e.name} (${e.entityId.type})`).join(', ');
      const managementZones = problem.managementZones.map(mz => `${mz.name} (${mz.id})`).join(', ') || 'None';
      
      return `${index + 1}. **${problem.title}** (${problem.displayId})
   📊 **Status**: ${problem.status} | **Severity**: ${problem.severityLevel} | **Impact**: ${problem.impactLevel}
   🕐 **Duration**: ${startDate} → ${endDate}
   🎯 **Affected**: ${affectedEntities}
   🏢 **Management Zones**: ${managementZones}
   🔗 **Problem ID**: ${problem.problemId}`;
    }).join('\n\n');

    const pageInfo = result.nextPageKey ? 
      `\n\n📄 **Page Info**: Showing ${result.pageSize} results. Use nextPageKey "${result.nextPageKey}" for next page.` : 
      `\n\n📄 **Page Info**: Showing ${result.pageSize} results (final page).`;

    return {
      content: [
        {
          type: 'text',
          text: `# 🚨 Problems List\n\n**Total Problems**: ${result.totalCount}\n\n${formattedProblems}${pageInfo}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error listing problems**: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
