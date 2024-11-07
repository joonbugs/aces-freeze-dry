import React from 'react';

interface TodoInputProps {
  newTodo: string;
  setNewTodo: (value: string) => void;
  addTodo: (e: React.FormEvent) => void;
}

export const TodoInput: React.FC<TodoInputProps> = ({ newTodo, setNewTodo, addTodo }) => (
  <form onSubmit={addTodo}>
    <input
      type="text"
      value={newTodo}
      onChange={(e) => setNewTodo(e.target.value)}
      placeholder="Add a new todo"
      style={{ width: "100%", marginBottom: "8px", padding: "4px" }}
    />
  </form>
);