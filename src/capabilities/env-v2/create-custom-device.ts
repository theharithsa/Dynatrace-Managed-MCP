import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { CustomDeviceCreationResponse, CustomDeviceCreationResponseSchema, CreateCustomDeviceRequest } from '../../types/entities.js';

/**
 * Tool for creating custom devices
 */
export const createCustomDeviceTool: Tool = {
  name: 'create_custom_device',
  description: 'Creates a new custom device entity in Dynatrace for monitoring external systems',
  inputSchema: {
    type: 'object',
    properties: {
      customDeviceId: {
        type: 'string',
        description: 'The unique identifier of the custom device. Must be unique within the environment.',
      },
      displayName: {
        type: 'string',
        description: 'The display name of the custom device.',
      },
      ipAddresses: {
        type: 'array',
        items: { type: 'string' },
        description: 'The list of IP addresses associated with the custom device.',
      },
      listenPorts: {
        type: 'array',
        items: { type: 'number' },
        description: 'The list of ports the custom device listens on.',
      },
      type: {
        type: 'string',
        description: 'The technology type of the custom device (e.g., "apache", "nginx", "database").',
      },
      favicon: {
        type: 'string',
        description: 'Base64 encoded favicon for the custom device (optional).',
      },
      configUrl: {
        type: 'string',
        description: 'The configuration URL of the custom device (optional).',
      },
      properties: {
        type: 'object',
        description: 'Custom properties as key-value pairs (optional).',
        additionalProperties: { type: 'string' },
      },
      tags: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            value: { type: 'string' },
          },
          required: ['key'],
        },
        description: 'Tags to assign to the custom device (optional).',
      },
    },
    required: ['customDeviceId', 'displayName'],
  },
};

/**
 * Handler for the create_custom_device tool
 */
export async function handleCreateCustomDevice(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as CreateCustomDeviceRequest;
    
    if (!params.customDeviceId || !params.displayName) {
      throw new Error('customDeviceId and displayName are required parameters');
    }

    // Build the custom device payload
    const customDevicePayload: any = {
      customDeviceId: params.customDeviceId,
      displayName: params.displayName,
    };

    // Add optional fields if provided
    if (params.ipAddresses && params.ipAddresses.length > 0) {
      customDevicePayload.ipAddresses = params.ipAddresses;
    }
    
    if (params.listenPorts && params.listenPorts.length > 0) {
      customDevicePayload.listenPorts = params.listenPorts;
    }
    
    if (params.type) {
      customDevicePayload.type = params.type;
    }
    
    if (params.favicon) {
      customDevicePayload.favicon = params.favicon;
    }
    
    if (params.configUrl) {
      customDevicePayload.configUrl = params.configUrl;
    }
    
    if (params.properties && Object.keys(params.properties).length > 0) {
      customDevicePayload.properties = params.properties;
    }
    
    if (params.tags && params.tags.length > 0) {
      customDevicePayload.tags = params.tags;
    }

    const endpoint = '/entities/custom';
    
    const response = await client.post<CustomDeviceCreationResponse>(endpoint, customDevicePayload);
    const creationResponse = CustomDeviceCreationResponseSchema.parse(response.data);

    // Format the response for better readability
    const ipAddressList = params.ipAddresses && params.ipAddresses.length > 0 ? 
      params.ipAddresses.join(', ') : 'None specified';
    
    const portsList = params.listenPorts && params.listenPorts.length > 0 ? 
      params.listenPorts.join(', ') : 'None specified';
    
    const tagsList = params.tags && params.tags.length > 0 ? 
      params.tags.map((tag: { key: string; value?: string }) => {
        let tagStr = `**${tag.key}**`;
        if (tag.value) tagStr += ` = ${tag.value}`;
        return tagStr;
      }).join('\n   - ') : 'No tags assigned';
    
    const propertiesList = params.properties && Object.keys(params.properties).length > 0 ? 
      Object.entries(params.properties).map(([key, value]) => 
        `**${key}:** ${value}`
      ).join('\n   - ') : 'No custom properties';

    return {
      content: [
        {
          type: 'text',
          text: `## Custom Device Created Successfully ✅\n\n` +
            `### Device Information\n` +
            `**Display Name:** ${params.displayName}\n` +
            `**Custom Device ID:** \`${params.customDeviceId}\`\n` +
            `**Entity ID:** \`${creationResponse.entityId}\`\n` +
            `**Type:** ${params.type || 'Generic'}\n` +
            `**Status:** Device created and ready for monitoring\n` +
            `${creationResponse.groupId ? `**Group ID:** \`${creationResponse.groupId}\`\n` : ''}` +
            `\n` +
            
            `### Network Configuration\n` +
            `**IP Addresses:** ${ipAddressList}\n` +
            `**Listen Ports:** ${portsList}\n` +
            `**Config URL:** ${params.configUrl || 'Not specified'}\n\n` +
            
            `### Tags\n` +
            `   - ${tagsList}\n\n` +
            
            `### Custom Properties\n` +
            `   - ${propertiesList}\n\n` +
            
            `### Visual Information\n` +
            `**Favicon:** ${params.favicon ? 'Custom favicon provided' : 'Using default icon'}\n\n` +
            
            `### Raw Response Data\n` +
            `\`\`\`json\n` +
            `${JSON.stringify(creationResponse, null, 2)}\n` +
            `\`\`\`\n\n` +
            
            `### Next Steps\n` +
            `• **View device:** Use \`get_entity\` with entity ID \`"${creationResponse.entityId}"\`\n` +
            `• **Monitor metrics:** Send custom metrics to this device using the entity ID\n` +
            `• **Query device:** Use \`entitySelector: "entityId(\\"${creationResponse.entityId}\\")"\` in entity queries\n` +
            `• **Update device:** Modify the device by calling this endpoint again with the same customDeviceId\n\n` +
            
            `### Metric Integration\n` +
            `Use the entity ID \`${creationResponse.entityId}\` when sending custom metrics:\n` +
            `\`\`\`bash\n` +
            `curl -X POST "https://your-cluster/e/your-env/api/v2/metrics/ingest" \\\n` +
            `  -H "Authorization: Api-Token your-token" \\\n` +
            `  -H "Content-Type: text/plain" \\\n` +
            `  --data 'custom.metric,dt.entity.custom_device="${creationResponse.entityId}" 42'\n` +
            `\`\`\`\n\n` +
            
            `### Management Tips\n` +
            `• **Unique ID:** The customDeviceId must be unique within your environment\n` +
            `• **Updates:** Re-POST with the same customDeviceId to update the device\n` +
            `• **Deletion:** Custom devices can be removed through the UI or API\n` +
            `• **Monitoring:** Device will appear in entity lists and can receive custom metrics\n` +
            `• **Relationships:** Device can be linked to other entities through metrics and tags`
        }
      ],
    };
  } catch (error) {
    console.error('Error creating custom device:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isDuplicate = errorMessage.includes('409') || errorMessage.includes('already exists') || errorMessage.includes('duplicate');
    const isBadRequest = errorMessage.includes('400') || errorMessage.includes('Bad Request');
    
    return {
      content: [
        {
          type: 'text',
          text: `## Custom Device Creation Failed ❌\n\n` +
            `**Error:** Failed to create custom device\n` +
            `**Device ID:** ${(request.params as any)?.arguments?.customDeviceId || (request.params as any)?.customDeviceId || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            
            `${isDuplicate ? 
              `### Duplicate Device ID\n` +
              `A custom device with this ID already exists in your environment.\n\n` +
              `**Resolution Options:**\n` +
              `• Use a different \`customDeviceId\` (must be unique)\n` +
              `• Update the existing device by re-POSTing with new data\n` +
              `• Check existing devices with \`list_entities\` filter: \`type("CUSTOM_DEVICE")\`\n` +
              `• View the existing device with \`get_entity\` using the entity ID\n\n` +
              
              `**Custom Device ID Guidelines:**\n` +
              `• Must be unique within the environment\n` +
              `• Can contain letters, numbers, hyphens, underscores\n` +
              `• Should be descriptive and meaningful\n` +
              `• Examples: \`web-server-prod-01\`, \`database_cluster_main\`, \`load-balancer-east\``
              :
              isBadRequest ?
              `### Invalid Request Data\n` +
              `The request contains invalid or malformed data.\n\n` +
              `**Common Issues:**\n` +
              `• **customDeviceId:** Must be a valid string, no special characters except hyphens and underscores\n` +
              `• **displayName:** Must be a non-empty string\n` +
              `• **ipAddresses:** Must be valid IP address strings (IPv4 or IPv6)\n` +
              `• **listenPorts:** Must be valid port numbers (1-65535)\n` +
              `• **type:** Should be a valid technology type string\n` +
              `• **tags:** Must have 'key' field, 'value' is optional\n` +
              `• **properties:** Must be string key-value pairs\n\n` +
              
              `**Validation Examples:**\n` +
              `• **Good ID:** \`web-server-01\`, \`db_cluster_main\`\n` +
              `• **Bad ID:** \`web server 01\`, \`db#cluster@main\`\n` +
              `• **Good IP:** \`192.168.1.100\`, \`2001:db8::1\`\n` +
              `• **Bad IP:** \`192.168.1.999\`, \`invalid-ip\`\n` +
              `• **Good Port:** \`80\`, \`8080\`, \`443\`\n` +
              `• **Bad Port:** \`99999\`, \`-1\`, \`port80\``
              :
              `### Troubleshooting\n` +
              `• Verify your API token has the 'entities.write' scope\n` +
              `• Check if the customDeviceId format is valid\n` +
              `• Ensure IP addresses are properly formatted\n` +
              `• Verify port numbers are within valid range (1-65535)\n` +
              `• Check network connectivity to the cluster\n` +
              `• Validate JSON payload format\n\n` +
              
              `### Required Fields\n` +
              `• **customDeviceId:** Unique identifier for the device\n` +
              `• **displayName:** Human-readable name for the device\n\n` +
              
              `### Optional Fields\n` +
              `• **ipAddresses:** Array of IP address strings\n` +
              `• **listenPorts:** Array of port numbers\n` +
              `• **type:** Technology type (e.g., "apache", "nginx")\n` +
              `• **favicon:** Base64 encoded icon\n` +
              `• **configUrl:** Configuration URL\n` +
              `• **properties:** Custom key-value properties\n` +
              `• **tags:** Array of tag objects with key/value pairs`
            }`
        }
      ],
      isError: true,
    };
  }
}
