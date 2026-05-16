import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopNavBar from './TopNavBar';

test('TopNavBar renders logo and links', () => {
  render(
    <MemoryRouter>
      <TopNavBar isHome={true} />
    </MemoryRouter>
  );

  expect(screen.getByAltText('UniSearch Logo')).toBeDefined();
  expect(screen.getByText('Início')).toBeDefined();
  expect(screen.getByText('Sobre')).toBeDefined();
});
