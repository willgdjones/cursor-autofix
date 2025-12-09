import { ERROR_PATTERNS, FIXABLE_EXTENSIONS, IGNORE_PATHS } from './patterns.js';
import path from 'path';

export interface ParsedError {
  type: string;           // "TypeError", "SyntaxError", etc.
  message: string;        // "Cannot read property 'map' of undefined"
  file: string;           // "src/components/UserList.tsx"
  line: number;           // 42
  column?: number;
  stackTrace: string;     // Full stack trace for context
  patternName: string;    // Which pattern matched
}

export function parseError(output: string): ParsedError | null {
  // Try each pattern until we find a match
  for (const pattern of ERROR_PATTERNS) {
    const error = tryParseWithPattern(output, pattern);
    if (error) {
      return error;
    }
  }
  
  return null;
}

function tryParseWithPattern(
  output: string, 
  pattern: typeof ERROR_PATTERNS[0]
): ParsedError | null {
  // Try combined regex first (more accurate)
  if (pattern.combinedRegex) {
    const match = output.match(pattern.combinedRegex);
    if (match) {
      const error = extractFromCombinedMatch(match, pattern.name, output);
      if (error && isValidError(error)) {
        return error;
      }
    }
  }

  // Fall back to separate regex matching
  const errorMatch = output.match(pattern.errorRegex);
  const locationMatch = output.match(pattern.locationRegex);

  if (errorMatch && locationMatch) {
    const type = extractErrorType(errorMatch);
    const message = extractErrorMessage(errorMatch);
    const file = locationMatch[1];
    const line = parseInt(locationMatch[2], 10);
    const column = locationMatch[3] ? parseInt(locationMatch[3], 10) : undefined;

    const error: ParsedError = {
      type,
      message,
      file: normalizePath(file),
      line,
      column,
      stackTrace: extractStackTrace(output),
      patternName: pattern.name,
    };

    if (isValidError(error)) {
      return error;
    }
  }

  return null;
}

function extractFromCombinedMatch(
  match: RegExpMatchArray, 
  patternName: string,
  output: string
): ParsedError | null {
  // Different patterns have different group structures
  // This is a simplified extraction - adjust based on pattern
  
  let type = 'Error';
  let message = '';
  let file = '';
  let line = 0;
  let column: number | undefined;

  // Try to extract based on pattern name
  switch (patternName) {
    case 'typescript':
      // ([^(\s]+\.[jt]sx?)\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.+)
      file = match[1];
      line = parseInt(match[2], 10);
      column = parseInt(match[3], 10);
      type = match[4]; // TS error code
      message = match[5];
      break;

    case 'eslint':
      // ([^:\s]+\.[jt]sx?):(\d+):(\d+)\s*(?:error|warning)\s+(.+?)\s+(?:@|eslint)
      file = match[1];
      line = parseInt(match[2], 10);
      column = parseInt(match[3], 10);
      message = match[4];
      type = 'ESLintError';
      break;

    default:
      // Generic: try common positions
      // ([A-Za-z]*Error):\s*(.+?)...([^:\s]+\.[jt]sx?):(\d+)
      type = match[1] || 'Error';
      message = match[2] || '';
      file = match[3] || '';
      line = parseInt(match[4], 10) || 0;
      column = match[5] ? parseInt(match[5], 10) : undefined;
  }

  if (!file || !line) {
    return null;
  }

  return {
    type,
    message: message.trim(),
    file: normalizePath(file),
    line,
    column,
    stackTrace: extractStackTrace(output),
    patternName,
  };
}

function extractErrorType(match: RegExpMatchArray): string {
  // Look for error type (e.g., "TypeError", "SyntaxError")
  for (const group of match) {
    if (group && /^[A-Z][a-zA-Z]*Error$/.test(group)) {
      return group;
    }
  }
  return 'Error';
}

function extractErrorMessage(match: RegExpMatchArray): string {
  // Usually the last captured group is the message
  for (let i = match.length - 1; i >= 1; i--) {
    if (match[i] && !/^[A-Z][a-zA-Z]*Error$/.test(match[i])) {
      return match[i].trim();
    }
  }
  return match[0];
}

function extractStackTrace(output: string): string {
  // Extract the stack trace portion
  const lines = output.split('\n');
  const stackLines: string[] = [];
  let inStack = false;

  for (const line of lines) {
    if (line.includes('at ') || line.match(/^\s+at\s/)) {
      inStack = true;
      stackLines.push(line);
    } else if (inStack && line.trim() === '') {
      break;
    } else if (line.match(/Error:|error:/i)) {
      stackLines.push(line);
      inStack = true;
    }
  }

  return stackLines.join('\n') || output.slice(0, 1000);
}

function normalizePath(filePath: string): string {
  // Remove leading ./ or absolute path prefix if within cwd
  let normalized = filePath.trim();
  
  // Remove webpack/vite loader prefixes
  normalized = normalized.replace(/^.*!/, '');
  
  // Remove query strings
  normalized = normalized.replace(/\?.*$/, '');
  
  // Make relative to cwd
  const cwd = process.cwd();
  if (normalized.startsWith(cwd)) {
    normalized = normalized.slice(cwd.length + 1);
  }
  
  // Remove leading ./
  if (normalized.startsWith('./')) {
    normalized = normalized.slice(2);
  }
  
  return normalized;
}

function isValidError(error: ParsedError): boolean {
  // Check if file exists and is fixable
  const ext = path.extname(error.file);
  
  // Must have a valid extension
  if (!FIXABLE_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  // Must not be in ignored paths
  for (const ignorePath of IGNORE_PATHS) {
    if (error.file.includes(ignorePath)) {
      return false;
    }
  }
  
  // Must have a valid line number
  if (!error.line || error.line < 1) {
    return false;
  }
  
  // Message should be meaningful
  if (!error.message || error.message.length < 3) {
    return false;
  }
  
  return true;
}

