# eslint-plugin-tailwind-organizer

ESLint plugin to automatically organize Tailwind CSS class names using custom grouping logic.

## Installation

```bash
npm install --save-dev eslint-plugin-tailwind-organizer
```

## Requirements

- ESLint >=8.0.0 and <10.0.0
- Node.js >=14.0.0
- **For `format: "with-comments"`**: `clsx` package (or custom `cn` function - see below)

## Usage

### Configuration

Add the plugin to your ESLint configuration:

**For `.eslintrc.json` or `.eslintrc.js`:**
```json
{
  "plugins": ["tailwind-organizer"],
  "rules": {
    "tailwind-organizer/organize-classnames": "warn"
  }
}
```

**For ESLint v9+ flat config (`eslint.config.js`):**
```javascript
import tailwindOrganizer from 'eslint-plugin-tailwind-organizer';

export default [
  {
    plugins: {
      'tailwind-organizer': tailwindOrganizer,
    },
    rules: {
      'tailwind-organizer/organize-classnames': 'warn',
    },
  },
];
```

### Running ESLint

```bash
# Check for issues
npx eslint . --ext .js,.jsx,.ts,.tsx

# Auto-fix issues
npx eslint . --ext .js,.jsx,.ts,.tsx --fix
```

### Examples

**Before:**
```jsx
<div className="mt-4 flex flex-col items-center justify-center text-center md:mt-0 md:flex-row">
  <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white">
    Click me
  </button>
</div>
```

**After auto-fix:**
```jsx
<div className="flex flex-col md:flex-row items-center justify-center mt-4 md:mt-0 text-center">
  <button className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
    Click me
  </button>
</div>
```

## Rules

### `organize-classnames`

Organizes Tailwind CSS class names in `className` attributes according to a logical grouping system.

**Options:**
- `format` (string): Format style for organized classes
  - `"auto"` (default): Automatically detect - uses comments with `cn()` or `clsx()` if imported, otherwise inline
  - `"inline"`: Always use simple inline format without comments
  - `"with-comments"`: Always format with comments using `cn()` or `clsx()` - automatically adds import if missing
- `utilityFunction` (string, optional): Custom utility function name to use when neither `cn` nor `clsx` is imported. Defaults to `"clsx"`. Example: `"cn"` to use your custom `cn` function.
- `utilityImportPath` (string, optional): Import path for custom utility function. Only used when `utilityFunction` is set. Example: `"@/lib/utils"` for `cn` function.

**Fixable:** Yes

**Example configurations:**

Auto-detect format (default - uses comments if `cn` is imported):
```json
{
  "rules": {
    "tailwind-organizer/organize-classnames": "warn"
  }
}
```

Force inline format (never use comments):
```json
{
  "rules": {
    "tailwind-organizer/organize-classnames": ["warn", { "format": "inline" }]
  }
}
```

Force comments format (works with or without `cn`):
```json
{
  "rules": {
    "tailwind-organizer/organize-classnames": ["warn", { "format": "with-comments" }]
  }
}
```

With custom utility function:
```json
{
  "rules": {
    "tailwind-organizer/organize-classnames": [
      "warn",
      {
        "format": "with-comments",
        "utilityFunction": "cn",
        "utilityImportPath": "@/lib/utils"
      }
    ]
  }
}
```

When `format: "with-comments"` is set, the rule will format classes with comments:

**With `cn` imported:**
```jsx
// Before
<div className="mt-4 flex items-center">

// After (with cn)
<div className={cn(
  // Layout
  "flex",
  // Alignment
  "items-center",
  // Spacing
  "mt-4"
)}>
```

**Without `cn` imported (using `format: "with-comments"`):**
```jsx
// Before
<div className="mt-4 flex items-center">

// After (automatically adds cn import and formats with comments)
import { cn } from "@/lib/utils";  // ← Auto-added

<div className={cn(
  // Layout
  "flex",
  // Alignment
  "items-center",
  // Spacing
  "mt-4"
)}>
```

**Note:** 
- When `format: "with-comments"` is used, it uses `cn()` or `clsx()` format based on what's available
- The rule intelligently detects which utility to use:
  - If `cn` or `clsx` is already imported → uses that
  - If `cn()` is used elsewhere in the file → uses `cn` and adds import
  - If utils file is imported → uses `cn` and adds import to utils
  - **Otherwise defaults to `clsx`** (standard npm package - see dependency requirement below)
- The rule detects your import style (`@/` aliases or relative paths) and uses the appropriate format

**Required Dependency:**
When using `format: "with-comments"` without existing imports, the rule defaults to `clsx` and requires the `clsx` package to be installed:
```bash
npm install clsx
```

The rule will automatically add `import { clsx } from "clsx";` when needed.

**Using Custom `cn` Function:**
If you have a custom `cn` function that wraps `clsx` with `tailwind-merge`:
```typescript
// src/lib/utils.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Option 1: Import `cn` in your file** (rule will automatically detect and use it):
```jsx
import { cn } from "@/lib/utils";  // Rule will detect and use cn()
<div className={cn(/* Layout */ "flex", /* Spacing */ "mt-4")}>
```

**Option 2: Configure custom utility in ESLint config** (rule will use it when neither `cn` nor `clsx` is imported):
```json
{
  "rules": {
    "tailwind-organizer/organize-classnames": [
      "warn",
      {
        "format": "with-comments",
        "utilityFunction": "cn",
        "utilityImportPath": "@/lib/utils"
      }
    ]
  }
}
```

This way, the rule will automatically use your custom `cn` function and add the import when needed, even if `cn` isn't imported in the file.

**Utility Detection:**
The rule automatically detects both `cn` and `clsx` imports:
- **cn**: `import { cn } from "@/lib/utils"` or `import cn from "@/lib/utils"`
- **clsx**: `import clsx from "clsx"` or `import { clsx } from "clsx"`

**Examples:**

With `cn` imported:
```jsx
import { cn } from "@/lib/utils";
<div className={cn(/* Layout */ "flex", /* Spacing */ "mt-4")}>
```

With `clsx` imported:
```jsx
import clsx from "clsx";
<div className={clsx(/* Layout */ "flex", /* Spacing */ "mt-4")}>
```

**Usage with lint-fix:**
```bash
# Run ESLint with auto-fix
npm run lint-fix

# Or directly with ESLint
npx eslint --fix .
```

The rule will automatically format classes when you run `eslint --fix` or your project's `lint-fix` script.

## Class Organization Order

Classes are organized in the following order:

1. Layout (container, flex, grid, etc.)
2. Position (static, fixed, absolute, etc.)
3. Coordinates (inset, top, right, z-index, etc.)
4. Display (visible, overflow, etc.)
5. Flexbox (flex-row, flex-col, etc.)
6. Grid (grid-cols, grid-rows, etc.)
7. Gap (gap, space)
8. Alignment (justify, items, content, etc.)
9. Sizing (width, height, etc.)
10. Spacing (padding, margin)
11. Typography (font, text, leading, etc.)
12. Text Style (uppercase, underline, etc.)
13. Background
14. Border
15. Border Radius
16. Effects (shadow, opacity, etc.)
17. Filters
18. Transitions
19. Transform
20. Interactivity
21. SVG
22. Accessibility
23. Responsive variants (sm:, md:, lg:, etc.)
24. Dark mode variants (dark:)
25. Pseudo-classes (hover:, focus:, etc.)

## CLI Tool

The package includes a CLI tool to format className attributes with comments using the `cn()` utility:

```bash
# Option 1: Use npx (no installation needed)
npx -p eslint-plugin-tailwind-organizer fix-tailwind-classnames

# Option 2: Install as dev dependency and use via npx
npm install --save-dev eslint-plugin-tailwind-organizer
npx fix-tailwind-classnames

# Option 3: Install globally
npm install -g eslint-plugin-tailwind-organizer
fix-tailwind-classnames

# Fix all files in current directory
fix-tailwind-classnames

# Fix specific files
fix-tailwind-classnames src/components/Button.tsx src/App.tsx
```

This will convert:
```jsx
<div className="mt-4 flex items-center">
```

To:
```jsx
<div className={cn(
  // Layout
  "flex",
  // Alignment
  "items-center",
  // Spacing
  "mt-4",
)}>
```

And automatically adds the `cn` import if needed.

## Utilities

The plugin also exports utility functions for advanced usage:

```javascript
const { utils } = require('eslint-plugin-tailwind-organizer');

// Organize classes inline
const organized = utils.organizeClasses('mt-4 flex items-center', {
  format: 'inline'
});
// Returns: "flex items-center mt-4"

// Organize classes with multiline format (includes comments)
const multiline = utils.organizeClasses('mt-4 flex items-center', {
  format: 'multiline'
});
// Returns:
// // Layout
// flex
// // Spacing
// mt-4
// // Alignment
// items-center

// Generate JSX format with cn() utility
const jsx = utils.generateJSXClassName('mt-4 flex items-center', {
  componentName: 'div'
});
```

## Migration from Local Rules

If you're currently using local ESLint rules with `--rulesdir`, you can migrate to this package:

1. **Install the package:**
   ```bash
   npm install --save-dev eslint-plugin-tailwind-organizer
   ```

2. **Update your `.eslintrc.json`:**
   ```json
   {
     "plugins": ["tailwind-organizer"],
     "rules": {
       "tailwind-organizer/organize-classnames": "warn"
     }
   }
   ```

3. **Remove `--rulesdir` from your npm scripts:**
   ```json
   {
     "scripts": {
       "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
       "lint-fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix"
     }
   }
   ```

4. **Remove local rule files** (optional, after verifying everything works)

## Troubleshooting

### Rule not being applied

- Ensure the plugin is listed in the `plugins` array
- Check that the rule name includes the plugin prefix: `tailwind-organizer/organize-classnames`
- Verify ESLint version is >=8.0.0 and <10.0.0

### Auto-fix not working

- Ensure you're using the `--fix` flag: `eslint --fix`
- Check that the rule is set to a fixable level (`warn` or `error`, not `off`)

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run ESLint rule tests (using RuleTester)
npm run test:eslint
```

### Test Structure

- `tests/lib/` - Unit tests for library functions (`organizeClasses`, `generateJSXClassName`)
- `tests/bin/` - Unit tests for CLI functions (`formatWithComments`, `fixFileContent`, `walkDir`)
- `tests/rules/` - ESLint rule tests using `RuleTester`

### Coverage

The test suite aims for comprehensive coverage of:
- All class organization logic and edge cases
- Different format options (inline, multiline, with-comments)
- File processing and import detection
- Directory walking and file filtering

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

