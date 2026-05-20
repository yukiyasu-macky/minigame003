import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the minigame003 title screen', () => {
  render(<App />);

  expect(screen.getByRole('img', { name: /minigame003/i })).toBeDefined();
  expect(screen.getByText('よみこみ中...')).toBeDefined();
  expect(screen.getByText('落ちてくるアイテムをカゴでキャッチ！')).toBeDefined();
  expect(screen.getByRole('button', { name: 'タップしてスタート' })).toBeDefined();
});
