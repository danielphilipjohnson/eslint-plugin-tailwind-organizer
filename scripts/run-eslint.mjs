import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const eslintBin = fileURLToPath(new URL("../node_modules/eslint/bin/eslint.js", import.meta.url));

const child = spawn(
  process.execPath,
  [eslintBin, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      ESLINT_USE_FLAT_CONFIG: "1",
    },
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
