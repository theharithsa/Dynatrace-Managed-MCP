# Changelog# Changelog



All notable changes to the Dynatrace Managed MCP Server will be documented in this file.All notable changes to the Dynatrace Managed MCP Server will be documented in this file.



The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## [1.0.0] - 2025-12-02## [Unreleased]



### Added## [1.1.0] - 2024-12-19



- **39 Production-Ready MCP Tools** covering complete Dynatrace Managed API### Added

- **OpenTelemetry Integration** with automatic distributed tracing- **🔥 OpenTelemetry Distributed Tracing**: Comprehensive tracing integration with automatic instrumentation

  - Parent-child span relationships for all tool calls  - Auto-registration with `@theharithsa/opentelemetry-instrumentation-mcp` package v1.0.4

  - OTLP export to Dynatrace  - Parent-child span relationships for all MCP tool calls

  - Zero-configuration auto-registration  - OTLP export directly to Dynatrace for end-to-end observability

- **Problems Management**: list, get, close, comments (8 tools)  - Custom span attributes including Dynatrace context and tool metadata

- **Metrics Management**: list, get, query, ingest, delete (6 tools)  - Error tracking and exception recording in traces

- **Entity Management**: list, get, find, types (6 tools)  - Zero-code integration - tracing works automatically

- **Events Management**: list, get, ingest, types, properties (7 tools)- OpenTelemetry configuration documentation and examples in README

- **Tags Management**: list, add, delete (3 tools)- Enhanced MCP configuration with OTLP environment variables

- **Audit & Security**: audit logs, vulnerabilities (5 tools)- Comprehensive trace structure documentation

- **Utilities**: custom devices, monitoring states (4 tools)- Full observability benefits outlined (performance monitoring, error tracking, usage analytics)

- CLI interface with `--help` and `--version` commands- Enhanced package.json with full metadata and improved scripts

- Comprehensive error handling with request tracking- Dockerfile with multi-stage build and security best practices

- Raw JSON responses for AI model interpretation- Complete governance documentation (CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md)

- TypeScript with strict type checking- Agent rules system for AI assistant integration

- Zod schema validation for all inputs- CLI interface with commander.js

- Docker support with multi-stage builds- Enhanced error handling and validation patterns

- Docker support with health checks and non-root user

### Technical- Comprehensive test coverage configuration

- Security-focused development practices

- Node.js 18+ requirement

- TypeScript 5.6+ with ESM modules### Changed

- axios for HTTP requests- Updated project name to `@dynatrace/dynatrace-managed-mcp-server`

- commander.js for CLI- Enhanced TypeScript configuration with strict settings

- Jest for testing- Improved Jest configuration with ESM support and coverage thresholds

- Restructured capability imports following modular patterns

### Documentation- Enhanced development scripts and build process



- Comprehensive README with tool reference### Security

- Contributing guidelines- Added comprehensive security documentation

- Code of Conduct- Implemented secure Docker practices

- Prompt guides for each tool category- Enhanced input validation with Zod schemas

- Added security testing guidelines

---

## [1.0.0] - 2025-01-XX

## Version History

### Added

| Version | Date | Description |- Initial release of Dynatrace Managed MCP Server

|---------|------|-------------|- Support for 39 MCP tools covering complete Dynatrace Managed API

| 1.0.0 | 2025-12-02 | Initial public release with 39 tools |- Token-based authentication for Dynatrace Managed environments

- Comprehensive event management capabilities

---- Entity and tag management tools

- Metrics querying and ingestion

For more information, see the [GitHub Releases](https://github.com/theharithsa/Dynatrace-Managed-MCP/releases) page.- Problem and audit log management

- Security vulnerability tracking
- Comment and collaboration features
- Raw JSON responses for AI model interpretation
- Flexible data approach for future compatibility

### Features
- **Problem Management**: List, retrieve, and manage problems with comprehensive filtering
- **Entity Management**: Full entity lifecycle management with relationship tracking
- **Event Management**: Event creation, querying, and type management
- **Metrics Integration**: Custom metrics ingestion and time-series querying
- **Security Tools**: Vulnerability assessment and security problem tracking
- **Audit Capabilities**: Complete audit log access and management
- **Tag Management**: Entity tagging and tag-based querying
- **Comment System**: Collaborative problem resolution with comments

### Technical
- TypeScript implementation with strict type checking
- Zod schema validation for all inputs
- Comprehensive error handling and logging
- ESM module support
- Docker containerization ready
- Comprehensive test suite
- Development-friendly tooling

### Documentation
- Comprehensive README with usage examples
- API reference documentation
- Security guidelines and best practices
- Contributing guidelines
- Development setup instructions

### Supported Environments
- Dynatrace Managed (all supported versions)
- Node.js 18+ 
- TypeScript 5.6+
- Docker deployment ready

---

## Version History

### Semantic Versioning Guide
- **MAJOR** version: Incompatible API changes
- **MINOR** version: Backward-compatible functionality additions  
- **PATCH** version: Backward-compatible bug fixes

### Release Channels
- **Latest**: Stable production releases
- **Beta**: Pre-release versions for testing
- **Alpha**: Early development versions

---

For more information about releases, see the [GitHub Releases](https://github.com/theharithsa/Dynatrace-Managed-MCP/releases) page.