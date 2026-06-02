import { expect, test } from "vitest";
import { getCatchScore, getComboMultiplier, getResultMessage, getResultRank } from "./scoring";

test("applies combo multiplier from 10 combo", () => {
  expect(getComboMultiplier(9)).toBe(1);
  expect(getComboMultiplier(10)).toBe(1.2);
});

test("calculates normal and rare catch score", () => {
  expect(getCatchScore({ type: "fruit", combo: 1, normalPoints: 10, rarePoints: 50 })).toBe(10);
  expect(getCatchScore({ type: "rare", combo: 10, normalPoints: 10, rarePoints: 50 })).toBe(60);
});

test("returns commercial result ranks and messages", () => {
  expect(getResultRank(800)).toBe("S");
  expect(getResultRank(500)).toBe("A");
  expect(getResultRank(300)).toBe("B");
  expect(getResultRank(299)).toBe("C");
  expect(getResultMessage("S")).toBe("ねこマスター！");
});
