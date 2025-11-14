import { describe, it } from "vitest";
import { RuleTester } from "eslint";
import { createRequire } from "node:module";
import organizeClassnamesRule from "../../src/rules/organize-classnames.js";

const require = createRequire(import.meta.url);
const parser = require.resolve("@babel/eslint-parser");

const baseParserOptions = {
  ecmaVersion: 2021,
  sourceType: "module",
  requireConfigFile: false,
  babelOptions: {
    presets: ["@babel/preset-react"],
  },
};

function runRuleSuite(name, cases) {
  const tester = new RuleTester({ parser, parserOptions: baseParserOptions });
  tester.run(name, organizeClassnamesRule, cases);
}

describe("organize-classnames rule", () => {
  it("reorders inline class strings and template literals", () => {
    runRuleSuite("inline format", {
      valid: [
        'const Component = () => <div className="flex items-center mt-4"></div>;',
      ],
      invalid: [
        {
          code: 'const Component = () => <div className="mt-4 flex items-center"></div>;',
          output:
            'const Component = () => <div className="flex items-center mt-4"></div>;',
          errors: [{ message: "Class names should be organized" }],
        },
        {
          code: "const Component = () => <div className={`bg-blue-500 px-4 py-2`}></div>;",
          output:
            'const Component = () => <div className="px-4 py-2 bg-blue-500"></div>;',
          errors: [{ message: "Class names should be organized" }],
        },
      ],
    });
  });

  it("emits cn() blocks with comments when cn is imported", () => {
    runRuleSuite("with-comments + cn", {
      valid: [],
      invalid: [
        {
          code: 'import { cn } from "@/lib/utils"; function Test() { return <div className="mt-4 flex items-center"></div>; }',
          output:
            'import { cn } from "@/lib/utils"; function Test() { return <div className={cn(\n    // Layout\n    "flex",\n    // Alignment\n    "items-center",\n    // Spacing\n    "mt-4"\n  )}></div>; }',
          options: [{ format: "with-comments" }],
          errors: [{ message: "Class names should be organized" }],
        },
      ],
    });
  });

  it("auto imports clsx when no utility function is available", () => {
    runRuleSuite("with-comments + auto import", {
      valid: [],
      invalid: [
        {
          code: 'function Test() { return <div className="mt-4 flex items-center"></div>; }',
          output:
            'import { clsx } from "clsx";\nfunction Test() { return <div className={clsx(\n    // Layout\n    "flex",\n    // Alignment\n    "items-center",\n    // Spacing\n    "mt-4"\n  )}></div>; }',
          options: [{ format: "with-comments" }],
          errors: [{ message: "Class names should be organized" }],
        },
      ],
    });
  });

  it("supports custom utility functions and import paths", () => {
    runRuleSuite("with-comments + custom util", {
      valid: [],
      invalid: [
        {
          code: 'function Test() { return <div className="mt-4 flex items-center"></div>; }',
          output:
            'import { cn } from "../lib/utils";\nfunction Test() { return <div className={cn(\n    // Layout\n    "flex",\n    // Alignment\n    "items-center",\n    // Spacing\n    "mt-4"\n  )}></div>; }',
          options: [
            {
              format: "with-comments",
              utilityFunction: "cn",
              utilityImportPath: "../lib/utils",
            },
          ],
          errors: [{ message: "Class names should be organized" }],
        },
      ],
    });
  });

  it("detects clsx/cn usage in auto mode", () => {
    runRuleSuite("auto format", {
      valid: [],
      invalid: [
        {
          code: 'function Test() { return <div className="mt-4 flex items-center"></div>; }',
          output:
            'function Test() { return <div className="flex items-center mt-4"></div>; }',
          options: [{ format: "auto" }],
          errors: [{ message: "Class names should be organized" }],
        },
        {
          code: 'import { clsx } from "clsx"; function Test() { return <div className="mt-4 flex items-center"></div>; }',
          output:
            'import { clsx } from "clsx"; function Test() { return <div className={clsx(\n    // Layout\n    "flex",\n    // Alignment\n    "items-center",\n    // Spacing\n    "mt-4"\n  )}></div>; }',
          options: [{ format: "auto" }],
          errors: [{ message: "Class names should be organized" }],
        },
        {
          code: 'function Test() { const helper = cn("foo"); return <div className="mt-4 flex items-center"></div>; }',
          output:
            'import { cn } from "../lib/utils";\nfunction Test() { const helper = cn("foo"); return <div className={cn(\n    // Layout\n    "flex",\n    // Alignment\n    "items-center",\n    // Spacing\n    "mt-4"\n  )}></div>; }',
          options: [{ format: "with-comments" }],
          errors: [{ message: "Class names should be organized" }],
        },
      ],
    });
  });

  it("prefers cn when utils modules are already imported", () => {
    runRuleSuite("utils alias detection", {
      valid: [],
      invalid: [
        {
          code: 'import { something } from "@/lib/utils"; function Test() { return <div className="mt-4 flex items-center"></div>; }',
          output:
            'import { something } from "@/lib/utils"; function Test() { return <div className={cn(\n    // Layout\n    "flex",\n    // Alignment\n    "items-center",\n    // Spacing\n    "mt-4"\n  )}></div>; }',
          options: [{ format: "with-comments" }],
          errors: [{ message: "Class names should be organized" }],
        },
      ],
    });
  });
});
