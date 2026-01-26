import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { UserService } from '../services/UserService.js';
import { COLORS } from '../config/constants.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Veja seu perfil ou de outro usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário para ver o perfil')
        .setRequired(false)
    ),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const userService = new UserService();

    const user = await userService.findOrCreate(targetUser.id, targetUser.username);
    const stats = await userService.getStats(targetUser.id);

    const embed = new EmbedBuilder()
      .setTitle(`📊 Perfil de ${targetUser.displayName}`)
      .setColor(COLORS.primary)
      .setThumbnail(targetUser.displayAvatarURL())
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
            `Coleção: **${stats.collectionSize}**`,
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
      .setFooter({ text: 'Use /help para ver todos os comandos' });

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
