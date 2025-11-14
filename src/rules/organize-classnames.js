/* eslint-disable */
import {
  organizeClasses,
  formatWithComments,
} from "eslint-plugin-tailwind-organizer/lib/tailwind-class-organizer";

import {
  getUtilityFunction,
  addUtilityImportFixes,
  applyClassNameFixes,
} from "eslint-plugin-tailwind-organizer/rules/organize-classnames-helpers";

export default {
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
    const useComments = format === "with-comments" || (format === "auto" && hasUtility);
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
              let fixes = [];
              
              // Add fixes for utility import if needed
              fixes = fixes.concat(
                addUtilityImportFixes(
                  fixer,
                  sourceCode,
                  utility,
                  format,
                  useExpressionFormat,
                  organized
                )
              );
              
              // Add fixes for className attribute
              fixes = fixes.concat(
                applyClassNameFixes(
                  fixer,
                  node,
                  organized,
                  isTemplateLiteral,
                  useExpressionFormat,
                  useComments,
                  utility.name,
                  cleanClasses,
                  sourceCode
                )
              );
              
              return fixes;
            },
          });
        }
      },
    };
  },
};