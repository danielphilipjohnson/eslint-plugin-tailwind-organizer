/* eslint-disable */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { organizeClasses } = require("../lib/tailwind-class-organizer");

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

  if (groups.length === 1 && !groups[0].comment) {
    // Single group without comment, just return classes
    return groups[0].classes;
  }

  // Format as utility function (cn() or clsx()) with comments
  const parts = groups.map((g) => {
    if (g.comment) {
      return `    // ${g.comment}\n    "${g.classes}"`;
    }
    return `    "${g.classes}"`;
  });

  return `{${utilityName}(\n${parts.join(",\n")}\n  )}`;
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

module.exports = {
  meta: {
    type: "layout",
    docs: {
      description: "Organize Tailwind CSS class names using custom grouping",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          format: {
            type: "string",
            enum: ["auto", "inline", "with-comments"],
            default: "auto",
            description:
              "Format style: 'auto' (detect cn/clsx import, use comments if found), 'inline' (always inline), 'with-comments' (always use comments with cn/clsx)",
          },
          utilityFunction: {
            type: "string",
            description:
              "Custom utility function name to use when neither cn nor clsx is imported. Defaults to 'clsx'. Example: 'cn' to use your custom cn function.",
          },
          utilityImportPath: {
            type: "string",
            description:
              "Import path for custom utility function. Only used when utilityFunction is set. Example: '@/lib/utils' for cn function.",
          },
        },
        additionalProperties: false,
        default: {},
      },
    ],
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};
    const format = options.format || "auto"; // Default to "auto" to detect utility import
    const customUtility = options.utilityFunction; // Custom utility function name (e.g., "cn")
    const customImportPath = options.utilityImportPath; // Custom import path (e.g., "@/lib/utils")
    const utility = getUtilityFunction(sourceCode, customUtility, customImportPath);
    const hasUtility = utility.imported;
    
    // Auto-detect: if format is "auto" and utility (cn/clsx) is imported, use comments
    // If format is "with-comments", always use utility format with comments (will auto-add import)
    // If format is explicitly "inline", always use inline
    const useComments =
      format === "with-comments" || (format === "auto" && hasUtility);
    const forceInline = format === "inline";

    return {
      JSXAttribute(node) {
        if (node.name.name !== "className" || !node.value) {
          return;
        }

        let classNameValue = null;
        let isTemplateLiteral = false;

        // Handle string literals
        if (node.value.type === "Literal" && typeof node.value.value === "string") {
          classNameValue = node.value.value;
        }
        // Handle template literals (only simple ones without expressions)
        else if (node.value.type === "TemplateLiteral") {
          // Only process if it's a simple template literal (no expressions)
          const expressions = node.value.expressions || [];
          const quasis = node.value.quasis || [];
          
          if (expressions.length === 0 && quasis.length === 1) {
            // Extract the string value from the template literal
            const quasi = quasis[0];
            if (quasi && quasi.value) {
              classNameValue = quasi.value.cooked || quasi.value.raw;
              if (classNameValue) {
                isTemplateLiteral = true;
              } else {
                return;
              }
            } else {
              return;
            }
          } else {
            // Template literal with expressions - skip (too complex)
            return;
          }
        } else {
          // Other expression types - skip
          return;
        }

        if (!classNameValue) {
          return;
        }

        // Clean up any existing comment artifacts
        const cleanClasses = classNameValue
          .replace(/\/\*[^*]*\*\/|\/\/[^\n]*/g, "")
          .trim();

        if (!cleanClasses) {
          return;
        }

        let organized;
        let useExpressionFormat = false;

        if (useComments && !forceInline) {
          // Format with comments using the detected utility (cn or clsx)
          organized = formatWithComments(cleanClasses, utility.name);
          useExpressionFormat = organized.startsWith(`{${utility.name}(`);
        } else {
          // Simple inline format
          organized = organizeClasses(cleanClasses, {
            format: "inline",
          });
        }

        if (cleanClasses !== organized) {
          context.report({
            node: node.value,
            message: "Class names should be organized",
            fix(fixer) {
              const fixes = [];
              
              // If using with-comments format and utility is not imported, add the import
              // (We always use utility format for comments, so import is required)
              const needsUtilityImport =
                format === "with-comments" &&
                !utility.imported &&
                useExpressionFormat &&
                organized.startsWith(`{${utility.name}(`);
              
              if (needsUtilityImport) {
                const text = sourceCode.getText();
                const hasAtAlias =
                  text.includes('from "@') || text.includes("from '@");
                
                // Determine import path based on utility type
                let importPath;
                let importStatement;
                
                if (utility.importPath) {
                  // Use custom import path if specified
                  importPath = utility.importPath;
                  importStatement = `import { ${utility.name} } from "${importPath}";`;
                } else if (utility.name === "cn") {
                  // cn is typically in utils file
                  // Try to detect the existing utils import path
                  const utilsImportMatch = text.match(/from\s+["']([^"']*\/lib\/utils)["']/);
                  if (utilsImportMatch) {
                    importPath = utilsImportMatch[1];
                  } else {
                    importPath = hasAtAlias ? '@/lib/utils' : '../lib/utils';
                  }
                  importStatement = `import { cn } from "${importPath}";`;
                } else {
                  // clsx is from the clsx package (default, required dependency)
                  importPath = 'clsx';
                  importStatement = `import { clsx } from "clsx";`;
                }
                
                // Check if import already exists (check various patterns)
                const utilityImportPattern = utility.name === "cn" 
                  ? new RegExp(`import\\s+.*\\b${utility.name}\\b.*from`)
                  : new RegExp(`import\\s+.*\\b${utility.name}\\b.*from`);
                
                const hasImport =
                  text.includes(`from "${importPath}"`) ||
                  text.includes(`from '${importPath}'`) ||
                  (utility.name === "cn" && (
                    text.includes('from "@/lib/utils"') ||
                    text.includes("from '@/lib/utils'") ||
                    text.includes('from "../lib/utils"') ||
                    text.includes("from '../lib/utils'") ||
                    text.includes('from "./lib/utils"') ||
                    text.includes("from './lib/utils'")
                  )) ||
                  utilityImportPattern.test(text);
                
                if (!hasImport) {
                  // Find the best place to add the import
                  // Look for all import statements
                  const importRegex = /import\s+[^;]+;/g;
                  const imports = [];
                  let match;
                  while ((match = importRegex.exec(text)) !== null) {
                    imports.push({
                      text: match[0],
                      index: match.index,
                      endIndex: match.index + match[0].length,
                    });
                  }
                  
                  if (imports.length > 0) {
                    // Add after the last import
                    const lastImport = imports[imports.length - 1];
                    fixes.push(
                      fixer.insertTextAfterRange(
                        [lastImport.index, lastImport.endIndex],
                        `\n${importStatement}`
                      )
                    );
                  } else {
                    // Add at the beginning of the file
                    fixes.push(
                      fixer.insertTextBeforeRange([0, 0], `${importStatement}\n`)
                    );
                  }
                }
              }
              
              // Fix the className attribute
              if (useExpressionFormat) {
                // Replace with expression format (cn())
                const attributeRange = [
                  node.name.range[0],
                  node.value.range[1],
                ];
                fixes.push(
                  fixer.replaceTextRange(
                    attributeRange,
                    `className=${organized}`
                  )
                );
              } else {
                // Simple string/template literal replacement
                if (isTemplateLiteral) {
                  // Convert template literal to string or cn() format
                  if (useComments && preferCn) {
                    // Convert to cn() format
                    const attributeRange = [
                      node.name.range[0],
                      node.value.range[1],
                    ];
                    fixes.push(
                      fixer.replaceTextRange(
                        attributeRange,
                        `className=${formatWithComments(cleanClasses, true)}`
                      )
                    );
                  } else {
                    // Convert to string literal
                    const replacement = `"${organized}"`;
                    if (node.value.range && Array.isArray(node.value.range)) {
                      fixes.push(
                        fixer.replaceTextRange(node.value.range, replacement)
                      );
                    } else {
                      fixes.push(fixer.replaceText(node.value, replacement));
                    }
                  }
                } else {
                  // String literal replacement
                  const sourceText = sourceCode.getText(node.value);
                  const quoteChar =
                    sourceText[0] === '"'
                      ? '"'
                      : sourceText[0] === "'"
                        ? "'"
                        : '"';
                  const replacement = `${quoteChar}${organized}${quoteChar}`;

                  if (node.value.range && Array.isArray(node.value.range)) {
                    fixes.push(
                      fixer.replaceTextRange(node.value.range, replacement)
                    );
                  } else {
                    fixes.push(fixer.replaceText(node.value, replacement));
                  }
                }
              }
              
              return fixes;
            },
          });
        }
      },
    };
  },
};
