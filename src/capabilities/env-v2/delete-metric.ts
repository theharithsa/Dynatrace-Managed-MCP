import { CallToolRequest, Tool } from '@modelcontextprotocol/sdk/types.js';
import { DynatraceManagedClient } from '../../authentication/dynatrace-managed-client.js';

/**
 * Tool for deleting a metric
 */
export const deleteMetricTool: Tool = {
  name: 'delete_metric',
  description: 'Deletes the specified metric. Deletion cannot be undone! You cannot delete a metric if it has data points ingested within the last two hours.',
  inputSchema: {
    type: 'object',
    properties: {
      metricKey: {
        type: 'string',
        description: 'The key of the metric to delete.',
      },
    },
    required: ['metricKey'],
  },
};

/**
 * Handler for the delete_metric tool
 */
export async function handleDeleteMetric(
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
    
    // Perform the deletion
    const response = await client.delete(`/metrics/${encodedMetricKey}`);

    // Check response status
    if (response.status === 202) {
      return {
        content: [
          {
            type: 'text',
            text: `## Metric Deletion Initiated ✅\n\n` +
              `### Summary\n` +
              `**Metric Key:** \`${metricKey}\`\n` +
              `**Status:** Deletion triggered successfully\n` +
              `**Response Code:** 202 (Accepted)\n\n` +
              
              `### Important Information\n` +
              `⚠️ **Deletion cannot be undone!**\n` +
              `• The deletion process has been initiated in the background\n` +
              `• It may take a few minutes for the metric to be completely removed\n` +
              `• All historical data for this metric will be permanently deleted\n` +
              `• Any dashboards or alerts using this metric will be affected\n\n` +
              
              `### Next Steps\n` +
              `• Verify that the metric is no longer needed\n` +
              `• Update any dashboards or alerts that reference this metric\n` +
              `• Monitor for any dependent systems that might be affected\n` +
              `• Check that the metric no longer appears in the metrics list\n\n` +
              
              `### Verification\n` +
              `You can verify the deletion by:\n` +
              `• Using \`list_metrics\` to check if the metric still exists\n` +
              `• Using \`get_metric\` with the metric key (should return 404 after deletion)\n` +
              `• Checking your dashboards and alerts for broken references\n\n` +
              
              `### Constraints\n` +
              `• Metrics with data points in the last 2 hours cannot be deleted\n` +
              `• System metrics (builtin:*) cannot be deleted\n` +
              `• Only custom metrics (ext:*, calc:*, func:*) can be deleted`
          }
        ],
      };
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting metric:', error);
    
    let errorMessage = 'Unknown error occurred';
    let troubleshooting = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('400')) {
        troubleshooting = `• **Recent data points:** The metric has been written within the last two hours\n` +
                         `• **Wait period:** Wait at least 2 hours after the last data ingestion\n` +
                         `• **System metric:** Built-in metrics cannot be deleted\n` +
                         `• **Invalid format:** Check the metric key format`;
      } else if (error.message.includes('404')) {
        troubleshooting = `• **Metric not found:** Verify the metric key "${request.params?.arguments?.metricKey || request.params?.metricKey}" exists\n` +
                         `• **Already deleted:** The metric may have been deleted already\n` +
                         `• **Case sensitivity:** Ensure the metric key case matches exactly\n` +
                         `• **Use list_metrics:** Search for the metric to confirm its existence`;
      } else if (error.message.includes('500')) {
        troubleshooting = `• **Dimension deletion failed:** The metric dimensions could not be deleted\n` +
                         `• **Internal error:** Contact Dynatrace support if this persists\n` +
                         `• **Retry:** Try the deletion again after a few minutes`;
      } else {
        troubleshooting = `• **API connectivity:** Check network connection to Dynatrace\n` +
                         `• **Authentication:** Verify your API token is valid\n` +
                         `• **Permissions:** Ensure your token has 'metrics.write' scope\n` +
                         `• **Rate limits:** Check if you're hitting API rate limits`;
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `## Metric Deletion Error ❌\n\n` +
            `**Error:** Failed to delete metric\n` +
            `**Metric Key:** ${request.params?.arguments?.metricKey || request.params?.metricKey || 'Not provided'}\n` +
            `**Details:** ${errorMessage}\n\n` +
            `### Troubleshooting\n` +
            troubleshooting +
            `\n\n### Pre-deletion Checklist\n` +
            `• ✅ Confirm the metric key is correct\n` +
            `• ✅ Ensure no data has been written in the last 2 hours\n` +
            `• ✅ Verify it's a custom metric (not builtin:*)\n` +
            `• ✅ Check that your API token has metrics.write scope\n` +
            `• ✅ Backup any important historical data if needed\n\n` +
            
            `### Alternative Actions\n` +
            `• **Wait and retry:** If recent data exists, wait 2+ hours and try again\n` +
            `• **Check metric details:** Use \`get_metric\` to see last written time\n` +
            `• **List metrics:** Use \`list_metrics\` to find the exact metric key\n` +
            `• **Stop ingestion:** Ensure no processes are actively writing to this metric`
        }
      ],
      isError: true,
    };
  }
}
