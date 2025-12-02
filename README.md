# Dynatrace Managed MCP Server

<p align="center">
  <img src="https://assets.dynatrace.com/content/dam/dynatrace/misc/dynatrace_web.png" alt="Dynatrace" width="400"/>
</p>

<p align="center">
  <strong>A comprehensive Model Context Protocol server for Dynatrace Managed environments</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@theharithsa/dynatrace-managed-mcp-server"><img src="https://img.shields.io/npm/v/@theharithsa/dynatrace-managed-mcp-server?style=for-the-badge&logo=npm&logoColor=white&label=NPM" alt="npm version"/></a>
  <a href="https://www.npmjs.com/package/@theharithsa/dynatrace-managed-mcp-server"><img src="https://img.shields.io/npm/dm/@theharithsa/dynatrace-managed-mcp-server?style=for-the-badge&logo=npm&logoColor=white&label=Downloads" alt="npm downloads"/></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/github/license/theharithsa/Dynatrace-Managed-MCP?style=for-the-badge" alt="License"/></a>
</p>

<p align="center">
  <a href="https://www.dynatrace.com/"><img src="https://img.shields.io/badge/Dynatrace-Managed-6F2DA8?style=for-the-badge&logo=dynatrace&logoColor=white" alt="Dynatrace"/></a>
  <a href="https://docs.dynatrace.com/docs/dynatrace-api"><img src="https://img.shields.io/badge/API-v2-73BE28?style=for-the-badge&logo=dynatrace&logoColor=white" alt="Dynatrace API"/></a>
  <a href="https://opentelemetry.io/"><img src="https://img.shields.io/badge/OpenTelemetry-Enabled-F5A800?style=for-the-badge&logo=opentelemetry&logoColor=white" alt="OpenTelemetry"/></a>
  <a href="https://modelcontextprotocol.io/"><img src="https://img.shields.io/badge/MCP-Protocol-00ADD8?style=for-the-badge" alt="MCP"/></a>
</p>

<p align="center">
  <a href="https://github.com/theharithsa/Dynatrace-Managed-MCP/stargazers"><img src="https://img.shields.io/github/stars/theharithsa/Dynatrace-Managed-MCP?style=for-the-badge&logo=github" alt="GitHub stars"/></a>
  <a href="https://github.com/theharithsa/Dynatrace-Managed-MCP/issues"><img src="https://img.shields.io/github/issues/theharithsa/Dynatrace-Managed-MCP?style=for-the-badge&logo=github" alt="GitHub issues"/></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/@theharithsa/dynatrace-managed-mcp-server?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Version"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/github/languages/top/theharithsa/Dynatrace-Managed-MCP?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
</p>

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Tools](#available-tools-39-total)
- [OpenTelemetry Integration](#opentelemetry-integration)
- [Prompt Guides](#prompt-guides)
- [Development](#development)
- [API Token Permissions](#api-token-permissions)
- [Troubleshooting](#troubleshooting)
- [Authors](#authors)
- [Contributing](#contributing)
- [Support](#support)

---

## Features

### Production Ready

- **39 comprehensive tools** covering the complete Dynatrace API
- Enterprise-grade error handling
- Request tracking with UUID
- Automatic retry logic

### Full Observability

- Built-in OpenTelemetry tracing
- Parent-child span relationships
- Performance metrics
- Error tracking with stack traces

### AI-First Design

- Raw JSON responses for LLM interpretation
- No pre-formatting - let AI handle presentation
- Future-proof API field support
- Universal client compatibility

### Enterprise Security

- API token authentication
- Secure credential handling
- Configurable timeouts
- Comprehensive logging

---

## Installation

### Option 1: NPM (Recommended)

```bash
npm install -g @theharithsa/dynatrace-managed-mcp-server
```

### Option 2: From Source

```bash
git clone https://github.com/theharithsa/Dynatrace-Managed-MCP.git
cd Dynatrace-Managed-MCP
npm install
npm run build
```

---

## Configuration

### Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DYNATRACE_MANAGED_URL` | Your Dynatrace Managed cluster URL | `https://your-cluster.dynatrace.com` |
| `DYNATRACE_ENVIRONMENT_ID` | Environment ID (UUID format) | `c08a8ab3-83c9-4efe-8903-73ed21722e70` |
| `DYNATRACE_API_TOKEN` | API token with required permissions | `dt0c01.XXXXX.YYYYY` |

#### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REQUEST_TIMEOUT` | `30000` | HTTP request timeout (ms) |
| `MAX_RETRIES` | `3` | Retry attempts for failed requests |
| `LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |

#### OpenTelemetry Variables

| Variable | Description |
|----------|-------------|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP endpoint URL |
| `OTEL_EXPORTER_OTLP_HEADERS` | Auth headers for OTLP |
| `OTEL_RESOURCE_ATTRIBUTES` | Service metadata |
| `OTEL_TRACES_EXPORTER` | Set to `otlp` to enable |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL` | `http/protobuf` or `grpc` |

---

### VS Code Configuration

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "dynatrace-managed": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "DYNATRACE_MANAGED_URL": "https://your-cluster.dynatrace.com",
        "DYNATRACE_ENVIRONMENT_ID": "your-environment-id",
        "DYNATRACE_API_TOKEN": "dt0c01.xxxxx"
      }
    }
  }
}
```

---

### Claude Desktop Configuration

| Platform | Config File Location |
|----------|---------------------|
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "dynatrace-managed": {
      "command": "npx",
      "args": ["@theharithsa/dynatrace-managed-mcp-server"],
      "env": {
        "DYNATRACE_MANAGED_URL": "https://your-cluster.dynatrace.com",
        "DYNATRACE_ENVIRONMENT_ID": "your-environment-id",
        "DYNATRACE_API_TOKEN": "dt0c01.xxxxx"
      }
    }
  }
}
```

---

### Full Configuration with OpenTelemetry

```json
{
  "mcpServers": {
    "dynatrace-managed": {
      "command": "npx",
      "args": ["@theharithsa/dynatrace-managed-mcp-server"],
      "env": {
        "DYNATRACE_MANAGED_URL": "https://your-cluster.dynatrace.com",
        "DYNATRACE_ENVIRONMENT_ID": "your-environment-id",
        "DYNATRACE_API_TOKEN": "dt0c01.xxxxx",
        "REQUEST_TIMEOUT": "30000",
        "MAX_RETRIES": "3",
        "LOG_LEVEL": "info",
        "OTEL_EXPORTER_OTLP_ENDPOINT": "https://your-tenant.live.dynatrace.com/api/v2/otlp/v1/traces",
        "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Api-Token dt0c01.xxxxx",
        "OTEL_RESOURCE_ATTRIBUTES": "service.name=mcp-server,service.version=1.0.0",
        "OTEL_TRACES_EXPORTER": "otlp",
        "OTEL_EXPORTER_OTLP_TRACES_PROTOCOL": "http/protobuf"
      }
    }
  }
}
```

---

## Available Tools (39 Total)

### Problems Management (8 tools)

| Tool | Description |
|------|-------------|
| `list_problems` | List problems with filtering, time range, and pagination |
| `get_problem` | Get detailed problem information including root cause |
| `close_problem` | Close a problem with an optional message |
| `add_comment` | Add a comment to a problem |
| `list_comments` | List all comments on a problem |
| `get_comment` | Get a specific comment by ID |
| `update_comment` | Update an existing comment |
| `delete_comment` | Delete a comment from a problem |

### Metrics Management (6 tools)

| Tool | Description |
|------|-------------|
| `list_metrics` | List available metrics with filtering |
| `get_metric` | Get metric descriptor and metadata |
| `query_metrics` | Query metric data points with selectors |
| `ingest_metrics` | Ingest custom metrics data |
| `delete_metric` | Delete a custom metric |
| `list_units` | List available measurement units |

### Entity Management (5 tools)

| Tool | Description |
|------|-------------|
| `list_entities` | List monitored entities with filtering |
| `get_entity` | Get detailed entity information |
| `list_entity_types` | List available entity types |
| `get_entity_type` | Get entity type schema |
| `create_custom_device` | Create a custom device entity |

### Events Management (7 tools)

| Tool | Description |
|------|-------------|
| `list_events` | List events with filtering |
| `get_event` | Get event details |
| `ingest_event` | Send custom events |
| `list_event_types` | List available event types |
| `get_event_type` | Get event type schema |
| `list_event_properties` | List event properties |
| `get_event_property` | Get event property details |

### Additional Tools

| Category | Tools |
|----------|-------|
| **Tags** | `list_tags` - `add_tags` - `delete_tags` |
| **Audit** | `list_audit_logs` - `get_audit_log` |
| **Security** | `list_vulnerabilities` - `get_vulnerability_details` |
| **Discovery** | `find_monitored_entity_by_name` - `get_monitored_entity_details` - `list_monitoring_states` |
| **Environment** | `get_unit` - `get_logs_for_entity` - `get_events_for_cluster` |

---

## OpenTelemetry Integration

This server includes built-in OpenTelemetry instrumentation using [@theharithsa/opentelemetry-instrumentation-mcp](https://www.npmjs.com/package/@theharithsa/opentelemetry-instrumentation-mcp).

| Feature | Description |
|---------|-------------|
| Automatic Tracing | Every tool call is automatically traced |
| Parent-Child Spans | Full distributed trace context propagation |
| Performance Metrics | Timing and success/failure tracking |
| Error Tracking | Exceptions captured with full stack traces |
| Dynatrace Native | Direct OTLP export to Dynatrace |

### Span Attributes

| Attribute | Description |
|-----------|-------------|
| `mcp.tool.name` | Tool being executed |
| `mcp.tool.arguments` | Input parameters |
| `mcp.tool.result` | Execution result |
| `dynatrace.environment_id` | Target environment |

---

## Prompt Guides

Detailed guides for crafting effective prompts are available in the `dynatrace-agent-rules/` folder:

| Guide | Description |
|-------|-------------|
| [Problems](dynatrace-agent-rules/problems.md) | Problem management prompts |
| [Metrics](dynatrace-agent-rules/metrics.md) | Metrics query prompts |
| [Entities](dynatrace-agent-rules/entities.md) | Entity management prompts |
| [Events](dynatrace-agent-rules/events.md) | Event handling prompts |
| [Audit Logs](dynatrace-agent-rules/audit-logs.md) | Audit log prompts |
| [Tags](dynatrace-agent-rules/tags.md) | Tag management prompts |
| [Vulnerabilities](dynatrace-agent-rules/vulnerabilities.md) | Security prompts |

---

## Development

### Prerequisites

- **Node.js** 18+
- **npm** 9+

### Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

### Adding New Tools

1. Create a new file in `src/capabilities/`
2. Follow the existing Zod schema pattern
3. Register in `src/index.ts`
4. Add tests in `test/`

---

## API Token Permissions

Create an API token with these scopes:

| Scope | Purpose |
|-------|---------|
| `problems.read` | Read problems |
| `problems.write` | Close problems, add comments |
| `metrics.read` | Query metrics |
| `metrics.write` | Ingest metrics |
| `entities.read` | Read entities |
| `entities.write` | Create custom devices |
| `events.read` | Read events |
| `events.ingest` | Send custom events |
| `auditLogs.read` | Read audit logs |
| `securityProblems.read` | Read vulnerabilities |

---

## Troubleshooting

### Connection Issues

```bash
# Test connectivity
curl -H "Authorization: Api-Token YOUR_TOKEN" \
  "https://YOUR_CLUSTER/e/YOUR_ENV/api/v2/problems"
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=mcp:* npm start
```

### Common Errors

| Error | Solution |
|-------|----------|
| `401 Unauthorized` | Check API token permissions |
| `404 Not Found` | Verify environment ID and URL |
| `ECONNREFUSED` | Check network/firewall settings |

---

## Authors

- **Vishruth Harithsa** - [@theharithsa](https://github.com/theharithsa)
- **Mithun Gangadharaiah** - [@mithungangadharaiah](https://github.com/mithungangadharaiah)

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## Support

- **Issues**: [GitHub Issues](https://github.com/theharithsa/Dynatrace-Managed-MCP/issues)
- **Discussions**: [GitHub Discussions](https://github.com/theharithsa/Dynatrace-Managed-MCP/discussions)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for the Dynatrace community</p>
