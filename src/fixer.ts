import { CursorAgent } from '@cursor-ai/january';
import type { ParsedError } from './parser.js';
import chalk from 'chalk';

export async function fixError(error: ParsedError): Promise<boolean> {
  const apiKey = process.env.CURSOR_API_KEY;
  
  if (!apiKey) {
    console.error(chalk.red('[autofix] CURSOR_API_KEY not set'));
    return false;
  }

  const agent = new CursorAgent({
    apiKey,
    model: 'claude-4-sonnet',
    workingLocation: {
      type: 'local',
      localDirectory: process.cwd()
    }
  });

  const prompt = buildFixPrompt(error);

  try {
    const { stream } = agent.submit({
      message: prompt
    });

    // Consume the stream and show progress
    let textBuffer = '';
    for await (const update of stream) {
      if (update.type === 'text-delta') {
        // Stream the agent's explanation to console
        process.stdout.write(chalk.gray(update.text));
        textBuffer += update.text;
      } else if (update.type === 'tool-call-started') {
        // Show when agent starts using a tool
        if (textBuffer) {
          console.log(); // New line after text
          textBuffer = '';
        }
        console.log(chalk.cyan(`\n[autofix] 🔧 ${update.toolCall.type}: ${getToolDescription(update.toolCall)}`));
      } else if (update.type === 'tool-call-completed') {
        if (update.toolCall.type === 'edit' || update.toolCall.type === 'write') {
          console.log(chalk.green(`[autofix] ✅ Modified: ${getFilePath(update.toolCall)}`));
        }
      }
    }

    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\n[autofix] Agent error: ${errorMessage}`));
    return false;
  }
}

function buildFixPrompt(error: ParsedError): string {
  return `Fix this ${error.type} error in the codebase:

**Error:** ${error.message}

**Location:** ${error.file}:${error.line}${error.column ? ':' + error.column : ''}

**Stack Trace:**
\`\`\`
${error.stackTrace}
\`\`\`

Instructions:
1. Read the file to understand the context
2. Identify the root cause of the error
3. Fix the error with a minimal, targeted change
4. Do NOT refactor unrelated code
5. Do NOT add comments explaining the fix
6. Just fix the bug and nothing else

Focus on fixing this specific error. Be concise.`;
}

function getFilePath(toolCall: any): string {
  if (toolCall.args?.path) {
    return toolCall.args.path;
  }
  if (toolCall.args?.file_path) {
    return toolCall.args.file_path;
  }
  return 'file';
}

function getToolDescription(toolCall: any): string {
  if (toolCall.type === 'read') {
    return `Reading ${toolCall.args?.path || 'file'}`;
  }
  if (toolCall.type === 'edit' || toolCall.type === 'write') {
    return `Editing ${toolCall.args?.path || toolCall.args?.file_path || 'file'}`;
  }
  return toolCall.type;
}

