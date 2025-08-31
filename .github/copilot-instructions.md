# Dynatrace Managed MCP Server

This project is a Model Context Protocol (MCP) server for Dynatrace Managed, following the same simple approach as the SaaS MCP server.

## Project Structure
- Simple single-file approach (src/index.ts)
- Token-based authentication (no OAuth required)
- Raw JSON responses for AI model interpretation
- Environment-specific URL structure (/e/{env-id}/api/v2/)
- Zod schemas for input validation (like SaaS MCP servers)

## Development Guidelines
- Keep it simple - follow SaaS MCP server pattern
- Use direct axios HTTP calls
- Return raw JSON data for AI models to interpret
- Use Zod schemas for input validation with zodToJsonSchema
- DO NOT create unnecessary markdown files
- DO NOT over-engineer with complex types or schemas
- Single file approach preferred

## Current Implementation
- [x] Simplified to single index.ts file (~230 lines)
- [x] Direct axios HTTP client
- [x] Environment variable configuration
- [x] Raw JSON responses
- [x] 8 core tools implemented
- [x] API token authentication
- [x] Zod schemas for input validation (following SaaS pattern)

## Available Tools (All return raw JSON)
1. **list_problems** - List problems in environment
2. **get_problem** - Get problem details by ID
3. **list_entities** - List monitored entities
4. **get_entity** - Get entity details by ID
5. **list_metrics** - List available metrics
6. **query_metrics** - Query metric data
7. **list_events** - List events
8. **execute_dql** - Execute DQL queries

## Ready for Use
The MCP server is simple and ready for production use. Users need to:
1. Set environment variables (DYNATRACE_MANAGED_URL, DYNATRACE_ENVIRONMENT_ID, DYNATRACE_API_TOKEN)
2. Build with `npm run build`
3. Run with `npm start`

## Important Notes
- STOP creating unnecessary documentation files
- Keep the simple approach like SaaS MCP server
- All tools should return raw JSON for AI interpretation
- Use Zod schemas for input validation exactly like SaaS MCP servers
- Use safeParse() for validation in tool handlers
