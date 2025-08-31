#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import all capabilities following SaaS pattern (39 tools total)
import { addComment } from './capabilities/add-comment.js';
import { addTags } from './capabilities/add-tags.js';
import { closeProblem } from './capabilities/close-problem.js';
import { createCustomDevice } from './capabilities/create-custom-device.js';
import { deleteComment } from './capabilities/delete-comment.js';
import { deleteMetric } from './capabilities/delete-metric.js';
import { deleteTags } from './capabilities/delete-tags.js';
import { findMonitoredEntityByName } from './capabilities/find-monitored-entity-by-name.js';
import { getAuditLog } from './capabilities/get-audit-log.js';
import { getComment } from './capabilities/get-comment.js';
import { getEntityType } from './capabilities/get-entity-type.js';
import { getEntity } from './capabilities/get-entity.js';
import { getEventProperty } from './capabilities/get-event-property.js';
import { getEventType } from './capabilities/get-event-type.js';
import { getEvent } from './capabilities/get-event.js';
import { getLogsForEntity } from './capabilities/get-logs-for-entity.js';
import { getMetric } from './capabilities/get-metric.js';
import { getMonitoredEntityDetails } from './capabilities/get-monitored-entity-details.js';
import { getProblemDetails } from './capabilities/get-problem-details.js';
import { getProblem } from './capabilities/get-problem.js';
import { getUnit } from './capabilities/get-unit.js';
import { getVulnerabilityDetails } from './capabilities/get-vulnerability-details.js';
import { ingestEvent } from './capabilities/ingest-event.js';
import { ingestMetrics } from './capabilities/ingest-metrics.js';
import { listAuditLogs } from './capabilities/list-audit-logs.js';
import { listComments } from './capabilities/list-comments.js';
import { listEntities } from './capabilities/list-entities.js';
import { listEntityTypes } from './capabilities/list-entity-types.js';
import { listEventProperties } from './capabilities/list-event-properties.js';
import { listEventTypes } from './capabilities/list-event-types.js';
import { listEvents } from './capabilities/list-events.js';
import { listMetrics } from './capabilities/list-metrics.js';
import { listMonitoringStates } from './capabilities/list-monitoring-states.js';
import { listProblems } from './capabilities/list-problems.js';
import { listTags } from './capabilities/list-tags.js';
import { listUnits } from './capabilities/list-units.js';
import { listVulnerabilities } from './capabilities/list-vulnerabilities.js';
import { queryMetrics } from './capabilities/query-metrics.js';
import { updateComment } from './capabilities/update-comment.js';

// Import environment configuration following SaaS pattern
import { getDynatraceEnv } from './getDynatraceEnv.js';

// Get environment configuration
const dtEnv = getDynatraceEnv();

// Create server
const server = new Server(
  {
    name: 'dynatrace-managed-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all tools following SaaS pattern (39 tools total)
const tools = [
  addComment.definition,
  addTags.definition,
  closeProblem.definition,
  createCustomDevice.definition,
  deleteComment.definition,
  deleteMetric.definition,
  deleteTags.definition,
  findMonitoredEntityByName.definition,
  getAuditLog.definition,
  getComment.definition,
  getEntityType.definition,
  getEntity.definition,
  getEventProperty.definition,
  getEventType.definition,
  getEvent.definition,
  getLogsForEntity.definition,
  getMetric.definition,
  getMonitoredEntityDetails.definition,
  getProblemDetails.definition,
  getProblem.definition,
  getUnit.definition,
  getVulnerabilityDetails.definition,
  ingestEvent.definition,
  ingestMetrics.definition,
  listAuditLogs.definition,
  listComments.definition,
  listEntities.definition,
  listEntityTypes.definition,
  listEventProperties.definition,
  listEventTypes.definition,
  listEvents.definition,
  listMetrics.definition,
  listMonitoringStates.definition,
  listProblems.definition,
  listTags.definition,
  listUnits.definition,
  listVulnerabilities.definition,
  queryMetrics.definition,
  updateComment.definition,
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Call tool handler following SaaS pattern
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'add_comment':
        return await addComment.handler(args, dtEnv);
      case 'add_tags':
        return await addTags.handler(args, dtEnv);
      case 'close_problem':
        return await closeProblem.handler(args, dtEnv);
      case 'create_custom_device':
        return await createCustomDevice.handler(args, dtEnv);
      case 'delete_comment':
        return await deleteComment.handler(args, dtEnv);
      case 'delete_metric':
        return await deleteMetric.handler(args, dtEnv);
      case 'delete_tags':
        return await deleteTags.handler(args, dtEnv);
      case 'find_monitored_entity_by_name':
        return await findMonitoredEntityByName.handler(args, dtEnv);
      case 'get_audit_log':
        return await getAuditLog.handler(args, dtEnv);
      case 'get_comment':
        return await getComment.handler(args, dtEnv);
      case 'get_entity_type':
        return await getEntityType.handler(args, dtEnv);
      case 'get_entity':
        return await getEntity.handler(args, dtEnv);
      case 'get_event_property':
        return await getEventProperty.handler(args, dtEnv);
      case 'get_event_type':
        return await getEventType.handler(args, dtEnv);
      case 'get_event':
        return await getEvent.handler(args, dtEnv);
      case 'get_logs_for_entity':
        return await getLogsForEntity.handler(args, dtEnv);
      case 'get_metric':
        return await getMetric.handler(args, dtEnv);
      case 'get_monitored_entity_details':
        return await getMonitoredEntityDetails.handler(args, dtEnv);
      case 'get_problem_details':
        return await getProblemDetails.handler(args, dtEnv);
      case 'get_problem':
        return await getProblem.handler(args, dtEnv);
      case 'get_unit':
        return await getUnit.handler(args, dtEnv);
      case 'get_vulnerability_details':
        return await getVulnerabilityDetails.handler(args, dtEnv);
      case 'ingest_event':
        return await ingestEvent.handler(args, dtEnv);
      case 'ingest_metrics':
        return await ingestMetrics.handler(args, dtEnv);
      case 'list_audit_logs':
        return await listAuditLogs.handler(args, dtEnv);
      case 'list_comments':
        return await listComments.handler(args, dtEnv);
      case 'list_entities':
        return await listEntities.handler(args, dtEnv);
      case 'list_entity_types':
        return await listEntityTypes.handler(args, dtEnv);
      case 'list_event_properties':
        return await listEventProperties.handler(args, dtEnv);
      case 'list_event_types':
        return await listEventTypes.handler(args, dtEnv);
      case 'list_events':
        return await listEvents.handler(args, dtEnv);
      case 'list_metrics':
        return await listMetrics.handler(args, dtEnv);
      case 'list_monitoring_states':
        return await listMonitoringStates.handler(args, dtEnv);
      case 'list_problems':
        return await listProblems.handler(args, dtEnv);
      case 'list_tags':
        return await listTags.handler(args, dtEnv);
      case 'list_units':
        return await listUnits.handler(args, dtEnv);
      case 'list_vulnerabilities':
        return await listVulnerabilities.handler(args, dtEnv);
      case 'query_metrics':
        return await queryMetrics.handler(args, dtEnv);
      case 'update_comment':
        return await updateComment.handler(args, dtEnv);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Error: ${error instanceof Error ? error.message : String(error)}` 
      }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Dynatrace Managed MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch(console.error);
