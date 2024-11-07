import React from 'react';
import { Tab } from '../types';
import { TabItem } from './TabItem';

interface TabListProps {
  tabs: Tab[];
  todoId: number;
  removeTab: (todoId: number, tabId: number) => void;
  selectedTabId: number | null;
  onTabSelect: (tabId: number | null) => void;
}

export const TabList: React.FC<TabListProps> = ({ 
  tabs, 
  todoId, 
  removeTab, 
  selectedTabId,
  onTabSelect 
}) => (
  <div style={{ marginLeft: "24px", marginBottom: "8px", fontSize: "0.9em" }}>
    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Related Tabs:</div>
    <ul style={{ margin: 0, paddingLeft: "16px" }}>
      {tabs.map((tab) => (
        <TabItem 
          key={tab.id} 
          tab={tab} 
          todoId={todoId} 
          removeTab={removeTab}
          isSelected={selectedTabId === tab.id}
          onSelect={() => onTabSelect(selectedTabId === tab.id ? null : tab.id)}
        />
      ))}
    </ul>
  </div>
);