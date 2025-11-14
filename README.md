# 🧩 eslint-plugin-tailwind-organizer

**Automatically organize your Tailwind CSS class names — clean, predictable, and consistent.**

Tailwind is powerful, but large `className=""` strings quickly become unreadable.
This plugin fixes that.

It analyzes your class names, groups them by category (layout, spacing, background, etc.), reorders them consistently, and—if you want—rewrites them into beautifully structured multiline `cn()` or `clsx()` calls with semantic comments.

Your JSX becomes a joy to read and maintain.

---

## ✨ What It Does

### 🧹 1. Cleans messy className strings

Before:

```jsx
<div className="fixed inset-x-0 top-0 z-10 min-h-[40px] bg-white py-4 sm:pb-2">
```

After:

```jsx
className={clsx(
  // Position
  "fixed",
  // Coordinates
  "inset-x-0 top-0 z-10",
  // Sizing
  "min-h-[40px]",
  // Spacing
  "py-4 sm:pb-2",
  // Background
  "bg-white"
)}
```

### 📚 2. Groups classes logically

Classes are sorted into consistent buckets:

1. Layout
2. Position
3. Coordinates
4. Display
5. Flexbox
6. Grid
7. Gap
8. Alignment
9. Sizing
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
23. Responsive variants
24. Dark mode
25. Pseudo-classes

### 🔍 3. Detects imports automatically

* If you already import `cn`, it rewrites to use it
* If you import `clsx`, it uses that
* If nothing exists, it adds the correct import for you

### 🛠️ 4. Fixable with `eslint --fix`

Your entire codebase can be normalized with one command.

---

# 🚀 Installation

```
npm install --save-dev eslint-plugin-tailwind-organizer
```

---

# 📐 ESLint Compatibility

| ESLint Version        | Status                  | Notes                                        |
| --------------------- | ----------------------- | -------------------------------------------- |
| **8.57.x**            | ✅ Fully supported       | Recommended. Fully tested.                   |
| **7.x**               | ❌ Not supported         | ESLint API limitations.                      |
| **8.x (other)**       | ⚠️ Likely supported     | Not fully tested; no known issues.           |
| **9.x (Flat Config)** | ⚠️ Experimental support | Many users report success—still stabilizing. |

### Requirements

* **ESLint ≥ 8.0.0 and < 10.0.0**
* **Node ≥ 14.0.0**
* If using `"with-comments"` mode:

  * `clsx` or a custom `cn()` function

Peer dependencies:

```json
"peerDependencies": {
  "eslint": ">=8.0.0 <10.0.0"
}
```

---

# ⚙️ Configuration

## `.eslintrc.json` or `.eslintrc.js`

```json
{
  "plugins": ["tailwind-organizer"],
  "rules": {
    "tailwind-organizer/organize-classnames": "warn"
  }
}
```

## Flat Config (ESLint 9, experimental)

```js
// eslint.config.js
import tailwindOrganizer from "eslint-plugin-tailwind-organizer";

export default [
  {
    plugins: { "tailwind-organizer": tailwindOrganizer },
    rules: {
      "tailwind-organizer/organize-classnames": "warn"
    }
  }
];
```

---

# 🧪 Inline vs. Commented Formatting

## Default (inline)

```jsx
className="flex items-center justify-center mt-4"
```

## With comments (`format: "with-comments"`)

```jsx
className={cn(
  // Layout
  "flex",
  // Alignment
  "items-center justify-center",
  // Spacing
  "mt-4"
)}
```

Add in your ESLint config:

```json
{
  "rules": {
    "tailwind-organizer/organize-classnames": ["warn", { "format": "with-comments" }]
  }
}
```

---

# 🛠️ Options

### `format`

* `"auto"` (default)
* `"inline"`
* `"with-comments"`

### `utilityFunction`

Use a custom function instead of `clsx`:

```json
"utilityFunction": "cn"
```

### `utilityImportPath`

Tell the plugin where your `cn` comes from:

```json
"utilityImportPath": "@/lib/utils"
```

---

# 🧰 CLI Tool

This plugin ships with a command to rewrite files directly.

### NPX (no install)

```
npx -p eslint-plugin-tailwind-organizer fix-tailwind-classnames
```

### Local install

```
npm install --save-dev eslint-plugin-tailwind-organizer
npx fix-tailwind-classnames
```

### Global install

```
npm i -g eslint-plugin-tailwind-organizer
fix-tailwind-classnames
```

---

# 🧠 Utility Functions (Advanced)

```js
const { utils } = require('eslint-plugin-tailwind-organizer');

utils.organizeClasses("mt-4 flex items-center", { format: "inline" });
// → "flex items-center mt-4"

utils.organizeClasses("mt-4 flex items-center", { format: "multiline" });
// → commented buckets
```

---

# 🛑 Troubleshooting

### Rule not applied?

* Ensure plugin is in `"plugins"`
* Rule name must include prefix:

  ```
  tailwind-organizer/organize-classnames
  ```
* You're using ESLint ≥8 and <10

### Auto-fix not working?

* Use:

  ```
  eslint --fix
  ```
* Ensure the rule is not `"off"`

---

# 🤝 Contributing

PRs are welcome!
If you build cool enhancements, I’d love to merge them.

---

# 📄 License

MIT

---