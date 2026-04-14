const mineflayer = require('mineflayer');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const axios = require('axios');
const express = require('express');

// --- WEB SERVER FOR RENDER ---
const app = express();
const webPort = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('AI Bot POV is Active!'));
app.listen(webPort);

// --- AUTO-PINGER (Prevents Render Sleep) ---
const RENDER_URL = 'https://onrender.com'; // PASTE YOUR RENDER URL HERE
setInterval(() => {
  axios.get(RENDER_URL).catch(() => console.log('Self-pinging...'));
}, 5 * 60 * 1000);

// --- BOT CONFIGURATION ---
const bot = mineflayer.createBot({
  host: 'bot1-5xOP.aternos.me', 
  port: 59874,                  // Your specific Aternos port
  username: 'AI_Brain_Bot',
  auth: 'offline',              // Cracked mode
  version: false                // Auto-detects Minecraft version
});

bot.loadPlugin(pathfinder);

bot.on('spawn', () => {
  console.log('Successfully joined bot1-5xOP.aternos.me:59874');
  
  // Start the 3D POV Viewer
  mineflayerViewer(bot, { port: webPort, firstPerson: true });

  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  startBrainLoop();
});

// --- THE BRAIN (Autonomous Logic) ---
async function startBrainLoop() {
  while (true) {
    // Look for wood logs nearby
    const log = bot.findBlock({
      matching: (block) => block.name.includes('log'),
      maxDistance: 32
    });

    if (log) {
      console.log('Brain: Moving to harvest wood...');
      try {
        await bot.pathfinder.goto(new goals.GoalLookAtBlock(log.position, bot.world));
        await bot.dig(log);
      } catch (e) { /* Path failed, retry next loop */ }
    } else {
      // Wander randomly to keep the Aternos server from timing out
      const x = bot.entity.position.x + (Math.random() - 0.5) * 15;
      const z = bot.entity.position.z + (Math.random() - 0.5) * 15;
      bot.pathfinder.setGoal(new goals.GoalNear(x, bot.entity.position.y, z, 1));
    }
    // Wait 10 seconds before the next "thought"
    await new Promise(r => setTimeout(r, 10000));
  }
}

// Auto-restart if kicked or server restarts
bot.on('end', () => {
  console.log('Disconnected. Restarting process in 15 seconds...');
  setTimeout(() => process.exit(), 15000); 
});
