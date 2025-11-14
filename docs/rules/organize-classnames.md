# organize-classnames

Organize Tailwind CSS class names in `className` attributes according to a predefined order, with optional grouping and comments.

## Rule Details

This rule enforces a consistent order for Tailwind CSS classes within `className` attributes. It can automatically sort classes alphabetically within their respective groups and optionally format them into a multi-line structure with comments, using a utility function like `clsx` or `cn`.

### Why use this rule?

*   **Readability:** Improves the readability of your `className` strings, especially for components with many classes.
*   **Consistency:** Ensures all developers on a team follow the same class ordering conventions.
*   **Maintainability:** Makes it easier to find, add, or remove classes without disrupting the order.
*   **Reduced Merge Conflicts:** Consistent ordering reduces unnecessary diffs and merge conflicts.

## Options

The rule accepts an optional object with the following properties:

```json
{
  "type": "object",
  "properties": {
    "format": {
      "type": "string",
      "enum": ["auto", "inline", "with-comments"],
      "default": "auto",
      "description": "Determines the output format of organized class names."
    },
    "utilityFunction": {
      "type": "string",
      "description": "Specifies a custom utility function name (e.g., 'cn') to use when 'format' is 'with-comments' or 'auto' and no 'clsx' or 'cn' import is found. Defaults to 'clsx'."
    },
    "utilityImportPath": {
      "type": "string",
      "description": "Specifies the import path for the custom utility function. Required if 'utilityFunction' is set and the utility is not already imported."
    }
  },
  "additionalProperties": false
}
```

### `format`

`"auto"` (default):
*   If `clsx` or `cn` is already imported in the file, it will format the classes using the detected utility function with comments (equivalent to `"with-comments"`).
*   Otherwise, it will format classes inline (equivalent to `"inline"`).

`"inline"`:
*   Always formats class names as a single-line string.

`"with-comments"`:
*   Always formats class names using a utility function (`clsx` or `cn`) with multi-line comments for each group.
*   If the utility function is not imported, the rule will automatically add the necessary import statement.

### `utilityFunction`

A string specifying the name of a custom utility function to use (e.g., `"cn"`). This is primarily used when `format` is `"with-comments"` or `"auto"` and you want to use a function other than `clsx` (which is the default fallback if no `cn` import is found).

### `utilityImportPath`

A string specifying the import path for your `utilityFunction`. This is required if `utilityFunction` is set and the utility is not already imported in the file. Examples: `"@/lib/utils"`, `"../lib/utils"`.

## Examples

### `format: "inline"`

#### Invalid

```jsx
// .eslintrc.js
// {
//   "rules": {
//     "tailwind-organizer/organize-classnames": ["error", { "format": "inline" }]
//   }
// }

function MyComponent() {
  return <div className="mt-4 flex items-center">Hello</div>;
}
```

#### Valid (after auto-fix)

```jsx
function MyComponent() {
  return <div className="flex items-center mt-4">Hello</div>;
}
```

### `format: "with-comments"`

#### Invalid

```jsx
// .eslintrc.js
// {
//   "rules": {
//     "tailwind-organizer/organize-classnames": ["error", { "format": "with-comments" }]
//   }
// }

function MyComponent() {
  return <div className="mt-4 flex items-center bg-blue-500">Hello</div>;
}
```

#### Valid (after auto-fix, `clsx` import added automatically)

```jsx
import { clsx } from "clsx";

function MyComponent() {
  return <div className={clsx(
    // Layout
    "flex",
    // Alignment
    "items-center",
    // Spacing
    "mt-4",
    // Background
    "bg-blue-500"
  )}>Hello</div>;
}
```

### `format: "auto"` with existing `cn` import

#### Invalid

```jsx
// .eslintrc.js
// {
//   "rules": {
//     "tailwind-organizer/organize-classnames": ["error", { "format": "auto" }]
//   }
// }

import { cn } from "@/lib/utils";

function MyComponent() {
  return <div className="mt-4 flex items-center">Hello</div>;
}
```

#### Valid (after auto-fix)

```jsx
import { cn } from "@/lib/utils";

function MyComponent() {
  return <div className={cn(
    // Layout
    "flex",
    // Alignment
    "items-center",
    // Spacing
    "mt-4"
  )}>Hello</div>;
}
```

### `format: "with-comments"` with custom `utilityFunction` and `utilityImportPath`

#### Invalid

```jsx
// .eslintrc.js
// {
//   "rules": {
//     "tailwind-organizer/organize-classnames": [
//       "error",
//       {
//         "format": "with-comments",
//         "utilityFunction": "tw",
//         "utilityImportPath": "~/utils/tailwind"
//       }
//     ]
//   }
// }

function MyComponent() {
  return <div className="mt-4 flex items-center">Hello</div>;
}
```

#### Valid (after auto-fix, `tw` import added automatically)

```jsx
import { tw } from "~/utils/tailwind";

function MyComponent() {
  return <div className={tw(
    // Layout
    "flex",
    // Alignment
    "items-center",
    // Spacing
    "mt-4"
  )}>Hello</div>;
}
```

## Class Grouping Order

The rule organizes classes into the following predefined groups. Classes are sorted alphabetically within each group.

1.  Layout
2.  Position
3.  Coordinates
4.  Display
5.  Flexbox
6.  Grid
7.  Gap
8.  Alignment
9.  Sizing
10. Spacing
11. Typography
12. Text Style
13. Background
14. Border
15. Border Radius
16. Effects
17. Filters
18. Transitions
19. Transform
20. Interactivity
21. SVG
22. Accessibility
23. Pseudo-classes (e.g., `hover:`, `focus:`)
24. Pseudo-elements (e.g., `before:`, `after:`)
25. Responsive (e.g., `sm:`, `md:`)
26. Dark Mode (`dark:`)
27. Other (any classes not matching the above groups)

## Known Limitations

*   **Template Literals with Expressions:** The rule currently skips `className` attributes that are template literals containing JavaScript expressions (e.g., `` className={`flex ${isActive ? 'active' : ''}`} ``).
*   **Complex `className` Expressions:** The rule does not process `className` attributes that are complex JavaScript expressions (e.g., `className={someCondition ? 'flex' : 'block'}`). It focuses on string literals and simple template literals.

## When Not To Use It

If you prefer to manually order your Tailwind classes or have a very specific, non-standard ordering convention that cannot be configured by this rule, you might choose not to use it.
