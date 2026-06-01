// ============================================================
// @archlens/reporting — ANSI Colors Utility
// ============================================================

const hasSupport =
  typeof process !== 'undefined' &&
  process.stdout &&
  process.stdout.isTTY &&
  !process.env.NO_COLOR;

function style(code: string, text: string): string {
  return hasSupport ? `${code}${text}\x1b[0m` : text;
}

export const colors = {
  reset: (text: string) => style('\x1b[0m', text),
  bold: (text: string) => style('\x1b[1m', text),
  dim: (text: string) => style('\x1b[2m', text),
  red: (text: string) => style('\x1b[31m', text),
  green: (text: string) => style('\x1b[32m', text),
  yellow: (text: string) => style('\x1b[33m', text),
  blue: (text: string) => style('\x1b[34m', text),
  cyan: (text: string) => style('\x1b[36m', text),
  gray: (text: string) => style('\x1b[90m', text),
  bgRed: (text: string) => style('\x1b[41m', text),
  bgGreen: (text: string) => style('\x1b[42m', text),
};
