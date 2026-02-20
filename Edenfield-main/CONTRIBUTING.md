# Contributing to Eden Field

Thank you for your interest in contributing to Eden Field! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on code quality and user benefit
- No harassment or discrimination
- Report concerns to team@edenfield.dev

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/MCCSS-`
3. Add upstream remote: `git remote add upstream https://github.com/9916murdock9916-bit/MCCSS-`
4. Create a feature branch: `git checkout -b feature/my-feature`

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linter
npm run lint

# Run tests
npm test
```

## Making Changes

### Code Style

Follow the ESLint configuration (`.eslintrc.json`):

```javascript
// ✓ Good
const getUserName = (user) => {
  if (!user) {
    return null;
  }
  return user.name;
};

// ✗ Bad
const getUserName = user => user && user.name;
```

### Naming Conventions

- **Variables/Functions**: `camelCase`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_CASE`
- **Private Methods**: Prefix with underscore `_privateMethod()`
- **Modules**: lowercase with hyphens `sync-queue.js`

### Comments

Write clear comments explaining *why*, not *what*:

```javascript
// ✓ Good
// Check if identity exists to prevent re-initialization
// which could cause permission context to be lost
if (identity.exists()) {
  return;
}

// ✗ Bad
// Check if identity exists
if (identity.exists()) {
  return;
}
```

### Documentation

Add JSDoc comments to all public APIs:

```javascript
/**
 * Queue an action for synchronization
 * @param {Object} action - The action to queue
 * @param {string} action.type - Action type (update, delete, etc)
 * @param {string} action.entity - Entity type
 * @param {string} action.id - Entity ID
 * @param {Object} action.data - Action payload
 * @throws {Error} If user lacks syncQueue capability
 * @returns {void}
 */
export function queue(action) {
  // Implementation
}
```

### Performance

- Avoid blocking operations in main thread
- Use async/await for I/O operations
- Batch DOM updates
- Profile regularly with DevTools
- Minimize bundle size impact

### Security

- Never log sensitive data
- Validate all user input
- Use permission guards
- Review dependencies
- Test with malicious input

## Testing

### Write Tests For:
- New features
- Bug fixes
- Complex logic
- Permission enforcement
- Data transformations

### Test Structure

```javascript
describe("Sync Queue", () => {
  describe("add()", () => {
    it("should add action to queue", () => {
      // Arrange
      const action = { type: "update", id: "123" };

      // Act
      queue.add(action);

      // Assert
      expect(queue.length).toBe(1);
    });

    it("should throw if user lacks permission", () => {
      // Arrange
      Guards.deny("syncQueue");

      // Act & Assert
      expect(() => queue.add(action)).toThrow();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test sync-queue.spec.js

# Run in watch mode
npm test -- --watch
```

## Commit Messages

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Code style changes (no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvement
- **test**: Test changes
- **chore**: Build, dependencies, etc

### Examples

```
feat(sync): add incremental sync support

Implement delta-based sync to reduce bandwidth usage on slow networks.
Maintains backward compatibility with full sync.

Closes #234
```

```
fix(permissions): prevent guard bypass in offline mode

Ensure permission checks are enforced even when sync is unavailable.
Add fallback permission cache in service worker.

Fixes #456
```

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Write descriptive PR title**
   - "Fix: Conflict resolution failure on concurrent updates"
   - "Feat: Add end-to-end encryption support"

3. **Write PR description**
   - What: Describe the change
   - Why: Explain the motivation
   - How: Describe the approach
   - Tests: List test coverage
   - Related: Reference issues #123, #456

4. **Ensure tests pass**
   ```bash
   npm run lint
   npm test
   ```

5. **Request review**
   - Assign 2-3 reviewers
   - Address all comments
   - Resolve conversations

6. **Merge**
   - Use "Squash and merge" for single logical unit
   - Use "Create a merge commit" for multi-commit features
   - Delete branch after merge

## Documentation

### Types of Documentation

1. **Code Comments**: In-code explanations
2. **JSDoc**: Public API documentation
3. **README.md**: Project overview
4. **ARCHITECTURE.md**: System design
5. **SECURITY.md**: Security guidelines
6. **API Docs**: Module reference

### Documentation Standards

- Clear and concise
- Include examples
- Explain non-obvious logic
- Keep documentation in sync with code
- Use Markdown formatting

## Issue Reporting

### Report Bugs

Use the bug template:

```
**Describe the bug**
A clear description of what the bug is.

**Steps to reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected behavior**
What should happen

**Actual behavior**
What actually happens

**Environment**
- Browser: [Chrome 120]
- OS: [macOS Sonoma]
- Version: [v1.0.0]

**Additional context**
Screenshots, error logs, etc.
```

### Request Features

Use the feature template:

```
**Is your feature related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired behavior

**Describe alternatives you've considered**
Alternative solutions

**Additional context**
Related issues, use cases, etc.
```

## Code Review Guidelines

### For Authors

- Respond to feedback constructively
- Ask questions if feedback is unclear
- Make changes and re-request review
- Keep PRs focused and reasonably sized

### For Reviewers

- Be respectful and encouraging
- Provide actionable feedback
- Ask clarifying questions
- Approve when satisfied
- Merge when approved

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Commit messages are clear
- [ ] No breaking changes (unless intentional)

## Release Process

1. **Version Bump**
   - Update VERSION file
   - Update package.json
   - Update CHANGELOG.md

2. **Testing**
   - Run full test suite
   - Manual testing on all browsers
   - Performance testing

3. **Build**
   ```bash
   npm run build
   ```

4. **Tag Release**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

5. **Deploy**
   - Deploy to staging first
   - Run smoke tests
   - Deploy to production

## Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [SECURITY.md](SECURITY.md) - Security guidelines
- [ESLint Docs](https://eslint.org/docs/)
- [Jest Testing](https://jestjs.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Questions?

- Check existing issues and PRs
- Read the documentation
- Ask in issue comments
- Contact: team@edenfield.dev

## Thank You!

Your contributions make Eden Field better. Thank you for your time and effort!
