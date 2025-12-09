// Error patterns for common JavaScript/TypeScript frameworks

export interface ErrorPattern {
  name: string;
  // Regex to match the error type and message
  errorRegex: RegExp;
  // Regex to extract file path and line number from stack trace
  locationRegex: RegExp;
  // Optional: extract from a combined pattern
  combinedRegex?: RegExp;
}

export const ERROR_PATTERNS: ErrorPattern[] = [
  // Next.js / React compilation errors
  {
    name: 'nextjs-compile',
    errorRegex: /(?:Error|TypeError|SyntaxError|ReferenceError):\s*(.+)/,
    locationRegex: /at\s+(?:\w+\s+)?\(?([^:]+):(\d+):(\d+)\)?/,
    combinedRegex: /([A-Za-z]*Error):\s*(.+?)(?:\n|\r\n).*?(?:at\s+(?:\w+\s+)?\(?)?([^:\s]+\.[jt]sx?):(\d+)(?::(\d+))?/s,
  },

  // Next.js specific error format
  {
    name: 'nextjs-error',
    errorRegex: /(?:Unhandled Runtime Error|Error):\s*(.+)/,
    locationRegex: /(?:Source|File):\s*([^:]+):(\d+)/,
    combinedRegex: /(?:Unhandled Runtime Error|Error)[:\s]+([A-Za-z]*Error)?:?\s*(.+?)(?:\n|\r\n).*?(?:Source|File)?[:\s]*([^:\s]+\.[jt]sx?):(\d+)/s,
  },

  // TypeScript compilation errors
  {
    name: 'typescript',
    errorRegex: /TS\d+:\s*(.+)/,
    locationRegex: /([^(]+\.[jt]sx?)\((\d+),(\d+)\)/,
    combinedRegex: /([^(\s]+\.[jt]sx?)\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.+)/,
  },

  // ESLint errors
  {
    name: 'eslint',
    errorRegex: /(?:error|warning)\s+(.+?)\s+(?:@|eslint)/i,
    locationRegex: /([^:\s]+\.[jt]sx?):(\d+):(\d+)/,
    combinedRegex: /([^:\s]+\.[jt]sx?):(\d+):(\d+)\s*(?:error|warning)\s+(.+?)\s+(?:@|eslint)/i,
  },

  // Node.js runtime errors
  {
    name: 'node-runtime',
    errorRegex: /^([A-Z][a-zA-Z]*Error):\s*(.+)$/m,
    locationRegex: /at\s+(?:[\w.<>]+\s+)?\(?([^:]+):(\d+):(\d+)\)?/,
  },

  // Vite errors
  {
    name: 'vite',
    errorRegex: /\[vite\].*?(?:Error|error):\s*(.+)/i,
    locationRegex: /([^:\s]+\.[jt]sx?):(\d+):(\d+)/,
  },

  // Webpack errors
  {
    name: 'webpack',
    errorRegex: /Module (?:build |parse )?failed.*?Error:\s*(.+)/i,
    locationRegex: /@ ([^:\s]+\.[jt]sx?):?(\d+)?:?(\d+)?/,
  },

  // Generic JavaScript errors with stack trace
  {
    name: 'generic-js',
    errorRegex: /(?:Uncaught\s+)?([A-Z][a-zA-Z]*Error):\s*(.+)/,
    locationRegex: /(?:at\s+(?:[\w.<>]+\s+)?\(?)?([^:\s()]+\.[jt]sx?):(\d+)(?::(\d+))?\)?/,
  },
];

// File extensions we can fix
export const FIXABLE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

// Paths to ignore
export const IGNORE_PATHS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
];

