import { expect, test } from "vitest";
import { getResultPresentation } from "./resultPresentation";

const testAssets = {
  shareIcon: "/share.png",
  resultImages: {
    S: "/result-s.png",
    A: "/result-a.png",
    B: "/result-b.png",
    C: "/result-c.png",
  },
};

test("returns rank-specific result message and image", () => {
  expect(getResultPresentation(800, testAssets)).toEqual({
    rank: "S",
    message: "ねこマスター！",
    image: "/result-s.png",
  });

  expect(getResultPresentation(299, testAssets)).toEqual({
    rank: "C",
    message: "次はもっと集めるにゃ！",
    image: "/result-c.png",
  });
});
