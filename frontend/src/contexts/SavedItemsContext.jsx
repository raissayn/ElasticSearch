import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getSavedKey } from '../utils/savedItems';

const STORAGE_KEY = 'unisearch:saved';

const SavedItemsContext = createContext();

export const SavedItemsProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedItems));
  }, [savedItems]);

  const isSaved = useCallback(
    (key) => savedItems.some((it) => getSavedKey(it) === key),
    [savedItems]
  );

  const toggleSave = useCallback((item) => {
    const key = getSavedKey(item);
    setSavedItems((prev) => {
      const exists = prev.some((it) => getSavedKey(it) === key);
      return exists
        ? prev.filter((it) => getSavedKey(it) !== key)
        : [{ ...item }, ...prev];
    });
  }, []);

  const removeSaved = useCallback((key) => {
    setSavedItems((prev) => prev.filter((it) => getSavedKey(it) !== key));
  }, []);

  return (
    <SavedItemsContext.Provider
      value={{ savedItems, isSaved, toggleSave, removeSaved }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
};
