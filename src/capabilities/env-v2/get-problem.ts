import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { 
  ProblemSchema, 
  GetProblemParams,
  Problem 
} from '../../types/problems.js';

export const getProblemTool: Tool = {
  name: 'mcp_dynatrace-man_get_problem',
  description: 'Get detailed information about a specific problem by its ID',
  inputSchema: {
    type: 'object',
    properties: {
      problemId: {
        type: 'string',
        description: 'The ID of the problem to retrieve'
      },
      fields: {
        type: 'string',
        description: 'Additional problem properties to include (evidenceDetails, impactAnalysis, recentComments). Comma-separated list.'
      }
    },
    required: ['problemId']
  }
};

export async function getProblem(
  client: DynatraceManagedClient,
  problemId: string,
  params: GetProblemParams = {}
): Promise<Problem> {
  try {
    const queryParams: Record<string, string> = {};
    
    if (params.fields) queryParams.fields = params.fields;

    const response = await client.get(`/problems/${problemId}`, {
      params: queryParams
    });

    const validatedResponse = ProblemSchema.parse(response.data);

    return validatedResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Problem with ID '${problemId}' not found`);
    }
    throw new Error(`Failed to get problem: ${error.message}`);
  }
}

/**
 * Handler for the get_problem tool
 */
export async function handleGetProblem(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const args = requestParams?.arguments || requestParams;
    
    if (!args.problemId) {
      throw new Error('problemId is required');
    }

    const result = await getProblem(client, args.problemId, args);

    // Format the response for better readability
    const startDate = new Date(result.startTime).toISOString();
    const endDate = result.endTime ? new Date(result.endTime).toISOString() : 'Ongoing';
    const affectedEntities = result.affectedEntities.map(e => `${e.name} (${e.entityId.type})`).join(', ');
    const impactedEntities = result.impactedEntities.map(e => `${e.name} (${e.entityId.type})`).join(', ');
    const managementZones = result.managementZones.map(mz => `${mz.name} (${mz.id})`).join(', ') || 'None';
    const rootCause = result.rootCauseEntity ? `${result.rootCauseEntity.name} (${result.rootCauseEntity.entityId.type})` : 'Unknown';
    
    // Recent comments if available
    let commentsSection = '';
    if (result.recentComments && result.recentComments.comments.length > 0) {
      const comments = result.recentComments.comments.slice(0, 3).map(comment => 
        `   • **${comment.authorName}** (${new Date(comment.createdAtTimestamp).toISOString()}): ${comment.content}`
      ).join('\n');
      commentsSection = `\n\n💬 **Recent Comments** (${result.recentComments.totalCount} total):\n${comments}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: `# 🚨 Problem Details: ${result.title}

📊 **Basic Info**:
   • **Display ID**: ${result.displayId}
   • **Problem ID**: ${result.problemId}
   • **Status**: ${result.status}
   • **Severity**: ${result.severityLevel}
   • **Impact Level**: ${result.impactLevel}

🕐 **Timeline**:
   • **Started**: ${startDate}
   • **Ended**: ${endDate}

🎯 **Impact**:
   • **Affected Entities**: ${affectedEntities}
   • **Impacted Entities**: ${impactedEntities}
   • **Root Cause**: ${rootCause}

🏢 **Management**:
   • **Management Zones**: ${managementZones}${commentsSection}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error getting problem**: ${error.message}`
        }
      ],
      isError: true
    };
  }
}
