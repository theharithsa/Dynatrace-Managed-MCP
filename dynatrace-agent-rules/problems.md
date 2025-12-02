# Problems Management - Prompt Guide

Best practices and example prompts for problem management tools.

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_problems` | List problems with filtering |
| `get_problem` | Get detailed problem information |
| `close_problem` | Close a problem with message |
| `add_comment` | Add comment to problem |
| `list_comments` | List problem comments |
| `get_comment` | Get specific comment |
| `update_comment` | Update a comment |
| `delete_comment` | Delete a comment |

---

## list_problems

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | Start time (e.g., "now-24h", "2025-12-01T00:00:00Z") |
| `to` | string | End time (e.g., "now") |
| `status` | string | "OPEN" or "CLOSED" |
| `problemSelector` | string | Filter expression |
| `entitySelector` | string | Filter by entity |
| `fields` | string | Additional fields to include |
| `pageSize` | number | Results per page (1-500) |

### Example Prompts

#### Basic Queries

```text
Show me all open problems
```

```text
List problems from the last 24 hours
```

```text
What problems occurred last week?
```

#### Filtered Queries

```text
Show open problems affecting hosts in the Production management zone
```

```text
List all availability problems from the last 7 days
```

```text
Find problems related to the payment-service
```

#### Analysis Queries

```text
Analyze the problems from the last 30 days, group them by affected entity, 
and identify recurring issues
```

```text
Compare problem frequency between this week and last week
```

```text
Which entities have the most problems this month?
```

---

## get_problem

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `problemId` | string | The problem ID (e.g., "P-12345" or full ID) |
| `fields` | string | Additional fields (+evidenceDetails, +impactAnalysis) |

### Example Prompts

```text
Get details for problem P-12345
```

```text
Show me the root cause analysis for problem P-12345
```

```text
What entities are impacted by problem P-12345?
```

```text
Show the timeline of events for problem P-12345
```

---

## close_problem

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `problemId` | string | The problem ID to close |
| `message` | string | Closing message/reason |

### Example Prompts

```text
Close problem P-12345 with message "Resolved by infrastructure team"
```

```text
Mark problem P-12345 as resolved - root cause was memory leak, fixed in v2.1.0
```

---

## Problem Comments

### add_comment

```text
Add a comment to problem P-12345: "Investigating - appears to be network related"
```

### list_comments

```text
Show all comments on problem P-12345
```

### update_comment

```text
Update comment C-789 on problem P-12345 to "Issue resolved by restarting service"
```

---

## Advanced Use Cases

### Root Cause Analysis

```text
For problem P-12345:
1. Show the problem details with evidence
2. List all affected entities
3. Show related events in the same timeframe
4. Check if there were any deployments before the problem
```

### Incident Response

```text
We have an ongoing incident. Please:
1. List all open problems sorted by severity
2. Identify the root cause entities
3. Check if there are related problems
4. Suggest remediation steps based on the evidence
```

### Recurring Problem Detection

```text
Analyze problems from the last 30 days and identify:
1. Entities with recurring problems
2. Time patterns (specific days/hours)
3. Common root causes
4. Suggested preventive actions
```
