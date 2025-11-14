import { describe, it, expect } from "vitest";

import {
  getUtilityFunction,
  addUtilityImportFixes,
  applyClassNameFixes,
  formatWithComments,
} from "../../src/rules/organize-classnames-helpers.js";

describe("getUtilityFunction", () => {
  // Mock sourceCode object for testing
  const mockSourceCode = (text) => ({
    getText: () => text,
  });

  it("should return cn if already imported", () => {
    const sourceCode = mockSourceCode('import { cn } from "@/lib/utils";');
    const result = getUtilityFunction(sourceCode);
    expect(result).toEqual({ name: "cn", imported: true, importPath: null });
  });

  it("should return clsx if already imported", () => {
    const sourceCode = mockSourceCode('import clsx from "clsx";');
    const result = getUtilityFunction(sourceCode);
    expect(result).toEqual({ name: "clsx", imported: true, importPath: null });
  });

  it("should return cn if cn() is used but not explicitly imported and clsx is not used", () => {
    const sourceCode = mockSourceCode('const classes = cn("flex");');
    const result = getUtilityFunction(sourceCode);
    expect(result).toEqual({ name: "cn", imported: false, importPath: null });
  });

  it("should return clsx if clsx() is used but not explicitly imported and cn is not used", () => {
    const sourceCode = mockSourceCode('const classes = clsx("flex");');
    const result = getUtilityFunction(sourceCode);
    expect(result).toEqual({ name: "clsx", imported: false, importPath: "clsx" });
  });

  it("should return cn if a common utils file is imported", () => {
    const sourceCode = mockSourceCode('import { cn } from "../lib/utils";');
    const result = getUtilityFunction(sourceCode);
    expect(result).toEqual({ name: "cn", imported: true, importPath: null });
  });

  it("should return custom utility if specified", () => {
    const sourceCode = mockSourceCode("");
    const result = getUtilityFunction(
      sourceCode,
      "myClsx",
      "~/utils/my-clsx"
    );
    expect(result).toEqual({
      name: "myClsx",
      imported: false,
      importPath: "~/utils/my-clsx",
    });
  });

  it("should default to clsx if no other conditions are met", () => {
    const sourceCode = mockSourceCode("");
    const result = getUtilityFunction(sourceCode);
    expect(result).toEqual({ name: "clsx", imported: false, importPath: "clsx" });
  });
});

describe("addUtilityImportFixes", () => {
  const mockSourceCode = (text) => ({
    getText: () => text,
  });

  const mockFixer = {
    insertTextAfterRange: (range, text) => ({
      range,
      text,
      type: "insertTextAfterRange",
    }),
    insertTextBeforeRange: (range, text) => ({
      range,
      text,
      type: "insertTextBeforeRange",
    }),
  };

  it("should not add import if not needed (format is inline)", () => {
    const sourceCode = mockSourceCode("");
    const utility = { name: "cn", imported: false, importPath: "@/lib/utils" };
    const organized = 'flex';
    const fixes = addUtilityImportFixes(
      mockFixer,
      sourceCode,
      utility,
      "inline",
      false,
      organized
    );
    expect(fixes).toEqual([]);
  });

  it("should not add import if utility is already imported", () => {
    const sourceCode = mockSourceCode('import { cn } from "@/lib/utils";');
    const utility = { name: "cn", imported: true, importPath: "@/lib/utils" };
    const organized = '{cn(\n    // Layout\n    "flex"\n  )}';
    const fixes = addUtilityImportFixes(
      mockFixer,
      sourceCode,
      utility,
      "with-comments",
      true,
      organized
    );
    expect(fixes).toEqual([]);
  });

  it("should add cn import after last existing import", () => {
    const sourceCode = mockSourceCode(
      'import React from "react";\nimport { useState } from "react";\n\nfunction App() {}'
    );
    const utility = { name: "cn", imported: false, importPath: "@/lib/utils" };
    const organized = '{cn(\n    // Layout\n    "flex"\n  )}';
    const fixes = addUtilityImportFixes(
      mockFixer,
      sourceCode,
      utility,
      "with-comments",
      true,
      organized
    );
    expect(fixes).toEqual([
      {
        range: [27, 60],
        text: '\nimport { cn } from "@/lib/utils";',
        type: "insertTextAfterRange",
      },
    ]);
  });

  it("should add clsx import at the beginning of the file if no imports exist", () => {
    const sourceCode = mockSourceCode('function App() {}');
    const utility = { name: "clsx", imported: false, importPath: "clsx" };
    const organized = '{clsx(\n    // Layout\n    "flex"\n  )}';
    const fixes = addUtilityImportFixes(
      mockFixer,
      sourceCode,
      utility,
      "with-comments",
      true,
      organized
    );
    expect(fixes).toEqual([
      {
        range: [0, 0],
        text: 'import { clsx } from "clsx";\n',
        type: "insertTextBeforeRange",
      },
    ]);
  });

  it("should use custom utilityImportPath if provided", () => {
    const sourceCode = mockSourceCode('import React from "react";');
    const utility = {
      name: "tw",
      imported: false,
      importPath: "~/utils/tailwind",
    };
    const organized = '{tw(\n    // Layout\n    "flex"\n  )}';
    const fixes = addUtilityImportFixes(
      mockFixer,
      sourceCode,
      utility,
      "with-comments",
      true,
      organized
    );
    expect(fixes).toEqual([
      {
        range: [0, 26],
        text: '\nimport { tw } from "~/utils/tailwind";',
        type: "insertTextAfterRange",
      },
    ]);
  });

  it("should detect existing cn import from common utils file and not add new import", () => {
    const sourceCode = mockSourceCode('import { something } from "@/lib/utils";\nfunction App() {}');
    const utility = { name: "cn", imported: false, importPath: "@/lib/utils" };
    const organized = '{cn(\n    // Layout\n    "flex"\n  )}';
    const fixes = addUtilityImportFixes(
      mockFixer,
      sourceCode,
      utility,
      "with-comments",
      true,
      organized
    );
    expect(fixes).toEqual([]);
  });

  it("should add cn import with relative path if no alias and no existing utils import", () => {
    const sourceCode = mockSourceCode('function App() {}');
    const utility = { name: "cn", imported: false, importPath: null }; // importPath is null, so it will be determined
    const organized = '{cn(\n    // Layout\n    "flex"\n  )}';
    const fixes = addUtilityImportFixes(
      mockFixer,
      sourceCode,
      utility,
      "with-comments",
      true,
      organized
    );
    expect(fixes).toEqual([
      {
        range: [0, 0],
        text: 'import { cn } from "../lib/utils";\n',
        type: "insertTextBeforeRange",
      },
    ]);
  });
});

describe("applyClassNameFixes", () => {
  const mockFixer = {
    replaceTextRange: (range, text) => ({
      range,
      text,
      type: "replaceTextRange",
    }),
    replaceText: (node, text) => ({
      node,
      text,
      type: "replaceText",
    }),
  };

  const mockSourceCode = (text) => ({
    getText: (node) => {
      if (node && node.range) {
        return text.substring(node.range[0], node.range[1]);
      }
      return text;
    },
  });

  it("should replace with expression format when useExpressionFormat is true", () => {
    const node = {
      name: { name: "className", range: [10, 19] },
      value: { type: "Literal", value: "old", range: [20, 25] },
    };
    const organized = '{cn("flex")}';
    const fixes = applyClassNameFixes(
      mockFixer,
      node,
      organized,
      false,
      true,
      false,
      "cn",
      "flex",
      mockSourceCode('const x = <div className="old"></div>;')
    );
    expect(fixes).toEqual([
      {
        range: [10, 25],
        text: 'className={cn("flex")}',
        type: "replaceTextRange",
      },
    ]);
  });

  it("should convert template literal to string literal if not using comments", () => {
    const node = {
      name: { name: "className", range: [10, 19] },
      value: { type: "TemplateLiteral", range: [20, 30] },
    };
    const organized = "flex items-center";
    const fixes = applyClassNameFixes(
      mockFixer,
      node,
      organized,
      true,
      false,
      false,
      "cn",
      "flex items-center",
      mockSourceCode('const x = <div className={`flex items-center`}></div>;')
    );
    expect(fixes).toEqual([
      {
        range: [20, 30],
        text: '"flex items-center"',
        type: "replaceTextRange",
      },
    ]);
  });

  it("should convert template literal to cn() format if using comments", () => {
    const node = {
      name: { name: "className", range: [10, 19] },
      value: { type: "TemplateLiteral", range: [20, 30] },
    };
    const organized = formatWithComments("flex", "cn"); // Use the actual function output
    const fixes = applyClassNameFixes(
      mockFixer,
      node,
      organized,
      true,
      false, // useExpressionFormat is false here because the organized string is not yet wrapped in className=
      true,
      "cn",
      "flex",
      mockSourceCode('const x = <div className={`flex`}></div>;')
    );
    expect(fixes).toEqual([
      {
        range: [10, 30],
        text: `className=${formatWithComments("flex", "cn")}`,
        type: "replaceTextRange",
      },
    ]);
  });

  it("should replace string literal with double quotes", () => {
    const node = {
      name: { name: "className", range: [10, 19] },
      value: { type: "Literal", value: "old", range: [20, 25] },
    };
    const organized = "new-class";
    const fixes = applyClassNameFixes(
      mockFixer,
      node,
      organized,
      false,
      false,
      false,
      "cn",
      "new-class",
      mockSourceCode('const x = <div className="old"></div>;')
    );
    expect(fixes).toEqual([
      {
        range: [20, 25],
        text: '"new-class"',
        type: "replaceTextRange",
      },
    ]);
  });

  it("should replace string literal with single quotes", () => {
    const node = {
      name: { name: "className", range: [10, 19] },
      value: { type: "Literal", value: "old", range: [20, 25] },
    };
    const organized = "new-class";
    const fixes = applyClassNameFixes(
      mockFixer,
      node,
      organized,
      false,
      false,
      false,
      "cn",
      "new-class",
      mockSourceCode("const x = <div className='old'></div>;")
    );
    expect(fixes).toEqual([
      {
        range: [20, 25],
        text: '"new-class"',
        type: "replaceTextRange",
      },
    ]);
  });
});
