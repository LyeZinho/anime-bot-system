import 'dotenv/config';
import { DiscordBot } from './bot/DiscordBot.js';

const bot = new DiscordBot();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT. Encerrando...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido SIGTERM. Encerrando...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the bot
bot.start().catch((error) => {
  console.error('❌ Erro fatal ao iniciar o bot:', error);
  process.exit(1);
});
