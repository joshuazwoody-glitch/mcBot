const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')

const bot = mineflayer.createBot({
  host: 'YOUR_SERVER_IP.aternos.me',
  username: 'AI_Bot_POV',
  auth: 'offline', // For Cracked mode
  version: false   // Auto-detect version
})

bot.once('spawn', () => {
  console.log('Bot joined! Viewing at port 3000')
  // This creates the live POV website
  mineflayerViewer(bot, { port: 3000, firstPerson: true }) 
})

// Keep the process alive for Render
const express = require('express')
const app = express()
app.get('/', (req, res) => res.send('Bot is running!'))
app.listen(10000) // Render's default port
