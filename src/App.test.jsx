import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the minigame003 title screen', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /minigame003/i })).toBeDefined();
  expect(screen.getByText('DROP CATCH 003')).toBeDefined();
  expect(screen.getByText('落ちてくるアイテムをカゴでキャッチ')).toBeDefined();
});
