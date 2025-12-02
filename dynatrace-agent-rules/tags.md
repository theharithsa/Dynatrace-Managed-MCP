# Tags Management - Prompt Guide

Best practices and example prompts for tag management tools.

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_tags` | List tags on entities |
| `add_tags` | Add tags to entities |
| `delete_tags` | Remove tags from entities |

---

## list_tags

### Tag Listing Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `entitySelector` | string | Entity filter (required) |
| `from` | string | Activity start time |
| `to` | string | Activity end time |

### Listing Examples

```text
Show all tags on host HOST-ABC123
```

```text
List tags for all production services
```

```text
What tags are applied to the payment-service?
```

```text
Show unique tags across all hosts
```

---

## add_tags

### Tag Addition Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `entitySelector` | string | Entity filter (required) |
| `tags` | array | Tags to add |

### Tag Format

Tags can be specified in two formats:

**Key-only tags:**
```text
Add tag "critical" to service SERVICE-123
```

**Key-value tags:**
```text
Add tag "environment:production" to host HOST-ABC
```

### Addition Examples

```text
Add tag "team:platform" to all services containing "payment" in the name
```

```text
Tag all hosts in the Production management zone with "tier:frontend"
```

```text
Add tags "cost-center:engineering" and "owner:devops" to host HOST-123
```

---

## delete_tags

### Tag Deletion Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `entitySelector` | string | Entity filter (required) |
| `key` | string | Tag key to delete |
| `value` | string | Optional: specific value |
| `deleteAllWithKey` | boolean | Delete all values for key |

### Deletion Examples

```text
Remove tag "deprecated" from service SERVICE-123
```

```text
Delete all "environment" tags from hosts in staging
```

```text
Remove tag "team:legacy" from all entities
```

---

## Common Tag Patterns

### Organizational Tags

| Tag Pattern | Purpose |
|-------------|---------|
| `team:platform` | Team ownership |
| `cost-center:engineering` | Cost allocation |
| `owner:john.doe@company.com` | Individual ownership |

### Environment Tags

| Tag Pattern | Purpose |
|-------------|---------|
| `environment:production` | Environment classification |
| `tier:frontend` | Application tier |
| `region:us-east-1` | Geographic region |

### Operational Tags

| Tag Pattern | Purpose |
|-------------|---------|
| `criticality:high` | Business criticality |
| `sla:99.9` | SLA requirement |
| `pagerduty:team-platform` | Alerting integration |

---

## Use Case Examples

### Tagging Strategy Implementation

```text
Implement our tagging strategy:
1. Add "environment:production" to all entities in the Production zone
2. Add "team:platform" to infrastructure services
3. Add "criticality:high" to payment-related entities
4. Verify all entities have required tags
```

### Tag Audit

```text
Audit tags across the environment:
1. List all unique tags
2. Find entities missing required tags (environment, team, owner)
3. Find entities with deprecated tags
4. Generate compliance report
```

### Bulk Tag Update

```text
Update tags for the migration:
1. Add "migration-status:in-progress" to all legacy services
2. Remove "deprecated:true" from migrated services
3. Add "platform:kubernetes" to containerized workloads
```

### Tag-Based Reporting

```text
Generate a report by team:
1. Count entities per team tag
2. Show entity types per team
3. List untagged entities
4. Suggest tag assignments
```

### Clean Up Tags

```text
Clean up obsolete tags:
1. Find tags containing "old-" or "deprecated"
2. Find entities with these tags
3. Remove the obsolete tags
4. Verify cleanup
```
