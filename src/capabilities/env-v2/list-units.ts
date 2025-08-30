import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { UnitsListResponse, UnitsListResponseSchema, UnitsListQueryParams } from '../../types/metrics.js';

/**
 * Tool for listing available units
 */
export const listUnitsTool: Tool = {
  name: 'list_units',
  description: 'Lists all available units with optional filtering',
  inputSchema: {
    type: 'object',
    properties: {
      unitSelector: {
        type: 'string',
        description: 'Selects units to be included. Available criteria: compatibleTo("unit","display-format"). Example: compatibleTo("BytePerSecond","binary")',
      },
      fields: {
        type: 'string',
        description: 'Defines properties to include. Use +field to add, -field to exclude. Available: displayName, symbol, description. Example: +description,-symbol',
      },
    },
  },
};

/**
 * Handler for the list_units tool
 */
export async function handleListUnits(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as UnitsListQueryParams;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.unitSelector) {
      queryParams.append('unitSelector', params.unitSelector);
    }
    if (params.fields) {
      queryParams.append('fields', params.fields);
    }

    const queryString = queryParams.toString();
    const endpoint = `/units${queryString ? `?${queryString}` : ''}`;
    
    const response = await client.get<UnitsListResponse>(endpoint);
    const units = UnitsListResponseSchema.parse(response.data);

    // Group units by category for better organization
    const categorizedUnits = new Map<string, typeof units.units>();
    
    units.units.forEach(unit => {
      // Categorize based on unit type
      let category = 'Other';
      const unitId = unit.unitId.toLowerCase();
      
      if (unitId.includes('byte') || unitId.includes('bit')) {
        category = 'Data Size';
      } else if (unitId.includes('second') || unitId.includes('minute') || unitId.includes('hour')) {
        category = 'Time';
      } else if (unitId.includes('per')) {
        category = 'Rate/Ratio';
      } else if (unitId.includes('percent')) {
        category = 'Percentage';
      } else if (unitId.includes('count') || unitId.includes('number')) {
        category = 'Count';
      }
      
      if (!categorizedUnits.has(category)) {
        categorizedUnits.set(category, []);
      }
      categorizedUnits.get(category)!.push(unit);
    });

    // Format the response
    let formattedUnits = '';
    
    Array.from(categorizedUnits.entries()).forEach(([category, categoryUnits]) => {
      formattedUnits += `#### ${category}\n`;
      categoryUnits.forEach((unit, index) => {
        formattedUnits += `**${index + 1}. ${unit.displayName || unit.unitId}**\n`;
        formattedUnits += `   - **ID:** \`${unit.unitId}\`\n`;
        if (unit.symbol) {
          formattedUnits += `   - **Symbol:** ${unit.symbol}\n`;
        }
        if (unit.description) {
          formattedUnits += `   - **Description:** ${unit.description}\n`;
        }
        if (unit.displayNamePlural) {
          formattedUnits += `   - **Plural:** ${unit.displayNamePlural}\n`;
        }
      });
      formattedUnits += '\n';
    });

    return {
      content: [
        {
          type: 'text',
          text: `## Available Units 📏\n\n` +
            `### Summary\n` +
            `**Total Units:** ${units.totalCount}\n` +
            `**Categories:** ${categorizedUnits.size}\n` +
            `${params.unitSelector ? `**Filter Applied:** ${params.unitSelector}\n` : ''}` +
            `${params.fields ? `**Custom Fields:** ${params.fields}\n` : ''}` +
            `\n` +
            
            `### Units by Category\n` +
            formattedUnits +
            
            `### Unit Selector Examples\n` +
            `• **Compatible with bytes:** \`unitSelector: "compatibleTo(\\"Byte\\")"\`\n` +
            `• **Compatible with time:** \`unitSelector: "compatibleTo(\\"Second\\")"\`\n` +
            `• **Binary format:** \`unitSelector: "compatibleTo(\\"Byte\\",\\"binary\\")"\`\n` +
            `• **Decimal format:** \`unitSelector: "compatibleTo(\\"Byte\\",\\"decimal\\")"\`\n\n` +
            
            `### Fields Examples\n` +
            `• **Add description:** \`fields: "+description"\`\n` +
            `• **Remove symbol:** \`fields: "-symbol"\`\n` +
            `• **ID only:** \`fields: "unitId"\`\n` +
            `• **Custom combination:** \`fields: "+description,-symbol"\`\n\n` +
            
            `### Usage Examples\n` +
            `• **Get unit details:** Use \`get_unit\` with specific \`unitId\`\n` +
            `• **Convert values:** Use \`convert_unit\` to convert between compatible units\n` +
            `• **Find compatible units:** Use \`unitSelector\` to find units that can be converted\n\n` +
            
            `### Common Unit IDs\n` +
            `• **Time:** Second, Minute, Hour, Day, Week\n` +
            `• **Data Size:** Byte, KiloByte, MegaByte, GigaByte\n` +
            `• **Rate:** BytePerSecond, RequestPerSecond\n` +
            `• **Percentage:** Percent, Ratio\n` +
            `• **Count:** Count, Number`
        }
      ],
    };
  } catch (error) {
    console.error('Error listing units:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `## Units List Error ❌\n\n` +
            `**Error:** Failed to retrieve units list\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            `• Verify your API token has the 'metrics.read' scope\n` +
            `• Check if the unitSelector syntax is correct\n` +
            `• Verify the fields parameter format if used\n` +
            `• Check network connectivity to the cluster\n\n` +
            
            `### Valid Unit Selector Format\n` +
            `• \`compatibleTo("unitId")\` - Find compatible units\n` +
            `• \`compatibleTo("unitId","format")\` - Find compatible units with specific format\n` +
            `• Format can be "binary" or "decimal" for byte-based units`
        }
      ],
      isError: true,
    };
  }
}
