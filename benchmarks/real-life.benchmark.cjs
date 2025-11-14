const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const testProjectsDir = path.resolve(__dirname, "../test-projects");
const projects = ["basic-react", "nextjs", "typescript"];

function runEslint(projectPath, configPath) {
  const command = `npx eslint . --config ${configPath} --no-eslintrc`;
  const start = process.hrtime.bigint();
  try {
    execSync(command, { cwd: projectPath, stdio: "pipe" });
  } catch (error) {
    // ESLint might exit with non-zero code if there are linting errors,
    // but we still want to measure performance.
    // console.error(`ESLint command failed for ${projectPath}:`, error.message);
  }
  const end = process.hrtime.bigint();
  return Number(end - start) / 1_000_000; // Convert nanoseconds to milliseconds
}

function createTempEslintConfig(projectPath, ruleEnabled) {
  const tempConfigPath = path.join(projectPath, `.eslintrc.temp.json`);
  const config = {
    parser: require.resolve("@babel/eslint-parser"),
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      requireConfigFile: false,
      babelOptions: {
        presets: ["@babel/preset-react"],
      },
    },
    plugins: ["tailwind-organizer"],
    rules: {
      "tailwind-organizer/organize-classnames": ruleEnabled ? ["error", { format: "auto" }] : "off",
    },
  };
  fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));
  return tempConfigPath;
}

console.log("--- Real-life ESLint Performance Benchmarks ---");
console.log("Measuring ESLint runtime with and without 'organize-classnames' rule.\n");

for (const project of projects) {
  const projectPath = path.join(testProjectsDir, project);
  console.log(`Benchmarking project: ${project}`);

  // Install dependencies for the project if not already installed
  console.log(`  Installing dependencies for ${project}...`);
  try {
    execSync("npm install", { cwd: projectPath, stdio: "pipe" });
    console.log(`  Dependencies for ${project} installed.`);
  } catch (error) {
    console.error(`  Failed to install dependencies for ${project}:`, error.message);
    continue; // Skip to the next project if installation fails
  }

  // Create temporary ESLint config with rule disabled
  const configDisabledPath = createTempEslintConfig(projectPath, false);
  const timeDisabled = runEslint(projectPath, configDisabledPath);
  fs.unlinkSync(configDisabledPath); // Clean up temp config

  // Create temporary ESLint config with rule enabled
  const configEnabledPath = createTempEslintConfig(projectPath, true);
  const timeEnabled = runEslint(projectPath, configEnabledPath);
  fs.unlinkSync(configEnabledPath); // Clean up temp config

  console.log(`  Rule Disabled: ${timeDisabled.toFixed(2)} ms`);
  console.log(`  Rule Enabled:  ${timeEnabled.toFixed(2)} ms`);
  const difference = timeEnabled - timeDisabled;
  const percentageIncrease = (difference / timeDisabled) * 100;
  console.log(`  Difference:    ${difference.toFixed(2)} ms (${percentageIncrease.toFixed(2)}% increase)`);
  console.log("\n");
}

console.log("Real-life benchmarks complete.");
