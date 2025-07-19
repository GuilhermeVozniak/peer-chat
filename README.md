This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Code Quality & Development

This project is configured with comprehensive code quality tools to ensure the best development experience and code consistency.

### Available Scripts

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

### Code Quality Tools

#### ESLint

- **Configuration**: Uses the new flat config format (ESLint v9)
- **TypeScript**: Strict type checking with `@typescript-eslint`
- **React**: Optimized rules for React 19 and Next.js 15
- **Next.js**: Specific rules for Next.js best practices
- **Tailwind**: Class validation and ordering
- **Prettier Integration**: No conflicts with Prettier formatting

#### Prettier

- **Configuration**: `.prettierrc.json` with Tailwind CSS plugin
- **Single Quotes**: Enforced for consistency
- **Tailwind Classes**: Automatically sorted using `prettier-plugin-tailwindcss`

#### TypeScript

- **Strict Mode**: Enabled for maximum type safety
- **Type Checking**: Comprehensive rules to catch type errors early
- **Import Organization**: Consistent import patterns

#### Lint-staged

- **Staged Files Only**: Runs checks only on files that are staged for commit
- **Performance**: Faster than running checks on the entire codebase
- **Auto-fix**: Automatically fixes issues when possible
- **Type Checking**: Quick TypeScript validation for staged files

### Editor Setup

The project includes VS Code settings (`.vscode/settings.json`) that:

- Enable format on save with Prettier
- Run ESLint fixes on save
- Organize imports automatically
- Provide Tailwind CSS IntelliSense
- Configure TypeScript preferences

### Git Hooks (Husky)

The project uses Husky to enforce code quality standards through Git hooks:

- **Pre-commit Hook**: Runs lint-staged to check and fix staged files
- **Commit-msg Hook**: Enforces conventional commit message format
- **Pre-push Hook**: Runs full code quality checks before pushing

#### Conventional Commits

Commit messages must follow the conventional commit format:

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Examples:

- `feat(auth): add login functionality`
- `fix(ui): resolve button alignment issue`
- `docs(readme): update installation instructions`

### Ignore Files

- `.eslintignore` - Files to exclude from ESLint
- `.prettierignore` - Files to exclude from Prettier formatting

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
