# Contributing to @biggora/2checkout

Thanks for contributing.

## Prerequisites

- Node.js 20+
- npm 10+

## Local setup

```bash
git clone https://github.com/biggora/2checkout.git
cd 2checkout
npm install
```

## Development workflow

1. Create a branch from `main`.
2. Keep changes focused and include tests when behavior changes.
3. Update documentation (`README.md`, wiki) when API usage or behavior changes.
4. Add an entry to `CHANGELOG.md` for user-visible changes.

## Verification before PR

Run all checks locally:

```bash
npm test
npm run typecheck
npm run build
```

## Pull request guidelines

- Use a clear title and describe what changed and why.
- Link related issues.
- Include migration notes for breaking changes.
- Ensure GitHub Actions are green before merge.

## Reporting issues

When opening a bug report, include:

- Steps to reproduce
- Expected vs actual behavior
- Node.js version
- Relevant request/response payload snippets (redacted)
