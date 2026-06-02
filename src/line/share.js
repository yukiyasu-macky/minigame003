export const createShareScoreText = ({ score, maxCombo, rank, rareCount }) =>
  `ねこキャッチで${score}点！最大${maxCombo}コンボ、ランク${rank}、レア猫${rareCount}匹に出会ったよ！`;

export const createShareFlexMessage = ({
  altText,
  iconUrl,
  scoreText,
  subtitle,
  ctaLabel,
  playUrl,
  shareAgainLabel,
  shareUrl,
  footerLabel,
}) => ({
  type: "flex",
  altText,
  contents: {
    type: "bubble",
    hero: {
      type: "image",
      url: iconUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: scoreText,
          size: "lg",
          color: "#5f3a28",
          weight: "bold",
          wrap: true,
        },
        {
          type: "text",
          text: subtitle,
          size: "sm",
          color: "#9a7a65",
          wrap: true,
          margin: "sm",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: ctaLabel,
                uri: playUrl,
              },
              style: "primary",
              height: "md",
              color: "#17c950",
            },
            {
              type: "button",
              action: {
                type: "uri",
                label: shareAgainLabel,
                uri: shareUrl,
              },
              style: "link",
              height: "md",
              color: "#469fd6",
            },
          ],
          spacing: "xs",
          margin: "lg",
        },
      ],
      spacing: "md",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "separator",
          color: "#f0e2d4",
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "image",
              url: iconUrl,
              flex: 1,
              gravity: "center",
            },
            {
              type: "text",
              text: footerLabel,
              flex: 19,
              size: "xs",
              color: "#9a7a65",
              weight: "bold",
              gravity: "center",
              wrap: false,
            },
          ],
          flex: 1,
          spacing: "md",
          margin: "md",
        },
      ],
    },
  },
});
