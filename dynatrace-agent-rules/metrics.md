# Metrics Management - Prompt Guide

Best practices and example prompts for metrics tools.

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_metrics` | List available metrics |
| `get_metric` | Get metric metadata |
| `query_metrics` | Query metric data points |
| `ingest_metrics` | Send custom metrics |
| `delete_metric` | Delete custom metric |
| `list_units` | List measurement units |
| `get_unit` | Get unit details |

---

## list_metrics

### Listing Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `metricSelector` | string | Filter by metric key pattern |
| `text` | string | Search in metric names |
| `fields` | string | Fields to include |
| `pageSize` | number | Results per page |

### Listing Examples

```text
List all available metrics
```

```text
Show metrics related to CPU usage
```

```text
What memory metrics are available?
```

```text
Find all metrics for Kubernetes pods
```

---

## query_metrics

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `metricSelector` | string | Metric expression (required) |
| `from` | string | Start time |
| `to` | string | End time |
| `resolution` | string | Data resolution (e.g., "1h", "1d") |
| `entitySelector` | string | Filter by entities |

### Basic Query Examples

```text
Show CPU usage for all hosts in the last hour
```

```text
Query memory utilization across all pods for the last 24 hours
```

```text
What is the current disk usage on production hosts?
```

### Aggregation Examples

```text
Show average response time per service for the last week, grouped by hour
```

```text
Compare CPU usage between production and staging hosts
```

```text
Show the maximum memory usage per host for today
```

### Advanced Query Examples

```text
Query the 95th percentile of response time for the payment-service 
over the last 7 days with daily resolution
```

```text
Calculate the rate of requests per second for all web services
```

```text
Show network traffic in/out for hosts tagged with "environment:production"
```

---

## get_metric

### Metadata Query Examples

```text
Get details about the builtin:host.cpu.usage metric
```

```text
What dimensions are available for the service response time metric?
```

```text
Show me the unit and aggregation types for memory metrics
```

---

## ingest_metrics

### Ingestion Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `metrics` | string | Metrics in line protocol format |

### Ingestion Examples

```text
Send a custom metric "custom.app.active_users" with value 150
```

```text
Ingest metric data: custom.api.request_count,service=payment 42
```

---

## Metric Selectors

### Common Patterns

| Pattern | Description |
|---------|-------------|
| `builtin:host.cpu.usage` | CPU usage metric |
| `builtin:service.response.time` | Response time |
| `builtin:host.mem.usage` | Memory usage |
| `builtin:host.disk.usedPct` | Disk usage percentage |

### Aggregation Functions

| Function | Usage |
|----------|-------|
| `:avg` | Average value |
| `:max` | Maximum value |
| `:min` | Minimum value |
| `:sum` | Sum of values |
| `:percentile(95)` | 95th percentile |

### Filter Functions

| Function | Usage |
|----------|-------|
| `:filter(eq(...))` | Exact match |
| `:filter(contains(...))` | Contains match |
| `:splitBy(...)` | Split by dimension |

---

## Use Case Examples

### Capacity Planning

```text
Show me the trend of memory usage across all hosts for the last 30 days.
Include:
1. Average usage by host
2. Peak usage times
3. Hosts approaching capacity limits
```

### Performance Analysis

```text
Compare the response time of the checkout-service between this week 
and last week. Show:
1. Average response time
2. 95th percentile
3. Error rate correlation
```

### Resource Monitoring

```text
Create a summary of resource utilization for the production environment:
1. CPU usage trends
2. Memory utilization
3. Disk space remaining
4. Network throughput
```
