import { Message, EmbedBuilder } from 'discord.js';
import { PrefixCommand } from '../types/discord.js';
import { UserService } from '../services/UserService.js';
import { COLORS } from '../config/constants.js';

const command: PrefixCommand = {
  name: 'profile',
  aliases: ['p'],
  description: 'Veja seu perfil',

  async execute(message: Message) {
    const userService = new UserService();
    const user = await userService.findOrCreate(message.author.id, message.author.username);
    const stats = await userService.getStats(message.author.id);

    const embed = new EmbedBuilder()
      .setTitle(`📊 Perfil de ${message.author.displayName}`)
      .setColor(COLORS.primary)
      .setThumbnail(message.author.displayAvatarURL())
      .addFields(
        {
          name: '💰 Economia',
          value: [
            `Moedas: **${user.coins.toLocaleString()}**`,
            `Banco: **${user.bank.toLocaleString()}**`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🎲 Atividade',
          value: [
            `Total de Rolls: **${stats.totalRolls}**`,
            `Total de Claims: **${stats.totalClaims}**`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '⚔️ Batalhas',
          value: [
            `Vitórias: **${user.battleWins}**`,
            `Derrotas: **${user.battleLosses}**`,
            `Rating: **${user.battleRating}**`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '📅 Streak',
          value: `Sequência Diária: **${user.dailyStreak}** dias`,
          inline: true,
        }
      )
      .setFooter({ text: 'Use !help para ver todos os comandos' });

    await message.reply({ embeds: [embed] });
  },
};

export default command;
