// background.ts
export interface Tab {
  id: number;
  currentUrl: string;
  history: string[];
  title: string;
  timestamp: number;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  active?: boolean;
  tabs?: Tab[];
}
