# AutoFix Demo

A simple Express server with a deliberate bug to test the AutoFix CLI.

## The Bug

The `/users` endpoint calls `.map()` on a value that can be `null`:

```javascript
const users = getUsers();  // Can return null!
const userNames = users.map(u => u.name);  // 💥 TypeError!
```

## Setup

```bash
cd demo
npm install
```

## Test AutoFix

1. From the `autofix-cli` directory, run:
```bash
export CURSOR_API_KEY="your_key"
node dist/index.js "node demo/server.js"
```

2. Open your browser to `http://localhost:3000/users`

3. Refresh a few times — the bug triggers ~70% of the time

4. Watch the terminal:
   - Error appears: `TypeError: Cannot read property 'map' of null`
   - AutoFix detects it
   - Cursor Agent fixes `server.js`
   - Server restarts (you may need to restart manually since this is plain Node)

## Expected Fix

The agent should change:
```javascript
const userNames = users.map(u => u.name);
```

To something like:
```javascript
const userNames = (users || []).map(u => u.name);
// or
const userNames = users?.map(u => u.name) ?? [];
```

## Manual Test (without autofix)

```bash
cd demo
npm install
node server.js
# Open http://localhost:3000/users and refresh until it crashes
```

