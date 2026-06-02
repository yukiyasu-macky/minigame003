export const gameCopy = {
  title: "ねこキャッチ",
  titleLogoAlt: "ねこキャッチ",
  titleFlavor: "CAT CATCH",
  titleDescription: "落ちてくる猫とアイテムをキャッチ",
  titleBurst: "🐾 🐱 🧶",
  resultBurst: "🐾 🐱 🐾",
  loading: "よみこみ中...",
  startButton: "タップしてスタート",
  resultTitle: "けっか！",
  scoreLabel: "にゃんこスコア",
  maxComboLabel: "最大コンボ",
  rareCountLabel: "レア猫キャッチ",
  rankLabel: "評価ランク",
  shareButton: "シェアする",
  replayButton: "もういちどあそぶ",
  shareAltText: "ねこキャッチのスコアをシェア！",
  shareScoreText: (score, maxCombo, rank) =>
    `ねこキャッチで${score}点をとったよ！最大${maxCombo}コンボ、ランク${rank}！`,
  shareSubtitle: "ねこキャッチ - LINE向け猫キャッチゲーム",
  shareCta: "遊んでみる！",
  shareAgain: "シェアする",
  shareFooterLabel: "ねこキャッチ",
  shareSuccess: "シェアしました！",
  shareCancel: "シェアをキャンセルしました。",
  shareError: "エラーが発生しました。",
  shareUnavailable: "この環境ではシェア機能を利用できません。",
};

export const catchGameConfig = {
  itemIcons: ["🐱", "🐟", "🧶", "🪶", "🐾"],
  rareIcons: ["😺", "😻", "🐈"],
  hazardIcon: "🧹",
  startingLives: 3,
  durationSeconds: 45,
  pointsPerCatch: 10,
  pointsPerRareCatch: 50,
  rareChance: 0.1,
  adBannerReservedHeight: 100,
  adBannerMinHeight: 80,
  adBannerMaxHeight: 120,
  basketScale: 1.2,
  itemScale: 1.24,
  startEffectSeconds: 0.72,
  finishEffectSeconds: 0.64,
};

export const getAdBannerReservedHeight = (screenHeight) =>
  Math.min(
    catchGameConfig.adBannerMaxHeight,
    Math.max(catchGameConfig.adBannerMinHeight, screenHeight * 0.12)
  );
