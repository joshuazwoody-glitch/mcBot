const mineflayer = require('mineflayer');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const axios = require('axios'); // Install this: npm install axios
const express = require('express');

const app = express();
const webPort = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot POV is Active!'));
app.listen(webPort);

// --- AUTO-PINGER ---
// Pings your Render URL every 5 minutes to prevent sleep
const RENDER_URL = 'https://your-app-name.onrender.com'; // CHANGE THIS
setInterval(async () => {
  try {
    await axios.get(RENDER_URL);
    console.log('Self-ping successful: Staying awake.');
  } catch (err) {
    console.error('Ping failed:', err.message);
  }
}, 5 * 60 * 1000);

const bot = mineflayer.createBot({
  host: 'YOUR_SERVER.aternos.me',
  username: 'AutoBrainBot',
  auth: 'offline',
  version: false
});

bot.loadPlugin(pathfinder);

bot.once('spawn', () => {
  console.log('Bot is online!');
  mineflayerViewer(bot, { port: webPort, firstPerson: true });
  
  // Initial movements setup
  const mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  // START BRAIN LOOP
  startAutonomousLoop();
});

async function startAutonomousLoop() {
  while (true) {
    // 1. Find the nearest log
    const log = bot.findBlock({
      matching: (block) => block.name.includes('log'),
      maxDistance: 32
    });

    if (log) {
      console.log('Brain: Found wood, moving to harvest...');
      await bot.pathfinder.goto(new goals.GoalLookAtBlock(log.position, bot.world));
      await bot.dig(log);
    } else {
      console.log('Brain: No wood nearby, wandering...');
      // Wander 10 blocks in a random direction
      const x = bot.entity.position.x + (Math.random() - 0.5) * 20;
      const z = bot.entity.position.z + (Math.random() - 0.5) * 20;
      await bot.pathfinder.goto(new goals.GoalNear(x, bot.entity.position.y, z, 1));
    }
    
    // Small delay between "thoughts"
    await new Promise(r => setTimeout(r, 2000));
  }
}
