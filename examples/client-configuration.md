# Example MCP Client Configuration

This file shows how to configure various MCP clients to use the Dynatrace Managed MCP server.

## Claude Desktop Configuration

Add this to your Claude Desktop configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "dynatrace-managed": {
      "command": "node",
      "args": ["/path/to/dynatrace-managed-mcp/dist/index.js"],
      "env": {
        "DYNATRACE_MANAGED_URL": "https://your-managed-cluster.com",
        "DYNATRACE_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

## Cline Extension Configuration

For the Cline VS Code extension, add this to your MCP settings:

```json
{
  "dynatrace-managed": {
    "command": "node",
    "args": ["/path/to/dynatrace-managed-mcp/dist/index.js"],
    "env": {
      "DYNATRACE_MANAGED_URL": "https://your-managed-cluster.com",
      "DYNATRACE_API_TOKEN": "your-api-token-here"
    }
  }
}
```

## Environment Variables Setup

Instead of embedding credentials in the configuration, you can use environment variables:

```json
{
  "mcpServers": {
    "dynatrace-managed": {
      "command": "node",
      "args": ["/path/to/dynatrace-managed-mcp/dist/index.js"]
    }
  }
}
```

Then set the environment variables in your shell:

```bash
export DYNATRACE_MANAGED_URL="https://your-managed-cluster.com"
export DYNATRACE_API_TOKEN="your-api-token-here"
```

## Docker Configuration

You can also run the MCP server in a Docker container:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/

ENV DYNATRACE_MANAGED_URL=""
ENV DYNATRACE_API_TOKEN=""

CMD ["node", "dist/index.js"]
```

## Testing the Configuration

Once configured, you should be able to use the following tools:

- `list_environments` - List all environments
- `get_environment` - Get environment details  
- `create_environment` - Create new environment
- `update_environment` - Update environment
- `delete_environment` - Delete environment

Example usage in a chat:

```
Can you list all environments in my Dynatrace Managed cluster?
```

```
Create a new production environment called "web-prod" with tags context=ENVIRONMENT, key=team, value=web
```
