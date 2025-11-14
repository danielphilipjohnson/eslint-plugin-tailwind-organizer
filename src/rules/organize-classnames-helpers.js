import { organizeClasses, formatWithComments } from "eslint-plugin-tailwind-organizer/lib/tailwind-class-organizer";

// Helper function to determine the utility function to use
export function getUtilityFunction(sourceCode, customUtility, customImportPath) {
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

/**
 * Adds fixes for importing the utility function if needed.
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {import('eslint').SourceCode} sourceCode
 * @param {object} utility - The utility object from getUtilityFunction
 * @param {string} format - The format option
 * @param {boolean} useExpressionFormat - Whether the organized output uses expression format (e.g., cn())
 * @param {string} organized - The organized class string
 * @returns {import('eslint').Rule.Fix[]}
 */
export function addUtilityImportFixes(fixer, sourceCode, utility, format, useExpressionFormat, organized) {
  const fixes = [];
  const text = sourceCode.getText();

  const needsUtilityImport =
    format === "with-comments" &&
    !utility.imported &&
    useExpressionFormat &&
    organized.startsWith(`{${utility.name}(
`);

  if (needsUtilityImport) {
    const hasAtAlias = text.includes('from "@"') || text.includes("from '@");

    let importPath;
    let importStatement;

    if (utility.importPath) {
      importPath = utility.importPath;
      importStatement = `import { ${utility.name} } from "${importPath}";`;
    } else if (utility.name === "cn") {
      const utilsImportMatch = text.match(/from\s+["']([^"']*\/lib\/utils)["']/);
      if (utilsImportMatch) {
        importPath = utilsImportMatch[1];
      } else {
        importPath = hasAtAlias ? '@/lib/utils' : '../lib/utils';
      }
      importStatement = `import { cn } from "${importPath}";`;
    } else {
      importPath = 'clsx';
      importStatement = `import { clsx } from "clsx";`;
    }

    const utilityImportPattern = new RegExp(
      String.raw`import\s+.*\b${utility.name}\b.*from`
    );

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
      const importRegex = /^\s*import.*$/gm;
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
        const lastImport = imports[imports.length - 1];
        fixes.push(
          fixer.insertTextAfterRange(
            [lastImport.index, lastImport.endIndex],
            `\n${importStatement}`
          )
        );
      } else {
        fixes.push(
          fixer.insertTextBeforeRange([0, 0], `${importStatement}\n`)
        );
      }
    }
  }
  return fixes;
}

/**
 * Applies fixes to the className attribute.
 * @param {import('eslint').Rule.RuleFixer} fixer
 * @param {import('estree').JSXAttribute} node
 * @param {string} organized - The organized class string
 * @param {boolean} isTemplateLiteral - Whether the original value was a template literal
 * @param {boolean} useExpressionFormat - Whether the organized output uses expression format (e.g., cn())
 * @param {boolean} useComments - Whether comments are being used
 * @param {string} utilityName - The name of the utility function (e.g., 'cn', 'clsx')
 * @param {string} cleanClasses - The cleaned class string
 * @param {import('eslint').SourceCode} sourceCode
 * @returns {import('eslint').Rule.Fix[]}
 */
export function applyClassNameFixes(
  fixer,
  node,
  organized,
  isTemplateLiteral,
  useExpressionFormat,
  useComments,
  utilityName,
  cleanClasses,
  sourceCode
) {
  const fixes = [];

  if (useExpressionFormat) {
    const attributeRange = [node.name.range[0], node.value.range[1]];
    fixes.push(fixer.replaceTextRange(attributeRange, `className=${organized}`));
  } else {
    if (isTemplateLiteral) {
      if (useComments && utilityName) {
        const attributeRange = [node.name.range[0], node.value.range[1]];
        fixes.push(
          fixer.replaceTextRange(
            attributeRange,
            `className=${formatWithComments(cleanClasses, utilityName)}`
          )
        );
      } else {
        const replacement = `"${organized}"`;
        if (node.value.range && Array.isArray(node.value.range)) {
          fixes.push(fixer.replaceTextRange(node.value.range, replacement));
        } else {
          fixes.push(fixer.replaceText(node.value, replacement));
        }
      }
    } else {
      const sourceText = sourceCode.getText(node.value);
      const quoteChar = sourceText.startsWith("'") ? "'" : '"';
      const replacement = `${quoteChar}${organized}${quoteChar}`;

      if (node.value.range && Array.isArray(node.value.range)) {
        fixes.push(fixer.replaceTextRange(node.value.range, replacement));
      } else {
        fixes.push(fixer.replaceText(node.value, replacement));
      }
    }
  }
  return fixes;
}

export {
  organizeClasses, // Re-export for convenience if needed by the rule directly
  formatWithComments, // Re-export for convenience if needed by the rule directly
};
