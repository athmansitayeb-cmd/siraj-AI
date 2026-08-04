// Import required modules
const express = require('express');
const app = express();
const port = 3000;

// Use JSON middleware
app.use(express.json());

// Define routes
app.get('/login', (req, res) => {
  res.send('Login route');
});

app.get('/register', (req, res) => {
  res.send('Register route');
});

app.get('/dashboard', (req, res) => {
  res.send('Dashboard route');
});

app.get('/analytics', (req, res) => {
  res.send('Analytics route');
});

app.get('/admin', (req, res) => {
  res.send('Admin route');
});

// Implement route /api/admin
app.get('/api/admin', (req, res) => {
  res.send('Admin API route');
});

// Example entity models
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class Customer {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class Lead {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class Account {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

// Example REST API endpoints
app.post('/users', (req, res) => {
  const user = new User(req.body.id, req.body.name, req.body.email);
  res.send(user);
});

app.get('/users', (req, res) => {
  const users = [new User(1, 'John Doe', 'john@example.com'), new User(2, 'Jane Doe', 'jane@example.com')];
  res.send(users);
});

app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const user = new User(id, req.body.name, req.body.email);
  res.send(user);
});

app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  res.send(`User with id ${id} deleted`);
});

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});