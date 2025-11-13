const fs = require("fs");
const path = require("path");
const { organizeClasses } = require("./lib/tailwind-class-organizer");

function formatWithComments(classes) {
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

  // Format as cn() with comments
  if (groups.length > 1 || (groups.length === 1 && groups[0].comment)) {
    const parts = groups
      .filter((g) => g.classes) // Only include groups with classes
      .map((g) => {
        if (g.comment) {
          return `    // ${g.comment}\n    "${g.classes}"`;
        }
        return `    "${g.classes}"`;
      });

    return `{cn(
${parts.join(",\n")},
  )}`;
  } else if (groups.length === 1) {
    // Single group without comment, just return classes
    return groups[0].classes;
  }

  return classes;
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Skip if already using cn() format
  if (content.includes("className={cn(")) {
    return false;
  }

  // Match className="..." or className='...' (but not className={...})
  const classNameRegex = /className\s*=\s*(["'])([^"']+)\1/g;
  let modified = false;
  let newContent = content;
  let needsCnImport = false;

  newContent = newContent.replace(classNameRegex, (match, quote, classes) => {
    // Clean up any existing comment artifacts
    const cleanClasses = classes
      .replace(/\/\*[^*]*\*\/|\/\/[^\n]*/g, "")
      .trim();
    if (!cleanClasses) return match;

    const organized = formatWithComments(cleanClasses);
    // Determine if the file was modified and if a cn import is needed
    if (organized.startsWith("{cn(")) {
      modified = true;
      needsCnImport = true;
      return `className=${organized}`;
    } else if (cleanClasses !== organized) {
      modified = true;
      return `className=${quote}${organized}${quote}`;
    }
    return match;
  });

  // Add cn import if needed
  if (
    modified &&
    needsCnImport &&
    !content.includes('from "@/lib/utils"') &&
    !content.includes("from '@/lib/utils'") &&
    !content.includes('from "../lib/utils"') &&
    !content.includes("from '../lib/utils'") &&
    !content.includes('from "./lib/utils"') &&
    !content.includes("from './lib/utils'")
  ) {
    // Try to find an existing import line to add after
    const importMatch = newContent.match(/(import\s+[^;]+;)/);
    // Determine import path based on existing imports or default to relative
    const hasAtAlias = content.includes('from "@') || content.includes("from '@");
    const importPath = hasAtAlias ? '@/lib/utils' : '../lib/utils';

    if (importMatch) {
      const lastImportIndex = newContent.lastIndexOf(importMatch[0]);
      const insertIndex = lastImportIndex + importMatch[0].length;
      newContent =
        newContent.slice(0, insertIndex) +
        `\nimport { cn } from "${importPath}";` +
        newContent.slice(insertIndex);
    } else {
      // Add at the top, using the determined importPath
      newContent = `import { cn } from "${importPath}";\n` + newContent;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent, "utf8");
    console.log(`Fixed: ${filePath}`);
    return true;
  }

  return false;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!file.startsWith(".") && file !== "node_modules") {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function runCli(args, cwd) {
  const files = args.length > 0 ? args.map((f) => path.resolve(cwd, f)) : walkDir(cwd);

  let fixedCount = 0;
  files.forEach((file) => {
    if (fixFile(file)) {
      fixedCount++;
    }
  });

  console.log(`\nFixed ${fixedCount} file(s).`);
  return fixedCount; // Return count for testing
}

module.exports = {
  formatWithComments,
  fixFile,
  walkDir,
  runCli,
};
