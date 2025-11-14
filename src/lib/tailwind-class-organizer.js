// Define class groups with labels
const classGroups = [
  {
    label: "Layout",
    patterns: [
      "container",
      "box-border",
      "box-content",
      "block",
      "inline-block",
      "inline",
      "flex",
      "inline-flex",
      "table",
      "inline-table",
      "grid",
      "inline-grid",
      "contents",
      "list-item",
      "hidden",
    ],
  },
  {
    label: "Position",
    patterns: ["static", "fixed", "absolute", "relative", "sticky"],
  },
  {
    label: "Coordinates",
    patterns: ["inset-", "top-", "right-", "bottom-", "left-", "z-"],
  },
  {
    label: "Display",
    patterns: ["visible", "invisible", "collapse", "overflow-", "overscroll-"],
  },
  {
    label: "Flexbox",
    patterns: [
      "flex-row",
      "flex-col",
      "flex-wrap",
      "flex-1",
      "flex-auto",
      "flex-initial",
      "flex-none",
      "grow",
      "shrink",
    ],
  },
  {
    label: "Grid",
    patterns: [
      "grid-cols-",
      "grid-rows-",
      "col-",
      "row-",
      "grid-flow-",
      "auto-cols-",
      "auto-rows-",
    ],
  },
  {
    label: "Gap",
    patterns: ["gap-", "space-"],
  },
  {
    label: "Alignment",
    patterns: ["justify-", "items-", "content-", "self-", "place-"],
  },
  {
    label: "Sizing",
    patterns: ["w-", "min-w-", "max-w-", "h-", "min-h-", "max-h-", "size-"],
  },
  {
    label: "Spacing",
    patterns: [
      "p-",
      "px-",
      "py-",
      "pt-",
      "pr-",
      "pb-",
      "pl-",
      "m-",
      "mx-",
      "my-",
      "mt-",
      "mr-",
      "mb-",
      "ml-",
    ],
  },
  {
    label: "Typography",
    patterns: [
      "font-",
      "text-",
      "leading-",
      "tracking-",
      "line-clamp-",
      "whitespace-",
      "break-",
      "hyphens-",
    ],
  },
  {
    label: "Text Style",
    patterns: [
      "uppercase",
      "lowercase",
      "capitalize",
      "normal-case",
      "underline",
      "overline",
      "line-through",
      "no-underline",
      "antialiased",
      "subpixel-antialiased",
      "italic",
      "not-italic",
    ],
  },
  {
    label: "Background",
    patterns: ["bg-"],
  },
  {
    label: "Border",
    patterns: ["border", "divide-", "outline-", "ring-"],
  },
  {
    label: "Border Radius",
    patterns: ["rounded-"],
  },
  {
    label: "Effects",
    patterns: ["shadow-", "opacity-", "mix-blend-", "bg-blend-"],
  },
  {
    label: "Filters",
    patterns: [
      "blur-",
      "brightness-",
      "contrast-",
      "grayscale",
      "hue-rotate-",
      "invert",
      "saturate-",
      "sepia",
      "backdrop-",
      "drop-shadow-",
    ],
  },
  {
    label: "Transitions",
    patterns: ["transition-", "duration-", "ease-", "delay-", "animate-"],
  },
  {
    label: "Transform",
    patterns: [
      "scale-",
      "rotate-",
      "translate-",
      "skew-",
      "origin-",
      "transform",
    ],
  },
  {
    label: "Interactivity",
    patterns: [
      "appearance-",
      "cursor-",
      "pointer-events-",
      "resize-",
      "scroll-",
      "select-",
      "user-select-",
      "touch-",
      "will-change-",
    ],
  },
  {
    label: "SVG",
    patterns: ["fill-", "stroke-"],
  },
  {
    label: "Accessibility",
    patterns: ["sr-only", "not-sr-only"],
  },
];

// Pseudo-class patterns (these get special handling)
const pseudoPatterns = [
  { label: "Hover", pattern: "hover:" },
  { label: "Focus", pattern: "focus:" },
  { label: "Active", pattern: "active:" },
  { label: "Disabled", pattern: "disabled:" },
  { label: "Visited", pattern: "visited:" },
  { label: "Checked", pattern: "checked:" },
  { label: "Group", pattern: "group-" },
  { label: "Peer", pattern: "peer-" },
];

const pseudoElementPatterns = [
  { label: "Before/After", pattern: ["before:", "after:"] },
  { label: "Placeholder", pattern: "placeholder:" },
  { label: "Selection", pattern: "selection:" },
  { label: "First/Last", pattern: ["first:", "last:", "odd:", "even:"] },
];

const responsivePatterns = [
  { label: "Responsive", pattern: ["sm:", "md:", "lg:", "xl:", "2xl:"] },
];

const darkModePattern = { label: "Dark Mode", pattern: "dark:" };

function matchesPattern(className, patterns) {
  if (!Array.isArray(patterns)) patterns = [patterns];

  return patterns.some((pattern) => {
    if (pattern.endsWith("-") || pattern.endsWith(":")) {
      return className.includes(pattern);
    }
    return className === pattern || className.split(":").pop() === pattern;
  });
}

function organizeClasses(classString, options) {
  const resolvedOptions = options || {};
  const format = resolvedOptions.format || "inline";

  const classes = (classString || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const organized = {};
  const ungrouped = [];

  // Organize into groups
  classes.forEach((cls) => {
    let matched = false;

    // Check base utility groups
    for (const group of classGroups) {
      if (matchesPattern(cls, group.patterns)) {
        if (!organized[group.label]) organized[group.label] = [];
        organized[group.label].push(cls);
        matched = true;
        break;
      }
    }

    if (matched) return;

    // Check pseudo-classes
    for (const pseudo of pseudoPatterns) {
      if (matchesPattern(cls, pseudo.pattern)) {
        if (!organized[pseudo.label]) organized[pseudo.label] = [];
        organized[pseudo.label].push(cls);
        matched = true;
        break;
      }
    }

    if (matched) return;

    // Check pseudo-elements
    for (const pseudo of pseudoElementPatterns) {
      if (matchesPattern(cls, pseudo.pattern)) {
        if (!organized[pseudo.label]) organized[pseudo.label] = [];
        organized[pseudo.label].push(cls);
        matched = true;
        break;
      }
    }

    if (matched) return;

    // Check responsive
    for (const resp of responsivePatterns) {
      if (matchesPattern(cls, resp.pattern)) {
        if (!organized[resp.label]) organized[resp.label] = [];
        organized[resp.label].push(cls);
        matched = true;
        break;
      }
    }

    if (matched) return;

    // Check dark mode
    if (matchesPattern(cls, darkModePattern.pattern)) {
      if (!organized[darkModePattern.label])
        organized[darkModePattern.label] = [];
      organized[darkModePattern.label].push(cls);
      matched = true;
    }

    if (!matched) {
      ungrouped.push(cls);
    }
  });

  // Format output
  if (format === "multiline") {
    const lines = [];

    // Maintain logical order
    const orderedGroups = [
      ...classGroups.map((g) => g.label),
      ...pseudoPatterns.map((p) => p.label),
      ...pseudoElementPatterns.map((p) => p.label),
      ...responsivePatterns.map((r) => r.label),
      darkModePattern.label,
    ];

    orderedGroups.forEach((label) => {
      if (organized[label] && organized[label].length > 0) {
        lines.push(`// ${label}`);
        lines.push(`${organized[label].join(" ")}`);
      }
    });

    if (ungrouped.length > 0) {
      lines.push("// Other");
      lines.push(ungrouped.join(" "));
    }

    return lines.join("\n");
  } else {
    // Inline format
    const parts = [];

    const orderedGroups = [
      ...classGroups.map((g) => g.label),
      ...pseudoPatterns.map((p) => p.label),
      ...pseudoElementPatterns.map((p) => p.label),
      ...responsivePatterns.map((r) => r.label),
      darkModePattern.label,
    ];

    orderedGroups.forEach((label) => {
      if (organized[label] && organized[label].length > 0) {
        parts.push(organized[label].join(" "));
      }
    });

    if (ungrouped.length > 0) {
      parts.push(ungrouped.join(" "));
    }

    return parts.join(" ");
  }
}

// Generate JSX/TSX formatted className with comments
function generateJSXClassName(classString, options) {
  const resolvedOptions = options || {};
  const componentName = resolvedOptions.componentName || "select";

  const classes = (classString || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const organized = {};
  const ungrouped = [];

  // Organize classes (same logic as above)
  classes.forEach((cls) => {
    let matched = false;

    for (const group of classGroups) {
      if (matchesPattern(cls, group.patterns)) {
        if (!organized[group.label]) organized[group.label] = [];
        organized[group.label].push(cls);
        matched = true;
        break;
      }
    }

    if (matched) return;

    for (const pseudo of [...pseudoPatterns, ...pseudoElementPatterns]) {
      if (matchesPattern(cls, pseudo.pattern)) {
        if (!organized[pseudo.label]) organized[pseudo.label] = [];
        organized[pseudo.label].push(cls);
        matched = true;
        break;
      }
    }

    if (matched) return;

    for (const resp of responsivePatterns) {
      if (matchesPattern(cls, resp.pattern)) {
        if (!organized[resp.label]) organized[resp.label] = [];
        organized[resp.label].push(cls);
        matched = true;
        break;
      }
    }

    if (matched) return;

    if (matchesPattern(cls, darkModePattern.pattern)) {
      if (!organized[darkModePattern.label])
        organized[darkModePattern.label] = [];
      organized[darkModePattern.label].push(cls);
      matched = true;
    }

    if (!matched) ungrouped.push(cls);
  });

  // Generate JSX output
  let output = `<${componentName}\n  className={clsx(\n`;

  const orderedGroups = [
    ...classGroups.map((g) => g.label),
    ...pseudoPatterns.map((p) => p.label),
    ...pseudoElementPatterns.map((p) => p.label),
    ...responsivePatterns.map((r) => r.label),
    darkModePattern.label,
  ];

  orderedGroups.forEach((label) => {
    if (organized[label] && organized[label].length > 0) {
      output += `    // ${label}\n`;
      output += `    "${organized[label].join(" ")}",\n`;
    }
  });

  if (ungrouped.length > 0) {
    output += `    // Other\n`;
    output += `    "${ungrouped.join(" ")}",\n`;
  }

  output += `  )}
/>`;

  return output;
}

function getOrganizedGroups(classes) {
  // Use multiline format to get organized groups with comments
  const multiline = organizeClasses(classes, { format: "multiline" });
  const lines = multiline.split("\n");

  // Build array of {comment, classes} pairs
  const groups = [];
  let currentComment = null;
  let currentClasses = [];

  lines.forEach((line) => {
    if (line.startsWith("//")) {
      // Save previous group if exists
      if (currentComment !== null || currentClasses.length > 0) {
        groups.push({
          comment: currentComment,
          classes: currentClasses.join(" "),
        });
      }
      // Start new group
      currentComment = line.substring(2).trim();
      currentClasses = [];
    } else if (line.trim()) {
      currentClasses.push(line.trim());
    }
  });

  // Don't forget the last group
  if (currentComment !== null || currentClasses.length > 0) {
    groups.push({
      comment: currentComment,
      classes: currentClasses.join(" "),
    });
  }

  return groups.filter((g) => g.classes);
}

function formatWithComments(classes, utilityName = "cn") {
  const groups = getOrganizedGroups(classes);

  if (groups.length === 0) {
    return classes;
  }

  // If there's only one group and its classes string is identical to the original input,
  // and it has a comment, it means the original input was a single class that got grouped.
  // In this specific case, we should return the classes string directly without wrapping it in cn().
  if (groups.length === 1 && groups[0].classes === classes && groups[0].comment) {
    return classes;
  }

  // Format as utility function (cn() or clsx()) with comments
  const parts = groups.map((g) => {
    if (g.comment) {
      return `    // ${g.comment}\n    "${g.classes}"`;
    }
    return `    "${g.classes}"`;
  });

  return `{${utilityName}(
${parts.join(",\n")}
  )}`;
}

function hasCnImport(sourceCode) {
  const text = sourceCode.getText();
  // Check for various import patterns - be more thorough
  return (
    // Named import: import { cn } from "..."
    /import\s+.*\{[^}]*\bcn\b[^}]*\}.*from/.test(text) ||
    // Default import: import cn from "..."
    /import\s+cn\s+from/.test(text) ||
    // Mixed: import cn, { other } from "..." or import { other, cn } from "..."
    /import\s+.*\bcn\b.*from/.test(text) ||
    // Require: const cn = require("...")
    /require\s*\([^)]*cn/.test(text) ||
    // Already using cn() in the file (indicates it's available)
    /className\s*=\s*\{cn\(/.test(text)
  );
}

function hasClsxImport(sourceCode) {
  const text = sourceCode.getText();
  // Check for clsx import patterns
  return (
    // Named import: import { clsx } from "..."
    /import\s+.*\{[^}]*\bclsx\b[^}]*\}.*from/.test(text) ||
    // Default import: import clsx from "..."
    /import\s+clsx\s+from/.test(text) ||
    // Mixed imports
    /import\s+.*\bclsx\b.*from/.test(text) ||
    // Require: const clsx = require("...")
    /require\s*\([^)]*clsx/.test(text) ||
    // Already using clsx() in the file
    /className\s*=\s*\{clsx\(/.test(text)
  );
}

// ! cant i just check if there is a function present in the
function getUtilityFunction(sourceCode, customUtility, customImportPath) {
  const text = sourceCode.getText();
  
  // Check if already imported (prefer cn if both are imported)
  if (hasCnImport(sourceCode)) {
    return { name: "cn", imported: true, importPath: null };
  }
  if (hasClsxImport(sourceCode)) {
    return { name: "clsx", imported: true, importPath: null };
  }
  
  // Neither is imported - try to detect which is more likely available
  // Check if clsx is being used elsewhere in the file (indicates it's available)
  const hasClsxUsage = /clsx\(/.test(text);
  const hasCnUsage = /cn\(/.test(text);
  
  // If cn is being used but not imported, it's likely available
  if (hasCnUsage && !hasClsxUsage) {
    return { name: "cn", imported: false, importPath: null };
  }
  
  // Check for common cn utility file patterns
  const hasUtilsFile = 
    text.includes('from "@/lib/utils"') ||
    text.includes("from '@/lib/utils'") ||
    text.includes('from "../lib/utils"') ||
    text.includes("from '../lib/utils'") ||
    text.includes('from "./lib/utils"') ||
    text.includes("from './lib/utils'");
  
  // If utils file is imported, cn is likely available there
  if (hasUtilsFile) {
    return { name: "cn", imported: false, importPath: null };
  }
  
  // Use custom utility if specified in config
  if (customUtility) {
    return {
      name: customUtility,
      imported: false,
      importPath: customImportPath || null
    };
  }
  // Default to clsx (standard npm package, required dependency)
  return { name: "clsx", imported: false, importPath: "clsx" };
}

// Export functions
module.exports = {
  organizeClasses,
  generateJSXClassName,
  getOrganizedGroups,
  formatWithComments,
  hasCnImport,
  hasClsxImport,
  getUtilityFunction,
  // Expose helpers for testing and advanced usage
  _internals: {
    matchesPattern,
  },
};
