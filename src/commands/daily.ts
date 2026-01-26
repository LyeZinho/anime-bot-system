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
    .setName('daily')
    .setDescription('Colete sua recompensa diária'),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    const userService = new UserService();
    const result = await userService.claimDaily(
      interaction.user.id,
      interaction.user.username
    );

    if (!result.success) {
      const hours = Math.floor(result.hoursRemaining || 0);
      const minutes = Math.floor(((result.hoursRemaining || 0) - hours) * 60);

      const embed = new EmbedBuilder()
        .setTitle('⏰ Aguarde!')
        .setDescription(`Você já coletou sua recompensa diária.\nVolte em **${hours}h ${minutes}m**`)
        .setColor(COLORS.error);

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🎁 Recompensa Diária')
      .setDescription([
        `Você recebeu **${result.amount?.toLocaleString()}** moedas!`,
        '',
        result.bonus && result.bonus > 0 ? `🔥 Bônus de streak: +${result.bonus.toLocaleString()}` : '',
        `📅 Streak atual: **${result.streak}** dias`,
        `💰 Total: **${result.total?.toLocaleString()}** moedas`,
      ].filter(Boolean).join('\n'))
      .setColor(COLORS.success);

    if (result.streak && result.streak >= 7) {
      embed.setFooter({ text: '🎉 Parabéns pelo streak de uma semana!' });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
