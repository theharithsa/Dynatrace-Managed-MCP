import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { TagsListResponse, TagsListResponseSchema, TagsQueryParams } from '../../types/entities.js';

/**
 * Tool for listing custom tags applied to entities
 */
export const listTagsTool: Tool = {
  name: 'list_tags',
  description: 'Gets a list of custom tags applied to the specified entities. Automatically applied tags and imported tags are not included.',
  inputSchema: {
    type: 'object',
    properties: {
      entitySelector: {
        type: 'string',
        description: 'Specifies the entities where you want to read tags. Must include entity type or entity IDs. Examples: type("HOST"), entityId("HOST-123","HOST-456")',
      },
      from: {
        type: 'string',
        description: 'The start of the requested timeframe. UTC milliseconds, human-readable format, or relative format like "now-24h". Default is "now-24h".',
      },
      to: {
        type: 'string',
        description: 'The end of the requested timeframe. UTC milliseconds, human-readable format, or relative format. Default is current timestamp.',
      },
    },
    required: ['entitySelector'],
  },
};

/**
 * Handler for the list_tags tool
 */
export async function handleListTags(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as TagsQueryParams;
    
    if (!params.entitySelector) {
      throw new Error('entitySelector parameter is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('entitySelector', params.entitySelector);
    
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }

    const queryString = queryParams.toString();
    const endpoint = `/tags?${queryString}`;
    
    const response = await client.get<TagsListResponse>(endpoint);
    const tagsResponse = TagsListResponseSchema.parse(response.data);

    // Group tags by context and key for better organization
    const tagsByContext = new Map<string, typeof tagsResponse.tags>();
    tagsResponse.tags.forEach(tag => {
      const context = tag.context || 'CONTEXTLESS';
      if (!tagsByContext.has(context)) {
        tagsByContext.set(context, []);
      }
      tagsByContext.get(context)!.push(tag);
    });

    // Sort contexts and tags within each context
    const sortedContexts = Array.from(tagsByContext.entries()).sort(([a], [b]) => a.localeCompare(b));
    sortedContexts.forEach(([, tags]) => {
      tags.sort((a, b) => a.key.localeCompare(b.key));
    });

    let formattedOutput = '';
    if (tagsResponse.tags.length === 0) {
      formattedOutput = 'No custom tags found for the specified entities.';
    } else {
      sortedContexts.forEach(([context, tags]) => {
        formattedOutput += `#### ${context} Context (${tags.length})\n`;
        tags.forEach((tag, index) => {
          formattedOutput += `**${index + 1}. ${tag.key}**\n`;
          if (tag.value) {
            formattedOutput += `   - **Value:** ${tag.value}\n`;
          }
          formattedOutput += `   - **String Representation:** \`${tag.stringRepresentation || tag.key}\`\n`;
          formattedOutput += `   - **Context:** ${tag.context || 'CONTEXTLESS'}\n\n`;
        });
      });
    }

    // Generate statistics
    const stats = {
      totalTags: tagsResponse.totalCount,
      contextsCount: tagsByContext.size,
      keyOnlyTags: tagsResponse.tags.filter(t => !t.value).length,
      keyValueTags: tagsResponse.tags.filter(t => t.value).length,
    };

    return {
      content: [
        {
          type: 'text',
          text: `## Entity Tags 🏷️\n\n` +
            `### Summary\n` +
            `**Total Tags:** ${stats.totalTags}\n` +
            `**Contexts:** ${stats.contextsCount}\n` +
            `**Key-only tags:** ${stats.keyOnlyTags}\n` +
            `**Key-value tags:** ${stats.keyValueTags}\n` +
            `**Entity Selector:** \`${params.entitySelector}\`\n` +
            `${params.from ? `**Time Range:** ${params.from} → ${params.to || 'now'}\n` : ''}` +
            `\n` +
            
            `### Tags by Context\n` +
            formattedOutput +
            
            `### Tag Usage Examples\n` +
            `• **Filter by tag:** \`entitySelector: "type(\\"HOST\\"),tag(\\"environment:prod\\")"\`\n` +
            `• **Multiple tags:** \`entitySelector: "type(\\"SERVICE\\"),tag(\\"team:backend\\"),tag(\\"version:v2\\")"\`\n` +
            `• **Key-only tag:** \`entitySelector: "tag(\\"production\\")"\`\n` +
            `• **Escaped colons:** \`entitySelector: "tag(\\"url\\:example.com\\")"\`\n` +
            `• **Multiple values:** \`entitySelector: "tag(\\"env:prod\\",\\"env:staging\\")"\`\n\n` +
            
            `### Tag Contexts\n` +
            `• **CONTEXTLESS:** Standard user-defined tags\n` +
            `• **ENVIRONMENT:** Environment-specific tags\n` +
            `• **AWS:** AWS-specific metadata tags\n` +
            `• **AZURE:** Azure-specific metadata tags\n` +
            `• **CLOUD_FOUNDRY:** Cloud Foundry metadata tags\n` +
            `• **KUBERNETES:** Kubernetes metadata tags\n\n` +
            
            `### Tag Management\n` +
            `• **Add tags:** Use \`add_tags\` with entity selector and tag list\n` +
            `• **Delete tags:** Use \`delete_tags\` with key/value specifications\n` +
            `• **Update entities:** Tags can be used in entity selectors for filtering\n` +
            `• **Time-based queries:** Use from/to parameters to see historical tag states\n\n` +
            
            `### Related Actions\n` +
            `• **Add new tags:** Use \`add_tags\` with same entity selector\n` +
            `• **Remove tags:** Use \`delete_tags\` to remove specific tags\n` +
            `• **List entities:** Use tags in \`list_entities\` entity selector\n` +
            `• **Filter by tags:** Combine with other entity selector criteria\n\n` +
            
            `### Entity Selector with Tags\n` +
            `Tags can be used in entity selectors for precise filtering:\n` +
            `• **Single tag:** \`tag("environment:production")\`\n` +
            `• **Multiple tags:** \`tag("env:prod"),tag("team:backend")\`\n` +
            `• **Combined criteria:** \`type("HOST"),tag("env:prod"),healthState("HEALTHY")\`\n` +
            `• **Tag negation:** \`type("SERVICE"),not(tag("deprecated"))\``
        }
      ],
    };
  } catch (error) {
    console.error('Error listing tags:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `## Tags List Error ❌\n\n` +
            `**Error:** Failed to retrieve tags list\n` +
            `**Entity Selector:** ${(request.params as any)?.arguments?.entitySelector || (request.params as any)?.entitySelector || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            `• Verify your API token has the 'entities.read' scope\n` +
            `• Check if the entitySelector syntax is correct\n` +
            `• Ensure entities exist within the specified time range\n` +
            `• Verify network connectivity to the cluster\n\n` +
            
            `### Valid Entity Selector Format\n` +
            `• **Required:** Must include entity type or entity IDs\n` +
            `• **Entity type:** \`type("HOST")\`, \`type("SERVICE")\`\n` +
            `• **Entity IDs:** \`entityId("HOST-123","HOST-456")\`\n` +
            `• **Additional filters:** \`tag("env:prod")\`, \`healthState("HEALTHY")\`\n` +
            `• **Time range:** Use from/to parameters for historical data\n\n` +
            
            `### Common Entity Selector Examples\n` +
            `• **All hosts:** \`entitySelector: "type(\\"HOST\\")"\`\n` +
            `• **Specific entities:** \`entitySelector: "entityId(\\"HOST-123\\",\\"HOST-456\\")"\`\n` +
            `• **With existing tags:** \`entitySelector: "type(\\"SERVICE\\"),tag(\\"environment\\")"\`\n` +
            `• **Management zone:** \`entitySelector: "type(\\"HOST\\"),mzName(\\"Production\\")"\`\n` +
            `• **Health state filter:** \`entitySelector: "type(\\"APPLICATION\\"),healthState(\\"HEALTHY\\")"\``
        }
      ],
      isError: true,
    };
  }
}
