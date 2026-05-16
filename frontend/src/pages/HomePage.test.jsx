import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { SearchProvider } from '../contexts/SearchContext';

test('HomePage renders search input', () => {
  render(
    <SearchProvider>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </SearchProvider>
  );

  const input = screen.getByPlaceholderText(/Busque por 'Cálculo I'/i);
  expect(input).toBeDefined();
});
