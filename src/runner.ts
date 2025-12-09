import { spawn, type ChildProcess } from 'child_process';
import chalk from 'chalk';
import { parseError, type ParsedError } from './parser.js';
import { fixError } from './fixer.js';

interface RunnerOptions {
  dryRun?: boolean;
}

// Track errors we're currently fixing to avoid duplicates
const fixingErrors = new Set<string>();

// Debounce timeout for rapid errors
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 2000;

// Buffer to accumulate output for multi-line error parsing
let outputBuffer = '';
const BUFFER_TIMEOUT_MS = 500;
let bufferTimer: NodeJS.Timeout | null = null;

export function runWithAutofix(command: string, options: RunnerOptions = {}): ChildProcess {
  const [cmd, ...args] = command.split(' ');
  
  const child = spawn(cmd, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  const processOutput = async (data: Buffer, isStderr: boolean) => {
    const text = data.toString();
    
    // Always pass through to terminal
    if (isStderr) {
      process.stderr.write(text);
    } else {
      process.stdout.write(text);
    }

    // Accumulate in buffer for error parsing
    outputBuffer += text;

    // Reset buffer timer
    if (bufferTimer) {
      clearTimeout(bufferTimer);
    }

    bufferTimer = setTimeout(async () => {
      const bufferedText = outputBuffer;
      outputBuffer = '';

      // Try to parse errors from buffered output
      const error = parseError(bufferedText);
      
      if (error) {
        await handleError(error, options);
      }
    }, BUFFER_TIMEOUT_MS);
  };

  child.stdout?.on('data', (data) => processOutput(data, false));
  child.stderr?.on('data', (data) => processOutput(data, true));

  child.on('error', (err) => {
    console.error(chalk.red(`\n[autofix] Failed to start command: ${err.message}`));
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(chalk.yellow(`\n[autofix] Process exited with code ${code}`));
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.gray('\n[autofix] Shutting down...'));
    child.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit(0);
  });

  return child;
}

async function handleError(error: ParsedError, options: RunnerOptions): Promise<void> {
  // Create a unique key for this error
  const errorKey = `${error.file}:${error.line}:${error.type}`;

  // Skip if we're already fixing this error
  if (fixingErrors.has(errorKey)) {
    return;
  }

  // Debounce rapid errors
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    fixingErrors.add(errorKey);

    console.log(chalk.yellow(`\n[autofix] 🔍 Error detected!`));
    console.log(chalk.gray(`  Type: ${error.type}`));
    console.log(chalk.gray(`  Message: ${error.message}`));
    console.log(chalk.gray(`  File: ${error.file}:${error.line}`));

    if (options.dryRun) {
      console.log(chalk.cyan(`\n[autofix] Dry run - would fix ${error.file}`));
      fixingErrors.delete(errorKey);
      return;
    }

    console.log(chalk.cyan(`\n[autofix] 🔧 Fixing...`));

    try {
      const success = await fixError(error);
      
      if (success) {
        console.log(chalk.green(`\n[autofix] ✅ Fixed ${error.file}`));
        console.log(chalk.gray(`  Hot reload should kick in shortly...\n`));
      } else {
        console.log(chalk.red(`\n[autofix] ❌ Could not fix automatically`));
      }
    } catch (err) {
      console.error(chalk.red(`\n[autofix] ❌ Fix failed: ${err}`));
    } finally {
      // Allow re-fixing after a delay (in case the fix didn't work)
      setTimeout(() => {
        fixingErrors.delete(errorKey);
      }, 10000);
    }
  }, DEBOUNCE_MS);
}

