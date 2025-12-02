# Events Management - Prompt Guide

Best practices and example prompts for events tools.

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_events` | List events |
| `get_event` | Get event details |
| `ingest_event` | Send custom event |
| `list_event_types` | List event types |
| `get_event_type` | Get event type schema |
| `list_event_properties` | List event properties |
| `get_event_property` | Get property details |

---

## list_events

### Event Listing Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | Start time |
| `to` | string | End time |
| `eventSelector` | string | Filter expression |
| `entitySelector` | string | Filter by entity |
| `pageSize` | number | Results per page |

### Basic Event Queries

```text
Show events from the last hour
```

```text
List all deployment events from today
```

```text
What events occurred in the last 24 hours?
```

### Filtered Event Queries

```text
Show deployment events for the payment-service
```

```text
List all error events affecting production hosts
```

```text
Find configuration change events from the last week
```

### Event Type Filters

```text
Show all CUSTOM_DEPLOYMENT events
```

```text
List AVAILABILITY_EVENT events for today
```

```text
Find RESOURCE_CONTENTION events on hosts
```

---

## get_event

### Event Detail Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `eventId` | string | Event ID (required) |

### Event Detail Examples

```text
Get details for event E-12345
```

```text
Show the full payload of event E-67890
```

```text
What entities were affected by event E-11111?
```

---

## ingest_event

### Event Ingestion Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `eventType` | string | Type (CUSTOM_INFO, CUSTOM_DEPLOYMENT, etc.) |
| `title` | string | Event title |
| `description` | string | Event description |
| `entitySelector` | string | Attach to entities |
| `properties` | object | Custom properties |
| `startTime` | number | Start timestamp |
| `endTime` | number | End timestamp |

### Deployment Event Examples

```text
Create a deployment event for payment-service version 2.5.0
```

```text
Send a deployment event: title "API Gateway Update", version "1.3.0", 
attached to service SERVICE-ABC123
```

### Custom Info Event Examples

```text
Create an info event: "Maintenance window started" for all production hosts
```

```text
Send a custom event marking the start of performance testing
```

### Alert Event Examples

```text
Create a custom alert event for high error rate on the checkout service
```

---

## Event Selectors

### Common Event Types

| Type | Description |
|------|-------------|
| `CUSTOM_DEPLOYMENT` | Deployment events |
| `CUSTOM_INFO` | Informational events |
| `CUSTOM_ANNOTATION` | Annotation events |
| `AVAILABILITY_EVENT` | Availability events |
| `ERROR_EVENT` | Error events |
| `RESOURCE_CONTENTION` | Resource events |

### Event Selector Patterns

| Selector | Description |
|----------|-------------|
| `eventType("CUSTOM_DEPLOYMENT")` | By event type |
| `entityId("SERVICE-123")` | By affected entity |
| `status("OPEN")` | By status |

---

## list_event_types

### Event Type Examples

```text
What event types are available?
```

```text
List all custom event types
```

```text
Show me the schema for deployment events
```

---

## Use Case Examples

### Deployment Correlation

```text
Show all deployments and problems from the last 24 hours:
1. List deployment events with timestamps
2. List problems that started after each deployment
3. Identify potential deployment-caused issues
```

### Change Tracking

```text
Track all changes in the environment this week:
1. Configuration changes
2. Deployments
3. Infrastructure changes
4. Correlate with any problems
```

### Event Timeline

```text
Create a timeline for the last incident:
1. Find the problem start time
2. List all events 1 hour before the problem
3. List events during the problem
4. Identify potential triggers
```

### Deployment Pipeline Integration

```text
Our CI/CD pipeline just deployed version 2.5.0 of the payment-service.
1. Create a deployment event with the version info
2. Monitor for any problems in the next 30 minutes
3. Report the health status of the service
```

### Event Analysis

```text
Analyze events for the production environment:
1. Event frequency by type
2. Most affected entities
3. Correlation with problems
4. Recommendations for monitoring
```
