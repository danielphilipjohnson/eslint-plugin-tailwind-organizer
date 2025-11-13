const organizeClassnames = require("./rules/organize-classnames");
const { organizeClasses, generateJSXClassName } = require("./lib/tailwind-class-organizer");

module.exports = {
  rules: {
    "organize-classnames": organizeClassnames,
  },
  // Export utilities for advanced users
  utils: {
    organizeClasses,
    generateJSXClassName,
  },
};

