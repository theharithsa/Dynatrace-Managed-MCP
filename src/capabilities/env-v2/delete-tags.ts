import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { DeleteTagsResponse, DeleteTagsResponseSchema, DeleteTagsQueryParams } from '../../types/entities.js';

/**
 * Tool for deleting custom tags from entities
 */
export const deleteTagsTool: Tool = {
  name: 'delete_tags',
  description: 'Deletes the specified tag from the specified entities. Can delete by key only or by exact key-value match.',
  inputSchema: {
    type: 'object',
    properties: {
      entitySelector: {
        type: 'string',
        description: 'Specifies the entities where you want to delete tags. Must include entity type or entity IDs. Examples: type("HOST"), entityId("HOST-123","HOST-456")',
      },
      key: {
        type: 'string',
        description: 'The key of the tag to be deleted. If deleteAllWithKey is true, all tags with this key are deleted. For value-only tags, specify the value here.',
      },
      value: {
        type: 'string',
        description: 'The value of the tag to be deleted. Ignored if deleteAllWithKey is true. For value-only tags, specify the value in the key parameter.',
      },
      deleteAllWithKey: {
        type: 'boolean',
        description: 'If true, all tags with the specified key are deleted, regardless of the value. If false, only tags with exact match of key and value are deleted. Default is false.',
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
    required: ['entitySelector', 'key'],
  },
};

/**
 * Handler for the delete_tags tool
 */
export async function handleDeleteTags(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as DeleteTagsQueryParams;
    
    if (!params.entitySelector) {
      throw new Error('entitySelector parameter is required');
    }
    if (!params.key) {
      throw new Error('key parameter is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('entitySelector', params.entitySelector);
    queryParams.append('key', params.key);
    
    if (params.value) {
      queryParams.append('value', params.value);
    }
    if (params.deleteAllWithKey !== undefined) {
      queryParams.append('deleteAllWithKey', params.deleteAllWithKey.toString());
    }
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }

    const queryString = queryParams.toString();
    const endpoint = `/tags?${queryString}`;
    
    const response = await client.delete<DeleteTagsResponse>(endpoint);
    const deleteResponse = DeleteTagsResponseSchema.parse(response.data);

    // Determine the deletion scope
    const deletionScope = params.deleteAllWithKey ? 
      `All tags with key "${params.key}"` : 
      params.value ? 
        `Tag "${params.key}" = "${params.value}"` : 
        `Tag "${params.key}"`;

    return {
      content: [
        {
          type: 'text',
          text: `## Tags Deleted Successfully ✅\n\n` +
            `### Operation Summary\n` +
            `**Matched Entities:** ${deleteResponse.matchedEntitiesCount}\n` +
            `**Deletion Scope:** ${deletionScope}\n` +
            `**Entity Selector:** \`${params.entitySelector}\`\n` +
            `${params.from ? `**Time Range:** ${params.from} → ${params.to || 'now'}\n` : ''}` +
            `\n` +
            
            `### Deletion Details\n` +
            `**Tag Key:** \`${params.key}\`\n` +
            `${params.value ? `**Tag Value:** \`${params.value}\`\n` : ''}` +
            `**Delete All with Key:** ${params.deleteAllWithKey ? 'Yes - All tags with this key were deleted' : 'No - Only exact matches were deleted'}\n` +
            `**Entities Affected:** ${deleteResponse.matchedEntitiesCount} entities had tags removed\n\n` +
            
            `### Impact Analysis\n` +
            `${deleteResponse.matchedEntitiesCount === 0 ? 
              `⚠️ **No entities were affected.** This could mean:\n` +
              `• No entities matched the entity selector\n` +
              `• The specified tag key/value combination was not found\n` +
              `• The tag was already removed or never existed\n` +
              `• The time range excluded entities with the tag`
              :
              `✅ **${deleteResponse.matchedEntitiesCount} entities were updated successfully.**\n` +
              `• The specified tags have been removed from these entities\n` +
              `• Entity selectors using these tags will no longer match\n` +
              `• Existing dashboards and queries may be affected\n` +
              `• Historical data with these tags remains unchanged`
            }\n\n` +
            
            `### Verification Steps\n` +
            `• **Check remaining tags:** Use \`list_tags\` with entitySelector: \`"${params.entitySelector}"\`\n` +
            `• **Verify entities:** Use \`list_entities\` to confirm tag removal\n` +
            `• **Test selectors:** Entity selectors using deleted tags will return fewer results\n` +
            `• **Update queries:** Review dashboards and alerts that used deleted tags\n\n` +
            
            `### Entity Selector Impact\n` +
            `The following entity selectors will no longer match these entities:\n` +
            `• \`tag("${params.key}")\` - No longer matches any entities from this operation\n` +
            `${params.value ? `• \`tag("${params.key}:${params.value}")\` - Specific key-value combinations\n` : ''}` +
            `• Combined selectors using this tag with other criteria\n\n` +
            
            `### Cleanup Recommendations\n` +
            `${deleteResponse.matchedEntitiesCount > 0 ? 
              `**Since tags were deleted from ${deleteResponse.matchedEntitiesCount} entities:**\n` +
              `• Review and update custom dashboards using these tags\n` +
              `• Update alerting rules that filter by these tags\n` +
              `• Modify management zone definitions if they used these tags\n` +
              `• Update entity selector queries in automation scripts\n` +
              `• Consider notifying team members about the tag changes`
              :
              `**Since no entities were affected:**\n` +
              `• Verify the entity selector is correct\n` +
              `• Check if the tag key/value combination exists\n` +
              `• Use \`list_tags\` to see available tags on entities\n` +
              `• Consider adjusting the time range if needed`
            }\n\n` +
            
            `### Related Actions\n` +
            `• **List current tags:** \`list_tags\` with entitySelector: \`"${params.entitySelector}"\`\n` +
            `• **Add new tags:** Use \`add_tags\` to apply replacement tags\n` +
            `• **Check entities:** Use \`list_entities\` to verify the entities still exist\n` +
            `• **Monitor impact:** Review dashboards and alerts for affected queries\n\n` +
            
            `### Tag Deletion Examples\n` +
            `• **Delete all tags with key:** \`deleteAllWithKey: true\` (ignores value)\n` +
            `• **Delete specific key-value:** Provide both key and value\n` +
            `• **Delete key-only tag:** Provide key without value\n` +
            `• **Bulk deletion:** Use broader entity selectors for multiple entities\n\n` +
            
            `### Recovery Options\n` +
            `• **Re-add tags:** Use \`add_tags\` with the same key/value combinations\n` +
            `• **Restore from backup:** If you have tag configurations backed up\n` +
            `• **Historical queries:** Past data with these tags remains accessible\n` +
            `• **Automation:** Use scripts to reapply tags if needed`
        }
      ],
    };
  } catch (error) {
    console.error('Error deleting tags:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isBadRequest = errorMessage.includes('400') || errorMessage.includes('Bad Request');
    const isForbidden = errorMessage.includes('403') || errorMessage.includes('Forbidden');
    const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found');
    
    return {
      content: [
        {
          type: 'text',
          text: `## Delete Tags Error ❌\n\n` +
            `**Error:** Failed to delete tags from entities\n` +
            `**Entity Selector:** ${(request.params as any)?.arguments?.entitySelector || (request.params as any)?.entitySelector || 'Not provided'}\n` +
            `**Tag Key:** ${(request.params as any)?.arguments?.key || (request.params as any)?.key || 'Not provided'}\n` +
            `**Tag Value:** ${(request.params as any)?.arguments?.value || (request.params as any)?.value || 'Not specified'}\n` +
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
              isNotFound ?
              `### Tags or Entities Not Found\n` +
              `The specified tags or entities could not be found.\n\n` +
              `**Possible Reasons:**\n` +
              `• No entities match the entity selector\n` +
              `• The specified tag key/value combination doesn't exist\n` +
              `• The entities don't have any tags with the specified key\n` +
              `• The time range excludes entities with the tags\n\n` +
              
              `**Troubleshooting Steps:**\n` +
              `• Use \`list_entities\` to verify entities exist: \`entitySelector: "${(request.params as any)?.arguments?.entitySelector || (request.params as any)?.entitySelector}"\`\n` +
              `• Use \`list_tags\` to see available tags on entities\n` +
              `• Check tag key spelling and case sensitivity\n` +
              `• Verify the time range includes the entities\n` +
              `• Try a broader entity selector to test connectivity`
              :
              isBadRequest ?
              `### Invalid Request Data\n` +
              `The request contains invalid or malformed data.\n\n` +
              `**Common Issues:**\n` +
              `• **entitySelector:** Must include entity type or specific entity IDs\n` +
              `• **key:** Must be a non-empty string matching existing tags\n` +
              `• **value:** Must match existing tag values exactly (case-sensitive)\n` +
              `• **deleteAllWithKey:** Must be boolean (true/false)\n` +
              `• **Entity selector syntax:** Check for proper escaping and format\n\n` +
              
              `**Valid Examples:**\n` +
              `• **Delete key-only tag:** \`key: "production"\`\n` +
              `• **Delete key-value tag:** \`key: "environment", value: "prod"\`\n` +
              `• **Delete all with key:** \`key: "team", deleteAllWithKey: true\`\n` +
              `• **Entity selector:** \`entitySelector: "type(\\"HOST\\")"\`\n\n` +
              
              `**Tag Key Requirements:**\n` +
              `• Must match existing tag keys exactly\n` +
              `• Case-sensitive matching\n` +
              `• For value-only tags, specify the value as the key\n` +
              `• Use \`list_tags\` to see available keys`
              :
              `### Troubleshooting\n` +
              `• Verify your API token has the 'entities.write' scope\n` +
              `• Check if the entitySelector syntax is correct\n` +
              `• Ensure the tag key exists on the specified entities\n` +
              `• Verify tag value matches exactly (case-sensitive)\n` +
              `• Check network connectivity to the cluster\n\n` +
              
              `### Pre-deletion Checks\n` +
              `• **List existing tags:** Use \`list_tags\` to see current tags\n` +
              `• **Verify entities:** Use \`list_entities\` to confirm entity existence\n` +
              `• **Check tag format:** Ensure key/value match existing tags exactly\n` +
              `• **Test entity selector:** Verify it returns the expected entities\n\n` +
              
              `### Safe Deletion Practices\n` +
              `• Always list tags first to see what exists\n` +
              `• Use specific entity selectors to limit impact\n` +
              `• Test with a small subset of entities first\n` +
              `• Document tag changes for team awareness\n` +
              `• Consider the impact on dashboards and alerts`
            }`
        }
      ],
      isError: true,
    };
  }
}
