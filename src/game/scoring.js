export const getComboMultiplier = (combo) => (combo >= 10 ? 1.2 : 1);

export const getCatchScore = ({ type, combo, normalPoints, rarePoints }) => {
  const baseScore = type === "rare" ? rarePoints : normalPoints;
  return Math.round(baseScore * getComboMultiplier(combo));
};

export const getResultRank = (score) => {
  if (score >= 800) return "S";
  if (score >= 500) return "A";
  if (score >= 300) return "B";
  return "C";
};

export const getResultMessage = (rank) => {
  const messages = {
    S: "ねこマスター！",
    A: "かなりの猫好き！",
    B: "いい感じに集まったにゃ！",
    C: "次はもっと集めるにゃ！",
  };

  return messages[rank] ?? messages.C;
};
