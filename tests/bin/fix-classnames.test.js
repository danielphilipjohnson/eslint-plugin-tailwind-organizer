import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import functions from the refactored cli.js
import { formatWithComments, fixFile, walkDir, runCli } from "../../src/cli";

// Mock fs.readFileSync and fs.writeFileSync for fixFile tests
vi.mock("fs", async (importOriginal) => {
  const actualFs = await importOriginal();
  const memfs = {}; // Simple in-memory file system

  return {
    ...actualFs,
    readFileSync: vi.fn((filePath, encoding) => {
      if (memfs[filePath]) {
        return memfs[filePath];
      }
      // Fallback to actual fs for non-mocked files (e.g., test setup)
      return actualFs.readFileSync(filePath, encoding);
    }),
    writeFileSync: vi.fn((filePath, content, encoding) => {
      memfs[filePath] = content;
      actualFs.writeFileSync(filePath, content, encoding); // Also write to disk for integration tests
    }),
    existsSync: vi.fn((filePath) => {
      return !!memfs[filePath] || actualFs.existsSync(filePath);
    }),
    mkdirSync: vi.fn((dirPath, options) => {
      actualFs.mkdirSync(dirPath, options);
    }),
    rmSync: vi.fn((path, options) => {
      actualFs.rmSync(path, options);
    }),
    readdirSync: vi.fn((dirPath) => {
      return actualFs.readdirSync(dirPath);
    }),
    statSync: vi.fn((filePath) => {
      return actualFs.statSync(filePath);
    }),
  };
});

// Mock path.resolve for consistent path handling in tests
vi.mock("path", async (importOriginal) => {
  const actualPath = await importOriginal();
  return {
    ...actualPath,
    resolve: vi.fn((...args) => actualPath.resolve(...args)),
  };
});

describe("formatWithComments", () => {
  it("should format classes with cn() and comments", () => {
    const result = formatWithComments("mt-4 flex items-center");
    expect(result).toContain("{cn(");
    expect(result).toContain("// Layout");
    expect(result).toContain("flex");
    expect(result).toContain("// Alignment");
    expect(result).toContain("items-center");
    expect(result).toContain("// Spacing");
    expect(result).toContain("mt-4");
  });

  it("should handle single group without comment", () => {
    const result = formatWithComments("flex");
    // Single group might not need cn() format
    expect(result).toBeDefined();
  });

  it("should handle empty classes", () => {
    const result = formatWithComments("");
    expect(result).toBe("");
  });

  it("should format with proper structure", () => {
    const result = formatWithComments("mt-4 flex");
    expect(result).toMatch(/\{cn\(/);
    expect(result).toMatch(/\/\/ Layout/);
    expect(result).toMatch(/\/\/ Spacing/);
  });
});

describe("fixFile", () => {
  it("should skip files already using cn() format", () => {
    const content = 'import { cn } from "@/lib/utils";\n<div className={cn("flex")}>';
    // We need to mock fs.readFileSync for this test
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const result = fixFile("dummy.jsx");
    expect(result).toBe(false);
  });

  it("should convert className string to cn() format", () => {
    const content = '<div className="mt-4 flex items-center"></div>';
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    const writtenContent = writeSpy.mock.calls[0][1];

    expect(writtenContent).toContain("className={cn(");
    expect(writtenContent).toContain("// Layout");
    expect(writtenContent).toContain("flex");
  });

  it("should add cn import when needed", () => {
    const content = '<div className="mt-4 flex"></div>';
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    const writtenContent = writeSpy.mock.calls[0][1];

    expect(writtenContent).toContain('import { cn } from');
  });

  it("should not add duplicate cn import", () => {
    const content =
      'import { cn } from "@/lib/utils";\n<div className="mt-4 flex"></div>';
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    const writtenContent = writeSpy.mock.calls[0][1];

    // Count cn imports
    const importMatches = writtenContent.match(/import.*cn.*from/g);
    expect(importMatches?.length).toBe(1);
  });

  it("should handle single quotes", () => {
    const content = "<div className='mt-4 flex'></div>";
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    const writtenContent = writeSpy.mock.calls[0][1];

    expect(writtenContent).toContain("className={cn(");
  });

  it("should clean up existing comment artifacts", () => {
    const content = '<div className="/* comment */ flex mt-4"></div>';
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    const writtenContent = writeSpy.mock.calls[0][1];

    expect(writtenContent).not.toContain("/* comment */");
  });

  it("should detect @ alias import style", () => {
    const content = 'import React from "@/components";\n<div className="flex"></div>';
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    const writtenContent = writeSpy.mock.calls[0][1];

    // Should detect @ alias from existing imports
    expect(writtenContent).toContain('from "@/lib/utils"');
  });

  it("should detect relative import style", () => {
    const content = 'import React from "../components";\n<div className="flex"></div>';
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    const writtenContent = writeSpy.mock.calls[0][1];

    expect(writtenContent).toContain('from "../lib/utils"');
  });

  it("should handle multiple className attributes", () => {
    const content =
      '<div className="flex"></div><span className="mt-4"></span>';
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    const writtenContent = writeSpy.mock.calls[0][1];

    expect(writtenContent).toContain("className={cn(");
    // Both should be converted
    const cnMatches = writtenContent.match(/className=\{cn\(/g);
    expect(cnMatches?.length).toBe(2);
  });

  it("should not modify className with template literals", () => {
    const content = '<div className={`flex ${someVar}`}></div>';
    vi.spyOn(fs, "readFileSync").mockReturnValueOnce(content);
    const writeSpy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

    fixFile("dummy.jsx");
    // Should not match template literals, so no write should occur
    expect(writeSpy).not.toHaveBeenCalled();
  });
});

describe("walkDir", () => {
  const testDir = path.join(__dirname, "..", "..", "test-temp");

  beforeEach(() => {
    // Create test directory structure
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // Create subdirectories and files
    fs.mkdirSync(path.join(testDir, "components"), { recursive: true });
    fs.mkdirSync(path.join(testDir, "pages"), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, "components", "Button.jsx"),
      "export default function Button() {}"
    );
    fs.writeFileSync(
      path.join(testDir, "components", "Card.tsx"),
      "export default function Card() {}"
    );
    fs.writeFileSync(
      path.join(testDir, "pages", "Home.jsx"),
      "export default function Home() {}"
    );
    fs.writeFileSync(
      path.join(testDir, "index.js"),
      "console.log('test');"
    );
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should find all .jsx and .tsx files", () => {
    const files = walkDir(testDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.endsWith(".jsx"))).toBe(true);
    expect(files.some((f) => f.endsWith(".tsx"))).toBe(true);
  });

  it("should not include .js files", () => {
    const files = walkDir(testDir);
    expect(files.every((f) => f.endsWith(".jsx") || f.endsWith(".tsx"))).toBe(
      true
    );
  });

  it("should skip node_modules directory", () => {
    fs.mkdirSync(path.join(testDir, "node_modules"), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, "node_modules", "test.jsx"),
      "test"
    );
    const files = walkDir(testDir);
    expect(files.some((f) => f.includes("node_modules"))).toBe(false);
  });

  it("should skip hidden directories", () => {
    fs.mkdirSync(path.join(testDir, ".next"), { recursive: true });
    fs.writeFileSync(path.join(testDir, ".next", "test.jsx"), "test");
    const files = walkDir(testDir);
    expect(files.some((f) => f.includes(".next"))).toBe(false);
  });

  it("should recursively search subdirectories", () => {
    fs.mkdirSync(path.join(testDir, "nested", "deep"), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, "nested", "deep", "Component.jsx"),
      "test"
    );
    const files = walkDir(testDir);
    expect(files.some((f) => f.includes("nested/deep"))).toBe(true);
  });
});
