# Test Projects

These mini projects are used to test the ESLint plugin in different scenarios.

## Projects

- **basic-react**: Simple React project with JSX
- **nextjs**: Next.js project configuration
- **typescript**: TypeScript + React project

## How to Test

### 1. Build/Link the Plugin

From the plugin root directory:

```bash
npm link
```

### 2. Test Each Project

For each test project:

```bash
cd test-projects/basic-react  # or nextjs, typescript
npm install
npm link eslint-plugin-tailwind-organizer
npm run lint        # Check for issues
npm run lint-fix    # Auto-fix issues
```

### 3. Verify Results

- Check that unorganized classes are detected
- Verify auto-fix works correctly
- Ensure no false positives on already-organized classes
- Test with different quote styles (single/double)

### 4. Clean Up

```bash
npm unlink eslint-plugin-tailwind-organizer
cd ../../eslint-plugin-tailwind-organizer
npm unlink
```

## Quick Test Script

You can also create a script to test all projects at once:

```bash
#!/bin/bash
cd eslint-plugin-tailwind-organizer
npm link

for project in test-projects/*/; do
  echo "Testing $project"
  cd "$project"
  npm install
  npm link eslint-plugin-tailwind-organizer
  npm run lint
  cd ../..
done

cd eslint-plugin-tailwind-organizer
npm unlink
```

