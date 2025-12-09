#!/usr/bin/env node

import { runWithAutofix } from './runner.js';
import chalk from 'chalk';

const args = process.argv.slice(2);

// Check for help flag
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`
${chalk.bold.cyan('autofix')} - Auto-fix errors in your dev server as they happen

${chalk.bold('Usage:')}
  autofix <command>

${chalk.bold('Examples:')}
  autofix npm run dev
  autofix npx next dev
  autofix node server.js

${chalk.bold('Environment:')}
  CURSOR_API_KEY  Required. Your Cursor API key.

${chalk.bold('Options:')}
  --help, -h      Show this help message
  --dry-run       Show detected errors without fixing
  `);
  process.exit(0);
}

// Check for API key
if (!process.env.CURSOR_API_KEY) {
  console.error(chalk.red('Error: CURSOR_API_KEY environment variable is required.'));
  console.error(chalk.gray('Set it with: export CURSOR_API_KEY="your_key"'));
  process.exit(1);
}

// Extract flags
const dryRun = args.includes('--dry-run');
const command = args.filter(arg => !arg.startsWith('--')).join(' ');

if (!command) {
  console.error(chalk.red('Error: No command provided.'));
  console.error(chalk.gray('Usage: autofix <command>'));
  process.exit(1);
}

console.log(chalk.cyan.bold('\n🔧 AutoFix'));
console.log(chalk.gray(`Starting: ${command}`));
console.log(chalk.gray('Monitoring for errors...\n'));

runWithAutofix(command, { dryRun });

