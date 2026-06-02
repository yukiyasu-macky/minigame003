import { getResultMessage, getResultRank } from "./scoring";

export const getResultPresentation = (score, assets) => {
  const rank = getResultRank(score);

  return {
    rank,
    message: getResultMessage(rank),
    image: assets.resultImages?.[rank] || assets.shareIcon || assets.itemImages?.[0],
  };
};
