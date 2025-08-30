#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequest,
  ListToolsRequest,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { DynatraceManagedClient } from './authentication/dynatrace-managed-client.js';
import { getDynatraceManagedConfig, validateEnvironmentConfig } from './utils/config.js';
import { getUserAgent } from './utils/user-agent.js';

// Events API capabilities
import { listEventPropertiesTool, handleListEventProperties } from './capabilities/list-event-properties.js';
import { getEventPropertyTool, handleGetEventProperty } from './capabilities/get-event-property.js';
import { listEventsTool, handleListEvents } from './capabilities/list-events.js';
import { getEventTool, handleGetEvent } from './capabilities/get-event.js';
import { ingestEventTool, handleIngestEvent } from './capabilities/ingest-event.js';
import { listEventTypesTool, handleListEventTypes } from './capabilities/list-event-types.js';
import { getEventTypeTool, handleGetEventType } from './capabilities/get-event-type.js';

// Environment capabilities
import { getEnvironmentInfoTool, handleGetEnvironmentInfo } from './capabilities/get-environment-info.js';

// Environment v2 API capabilities
import { listAuditLogsTool, handleListAuditLogs } from './capabilities/env-v2/list-audit-logs.js';
import { getAuditLogTool, handleGetAuditLog } from './capabilities/env-v2/get-audit-log.js';
import { listMetricsTool, handleListMetrics } from './capabilities/env-v2/list-metrics.js';
import { getMetricTool, handleGetMetric } from './capabilities/env-v2/get-metric.js';
import { queryMetricsTool, handleQueryMetrics } from './capabilities/env-v2/query-metrics.js';
import { ingestMetricsTool, handleIngestMetrics } from './capabilities/env-v2/ingest-metrics.js';
import { deleteMetricTool, handleDeleteMetric } from './capabilities/env-v2/delete-metric.js';
import { listUnitsTool, handleListUnits } from './capabilities/env-v2/list-units.js';
import { getUnitTool, convertUnitTool, handleGetUnit, handleConvertUnit } from './capabilities/env-v2/get-unit.js';
import { listEntitesTool, handleListEntities } from './capabilities/env-v2/list-entities.js';
import { getEntityTool, handleGetEntity } from './capabilities/env-v2/get-entity.js';
import { createCustomDeviceTool, handleCreateCustomDevice } from './capabilities/env-v2/create-custom-device.js';
import { listEntityTypesTool, handleListEntityTypes } from './capabilities/env-v2/list-entity-types.js';
import { getEntityTypeTool, handleGetEntityType } from './capabilities/env-v2/get-entity-type.js';
import { listTagsTool, handleListTags } from './capabilities/env-v2/list-tags.js';
import { addTagsTool, handleAddTags } from './capabilities/env-v2/add-tags.js';
import { deleteTagsTool, handleDeleteTags } from './capabilities/env-v2/delete-tags.js';
import { listMonitoringStatesTool, handleListMonitoringStates } from './capabilities/env-v2/list-monitoring-states.js';
import { listProblemsTool, handleListProblems } from './capabilities/env-v2/list-problems.js';
import { getProblemTool, handleGetProblem } from './capabilities/env-v2/get-problem.js';
import { closeProblemTool, handleCloseProblem } from './capabilities/env-v2/close-problem.js';
import { listCommentsTool, handleListComments } from './capabilities/env-v2/list-comments.js';
import { addCommentTool, handleAddComment } from './capabilities/env-v2/add-comment.js';
import { getCommentTool, handleGetComment } from './capabilities/env-v2/get-comment.js';
import { updateCommentTool, handleUpdateComment } from './capabilities/env-v2/update-comment.js';
import { deleteCommentTool, handleDeleteComment } from './capabilities/env-v2/delete-comment.js';

// Load environment variables
dotenv.config();

/**
 * Dynatrace Managed MCP Server
 * 
 * Provides Model Context Protocol interface for Dynatrace Managed Events API
 * using token-based authentication.
 */
class DynatraceManagedMCPServer {
  private server: Server;
  private client: DynatraceManagedClient;

  constructor() {
    // Validate environment configuration
    validateEnvironmentConfig();

    // Get configuration
    const config = getDynatraceManagedConfig();
    const userAgent = getUserAgent();

    // Initialize Dynatrace client
    this.client = new DynatraceManagedClient({
      config,
      userAgent,
    });

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'dynatrace-managed-events-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          getEnvironmentInfoTool,
          listEventPropertiesTool,
          getEventPropertyTool,
          listEventsTool,
          getEventTool,
          ingestEventTool,
          listEventTypesTool,
          getEventTypeTool,
          listAuditLogsTool,
          getAuditLogTool,
          listMetricsTool,
          getMetricTool,
          queryMetricsTool,
          ingestMetricsTool,
          deleteMetricTool,
          listUnitsTool,
          getUnitTool,
          convertUnitTool,
          listEntitesTool,
          getEntityTool,
          createCustomDeviceTool,
          listEntityTypesTool,
          getEntityTypeTool,
          listTagsTool,
          addTagsTool,
          deleteTagsTool,
          listMonitoringStatesTool,
          listProblemsTool,
          getProblemTool,
          closeProblemTool,
          listCommentsTool,
          addCommentTool,
          getCommentTool,
          updateCommentTool,
          deleteCommentTool,
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name } = request.params;

      try {
        switch (name) {
          case 'get_environment_info':
            return await handleGetEnvironmentInfo(request, this.client);

          case 'list_event_properties':
            return await handleListEventProperties(request, this.client);

          case 'get_event_property':
            return await handleGetEventProperty(request, this.client);

          case 'list_events':
            return await handleListEvents(request, this.client);

          case 'get_event':
            return await handleGetEvent(request, this.client);

          case 'ingest_event':
            return await handleIngestEvent(request, this.client);

          case 'list_event_types':
            return await handleListEventTypes(request, this.client);

          case 'get_event_type':
            return await handleGetEventType(request, this.client);

          case 'list_audit_logs':
            return await handleListAuditLogs(request, this.client);

          case 'get_audit_log':
            return await handleGetAuditLog(request, this.client);

          case 'list_metrics':
            return await handleListMetrics(request, this.client);

          case 'get_metric':
            return await handleGetMetric(request, this.client);

          case 'query_metrics':
            return await handleQueryMetrics(request, this.client);

          case 'ingest_metrics':
            return await handleIngestMetrics(request, this.client);

          case 'delete_metric':
            return await handleDeleteMetric(request, this.client);

          case 'list_units':
            return await handleListUnits(request, this.client);

          case 'get_unit':
            return await handleGetUnit(request, this.client);

          case 'convert_unit':
            return await handleConvertUnit(request, this.client);

          case 'list_entities':
            return await handleListEntities(request, this.client);

          case 'get_entity':
            return await handleGetEntity(request, this.client);

          case 'create_custom_device':
            return await handleCreateCustomDevice(request, this.client);

          case 'list_entity_types':
            return await handleListEntityTypes(request, this.client);

          case 'get_entity_type':
            return await handleGetEntityType(request, this.client);

          case 'list_tags':
            return await handleListTags(request, this.client);

          case 'add_tags':
            return await handleAddTags(request, this.client);

          case 'delete_tags':
            return await handleDeleteTags(request, this.client);

          case 'list_monitoring_states':
            return await handleListMonitoringStates(request, this.client);

          case 'list_problems':
            return await handleListProblems(request, this.client);

          case 'get_problem':
            return await handleGetProblem(request, this.client);

          case 'close_problem':
            return await handleCloseProblem(request, this.client);

          case 'list_comments':
            return await handleListComments(request, this.client);

          case 'add_comment':
            return await handleAddComment(request, this.client);

          case 'get_comment':
            return await handleGetComment(request, this.client);

          case 'update_comment':
            return await handleUpdateComment(request, this.client);

          case 'delete_comment':
            return await handleDeleteComment(request, this.client);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    // Test connection to Dynatrace Managed
    console.error('Testing connection to Dynatrace Managed...');
    const isConnected = await this.client.testConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to Dynatrace Managed. Please check your configuration.');
      process.exit(1);
    }
    
    console.error('Successfully connected to Dynatrace Managed!');
    console.error('Starting Dynatrace Managed Events MCP Server...');

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Dynatrace Managed Events MCP Server is running and ready to accept requests.');
  }
}

// Start the server
const server = new DynatraceManagedMCPServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
