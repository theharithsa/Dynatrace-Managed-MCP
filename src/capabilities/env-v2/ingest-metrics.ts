import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';
import { MetricIngestionResponse, MetricIngestionResponseSchema } from '../../types/metrics.js';

/**
 * Tool for ingesting metric data points
 */
export const ingestMetricsTool: Tool = {
  name: 'ingest_metrics',
  description: 'Pushes metric data points to Dynatrace using line protocol format',
  inputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'string',
        description: 'Data points in line protocol format. Each line represents a single data point. Format: metric_name,tag1=value1,tag2=value2 field_value [timestamp]',
      },
    },
    required: ['data'],
  },
};

/**
 * Handler for the ingest_metrics tool
 */
export async function handleIngestMetrics(
  request: CallToolRequest,
  client: DynatraceManagedClient
): Promise<any> {
  try {
    const requestParams = request.params as any;
    const data = requestParams?.arguments?.data || requestParams?.data;
    
    if (!data) {
      throw new Error('Metric data is required');
    }

    const response = await client.post<MetricIngestionResponse>('/metrics/ingest', data, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    
    const ingestionResult = MetricIngestionResponseSchema.parse(response.data);

    // Parse the data to get some statistics
    const lines = data.split('\n').filter((line: string) => line.trim().length > 0);
    const totalLines = lines.length;

    // Format invalid lines if any
    const invalidLinesInfo = ingestionResult.error?.invalidLines ? 
      ingestionResult.error.invalidLines.map(invalid => 
        `**Line ${invalid.line + 1}:** ${invalid.error}`
      ).join('\n') : 'None';

    // Format warnings if any
    const warningsInfo = ingestionResult.warnings?.changedMetricKeys ?
      ingestionResult.warnings.changedMetricKeys.map(warning =>
        `**Line ${warning.line + 1}:** ${warning.warning}`
      ).join('\n') : 'None';

    const successRate = totalLines > 0 ? ((ingestionResult.linesOk / totalLines) * 100).toFixed(1) : '0';

    return {
      content: [
        {
          type: 'text',
          text: `## Metric Ingestion Results 📊\n\n` +
            `### Summary\n` +
            `**Total Lines:** ${totalLines}\n` +
            `**Lines OK:** ${ingestionResult.linesOk} ✅\n` +
            `**Lines Invalid:** ${ingestionResult.linesInvalid} ❌\n` +
            `**Success Rate:** ${successRate}%\n` +
            `**Status:** ${ingestionResult.linesInvalid === 0 ? '✅ All data ingested successfully' : '⚠️ Some data points were invalid'}\n\n` +
            
            `### Invalid Lines\n` +
            `${invalidLinesInfo}\n\n` +
            
            `### Warnings\n` +
            `${warningsInfo}\n` +
            `${ingestionResult.warnings?.message ? `**General Warning:** ${ingestionResult.warnings.message}\n` : ''}` +
            `\n` +
            
            `### Data Processing\n` +
            `• Valid data points are accepted and processed in the background\n` +
            `• Processing may take a few minutes before data appears in queries\n` +
            `• Invalid lines are rejected but don't affect valid data points\n\n` +
            
            `### Line Protocol Format\n` +
            `\`\`\`\n` +
            `metric_name,tag1=value1,tag2=value2 field_value [timestamp]\n` +
            `\`\`\`\n\n` +
            
            `### Examples\n` +
            `\`\`\`\n` +
            `# Simple metric with current timestamp\n` +
            `server.cpu.temperature,cpu.id=0 42\n\n` +
            `# Metric with multiple tags and specific timestamp\n` +
            `server.memory.usage,host=server1,region=us-east 75.5 1609459200000\n\n` +
            `# Custom metric with dimensions\n` +
            `ext:custom.metric,env=prod,service=api response_time=250.5\n` +
            `\`\`\`\n\n` +
            
            `### Best Practices\n` +
            `• Use meaningful metric names with proper namespacing\n` +
            `• Include relevant tags for filtering and grouping\n` +
            `• Provide timestamps when possible (Unix milliseconds)\n` +
            `• Keep metric names consistent across ingestions\n` +
            `• Validate data format before ingestion\n\n` +
            
            `### Limits\n` +
            `• Maximum payload size: 1 MB\n` +
            `• Maximum 1000 metric lines per request\n` +
            `• Metric names must follow Dynatrace naming conventions\n` +
            `• Tag values are case-sensitive`
        }
      ],
    };
  } catch (error) {
    console.error('Error ingesting metrics:', error);
    
    let errorMessage = 'Unknown error occurred';
    let troubleshooting = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('400')) {
        troubleshooting = `• **Invalid data format:** Check line protocol syntax\n` +
                         `• **Payload too large:** Reduce the amount of data or split into smaller batches\n` +
                         `• **Invalid metric names:** Ensure metric names follow naming conventions\n` +
                         `• **Invalid timestamp:** Check timestamp format (Unix milliseconds)`;
      } else if (error.message.includes('413')) {
        troubleshooting = `• **Payload too large:** The request exceeds the maximum size limit\n` +
                         `• **Too many lines:** Split the data into smaller batches`;
      } else {
        troubleshooting = `• **API connectivity:** Check network connection to Dynatrace\n` +
                         `• **Authentication:** Verify your API token is valid\n` +
                         `• **Permissions:** Ensure your token has 'metrics.ingest' scope`;
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `## Metric Ingestion Error ❌\n\n` +
            `**Error:** Failed to ingest metrics\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            troubleshooting +
            `\n\n### Data Validation\n` +
            `• Verify line protocol format: \`metric_name,tag=value field_value [timestamp]\`\n` +
            `• Check for special characters in metric names and tag values\n` +
            `• Ensure numeric values are properly formatted\n` +
            `• Validate timestamp format (Unix milliseconds)`
        }
      ],
      isError: true,
    };
  }
}
