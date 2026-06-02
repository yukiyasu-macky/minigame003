import { expect, test } from "vitest";
import { assets } from "./assetsConfig";

test("exposes production asset slots with stable fallback paths", () => {
  expect(assets.titleLogo).toContain("assets/title_logo.png");
  expect(assets.shareIcon).toContain("assets/share_icon.png");
  expect(assets.background).toContain("assets/bg.png");
  expect(assets.basket).toContain("assets/basket.png");
  expect(assets.hazardImage).toContain("assets/hazard.png");
  expect(assets.itemImages).toHaveLength(3);
  expect(assets.rareImages).toHaveLength(3);
  expect(Object.keys(assets.resultImages)).toEqual(["S", "A", "B", "C"]);
});
