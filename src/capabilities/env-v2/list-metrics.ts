import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { MetricsListResponse, MetricsListResponseSchema, MetricsListQueryParams } from '../../types/metrics.js';

/**
 * Tool for listing available metrics
 */
export const listMetricsTool: Tool = {
  name: 'list_metrics',
  description: 'Lists all available metrics with optional filtering and pagination',
  inputSchema: {
    type: 'object',
    properties: {
      nextPageKey: {
        type: 'string',
        description: 'The cursor for the next page of results. You can find it in the nextPageKey field of the previous response.',
      },
      pageSize: {
        type: 'number',
        description: 'The amount of metric schemata in a single response payload. The maximal allowed page size is 500. If not set, 100 is used.',
        minimum: 1,
        maximum: 500,
      },
      metricSelector: {
        type: 'string',
        description: 'Selects metrics by their keys. Supports wildcards (*) and transformations. Example: builtin:host.cpu.(idle,user) or builtin:host.*',
      },
      text: {
        type: 'string',
        description: 'Metric registry search term. Only show metrics that contain the term in their key, display name, or description.',
      },
      fields: {
        type: 'string',
        description: 'Defines the list of metric properties included in the response. Use +field to add, -field to exclude. Example: +aggregationTypes,-description',
      },
      writtenSince: {
        type: 'string',
        description: 'Filters metrics to those that have data points within the specified timeframe. Use relative format like "now-1w" or absolute timestamps.',
      },
      metadataSelector: {
        type: 'string',
        description: 'The metadata scope of the query. Filter by unit, tags, dimensionKey, custom, or exported. Example: tags("feature","cloud"),unit("Percent")',
      },
    },
  },
};

/**
 * Handler for the list_metrics tool
 */
export async function handleListMetrics(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as MetricsListQueryParams;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.nextPageKey) {
      queryParams.append('nextPageKey', params.nextPageKey);
    }
    if (params.pageSize !== undefined) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params.metricSelector) {
      queryParams.append('metricSelector', params.metricSelector);
    }
    if (params.text) {
      queryParams.append('text', params.text);
    }
    if (params.fields) {
      queryParams.append('fields', params.fields);
    }
    if (params.writtenSince) {
      queryParams.append('writtenSince', params.writtenSince);
    }
    if (params.metadataSelector) {
      queryParams.append('metadataSelector', params.metadataSelector);
    }

    const queryString = queryParams.toString();
    const endpoint = `/metrics${queryString ? `?${queryString}` : ''}`;
    
    const response = await client.get<MetricsListResponse>(endpoint);
    const metrics = MetricsListResponseSchema.parse(response.data);

    // Format the response for better readability
    const formattedMetrics = metrics.metrics.map((metric, index) => {
      const createdDate = metric.created ? new Date(metric.created).toISOString() : 'Unknown';
      const lastWrittenDate = metric.lastWritten ? new Date(metric.lastWritten).toISOString() : 'Unknown';
      const entityTypes = metric.entityType ? metric.entityType.join(', ') : 'N/A';
      const tags = metric.tags && metric.tags.length > 0 ? metric.tags.join(', ') : 'None';
      const transformations = metric.transformations ? metric.transformations.slice(0, 5).join(', ') : 'None';
      
      return {
        index: index + 1,
        id: metric.metricId,
        displayName: metric.displayName || 'N/A',
        description: metric.description || 'No description available',
        unit: metric.unit || 'N/A',
        entityTypes,
        tags,
        created: createdDate,
        lastWritten: lastWrittenDate,
        transformations: transformations + (metric.transformations && metric.transformations.length > 5 ? '...' : ''),
        billable: metric.billable !== undefined ? (metric.billable ? 'Yes' : 'No') : 'Unknown',
        dimensionCount: metric.dimensionDefinitions ? metric.dimensionDefinitions.length : 0,
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: `## Metrics List 📊\n\n` +
            `### Summary\n` +
            `**Total Count:** ${metrics.totalCount}\n` +
            `**Returned:** ${metrics.metrics.length} metrics\n` +
            `${metrics.nextPageKey ? `**Next Page Available:** Yes (${metrics.nextPageKey.substring(0, 20)}...)\n` : '**Next Page Available:** No\n'}\n\n` +
            
            `### Metrics\n` +
            formattedMetrics.map((metric) => 
              `#### ${metric.index}. ${metric.displayName}\n` +
              `**ID:** \`${metric.id}\`\n` +
              `**Description:** ${metric.description}\n` +
              `**Unit:** ${metric.unit}\n` +
              `**Entity Types:** ${metric.entityTypes}\n` +
              `**Dimensions:** ${metric.dimensionCount}\n` +
              `**Billable:** ${metric.billable}\n` +
              `**Tags:** ${metric.tags}\n` +
              `**Created:** ${metric.created}\n` +
              `**Last Written:** ${metric.lastWritten}\n` +
              `**Transformations:** ${metric.transformations}\n` +
              `---`
            ).join('\n\n') +
            
            `\n\n### Navigation\n` +
            `${metrics.nextPageKey ? `🔄 **Next Page:** Use \`nextPageKey: "${metrics.nextPageKey}"\` to get more results\n` : '✅ **End of Results:** No more pages available\n'}` +
            
            `### Selector Examples\n` +
            `• **All host metrics:** \`metricSelector: "builtin:host.*"\`\n` +
            `• **CPU metrics:** \`metricSelector: "builtin:host.cpu.(idle,user,system)"\`\n` +
            `• **Custom metrics:** \`metricSelector: "ext:*"\`\n` +
            `• **Application metrics:** \`metricSelector: "builtin:apps.*"\`\n\n` +
            
            `### Text Search Examples\n` +
            `• **Search by term:** \`text: "cpu"\`\n` +
            `• **Search by description:** \`text: "memory"\`\n` +
            `• **Search applications:** \`text: "application"\`\n\n` +
            
            `### Metadata Filter Examples\n` +
            `• **By unit:** \`metadataSelector: "unit(\\"Percent\\",\\"MegaByte\\")"\`\n` +
            `• **By tags:** \`metadataSelector: "tags(\\"feature\\",\\"cloud\\")"\`\n` +
            `• **Custom metrics only:** \`metadataSelector: "custom(\\"true\\")"\`\n` +
            `• **By dimension:** \`metadataSelector: "dimensionKey(\\"dt.entity.host\\")"\`\n\n` +
            
            `### Usage Tips\n` +
            `• Use \`fields: "+aggregationTypes,-description"\` to customize response fields\n` +
            `• Use \`writtenSince: "now-1w"\` to find recently active metrics\n` +
            `• Combine selectors: \`metricSelector: "builtin:host.*", metadataSelector: "unit(\\"Percent\\")"\``
        }
      ],
    };
  } catch (error) {
    console.error('Error listing metrics:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `## Metrics List Error ❌\n\n` +
            `**Error:** Failed to retrieve metrics list\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            `• Verify your API token has the 'metrics.read' scope\n` +
            `• Check if the metricSelector syntax is correct\n` +
            `• Ensure the pageSize is within limits (1-500)\n` +
            `• Verify the fields parameter format if used\n` +
            `• Check network connectivity to the cluster`
        }
      ],
      isError: true,
    };
  }
}
