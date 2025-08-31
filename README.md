
# Dynatrace Managed MCP Server

![npm](https://img.shields.io/npm/v/dynatrace-managed-mcp?style=flat-square)
![Build Status](https://img.shields.io/github/actions/workflow/status/theharithsa/dynatrace-managed-mcp/ci.yml?branch=main&style=flat-square)
![License](https://img.shields.io/github/license/theharithsa/dynatrace-managed-mcp?style=flat-square)
![Node.js Version](https://img.shields.io/node/v/dynatrace-managed-mcp?style=flat-square)
![Coverage](https://img.shields.io/codecov/c/github/theharithsa/dynatrace-managed-mcp?style=flat-square)

A Model Context Protocol (MCP) server for Dynatrace Managed that provides comprehensive API integration with flexible data handling for AI models.

---

## ✨ Key Enhancements

### 🧠 **AI-First Design**
This MCP server is designed with modern AI models in mind. Instead of pre-formatting responses, it returns raw JSON data that AI models can intelligently interpret and format as needed. This makes the server truly "plug and play" with any AI client.

### 🔄 **Flexible Data Approach**
- **Raw JSON Responses**: Returns actual API response data for models to interpret
- **No Pre-formatting**: Let AI models handle data presentation and analysis
- **Future-Proof**: Automatically supports new API fields without code changes
- **Universal Compatibility**: Works with any AI model or client

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Troubleshooting](#troubleshooting)

---

## Features

- 🔧 **Complete API Coverage**: Support for Events, Metrics, Entities, Problems, Audit Logs, and more
- 🔑 **Token-based Authentication**: Simple API token authentication (no OAuth required)
- 📊 **Comprehensive Event Management**: List, retrieve, and ingest events and event types
- 🏷️ **Entity & Tag Management**: Manage entities, tags, and relationships
- 💾 **Metrics Integration**: Query, ingest, and manage custom metrics
- 🚨 **Problem Management**: Monitor and manage problems with comments
- 📈 **Environment Monitoring**: Get cluster information and monitoring states
- 🧠 **AI-Optimized**: Returns raw JSON for intelligent model interpretation
- 🛡️ **Type Safety**: Built with TypeScript for development-time safety
- 🧪 **Comprehensive Testing**: Unit and integration tests included

## Available Tools

### Environment & Info
- `get_environment_info` - Get cluster version, time, and configuration
- `convert_unit` - Convert values between different units
- `list_monitoring_states` - Get monitoring states of process group instances

### 🚨 Problems Management
- `list_problems` - List problems with filtering and pagination
- `get_problem` - Get detailed problem information
- `close_problem` - Close problems with comments
- `add_comment` - Add comments to problems
- `list_comments` - List problem comments
- `get_comment` - Get specific comment details
- `update_comment` - Update comment content
- `delete_comment` - Delete comments

### 📊 Metrics Management  
- `list_metrics` - List available metrics with filtering
- `get_metric` - Get metric descriptor details
- `query_metrics` - Query metric data points
- `ingest_metrics` - Ingest custom metric data
- `delete_metric` - Delete custom metrics
- `list_units` - List available measurement units

### 🏢 Entity Management
- `list_entities` - List monitored entities with filtering
- `get_entity` - Get detailed entity information  
- `create_custom_device` - Create custom device entities
- `list_entity_types` - List available entity types
- `get_entity_type` - Get entity type details

### 🏷️ Tag Management
- `list_tags` - List tags applied to entities
- `add_tags` - Add tags to entities
- `delete_tags` - Remove tags from entities

### 📋 Audit Logs
- `list_audit_logs` - List audit log entries with filtering
- `get_audit_log` - Get specific audit log entry

**Parameters:** None

**Returns:**
- Environment ID and base URL
- Cluster version and time information
- Connection status and health checks
- Available API endpoints

### `list_event_properties`
List all event properties with optional pagination.

**Parameters:**
- `pageSize` (optional): Number of event properties to return per page (1-500)
- `nextPageKey` (optional): Token for pagination to get the next page of results

### `get_event_property`
Get detailed information about a specific event property by key.

**Parameters:**
- `propertyKey` (required): The event property key to retrieve

### `list_events`
List events within the specified timeframe with optional filtering by event and entity selectors.

**Parameters:**
- `from` (optional): Start of the requested timeframe (timestamp, human-readable format like 2021-01-25T05:57:01.123+01:00, or relative format like now-2h)
- `to` (optional): End of the requested timeframe (timestamp, human-readable, or relative format)
- `eventSelector` (optional): Event selector to filter events (e.g., eventType("HIGH_CPU"), status("OPEN"), property.severity("HIGH"))
- `entitySelector` (optional): Entity selector to filter by entities (e.g., type("HOST"), healthState("HEALTHY"), tag("environment:production"))
- `pageSize` (optional): Number of events to return per page (1-1000)
- `nextPageKey` (optional): Token for pagination to get the next page of results

### `get_event`
Get detailed information about a specific event by ID.

**Parameters:**
- `eventId` (required): The ID of the event to retrieve

### `ingest_event`
Ingest a custom event into Dynatrace. The ingestion of custom events is subject to licensing.

**Parameters:**
- `entitySelector` (required): Entity selector to specify target entities (e.g., type("HOST"), entityId("HOST-1234"))
- `eventType` (required): Type of the custom event (AVAILABILITY_EVENT, CUSTOM_ALERT, ERROR_EVENT, INFO_EVENT, PERFORMANCE_EVENT, RESOURCE_CONTENTION_EVENT)
- `title` (required): Title of the event
- `startTime` (required): Start time of the event (Unix timestamp in milliseconds)
- `endTime` (optional): End time of the event (Unix timestamp in milliseconds)
- `timeout` (optional): Timeout for event processing in minutes
- `properties` (optional): Custom properties for the event as key-value pairs

### `list_event_types`
List all available event types with optional pagination.

**Parameters:**
- `pageSize` (optional): Number of event types to return per page (1-500)
- `nextPageKey` (optional): Token for pagination to get the next page of results

### `get_event_type`
Get detailed information about a specific event type.

**Parameters:**
- `eventType` (required): The event type to retrieve information for


## Installation


### Prerequisites

- Node.js 18.0.0 or higher
- Dynatrace Managed cluster with API access
- Valid API token with environment management permissions


### Setup

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd dynatrace-managed-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.template .env
   ```
   
   Edit `.env` file with your Dynatrace Managed configuration:
   ```env
   DYNATRACE_MANAGED_URL=https://your-managed-cluster.com
   DYNATRACE_ENVIRONMENT_ID=your-environment-id
   DYNATRACE_API_TOKEN=your-api-token-here
   ```

4. **Build the project**
   ```bash
   npm run build
   ```


## Usage


### Running the MCP Server

The server can be run in several ways:

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

#### Using the CLI directly
```bash
./dist/index.js
```

### Integration with MCP Clients

This server implements the Model Context Protocol and can be used with any MCP-compatible client. The server communicates via stdio and provides the tools listed above.

Example client configuration:
```json
{
  "mcpServers": {
    "dynatrace-managed": {
      "command": "node",
      "args": ["/path/to/dynatrace-managed-mcp/dist/index.js"],
      "env": {
        "DYNATRACE_MANAGED_URL": "https://your-managed-cluster.com",
        "DYNATRACE_ENVIRONMENT_ID": "your-environment-id",
        "DYNATRACE_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```


## Configuration


### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DYNATRACE_MANAGED_URL` | Yes | Your Dynatrace Managed cluster URL | - |
| `DYNATRACE_ENVIRONMENT_ID` | Yes | Your environment ID in the Dynatrace Managed cluster | - |
| `DYNATRACE_API_TOKEN` | Yes | API token with events management permissions | - |
| `MCP_SERVER_NAME` | No | Server name for identification | `dynatrace-managed-events-mcp` |
| `MCP_SERVER_VERSION` | No | Server version for identification | `1.0.0` |
| `LOG_LEVEL` | No | Logging level | `info` |
| `REQUEST_TIMEOUT` | No | Request timeout in milliseconds | `30000` |
| `MAX_RETRIES` | No | Maximum number of retries for failed requests | `3` |


### API Token Permissions

Your Dynatrace API token must have the following permissions:
- `events.read` - To list and get event details
- `events.write` - To ingest custom events
- `eventProperties.read` - To read event properties
- `eventTypes.read` - To read event types


## Development


### Building
```bash
npm run build
```


### Running Tests
```bash
# Unit tests
npm test

# Integration tests (requires valid environment configuration)
npm run test:integration

# Test with watch mode
npm run test:watch
```

### Linting
```bash
npm run lint
npm run lint:fix
```


## API Reference

This server implements the Dynatrace Managed Events API v2. For detailed API documentation, refer to your Dynatrace Managed cluster's API documentation at:

```
https://your-managed-cluster.com/e/{environment-id}/api/swagger-ui/
```


## Error Handling

The server includes comprehensive error handling:

- **Connection Issues**: Automatic retry with exponential backoff
- **Authentication Errors**: Clear error messages for token issues
- **Validation Errors**: Detailed parameter validation with Zod
- **API Errors**: Proper parsing and display of Dynatrace API errors


## Security Considerations

- Store API tokens securely and never commit them to version control
- Use environment variables or secure secret management systems
- Regularly rotate API tokens
- Monitor API usage and access logs
- Ensure network connectivity to your Dynatrace Managed cluster is secure


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request


## License

MIT License - see LICENSE file for details


## Support

For issues and questions:
1. Check the troubleshooting section below
2. Review your Dynatrace Managed cluster's API documentation
3. Create an issue in the project repository


## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to Dynatrace Managed"
**Solutions**:
- Verify your `DYNATRACE_MANAGED_URL` is correct and accessible
- Check that your `DYNATRACE_ENVIRONMENT_ID` is correct
- Check that your API token is valid and has proper permissions
- Ensure network connectivity to the Dynatrace Managed cluster
- Verify the cluster is running and the API endpoint is available

### Authentication Issues

**Problem**: "Unauthorized" or "Forbidden" errors
**Solutions**:
- Verify your API token is correct
- Check that the token has the required permissions (events.read, events.write, etc.)
- Ensure the token hasn't expired
- Confirm you're using the correct cluster URL and environment ID

### Event Management Issues

**Problem**: Event retrieval or ingestion errors
**Solutions**:
- Review the event selector and entity selector parameters for correct format
- Check that the event types and properties exist
- Verify timestamp formats and ranges
- Ensure you have sufficient permissions for event operations
