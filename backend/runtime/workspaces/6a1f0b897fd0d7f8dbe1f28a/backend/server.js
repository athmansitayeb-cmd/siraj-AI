// src/app.js
const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

// Routes
app.get('/healthcheck', (req, res) => {
  res.status(200).send('Server is up and running');
});

// Entities
class Todo {
  constructor(id, title, completed) {
    this.id = id;
    this.title = title;
    this.completed = completed;
  }
}

// In-memory todo list (replace with database in production)
let todoList = [
  new Todo(1, 'Buy milk', false),
  new Todo(2, 'Walk the dog', true),
];

// Routes implementation
app.get('/todos', (req, res) => {
  res.status(200).json(todoList);
});

app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todoList.find((todo) => todo.id === id);
  if (!todo) {
    res.status(404).send(`Todo with id ${id} not found`);
  } else {
    res.status(200).json(todo);
  }
});

app.post('/todos', (req, res) => {
  const { title, completed } = req.body;
  const newTodo = new Todo(todoList.length + 1, title, completed);
  todoList.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todoList.find((todo) => todo.id === id);
  if (!todo) {
    res.status(404).send(`Todo with id ${id} not found`);
  } else {
    const { title, completed } = req.body;
    todo.title = title;
    todo.completed = completed;
    res.status(200).json(todo);
  }
});

app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todoList.findIndex((todo) => todo.id === id);
  if (index === -1) {
    res.status(404).send(`Todo with id ${id} not found`);
  } else {
    todoList.splice(index, 1);
    res.status(204).send();
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});