# ねこキャッチ

ねこキャッチ is a small browser game built with React and Vite.

The current version is a canvas-based cat catch game. The player moves a cat bed, catches falling cats and cat items for points, and avoids the vacuum. This repository is prepared so the title, share copy, assets, and core game settings can be changed independently.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000/](http://localhost:3000/) to view the game.

### `npm test`

Runs the Vitest test suite.

### `npm run build`

Builds the app for production to the `dist` folder.

## Project Notes

- Main game code: `src/App.jsx`
- Replaceable asset mapping: `src/assetsConfig.js`
- Public image assets: `public/assets/`
- GitHub Pages deployment workflow: `.github/workflows/main.yml`

## Changing the Game

For the next step away from the current item catch game, start with the game copy and tuning constants near the top of `src/App.jsx`, then replace the canvas update/draw functions as the new rules become clear.
