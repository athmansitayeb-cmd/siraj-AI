// server.js
const express = require('express');
const app = express();
const port = 3000;

// JSON middleware
app.use(express.json());

// Auth routes
const authRoutes = require('./auth_routes');
app.use('/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// auth_routes.js
const express = require('express');
const router = express.Router();

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Implement login logic here
  res.json({ message: 'Logged in successfully' });
});

// Register route
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  // Implement register logic here
  res.json({ message: 'Registered successfully' });
});

module.exports = router;