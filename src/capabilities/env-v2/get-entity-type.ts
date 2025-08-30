import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { EntityType, EntityTypeSchema } from '../../types/entities.js';

/**
 * Tool for getting detailed information about a specific entity type
 */
export const getEntityTypeTool: Tool = {
  name: 'get_entity_type',
  description: 'Gets detailed information about a specific entity type including its properties, relationships, and capabilities',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        description: 'The entity type to retrieve information for (e.g., "HOST", "APPLICATION", "SERVICE")',
      },
    },
    required: ['type'],
  },
};

/**
 * Handler for the get_entity_type tool
 */
export async function handleGetEntityType(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams;
    
    if (!params.type) {
      throw new Error('type parameter is required');
    }

    const endpoint = `/entityTypes/${params.type}`;
    
    const response = await client.get<EntityType>(endpoint);
    const entityType = EntityTypeSchema.parse(response.data);

    // Format properties information
    let propertiesText = '';
    if (entityType.properties && entityType.properties.length > 0) {
      // Group properties by type for better organization
      const propertiesByType = new Map<string, typeof entityType.properties>();
      entityType.properties.forEach(prop => {
        if (!propertiesByType.has(prop.type)) {
          propertiesByType.set(prop.type, []);
        }
        propertiesByType.get(prop.type)!.push(prop);
      });

      // Sort property types and properties within each type
      const sortedPropertyTypes = Array.from(propertiesByType.entries()).sort(([a], [b]) => a.localeCompare(b));
      
      sortedPropertyTypes.forEach(([propType, props]) => {
        propertiesText += `\n**${propType} Properties:**\n`;
        props.sort((a, b) => a.id.localeCompare(b.id)).forEach(prop => {
          propertiesText += `   - **${prop.id}** (${prop.type})\n`;
        });
      });
    } else {
      propertiesText = 'No properties available for this entity type';
    }

    // Format incoming relationships
    let fromRelationshipsText = '';
    if (entityType.fromRelationships && entityType.fromRelationships.length > 0) {
      entityType.fromRelationships.forEach(rel => {
        fromRelationshipsText += `\n**${rel.id}**\n`;
        if (rel.fromTypes && rel.fromTypes.length > 0) {
          fromRelationshipsText += `   - **From Types:** ${rel.fromTypes.join(', ')}\n`;
        }
        if (rel.toTypes && rel.toTypes.length > 0) {
          fromRelationshipsText += `   - **To Types:** ${rel.toTypes.join(', ')}\n`;
        }
      });
    } else {
      fromRelationshipsText = 'No incoming relationships defined for this entity type';
    }

    // Format outgoing relationships
    let toRelationshipsText = '';
    if (entityType.toRelationships && entityType.toRelationships.length > 0) {
      entityType.toRelationships.forEach(rel => {
        toRelationshipsText += `\n**${rel.id}**\n`;
        if (rel.fromTypes && rel.fromTypes.length > 0) {
          toRelationshipsText += `   - **From Types:** ${rel.fromTypes.join(', ')}\n`;
        }
        if (rel.toTypes && rel.toTypes.length > 0) {
          toRelationshipsText += `   - **To Types:** ${rel.toTypes.join(', ')}\n`;
        }
      });
    } else {
      toRelationshipsText = 'No outgoing relationships defined for this entity type';
    }

    // Generate entity type category and description
    const getEntityTypeInfo = (type: string): { category: string; description: string } => {
      if (type.includes('HOST')) return { 
        category: 'Infrastructure', 
        description: 'Physical or virtual hosts, servers, and compute infrastructure' 
      };
      if (type.includes('APPLICATION')) return { 
        category: 'Applications', 
        description: 'Web applications, mobile apps, and application components' 
      };
      if (type.includes('SERVICE')) return { 
        category: 'Services', 
        description: 'Services, microservices, and service endpoints' 
      };
      if (type.includes('PROCESS')) return { 
        category: 'Processes', 
        description: 'Operating system processes and process groups' 
      };
      if (type.includes('DATABASE')) return { 
        category: 'Databases', 
        description: 'Database instances, schemas, and database services' 
      };
      if (type.includes('CUSTOM')) return { 
        category: 'Custom', 
        description: 'Custom devices and user-defined monitoring targets' 
      };
      if (type.includes('NETWORK') || type.includes('DISK')) return { 
        category: 'Network & Storage', 
        description: 'Network interfaces, storage devices, and infrastructure components' 
      };
      if (type.includes('SYNTHETIC')) return { 
        category: 'Synthetic', 
        description: 'Synthetic monitoring tests and browser checks' 
      };
      if (type.includes('BROWSER') || type.includes('MOBILE') || type.includes('SESSION')) return { 
        category: 'Digital Experience', 
        description: 'Real user monitoring, browser sessions, and user interactions' 
      };
      return { 
        category: 'Other', 
        description: 'Specialized entity type for specific monitoring scenarios' 
      };
    };

    const entityInfo = getEntityTypeInfo(entityType.type);

    // Generate statistics
    const stats = {
      propertiesCount: entityType.properties?.length || 0,
      fromRelationshipsCount: entityType.fromRelationships?.length || 0,
      toRelationshipsCount: entityType.toRelationships?.length || 0,
    };

    return {
      content: [
        {
          type: 'text',
          text: `## Entity Type Details 🏗️\n\n` +
            `### Basic Information\n` +
            `**Entity Type:** ${entityType.type}\n` +
            `**Category:** ${entityInfo.category}\n` +
            `**Description:** ${entityInfo.description}\n` +
            `**Entity Limit Exceeded:** ${entityType.entityLimitExceeded}\n` +
            `**Management Zones Support:** ${entityType.managementZones}\n` +
            `**Tags Support:** ${entityType.tags}\n\n` +
            
            `### Statistics\n` +
            `**Properties:** ${stats.propertiesCount} available\n` +
            `**Incoming Relationships:** ${stats.fromRelationshipsCount} types\n` +
            `**Outgoing Relationships:** ${stats.toRelationshipsCount} types\n\n` +
            
            `### Available Properties\n` +
            `${propertiesText}\n\n` +
            
            `### Incoming Relationships\n` +
            `${fromRelationshipsText}\n\n` +
            
            `### Outgoing Relationships\n` +
            `${toRelationshipsText}\n\n` +
            
            `### Raw Entity Type Data\n` +
            `\`\`\`json\n` +
            `${JSON.stringify(entityType, null, 2)}\n` +
            `\`\`\`\n\n` +
            
            `### Entity Selector Examples\n` +
            `• **All entities of this type:** \`entitySelector: "type(\\"${entityType.type}\\")"\`\n` +
            `• **With specific property:** \`entitySelector: "type(\\"${entityType.type}\\"),${entityType.properties?.[0]?.id || 'property'}(\\"value\\")"\`\n` +
            `• **In management zone:** \`entitySelector: "type(\\"${entityType.type}\\"),mzName(\\"zone-name\\")"\`\n` +
            `• **With tag:** \`entitySelector: "type(\\"${entityType.type}\\"),tag(\\"key:value\\")"\`\n` +
            `• **Health state filter:** \`entitySelector: "type(\\"${entityType.type}\\"),healthState(\\"HEALTHY\\")"\`\n\n` +
            
            `### Property Usage Examples\n` +
            `${entityType.properties && entityType.properties.length > 0 ? 
              entityType.properties.slice(0, 5).map(prop => 
                `• **${prop.id}:** Use in fields parameter: \`fields: "+properties.${prop.id}"\``
              ).join('\n') : 'No properties available for field selection'}\n\n` +
            
            `### Relationship Navigation\n` +
            `${entityType.fromRelationships && entityType.fromRelationships.length > 0 ? 
              entityType.fromRelationships.slice(0, 3).map(rel => 
                `• **${rel.id}:** Find entities that have this relationship to the current entity`
              ).join('\n') : 'No incoming relationships available'}\n` +
            `${entityType.toRelationships && entityType.toRelationships.length > 0 ? 
              entityType.toRelationships.slice(0, 3).map(rel => 
                `• **${rel.id}:** Find entities that the current entity relates to`
              ).join('\n') : 'No outgoing relationships available'}\n\n` +
            
            `### Related Actions\n` +
            `• **List entities:** Use \`list_entities\` with \`entitySelector: "type(\\"${entityType.type}\\")"\`\n` +
            `• **Browse all types:** Use \`list_entity_types\` to see all available entity types\n` +
            `• **Query metrics:** Use entity type in metrics queries for aggregation\n` +
            `• **Explore relationships:** Use relationship types in entity navigation\n\n` +
            
            `### Best Practices\n` +
            `• **Filtering:** Combine type selector with other criteria for precise filtering\n` +
            `• **Properties:** Use property names in field selection for detailed information\n` +
            `• **Relationships:** Navigate entity dependencies using relationship types\n` +
            `• **Performance:** Limit queries with specific time ranges and page sizes\n` +
            `• **Monitoring:** Use this type in custom dashboards and alerting rules`
        }
      ],
    };
  } catch (error) {
    console.error('Error getting entity type:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found');
    
    return {
      content: [
        {
          type: 'text',
          text: `## Entity Type Retrieval Error ❌\n\n` +
            `**Error:** Failed to retrieve entity type details\n` +
            `**Entity Type:** ${(request.params as any)?.arguments?.type || (request.params as any)?.type || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            
            `${isNotFound ? 
              `### Entity Type Not Found\n` +
              `The specified entity type does not exist or is not available.\n\n` +
              `**Possible reasons:**\n` +
              `• The entity type name is incorrect or misspelled\n` +
              `• The entity type is not supported in your environment\n` +
              `• Your API token lacks the required permissions\n` +
              `• The entity type is case-sensitive\n\n` +
              
              `**Common Entity Types:**\n` +
              `• **Infrastructure:** HOST, DISK, NETWORK_INTERFACE\n` +
              `• **Applications:** APPLICATION, MOBILE_APPLICATION\n` +
              `• **Services:** SERVICE, DATABASE_SERVICE\n` +
              `• **Processes:** PROCESS_GROUP, PROCESS_GROUP_INSTANCE\n` +
              `• **Databases:** DATABASE\n` +
              `• **Custom:** CUSTOM_DEVICE\n` +
              `• **Synthetic:** SYNTHETIC_TEST\n` +
              `• **Experience:** BROWSER_MONITOR, SESSION\n\n` +
              
              `**Next Steps:**\n` +
              `• Use \`list_entity_types\` to see all available entity types\n` +
              `• Check the exact spelling and case of the entity type\n` +
              `• Verify the entity type exists in your environment\n` +
              `• Use entity type names from the list_entity_types response`
              :
              `### Troubleshooting\n` +
              `• Verify your API token has the 'entities.read' scope\n` +
              `• Check if the entity type name is spelled correctly\n` +
              `• Ensure the entity type is case-sensitive (usually UPPERCASE)\n` +
              `• Verify network connectivity to the cluster\n` +
              `• Try using \`list_entity_types\` first to get valid type names\n\n` +
              
              `### Valid Entity Type Format\n` +
              `• Entity types are usually in UPPERCASE\n` +
              `• Use underscores for multi-word types (PROCESS_GROUP)\n` +
              `• Must match exactly as returned by list_entity_types\n` +
              `• Examples: HOST, APPLICATION, SERVICE, CUSTOM_DEVICE`
            }`
        }
      ],
      isError: true,
    };
  }
}
