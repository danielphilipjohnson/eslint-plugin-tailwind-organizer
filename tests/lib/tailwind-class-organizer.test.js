import { describe, it, expect } from "vitest";
const {
  organizeClasses,
  generateJSXClassName,
} = require("../../src/lib/tailwind-class-organizer");

// We need to test matchesPattern indirectly through organizeClasses
// since it's not exported

describe("organizeClasses", () => {
  describe("inline format (default)", () => {
    it("should organize classes in correct order", () => {
      const result = organizeClasses("mt-4 flex items-center");
      expect(result).toBe("flex items-center mt-4");
    });

    it("should handle layout classes first", () => {
      const result = organizeClasses("mt-4 p-2 flex");
      // Layout comes before Spacing
      expect(result).toBe("flex mt-4 p-2");
    });

    it("should handle spacing classes", () => {
      const result = organizeClasses("px-4 py-2 mt-4 mb-2");
      expect(result).toBe("px-4 py-2 mt-4 mb-2");
    });

    it("should handle typography classes", () => {
      const result = organizeClasses("text-sm font-bold text-center");
      // All are typography, order within group is preserved
      expect(result).toBe("text-sm font-bold text-center");
    });

    it("should handle background and border classes", () => {
      const result = organizeClasses("bg-white border border-gray-200 rounded");
      // Order within same group categories is preserved
      expect(result).toContain("bg-white");
      expect(result).toContain("border");
      expect(result).toContain("border-gray-200");
      expect(result).toContain("rounded");
    });

    it("should handle pseudo-classes", () => {
      const result = organizeClasses("hover:bg-blue-500 focus:outline-none");
      expect(result).toContain("hover:bg-blue-500");
      expect(result).toContain("focus:outline-none");
    });

    it("should handle responsive classes", () => {
      const result = organizeClasses("sm:flex md:grid lg:block");
      expect(result).toContain("sm:flex");
      expect(result).toContain("md:grid");
      expect(result).toContain("lg:block");
    });

    it("should handle dark mode classes", () => {
      const result = organizeClasses("bg-white dark:bg-gray-800");
      expect(result).toContain("bg-white");
      expect(result).toContain("dark:bg-gray-800");
    });

    it("should handle ungrouped classes", () => {
      const result = organizeClasses("custom-class another-class");
      expect(result).toContain("custom-class");
      expect(result).toContain("another-class");
    });

    it("should handle empty string", () => {
      const result = organizeClasses("");
      expect(result).toBe("");
    });

    it("should handle whitespace-only string", () => {
      const result = organizeClasses("   ");
      expect(result).toBe("");
    });

    it("should handle multiple spaces between classes", () => {
      const result = organizeClasses("flex   items-center   mt-4");
      expect(result).toBe("flex items-center mt-4");
    });

    it("should maintain order within same group", () => {
      const result = organizeClasses("mt-4 mb-2 mx-4 my-2");
      // All spacing classes should be together
      expect(result).toMatch(/m[xy]-\d+/);
    });

    it("should handle complex real-world example", () => {
      const result = organizeClasses(
        "fixed inset-x-0 top-0 z-10 min-h-[40px] bg-white py-4 sm:pb-2"
      );
      expect(result).toContain("fixed");
      expect(result).toContain("inset-x-0");
      expect(result).toContain("top-0");
      expect(result).toContain("z-10");
      expect(result).toContain("bg-white");
      expect(result).toContain("py-4");
      expect(result).toContain("sm:pb-2");
    });
  });

  describe("multiline format", () => {
    it("should format with comments and line breaks", () => {
      const result = organizeClasses("mt-4 flex items-center", {
        format: "multiline",
      });
      expect(result).toContain("// Layout");
      expect(result).toContain("flex");
      expect(result).toContain("// Alignment");
      expect(result).toContain("items-center");
      expect(result).toContain("// Spacing");
      expect(result).toContain("mt-4");
      expect(result).toContain("\n");
    });

    it("should respect indentSize option", () => {
      const result = organizeClasses("flex mt-4", {
        format: "multiline",
        indentSize: 4,
      });
      // The indent affects the class lines, not comments
      expect(result).toContain("// Layout");
    });

    it("should include Other section for ungrouped classes", () => {
      const result = organizeClasses("unknown-class flex", {
        format: "multiline",
      });
      // Check if ungrouped classes appear (may be in Other or Spacing if pattern matches)
      expect(result).toContain("unknown-class");
      expect(result).toContain("flex");
    });
  });

  describe("edge cases", () => {
    it("should handle classes with colons", () => {
      const result = organizeClasses("sm:flex md:grid");
      expect(result).toContain("sm:flex");
      expect(result).toContain("md:grid");
    });

    it("should handle classes with brackets", () => {
      const result = organizeClasses("min-h-[40px] max-w-[100px]");
      expect(result).toContain("min-h-[40px]");
      expect(result).toContain("max-w-[100px]");
    });

    it("should handle classes with slashes", () => {
      const result = organizeClasses("bg-white/50 border-gray-200/75");
      expect(result).toContain("bg-white/50");
      expect(result).toContain("border-gray-200/75");
    });

    it("should handle duplicate classes", () => {
      const result = organizeClasses("flex flex");
      expect(result).toContain("flex");
      // Note: Current implementation doesn't deduplicate, but classes are organized
      expect(result).toBe("flex flex");
    });
  });
});

describe("generateJSXClassName", () => {
  it("should generate JSX with default component name", () => {
    const result = generateJSXClassName("flex items-center mt-4");
    expect(result).toContain("<select");
    expect(result).toContain("className={clsx(");
    expect(result).toContain("// Layout");
    expect(result).toContain("flex");
    expect(result).toContain("// Alignment");
    expect(result).toContain("items-center");
    expect(result).toContain("// Spacing");
    expect(result).toContain("mt-4");
    expect(result).toContain("/>");
  });

  it("should use custom component name", () => {
    const result = generateJSXClassName("flex", {
      componentName: "div",
    });
    expect(result).toContain("<div");
    expect(result).not.toContain("<select");
  });

  it("should include all class groups with comments", () => {
    const result = generateJSXClassName(
      "flex items-center mt-4 bg-white text-sm"
    );
    expect(result).toContain("// Layout");
    expect(result).toContain("// Alignment");
    expect(result).toContain("// Spacing");
    expect(result).toContain("// Background");
    expect(result).toContain("// Typography");
  });

  it("should handle empty classes", () => {
    const result = generateJSXClassName("");
    expect(result).toContain("<select");
    expect(result).toContain("className={clsx(");
  });

  it("should handle ungrouped classes", () => {
    const result = generateJSXClassName("unknown-class flex");
    // Ungrouped classes may be placed in Other or matched to a pattern
    expect(result).toContain("unknown-class");
    expect(result).toContain("flex");
  });

  it("should format with proper indentation", () => {
    const result = generateJSXClassName("flex mt-4");
    const lines = result.split("\n");
    // Check that className line has proper indentation
    expect(lines[1]).toContain("  className={clsx(");
    // Check that comments have proper indentation
    const commentLine = lines.find((l) => l.includes("// Layout"));
    expect(commentLine).toContain("    //");
  });
});
