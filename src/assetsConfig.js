const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

// Formal production asset slots:
// - background: replace bg.png with bg_room.png when the room artwork is ready.
// - basket: replace basket.png with basket_cat_bed.png when the final cat bed is ready.
// - itemImages: item_cat_01.png, item_fish.png, item_yarn.png, item_teaser.png, item_paw_coin.png.
// - rareImages: rare_scottish.png, rare_ragdoll.png, rare_munchkin.png.
// - hazardImage: hazard_vacuum.png.
// - resultImages: result_cat_s.png, result_cat_a.png, result_cat_b.png, result_cat_c.png.
// Keep the current fallback PNGs here until each formal asset exists in public/assets.
export const assets = {
  titleLogo: assetPath("assets/title_logo.png"),
  shareIcon: assetPath("assets/share_icon.png"),
  background: assetPath("assets/bg.png"),
  basket: assetPath("assets/basket.png"),
  itemImages: [
    assetPath("assets/item_01.png"),
    assetPath("assets/item_02.png"),
    assetPath("assets/item_03.png"),
  ],
  rareImages: [
    assetPath("assets/rare_01.png"),
    assetPath("assets/rare_02.png"),
    assetPath("assets/rare_03.png"),
  ],
  hazardImage: assetPath("assets/hazard.png"),
  resultImages: {
    S: assetPath("assets/share_icon.png"),
    A: assetPath("assets/share_icon.png"),
    B: assetPath("assets/item_01.png"),
    C: assetPath("assets/item_02.png"),
  },
  sounds: {
    catch: assetPath("assets/se_catch.wav"),
    rare: assetPath("assets/se_rare.wav"),
    damage: assetPath("assets/se_damage.wav"),
    miss: assetPath("assets/se_miss.wav"),
    button: assetPath("assets/se_button.wav"),
    start: assetPath("assets/se_start.wav"),
    gameover: assetPath("assets/se_gameover.wav"),
    bgm: assetPath("assets/bgm.mp3"),
  },
};
