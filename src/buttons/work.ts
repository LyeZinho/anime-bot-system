import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonHandler } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { COLORS, RARITY_CONFIG } from '../config/constants.js';

const handler: ButtonHandler = {
  customId: 'work',

  async execute(interaction: ButtonInteraction) {
    const [, action, encodedWorkName, pageStr] = interaction.customId.split(':');
    const workName = decodeURIComponent(encodedWorkName);
    const currentPage = parseInt(pageStr);
    const newPage = action === 'next' ? currentPage + 1 : currentPage - 1;

    if (newPage < 1) {
      await interaction.reply({
        content: '❌ Você já está na primeira página!',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferUpdate();

    const characterService = new CharacterService();
    const result = await characterService.getCharactersByWork(workName, newPage);

    if (!result || newPage > result.totalPages) {
      await interaction.followUp({
        content: '❌ Você já está na última página!',
        ephemeral: true,
      });
      return;
    }

    const characterList = result.characters.map((char, index) => {
      const rarity = RARITY_CONFIG[char.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;
      return `${(newPage - 1) * 10 + index + 1}. ${rarity.emoji} **${char.name}** (#${char.id})`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`📺 Personagens de "${workName}"`)
      .setDescription(characterList.join('\n'))
      .setColor(COLORS.primary)
      .setFooter({
        text: `Página ${newPage}/${result.totalPages} • Total: ${result.total} personagens`,
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`work:prev:${encodeURIComponent(workName)}:${newPage}`)
        .setLabel('◀ Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(newPage <= 1),
      new ButtonBuilder()
        .setCustomId(`work:next:${encodeURIComponent(workName)}:${newPage}`)
        .setLabel('Próximo ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(newPage >= result.totalPages)
    );

    await interaction.editReply({
      embeds: [embed],
      components: result.totalPages > 1 ? [row] : [],
    });
  },
};

export default handler;
