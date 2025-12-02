# Vulnerabilities - Prompt Guide

Best practices and example prompts for vulnerability tools.

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_vulnerabilities` | List security vulnerabilities |
| `get_vulnerability_details` | Get vulnerability details |

---

## list_vulnerabilities

### Vulnerability Listing Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `vulnerabilitySelector` | string | Filter expression |
| `entitySelector` | string | Filter by affected entity |
| `from` | string | Start time |
| `to` | string | End time |
| `pageSize` | number | Results per page |

### Basic Vulnerability Queries

```text
List all vulnerabilities
```

```text
Show critical vulnerabilities
```

```text
What vulnerabilities were detected this week?
```

### Severity Filtering

```text
Show HIGH and CRITICAL severity vulnerabilities
```

```text
List all MEDIUM vulnerabilities in production
```

### Entity-Scoped Queries

```text
Show vulnerabilities affecting the payment-service
```

```text
List vulnerabilities on production hosts
```

```text
What vulnerabilities exist in Kubernetes workloads?
```

---

## get_vulnerability_details

### Detail Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `vulnerabilityId` | string | Vulnerability ID (required) |

### Detail Examples

```text
Get details for vulnerability SNYK-JAVA-123
```

```text
Show the CVE information for vulnerability V-456
```

```text
What remediation steps exist for vulnerability V-789?
```

---

## Vulnerability Selectors

### By Status

| Selector | Description |
|----------|-------------|
| `status("OPEN")` | Open vulnerabilities |
| `status("RESOLVED")` | Resolved vulnerabilities |
| `status("MUTED")` | Muted vulnerabilities |

### By Severity

| Selector | Description |
|----------|-------------|
| `riskLevel("CRITICAL")` | Critical severity |
| `riskLevel("HIGH")` | High severity |
| `riskLevel("MEDIUM")` | Medium severity |
| `riskLevel("LOW")` | Low severity |

### By Type

| Selector | Description |
|----------|-------------|
| `type("THIRD_PARTY")` | Third-party vulnerabilities |
| `type("CODE")` | Code vulnerabilities |
| `type("RUNTIME")` | Runtime vulnerabilities |

---

## Use Case Examples

### Security Dashboard

```text
Generate a security dashboard:
1. Count of vulnerabilities by severity
2. Trend over the last 30 days
3. Most affected entities
4. Critical items requiring immediate attention
```

### Compliance Report

```text
Generate a vulnerability compliance report:
1. All open vulnerabilities with CVE IDs
2. CVSS scores and affected components
3. Remediation status
4. SLA compliance (time to remediate)
```

### Risk Assessment

```text
Perform a risk assessment for the payment service:
1. List all vulnerabilities
2. Calculate risk score
3. Identify attack vectors
4. Prioritize remediation
```

### Remediation Planning

```text
Create a remediation plan:
1. Group vulnerabilities by component
2. Identify required updates
3. Estimate effort
4. Prioritize by business impact
```

### Trend Analysis

```text
Analyze vulnerability trends:
1. New vulnerabilities this month vs last month
2. Resolution rate
3. Most common vulnerability types
4. Teams with most open vulnerabilities
```
