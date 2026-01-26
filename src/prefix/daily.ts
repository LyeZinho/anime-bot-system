import { Message, EmbedBuilder } from 'discord.js';
import { PrefixCommand } from '../types/discord.js';
import { UserService } from '../services/UserService.js';
import { COLORS } from '../config/constants.js';

const command: PrefixCommand = {
  name: 'daily',
  aliases: ['d'],
  description: 'Recompensa diária',

  async execute(message: Message) {
    const userService = new UserService();
    const result = await userService.claimDaily(message.author.id, message.author.username);

    if (!result.success) {
      const waitHours = Math.floor(result.hoursRemaining!);
      const waitMinutes = Math.floor((result.hoursRemaining! - waitHours) * 60);

      const embed = new EmbedBuilder()
        .setTitle('⏰ Aguarde!')
        .setDescription(`Você já coletou sua recompensa diária.\nVolte em **${waitHours}h ${waitMinutes}m**`)
        .setColor(COLORS.error);

      await message.reply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🎁 Recompensa Diária')
      .setDescription([
        `Você recebeu **${result.amount!.toLocaleString()}** moedas!`,
        '',
        result.bonus! > 0 ? `🔥 Bônus de streak: +${result.bonus!.toLocaleString()}` : '',
        `📅 Streak atual: **${result.streak!}** dias`,
        `💰 Total: **${result.total!.toLocaleString()}** moedas`,
      ].filter(Boolean).join('\n'))
      .setColor(COLORS.success);

    if (result.streak! >= 7) {
      embed.setFooter({ text: '🎉 Parabéns pelo streak de uma semana!' });
    }

    await message.reply({ embeds: [embed] });
  },
};

export default command;
