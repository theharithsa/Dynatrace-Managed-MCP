#!/usr/bin/env node

// OpenTelemetry MCP Instrumentation - Auto Registration
import '@theharithsa/opentelemetry-instrumentation-mcp/register';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { config } from 'dotenv';
import { Command } from 'commander';
import { randomUUID } from 'node:crypto';

// Initialize CLI program
const program = new Command();

// Load environment variables from .env file if available
// Suppress warnings/logging to stdio as it breaks MCP communication when using stdio transport
const dotEnvOutput = config();

if (dotEnvOutput.error) {
  // Only log error if it's not about missing .env file
  if ((dotEnvOutput.error as NodeJS.ErrnoException).code !== 'ENOENT') {
    console.error('Error loading .env file:', dotEnvOutput.error);
    process.exit(1);
  }
}

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

// Import environment configuration
import { getDynatraceEnv } from './getDynatraceEnv.js';

// OpenTelemetry API imports for tool wrapper pattern
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';

/**
 * Package version helper
 */
function getPackageJsonVersion(): string {
  try {
    // Try to read version from npm environment
    return process.env.npm_package_version || '1.1.0';
  } catch {
    return '1.1.0';
  }
}

/**
 * Enhanced error handling with detailed context
 */
class McpError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'McpError';
  }
}

/**
 * Create and configure MCP server
 */
function createMcpServer() {
  // Validate environment configuration early
  const dtEnv = getDynatraceEnv();

  const server = new Server(
    {
      name: 'dynatrace-managed-mcp-server',
      version: getPackageJsonVersion(),
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  return { server, dtEnv };
}

// Server will be initialized in main function

// Set up CLI
program
  .name('dynatrace-managed-mcp')
  .description('Dynatrace Managed MCP Server')
  .version(getPackageJsonVersion())
  .option('--stdio', 'Use stdio transport (default)')
  .parse();

/**
 * OpenTelemetry tracer for parent span creation
 */
const tracer = trace.getTracer('dynatrace-managed-mcp-server', getPackageJsonVersion());

// Start server
async function main() {
  try {
    // Initialize server and environment
    const { server, dtEnv } = createMcpServer();

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

    // Tool handler mapping for cleaner routing with OpenTelemetry
    const toolHandlers = new Map([
      ['add_comment', addComment.handler],
      ['add_tags', addTags.handler],
      ['close_problem', closeProblem.handler],
      ['create_custom_device', createCustomDevice.handler],
      ['delete_comment', deleteComment.handler],
      ['delete_metric', deleteMetric.handler],
      ['delete_tags', deleteTags.handler],
      ['find_monitored_entity_by_name', findMonitoredEntityByName.handler],
      ['get_audit_log', getAuditLog.handler],
      ['get_comment', getComment.handler],
      ['get_entity_type', getEntityType.handler],
      ['get_entity', getEntity.handler],
      ['get_event_property', getEventProperty.handler],
      ['get_event_type', getEventType.handler],
      ['get_event', getEvent.handler],
      ['get_logs_for_entity', getLogsForEntity.handler],
      ['get_metric', getMetric.handler],
      ['get_monitored_entity_details', getMonitoredEntityDetails.handler],
      ['get_problem_details', getProblemDetails.handler],
      ['get_problem', getProblem.handler],
      ['get_unit', getUnit.handler],
      ['get_vulnerability_details', getVulnerabilityDetails.handler],
      ['ingest_event', ingestEvent.handler],
      ['ingest_metrics', ingestMetrics.handler],
      ['list_audit_logs', listAuditLogs.handler],
      ['list_comments', listComments.handler],
      ['list_entities', listEntities.handler],
      ['list_entity_types', listEntityTypes.handler],
      ['list_event_properties', listEventProperties.handler],
      ['list_event_types', listEventTypes.handler],
      ['list_events', listEvents.handler],
      ['list_metrics', listMetrics.handler],
      ['list_monitoring_states', listMonitoringStates.handler],
      ['list_problems', listProblems.handler],
      ['list_tags', listTags.handler],
      ['list_units', listUnits.handler],
      ['list_vulnerabilities', listVulnerabilities.handler],
      ['query_metrics', queryMetrics.handler],
      ['update_comment', updateComment.handler],
    ]);

    // Handle list tools request
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools };
    });

    // Handle tool calls with enhanced error handling, request tracking, and OpenTelemetry tracing
    server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const requestId = randomUUID();
      const { name, arguments: args } = request.params;

      console.error(`[${requestId}] Tool call: ${name} - OTEL tracing enabled`);

      // Create parent span using the tool wrapper pattern for proper span hierarchy
      return await tracer.startActiveSpan(
        `Tool.${name}`,
        {
          kind: SpanKind.SERVER,
          attributes: {
            'tool.name': name,
            'tool.args': JSON.stringify(args),
            'mcp.request.id': requestId,
            'service.name': 'mcp-server-managed-lab-dt',
            'service.version': getPackageJsonVersion(),
          },
        },
        async (span) => {
          try {
            // Get tool handler from mapping
            const handler = toolHandlers.get(name);
            if (!handler) {
              throw new McpError(`Unknown tool: ${name}`, 'UNKNOWN_TOOL');
            }

            // Execute tool within the active span context for proper parent-child relationships
            const result = await context.with(trace.setSpan(context.active(), span), async () => {
              return await handler(args, dtEnv);
            });

            span.setStatus({ code: SpanStatusCode.OK });
            span.setAttributes({
              'mcp.tool.success': true,
              'mcp.tool.result.length': JSON.stringify(result).length,
            });

            console.error(`[${requestId}] Tool call completed: ${name} - Trace: ${span.spanContext().traceId}`);
            return result;
          } catch (error: unknown) {
            // Record exception in span and mark as error
            span.recordException(error instanceof Error ? error : new Error(String(error)));
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error instanceof Error ? error.message : String(error),
            });
            span.setAttributes({
              'mcp.tool.success': false,
              'mcp.tool.error': error instanceof Error ? error.message : String(error),
            });

            console.error(`[${requestId}] Tool call failed: ${name} - Span marked as ERROR`, error);

            if (error instanceof McpError) {
              return {
                content: [{ 
                  type: 'text', 
                  text: `Error: ${error.message}${error.code ? ` (${error.code})` : ''}${
                    error.details ? `\n\nDetails: ${JSON.stringify(error.details, null, 2)}` : ''
                  }` 
                }],
                isError: true,
              };
            }

            return {
              content: [{ 
                type: 'text', 
                text: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
              }],
              isError: true,
            };
          } finally {
            span.end();
          }
        }
      );
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Dynatrace Managed MCP Server running on stdio');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch(console.error);
