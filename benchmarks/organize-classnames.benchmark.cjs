const { organizeClasses, formatWithComments, getOrganizedGroups } = require("../src/lib/tailwind-class-organizer");

// --- Test Data ---
const smallClassString = "flex items-center mt-4";
const mediumClassString =
  "flex items-center justify-between p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300";
const largeClassString = `
  container mx-auto px-4 py-8
  flex flex-col md:flex-row items-center justify-between
  bg-gradient-to-r from-purple-500 to-indigo-600
  text-white text-lg font-bold leading-tight tracking-wide
  rounded-xl shadow-2xl border border-purple-300
  hover:shadow-lg hover:scale-105 transition-all duration-500 ease-in-out
  focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-75
  dark:bg-gradient-to-l dark:from-gray-800 dark:to-gray-900 dark:text-gray-100
  sm:text-base lg:text-xl xl:text-2xl
  w-full max-w-4xl min-h-[200px]
  z-10 relative absolute inset-0
  overflow-hidden
`;

// --- Benchmark Function ---
function runBenchmark(name, fn, iterations = 10000) {
  console.time(name);
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  console.timeEnd(name);
}

console.log("--- Performance Benchmarks for tailwind-class-organizer ---");
console.log(`Running each test ${10000} iterations.\n`);

// --- Benchmarking organizeClasses (inline format) ---
console.log("Benchmarking organizeClasses (inline format):");
runBenchmark("  Small class string (inline)", () =>
  organizeClasses(smallClassString, { format: "inline" })
);
runBenchmark("  Medium class string (inline)", () =>
  organizeClasses(mediumClassString, { format: "inline" })
);
runBenchmark("  Large class string (inline)", () =>
  organizeClasses(largeClassString, { format: "inline" })
);
console.log("\n");

// --- Benchmarking getOrganizedGroups ---
console.log("Benchmarking getOrganizedGroups:");
runBenchmark("  Small class string (groups)", () =>
  getOrganizedGroups(smallClassString)
);
runBenchmark("  Medium class string (groups)", () =>
  getOrganizedGroups(mediumClassString)
);
runBenchmark("  Large class string (groups)", () =>
  getOrganizedGroups(largeClassString)
);
console.log("\n");

// --- Benchmarking formatWithComments ---
console.log("Benchmarking formatWithComments:");
runBenchmark("  Small class string (with-comments)", () =>
  formatWithComments(smallClassString, "cn")
);
runBenchmark("  Medium class string (with-comments)", () =>
  formatWithComments(mediumClassString, "cn")
);
runBenchmark("  Large class string (with-comments)", () =>
  formatWithComments(largeClassString, "cn")
);
console.log("\n");

console.log("Benchmarks complete.");
