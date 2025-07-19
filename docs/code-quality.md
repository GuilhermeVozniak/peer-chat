# Code Quality & Development Setup

This document outlines the comprehensive code quality tools and development setup for the peer-chat project.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are properly formatted
- `npm run type-check` - Run TypeScript type checking
- `npm run code-quality` - Run all code quality checks (lint, format, type-check)
- `npm run lint-staged` - Run lint-staged (used by Git hooks)

## Code Quality Tools

### ESLint

- **Configuration**: Uses the new flat config format (ESLint v9)
- **TypeScript**: Strict type checking with `@typescript-eslint`
- **React**: Optimized rules for React 19 and Next.js 15
- **Next.js**: Specific rules for Next.js best practices
- **Prettier Integration**: No conflicts with Prettier formatting

> **Note**: You may see a warning "⚠ The Next.js plugin was not detected in your ESLint configuration." This is a harmless warning that occurs when using ESLint v9 flat config with Next.js. The Next.js rules are still working correctly via the compat layer.

### Prettier

- **Configuration**: `.prettierrc.json` with Tailwind CSS plugin
- **Single Quotes**: Enforced for consistency
- **Tailwind Classes**: Automatically sorted using `prettier-plugin-tailwindcss`

### TypeScript

- **Strict Mode**: Enabled for maximum type safety
- **Type Checking**: Comprehensive rules to catch type errors early
- **Import Organization**: Consistent import patterns

### Lint-staged

- **Staged Files Only**: Runs checks only on files that are staged for commit
- **Performance**: Faster than running checks on the entire codebase
- **Auto-fix**: Automatically fixes issues when possible
- **Type Checking**: Quick TypeScript validation for staged files

## Editor Setup

The project includes VS Code settings (`.vscode/settings.json`) that:

- Enable format on save with Prettier
- Run ESLint fixes on save
- Organize imports automatically
- Provide Tailwind CSS IntelliSense
- Configure TypeScript preferences

## Git Hooks (Husky)

The project uses Husky to enforce code quality standards through Git hooks:

- **Pre-commit Hook**: Runs lint-staged to check and fix staged files
- **Commit-msg Hook**: Enforces conventional commit message format
- **Pre-push Hook**: Runs full code quality checks before pushing

### Conventional Commits

Commit messages must follow the conventional commit format:

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Examples:

- `feat(auth): add login functionality`
- `fix(ui): resolve button alignment issue`
- `docs(readme): update installation instructions`

## Ignore Files

- `.eslintignore` - Files to exclude from ESLint (deprecated in favor of `ignores` in config)
- `.prettierignore` - Files to exclude from Prettier formatting

## Configuration Files

- `eslint.config.mjs` - ESLint flat configuration
- `.prettierrc.json` - Prettier configuration
- `.lintstagedrc.json` - Lint-staged configuration
- `.husky/` - Git hooks directory
- `.vscode/settings.json` - VS Code workspace settings

## Key Features

- **Maximum Code Quality**: Strict TypeScript + ESLint rules
- **Zero Conflicts**: Prettier and ESLint work in harmony
- **Team Consistency**: Enforced code standards
- **Performance**: Only processes changed files during commits
- **Safety**: Multiple quality gates prevent broken code from reaching the repository

## Troubleshooting

### Common Issues

1. **ESLint/Prettier Conflicts**: Resolved by using `eslint-config-prettier`
2. **TypeScript JSX Issues**: Fixed by proper `jsx: preserve` configuration
3. **Husky Hooks Not Running**: Ensure hooks are executable with `chmod +x .husky/*`
4. **Next.js Plugin Warning**: Harmless warning due to ESLint v9 flat config format

### Getting Help

If you encounter issues with the development setup:

1. Check that all dependencies are installed: `pnpm install`
2. Verify Node.js version matches `.nvmrc`
3. Run `pnpm run code-quality` to check overall setup
4. Check VS Code extensions are installed and enabled 