import { expect, test } from "vitest";
import { createShareFlexMessage, createShareScoreText } from "./share";

test("share text includes score combo rank and rare count", () => {
  const text = createShareScoreText({
    score: 720,
    maxCombo: 12,
    rank: "A",
    rareCount: 2,
  });

  expect(text).toContain("720点");
  expect(text).toContain("最大12コンボ");
  expect(text).toContain("ランクA");
  expect(text).toContain("レア猫2匹");
});

test("share flex message uses the provided share icon", () => {
  const message = createShareFlexMessage({
    altText: "ねこキャッチのスコアをシェア！",
    iconUrl: "https://example.com/share_icon.png",
    scoreText: "ねこキャッチで720点！",
    subtitle: "ねこキャッチ",
    ctaLabel: "遊んでみる！",
    playUrl: "https://miniapp.line.me/test",
    shareAgainLabel: "シェアする",
    shareUrl: "https://miniapp.line.me/test/share",
    footerLabel: "ねこキャッチ",
  });

  expect(message.altText).toBe("ねこキャッチのスコアをシェア！");
  expect(message.contents.hero.url).toBe("https://example.com/share_icon.png");
});
