import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { Unit, UnitSchema, UnitConversionResponse, UnitConversionResponseSchema, UnitConversionParams } from '../../types/metrics.js';

/**
 * Tool for getting unit details
 */
export const getUnitTool: Tool = {
  name: 'get_unit',
  description: 'Gets the properties of the specified unit by its ID',
  inputSchema: {
    type: 'object',
    properties: {
      unitId: {
        type: 'string',
        description: 'The ID of the required unit.',
      },
    },
    required: ['unitId'],
  },
};

/**
 * Tool for converting units
 */
export const convertUnitTool: Tool = {
  name: 'convert_unit',
  description: 'Converts a value from a source unit into a target unit',
  inputSchema: {
    type: 'object',
    properties: {
      unitId: {
        type: 'string',
        description: 'The ID of the source unit.',
      },
      value: {
        type: 'number',
        description: 'The value to be converted.',
      },
      targetUnit: {
        type: 'string',
        description: 'The ID of the target unit. If not set, finds an appropriate target unit automatically.',
      },
      numberFormat: {
        type: 'string',
        description: 'The preferred number format of the target value. Options: "binary" or "decimal". Only used if targetUnit is not set.',
        enum: ['binary', 'decimal'],
      },
    },
    required: ['unitId', 'value'],
  },
};

/**
 * Handler for the get_unit tool
 */
export async function handleGetUnit(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const unitId = requestParams?.arguments?.unitId || requestParams?.unitId;
    
    if (!unitId) {
      throw new Error('Unit ID is required');
    }

    const encodedUnitId = encodeURIComponent(unitId);
    const response = await client.get<Unit>(`/units/${encodedUnitId}`);
    const unit = UnitSchema.parse(response.data);

    return {
      content: [
        {
          type: 'text',
          text: `## Unit Details 📏\n\n` +
            `### Basic Information\n` +
            `**Unit ID:** \`${unit.unitId}\`\n` +
            `**Display Name:** ${unit.displayName || 'N/A'}\n` +
            `**Display Name (Plural):** ${unit.displayNamePlural || 'N/A'}\n` +
            `**Symbol:** ${unit.symbol || 'N/A'}\n` +
            `**Description:** ${unit.description || 'No description available'}\n\n` +
            
            `### Usage Examples\n` +
            `• **Convert values:** Use \`convert_unit\` with this unit as source\n` +
            `• **Find compatible units:** Use \`list_units\` with \`unitSelector: "compatibleTo(\\"${unit.unitId}\\")"\`\n` +
            `• **In metric queries:** This unit may appear in metric descriptors\n\n` +
            
            `### Conversion Examples\n` +
            `• **Convert 1000 ${unit.displayName || unit.unitId}:** \`convert_unit\` with \`value: 1000, unitId: "${unit.unitId}"\`\n` +
            `• **Auto-convert to appropriate unit:** Let the system choose the best target unit\n` +
            `• **Specific target conversion:** Specify a \`targetUnit\` for precise conversion\n\n` +
            
            `### Raw Data\n` +
            `\`\`\`json\n${JSON.stringify(unit, null, 2)}\n\`\`\``
        }
      ],
    };
  } catch (error) {
    console.error('Error getting unit:', error);
    
    let errorMessage = 'Unknown error occurred';
    let troubleshooting = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('404')) {
        troubleshooting = `• **Unit not found:** Verify the unit ID "${request.params?.arguments?.unitId || request.params?.unitId}" is correct\n` +
                         `• **Case sensitivity:** Check that the unit ID case matches exactly\n` +
                         `• **Use list_units:** Find available units and their correct IDs`;
      } else {
        troubleshooting = `• **API connectivity:** Check network connection to Dynatrace\n` +
                         `• **Authentication:** Verify your API token is valid\n` +
                         `• **Permissions:** Ensure your token has 'metrics.read' scope`;
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `## Unit Details Error ❌\n\n` +
            `**Error:** Failed to retrieve unit details\n` +
            `**Unit ID:** ${request.params?.arguments?.unitId || request.params?.unitId || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            troubleshooting
        }
      ],
      isError: true,
    };
  }
}

/**
 * Handler for the convert_unit tool
 */
export async function handleConvertUnit(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as UnitConversionParams;
    
    if (!params.unitId) {
      throw new Error('Source unit ID is required');
    }
    if (params.value === undefined || params.value === null) {
      throw new Error('Value is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('value', params.value.toString());
    
    if (params.targetUnit) {
      queryParams.append('targetUnit', params.targetUnit);
    }
    if (params.numberFormat) {
      queryParams.append('numberFormat', params.numberFormat);
    }

    const encodedUnitId = encodeURIComponent(params.unitId);
    const queryString = queryParams.toString();
    const endpoint = `/units/${encodedUnitId}/convert?${queryString}`;
    
    const response = await client.get<UnitConversionResponse>(endpoint);
    const conversion = UnitConversionResponseSchema.parse(response.data);

    // Calculate conversion ratio and other useful information
    const conversionRatio = params.value !== 0 ? conversion.resultValue / params.value : 0;
    const isUpScale = conversionRatio > 1;
    const isDownScale = conversionRatio < 1;
    const isEqualScale = Math.abs(conversionRatio - 1) < 0.0001;

    return {
      content: [
        {
          type: 'text',
          text: `## Unit Conversion Result 🔄\n\n` +
            `### Conversion Details\n` +
            `**Source Value:** ${params.value} ${params.unitId}\n` +
            `**Target Value:** ${conversion.resultValue} ${conversion.unitId}\n` +
            `**Source Unit:** ${params.unitId}\n` +
            `**Target Unit:** ${conversion.unitId}\n` +
            `**Conversion Ratio:** ${conversionRatio.toFixed(6)} (${isUpScale ? 'up-scale' : isDownScale ? 'down-scale' : 'equal'})\n\n` +
            
            `### Conversion Summary\n` +
            `\`${params.value} ${params.unitId} = ${conversion.resultValue} ${conversion.unitId}\`\n\n` +
            
            `### Additional Information\n` +
            `**Auto-selected Target:** ${params.targetUnit ? 'No (manual)' : 'Yes (automatic)'}\n` +
            `**Number Format:** ${params.numberFormat || 'Default'}\n` +
            `**Scale Direction:** ${isEqualScale ? 'No scaling (1:1)' : isUpScale ? `Up-scaling (×${conversionRatio.toFixed(2)})` : `Down-scaling (÷${(1/conversionRatio).toFixed(2)})`}\n\n` +
            
            `### Usage Examples\n` +
            `• **Reverse conversion:** \`convert_unit\` with \`unitId: "${conversion.unitId}", value: ${conversion.resultValue}, targetUnit: "${params.unitId}"\`\n` +
            `• **Batch conversion:** Apply ratio ${conversionRatio} to convert multiple values\n` +
            `• **Metric calculations:** Use in metric transformations or custom calculations\n\n` +
            
            `### Common Conversions from ${params.unitId}\n` +
            `Try converting to these compatible units:\n` +
            `• Use \`list_units\` with \`unitSelector: "compatibleTo(\\"${params.unitId}\\")"\` to find all compatible units\n` +
            `• Experiment with different number formats (binary/decimal) for size units\n\n` +
            
            `### Calculation Details\n` +
            `\`\`\`\n` +
            `Input: ${params.value} ${params.unitId}\n` +
            `Output: ${conversion.resultValue} ${conversion.unitId}\n` +
            `Ratio: ${params.value} × ${conversionRatio} = ${conversion.resultValue}\n` +
            `\`\`\``
        }
      ],
    };
  } catch (error) {
    console.error('Error converting unit:', error);
    
    let errorMessage = 'Unknown error occurred';
    let troubleshooting = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('404')) {
        troubleshooting = `• **Unit not found:** Verify source unit "${request.params?.arguments?.unitId || request.params?.unitId}" exists\n` +
                         `• **Target unit invalid:** Check if target unit "${request.params?.arguments?.targetUnit || request.params?.targetUnit}" is valid\n` +
                         `• **Incompatible units:** Source and target units may not be convertible\n` +
                         `• **Use list_units:** Find compatible units with \`unitSelector: "compatibleTo(\\"${request.params?.arguments?.unitId || request.params?.unitId}\\")"\``;
      } else if (error.message.includes('400')) {
        troubleshooting = `• **Invalid value:** Check that the value is a valid number\n` +
                         `• **Invalid format:** Verify numberFormat is "binary" or "decimal"\n` +
                         `• **Conversion error:** The units may not be compatible for conversion`;
      } else {
        troubleshooting = `• **API connectivity:** Check network connection to Dynatrace\n` +
                         `• **Authentication:** Verify your API token is valid\n` +
                         `• **Permissions:** Ensure your token has 'metrics.read' scope`;
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `## Unit Conversion Error ❌\n\n` +
            `**Error:** Failed to convert units\n` +
            `**Source Unit:** ${request.params?.arguments?.unitId || request.params?.unitId || 'Not provided'}\n` +
            `**Value:** ${request.params?.arguments?.value || request.params?.value || 'Not provided'}\n` +
            `**Target Unit:** ${request.params?.arguments?.targetUnit || request.params?.targetUnit || 'Auto-select'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            troubleshooting +
            `\n\n### Tips for Successful Conversion\n` +
            `• Check unit compatibility with \`list_units\`\n` +
            `• Verify unit IDs are correct (case-sensitive)\n` +
            `• Ensure the value is a valid number\n` +
            `• Try automatic target selection (omit targetUnit)\n` +
            `• Use proper number format for byte-based units`
        }
      ],
      isError: true,
    };
  }
}
