import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { EntitiesListResponse, EntitiesListResponseSchema, EntitiesListQueryParams } from '../../types/entities.js';

/**
 * Tool for listing monitored entities
 */
export const listEntitesTool: Tool = {
  name: 'list_entities',
  description: 'Gets information about monitored entities with filtering and pagination options',
  inputSchema: {
    type: 'object',
    properties: {
      nextPageKey: {
        type: 'string',
        description: 'The cursor for the next page of results. You can find it in the nextPageKey field of the previous response.',
      },
      pageSize: {
        type: 'number',
        description: 'The amount of entities per page. If not set, 50 is used.',
        minimum: 1,
      },
      entitySelector: {
        type: 'string',
        description: 'Defines the scope of the query. Examples: type("HOST"), entityId("HOST-123"), tag("environment:prod"), healthState("HEALTHY")',
      },
      from: {
        type: 'string',
        description: 'The start of the requested timeframe. UTC milliseconds, human-readable format, or relative format like "now-3d". Default is "now-3d".',
      },
      to: {
        type: 'string',
        description: 'The end of the requested timeframe. UTC milliseconds, human-readable format, or relative format. Default is current timestamp.',
      },
      fields: {
        type: 'string',
        description: 'Defines entity properties included in the response. Use +field to add properties. Example: +lastSeenTms,+properties.BITNESS',
      },
      sort: {
        type: 'string',
        description: 'Defines the ordering of entities. Use +/- prefix for ascending/descending. Example: +name, -name. Currently only supports name sorting.',
      },
    },
  },
};

/**
 * Handler for the list_entities tool
 */
export async function handleListEntities(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as EntitiesListQueryParams;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.nextPageKey) {
      queryParams.append('nextPageKey', params.nextPageKey);
    }
    if (params.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params.entitySelector) {
      queryParams.append('entitySelector', params.entitySelector);
    }
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }
    if (params.fields) {
      queryParams.append('fields', params.fields);
    }
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }

    const queryString = queryParams.toString();
    const endpoint = `/entities${queryString ? `?${queryString}` : ''}`;
    
    const response = await client.get<EntitiesListResponse>(endpoint);
    const entities = EntitiesListResponseSchema.parse(response.data);

    // Format the response for better readability
    const formattedEntities = entities.entities.map((entity, index) => {
      const firstSeenDate = entity.firstSeenTms ? new Date(entity.firstSeenTms).toISOString() : 'Unknown';
      const lastSeenDate = entity.lastSeenTms ? new Date(entity.lastSeenTms).toISOString() : 'Unknown';
      const managementZones = entity.managementZones ? 
        entity.managementZones.map(mz => `${mz.name} (${mz.id})`).join(', ') : 'None';
      const tags = entity.tags && entity.tags.length > 0 ? 
        entity.tags.map(tag => tag.stringRepresentation).join(', ') : 'None';
      
      // Format properties
      const properties = entity.properties ? 
        Object.entries(entity.properties).slice(0, 5).map(([key, value]) => 
          `${key}: ${JSON.stringify(value)}`
        ).join(', ') : 'None';
      
      // Format relationships
      const fromRelationships = entity.fromRelationships ? 
        Object.keys(entity.fromRelationships).slice(0, 3).join(', ') : 'None';
      const toRelationships = entity.toRelationships ? 
        Object.keys(entity.toRelationships).slice(0, 3).join(', ') : 'None';
      
      return {
        index: index + 1,
        entityId: entity.entityId,
        displayName: entity.displayName,
        type: entity.type,
        firstSeen: firstSeenDate,
        lastSeen: lastSeenDate,
        managementZones,
        tags,
        properties: properties + (entity.properties && Object.keys(entity.properties).length > 5 ? '...' : ''),
        fromRelationships: fromRelationships + (entity.fromRelationships && Object.keys(entity.fromRelationships).length > 3 ? '...' : ''),
        toRelationships: toRelationships + (entity.toRelationships && Object.keys(entity.toRelationships).length > 3 ? '...' : ''),
        icon: entity.icon?.primaryIconType || 'Default',
      };
    });

    // Group entities by type for better organization
    const entitiesByType = new Map<string, typeof formattedEntities>();
    formattedEntities.forEach(entity => {
      if (!entitiesByType.has(entity.type)) {
        entitiesByType.set(entity.type, []);
      }
      entitiesByType.get(entity.type)!.push(entity);
    });

    let formattedOutput = '';
    Array.from(entitiesByType.entries()).forEach(([type, typeEntities]) => {
      formattedOutput += `#### ${type} (${typeEntities.length})\n`;
      typeEntities.forEach((entity) => {
        formattedOutput += `**${entity.index}. ${entity.displayName}**\n`;
        formattedOutput += `   - **ID:** \`${entity.entityId}\`\n`;
        formattedOutput += `   - **Type:** ${entity.type}\n`;
        formattedOutput += `   - **Icon:** ${entity.icon}\n`;
        formattedOutput += `   - **First Seen:** ${entity.firstSeen}\n`;
        formattedOutput += `   - **Last Seen:** ${entity.lastSeen}\n`;
        formattedOutput += `   - **Management Zones:** ${entity.managementZones}\n`;
        formattedOutput += `   - **Tags:** ${entity.tags}\n`;
        if (entity.properties !== 'None') {
          formattedOutput += `   - **Properties:** ${entity.properties}\n`;
        }
        if (entity.fromRelationships !== 'None') {
          formattedOutput += `   - **From Relationships:** ${entity.fromRelationships}\n`;
        }
        if (entity.toRelationships !== 'None') {
          formattedOutput += `   - **To Relationships:** ${entity.toRelationships}\n`;
        }
      });
      formattedOutput += '\n';
    });

    return {
      content: [
        {
          type: 'text',
          text: `## Monitored Entities 🏗️\n\n` +
            `### Summary\n` +
            `**Total Count:** ${entities.totalCount}\n` +
            `**Returned:** ${entities.entities.length} entities\n` +
            `**Page Size:** ${entities.pageSize}\n` +
            `**Entity Types:** ${entitiesByType.size}\n` +
            `${entities.nextPageKey ? `**Next Page Available:** Yes (${entities.nextPageKey.substring(0, 20)}...)\n` : '**Next Page Available:** No\n'}` +
            `${params.entitySelector ? `**Filter Applied:** ${params.entitySelector}\n` : ''}` +
            `${params.from ? `**Time Range:** ${params.from} → ${params.to || 'now'}\n` : ''}` +
            `\n` +
            
            `### Entities by Type\n` +
            formattedOutput +
            
            `### Navigation\n` +
            `${entities.nextPageKey ? `🔄 **Next Page:** Use \`nextPageKey: "${entities.nextPageKey}"\` to get more results\n` : '✅ **End of Results:** No more pages available\n'}` +
            
            `### Entity Selector Examples\n` +
            `• **All hosts:** \`entitySelector: "type(\\"HOST\\")"\`\n` +
            `• **Healthy applications:** \`entitySelector: "type(\\"APPLICATION\\"),healthState(\\"HEALTHY\\")"\`\n` +
            `• **Tagged entities:** \`entitySelector: "tag(\\"environment:prod\\")"\`\n` +
            `• **Management zone:** \`entitySelector: "mzName(\\"Production\\")"\`\n` +
            `• **Entity name filter:** \`entitySelector: "entityName.startsWith(\\"web\\")"\`\n` +
            `• **Multiple criteria:** \`entitySelector: "type(\\"HOST\\"),healthState(\\"HEALTHY\\"),tag(\\"environment:prod\\")"\`\n\n` +
            
            `### Time Range Examples\n` +
            `• **Last 24 hours:** \`from: "now-1d"\`\n` +
            `• **Last week:** \`from: "now-1w"\`\n` +
            `• **Specific period:** \`from: "2024-01-01T00:00:00Z", to: "2024-01-02T00:00:00Z"\`\n` +
            `• **Recent entities:** \`from: "now-1h"\` (recently active)\n\n` +
            
            `### Fields Examples\n` +
            `• **Add timestamps:** \`fields: "+lastSeenTms,+firstSeenTms"\`\n` +
            `• **Add properties:** \`fields: "+properties.BITNESS,+properties.CPU_CORES"\`\n` +
            `• **Full details:** \`fields: "+lastSeenTms,+properties,+fromRelationships"\`\n\n` +
            
            `### Common Entity Types\n` +
            `• **HOST** - Physical and virtual hosts\n` +
            `• **APPLICATION** - Web and mobile applications\n` +
            `• **SERVICE** - Services and microservices\n` +
            `• **PROCESS_GROUP** - Process groups\n` +
            `• **CUSTOM_DEVICE** - Custom monitored devices\n` +
            `• **DATABASE** - Database instances\n` +
            `• **DISK** - Storage devices\n` +
            `• **NETWORK_INTERFACE** - Network interfaces\n\n` +
            
            `### Related Actions\n` +
            `• **Get entity details:** Use \`get_entity\` with specific \`entityId\`\n` +
            `• **Create custom device:** Use \`create_custom_device\`\n` +
            `• **Explore entity types:** Use \`list_entity_types\`\n` +
            `• **Query metrics:** Use entity IDs in metrics \`entitySelector\``
        }
      ],
    };
  } catch (error) {
    console.error('Error listing entities:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `## Entities List Error ❌\n\n` +
            `**Error:** Failed to retrieve entities list\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            `• Verify your API token has the 'entities.read' scope\n` +
            `• Check if the entitySelector syntax is correct\n` +
            `• Ensure the pageSize is within reasonable limits\n` +
            `• Verify the time range parameters if used\n` +
            `• Check network connectivity to the cluster\n\n` +
            
            `### Valid Entity Selector Format\n` +
            `• **Type:** \`type("HOST")\` - Required for first page\n` +
            `• **Entity ID:** \`entityId("HOST-123","HOST-456")\`\n` +
            `• **Tags:** \`tag("environment:prod")\`\n` +
            `• **Management Zone:** \`mzName("Production")\` or \`mzId(123)\`\n` +
            `• **Health State:** \`healthState("HEALTHY")\`\n` +
            `• **Entity Name:** \`entityName.equals("hostname")\`\n` +
            `• **Combination:** \`type("HOST"),healthState("HEALTHY"),tag("env:prod")\``
        }
      ],
      isError: true,
    };
  }
}
