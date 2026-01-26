import { Events, Message, Collection } from 'discord.js';
import { Event } from '../types/discord.js';
import prisma from '../lib/prisma.js';

const DEFAULT_PREFIX = '!';

const event: Event<typeof Events.MessageCreate> = {
  name: Events.MessageCreate,
  once: false,

  async execute(message: Message) {
    // Ignore bots and DMs
    if (message.author.bot) return;
    if (!message.guild) return;

    // Get guild prefix
    let prefix = DEFAULT_PREFIX;
    try {
      const guildSettings = await prisma.guildSettings.findUnique({
        where: { id: message.guild.id },
      });
      if (guildSettings?.prefix) {
        prefix = guildSettings.prefix;
      }
    } catch {
      // Use default prefix if database error
    }

    // Check if message starts with prefix
    if (!message.content.startsWith(prefix)) return;

    // Parse command and arguments
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // Find command
    const command = message.client.prefixCommands.get(commandName);
    if (!command) return;

    // Check cooldown
    if (command.cooldown) {
      const cooldowns = message.client.cooldowns;
      const key = `prefix_${command.name}`;

      if (!cooldowns.has(key)) {
        cooldowns.set(key, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(key)!;
      const cooldownAmount = command.cooldown * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.reply({
            content: `⏳ Aguarde **${timeLeft.toFixed(1)}s** antes de usar \`${prefix}${command.name}\` novamente.`,
          });
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    // Execute command
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(`❌ Erro no comando prefix ${commandName}:`, error);
      await message.reply('❌ Ocorreu um erro ao executar este comando.');
    }
  },
};

export default event;
