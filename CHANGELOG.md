# Changelog

All notable changes to the Dynatrace Managed MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2024-12-19

### Added
- **🔥 OpenTelemetry Distributed Tracing**: Comprehensive tracing integration with automatic instrumentation
  - Auto-registration with `@theharithsa/opentelemetry-instrumentation-mcp` package v1.0.4
  - Parent-child span relationships for all MCP tool calls
  - OTLP export directly to Dynatrace for end-to-end observability
  - Custom span attributes including Dynatrace context and tool metadata
  - Error tracking and exception recording in traces
  - Zero-code integration - tracing works automatically
- OpenTelemetry configuration documentation and examples in README
- Enhanced MCP configuration with OTLP environment variables
- Comprehensive trace structure documentation
- Full observability benefits outlined (performance monitoring, error tracking, usage analytics)
- Enhanced package.json with full metadata and improved scripts
- Dockerfile with multi-stage build and security best practices
- Complete governance documentation (CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md)
- Agent rules system for AI assistant integration
- CLI interface with commander.js
- Enhanced error handling and validation patterns
- Docker support with health checks and non-root user
- Comprehensive test coverage configuration
- Security-focused development practices

### Changed
- Updated project name to `@dynatrace/dynatrace-managed-mcp-server`
- Enhanced TypeScript configuration with strict settings
- Improved Jest configuration with ESM support and coverage thresholds
- Restructured capability imports following modular patterns
- Enhanced development scripts and build process

### Security
- Added comprehensive security documentation
- Implemented secure Docker practices
- Enhanced input validation with Zod schemas
- Added security testing guidelines

## [1.0.0] - 2025-01-XX

### Added
- Initial release of Dynatrace Managed MCP Server
- Support for 39 MCP tools covering complete Dynatrace Managed API
- Token-based authentication for Dynatrace Managed environments
- Comprehensive event management capabilities
- Entity and tag management tools
- Metrics querying and ingestion
- Problem and audit log management
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