#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const testProjectsDir = path.join(__dirname, "../test-projects");
const projects = fs
  .readdirSync(testProjectsDir)
  .filter((item) => {
    const itemPath = path.join(testProjectsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

console.log("🧪 Testing plugin with mini projects...\n");

// Link the plugin first
console.log("📦 Linking plugin...");
try {
  execSync("npm link", { cwd: path.join(__dirname, ".."), stdio: "inherit" });
  console.log("✅ Plugin linked\n");
} catch (error) {
  console.error("❌ Failed to link plugin");
  process.exit(1);
}

let allPassed = true;

// Test each project
for (const project of projects) {
  const projectPath = path.join(testProjectsDir, project);
  console.log(`\n📁 Testing: ${project}`);

  try {
    // Install dependencies
    console.log("  Installing dependencies...");
    execSync("npm install", { cwd: projectPath, stdio: "pipe" });

    // Link the plugin
    console.log("  Linking plugin...");
    execSync("npm link eslint-plugin-tailwind-organizer", {
      cwd: projectPath,
      stdio: "pipe",
    });

    // Run lint
    console.log("  Running ESLint...");
    execSync("npm run lint", {
      cwd: projectPath,
      stdio: "inherit",
    });

    console.log(`  ✅ ${project} passed`);
  } catch (error) {
    console.error(`  ❌ ${project} failed`);
    allPassed = false;
  }
}

// Unlink
console.log("\n🧹 Cleaning up...");
try {
  execSync("npm unlink", {
    cwd: path.join(__dirname, ".."),
    stdio: "pipe",
  });
} catch (error) {
  // Ignore unlink errors
}

if (allPassed) {
  console.log("\n✅ All integration tests passed!");
  process.exit(0);
} else {
  console.log("\n❌ Some integration tests failed");
  process.exit(1);
}

