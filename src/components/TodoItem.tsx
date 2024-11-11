import React, { useState } from 'react';
import { Todo } from '../types';
import { TabList } from './TabList';

interface TodoItemProps {
  todo: Todo;
  toggleActive: (id: number) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  removeTab: (todoId: number, tabId: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  toggleActive,
  toggleTodo,
  deleteTodo,
  removeTab
}) => {
  const [selectedTabId, setSelectedTabId] = useState<number | null>(null);

  return (
    <li key={todo.id}>
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleActive(todo.id)}
        }
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
      {todo.active && todo.tabs && todo.tabs.length > 0 && (
        <TabList 
          tabs={todo.tabs} 
          todoId={todo.id} 
          removeTab={removeTab}
          selectedTabId={selectedTabId}
          onTabSelect={setSelectedTabId}
        />
      )}
    </li>
  );
};