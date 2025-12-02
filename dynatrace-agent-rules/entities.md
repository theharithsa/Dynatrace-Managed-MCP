# Entity Management - Prompt Guide

Best practices and example prompts for entity tools.

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_entities` | List monitored entities |
| `get_entity` | Get entity details |
| `list_entity_types` | List entity types |
| `get_entity_type` | Get entity type details |
| `find_monitored_entity_by_name` | Search by name |
| `get_monitored_entity_details` | Get comprehensive details |
| `create_custom_device` | Create custom device |

---

## list_entities

### Listing Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `entitySelector` | string | Filter expression |
| `from` | string | Start time for activity |
| `to` | string | End time for activity |
| `fields` | string | Additional fields |
| `pageSize` | number | Results per page |

### Basic Listing Examples

```text
List all hosts
```

```text
Show all services in the environment
```

```text
What applications are being monitored?
```

```text
List all Kubernetes pods
```

### Filtered Listing Examples

```text
Show hosts in the Production management zone
```

```text
List services tagged with "team:platform"
```

```text
Find all entities with health status ERROR
```

```text
Show hosts running in AWS
```

---

## get_entity

### Detail Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `entityId` | string | Entity ID (required) |
| `from` | string | Activity start time |
| `to` | string | Activity end time |
| `fields` | string | Additional fields to include |

### Detail Examples

```text
Get details for host HOST-ABC123
```

```text
Show all properties of service SERVICE-XYZ789
```

```text
What is the health status of process group PG-123?
```

---

## find_monitored_entity_by_name

### Search Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `entityName` | string | Name to search for |
| `entityType` | string | Optional: Type filter |

### Search Examples

```text
Find the entity named "payment-service"
```

```text
Search for host "prod-web-01"
```

```text
Find all entities with "checkout" in the name
```

---

## Entity Selectors

### Common Patterns

| Selector | Description |
|----------|-------------|
| `type("HOST")` | All hosts |
| `type("SERVICE")` | All services |
| `type("PROCESS_GROUP")` | All process groups |
| `type("APPLICATION")` | All applications |

### Filtering by Properties

| Selector | Description |
|----------|-------------|
| `entityName.contains("prod")` | Name contains "prod" |
| `tag("environment:production")` | Has specific tag |
| `managementZones("Production")` | In management zone |
| `healthState("ERROR")` | Health state filter |

### Relationship Selectors

| Selector | Description |
|----------|-------------|
| `runsOn("HOST-123")` | Runs on specific host |
| `calls("SERVICE-456")` | Calls specific service |
| `fromRelationships.isAccessibleBy(...)` | Relationship filter |

---

## list_entity_types

### Type Listing Examples

```text
What entity types are available?
```

```text
List all entity types with their properties
```

```text
Show infrastructure entity types
```

---

## create_custom_device

### Custom Device Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `displayName` | string | Display name |
| `entityId` | string | Custom entity ID |
| `properties` | object | Custom properties |
| `tags` | array | Tags to apply |

### Custom Device Examples

```text
Create a custom device for our network load balancer with name "prod-lb-01"
```

```text
Register a custom device for the external payment gateway
```

---

## Use Case Examples

### Infrastructure Discovery

```text
Give me a complete overview of the infrastructure:
1. Total number of hosts by platform
2. Services per host
3. Process groups and their states
4. Any unhealthy entities
```

### Dependency Mapping

```text
Show me all dependencies for the checkout-service:
1. Services it calls
2. Databases it connects to
3. Hosts it runs on
4. External services it depends on
```

### Health Assessment

```text
Perform a health check across all entities:
1. List entities with ERROR state
2. Group by entity type
3. Show related problems
4. Suggest investigation steps
```

### Tagging Audit

```text
Audit entity tags in the production environment:
1. List all unique tags
2. Entities missing required tags
3. Tag consistency check
4. Suggest tag improvements
```
