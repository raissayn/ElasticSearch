import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import HomePage from './HomePage';
import { SearchProvider } from '../contexts/SearchContext';

const renderHome = () =>
  render(
    <SearchProvider>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </SearchProvider>
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
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('page=2'));
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

  await user.selectOptions(screen.getByRole('combobox'), 'recent');

  await waitFor(() => {
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=1');
  });

  await user.click(screen.getByText('Tudo'));
  await user.click(screen.getByText('Disciplinas'));

  await waitFor(() => {
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=1');
    expect(lastCall).toContain('tipo=disciplina');
  });
});
