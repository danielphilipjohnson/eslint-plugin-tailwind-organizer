import organizeClassnamesRule from "./rules/organize-classnames.js";
import { organizeClasses, generateJSXClassName } from "./lib/tailwind-class-organizer.js";

export const rules = {
  "organize-classnames": organizeClassnamesRule,
};

export const utils = {
  organizeClasses,
  generateJSXClassName,
};

export default {
  rules,
  utils,
};
