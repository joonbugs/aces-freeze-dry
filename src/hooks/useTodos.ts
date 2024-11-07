import { useState, useEffect, useRef } from "react";
import { Todo } from "../types";

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const isLocalUpdate = useRef(false);

  useEffect(() => {
    chrome.storage.local.get(["todos"], (result) => {
      if (result.todos) {
        setTodos(result.todos);
      }
    });

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.todos && !isLocalUpdate.current) {
        setTodos(changes.todos.newValue);
      }
      if (!isLocalUpdate.current) {
        isLocalUpdate.current = false;
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (todos.length > 0 || isLocalUpdate.current) {
      isLocalUpdate.current = true;
      chrome.storage.local.set({ todos });
    }
  }, [todos]);

  return { todos, setTodos };
};
