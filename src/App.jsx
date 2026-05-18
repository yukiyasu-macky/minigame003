import { useEffect, useRef, useState } from "react";
import liff from "@line/liff";
import { assets } from "./assetsConfig";

export default function App() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const gameRef = useRef(null);

  const [screen, setScreen] = useState("title");
  const [loading, setLoading] = useState(0);
  const [scoreView, setScoreView] = useState(0);
  const [livesView, setLivesView] = useState(3);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (screen !== "title") return;

    setLoading(0);
    const start = performance.now();
    const duration = 1200;

    const tick = () => {
      const progress = Math.min(
        100,
        ((performance.now() - start) / duration) * 100
      );
      setLoading(progress);
      if (progress < 100) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const fruitIcons = ["🍎", "🍊", "🍓", "🍇", "🍋", "🍑"];
    const imageAssets = {
      background: new Image(),
      basket: new Image(),
    };

    imageAssets.background.src = assets.background;
    imageAssets.basket.src = assets.basket;

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
      lives: 3,
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

      game.fruits.push({
        x: size + Math.random() * Math.max(1, game.width - size * 2),
        y: -size,
        size,
        speed: 118 + game.elapsed * 5.8 + Math.random() * 66,
        icon: isBomb
          ? "💣"
          : fruitIcons[Math.floor(Math.random() * fruitIcons.length)],
        type: isBomb ? "bomb" : "fruit",
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
            game.lives -= 1;
            setLivesView(game.lives);

            if (game.lives <= 0) {
              game.lives = 0;
              setFinalScore(game.score);
              setScreen("result");
            }

            return false;
          }

          game.score += 10;
          setScoreView(game.score);
          return false;
        }

        if (fruit.y - fruit.size > game.height) {
          if (fruit.type !== "bomb") {
            game.lives -= 1;
            setLivesView(game.lives);

            if (game.lives <= 0) {
              game.lives = 0;
              setFinalScore(game.score);
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
    setLivesView(3);
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
    setScoreView(0);
    setLivesView(3);
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
            altText: "ゲームスコアをシェア！",
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
                        text: `ゲームで${score}点をとったよ！`,
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
                        text: "手軽に遊べるミニゲーム",
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
                          label: "遊んでみる！",
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
                          label: "シェアする",
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
                        text: "ゲーム",
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
            alert("シェアしました！");
          } else {
            alert("シェアをキャンセルしました。");
          }
        })
        .catch((error) => {
          console.error(error);
          alert("エラーが発生しました。");
        });
    } else {
      alert("この環境ではシェア機能を利用できません。");
    }
  };

  return (
    <main className="app">
      <section className="phoneFrame">
        {screen === "title" && (
          <div className="panel titleScreen">
            <img className="titleLogo" src={assets.titleLogo} alt="MINI GAMES" />
            <div className="fruitBurst">🍎 🍊 🍓</div>
            <p>落ちてくるフルーツをカゴでキャッチ</p>

            <div className="loadingTrack">
              <div className="loadingBar" style={{ width: `${loading}%` }} />
            </div>

            {loading >= 100 ? (
              <button className="primaryButton" type="button" onClick={startGame}>
                タップしてスタート
              </button>
            ) : (
              <div className="loadingText">Loading...</div>
            )}
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
            <div className="fruitBurst">🍇 🍑 🍋</div>
            <h1>Result</h1>
            <p className="scoreLabel">FINAL SCORE</p>
            <div className="finalScore">{finalScore}</div>

            <button className="shareButton" type="button" onClick={handleShare}>
              シェアする！
            </button>

            <button className="primaryButton" type="button" onClick={startGame}>
              もう一度遊ぶ
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
          justify-content: flex-start;
          padding-top: max(54px, calc(env(safe-area-inset-top) + 42px));
        }

        .titleLogo {
          width: min(92%, 390px);
          height: auto;
          margin: 0 0 18px;
          display: block;
          filter: drop-shadow(0 12px 18px rgba(28, 35, 62, 0.22));
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

        .loadingTrack {
          width: min(280px, 82%);
          height: 20px;
          padding: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.74);
        }

        .loadingBar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #ff6464, #ffbd4a, #66dc7a);
          transition: width 80ms linear;
        }

        .loadingText {
          min-height: 54px;
          margin-top: 22px;
          display: flex;
          align-items: center;
          color: rgba(38,50,83,0.72);
          font-weight: 800;
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
          margin-top: 22px;
          background: #ff6464;
          box-shadow: 0 7px 0 #c94545, 0 16px 28px rgba(0,0,0,0.22);
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
