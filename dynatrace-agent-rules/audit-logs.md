# Audit Logs - Prompt Guide

Best practices and example prompts for audit log tools.

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_audit_logs` | List audit log entries |
| `get_audit_log` | Get specific audit log entry |

---

## list_audit_logs

### Audit Listing Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | Start time |
| `to` | string | End time |
| `filter` | string | Filter expression |
| `sort` | string | Sort order |
| `pageSize` | number | Results per page |

### Basic Audit Queries

```text
Show audit logs from the last 24 hours
```

```text
List all configuration changes today
```

```text
What changes were made in the last week?
```

### User Activity Queries

```text
Show all actions by user admin@company.com
```

```text
List login attempts from the last 7 days
```

```text
Who made changes to alerting profiles?
```

### Category Filters

```text
Show all API token changes
```

```text
List management zone modifications
```

```text
Show dashboard creation/modification events
```

---

## get_audit_log

### Audit Detail Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `logId` | string | Audit log ID (required) |

### Audit Detail Examples

```text
Get details for audit log entry 12345
```

```text
Show the full details of change log ABC123
```

---

## Filter Patterns

### By User

| Filter | Description |
|--------|-------------|
| `user("admin@company.com")` | Specific user |
| `user.contains("admin")` | User name contains |

### By Category

| Filter | Description |
|--------|-------------|
| `category("CONFIG")` | Configuration changes |
| `category("TOKEN")` | Token operations |
| `category("LOGIN")` | Login events |

### By Entity Type

| Filter | Description |
|--------|-------------|
| `entityType("alerting-profile")` | Alerting profiles |
| `entityType("dashboard")` | Dashboards |
| `entityType("management-zone")` | Management zones |

---

## Use Case Examples

### Security Audit

```text
Perform a security audit for the last 30 days:
1. List all login attempts (successful and failed)
2. API token creations and revocations
3. Permission changes
4. Unusual access patterns
```

### Change Tracking

```text
Track configuration changes:
1. Who made changes
2. What was changed
3. When changes occurred
4. Compare before/after states
```

### Compliance Report

```text
Generate a compliance report:
1. All administrative actions
2. Configuration modifications
3. Access control changes
4. Export in audit format
```

### Investigation

```text
Investigate changes before an incident:
1. List all changes 24 hours before the problem
2. Identify suspicious or unusual changes
3. Correlate with problem timeline
4. Suggest rollback candidates
```

### User Activity Report

```text
Generate a user activity report for the platform team:
1. Actions by each team member
2. Most common operations
3. Time patterns of activity
4. Unusual or concerning actions
```
