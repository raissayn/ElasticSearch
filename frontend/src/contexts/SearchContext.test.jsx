import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchProvider, SearchContext } from './SearchContext';

const TestComponent = () => {
  const { query, setQuery } = useContext(SearchContext);
  return (
    <div>
      <span data-testid="query-value">{query}</span>
      <button onClick={() => setQuery('Elasticsearch')}>Update</button>
    </div>
  );
};

test('SearchContext provides default empty string and updates query', async () => {
  const user = userEvent.setup();
  render(
    <SearchProvider>
      <TestComponent />
    </SearchProvider>
  );

  expect(screen.getByTestId('query-value').textContent).toBe('');
  
  await user.click(screen.getByText('Update'));
  
  expect(screen.getByTestId('query-value').textContent).toBe('Elasticsearch');
});
