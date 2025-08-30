import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { Entity, EntitySchema } from '../../types/entities.js';

/**
 * Tool for getting detailed information about a specific monitored entity
 */
export const getEntityTool: Tool = {
  name: 'get_entity',
  description: 'Gets detailed information about a specific monitored entity by its ID',
  inputSchema: {
    type: 'object',
    properties: {
      entityId: {
        type: 'string',
        description: 'The ID of the monitored entity to retrieve (e.g., HOST-123, APPLICATION-456)',
      },
      from: {
        type: 'string',
        description: 'The start of the requested timeframe. UTC milliseconds, human-readable format, or relative format like "now-3d".',
      },
      to: {
        type: 'string',
        description: 'The end of the requested timeframe. UTC milliseconds, human-readable format, or relative format.',
      },
      fields: {
        type: 'string',
        description: 'Defines entity properties included in the response. Use +field to add properties. Example: +lastSeenTms,+properties.BITNESS',
      },
    },
    required: ['entityId'],
  },
};

/**
 * Handler for the get_entity tool
 */
export async function handleGetEntity(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams;
    
    if (!params.entityId) {
      throw new Error('entityId parameter is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }
    if (params.fields) {
      queryParams.append('fields', params.fields);
    }

    const queryString = queryParams.toString();
    const endpoint = `/entities/${params.entityId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await client.get<Entity>(endpoint);
    const entity = EntitySchema.parse(response.data);

    // Format the entity details for better readability
    const firstSeenDate = entity.firstSeenTms ? new Date(entity.firstSeenTms).toISOString() : 'Unknown';
    const lastSeenDate = entity.lastSeenTms ? new Date(entity.lastSeenTms).toISOString() : 'Unknown';
    
    // Format management zones
    const managementZones = entity.managementZones ? 
      entity.managementZones.map(mz => `**${mz.name}** (ID: \`${mz.id}\`)`).join('\n   - ') : 'None assigned';
    
    // Format tags
    const tags = entity.tags && entity.tags.length > 0 ? 
      entity.tags.map(tag => {
        let tagInfo = `**${tag.key}**`;
        if (tag.value) tagInfo += ` = ${tag.value}`;
        if (tag.context) tagInfo += ` (${tag.context})`;
        return tagInfo;
      }).join('\n   - ') : 'No tags';
    
    // Format properties in categories
    let propertiesText = '';
    if (entity.properties && Object.keys(entity.properties).length > 0) {
      const props = entity.properties;
      
      // Categorize properties
      const systemProps: string[] = [];
      const softwareProps: string[] = [];
      const networkProps: string[] = [];
      const otherProps: string[] = [];
      
      Object.entries(props).forEach(([key, value]) => {
        const propLine = `**${key}:** ${JSON.stringify(value)}`;
        
        if (key.includes('OS') || key.includes('CPU') || key.includes('MEMORY') || key.includes('HARDWARE')) {
          systemProps.push(propLine);
        } else if (key.includes('SOFTWARE') || key.includes('VERSION') || key.includes('AGENT')) {
          softwareProps.push(propLine);
        } else if (key.includes('IP') || key.includes('NETWORK') || key.includes('PORT')) {
          networkProps.push(propLine);
        } else {
          otherProps.push(propLine);
        }
      });
      
      if (systemProps.length > 0) {
        propertiesText += `\n**System Properties:**\n   - ${systemProps.join('\n   - ')}`;
      }
      if (softwareProps.length > 0) {
        propertiesText += `\n**Software Properties:**\n   - ${softwareProps.join('\n   - ')}`;
      }
      if (networkProps.length > 0) {
        propertiesText += `\n**Network Properties:**\n   - ${networkProps.join('\n   - ')}`;
      }
      if (otherProps.length > 0) {
        propertiesText += `\n**Other Properties:**\n   - ${otherProps.join('\n   - ')}`;
      }
    } else {
      propertiesText = 'No properties available';
    }
    
    // Format relationships
    let fromRelationshipsText = '';
    if (entity.fromRelationships && Object.keys(entity.fromRelationships).length > 0) {
      Object.entries(entity.fromRelationships).forEach(([relType, entities]) => {
        fromRelationshipsText += `\n**${relType}** (${entities.length}):\n`;
        entities.slice(0, 10).forEach(relEntity => {
          fromRelationshipsText += `   - **${relEntity.type}** (\`${relEntity.id}\`)\n`;
        });
        if (entities.length > 10) {
          fromRelationshipsText += `   - ... and ${entities.length - 10} more\n`;
        }
      });
    } else {
      fromRelationshipsText = 'No incoming relationships';
    }
    
    let toRelationshipsText = '';
    if (entity.toRelationships && Object.keys(entity.toRelationships).length > 0) {
      Object.entries(entity.toRelationships).forEach(([relType, entities]) => {
        toRelationshipsText += `\n**${relType}** (${entities.length}):\n`;
        entities.slice(0, 10).forEach(relEntity => {
          toRelationshipsText += `   - **${relEntity.type}** (\`${relEntity.id}\`)\n`;
        });
        if (entities.length > 10) {
          toRelationshipsText += `   - ... and ${entities.length - 10} more\n`;
        }
      });
    } else {
      toRelationshipsText = 'No outgoing relationships';
    }
    
    // Format icon information
    const iconInfo = entity.icon ? {
      primary: entity.icon.primaryIconType || 'Default',
      secondary: entity.icon.secondaryIconType || 'None',
      custom: entity.icon.customIconPath || 'None'
    } : { primary: 'Default', secondary: 'None', custom: 'None' };

    return {
      content: [
        {
          type: 'text',
          text: `## Entity Details 🏗️\n\n` +
            `### Basic Information\n` +
            `**Display Name:** ${entity.displayName}\n` +
            `**Entity ID:** \`${entity.entityId}\`\n` +
            `**Type:** ${entity.type}\n` +
            `**First Seen:** ${firstSeenDate}\n` +
            `**Last Seen:** ${lastSeenDate}\n\n` +
            
            `### Visual Information\n` +
            `**Primary Icon:** ${iconInfo.primary}\n` +
            `**Secondary Icon:** ${iconInfo.secondary}\n` +
            `**Custom Icon Path:** ${iconInfo.custom}\n\n` +
            
            `### Management Zones\n` +
            `   - ${managementZones}\n\n` +
            
            `### Tags\n` +
            `   - ${tags}\n\n` +
            
            `### Properties\n` +
            `${propertiesText}\n\n` +
            
            `### Incoming Relationships\n` +
            `${fromRelationshipsText}\n\n` +
            
            `### Outgoing Relationships\n` +
            `${toRelationshipsText}\n\n` +
            
            `### Raw Entity Data\n` +
            `\`\`\`json\n` +
            `${JSON.stringify(entity, null, 2)}\n` +
            `\`\`\`\n\n` +
            
            `### Related Actions\n` +
            `• **List related entities:** Use entity relationships above with \`list_entities\`\n` +
            `• **Query metrics:** Use \`entitySelector: "entityId(\\"${entity.entityId}\\")"\` in metrics queries\n` +
            `• **Explore entity type:** Use \`get_entity_type\` with type \`"${entity.type}"\`\n` +
            `• **Management zone entities:** Use \`entitySelector: "mzName(\\"${entity.managementZones?.[0]?.name || 'zone-name'}\\")"\`\n\n` +
            
            `### Field Selection Examples\n` +
            `• **Add timestamps:** \`fields: "+lastSeenTms,+firstSeenTms"\`\n` +
            `• **Include properties:** \`fields: "+properties"\`\n` +
            `• **Include relationships:** \`fields: "+fromRelationships,+toRelationships"\`\n` +
            `• **Specific properties:** \`fields: "+properties.BITNESS,+properties.CPU_CORES"\`\n` +
            `• **Full details:** \`fields: "+lastSeenTms,+properties,+fromRelationships,+toRelationships"\``
        }
      ],
    };
  } catch (error) {
    console.error('Error getting entity:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found');
    
    return {
      content: [
        {
          type: 'text',
          text: `## Entity Retrieval Error ❌\n\n` +
            `**Error:** Failed to retrieve entity details\n` +
            `**Entity ID:** ${(request.params as any)?.arguments?.entityId || (request.params as any)?.entityId || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            
            `${isNotFound ? 
              `### Entity Not Found\n` +
              `The specified entity ID does not exist or is not accessible.\n\n` +
              `**Possible reasons:**\n` +
              `• The entity ID is incorrect or malformed\n` +
              `• The entity has been decommissioned or deleted\n` +
              `• The entity is outside the specified time range\n` +
              `• Your API token lacks the required permissions\n\n` +
              
              `**Entity ID Format Examples:**\n` +
              `• **Host:** \`HOST-1234567890ABCDEF\`\n` +
              `• **Application:** \`APPLICATION-1234567890ABCDEF\`\n` +
              `• **Service:** \`SERVICE-1234567890ABCDEF\`\n` +
              `• **Process Group:** \`PROCESS_GROUP-1234567890ABCDEF\`\n` +
              `• **Custom Device:** \`CUSTOM_DEVICE-1234567890ABCDEF\`\n\n` +
              
              `**Next Steps:**\n` +
              `• Use \`list_entities\` to find valid entity IDs\n` +
              `• Filter by entity type: \`entitySelector: "type(\\"HOST\\")"\`\n` +
              `• Search by name: \`entitySelector: "entityName.contains(\\"hostname\\")"\`\n` +
              `• Check recent entities: \`from: "now-1h"\``
              :
              `### Troubleshooting\n` +
              `• Verify your API token has the 'entities.read' scope\n` +
              `• Check if the entity ID format is correct\n` +
              `• Ensure the entity exists within the specified time range\n` +
              `• Verify network connectivity to the cluster\n` +
              `• Try using \`list_entities\` first to get valid entity IDs\n\n` +
              
              `### Valid Entity ID Formats\n` +
              `• Entity IDs are typically 16-character hexadecimal strings\n` +
              `• Format: \`{TYPE}-{16_HEX_CHARS}\`\n` +
              `• Example: \`HOST-1234567890ABCDEF\`\n` +
              `• Case-sensitive and must match exactly`
            }`
        }
      ],
      isError: true,
    };
  }
}
