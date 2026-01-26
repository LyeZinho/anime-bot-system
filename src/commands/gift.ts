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
    .setName('gift')
    .setDescription('Presenteia moedas para outro usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário que receberá as moedas')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('quantidade')
        .setDescription('Quantidade de moedas')
        .setRequired(true)
        .setMinValue(1)
    ),

  cooldown: 10,

  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('usuario', true);
    const amount = interaction.options.getInteger('quantidade', true);
    const userService = new UserService();

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({
        content: '❌ Você não pode presentear a si mesmo!',
        ephemeral: true,
      });
      return;
    }

    if (targetUser.bot) {
      await interaction.reply({
        content: '❌ Você não pode presentear bots!',
        ephemeral: true,
      });
      return;
    }

    const result = await userService.giftCoins(
      interaction.user.id,
      targetUser.id,
      amount
    );

    if (!result.success) {
      await interaction.reply({
        content: `❌ ${result.error}`,
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🎁 Presente Enviado!')
      .setDescription([
        `Você presenteou **${targetUser.displayName}** com **${amount.toLocaleString()}** moedas!`,
        '',
        `💰 **Seu saldo:** ${result.senderBalance?.toLocaleString()} moedas`,
      ].join('\n'))
      .setColor(COLORS.success)
      .setThumbnail(targetUser.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
