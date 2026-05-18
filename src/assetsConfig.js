const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

export const assets = {
  titleLogo: assetPath("assets/title_logo.png"),
  shareIcon: assetPath("assets/share_icon.png"),
  background: assetPath("assets/bg.png"),
  basket: assetPath("assets/basket.png"),
};