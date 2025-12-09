# cursor-autofix

Auto-fix errors in your dev server as they happen using Cursor AI. Never stop to debug — the AI fixes bugs while you keep building.

## Installation

```bash
npm install -g cursor-autofix
```

## Setup

Get a Cursor API key from the [Cursor Dashboard](https://cursor.com/dashboard?tab=integrations), then:

```bash
export CURSOR_API_KEY="your_key"
```

## Usage

Wrap any dev command with `autofix`:

```bash
autofix npm run dev
autofix npx next dev
autofix "node --watch server.js"
```

> **Tip:** Use `node --watch` (Node 18+) for automatic server restart when files change. Frameworks like Next.js and Vite have hot reload built-in.

## How It Works

```
┌──────────────────────────────────────────────────────────────┐
│  Terminal                                                     │
│                                                              │
│  $ autofix npm run dev                                       │
│                                                              │
│  🔧 AutoFix                                                   │
│  Starting: npm run dev                                       │
│  Monitoring for errors...                                    │
│                                                              │
│  Demo server running at http://localhost:3000                │
│                                                              │
│  TypeError: Cannot read properties of undefined              │
│    (reading 'toUpperCase')                                   │
│    at server.js:35:43                                       │
│                                                              │
│  [autofix] 🔍 Error detected!                               │
│    Type: TypeError                                           │
│    Message: Cannot read properties of undefined             │
│      (reading 'toUpperCase')                                 │
│    File: server.js:35                                        │
│                                                              │
│  [autofix] 🔧 Fixing...                                      │
│  I'll help you fix this TypeError. Let me first examine     │
│  the server.js file to understand the context around         │
│  line 35.                                                    │
│                                                              │
│  [autofix] 🔧 read: Reading server.js                       │
│                                                              │
│  I can see the issue clearly. On line 35, there's a typo:    │
│  `u.nmee` should be `u.name`. The property `nmee` doesn't  │
│  exist on the user objects, so it returns `undefined`, and   │
│  calling `toUpperCase()` on `undefined` causes the          │
│  TypeError.                                                 │
│                                                              │
│  [autofix] 🔧 edit: Editing server.js                      │
│  [autofix] ✅ Modified: server.js                          │
│                                                              │
│  Restarting 'server.js'                                      │
│  Demo server running at http://localhost:3000                │
│                                                              │
│  The error has been fixed. The issue was a simple typo on   │
│  line 35 where `u.nmee` should have been `u.name`.          │
│                                                              │
│  [autofix] ✅ Fixed server.js                               │
│    Hot reload should kick in shortly...                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

1. **Wraps** your dev server as a child process
2. **Monitors** stdout/stderr for error patterns
3. **Detects** errors and extracts file/line info from stack traces
4. **Analyzes** the code and explains the root cause
5. **Fixes** the code using Cursor AI agent
6. **Hot reload** picks up the changes automatically

## Options

```bash
autofix --help          # Show help
autofix --dry-run ...   # Detect errors without fixing
```

## Requirements

- Node.js 18+
- `CURSOR_API_KEY` environment variable
- Access to `@cursor-ai/january` SDK (currently in alpha)

## Example

```bash
# Start a Next.js app with autofix
autofix npm run dev

# Navigate to a buggy page
# Watch the error appear and get fixed automatically!
```

## License

MIT
