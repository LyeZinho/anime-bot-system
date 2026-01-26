import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonHandler } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { RARITY_CONFIG, COLORS } from '../config/constants.js';

const handler: ButtonHandler = {
  customId: 'collection',

  async execute(interaction: ButtonInteraction) {
    // Format: collection:action:userId:currentPage
    const [, action, userId, currentPageStr] = interaction.customId.split(':');
    const currentPage = parseInt(currentPageStr);

    // Verificar se é o usuário da coleção
    if (interaction.user.id !== userId) {
      await interaction.reply({
        content: '❌ Você não pode navegar na coleção de outra pessoa!',
        ephemeral: true,
      });
      return;
    }

    const newPage = action === 'next' ? currentPage + 1 : currentPage - 1;

    if (newPage < 1) {
      await interaction.reply({
        content: '❌ Você já está na primeira página!',
        ephemeral: true,
      });
      return;
    }

    const characterService = new CharacterService();
    const result = await characterService.getUserCollection(userId, newPage, 10);

    if (newPage > result.totalPages) {
      await interaction.reply({
        content: '❌ Você já está na última página!',
        ephemeral: true,
      });
      return;
    }

    const characterList = result.characters.map((uc, index) => {
      const rarity = RARITY_CONFIG[uc.character.rarity as keyof typeof RARITY_CONFIG];
      const version = uc.version?.name ? ` (${uc.version.name})` : '';
      return `${(newPage - 1) * 10 + index + 1}. ${rarity.emoji} **${uc.character.name}**${version}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`📦 Coleção de ${interaction.user.displayName}`)
      .setDescription(characterList.join('\n'))
      .setColor(COLORS.primary)
      .setFooter({
        text: `Página ${newPage}/${result.totalPages} • Total: ${result.total} personagens`,
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`collection:prev:${userId}:${newPage}`)
        .setLabel('◀ Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(newPage <= 1),
      new ButtonBuilder()
        .setCustomId(`collection:next:${userId}:${newPage}`)
        .setLabel('Próximo ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(newPage >= result.totalPages)
    );

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
  },
};

export default handler;
