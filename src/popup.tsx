import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { TodoInput } from "./components/TodoInput";
import { TodoItem } from "./components/TodoItem";
import { useTodos } from "./hooks/useTodos";
import { Todo, Tab } from "./types";

const Popup = () => {
  const { todos, setTodos } = useTodos();
  const [newTodo, setNewTodo] = useState("");

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const currentWindow = await chrome.windows.getCurrent();
    const todo: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      tabs: [],
      windowId: currentWindow.id, // set windowId to current window
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
      todoId: activeTodo ? activeTodo.id : null,
    }, async () => {
      if (activeTodo) {
        await handleWindowManagement(activeTodo);
      }
    });
  };

  const removeTab = (todoId: number, tabId: number) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? { ...todo, tabs: todo.tabs?.filter((tab: Tab) => tab.id !== tabId) }
        : todo
    ));
  };

  const handleWindowManagement = async (todo: Todo) => {
    if (!todo.windowId || todo.windowId !== chrome.windows.WINDOW_ID_CURRENT) {
      if (todo.windowId) {
        // If window exists, focus it
        try {
          await chrome.windows.update(todo.windowId, { focused: true });
        } catch (error) {
          // If window doesn't exist anymore, create a new one
          createNewWindow(todo);
        }
      } else {
        // Create new window with todo's tabs
        createNewWindow(todo);
      }
    }    
  };

  const createNewWindow = async (todo: Todo) => {
    if (!todo.tabs?.length) return;

    // Create new window with first tab
    const window = await chrome.windows.create({
      url: todo.tabs[0].currentUrl,
      focused: true,
    });

    if (!window.id) return;

    // Create remaining tabs in the new window
    todo.tabs.forEach(async (tab) => {
      await chrome.tabs.create({
        windowId: window.id,
        url: tab.currentUrl
      })
    })

    // Update todo with new windowId
    setTodos(todos.map(t => 
      t.id === todo.id 
        ? { ...t, windowId: window.id }
        : t
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