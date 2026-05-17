import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Pagination from './Pagination';

test('Pagination renders page numbers and marks current page', () => {
  const onPageChange = vi.fn();
  render(<Pagination currentPage={2} totalPages={4} onPageChange={onPageChange} />);

  expect(screen.getByRole('button', { name: '1' })).toBeDefined();
  expect(screen.getByRole('button', { name: '2' }).getAttribute('aria-current')).toBe('page');
  expect(screen.getByRole('button', { name: '4' })).toBeDefined();
});

test('Pagination calls onPageChange for numbers and arrows', async () => {
  const user = userEvent.setup();
  const onPageChange = vi.fn();

  render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />);

  await user.click(screen.getByRole('button', { name: '3' }));
  await user.click(screen.getByRole('button', { name: 'Anterior' }));
  await user.click(screen.getByRole('button', { name: 'Proxima' }));

  expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
  expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
  expect(onPageChange).toHaveBeenNthCalledWith(3, 3);
});

test('Pagination does not render for a single page', () => {
  const onPageChange = vi.fn();
  render(<Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />);

  expect(screen.queryByLabelText('Pagination')).toBeNull();
});
