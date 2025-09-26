# Contributing to Dynatrace Managed MCP Server

We welcome contributions to the Dynatrace Managed MCP Server! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- TypeScript 5.6+
- Access to a Dynatrace Managed environment

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/Dynatrace-Managed-MCP.git
   cd Dynatrace-Managed-MCP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Dynatrace Managed credentials
   ```

4. **Build and test**
   ```bash
   npm run build
   npm test
   ```

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for consistent formatting
- Write comprehensive JSDoc comments for all public APIs
- Follow the existing code patterns and architecture

### Testing

- Write unit tests for all new functionality
- Ensure test coverage remains above 70%
- Test with real Dynatrace Managed environments when possible
- Use descriptive test names and organize tests logically

### Commit Guidelines

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(auth): add token validation middleware`
- `fix(metrics): resolve query timeout issues`
- `docs(readme): update installation instructions`

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add/update tests as needed
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   git push origin feat/your-feature-name
   ```

5. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference any related issues
   - Include testing instructions
   - Add screenshots for UI changes

## Adding New Tools

When adding new MCP tools:

1. **Create the tool function** in `src/capabilities/`
2. **Follow the existing patterns** for error handling and validation  
3. **Add Zod schemas** for input validation
4. **Update the tool registry** in `src/index.ts`
5. **Add comprehensive tests**
6. **Update documentation**

Example tool structure:
```typescript
export async function yourNewTool(args: YourSchema) {
  // Validate input
  const validation = YourSchema.safeParse(args);
  if (!validation.success) {
    throw new Error(`Invalid input: ${validation.error.message}`);
  }

  // Implementation
  // Return raw JSON for AI interpretation
}
```

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for all public APIs  
- Update agent rules if adding new capabilities
- Include usage examples for new features

## Security Considerations

- Never commit API tokens or credentials
- Validate all inputs thoroughly
- Follow secure coding practices
- Report security issues privately

## Code Review Criteria

Pull requests will be reviewed for:

- **Functionality**: Does it work as intended?
- **Code Quality**: Is it readable, maintainable, and well-structured?
- **Testing**: Are there adequate tests with good coverage?
- **Documentation**: Is it properly documented?
- **Security**: Does it follow security best practices?
- **Performance**: Is it efficient and scalable?

## Release Process

1. Version bumps follow semantic versioning (SemVer)
2. Releases are automated via GitHub Actions
3. Changelog is generated from conventional commits
4. Docker images are built and published automatically

## Getting Help

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the comprehensive README and agent rules

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to make Dynatrace Managed MCP Server better! 🎉