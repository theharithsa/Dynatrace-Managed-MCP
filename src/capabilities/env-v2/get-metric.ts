import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { MetricDescriptor, MetricDescriptorSchema } from '../../types/metrics.js';

/**
 * Tool for getting a specific metric descriptor
 */
export const getMetricTool: Tool = {
  name: 'get_metric',
  description: 'Gets the descriptor of the specified metric by its key',
  inputSchema: {
    type: 'object',
    properties: {
      metricKey: {
        type: 'string',
        description: 'The key of the required metric. You can set additional transformation operators, separated by a colon (:).',
      },
    },
    required: ['metricKey'],
  },
};

/**
 * Handler for the get_metric tool
 */
export async function handleGetMetric(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const metricKey = requestParams?.arguments?.metricKey || requestParams?.metricKey;
    
    if (!metricKey) {
      throw new Error('Metric key is required');
    }

    // URL encode the metric key to handle special characters
    const encodedMetricKey = encodeURIComponent(metricKey);
    const response = await client.get<MetricDescriptor>(`/metrics/${encodedMetricKey}`);
    const metric = MetricDescriptorSchema.parse(response.data);

    const createdDate = metric.created ? new Date(metric.created).toISOString() : 'Unknown';
    const lastWrittenDate = metric.lastWritten ? new Date(metric.lastWritten).toISOString() : 'Unknown';
    const entityTypes = metric.entityType ? metric.entityType.join(', ') : 'N/A';
    const tags = metric.tags && metric.tags.length > 0 ? metric.tags.join(', ') : 'None';
    const aggregationTypes = metric.aggregationTypes ? metric.aggregationTypes.join(', ') : 'N/A';
    const transformations = metric.transformations ? metric.transformations.join(', ') : 'None';

    // Format dimension definitions
    const dimensionsInfo = metric.dimensionDefinitions ? 
      metric.dimensionDefinitions.map((dim, index) => 
        `**${index + 1}. ${dim.displayName}**\n` +
        `   - **Key:** ${dim.key}\n` +
        `   - **Type:** ${dim.type}\n` +
        `   - **Index:** ${dim.index}`
      ).join('\n') : 'No dimensions defined';

    // Format dimension cardinalities if available
    const cardinalitiesInfo = metric.dimensionCardinalities ?
      metric.dimensionCardinalities.map((card) =>
        `**${card.key}:** ${card.estimate} (${(card.relative * 100).toFixed(1)}%)`
      ).join('\n') : 'Not available';

    return {
      content: [
        {
          type: 'text',
          text: `## Metric Details 📊\n\n` +
            `### Basic Information\n` +
            `**Metric ID:** \`${metric.metricId}\`\n` +
            `**Display Name:** ${metric.displayName || 'N/A'}\n` +
            `**Description:** ${metric.description || 'No description available'}\n` +
            `**Unit:** ${metric.unit || 'N/A'}\n` +
            `**Created:** ${createdDate}\n` +
            `**Last Written:** ${lastWrittenDate}\n\n` +
            
            `### Properties\n` +
            `**Entity Types:** ${entityTypes}\n` +
            `**Tags:** ${tags}\n` +
            `**Billable:** ${metric.billable !== undefined ? (metric.billable ? 'Yes' : 'No') : 'Unknown'}\n` +
            `**DDU Billable:** ${metric.dduBillable !== undefined ? (metric.dduBillable ? 'Yes' : 'No') : 'Unknown'}\n` +
            `**Scalar:** ${metric.scalar !== undefined ? (metric.scalar ? 'Yes' : 'No') : 'Unknown'}\n` +
            `**Resolution Inf Supported:** ${metric.resolutionInfSupported !== undefined ? (metric.resolutionInfSupported ? 'Yes' : 'No') : 'Unknown'}\n` +
            `**Root Cause Relevant:** ${metric.rootCauseRelevant !== undefined ? (metric.rootCauseRelevant ? 'Yes' : 'No') : 'Unknown'}\n` +
            `**Impact Relevant:** ${metric.impactRelevant !== undefined ? (metric.impactRelevant ? 'Yes' : 'No') : 'Unknown'}\n\n` +
            
            `### Value Constraints\n` +
            `**Minimum Value:** ${metric.minimumValue !== undefined ? metric.minimumValue : 'No minimum'}\n` +
            `**Maximum Value:** ${metric.maximumValue !== undefined ? metric.maximumValue : 'No maximum'}\n` +
            `**Latency:** ${metric.latency !== undefined ? `${metric.latency} minutes` : 'N/A'}\n\n` +
            
            `### Metric Value Type\n` +
            `**Type:** ${metric.metricValueType?.type || 'Unknown'}\n\n` +
            
            `### Aggregation\n` +
            `**Available Types:** ${aggregationTypes}\n` +
            `**Default Aggregation:** ${metric.defaultAggregation?.type || 'N/A'}\n\n` +
            
            `### Dimensions\n` +
            `${dimensionsInfo}\n\n` +
            
            `### Dimension Cardinalities\n` +
            `${cardinalitiesInfo}\n\n` +
            
            `### Transformations\n` +
            `**Available:** ${transformations}\n\n` +
            
            `### Raw Data\n` +
            `\`\`\`json\n${JSON.stringify(metric, null, 2)}\n\`\`\`\n\n` +
            
            `### Related Actions\n` +
            `• **Query data points:** Use \`query_metrics\` with \`metricSelector: "${metric.metricId}"\`\n` +
            `• **Delete metric:** Use \`delete_metric\` with \`metricKey: "${metric.metricId}"\` (requires metrics.write scope)\n` +
            `• **Find similar metrics:** Use \`list_metrics\` with \`text: "${metric.displayName || 'search_term'}"\`\n` +
            `• **Entity-specific data:** Use \`query_metrics\` with appropriate \`entitySelector\``
        }
      ],
    };
  } catch (error) {
    console.error('Error getting metric:', error);
    
    let errorMessage = 'Unknown error occurred';
    let troubleshooting = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('404')) {
        troubleshooting = `• **Metric not found:** Verify the metric key "${request.params?.arguments?.metricKey || request.params?.metricKey}" is correct\n` +
                         `• **Case sensitivity:** Check that the metric key case matches exactly\n` +
                         `• **Special characters:** Ensure special characters in the metric key are properly escaped`;
      } else if (error.message.includes('400')) {
        troubleshooting = `• **Invalid metric key:** Check the metric key format\n` +
                         `• **Transformation syntax:** Verify any transformation operators are correct`;
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
          text: `## Metric Details Error ❌\n\n` +
            `**Error:** Failed to retrieve metric details\n` +
            `**Metric Key:** ${request.params?.arguments?.metricKey || request.params?.metricKey || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            troubleshooting
        }
      ],
      isError: true,
    };
  }
}
