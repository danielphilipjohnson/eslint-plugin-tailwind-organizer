# Testing the Plugin Locally

This guide explains how to test the ESLint plugin with mini projects before publishing.

## Method 1: Using npm link (Recommended)

### Step 1: Link the plugin package

From the plugin directory:

```bash
cd eslint-plugin-tailwind-organizer
npm link
```

This creates a global symlink to your plugin package.

### Step 2: Create a test project

Create a new directory for testing:

```bash
cd ..
mkdir test-plugin-project
cd test-plugin-project
npm init -y
```

### Step 3: Install ESLint and link the plugin

```bash
npm install --save-dev eslint
npm link eslint-plugin-tailwind-organizer
```

### Step 4: Create test files

Create test React/JSX files with various className patterns.

### Step 5: Configure ESLint

Create `.eslintrc.json`:

```json
{
  "plugins": ["tailwind-organizer"],
  "rules": {
    "tailwind-organizer/organize-classnames": "warn"
  },
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
```

### Step 6: Test

```bash
# Check for issues
npx eslint . --ext .js,.jsx

# Auto-fix
npx eslint . --ext .js,.jsx --fix
```

### Step 7: Unlink when done

```bash
npm unlink eslint-plugin-tailwind-organizer
cd ../eslint-plugin-tailwind-organizer
npm unlink
```

## Method 2: Using file path (Quick testing)

In your test project's `package.json`, add:

```json
{
  "devDependencies": {
    "eslint": "^8.57.1",
    "eslint-plugin-tailwind-organizer": "file:../eslint-plugin-tailwind-organizer"
  }
}
```

Then run `npm install`.

## Method 3: Using test projects in the repo

Create test projects directly in the plugin repository for CI/CD testing.

