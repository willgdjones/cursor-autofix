const express = require('express');
const app = express();
const PORT = 3000;

// Simulated database
function getUsers() {
  return [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ];
}

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AutoFix Demo Server',
    endpoints: [
      'GET /users - List all users (has a bug!)',
      'GET /health - Health check'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Users endpoint - THIS HAS A BUG!
app.get('/users', (req, res) => {
  const users = getUsers();
  
  // BUG: 'nmae' is a typo - should be 'name'!
  const userNames = users.map(u => u.name.toUpperCase());
  
  res.json({ users: userNames });
});

app.listen(PORT, () => {
  console.log(`Demo server running at http://localhost:${PORT}`);
  console.log('');
  console.log('Try these endpoints:');
  console.log(`  http://localhost:${PORT}/        - Home`);
  console.log(`  http://localhost:${PORT}/users   - Users (buggy!)`);
  console.log(`  http://localhost:${PORT}/health  - Health check`);
  console.log('');
  console.log('Hit /users a few times to trigger the bug!');
});

