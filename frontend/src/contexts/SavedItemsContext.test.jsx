import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import { SavedItemsProvider, useSavedItems } from './SavedItemsContext';

const Probe = ({ item }) => {
  const { savedItems, isSaved, toggleSave, removeSaved } = useSavedItems();
  const key = item?.document_id || 'probe-1';
  return (
    <div>
      <span data-testid="count">{savedItems.length}</span>
      <span data-testid="saved">{isSaved(key) ? 'yes' : 'no'}</span>
      <button onClick={() => toggleSave(item)}>toggle</button>
      <button onClick={() => removeSaved(key)}>remove</button>
    </div>
  );
};

const renderProbe = (item) =>
  render(
    <SavedItemsProvider>
      <Probe item={item} />
    </SavedItemsProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test('starts empty when storage is empty', () => {
  renderProbe({ document_id: 'a' });
  expect(screen.getByTestId('count').textContent).toBe('0');
  expect(screen.getByTestId('saved').textContent).toBe('no');
});

test('toggleSave adds and removes an item', async () => {
  const user = userEvent.setup();
  renderProbe({ document_id: 'a', titulo_documento: 'Doc A' });

  await user.click(screen.getByText('toggle'));
  expect(screen.getByTestId('count').textContent).toBe('1');
  expect(screen.getByTestId('saved').textContent).toBe('yes');

  await user.click(screen.getByText('toggle'));
  expect(screen.getByTestId('count').textContent).toBe('0');
  expect(screen.getByTestId('saved').textContent).toBe('no');
});

test('removeSaved removes the item by key', async () => {
  const user = userEvent.setup();
  renderProbe({ document_id: 'a', titulo_documento: 'Doc A' });

  await user.click(screen.getByText('toggle'));
  expect(screen.getByTestId('count').textContent).toBe('1');

  await user.click(screen.getByText('remove'));
  expect(screen.getByTestId('count').textContent).toBe('0');
});

test('persists items to localStorage', async () => {
  const user = userEvent.setup();
  renderProbe({ document_id: 'a', titulo_documento: 'Doc A' });

  await user.click(screen.getByText('toggle'));

  await act(async () => {
    // let useEffect flush the write
  });

  const raw = localStorage.getItem('unisearch:saved');
  expect(raw).not.toBeNull();
  const parsed = JSON.parse(raw);
  expect(parsed).toHaveLength(1);
  expect(parsed[0].document_id).toBe('a');
});

test('restores items from localStorage on init', () => {
  localStorage.setItem(
    'unisearch:saved',
    JSON.stringify([{ document_id: 'b', titulo_documento: 'Doc B' }])
  );
  renderProbe({ document_id: 'b' });
  expect(screen.getByTestId('count').textContent).toBe('1');
  expect(screen.getByTestId('saved').textContent).toBe('yes');
});

test('throws when used outside provider', () => {
  const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<Probe />)).toThrow(/must be used within/);
  errSpy.mockRestore();
});
