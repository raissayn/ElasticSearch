// Copyright 2026 Raissa Nunes Peret, Vinicius Ribeiro da Silva do Carmo
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
