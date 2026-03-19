import { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { RouletteCommand } from './commands/roulette';
import { CollectionCommand } from './commands/collection';
import { FavoriteCommand } from './commands/favorite';
import { ProfileCommand } from './commands/profile';
import { LeaderboardCommand } from './commands/leaderboard';
import { GiftCommand } from './commands/gift';
import { SearchCommand } from './commands/search';
import { ApiService } from './services/api';
import { Logger } from './services/logger';

config({ path: join(__dirname, '../../../.env') });

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_TOKEN) {
  console.warn('[BOT] DISCORD_BOT_TOKEN not set — bot will not start');
  console.warn('[BOT] Set it in .env to enable the Discord bot');
  process.exit(0);
}

if (!CLIENT_ID) {
  console.warn('[BOT] DISCORD_CLIENT_ID not set — bot will not start');
  process.exit(0);
}

const API_URL = process.env.API_URL || 'http://localhost:3071/api/v1';

const commands = [
  new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Spin the waifu roulette!'),
  
  new SlashCommandBuilder()
    .setName('collection')
    .setDescription('View your character collection')
    .addUserOption(opt => opt.setName('user').setDescription('View another user\'s collection')),
  
  new SlashCommandBuilder()
    .setName('favorite')
    .setDescription('Manage your favorites')
    .addSubcommand(sub => sub.setName('add').setDescription('Add character to favorites').addStringOption(opt => opt.setName('character').setDescription('Character name or ID').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Remove character from favorites').addStringOption(opt => opt.setName('character').setDescription('Character name or ID').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('List your favorites')),
  
  new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile and stats'),
  
  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View server leaderboard')
    .addIntegerOption(opt => opt.setName('page').setDescription('Page number').setMinValue(1)),
  
  new SlashCommandBuilder()
    .setName('gift')
    .setDescription('Gift a character to another user')
    .addUserOption(opt => opt.setName('user').setDescription('User to gift to').setRequired(true))
    .addStringOption(opt => opt.setName('character').setDescription('Character ID').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a character')
    .addStringOption(opt => opt.setName('query').setDescription('Character name').setRequired(true))
    .addIntegerOption(opt => opt.setName('limit').setDescription('Number of results').setMinValue(1).setMaxValue(10)),
] as SlashCommandBuilder[];

async function main() {
  const logger = new Logger();
  const api = new ApiService(API_URL);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel],
  });

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  client.once('ready', async () => {
    logger.info(`🤖 Bot logged in as ${client.user?.tag}`);

    try {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands.map(c => c.toJSON()) }
      );
      logger.info('✅ Commands registered');
    } catch (error) {
      logger.error('Failed to register commands', error);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user, options, guildId } = interaction;

    try {
      switch (commandName) {
        case 'roulette':
          await RouletteCommand.execute(interaction, api, logger);
          break;
        case 'collection':
          await CollectionCommand.execute(interaction, api, logger);
          break;
        case 'favorite':
          await FavoriteCommand.execute(interaction, api, logger);
          break;
        case 'profile':
          await ProfileCommand.execute(interaction, api, logger);
          break;
        case 'leaderboard':
          await LeaderboardCommand.execute(interaction, api, logger);
          break;
        case 'gift':
          await GiftCommand.execute(interaction, api, logger);
          break;
        case 'search':
          await SearchCommand.execute(interaction, api, logger);
          break;
      }
    } catch (error) {
      logger.error(`Command ${commandName} failed`, error);
      await interaction.reply({ content: '❌ An error occurred', ephemeral: true });
    }
  });

  await client.login(DISCORD_TOKEN);
}

main();
