# Contributing to HeatShield

Thank you for your interest in contributing to HeatShield! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/heatshield.git
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```env
FORTYGUARD_API_KEY=your_fortyguard_api_key
FEATHERLESS_API_KEY=your_featherless_api_key
```

### Running Locally

```bash
npm run dev
# → http://localhost:3000
```

### Code Quality

Before submitting a PR, ensure:

- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes without warnings
- [ ] Your code follows the existing style
- [ ] You've tested on mobile viewports

## Pull Request Process

1. **Update documentation** if you've changed APIs or features
2. **Write clear commit messages** describing your changes
3. **Keep PRs focused** — one feature or fix per PR
4. **Describe your changes** in the PR description

### PR Template

```markdown
## What
Brief description of the changes.

## Why
Why these changes are needed.

## How
How you implemented the changes.

## Testing
How you tested the changes.

## Screenshots
If applicable, add screenshots.
```

## Code Style

### TypeScript

- Use TypeScript for all new files
- Prefer `interface` over `type` for object shapes
- Use `readonly` for constants
- Avoid `any` — use `unknown` if needed

### React

- Use functional components with hooks
- Keep components small and focused
- Use `'use client'` directive only when needed
- Prefer composition over inheritance

### Tailwind CSS

- Use the design system tokens in `globals.css`
- Follow the naming conventions in existing components
- Keep classes consistent with the existing codebase

## Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser/device information

### Feature Requests

Include:
- Clear description of the feature
- Why it would be useful
- How it should work
- Any mockups or examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
