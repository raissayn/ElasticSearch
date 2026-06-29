import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, afterEach, beforeAll } from 'vitest';
import HomePage from './HomePage';
import { SearchProvider } from '../contexts/SearchContext';
import { ThemeProvider } from '../contexts/ThemeContext';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
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

const renderHome = () =>
  render(
    <ThemeProvider>
      <SearchProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </SearchProvider>
    </ThemeProvider>
  );

const mockResponse = (overrides = {}) => ({
  results: [
    {
      url_documento: 'doc-1',
      pagina: 1,
      tipo_conteudo: 'disciplina',
      titulo_documento: 'Doc 1',
    },
  ],
  total: 15,
  max_score: 1,
  ...overrides,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('HomePage renders search input', () => {
  renderHome();
  const input = screen.getByPlaceholderText(/Busque por/i);
  expect(input).toBeDefined();
});

test('HomePage requests new page when pagination is used', async () => {
  const user = userEvent.setup();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => mockResponse() })
    .mockResolvedValueOnce({
      ok: true,
      json: async () =>
        mockResponse({
          results: [
            {
              url_documento: 'doc-2',
              pagina: 2,
              tipo_conteudo: 'disciplina',
              titulo_documento: 'Doc 2',
            },
          ],
        }),
    });

  vi.stubGlobal('fetch', fetchMock);

  renderHome();

  await user.type(screen.getByPlaceholderText(/Busque por/i), 'calculo');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));

  const page2Button = await screen.findByRole('button', { name: '2' });
  await user.click(page2Button);

  await waitFor(() => {
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=2');
  });
});

test('HomePage resets to page 1 when sort or category changes', async () => {
  const user = userEvent.setup();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => mockResponse() })
    .mockResolvedValueOnce({
      ok: true,
      json: async () =>
        mockResponse({
          results: [
            {
              url_documento: 'doc-2',
              pagina: 2,
              tipo_conteudo: 'disciplina',
              titulo_documento: 'Doc 2',
            },
          ],
        }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => mockResponse() })
    .mockResolvedValueOnce({ ok: true, json: async () => mockResponse() });

  vi.stubGlobal('fetch', fetchMock);

  renderHome();

  await user.type(screen.getByPlaceholderText(/Busque por/i), 'calculo');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));

  const page2Button = await screen.findByRole('button', { name: '2' });
  await user.click(page2Button);

  await waitFor(() => {
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=2');
  });

  await user.selectOptions(screen.getByRole('combobox'), 'recent');

  await waitFor(() => {
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=1');
  });

  await user.click(screen.getByText('Tudo'));
  await user.click(screen.getByText('Disciplinas', { selector: 'div' }));

  await waitFor(() => {
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=1');
    expect(lastCall).toContain('tipo=disciplina');
  });
});

test('HomePage re-fetches on sort and category changes for category-only search', async () => {
  const user = userEvent.setup();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => mockResponse() })
    .mockResolvedValueOnce({ ok: true, json: async () => mockResponse() })
    .mockResolvedValueOnce({ ok: true, json: async () => mockResponse() });

  vi.stubGlobal('fetch', fetchMock);

  renderHome();

  await user.click(screen.getByText('Tudo'));
  await user.click(screen.getByText('Disciplinas', { selector: 'div' }));
  await screen.findByText('Disciplinas', { selector: 'span' });

  await user.click(screen.getByRole('button', { name: 'Buscar' }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('tipo=disciplina');
  });

  const sortSelect = await screen.findByRole('combobox');
  await user.selectOptions(sortSelect, 'recent');

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=1');
    expect(lastCall).toContain('sort_by=recent');
  });

  await user.click(screen.getByText('Disciplinas'));
  await user.click(screen.getByText('Regulamentos'));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=1');
    expect(lastCall).toContain('tipo=secao_texto');
  });
});

test('HomePage renders "Sobre" section and hides it during search', async () => {
  const user = userEvent.setup();
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockResponse(),
  });
  vi.stubGlobal('fetch', fetchMock);

  renderHome();

  // "Sobre" section headers should be present initially
  expect(screen.getByRole('heading', { name: /Conheça o UniSearch/i })).toBeDefined();
  expect(screen.getByText(/Como Surgiu/i)).toBeDefined();
  expect(screen.getByText(/O que a Plataforma Faz/i)).toBeDefined();
  expect(screen.getByText(/Nosso Diferencial/i)).toBeDefined();

  // Search for something to transition hasSearched to true
  const input = screen.getByPlaceholderText(/Busque por/i);
  await user.type(input, 'calculo');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));

  // Wait for results to be shown and verify "Sobre" section is hidden
  await screen.findByText(/resultados encontrados/i);
  expect(screen.queryByRole('heading', { name: /Conheça o UniSearch/i })).toBeNull();
});

test('HomePage scrolls and focuses search input when clicking "Ir para o buscador"', async () => {
  const user = userEvent.setup();
  // Mock window.scrollTo
  const scrollToMock = vi.fn();
  vi.stubGlobal('scrollTo', scrollToMock);

  renderHome();

  const ctaButton = screen.getByRole('button', { name: /Ir para o buscador/i });
  await user.click(ctaButton);

  expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  const input = screen.getByPlaceholderText(/Busque por/i);
  expect(document.activeElement).toBe(input);
});

test('HomePage renders "Você quis dizer" banner and handles suggestion click', async () => {
  const user = userEvent.setup();
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () =>
        mockResponse({
          suggested_query: 'calculo numerico',
        }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () =>
        mockResponse({
          results: [
            {
              url_documento: 'doc-2',
              pagina: 1,
              tipo_conteudo: 'disciplina',
              titulo_documento: 'Cálculo Numérico',
            },
          ],
          total: 1,
        }),
    });

  vi.stubGlobal('fetch', fetchMock);

  renderHome();

  // Search for typo query
  await user.type(screen.getByPlaceholderText(/Busque por/i), 'calclo');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));

  // Check if suggestion banner is displayed
  const suggestionButton = await screen.findByRole('button', { name: 'calculo numerico' });
  expect(screen.getByText(/Você quis dizer/i)).toBeDefined();

  // Click the suggestion
  await user.click(suggestionButton);

  // Check that a second call to fetch was made with the corrected query
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('query=calculo+numerico');
  });

  // Verify input is updated
  const input = screen.getByPlaceholderText(/Busque por/i);
  expect(input.value).toBe('calculo numerico');
});
