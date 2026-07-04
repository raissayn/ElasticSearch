import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import { ThemeProvider } from '../contexts/ThemeContext';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const renderNotFound = (initialEntries = ['/pagina-inexistente']) =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <NotFoundPage />
      </MemoryRouter>
    </ThemeProvider>
  );

test('NotFoundPage renders 404 and message', () => {
  renderNotFound();
  expect(screen.getByText('404')).toBeDefined();
  expect(screen.getByText(/pegou férias acadêmicas/i)).toBeDefined();
});

test('NotFoundPage has a back button that navigates home', async () => {
  const user = userEvent.setup();
  renderNotFound();

  const backButton = screen.getByRole('button', { name: /voltar ao buscador/i });
  expect(backButton).toBeDefined();
  await user.click(backButton);
});

test('NotFoundPage renders compass icon', () => {
  const { container } = renderNotFound();
  const svg = container.querySelector('svg.lucide-compass');
  expect(svg).not.toBeNull();
});
