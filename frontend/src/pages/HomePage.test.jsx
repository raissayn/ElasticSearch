import React from 'react';
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

  const input = screen.getByPlaceholderText(/O que você procura/i);
  expect(input).toBeDefined();
});
