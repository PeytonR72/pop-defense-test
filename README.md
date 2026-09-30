# Chroma Defenders

Chroma Defenders is an original, browser-based tower defense game built with TypeScript, Vite, and HTML5 Canvas.

## Features

- **10 Unique Towers**: From basic Peashooters and Sniper Towers to specialized defenses like Cryo Rays (slow), Venom Spitters (DoT), Tesla Coils (chain lightning), and Spike Factories (traps). Each tower features 3 specific upgrades.
- **3 Distinct Maps**: Play on Verdant Valley, Scorched Sands, or Frostbite Peak. Each features a unique layout and theme.
- **100 Rounds of Escalating Difficulty**: Defend against waves of Basic, Fast, Armored, Splitting, Regenerating, and Boss enemies.
- **Full Economy & Meta Loop**: Manage cash, lives, and tower placements. Utilize 1x/2x speed controls and manual targeting modes (First, Last, Strong, Weak).
- **Juicy Visuals and Audio**: Features a custom particle system for hits and explosions, and synthesized sound effects generated dynamically using the Web Audio API.

## How to Play

1. **Select a Map**: Click on one of the 3 maps on the map selection screen.
2. **Build Defenses**: Click on a tower in the right-hand panel, then click on the map to place it. Be careful, placing towers requires cash!
3. **Start Waves**: Click "Start Wave" to begin the assault.
4. **Upgrade & Manage**: Click on an existing tower to view its stats, change its targeting priority, purchase powerful upgrades, or sell it for a partial refund.
5. **Survive**: Do not let your lives reach 0! Survive all 100 rounds to win.

## Development Setup

To run the game locally:

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository and navigate to the folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the provided `localhost` link in your web browser.

## Build for Production

To create a static production build:

```bash
npm run build
```
The compiled assets will be placed in the `dist` directory, ready to be hosted on any static file server.