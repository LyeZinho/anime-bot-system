import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { RARITY_CONFIG, COLORS } from '../config/constants.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('collection')
    .setDescription('Veja sua coleção de personagens')
    .addIntegerOption(option =>
      option
        .setName('pagina')
        .setDescription('Página da coleção')
        .setRequired(false)
    ),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction) {
    const page = interaction.options.getInteger('pagina') || 1;
    const characterService = new CharacterService();

    const result = await characterService.getUserCollection(
      interaction.user.id,
      page,
      10
    );

    if (result.characters.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('📦 Sua Coleção')
        .setDescription('Sua coleção está vazia! Use `/roll` para obter personagens.')
        .setColor(COLORS.warning);

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const characterList = result.characters.map((uc, index) => {
      const rarity = RARITY_CONFIG[uc.character.rarity] || RARITY_CONFIG.common;
      const version = uc.version?.name ? ` (${uc.version.name})` : '';
      return `${(page - 1) * 10 + index + 1}. ${rarity.emoji} **${uc.character.name}**${version}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`📦 Coleção de ${interaction.user.displayName}`)
      .setDescription(characterList.join('\n'))
      .setColor(COLORS.primary)
      .setFooter({
        text: `Página ${page}/${result.totalPages} • Total: ${result.total} personagens`,
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`collection:prev:${interaction.user.id}:${page}`)
        .setLabel('◀ Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 1),
      new ButtonBuilder()
        .setCustomId(`collection:next:${interaction.user.id}:${page}`)
        .setLabel('Próximo ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= result.totalPages)
    );

    await interaction.reply({
      embeds: [embed],
      components: result.totalPages > 1 ? [row] : [],
    });
  },
};

export default command;
