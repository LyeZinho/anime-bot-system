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
    .setName('withdraw')
    .setDescription('Saca moedas do banco')
    .addIntegerOption(option =>
      option
        .setName('quantidade')
        .setDescription('Quantidade de moedas (ou 0 para tudo)')
        .setRequired(true)
        .setMinValue(0)
    ),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    let amount = interaction.options.getInteger('quantidade', true);
    const userService = new UserService();

    // Se quantidade for 0, saca tudo
    if (amount === 0) {
      const user = await userService.getUser(interaction.user.id);
      if (!user) {
        await interaction.reply({
          content: '❌ Usuário não encontrado!',
          ephemeral: true,
        });
        return;
      }
      amount = user.bank;
    }

    const result = await userService.bankWithdraw(interaction.user.id, amount);

    if (!result.success) {
      await interaction.reply({
        content: `❌ ${result.error}`,
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🏦 Saque Realizado')
      .setDescription([
        `Você sacou **${amount.toLocaleString()}** moedas do banco!`,
        '',
        `💰 **Carteira:** ${result.wallet?.toLocaleString()} moedas`,
        `🏦 **Banco:** ${result.bank?.toLocaleString()} moedas`,
      ].join('\n'))
      .setColor(COLORS.success);

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
