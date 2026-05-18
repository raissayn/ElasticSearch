import { createContext, useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const SearchContext = createContext({
  query: '',
  setQuery: () => {},
});

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState('');

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
};
