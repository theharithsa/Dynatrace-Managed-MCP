import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { EntityTypesListResponse, EntityTypesListResponseSchema, EntityTypesListQueryParams } from '../../types/entities.js';

/**
 * Tool for listing available entity types
 */
export const listEntityTypesTool: Tool = {
  name: 'list_entity_types',
  description: 'Gets the list of all available entity types in the environment with their properties and relationship information',
  inputSchema: {
    type: 'object',
    properties: {
      nextPageKey: {
        type: 'string',
        description: 'The cursor for the next page of results. You can find it in the nextPageKey field of the previous response.',
      },
      pageSize: {
        type: 'number',
        description: 'The amount of entity types per page. If not set, 200 is used.',
        minimum: 1,
        maximum: 500,
      },
    },
  },
};

/**
 * Handler for the list_entity_types tool
 */
export async function handleListEntityTypes(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as EntityTypesListQueryParams;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.nextPageKey) {
      queryParams.append('nextPageKey', params.nextPageKey);
    }
    if (params.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/entityTypes${queryString ? `?${queryString}` : ''}`;
    
    const response = await client.get<EntityTypesListResponse>(endpoint);
    const entityTypes = EntityTypesListResponseSchema.parse(response.data);

    // Group entity types by category for better organization
    const categorizeEntityType = (type: string): string => {
      if (type.includes('HOST')) return 'Infrastructure';
      if (type.includes('APPLICATION') || type.includes('SERVICE')) return 'Applications & Services';
      if (type.includes('PROCESS')) return 'Processes';
      if (type.includes('DATABASE')) return 'Databases';
      if (type.includes('CUSTOM')) return 'Custom';
      if (type.includes('NETWORK') || type.includes('DISK')) return 'Network & Storage';
      if (type.includes('SYNTHETIC')) return 'Synthetic';
      if (type.includes('BROWSER') || type.includes('MOBILE')) return 'Digital Experience';
      return 'Other';
    };

    // Organize entity types by category
    const typesByCategory = new Map<string, typeof entityTypes.types>();
    entityTypes.types.forEach(entityType => {
      const category = categorizeEntityType(entityType.type);
      if (!typesByCategory.has(category)) {
        typesByCategory.set(category, []);
      }
      typesByCategory.get(category)!.push(entityType);
    });

    // Sort categories and types within each category
    const sortedCategories = Array.from(typesByCategory.entries()).sort(([a], [b]) => a.localeCompare(b));
    sortedCategories.forEach(([, types]) => {
      types.sort((a, b) => a.type.localeCompare(b.type));
    });

    let formattedOutput = '';
    sortedCategories.forEach(([category, types]) => {
      formattedOutput += `#### ${category} (${types.length})\n`;
      types.forEach((entityType, index) => {
        const properties = entityType.properties ? 
          entityType.properties.slice(0, 5).map(prop => `${prop.id} (${prop.type})`).join(', ') : 'None';
        const propertiesDisplay = properties + (entityType.properties && entityType.properties.length > 5 ? '...' : '');
        
        const fromRelationships = entityType.fromRelationships ? 
          entityType.fromRelationships.slice(0, 3).map(rel => rel.id).join(', ') : 'None';
        const fromRelDisplay = fromRelationships + (entityType.fromRelationships && entityType.fromRelationships.length > 3 ? '...' : '');
        
        const toRelationships = entityType.toRelationships ? 
          entityType.toRelationships.slice(0, 3).map(rel => rel.id).join(', ') : 'None';
        const toRelDisplay = toRelationships + (entityType.toRelationships && entityType.toRelationships.length > 3 ? '...' : '');
        
        formattedOutput += `**${index + 1}. ${entityType.type}**\n`;
        formattedOutput += `   - **Entity Limit:** ${entityType.entityLimitExceeded}\n`;
        formattedOutput += `   - **Management Zones:** ${entityType.managementZones}\n`;
        formattedOutput += `   - **Tags:** ${entityType.tags}\n`;
        if (propertiesDisplay !== 'None') {
          formattedOutput += `   - **Properties:** ${propertiesDisplay}\n`;
        }
        if (fromRelDisplay !== 'None') {
          formattedOutput += `   - **Incoming Relationships:** ${fromRelDisplay}\n`;
        }
        if (toRelDisplay !== 'None') {
          formattedOutput += `   - **Outgoing Relationships:** ${toRelDisplay}\n`;
        }
        formattedOutput += '\n';
      });
    });

    // Generate statistics
    const stats = {
      totalTypes: entityTypes.types.length,
      withProperties: entityTypes.types.filter(t => t.properties && t.properties.length > 0).length,
      withFromRelationships: entityTypes.types.filter(t => t.fromRelationships && t.fromRelationships.length > 0).length,
      withToRelationships: entityTypes.types.filter(t => t.toRelationships && t.toRelationships.length > 0).length,
      categoriesCount: typesByCategory.size,
    };

    return {
      content: [
        {
          type: 'text',
          text: `## Entity Types 🏗️\n\n` +
            `### Summary\n` +
            `**Total Entity Types:** ${entityTypes.totalCount}\n` +
            `**Returned:** ${entityTypes.types.length} types\n` +
            `**Page Size:** ${entityTypes.pageSize}\n` +
            `**Categories:** ${stats.categoriesCount}\n` +
            `${entityTypes.nextPageKey ? `**Next Page Available:** Yes (${entityTypes.nextPageKey.substring(0, 20)}...)\n` : '**Next Page Available:** No\n'}` +
            `\n` +
            
            `### Statistics\n` +
            `**With Properties:** ${stats.withProperties}/${stats.totalTypes} (${Math.round(stats.withProperties/stats.totalTypes*100)}%)\n` +
            `**With Incoming Relationships:** ${stats.withFromRelationships}/${stats.totalTypes} (${Math.round(stats.withFromRelationships/stats.totalTypes*100)}%)\n` +
            `**With Outgoing Relationships:** ${stats.withToRelationships}/${stats.totalTypes} (${Math.round(stats.withToRelationships/stats.totalTypes*100)}%)\n\n` +
            
            `### Entity Types by Category\n` +
            formattedOutput +
            
            `### Navigation\n` +
            `${entityTypes.nextPageKey ? `🔄 **Next Page:** Use \`nextPageKey: "${entityTypes.nextPageKey}"\` to get more results\n` : '✅ **End of Results:** No more pages available\n'}` +
            
            `### Common Entity Types\n` +
            `• **HOST** - Physical and virtual hosts/servers\n` +
            `• **APPLICATION** - Web applications and their components\n` +
            `• **SERVICE** - Services and microservices\n` +
            `• **PROCESS_GROUP** - Process groups running on hosts\n` +
            `• **PROCESS_GROUP_INSTANCE** - Individual process instances\n` +
            `• **DATABASE** - Database instances and schemas\n` +
            `• **CUSTOM_DEVICE** - Custom monitored devices\n` +
            `• **SYNTHETIC_TEST** - Synthetic monitoring tests\n` +
            `• **BROWSER_MONITOR** - Real user monitoring sessions\n` +
            `• **MOBILE_APPLICATION** - Mobile applications\n\n` +
            
            `### Entity Type Properties\n` +
            `• **Entity Limit Exceeded:** Indicates if the entity limit has been reached\n` +
            `• **Management Zones:** Access control for entity visibility\n` +
            `• **Tags:** Metadata support for filtering and organization\n` +
            `• **Properties:** Available attributes for each entity type\n` +
            `• **Relationships:** Dependencies and connections to other entities\n\n` +
            
            `### Related Actions\n` +
            `• **Get type details:** Use \`get_entity_type\` with specific type name\n` +
            `• **List entities by type:** Use \`list_entities\` with \`entitySelector: "type(\\"TYPE_NAME\\")"\`\n` +
            `• **Explore relationships:** Use entity selectors to filter by relationships\n` +
            `• **Custom monitoring:** Use \`create_custom_device\` for custom entity types\n\n` +
            
            `### Entity Selector Examples by Type\n` +
            `• **All hosts:** \`entitySelector: "type(\\"HOST\\")"\`\n` +
            `• **Web applications:** \`entitySelector: "type(\\"APPLICATION\\")"\`\n` +
            `• **Database services:** \`entitySelector: "type(\\"SERVICE\\"),entityName.contains(\\"database\\")"\`\n` +
            `• **Process groups:** \`entitySelector: "type(\\"PROCESS_GROUP\\")"\`\n` +
            `• **Custom devices:** \`entitySelector: "type(\\"CUSTOM_DEVICE\\")"\`\n` +
            `• **Multiple types:** \`entitySelector: "type(\\"HOST\\",\\"APPLICATION\\")"\``
        }
      ],
    };
  } catch (error) {
    console.error('Error listing entity types:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `## Entity Types List Error ❌\n\n` +
            `**Error:** Failed to retrieve entity types list\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            `• Verify your API token has the 'entities.read' scope\n` +
            `• Check if the pageSize is within allowed limits (1-500)\n` +
            `• Verify network connectivity to the cluster\n` +
            `• Ensure the nextPageKey is valid if provided\n\n` +
            
            `### Common Entity Types Reference\n` +
            `If the API is unavailable, here are the most common entity types:\n\n` +
            
            `**Infrastructure:**\n` +
            `• HOST - Physical and virtual hosts\n` +
            `• DISK - Storage devices and volumes\n` +
            `• NETWORK_INTERFACE - Network interfaces\n\n` +
            
            `**Applications & Services:**\n` +
            `• APPLICATION - Web applications\n` +
            `• SERVICE - Services and microservices\n` +
            `• MOBILE_APPLICATION - Mobile apps\n\n` +
            
            `**Processes:**\n` +
            `• PROCESS_GROUP - Process groups\n` +
            `• PROCESS_GROUP_INSTANCE - Process instances\n\n` +
            
            `**Databases:**\n` +
            `• DATABASE - Database instances\n` +
            `• DATABASE_SERVICE - Database services\n\n` +
            
            `**Custom & Synthetic:**\n` +
            `• CUSTOM_DEVICE - Custom monitored devices\n` +
            `• SYNTHETIC_TEST - Synthetic tests\n` +
            `• BROWSER_MONITOR - Browser monitoring\n\n` +
            
            `**Digital Experience:**\n` +
            `• USER_ACTION - User interactions\n` +
            `• SESSION - User sessions\n\n` +
            
            `Use these type names with \`list_entities\` and entity selectors.`
        }
      ],
      isError: true,
    };
  }
}
