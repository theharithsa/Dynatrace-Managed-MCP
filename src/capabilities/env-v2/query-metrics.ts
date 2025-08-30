import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { MetricsQueryResponse, MetricsQueryResponseSchema, MetricsQueryParams } from '../../types/metrics.js';

/**
 * Tool for querying metric data points
 */
export const queryMetricsTool: Tool = {
  name: 'query_metrics',
  description: 'Gets data points of the specified metrics with filtering and aggregation options',
  inputSchema: {
    type: 'object',
    properties: {
      metricSelector: {
        type: 'string',
        description: 'Selects metrics for the query by their keys. You can select up to 10 metrics. Supports transformations and wildcards. Example: builtin:host.cpu.user',
      },
      resolution: {
        type: 'string',
        description: 'The desired resolution of data points. Can be a number (e.g., "120") or timespan (e.g., "10m", "1h"). Default is 120 data points.',
      },
      from: {
        type: 'string',
        description: 'The start of the requested timeframe. UTC milliseconds, human-readable format, or relative format like "now-2h". Default is "now-2h".',
      },
      to: {
        type: 'string',
        description: 'The end of the requested timeframe. UTC milliseconds, human-readable format, or relative format. Default is current timestamp.',
      },
      entitySelector: {
        type: 'string',
        description: 'Specifies the entity scope of the query. Example: type("HOST"), entityId("HOST-123"), tag("environment:prod")',
      },
      mzSelector: {
        type: 'string',
        description: 'The management zone scope of the query. Example: mzName("Production"), mzId(123)',
      },
    },
    required: ['metricSelector'],
  },
};

/**
 * Handler for the query_metrics tool
 */
export async function handleQueryMetrics(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const params = requestParams?.arguments || requestParams as MetricsQueryParams;
    
    if (!params.metricSelector) {
      throw new Error('metricSelector is required');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('metricSelector', params.metricSelector);
    
    if (params.resolution) {
      queryParams.append('resolution', params.resolution);
    }
    if (params.from) {
      queryParams.append('from', params.from);
    }
    if (params.to) {
      queryParams.append('to', params.to);
    }
    if (params.entitySelector) {
      queryParams.append('entitySelector', params.entitySelector);
    }
    if (params.mzSelector) {
      queryParams.append('mzSelector', params.mzSelector);
    }

    const queryString = queryParams.toString();
    const endpoint = `/metrics/query?${queryString}`;
    
    const response = await client.get<MetricsQueryResponse>(endpoint);
    const queryResult = MetricsQueryResponseSchema.parse(response.data);

    // Format the response for better readability
    let formattedResults = '';
    
    queryResult.result.forEach((metricResult, metricIndex) => {
      const dataPointCount = metricResult.data.reduce((sum, series) => sum + series.values.length, 0);
      const seriesCount = metricResult.data.length;
      
      formattedResults += `#### ${metricIndex + 1}. ${metricResult.metricId}\n`;
      formattedResults += `**Series Count:** ${seriesCount}\n`;
      formattedResults += `**Data Points:** ${dataPointCount}\n`;
      
      if (metricResult.dataPointCountRatio) {
        formattedResults += `**Data Point Ratio:** ${metricResult.dataPointCountRatio}\n`;
      }
      if (metricResult.dimensionCountRatio) {
        formattedResults += `**Dimension Ratio:** ${metricResult.dimensionCountRatio}\n`;
      }
      
      if (metricResult.warnings && metricResult.warnings.length > 0) {
        formattedResults += `**Warnings:** ${metricResult.warnings.join(', ')}\n`;
      }
      
      formattedResults += '\n**Data Series:**\n';
      
      if (metricResult.data.length === 0) {
        formattedResults += '*No data available for the specified timeframe and filters*\n';
      } else {
        metricResult.data.slice(0, 5).forEach((series, seriesIndex) => {
          const dimensionInfo = series.dimensionMap 
            ? Object.entries(series.dimensionMap).map(([key, value]) => `${key}=${value}`).join(', ')
            : series.dimensions?.join(', ') || 'No dimensions';
          
          const valueCount = series.values.length;
          const firstValue = valueCount > 0 ? series.values[0] : 'N/A';
          const lastValue = valueCount > 0 ? series.values[valueCount - 1] : 'N/A';
          const avgValue = valueCount > 0 ? (series.values.reduce((sum, val) => sum + val, 0) / valueCount).toFixed(2) : 'N/A';
          
          const firstTimestamp = series.timestamps.length > 0 && series.timestamps[0] !== undefined 
            ? new Date(series.timestamps[0]).toISOString() : 'N/A';
          const lastIndex = series.timestamps.length - 1;
          const lastTimestamp = series.timestamps.length > 0 && series.timestamps[lastIndex] !== undefined 
            ? new Date(series.timestamps[lastIndex]).toISOString() : 'N/A';
          
          formattedResults += `   **Series ${seriesIndex + 1}:**\n`;
          formattedResults += `   - **Dimensions:** ${dimensionInfo}\n`;
          formattedResults += `   - **Time Range:** ${firstTimestamp} → ${lastTimestamp}\n`;
          formattedResults += `   - **Values:** ${valueCount} points (First: ${firstValue}, Last: ${lastValue}, Avg: ${avgValue})\n`;
        });
        
        if (metricResult.data.length > 5) {
          formattedResults += `   *... and ${metricResult.data.length - 5} more series*\n`;
        }
      }
      
      formattedResults += '\n---\n\n';
    });

    // Format warnings if any
    const globalWarnings = queryResult.warnings && queryResult.warnings.length > 0 
      ? `\n### Global Warnings ⚠️\n${queryResult.warnings.map(w => `• ${w}`).join('\n')}\n` 
      : '';

    return {
      content: [
        {
          type: 'text',
          text: `## Metrics Query Results 📈\n\n` +
            `### Summary\n` +
            `**Total Metrics:** ${queryResult.totalCount}\n` +
            `**Returned Metrics:** ${queryResult.result.length}\n` +
            `**Resolution:** ${queryResult.resolution || 'Default'}\n` +
            `**Query:** \`${params.metricSelector}\`\n` +
            `${params.from ? `**From:** ${params.from}\n` : ''}` +
            `${params.to ? `**To:** ${params.to}\n` : ''}` +
            `${params.entitySelector ? `**Entity Selector:** ${params.entitySelector}\n` : ''}` +
            `${params.mzSelector ? `**Management Zone:** ${params.mzSelector}\n` : ''}` +
            `${queryResult.nextPageKey ? `**Next Page Available:** Yes\n` : ''}` +
            `\n` +
            
            `### Results\n` +
            formattedResults +
            
            globalWarnings +
            
            `### Data Limits\n` +
            `• **Maximum aggregated data points:** 1,000\n` +
            `• **Maximum series:** 1,000\n` +
            `• **Maximum data points per series:** 10,080\n` +
            `• **Overall data points limit:** 100,000\n\n` +
            
            `### Usage Examples\n` +
            `• **Single metric:** \`metricSelector: "builtin:host.cpu.user"\`\n` +
            `• **Multiple metrics:** \`metricSelector: "builtin:host.cpu.(user,idle,system)"\`\n` +
            `• **With entity filter:** \`entitySelector: "type(\\"HOST\\"),tag(\\"environment:prod\\")"\`\n` +
            `• **Time range:** \`from: "now-1h", to: "now"\`\n` +
            `• **Custom resolution:** \`resolution: "5m"\`\n\n` +
            
            `### Transformation Examples\n` +
            `• **Aggregation:** \`metricSelector: "builtin:host.cpu.user:avg"\`\n` +
            `• **Split by dimension:** \`metricSelector: "builtin:host.cpu.user:splitBy(\\"dt.entity.host\\")"\`\n` +
            `• **Filter:** \`metricSelector: "builtin:host.cpu.user:filter(gt(50))"\`\n` +
            `• **Rate calculation:** \`metricSelector: "builtin:host.disk.bytes.read:rate"\``
        }
      ],
    };
  } catch (error) {
    console.error('Error querying metrics:', error);
    
    let errorMessage = 'Unknown error occurred';
    let troubleshooting = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('400')) {
        troubleshooting = `• **Invalid selector:** Check the metricSelector syntax\n` +
                         `• **Invalid timeframe:** Verify the from/to parameters\n` +
                         `• **Invalid entity selector:** Check the entitySelector format\n` +
                         `• **Too many metrics:** Maximum 10 metrics per query`;
      } else if (error.message.includes('404')) {
        troubleshooting = `• **Metric not found:** Verify the metric key exists\n` +
                         `• **No data:** Check if the metric has data in the specified timeframe`;
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
          text: `## Metrics Query Error ❌\n\n` +
            `**Error:** Failed to query metrics\n` +
            `**Metric Selector:** ${request.params?.arguments?.metricSelector || request.params?.metricSelector || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            troubleshooting
        }
      ],
      isError: true,
    };
  }
}
