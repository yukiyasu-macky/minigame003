import { useEffect, useRef, useState } from "react";
import liff from "@line/liff";
import { assets } from "./assetsConfig";

const gameCopy = {
  title: "minigame003",
  titleLogoAlt: "minigame003",
  titleFlavor: "DROP CATCH 003",
  titleDescription: "落ちてくるアイテムをカゴでキャッチ",
  titleBurst: "🐾 🐱 🧶",
  resultBurst: "🍇 🍑 🍋",
  loading: "よみこみ中...",
  startButton: "タップしてスタート",
  resultTitle: "Result",
  scoreLabel: "FINAL SCORE",
  shareButton: "シェアする！",
  replayButton: "もう一度遊ぶ",
  shareAltText: "minigame003 のスコアをシェア！",
  shareScoreText: (score) => `minigame003で${score}点をとったよ！`,
  shareSubtitle: "minigame003 - アイテムキャッチゲーム",
  shareCta: "遊んでみる！",
  shareAgain: "シェアする",
  shareFooterLabel: "minigame003",
  shareSuccess: "シェアしました！",
  shareCancel: "シェアをキャンセルしました。",
  shareError: "エラーが発生しました。",
  shareUnavailable: "この環境ではシェア機能を利用できません。",
};

// Keep the current catch-game tuning here so minigame003 can move to new rules
// without hunting through rendering, collision, and share UI code.
const catchGameConfig = {
  itemIcons: ["🍎", "🍊", "🍓", "🍇", "🍋", "🍑"],
  rareIcons: ["🐟", "🪶", "🧶"],
  hazardIcon: "💣",
  startingLives: 3,
  pointsPerCatch: 10,
  pointsPerRareCatch: 30,
  rareChance: 0.1,
};


export default function App() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const gameRef = useRef(null);
  const audioAssetsRef = useRef(null);
  const assetPreloadRef = useRef(null);

  const [screen, setScreen] = useState("title");
  const [loading, setLoading] = useState(0);
  const [scoreView, setScoreView] = useState(0);
  const [livesView, setLivesView] = useState(catchGameConfig.startingLives);
  const [finalScore, setFinalScore] = useState(0);

  const createAudio = (src, options = {}) => {
    if (!src || typeof Audio === "undefined") return null;

    const audio = new Audio(src);
    audio.preload = "auto";
    audio.loop = Boolean(options.loop);
    audio.volume = options.volume ?? 1;
    return audio;
  };

  const getAudioAssets = () => {
    if (audioAssetsRef.current) return audioAssetsRef.current;

    audioAssetsRef.current = {
      catch: createAudio(assets.sounds.catch, { volume: 0.65 }),
      miss: createAudio(assets.sounds.miss, { volume: 0.55 }),
      damage: createAudio(assets.sounds.damage, { volume: 0.75 }),
      bgm: createAudio(assets.sounds.bgm, { loop: true, volume: 0.34 }),
    };

    return audioAssetsRef.current;
  };

  const getPreloadedImage = (src) => assetPreloadRef.current?.images.get(src);

  const createImage = (src) => {
    const preloadedImage = getPreloadedImage(src);
    if (preloadedImage) return preloadedImage;

    const image = new Image();
    image.src = src;
    return image;
  };

  const preloadImage = (src) =>
    new Promise((resolve) => {
      if (!src || typeof Image === "undefined") {
        resolve();
        return;
      }

      const image = new Image();
      image.onload = () => {
        assetPreloadRef.current?.images.set(src, image);
        resolve();
      };
      image.onerror = () => resolve();
      image.src = src;

      if (image.complete) {
        if (image.naturalWidth > 0) assetPreloadRef.current?.images.set(src, image);
        resolve();
      }
    });

  const preloadAudio = (audio) =>
    new Promise((resolve) => {
      if (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom")) {
        resolve();
        return;
      }

      if (!audio) {
        resolve();
        return;
      }

      const finish = () => resolve();
      audio.addEventListener("canplaythrough", finish, { once: true });
      audio.addEventListener("error", finish, { once: true });

      try {
        audio.load();
      } catch {
        resolve();
      }

      window.setTimeout(resolve, 1200);
    });

  const preloadAssets = (onProgress) => {
    if (assetPreloadRef.current?.complete) {
      onProgress?.(100);
      return assetPreloadRef.current.promise;
    }

    if (assetPreloadRef.current?.promise) return assetPreloadRef.current.promise;

    assetPreloadRef.current = {
      complete: false,
      images: new Map(),
      promise: null,
    };

    const imageSources = [
      assets.background,
      assets.basket,
      assets.titleLogo,
      assets.shareIcon,
      ...(assets.itemImages || []),
      ...(assets.rareImages || []),
      assets.hazardImage,
    ].filter(Boolean);

    const audioAssets = getAudioAssets();
    const audioSources = [
      audioAssets.bgm,
      audioAssets.catch,
      audioAssets.miss,
      audioAssets.damage,
    ].filter(Boolean);

    const total = imageSources.length + audioSources.length;
    let completed = 0;

    const completeOne = () => {
      completed += 1;
      onProgress?.(total > 0 ? (completed / total) * 100 : 100);
    };

    if (total === 0) onProgress?.(100);

    assetPreloadRef.current.promise = Promise.all([
      ...imageSources.map((src) => preloadImage(src).finally(completeOne)),
      ...audioSources.map((audio) => preloadAudio(audio).finally(completeOne)),
    ]).then(() => {
      assetPreloadRef.current.complete = true;
      onProgress?.(100);
    });

    return assetPreloadRef.current.promise;
  };

  const playAudio = (name) => {
    const audio = getAudioAssets()[name];
    if (!audio) return;

    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise) playPromise.catch(() => {});
    } catch {
      // Missing or unsupported replacement audio should never interrupt play.
    }
  };

  const startBgm = () => {
    const bgm = getAudioAssets().bgm;
    if (!bgm || !bgm.paused) return;

    try {
      bgm.currentTime = 0;
      const playPromise = bgm.play();
      if (playPromise) playPromise.catch(() => {});
    } catch {
      // Autoplay and unsupported sources fail silently by design here.
    }
  };

  const stopBgm = () => {
    const bgm = audioAssetsRef.current?.bgm;
    if (!bgm) return;

    try {
      bgm.pause();
      bgm.currentTime = 0;
    } catch {
      // Keep result/game transitions resilient if audio cleanup fails.
    }
  };

  useEffect(() => {
    if (screen !== "title") return;

    let isCancelled = false;
    setLoading(0);

    preloadAssets((progress) => {
      if (!isCancelled) setLoading(progress);
    })
      .catch(() => {})
      .then(() => {
        if (!isCancelled) setLoading(100);
      });

    return () => {
      isCancelled = true;
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageAssets = {
      background: createImage(assets.background),
      basket: createImage(assets.basket),
      items: assets.itemImages.map(createImage),
      rares: assets.rareImages.map(createImage),
      hazard: createImage(assets.hazardImage),
    };

    const isImageReady = (image) => image.complete && image.naturalWidth > 0;

    const roundedRect = (x, y, w, h, r) => {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    };

    const createGame = () => ({
      width: 0,
      height: 0,
      score: 0,
      lives: catchGameConfig.startingLives,
      elapsed: 0,
      spawnTimer: 0,
      lastTime: performance.now(),
      fruits: [],
      basket: { x: 0, y: 0, width: 92, height: 34 },
    });

    gameRef.current = createGame();

    const resize = () => {
      const game = gameRef.current;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      game.width = rect.width;
      game.height = rect.height;
      game.basket.width = Math.min(92, rect.width * 0.26);
      game.basket.height = Math.max(32, rect.height * 0.044);
      game.basket.x = rect.width / 2;
      game.basket.y = rect.height - Math.max(96, rect.height * 0.13);
    };

    const moveBasketTo = (clientX) => {
      const game = gameRef.current;
      if (!game) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const half = game.basket.width / 2;

      game.basket.x = Math.max(half + 12, Math.min(game.width - half - 12, x));
    };

    const handlePointerDown = (event) => {
      event.preventDefault();

      if (typeof canvas.setPointerCapture === "function") {
        canvas.setPointerCapture(event.pointerId);
      }

      moveBasketTo(event.clientX);
    };

    const handlePointerMove = (event) => {
      event.preventDefault();

      if (event.pointerType === "mouse" && event.buttons === 0) {
        return;
      }

      moveBasketTo(event.clientX);
    };

    const handlePointerUp = (event) => {
      if (typeof canvas.releasePointerCapture === "function") {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const spawnFruit = (game) => {
      const size = 28 + Math.random() * 14;
      const isBomb = Math.random() < Math.min(0.28, 0.12 + game.elapsed * 0.003);
      const isRare = !isBomb && Math.random() < catchGameConfig.rareChance;
      const itemIndex = Math.floor(Math.random() * catchGameConfig.itemIcons.length);
      const rareIndex = Math.floor(Math.random() * catchGameConfig.rareIcons.length);

      game.fruits.push({
        x: size + Math.random() * Math.max(1, game.width - size * 2),
        y: -size,
        size,
        speed: 118 + game.elapsed * 5.8 + Math.random() * 66,
        icon: isBomb
          ? catchGameConfig.hazardIcon
          : isRare
            ? catchGameConfig.rareIcons[rareIndex]
            : catchGameConfig.itemIcons[itemIndex],
        imageIndex: isRare ? rareIndex : itemIndex,
        type: isBomb ? "bomb" : isRare ? "rare" : "fruit",
        spin: Math.random() * Math.PI * 2,
      });
    };

    const drawBackground = (game) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
      gradient.addColorStop(0, "#72ddff");
      gradient.addColorStop(0.55, "#fff0a6");
      gradient.addColorStop(1, "#91f1a4");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, game.width, game.height);

      if (isImageReady(imageAssets.background)) {
        const image = imageAssets.background;
        const scale = Math.max(game.width / image.naturalWidth, game.height / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        const x = (game.width - width) / 2;
        const y = (game.height - height) / 2;

        ctx.save();
        ctx.globalAlpha = 0.24;
        ctx.drawImage(image, x, y, width, height);
        ctx.restore();
      }

      ctx.fillStyle = "rgba(255,255,255,0.52)";
      for (let i = 0; i < 7; i += 1) {
        const x = ((i * 120 + game.elapsed * 12) % (game.width + 160)) - 80;
        const y = 68 + i * 44;
        ctx.beginPath();
        ctx.ellipse(x, y, 34, 13, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 27, y + 4, 28, 11, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 25, y + 5, 23, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawHud = (game) => {
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      roundedRect(20, 24, game.width - 40, 52, 18);
      ctx.fill();

      ctx.fillStyle = "#263253";
      ctx.font = "700 18px system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE ${game.score}`, 38, 50);
      ctx.textAlign = "right";
      ctx.fillText(`LIFE ${"♥".repeat(game.lives)}`, game.width - 38, 50);
    };

    const drawFruit = (fruit) => {
      ctx.save();
      ctx.translate(fruit.x, fruit.y);
      ctx.rotate(Math.sin(fruit.spin) * 0.18);

      const itemImage =
        fruit.type === "bomb"
          ? imageAssets.hazard
          : fruit.type === "rare"
            ? imageAssets.rares[fruit.imageIndex % imageAssets.rares.length]
          : imageAssets.items[fruit.imageIndex % imageAssets.items.length];

      if (itemImage && isImageReady(itemImage)) {
        const drawSize = fruit.size * 1.28;
        ctx.drawImage(itemImage, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();
        return;
      }

      ctx.font = `${fruit.size}px system-ui, Apple Color Emoji, Segoe UI Emoji`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(fruit.icon, 0, 0);
      ctx.restore();
    };

    const drawBasket = (basket) => {
      ctx.save();
      ctx.translate(basket.x, basket.y);

      if (isImageReady(imageAssets.basket)) {
        const image = imageAssets.basket;
        const imageWidth = basket.width * 1.18;
        const imageHeight = Math.max(basket.height * 1.9, imageWidth * (image.naturalHeight / image.naturalWidth));

        ctx.drawImage(
          image,
          -imageWidth / 2,
          -imageHeight / 2,
          imageWidth,
          imageHeight
        );
        ctx.restore();
        return;
      }

      ctx.fillStyle = "#bf702b";
      roundedRect(
        -basket.width / 2,
        -basket.height / 2,
        basket.width,
        basket.height,
        12
      );
      ctx.fill();

      ctx.strokeStyle = "#7d4319";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -basket.height / 2, basket.width * 0.36, Math.PI, 0);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.36)";
      ctx.lineWidth = 2;
      for (let x = -basket.width / 2 + 16; x < basket.width / 2; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, -basket.height / 2 + 4);
        ctx.lineTo(x - 9, basket.height / 2 - 5);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawAdSpace = (game) => {
      ctx.fillStyle = "rgba(255,255,255,0.42)";
      roundedRect(22, game.height - 72, game.width - 44, 44, 14);
      ctx.fill();

      ctx.fillStyle = "rgba(38,50,83,0.42)";
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AD SPACE", game.width / 2, game.height - 50);
    };

    const tick = (now) => {
      const game = gameRef.current;
      const delta = Math.min((now - game.lastTime) / 1000, 0.033);
      game.lastTime = now;

      game.elapsed += delta;
      game.spawnTimer += delta;

      const spawnInterval = Math.max(0.32, 1.02 - game.elapsed * 0.018);
      if (game.spawnTimer >= spawnInterval) {
        game.spawnTimer = 0;
        spawnFruit(game);
      }

      const basket = game.basket;
      const left = basket.x - basket.width / 2;
      const right = basket.x + basket.width / 2;
      const top = basket.y - basket.height / 2;

      game.fruits.forEach((fruit) => {
        fruit.y += fruit.speed * delta;
        fruit.spin += delta * 3.4;
      });

      game.fruits = game.fruits.filter((fruit) => {
        const caught =
          fruit.x >= left &&
          fruit.x <= right &&
          fruit.y + fruit.size * 0.35 >= top &&
          fruit.y <= basket.y + basket.height;

        if (caught) {
          if (fruit.type === "bomb") {
            playAudio("damage");
            game.lives -= 1;
            setLivesView(game.lives);

            if (game.lives <= 0) {
              game.lives = 0;
              setFinalScore(game.score);
              stopBgm();
              setScreen("result");
            }

            return false;
          }

          game.score +=
            fruit.type === "rare"
              ? catchGameConfig.pointsPerRareCatch
              : catchGameConfig.pointsPerCatch;
          playAudio("catch");
          setScoreView(game.score);
          return false;
        }

        if (fruit.y - fruit.size > game.height) {
          if (fruit.type !== "bomb") {
            playAudio("miss");
            game.lives -= 1;
            setLivesView(game.lives);

            if (game.lives <= 0) {
              game.lives = 0;
              setFinalScore(game.score);
              stopBgm();
              setScreen("result");
            }
          }

          return false;
        }

        return true;
      });

      drawBackground(game);
      game.fruits.forEach(drawFruit);
      drawBasket(game.basket);
      drawHud(game);
      drawAdSpace(game);

      if (game.lives > 0) rafRef.current = requestAnimationFrame(tick);
    };

    setScoreView(0);
    setLivesView(catchGameConfig.startingLives);
    startBgm();
    resize();

    window.addEventListener("resize", resize);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resize);
    }

    canvas.addEventListener("pointerdown", handlePointerDown, { passive: false });
    canvas.addEventListener("pointermove", handlePointerMove, { passive: false });
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      stopBgm();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", resize);
      }

      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [screen]);

  const startGame = () => {
    if (loading < 100) return;

    getAudioAssets();
    setScoreView(0);
    setLivesView(catchGameConfig.startingLives);
    setFinalScore(0);
    setScreen("game");
  };

  const handleShare = () => {
    const score = finalScore;
    const iconUrl = `${window.location.origin}${assets.shareIcon}`;

    if (liff.isApiAvailable("shareTargetPicker")) {
      liff
        .shareTargetPicker([
          {
            type: "flex",
            altText: gameCopy.shareAltText,
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
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: gameCopy.shareScoreText(score),
                        size: "lg",
                        color: "#000000",
                        weight: "bold",
                        wrap: true,
                      },
                    ],
                    spacing: "none",
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: gameCopy.shareSubtitle,
                        size: "sm",
                        color: "#999999",
                        wrap: true,
                      },
                    ],
                    spacing: "none",
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "button",
                        action: {
                          type: "uri",
                          label: gameCopy.shareCta,
                          uri: `https://miniapp.line.me/${liff.id}`,
                        },
                        style: "primary",
                        height: "md",
                        color: "#17c950",
                      },
                      {
                        type: "button",
                        action: {
                          type: "uri",
                          label: gameCopy.shareAgain,
                          uri: `https://miniapp.line.me/${liff.id}/share`,
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
                    color: "#f0f0f0",
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
                        text: gameCopy.shareFooterLabel,
                        flex: 19,
                        size: "xs",
                        color: "#999999",
                        weight: "bold",
                        gravity: "center",
                        wrap: false,
                      },
                      {
                        type: "image",
                        url: "https://vos.line-scdn.net/service-notifier/footer_go_btn.png",
                        flex: 1,
                        gravity: "center",
                        size: "xxs",
                        action: {
                          type: "uri",
                          label: "action",
                          uri: `https://miniapp.line.me/${liff.id}`,
                        },
                      },
                    ],
                    flex: 1,
                    spacing: "md",
                    margin: "md",
                  },
                ],
              },
            },
          },
        ])
        .then((res) => {
          if (res) {
            alert(gameCopy.shareSuccess);
          } else {
            alert(gameCopy.shareCancel);
          }
        })
        .catch((error) => {
          console.error(error);
          alert(gameCopy.shareError);
        });
    } else {
      alert(gameCopy.shareUnavailable);
    }
  };

  return (
    <main className="app">
      <section className="phoneFrame">
        {screen === "title" && (
          <div className="panel titleScreen">
            <img className="titleLogo" src={assets.titleLogo} alt={gameCopy.titleLogoAlt} />
            <div className="titleDecor" aria-hidden="true">
              <span className="pawMark" />
              <span className="pawMark pawMarkMint" />
              <span className="yarnMark" />
            </div>

            <div className="loadingText">{gameCopy.loading}</div>
            <div className="loadingTrack" aria-label={gameCopy.loading}>
              <div className="loadingBar" style={{ width: `${loading}%` }}>
                <span className="loadingPaw"><span className="pawMark" /></span>
              </div>
              <div className="loadingPawTrail" aria-hidden="true">
                <span className="pawMark" />
                <span className="pawMark" />
                <span className="pawMark" />
                <span className="pawMark" />
                <span className="pawMark" />
              </div>
            </div>

            <p className="titleDescription">
              <span className="inlinePaw pawMark" aria-hidden="true" />
              <span>{gameCopy.titleDescription}！</span>
              <span className="inlinePaw pawMark" aria-hidden="true" />
            </p>

            <button
              className="primaryButton"
              type="button"
              onClick={startGame}
              disabled={loading < 100}
            >
              <span className="buttonPaw pawMark" aria-hidden="true" />
              {gameCopy.startButton}
              <span className="buttonPaw pawMark" aria-hidden="true" />
            </button>
          </div>
        )}

        {screen === "game" && (
          <>
            <canvas ref={canvasRef} className="gameCanvas" />
            <div className="srOnly">
              Score {scoreView} Life {livesView}
            </div>
          </>
        )}

        {screen === "result" && (
          <div className="panel resultScreen">
            <div className="fruitBurst">{gameCopy.resultBurst}</div>
            <h1>{gameCopy.resultTitle}</h1>
            <p className="scoreLabel">{gameCopy.scoreLabel}</p>
            <div className="finalScore">{finalScore}</div>

            <button className="shareButton" type="button" onClick={handleShare}>
              {gameCopy.shareButton}
            </button>

            <button className="primaryButton" type="button" onClick={startGame}>
              {gameCopy.replayButton}
            </button>
          </div>
        )}
      </section>

      <style>{`
        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          overflow: hidden;
          overscroll-behavior: none;
          touch-action: none;
          background: #74e7c2;
        }

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        button {
          font: inherit;
        }

        .app {
          width: 100vw;
          height: 100dvh;
          padding:
            calc(env(safe-area-inset-top) + 12px)
            12px
            calc(env(safe-area-inset-bottom) + 12px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          background:
            radial-gradient(circle at 20% 12%, rgba(255,255,255,0.48), transparent 22%),
            linear-gradient(180deg, #6ee0ff 0%, #9df3b2 100%);
        }

        .phoneFrame {
          position: relative;
          width: min(100%, calc((100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px) * 9 / 16));
          height: min(100%, calc(100vw * 16 / 9));
          max-width: 520px;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          border-radius: 24px;
          background: #bdf5ff;
          box-shadow: 0 18px 40px rgba(39, 74, 95, 0.28);
          touch-action: none;
        }

        .gameCanvas {
          display: block;
          width: 100%;
          height: 100%;
          touch-action: none;
          cursor: pointer;
        }

        .panel {
          width: 100%;
          height: 100%;
          padding: 72px 26px 96px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #263253;
          background:
            radial-gradient(circle at 50% 18%, rgba(255,255,255,0.72), transparent 24%),
            linear-gradient(180deg, #72ddff 0%, #fff0a6 58%, #91f1a4 100%);
        }

        .titleScreen {
          position: relative;
          justify-content: flex-start;
          padding: max(30px, calc(env(safe-area-inset-top) + 26px)) 22px 34px;
          background:
            linear-gradient(180deg, rgba(255,243,230,0.58), rgba(255,236,202,0.62)),
            url("${assets.background}") center / cover no-repeat,
            #fff3e6;
        }

        .titleScreen::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 14% 18%, rgba(255,255,255,0.64), transparent 16%),
            radial-gradient(circle at 82% 74%, rgba(255,255,255,0.46), transparent 20%);
        }

        .titleScreen > * {
          position: relative;
          z-index: 1;
        }

        .titleLogo {
          width: min(112%, 500px);
          height: auto;
          margin: 44px 0 24px;
          display: block;
          filter: drop-shadow(0 14px 12px rgba(94, 60, 38, 0.18));
        }

        .titleDecor {
          position: absolute;
          top: 24%;
          left: 8%;
          right: 8%;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          filter: drop-shadow(0 2px 0 rgba(255,255,255,0.84));
          opacity: 0.94;
          pointer-events: none;
          z-index: 0;
        }

        .pawMark {
          --paw-color: #ff8f95;
          position: relative;
          width: 32px;
          height: 30px;
          display: inline-block;
          flex: 0 0 auto;
        }

        .pawMark::before {
          content: "";
          position: absolute;
          left: 7px;
          bottom: 0;
          width: 18px;
          height: 15px;
          border-radius: 50% 50% 46% 46%;
          background: var(--paw-color);
        }

        .pawMark::after {
          content: "";
          position: absolute;
          left: 1px;
          top: 2px;
          width: 8px;
          height: 10px;
          border-radius: 50%;
          background: var(--paw-color);
          box-shadow:
            11px -3px 0 var(--paw-color),
            22px 0 0 var(--paw-color);
        }

        .pawMarkMint {
          --paw-color: #77d39b;
          transform: translateY(28px);
        }

        .yarnMark {
          width: 28px;
          height: 28px;
          border: 3px solid #5aa5b6;
          border-radius: 50%;
          background:
            linear-gradient(35deg, transparent 44%, #5aa5b6 45% 52%, transparent 53%),
            linear-gradient(-35deg, transparent 44%, #5aa5b6 45% 52%, transparent 53%),
            #87d6dd;
          transform: translateY(12px);
        }

        .gameTitle {
          margin: 0;
          color: #263253;
          font-size: clamp(34px, 10vw, 54px);
          line-height: 1;
          letter-spacing: 0;
          text-shadow: 0 4px 0 rgba(255,255,255,0.62);
        }

        .gameFlavor {
          margin-top: 8px;
          color: rgba(38,50,83,0.72);
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .fruitBurst {
          margin-bottom: 10px;
          font-size: clamp(34px, 10vw, 52px);
        }

        h1 {
          margin: 0;
          color: #263253;
          font-size: clamp(38px, 11vw, 58px);
          line-height: 0.95;
          letter-spacing: 0;
          text-shadow: 0 4px 0 rgba(255,255,255,0.62);
        }

        p {
          max-width: 280px;
          margin: 12px 0 26px;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.6;
        }

        .titleDescription {
          width: min(360px, 94%);
          max-width: none;
          min-height: 54px;
          margin: 28px 0 24px;
          padding: 13px 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid rgba(255,255,255,0.92);
          border-radius: 999px;
          color: #6c3a24;
          background: rgba(255, 247, 221, 0.94);
          box-shadow:
            inset 0 -4px 0 rgba(231, 177, 109, 0.20),
            0 8px 0 rgba(196, 126, 84, 0.22),
            0 16px 26px rgba(119, 82, 52, 0.15);
          font-size: 17px;
          font-weight: 900;
          line-height: 1.35;
        }

        .titleDescription::before,
        .titleDescription::after {
          content: none;
        }

        .inlinePaw {
          --paw-color: #f0908c;
          width: 28px;
          height: 26px;
          margin: 0 8px;
          transform: scale(0.82);
        }

        .loadingTrack {
          position: relative;
          width: min(374px, 92%);
          height: 42px;
          padding: 6px;
          border: 3px solid #ffffff;
          border-radius: 999px;
          background: rgba(255, 250, 235, 0.94);
          box-shadow:
            0 0 0 3px rgba(173, 116, 72, 0.5),
            inset 0 4px 10px rgba(128, 86, 52, 0.12),
            0 10px 18px rgba(112, 72, 44, 0.14);
          overflow: hidden;
        }

        .loadingBar {
          position: relative;
          height: 100%;
          border-radius: 999px;
          min-width: 32px;
          background: #ff8d94;
          box-shadow:
            inset 0 5px 0 rgba(255,255,255,0.38),
            inset 0 -4px 0 rgba(218, 97, 100, 0.22);
          transition: width 160ms ease-out;
          overflow: hidden;
          z-index: 2;
        }

        .loadingBar::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 18% 50%, rgba(255,255,255,0.24) 0 7px, transparent 8px),
            radial-gradient(circle at 42% 50%, rgba(255,255,255,0.18) 0 7px, transparent 8px),
            radial-gradient(circle at 66% 50%, rgba(255,255,255,0.18) 0 7px, transparent 8px),
            radial-gradient(circle at 90% 50%, rgba(255,255,255,0.16) 0 7px, transparent 8px);
        }

        .loadingPaw {
          position: absolute;
          right: 6px;
          top: 50%;
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #fff8ec;
          transform: translateY(-50%);
          box-shadow: 0 2px 0 rgba(131, 74, 48, 0.22);
          z-index: 3;
        }

        .loadingPaw .pawMark {
          width: 20px;
          height: 18px;
          transform: scale(0.66);
        }

        .loadingPawTrail {
          position: absolute;
          inset: 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1;
          pointer-events: none;
        }

        .loadingPawTrail .pawMark {
          --paw-color: rgba(119, 82, 52, 0.34);
          width: 20px;
          height: 18px;
          transform: scale(0.58);
        }

        .loadingText {
          min-height: 34px;
          margin: 8px 0 8px;
          display: flex;
          align-items: center;
          color: #6c3a24;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 0;
          text-shadow: 0 2px 0 rgba(255,255,255,0.78);
        }

        .primaryButton,
        .shareButton {
          min-width: 190px;
          min-height: 54px;
          border: 0;
          border-radius: 999px;
          padding: 14px 26px;
          color: #fff;
          font-size: 18px;
          font-weight: 900;
          touch-action: manipulation;
        }

        .primaryButton {
          margin-top: 8px;
          min-width: min(330px, 92%);
          border: 5px solid #fff;
          background: #ff7478;
          box-shadow:
            inset 0 6px 0 rgba(255,255,255,0.30),
            0 8px 0 #d95b61,
            0 18px 28px rgba(112, 72, 44, 0.24);
          text-shadow: 0 2px 0 rgba(174, 72, 77, 0.44);
        }

        .buttonPaw {
          --paw-color: #fff8ec;
          width: 28px;
          height: 26px;
          margin: 0 10px;
          vertical-align: -4px;
          filter: drop-shadow(0 2px 0 rgba(174, 72, 77, 0.34));
        }

        .primaryButton:disabled {
          cursor: default;
          opacity: 0.72;
          transform: none;
        }

        .shareButton {
          margin-top: 16px;
          background: #17c950;
          box-shadow: 0 7px 0 #11963c, 0 16px 28px rgba(0,0,0,0.2);
        }

        .primaryButton:active,
        .shareButton:active {
          transform: translateY(4px);
        }

        .primaryButton:active {
          box-shadow: 0 3px 0 #c94545, 0 10px 20px rgba(0,0,0,0.18);
        }

        .shareButton:active {
          box-shadow: 0 3px 0 #11963c, 0 10px 20px rgba(0,0,0,0.18);
        }

        .scoreLabel {
          margin-bottom: 8px;
          color: rgba(38,50,83,0.72);
          font-size: 15px;
        }

        .finalScore {
          margin-bottom: 10px;
          color: #ff6464;
          font-size: clamp(58px, 18vw, 92px);
          font-weight: 1000;
          line-height: 1;
          text-shadow: 0 5px 0 rgba(255,255,255,0.72);
        }

        .srOnly {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
        }

        @media (min-aspect-ratio: 9 / 16) {
          .phoneFrame {
            width: auto;
            height: 100%;
          }
        }
      `}</style>
    </main>
  );
}
