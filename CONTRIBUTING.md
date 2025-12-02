# Contributing to Dynatrace Managed MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Adding New Tools](#adding-new-tools)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **TypeScript** 5.6 or higher
- **Git** for version control
- Access to a **Dynatrace Managed** environment for testing

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Dynatrace-Managed-MCP.git
cd Dynatrace-Managed-MCP

# Add upstream remote
git remote add upstream https://github.com/theharithsa/Dynatrace-Managed-MCP.git
```

---

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Dynatrace Managed credentials:

```env
DYNATRACE_MANAGED_URL=https://your-cluster.dynatrace.com
DYNATRACE_ENVIRONMENT_ID=your-env-id
DYNATRACE_API_TOKEN=your-api-token
```

### 3. Build and Test

```bash
# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

---

## 🤝 How to Contribute

### Types of Contributions

| Type | Description |
|------|-------------|
| 🐛 **Bug Fixes** | Fix issues and improve stability |
| ✨ **New Features** | Add new tools or capabilities |
| 📚 **Documentation** | Improve docs, examples, and guides |
| 🧪 **Tests** | Add or improve test coverage |
| 🔧 **Refactoring** | Improve code quality without changing behavior |

### Reporting Issues

Before creating an issue:

1. Search existing issues to avoid duplicates
2. Use the issue templates when available
3. Provide detailed reproduction steps
4. Include environment information

### Suggesting Features

1. Open a GitHub Discussion first for major features
2. Describe the use case and expected behavior
3. Consider backward compatibility

---

## 📝 Pull Request Process

### 1. Create a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feat/your-feature-name
```

### 2. Make Changes

- Follow the [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed

### 3. Commit Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description
git commit -m "feat(problems): add problem correlation tool"
git commit -m "fix(metrics): resolve pagination issue"
git commit -m "docs(readme): update installation guide"
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### 4. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on GitHub with:

- Clear title following conventional commit format
- Description of changes
- Link to related issues
- Screenshots if applicable

---

## 📏 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
function getEntity(entityId: string): Promise<Entity> {
  // ...
}

// ✅ Good: Use Zod for validation
const Schema = z.object({
  entityId: z.string().describe('The entity ID'),
  fields: z.string().optional().describe('Fields to include'),
});

// ✅ Good: Handle errors properly
const parsed = Schema.safeParse(args);
if (!parsed.success) {
  throw new Error(`Invalid arguments: ${parsed.error.message}`);
}
```

### File Naming

- Use kebab-case for files: `list-problems.ts`
- Use PascalCase for types/interfaces: `DynatraceEnv`
- Use camelCase for variables/functions: `getEntityById`

### Code Organization

```typescript
// 1. Imports
import { z } from 'zod';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

// 2. Schema definition
const Schema = z.object({
  // ...
});

// 3. Export tool object
export const toolName = {
  definition: {
    name: 'tool_name',
    description: 'Tool description',
    inputSchema: zodToJsonSchema(Schema),
  },
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    // Implementation
  },
};
```

---

## ➕ Adding New Tools

### Step 1: Create Tool File

Create `src/capabilities/your-tool-name.ts`:

```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import axios from 'axios';
import { DynatraceEnv } from '../getDynatraceEnv.js';

const Schema = z.object({
  param1: z.string().describe('Parameter description'),
  param2: z.number().optional().describe('Optional parameter'),
});

export const yourToolName = {
  definition: {
    name: 'your_tool_name',
    description: 'Clear description of what this tool does',
    inputSchema: zodToJsonSchema(Schema),
  },
  
  handler: async (args: unknown, dtEnv: DynatraceEnv) => {
    const parsed = Schema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const { param1, param2 } = parsed.data;
    
    const response = await axios.get(
      `${dtEnv.url}/e/${dtEnv.environmentId}/api/v2/endpoint`,
      {
        headers: { Authorization: `Api-Token ${dtEnv.token}` },
        params: { param1, param2 },
      }
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      }],
    };
  },
};
```

### Step 2: Register in index.ts

Add the import and register the tool in `src/index.ts`.

### Step 3: Add Tests

Create `test/your-tool-name.test.ts`.

### Step 4: Update Documentation

- Add to README.md tool list
- Create prompt guide in `dynatrace-agent-rules/`

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "list_problems"

# Watch mode
npm run test:watch
```

### Writing Tests

```typescript
describe('list_problems', () => {
  it('should list problems with default parameters', async () => {
    const result = await listProblems.handler({}, mockDtEnv);
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
  });

  it('should handle invalid parameters', async () => {
    await expect(
      listProblems.handler({ pageSize: -1 }, mockDtEnv)
    ).rejects.toThrow();
  });
});
```

---

## 📚 Documentation

### What to Document

- All public APIs and tools
- Configuration options
- Usage examples
- Error handling

### Documentation Style

- Use clear, concise language
- Include code examples
- Keep docs up-to-date with code changes

---

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/theharithsa/Dynatrace-Managed-MCP/discussions)
- Check existing issues and discussions
- Review the [README](README.md) for common questions

---

Thank you for contributing! 🎉
