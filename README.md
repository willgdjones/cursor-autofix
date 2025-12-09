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
│  [autofix] Starting: npm run dev                             │
│  [autofix] Monitoring for errors...                          │
│                                                              │
│  > Ready on http://localhost:3000                            │
│                                                              │
│  TypeError: Cannot read property 'map' of undefined          │
│    at UserList (src/components/UserList.tsx:42)              │
│                                                              │
│  [autofix] 🔍 Error detected!                                │
│  [autofix] 🔧 Fixing...                                      │
│  [autofix] ✅ Fixed src/components/UserList.tsx              │
│                                                              │
│  > Compiled successfully                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

1. **Wraps** your dev server as a child process
2. **Monitors** stdout/stderr for error patterns
3. **Detects** errors and extracts file/line info from stack traces
4. **Fixes** the code using Cursor AI agent
5. **Hot reload** picks up the changes automatically

## Options

```bash
autofix --help          # Show help
autofix --dry-run ...   # Detect errors without fixing
```

## Supported Error Types

- JavaScript/TypeScript runtime errors
- React/Next.js compilation errors
- TypeScript type errors
- ESLint errors
- Vite/Webpack build errors
- Node.js crashes

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
