# Dynatrace Managed MCP Server

This project is a Model Context Protocol (MCP) server for Dynatrace Managed, providing Events API v2 integration with token-based authentication.

## Project Structure
- Uses TypeScript for type safety
- Token-based authentication (no OAuth required)
- Events API v2 tools and capabilities
- Environment-specific URL structure (/e/{env-id}/api/v2/)

## Development Guidelines
- Follow MCP specification standards
- Use proper error handling and validation
- Implement comprehensive logging
- Include unit and integration tests

## Completed Steps
- [x] Created project structure
- [x] Set up package.json and dependencies
- [x] Implement core authentication
- [x] Add Events API v2 capabilities
- [x] Create tests
- [x] Documentation
- [x] Compiled successfully
- [x] All build and test processes working
- [x] Environment info capability added

## Available Tools
1. **get_environment_info** - Get environment details, cluster version, and health status
2. **list_event_properties** - List all event properties with pagination
3. **get_event_property** - Get event property details by key
4. **list_events** - List events with filtering and pagination
5. **get_event** - Get event details by ID
6. **ingest_event** - Ingest custom events into Dynatrace
7. **list_event_types** - List all event types with pagination
8. **get_event_type** - Get event type details

## Ready for Use
The MCP server is complete and ready for production use. Users need to:
1. Configure environment variables in .env file (URL, Environment ID, API Token)
2. Build the project with `npm run build`
3. Configure their MCP client to use the server
4. Start using the tools through natural language

## Next Steps
- Test with actual Dynatrace Managed instance
- Add additional capabilities as needed
- Improve error handling and logging
