# Metrics API - Environment v2

This document describes the comprehensive metrics capabilities added to the Dynatrace Managed MCP server.

## Overview

The Metrics API provides full access to Dynatrace's metrics system, allowing you to list, query, ingest, and manage metrics. This uses the Environment v2 API and requires various scopes depending on the operation.

## Available Tools

### 1. list_metrics
Retrieves a list of available metrics with filtering and pagination options.

**Required Scope:** `metrics.read`

**Parameters:**
- `nextPageKey` (optional): Cursor for pagination
- `pageSize` (optional): Number of metrics per page (1-500, default: 100)
- `metricSelector` (optional): Select metrics by keys with wildcards and transformations
- `text` (optional): Search term for metric names, display names, or descriptions
- `fields` (optional): Customize response fields (+field to add, -field to exclude)
- `writtenSince` (optional): Filter by metrics with recent data points
- `metadataSelector` (optional): Filter by metadata like units, tags, dimensions

**Usage Examples:**
```json
{
  "metricSelector": "builtin:host.cpu.*",
  "pageSize": 20,
  "fields": "+aggregationTypes,-description"
}
```

### 2. get_metric
Retrieves detailed information about a specific metric.

**Required Scope:** `metrics.read`

**Parameters:**
- `metricKey` (required): The metric key/ID with optional transformations

**Usage Example:**
```json
{
  "metricKey": "builtin:host.cpu.user"
}
```

### 3. query_metrics
Queries metric data points with filtering and aggregation.

**Required Scope:** `metrics.read`

**Parameters:**
- `metricSelector` (required): Metric selector (up to 10 metrics)
- `resolution` (optional): Data point resolution (number or timespan like "5m")
- `from` (optional): Start time (default: "now-2h")
- `to` (optional): End time (default: current time)
- `entitySelector` (optional): Filter by entities
- `mzSelector` (optional): Filter by management zones

**Usage Example:**
```json
{
  "metricSelector": "builtin:host.cpu.user",
  "from": "now-1h",
  "entitySelector": "type(\"HOST\"),tag(\"environment:prod\")",
  "resolution": "5m"
}
```

### 4. ingest_metrics
Ingests custom metric data points using line protocol format.

**Required Scope:** `metrics.ingest`

**Parameters:**
- `data` (required): Metric data in line protocol format

**Usage Example:**
```json
{
  "data": "server.cpu.temperature,cpu.id=0 42\nserver.memory.usage,host=server1 75.5"
}
```

### 5. delete_metric
Deletes a metric (cannot be undone).

**Required Scope:** `metrics.write`

**Parameters:**
- `metricKey` (required): The metric key to delete

**Usage Example:**
```json
{
  "metricKey": "ext:custom.metric"
}
```

### 6. list_units
Lists available measurement units with filtering.

**Required Scope:** `metrics.read`

**Parameters:**
- `unitSelector` (optional): Filter units (e.g., compatible units)
- `fields` (optional): Customize response fields

**Usage Example:**
```json
{
  "unitSelector": "compatibleTo(\"Byte\",\"binary\")",
  "fields": "+description"
}
```

### 7. get_unit
Gets details about a specific unit.

**Required Scope:** `metrics.read`

**Parameters:**
- `unitId` (required): The unit ID

**Usage Example:**
```json
{
  "unitId": "BytePerSecond"
}
```

### 8. convert_unit
Converts values between compatible units.

**Required Scope:** `metrics.read`

**Parameters:**
- `unitId` (required): Source unit ID
- `value` (required): Value to convert
- `targetUnit` (optional): Target unit (auto-selected if not specified)
- `numberFormat` (optional): "binary" or "decimal" for byte-based units

**Usage Example:**
```json
{
  "unitId": "Byte",
  "value": 1024,
  "targetUnit": "KibiByte"
}
```

## API Endpoint Structure

All metrics endpoints use the following base URL structure:
```
https://{managed-cluster}/e/{environment-id}/api/v2/metrics
https://{managed-cluster}/e/{environment-id}/api/v2/units
```

## Required API Token Scopes

- **metrics.read** - For listing metrics, querying data, and unit operations
- **metrics.ingest** - For ingesting custom metric data
- **metrics.write** - For deleting metrics

## Data Limits

### Query Limits
- Maximum aggregated data points in response: 1,000
- Maximum series in response: 1,000
- Maximum data points per series: 10,080 (one week of minutes)
- Overall data points limit: 100,000
- Maximum 10 metrics per query

### Ingestion Limits
- Maximum payload size: 1 MB
- Maximum 1000 metric lines per request
- Metrics with recent data (last 2 hours) cannot be deleted

## Line Protocol Format

For metric ingestion, use the line protocol format:
```
metric_name,tag1=value1,tag2=value2 field_value [timestamp]
```

**Examples:**
```
# Simple metric with current timestamp
server.cpu.temperature,cpu.id=0 42

# Metric with multiple tags and specific timestamp
server.memory.usage,host=server1,region=us-east 75.5 1609459200000

# Custom metric with dimensions
ext:custom.metric,env=prod,service=api response_time=250.5
```

## File Organization

The metrics capabilities are organized under the `env-v2` folder structure:
- `src/capabilities/env-v2/list-metrics.ts` - List metrics functionality
- `src/capabilities/env-v2/get-metric.ts` - Get specific metric details
- `src/capabilities/env-v2/query-metrics.ts` - Query metric data points
- `src/capabilities/env-v2/ingest-metrics.ts` - Ingest metric data
- `src/capabilities/env-v2/delete-metric.ts` - Delete metrics
- `src/capabilities/env-v2/list-units.ts` - List measurement units
- `src/capabilities/env-v2/get-unit.ts` - Get unit details and conversions
- `src/types/metrics.ts` - TypeScript types and schemas for metrics

## Common Selector Examples

### Metric Selectors
```
# All host metrics
builtin:host.*

# CPU metrics
builtin:host.cpu.(idle,user,system)

# Custom metrics
ext:*

# Application metrics
builtin:apps.*

# With transformations
builtin:host.cpu.user:avg:splitBy("dt.entity.host")
```

### Entity Selectors
```
# All hosts
type("HOST")

# Specific entities
entityId("HOST-123","HOST-456")

# By tags
tag("environment:prod"),tag("team:backend")

# Combined criteria
type("HOST"),healthState("HEALTHY"),tag("environment:prod")
```

### Metadata Selectors
```
# By unit
unit("Percent","MegaByte")

# By tags
tags("feature","cloud")

# Custom metrics only
custom("true")

# By dimension
dimensionKey("dt.entity.host")
```

## Best Practices

### Querying
- Use appropriate time ranges to avoid large data sets
- Filter by entities or management zones when possible
- Use transformations to aggregate data appropriately
- Consider resolution settings for performance

### Ingestion
- Use meaningful metric names with proper namespacing
- Include relevant tags for filtering and grouping
- Provide timestamps when possible
- Batch data for efficient ingestion
- Validate data format before ingestion

### Management
- Use metadata selectors to find metrics efficiently
- Clean up unused custom metrics regularly
- Monitor ingestion limits and quotas
- Use unit conversions for consistent reporting

## Testing

You can test the metrics functionality using:

1. **Direct API calls:**
```bash
# List metrics
curl -H "Authorization: Api-Token YOUR_TOKEN" \
  "https://your-cluster/e/your-env-id/api/v2/metrics?pageSize=5"

# Query data
curl -H "Authorization: Api-Token YOUR_TOKEN" \
  "https://your-cluster/e/your-env-id/api/v2/metrics/query?metricSelector=builtin:host.cpu.user&from=now-1h"

# List units
curl -H "Authorization: Api-Token YOUR_TOKEN" \
  "https://your-cluster/e/your-env-id/api/v2/units"
```

2. **MCP tools through a client that supports the MCP protocol**

## Next Steps

The metrics implementation is complete with comprehensive functionality for:
- ✅ Metric discovery and exploration
- ✅ Data querying with filtering and aggregation
- ✅ Custom metric ingestion
- ✅ Metric management and cleanup
- ✅ Unit handling and conversions

This provides a complete metrics management solution for Dynatrace Managed environments.
