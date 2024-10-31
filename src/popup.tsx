import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";

interface Tab {
  url: string;
  title: string;
  timestamp: number;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  active?: boolean;
  tabs?: Tab[];
}

const Popup = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const isLocalUpdate = useRef(false);

  // Load todos from storage when component mounts
  useEffect(() => {
    chrome.storage.local.get(['todos'], (result) => {
      if (result.todos) {
        setTodos(result.todos);
      }
    });

    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.todos && !isLocalUpdate.current) {
        setTodos(changes.todos.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    if (todos.length > 0 || isLocalUpdate.current) {
      isLocalUpdate.current = true;
      chrome.storage.local.set({ todos }, () => {
        // Reset the flag after a short delay to allow for the storage event to process
        setTimeout(() => {
          isLocalUpdate.current = false;
        }, 100);
      });
    }
  }, [todos]);

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
    // If we're deleting the active todo, notify background script
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

    // Notify background script of the active todo change
    const activeTodo = newTodos.find(todo => todo.active);
    chrome.runtime.sendMessage({ 
      type: 'SET_ACTIVE_TODO', 
      todoId: activeTodo ? activeTodo.id : null 
    });
  };

  const removeTab = (todoId: number, tabUrl: string) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? { ...todo, tabs: todo.tabs?.filter(tab => tab.url !== tabUrl) }
        : todo
    ));
  };

  return (
    <div style={{ minWidth: "300px", padding: "16px" }}>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          style={{ width: "100%", marginBottom: "8px", padding: "4px" }}
        />
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id}>
            <div 
              onClick={() => toggleActive(todo.id)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "8px",
                padding: "8px",
                backgroundColor: todo.active ? "#e0e0e0" : "transparent",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleTodo(todo.id);
                }}
              />
              <span style={{ 
                marginLeft: "8px", 
                textDecoration: todo.completed ? "line-through" : "none",
                flex: 1
              }}>
                {todo.text}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTodo(todo.id);
                }}
                style={{ marginLeft: "8px" }}
              >
                Delete
              </button>
            </div>
            {todo.tabs && todo.tabs.length > 0 && (
              <div style={{ marginLeft: "24px", marginBottom: "8px", fontSize: "0.9em" }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Related Tabs:</div>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {todo.tabs.map((tab, index) => (
                    <li key={index} style={{ 
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <a
                        href={tab.url}
                        onClick={(e) => {
                          e.preventDefault();
                          chrome.tabs.create({ url: tab.url });
                        }}
                        style={{ color: "#0066cc", textDecoration: "none", flex: 1 }}
                      >
                        {tab.title}
                      </a>
                      <button
                        onClick={() => removeTab(todo.id, tab.url)}
                        style={{ 
                          fontSize: "0.8em",
                          padding: "2px 4px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#666"
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
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