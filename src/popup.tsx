import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { TodoInput } from "./components/TodoInput";
import { TodoItem } from "./components/TodoItem";
import { useTodos } from "./hooks/useTodos";
import { Tab, Todo } from "./types";

const Popup = () => {
  const { todos, setTodos } = useTodos();
  const [newTodo, setNewTodo] = useState("");

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const todo: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      tabs: []
    };
    setTodos([...todos, todo]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
    const todo = todos.find(t => t.id === id);
    if (todo?.active) {
      chrome.runtime.sendMessage({ type: 'SET_ACTIVE_TODO', todoId: null });
    }
  };

  const toggleActive = async (id: number) => {
    const newTodos = todos.map(todo =>
      todo.id === id 
        ? { ...todo, active: !todo.active }
        : { ...todo, active: false }
    );
    setTodos(newTodos);

    const activeTodo = newTodos.find(todo => todo.active);
    chrome.runtime.sendMessage({ 
      type: 'SET_ACTIVE_TODO', 
      todoId: activeTodo ? activeTodo.id : null 
    });
  };

  const removeTab = (todoId: number, tabId: number) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? { ...todo, tabs: todo.tabs?.filter((tab: Tab) => tab.id !== tabId) }
        : todo
    ));
  };

  return (
    <div style={{ minWidth: "300px", padding: "16px" }}>
      <TodoInput 
        newTodo={newTodo}
        setNewTodo={setNewTodo}
        addTodo={addTodo}
      />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleActive={toggleActive}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            removeTab={removeTab}
          />
        ))}
      </ul>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);