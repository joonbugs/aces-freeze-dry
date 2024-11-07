import React from 'react';
import { Tab } from '../types';

interface TabItemProps {
    tab: Tab;
    todoId: number;
    removeTab: (todoId: number, tabId: number) => void;
    isSelected: boolean;
    onSelect: () => void;
  }
  
export const TabItem: React.FC<TabItemProps> = ({ 
    tab, 
    todoId, 
    removeTab, 
    isSelected,
    onSelect
  }) => (
    <li style={{ 
      marginBottom: "4px",
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px",
        backgroundColor: isSelected ? "#f0f0f0" : "transparent",
        borderRadius: "4px",
        cursor: "pointer"
      }}
      onClick={onSelect}
      >
        <a
          href={tab.currentUrl}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            chrome.tabs.create({ url: tab.currentUrl });
          }}
          style={{ color: "#0066cc", textDecoration: "none", flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
        >
          {tab.title}
        </a>
        <span style={{ fontSize: "0.8em", color: "#666", flex: 1 }}></span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeTab(todoId, tab.id);
          }}
          style={{ 
            fontSize: "0.8em",
            padding: "2px 4px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#666",
            justifySelf: "flex-end"
          }}
        >
          ×
        </button>
      </div>
      
      {isSelected && tab.history && tab.history.length > 0 && (
        <ul style={{ 
          margin: "4px 0 0 20px",
          padding: 0,
          fontSize: "0.9em",
          color: "#666",
          listStyle: "none"
        }}>
          {tab.history.map((url, index) => (
            <li key={index} style={{ 
              marginBottom: "2px",
              padding: "2px 4px"
            }}>
              <a
                href={url}
                onClick={(e) => {
                  e.preventDefault();
                  chrome.tabs.create({ url });
                }}
                style={{ 
                  color: "#666",
                  textDecoration: "none",
                  fontSize: "0.9em",
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                title={url}
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );