import { Tab, Todo } from "./types";

// Keep track of active todo in memory
let activeTodoId: number | null = null;

// Initialize by getting active todo from storage
chrome.storage.local.get(["todos"], (result) => {
  const todos: Todo[] = result.todos || [];
  const activeTodo = todos.find((todo) => todo.active);
  if (activeTodo) {
    activeTodoId = activeTodo.id;
    console.log(`Active id: ${activeTodo.id}`);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_ACTIVE_TODO") {
    activeTodoId = message.todoId;
  }
  sendResponse({ success: true });
});

// Listen for new tabs
chrome.tabs.onCreated.addListener(async (tab) => {
  console.log(`tab: ${tab}, ${tab.url}, ${tab.title}, ${activeTodoId}`);
  if (!activeTodoId || !tab.url || !tab.title || !tab.id) return;

  // Get current todos
  const { todos = [] } = await chrome.storage.local.get(["todos"]);

  const activeTodo = todos.find((todo: Todo) => todo.id === activeTodoId);

  if (!activeTodo?.tabs) return;

  const tabExists = activeTodo.tabs.some(
    (t: Tab) =>
      t.id === tab.id ||
      t.currentUrl === tab.url ||
      t.title === tab.title ||
      t.title === tab.url
  );

  if (tabExists) return;

  const newTab: Tab = {
    id: tab.id,
    currentUrl: tab.url,
    history: [],
    title: tab.title,
    timestamp: Date.now(),
  };

  // Update the active todo with the new tab
  const updatedTodos = todos.map((todo: Todo) =>
    todo.id === activeTodoId
      ? { ...todo, tabs: [...(todo.tabs || []), newTab] }
      : todo
  );

  console.log(`Updated todos: ${updatedTodos}`);
  // Save back to storage
  await chrome.storage.local.set({ todos: updatedTodos });
});

// Optional: Listen for tab updates to get the final URL
// (since onCreated might fire before the URL is set)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!activeTodoId || !changeInfo.url || tab.url?.includes("chrome://newtab/"))
    return;

  const { todos = [] } = await chrome.storage.local.get(["todos"]);
  const activeTodo: Todo = todos.find((todo: Todo) => todo.id === activeTodoId);

  if (!activeTodo?.tabs) return;

  // Check if we already have this tab, checks all names and urls, but need to make sure this is okay for the future.
  const existingTab = activeTodo.tabs.find(
    (t: Tab) =>
      t.id === tab.id ||
      t.currentUrl === tab.url ||
      t.title === tab.title ||
      t.title === tab.url
  );

  const updatedTodos = todos.map((todo: Todo) => {
    if (todo.id === activeTodoId) {
      let updatedTabs;

      if (existingTab && existingTab.currentUrl !== tab.url) {
        // Update existing tab
        updatedTabs = todo.tabs?.map((t) => {
          if (t.id === tabId) {
            return {
              ...t,
              history: [t.currentUrl, ...t.history].slice(0, 50), // Limit history to 50 entries
              currentUrl: changeInfo.url,
              title: tab.title || changeInfo.url,
              timestamp: Date.now(),
            };
          }
          return t;
        });
      } else {
        // Create new tab
        const newTab: Tab = {
          id: tabId,
          currentUrl: changeInfo.url!,
          history: [],
          title: tab.title || changeInfo.url!,
          timestamp: Date.now(),
        };
        updatedTabs = [newTab, ...(todo.tabs || [])];
      }

      return { ...todo, tabs: updatedTabs };
    }
    return todo;
  });

  await chrome.storage.local.set({ todos: updatedTodos });
});

// Listen for window close events
chrome.windows.onRemoved.addListener(async (windowId) => {
  const { todos = [] } = await chrome.storage.local.get(["todos"]);

  const updatedTodos = todos.map((todo: Todo) =>
    todo.windowId === windowId ? { ...todo, windowId: undefined } : todo
  );

  await chrome.storage.local.set({ todos: updatedTodos });
});

// Listen for window focus changes, and switch todos if the window switches.
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  const { todos = [] } = await chrome.storage.local.get(["todos"]);
  const todoWithWindow = todos.find((todo: Todo) => todo.windowId === windowId);

  if (todoWithWindow) {
    // Update active status in memory
    activeTodoId = todoWithWindow.id;

    // Update active status in storage
    const updatedTodos = todos.map((todo: Todo) => ({
      ...todo,
      active: todo.id === todoWithWindow.id,
    }));

    await chrome.storage.local.set({ todos: updatedTodos });
  }
});
