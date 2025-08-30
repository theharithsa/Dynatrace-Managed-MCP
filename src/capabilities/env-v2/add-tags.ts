import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { AddTagsResponse, AddTagsResponseSchema, AddTagsQueryParams } from '../../types/entities.js';

/**
 * Tool for adding custom tags to entities
 */
export const addTagsTool: Tool = {
  name: 'add_tags',
  description: 'Adds custom tags to the specified entities. All existing tags remain unaffected.',
  inputSchema: {
    type: 'object',
    properties: {
      entitySelector: {
        type: 'string',
        description: 'Specifies the entities where you want to add tags. Must include entity type or entity IDs. Examples: type("HOST"), entityId("HOST-123","HOST-456")',
      },
      tags: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The key of the tag. For value-only tags, specify the value here.',
            },
            value: {
              type: 'string',
              description: 'The value of the tag. Optional for key-only tags.',
            },
          },
          required: ['key'],
        },
        description: 'List of tags to add to the entities.',
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
    required: ['entitySelector', 'tags'],
  },
};

/**
 * Handler for the add_tags tool
 */
export async function handleAddTags(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as AddTagsQueryParams;
    
    if (!params.entitySelector) {
      throw new Error('entitySelector parameter is required');
    }
    if (!params.tags || params.tags.length === 0) {
      throw new Error('tags parameter is required and must contain at least one tag');
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

    // Build request body
    const requestBody = {
      tags: params.tags,
    };

    const queryString = queryParams.toString();
    const endpoint = `/tags?${queryString}`;
    
    const response = await client.post<AddTagsResponse>(endpoint, requestBody);
    const addTagsResponse = AddTagsResponseSchema.parse(response.data);

    // Format the response for better readability
    const appliedTagsList = addTagsResponse.appliedTags.map((tag, index) => {
      let tagDisplay = `**${index + 1}. ${tag.key}**`;
      if (tag.value) {
        tagDisplay += ` = ${tag.value}`;
      }
      tagDisplay += `\n   - **Context:** ${tag.context || 'CONTEXTLESS'}`;
      tagDisplay += `\n   - **String Representation:** \`${tag.stringRepresentation || tag.key}\``;
      return tagDisplay;
    }).join('\n\n');

    // Group input tags by type
    const keyOnlyTags = params.tags.filter((t: { key: string; value?: string }) => !t.value);
    const keyValueTags = params.tags.filter((t: { key: string; value?: string }) => t.value);

    // Format input tags
    const inputTagsList = params.tags.map((tag: { key: string; value?: string }, index: number) => {
      return `**${index + 1}. ${tag.key}**${tag.value ? ` = ${tag.value}` : ' (key-only)'}`;
    }).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `## Tags Added Successfully ✅\n\n` +
            `### Operation Summary\n` +
            `**Matched Entities:** ${addTagsResponse.matchedEntitiesCount}\n` +
            `**Applied Tags:** ${addTagsResponse.appliedTags.length}\n` +
            `**Entity Selector:** \`${params.entitySelector}\`\n` +
            `${params.from ? `**Time Range:** ${params.from} → ${params.to || 'now'}\n` : ''}` +
            `\n` +
            
            `### Input Tags\n` +
            `${inputTagsList}\n\n` +
            
            `### Applied Tags\n` +
            `${appliedTagsList}\n\n` +
            
            `### Tag Statistics\n` +
            `**Key-only tags:** ${keyOnlyTags.length}\n` +
            `**Key-value tags:** ${keyValueTags.length}\n` +
            `**Total input tags:** ${params.tags.length}\n` +
            `**Successfully applied:** ${addTagsResponse.appliedTags.length}\n\n` +
            
            `### Tag Usage\n` +
            `These tags can now be used in entity selectors:\n` +
            addTagsResponse.appliedTags.map(tag => 
              `• **${tag.key}${tag.value ? ` = ${tag.value}` : ''}:** \`tag("${tag.stringRepresentation || tag.key}")\``
            ).join('\n') + '\n\n' +
            
            `### Next Steps\n` +
            `• **Verify tags:** Use \`list_tags\` with the same entity selector\n` +
            `• **Filter entities:** Use new tags in \`list_entities\` with entity selector\n` +
            `• **Query metrics:** Apply entity selector with tags in metrics queries\n` +
            `• **Create dashboards:** Use tagged entities in custom dashboards\n\n` +
            
            `### Entity Selector Examples with New Tags\n` +
            addTagsResponse.appliedTags.slice(0, 3).map(tag => 
              `• **Filter by ${tag.key}:** \`entitySelector: "type(\\"HOST\\"),tag(\\"${tag.stringRepresentation || tag.key}\\")"\``
            ).join('\n') + '\n\n' +
            
            `### Tag Management Tips\n` +
            `• **Existing tags:** All existing tags remain unchanged\n` +
            `• **Duplicate prevention:** Dynatrace prevents duplicate tags automatically\n` +
            `• **Tag contexts:** Tags are assigned appropriate contexts automatically\n` +
            `• **String representation:** Use in entity selectors and queries\n` +
            `• **Case sensitivity:** Tag values are case-sensitive in selectors\n\n` +
            
            `### Related Actions\n` +
            `• **List current tags:** \`list_tags\` with entitySelector: \`"${params.entitySelector}"\`\n` +
            `• **Remove tags:** Use \`delete_tags\` to remove specific tags\n` +
            `• **Filter entities:** Use \`list_entities\` with tag-based entity selectors\n` +
            `• **Monitor tagged entities:** Use in custom monitoring rules and alerts`
        }
      ],
    };
  } catch (error) {
    console.error('Error adding tags:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isBadRequest = errorMessage.includes('400') || errorMessage.includes('Bad Request');
    const isForbidden = errorMessage.includes('403') || errorMessage.includes('Forbidden');
    
    return {
      content: [
        {
          type: 'text',
          text: `## Add Tags Error ❌\n\n` +
            `**Error:** Failed to add tags to entities\n` +
            `**Entity Selector:** ${(request.params as any)?.arguments?.entitySelector || (request.params as any)?.entitySelector || 'Not provided'}\n` +
            `**Tags:** ${JSON.stringify((request.params as any)?.arguments?.tags || (request.params as any)?.tags || [], null, 2)}\n` +
            `**Details:** ${errorMessage}\n\n` +
            
            `${isForbidden ? 
              `### Permission Error\n` +
              `Your API token lacks the required permissions for tag management.\n\n` +
              `**Required Permissions:**\n` +
              `• **API Token Scope:** \`entities.write\`\n` +
              `• **Personal Access Token:** \`environment:roles:manage-settings\`\n\n` +
              `**Solutions:**\n` +
              `• Generate a new API token with \`entities.write\` scope\n` +
              `• Contact your Dynatrace administrator for permissions\n` +
              `• Verify the token is correctly configured in your environment`
              :
              isBadRequest ?
              `### Invalid Request Data\n` +
              `The request contains invalid or malformed data.\n\n` +
              `**Common Issues:**\n` +
              `• **entitySelector:** Must include entity type or specific entity IDs\n` +
              `• **tags:** Must be an array with at least one tag object\n` +
              `• **tag.key:** Must be a non-empty string, no special characters\n` +
              `• **tag.value:** Optional string, avoid special characters\n` +
              `• **Entity selector syntax:** Check for proper escaping and format\n\n` +
              
              `**Valid Tag Examples:**\n` +
              `• **Key-only:** \`{ "key": "production" }\`\n` +
              `• **Key-value:** \`{ "key": "environment", "value": "prod" }\`\n` +
              `• **Multiple tags:** \`[{ "key": "team", "value": "backend" }, { "key": "critical" }]\`\n\n` +
              
              `**Valid Entity Selector Examples:**\n` +
              `• **By type:** \`type("HOST")\`\n` +
              `• **By IDs:** \`entityId("HOST-123","HOST-456")\`\n` +
              `• **With filters:** \`type("SERVICE"),healthState("HEALTHY")\`\n` +
              `• **Escaped values:** \`tag("url\\:example.com")\``
              :
              `### Troubleshooting\n` +
              `• Verify your API token has the 'entities.write' scope\n` +
              `• Check if the entitySelector syntax is correct\n` +
              `• Ensure tag keys and values contain valid characters\n` +
              `• Verify entities exist within the specified time range\n` +
              `• Check network connectivity to the cluster\n\n` +
              
              `### Tag Requirements\n` +
              `• **Key:** Required string, alphanumeric and common symbols\n` +
              `• **Value:** Optional string, alphanumeric and common symbols\n` +
              `• **Special characters:** Escape colons in keys/values\n` +
              `• **Length limits:** Keys and values should be reasonably short\n` +
              `• **Case sensitivity:** Tag values are case-sensitive\n\n` +
              
              `### Entity Selector Requirements\n` +
              `• **Must include:** Entity type OR specific entity IDs\n` +
              `• **Type format:** \`type("ENTITY_TYPE")\`\n` +
              `• **ID format:** \`entityId("ID1","ID2")\`\n` +
              `• **Additional filters:** Optional criteria like tags, health state\n` +
              `• **Escaping:** Use backslash to escape special characters`
            }`
        }
      ],
      isError: true,
    };
  }
}
