import React, { useState, useEffect } from 'react';
import TodoList from './TodoList';
import TodoForm from './TodoForm';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetch('/api/todos')
      .then(response => response.json())
      .then(data => setTodos(data));
  }, []);

  const handleAddTodo = (event) => {
    event.preventDefault();
    fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTodo }),
    })
      .then(response => response.json())
      .then(data => setTodos([...todos, data]));
    setNewTodo('');
  };

  const handleRemoveTodo = (id) => {
    fetch(`/api/todos/${id}`, { method: 'DELETE' })
      .then(() => setTodos(todos.filter(todo => todo.id !== id)));
  };

  return (
    <div>
      <h1>Todo App</h1>
      <TodoForm
        newTodo={newTodo}
        setNewTodo={setNewTodo}
        handleAddTodo={handleAddTodo}
      />
      <TodoList todos={todos} handleRemoveTodo={handleRemoveTodo} />
    </div>
  );
}

export default App;