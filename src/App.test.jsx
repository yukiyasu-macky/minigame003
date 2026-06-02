import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { gameCopy } from './game/gameConfig';

test('renders the neko catch title screen', () => {
  render(<App />);

  expect(screen.getByRole('img', { name: 'ねこキャッチ' })).toBeDefined();
  expect(screen.getByText('よみこみ中...')).toBeDefined();
  expect(screen.getByText('落ちてくる猫とアイテムをキャッチ！')).toBeDefined();
  expect(screen.getByRole('button', { name: 'タップしてスタート' })).toBeDefined();
});

test('keeps result copy aligned with the neko catch theme', () => {
  expect(gameCopy.resultTitle).toBe('けっか！');
  expect(gameCopy.scoreLabel).toBe('にゃんこスコア');
  expect(gameCopy.maxComboLabel).toBe('最大コンボ');
  expect(gameCopy.rareCountLabel).toBe('レア猫キャッチ');
});
