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
    .setName('lucky')
    .setDescription('Jogo da sorte')
    .addIntegerOption(option =>
      option
        .setName('aposta')
        .setDescription('Quantidade de moedas para apostar')
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(10000)
    ),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('aposta', true);
    const userService = new UserService();

    const result = await userService.playLucky(interaction.user.id, bet);

    if (!result.success) {
      await interaction.reply({
        content: `❌ ${result.error}`,
        ephemeral: true,
      });
      return;
    }

    let emoji: string;
    let title: string;
    let color: number;

    switch (result.result) {
      case 'jackpot':
        emoji = '🎰';
        title = 'JACKPOT!!!';
        color = COLORS.legendary;
        break;
      case 'bigWin':
        emoji = '💎';
        title = 'Grande Vitória!';
        color = COLORS.epic;
        break;
      case 'win':
        emoji = '✨';
        title = 'Vitória!';
        color = COLORS.success;
        break;
      case 'smallWin':
        emoji = '🍀';
        title = 'Pequena Vitória';
        color = COLORS.uncommon;
        break;
      default:
        emoji = '💨';
        title = 'Você perdeu...';
        color = COLORS.error;
    }

    const netResult = (result.payout || 0) - bet;
    const resultText = netResult >= 0 
      ? `+${netResult.toLocaleString()}` 
      : `${netResult.toLocaleString()}`;

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} ${title}`)
      .setDescription([
        `**Aposta:** ${bet.toLocaleString()} moedas`,
        `**Prêmio:** ${(result.payout || 0).toLocaleString()} moedas`,
        `**Resultado:** ${resultText} moedas`,
        '',
        `💰 **Saldo:** ${result.newBalance?.toLocaleString()} moedas`,
      ].join('\n'))
      .setColor(color);

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
