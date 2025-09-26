# Dynatrace Managed MCP Server

A comprehensive Model Context Protocol (MCP) server for Dynatrace Managed with **39 production-ready tools** covering the complete API surface. This project follows official Dynatrace MCP patterns with API token authentication instead of OAuth.

## Architecture Overview

### Core Structure
- **Single Entry Point**: `src/index.ts` - Enhanced server with CLI interface, request tracking, error handling
- **Modular Capabilities**: `src/capabilities/` - 39 individual tool modules following consistent patterns
- **Environment Config**: `src/getDynatraceEnv.ts` - Type-safe environment variable management
- **API Pattern**: Each tool follows: Zod schema → validation → axios call → raw JSON response

### Key Components
```
src/
├── index.ts              # Main server with CLI, error handling, request tracking
├── getDynatraceEnv.ts    # Environment configuration (URL, env-id, token)
└── capabilities/         # 39 tool modules (problems, metrics, entities, etc.)
```

## Development Patterns

### Tool Implementation Pattern
Every capability follows this exact structure (see `src/capabilities/list-problems.ts`):
```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

const Schema = z.object({
  // Parameter definitions with .describe() for documentation
});

export const toolName = {
  definition: {
    name: 'tool_name',
    description: 'Clear description of what the tool does',
    inputSchema: zodToJsonSchema(Schema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = Schema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    // Build URL params, make axios call, return raw JSON
    const response = await axios.get(`${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/...`);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }
};
```

### API URL Structure
All endpoints follow: `${DYNATRACE_MANAGED_URL}/e/${ENVIRONMENT_ID}/api/v2/{resource}`
- Authentication: `Authorization: Api-Token ${DYNATRACE_API_TOKEN}` header
- Environment variables validated in `getDynatraceEnv()`

### Error Handling & Logging
- **Request Tracking**: Every tool call gets UUID for tracing
- **Custom Errors**: `McpError` class with codes and details
- **Structured Logging**: Console.error with request IDs for debugging

## Development Workflows

### Essential Commands
```bash
# Development with hot reload
npm run dev

# Production build & test
npm run build
npm start

# CLI interface (works without env vars)
node dist/index.js --help
node dist/index.js --version

# Testing capabilities (requires env setup)
npm test
```

### Adding New Tools
1. Create `src/capabilities/new-tool.ts` following the pattern above
2. Import in `src/index.ts` with other capabilities
3. Add to tools array and switch statement in main()
4. Test with `npm run build && npm test`

### Environment Setup
Required environment variables (see `getDynatraceEnv.ts`):
```env
DYNATRACE_MANAGED_URL=https://your-cluster.com
DYNATRACE_ENVIRONMENT_ID=your-env-id  
DYNATRACE_API_TOKEN=your-token
```

## Current Tool Coverage (39 Tools)

**Problems**: list_problems, get_problem, close_problem, add_comment, list_comments, get_comment, update_comment, delete_comment
**Metrics**: list_metrics, get_metric, query_metrics, ingest_metrics, delete_metric, list_units, get_unit  
**Entities**: list_entities, get_entity, create_custom_device, list_entity_types, get_entity_type, find_monitored_entity_by_name, get_monitored_entity_details
**Tags**: list_tags, add_tags, delete_tags
**Events**: list_events, get_event, ingest_event, list_event_types, get_event_type, list_event_properties, get_event_property
**Audit**: list_audit_logs, get_audit_log
**Security**: list_vulnerabilities, get_vulnerability_details
**Monitoring**: list_monitoring_states, get_logs_for_entity

## Critical Guidelines

- **Raw JSON Only**: All tools return unformatted JSON for AI interpretation
- **No Pre-formatting**: Let AI models handle data presentation
- **Zod Validation**: Always use `safeParse()` and proper error handling
- **Type Safety**: Import `DynatraceEnv` interface for all handlers
- **Consistent Structure**: Follow the exact pattern in existing capabilities
- **API Token Auth**: Never implement OAuth - this is API token based
