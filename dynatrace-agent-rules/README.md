# Dynatrace MCP Server - Prompt Guide

This folder contains best practices and example prompts for using the Dynatrace Managed MCP Server tools effectively.

## 📚 Available Guides

| Guide | Tools Covered |
|-------|---------------|
| [Problems Management](problems.md) | list_problems, get_problem, close_problem, comments |
| [Metrics Management](metrics.md) | list_metrics, get_metric, query_metrics, ingest_metrics |
| [Entity Management](entities.md) | list_entities, get_entity, find_entity, entity_types |
| [Events Management](events.md) | list_events, get_event, ingest_event, event_types |
| [Security & Audit](security.md) | audit_logs, vulnerabilities, logs |

## 🎯 General Best Practices

### Be Specific with Time Ranges

```
✅ Good: "Show problems from the last 24 hours"
✅ Good: "Get metrics from 2025-12-01 to 2025-12-02"
❌ Avoid: "Show me some problems"
```

### Use Entity Selectors

```
✅ Good: "List entities of type HOST in management zone Production"
✅ Good: "Find entity with name containing 'payment'"
❌ Avoid: "Show all entities" (may return too many results)
```

### Provide Context for Analysis

```
✅ Good: "Analyze the root cause of problem P-12345 and suggest remediation"
✅ Good: "Compare CPU metrics between two hosts over the last week"
❌ Avoid: "What's wrong?" (too vague)
```

## 🔧 Tool Selection Guide

| If you want to... | Use this tool |
|-------------------|---------------|
| See current issues | `list_problems` |
| Investigate an issue | `get_problem` |
| Find a service/host | `list_entities` or `find_monitored_entity_by_name` |
| Check performance | `query_metrics` |
| See what changed | `list_events` or `list_audit_logs` |
| Check security | `list_vulnerabilities` |
