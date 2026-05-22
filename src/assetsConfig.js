const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

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
