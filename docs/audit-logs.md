# Audit Logs API - Environment v2

This document describes the audit logs capabilities added to the Dynatrace Managed MCP server.

## Overview

The audit logs API allows you to retrieve and analyze audit trail information from your Dynatrace environment. This uses the Environment v2 API and requires the `auditLogs.read` scope.

## Available Tools

### 1. list_audit_logs
Retrieves a list of audit log entries with filtering and pagination options.

**Parameters:**
- `nextPageKey` (optional): Cursor for pagination to get the next page of results
- `pageSize` (optional): Number of entries per page (1-5000, default: 1000)
- `filter` (optional): Filter criteria using Dynatrace query language
- `from` (optional): Start of timeframe (UTC milliseconds, human-readable, or relative like "now-2w")
- `to` (optional): End of timeframe (UTC milliseconds, human-readable, or relative)
- `sort` (optional): Sort order - "timestamp" (oldest first) or "-timestamp" (newest first, default)

**Filter Examples:**
```
user("john.doe@company.com")
eventType("CREATE","UPDATE")
category("CONFIG")
entityId("HOST-1234")
eventType("CREATE"),category("CONFIG")
```

**Usage Example:**
```json
{
  "pageSize": 10,
  "from": "now-1w",
  "filter": "eventType(\"CREATE\",\"UPDATE\")",
  "sort": "-timestamp"
}
```

### 2. get_audit_log
Retrieves a specific audit log entry by its ID.

**Parameters:**
- `id` (required): The ID of the audit log entry to retrieve

**Usage Example:**
```json
{
  "id": "175639760000080000"
}
```

## API Endpoint Structure

The audit logs API uses the following base URL structure:
```
https://{managed-cluster}/e/{environment-id}/api/v2/auditlogs
```

## Required API Token Scope

Your API token must have the `auditLogs.read` scope to access these endpoints.

## Response Format

Both tools return formatted text responses that include:
- Summary information (total count, page size, etc.)
- Detailed audit log entries with timestamps, users, changes, and entities
- Navigation information for pagination
- Filter and time range examples
- Troubleshooting information for errors

## File Organization

The audit logs capabilities are organized under the `env-v2` folder structure:
- `src/capabilities/env-v2/list-audit-logs.ts` - List audit logs functionality
- `src/capabilities/env-v2/get-audit-log.ts` - Get specific audit log functionality
- `src/types/audit-logs.ts` - TypeScript types and schemas for audit logs

## Testing

You can test the audit logs functionality using:

1. **Direct API calls:**
```bash
curl -H "Authorization: Api-Token YOUR_TOKEN" \
  "https://your-cluster/e/your-env-id/api/v2/auditlogs?pageSize=5"
```

2. **MCP tools through a client that supports the MCP protocol**

## Next Steps

The audit logs implementation is complete and ready for use. Future enhancements could include:
- Additional filtering capabilities
- Export functionality
- Real-time audit log streaming
- Integration with other Dynatrace APIs for enhanced context
