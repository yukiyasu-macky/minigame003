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
    catch: assetPath("assets/se_catch.mp3"),
    miss: assetPath("assets/se_miss.mp3"),
    damage: assetPath("assets/se_damage.mp3"),
    bgm: assetPath("assets/bgm.mp3"),
  },
};
