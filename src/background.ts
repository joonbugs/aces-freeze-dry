// background.ts
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

// Keep track of active todo in memory
let activeTodoId: number | null = null;

// Initialize by getting active todo from storage
chrome.storage.local.get(['todos'], (result) => {
  const todos: Todo[] = result.todos || [];
  const activeTodo = todos.find(todo => todo.active);
  if (activeTodo) {
    activeTodoId = activeTodo.id;
    console.log(`Active id: ${activeTodo.id}`);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_ACTIVE_TODO') {
    activeTodoId = message.todoId;
  }
  sendResponse({ success: true });
});

// Listen for new tabs
chrome.tabs.onCreated.addListener(async (tab) => {
  console.log(`tab: ${tab}, ${tab.url}, ${tab.title}, ${activeTodoId}`)
  if (!activeTodoId || !tab.url || !tab.title) return;

  // Get current todos
  const { todos = [] } = await chrome.storage.local.get(['todos']);
  
  const newTab: Tab = {
    url: tab.url,
    title: tab.title,
    timestamp: Date.now()
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
  console.log(`tab: ${tab}, ${tab.url}, ${tab.title}, ${activeTodoId}`)
  if (!activeTodoId || !changeInfo.url || tab.url?.includes("chrome://newtab/")) return;

  const { todos = [] } = await chrome.storage.local.get(['todos']);
  const activeTodo = todos.find((todo: Todo) => todo.id === activeTodoId);
  
  if (!activeTodo?.tabs) return;

  // Check if we already have this tab URL
  const tabExists = activeTodo.tabs.some((t: Tab) => t.url === changeInfo.url || t.title === changeInfo.title);
  if (tabExists) return;

  const newTab: Tab = {
    url: changeInfo.url,
    title: tab.title || changeInfo.url,
    timestamp: Date.now()
  };

  const updatedTodos = todos.map((todo: Todo) =>
    todo.id === activeTodoId
      ? { ...todo, tabs: [...(todo.tabs || []), newTab] }
      : todo
  );

  await chrome.storage.local.set({ todos: updatedTodos });
});