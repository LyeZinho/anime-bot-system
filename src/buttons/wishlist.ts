import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonHandler } from '../types/discord.js';
import { COLORS, RARITY_CONFIG } from '../config/constants.js';
import prisma from '../database/prisma.js';

const handler: ButtonHandler = {
  customId: 'wishlist',

  async execute(interaction: ButtonInteraction) {
    const [, action, userId, pageStr] = interaction.customId.split(':');

    // Verificar se é o dono da wishlist
    if (interaction.user.id !== userId) {
      await interaction.reply({
        content: '❌ Você não pode interagir com a wishlist de outra pessoa!',
        ephemeral: true,
      });
      return;
    }

    switch (action) {
      case 'prev':
      case 'next':
        await handlePagination(interaction, action, parseInt(pageStr));
        break;
      case 'confirm_clear':
        await handleConfirmClear(interaction);
        break;
      case 'cancel_clear':
        await handleCancelClear(interaction);
        break;
    }
  },
};

async function handlePagination(
  interaction: ButtonInteraction,
  action: string,
  currentPage: number
) {
  const newPage = action === 'next' ? currentPage + 1 : currentPage - 1;
  const perPage = 10;

  if (newPage < 1) {
    await interaction.reply({
      content: '❌ Você já está na primeira página!',
      ephemeral: true,
    });
    return;
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: interaction.user.id },
    include: {
      character: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: (newPage - 1) * perPage,
    take: perPage,
  });

  const total = await prisma.wishlist.count({
    where: { userId: interaction.user.id },
  });

  const totalPages = Math.ceil(total / perPage) || 1;

  if (newPage > totalPages) {
    await interaction.reply({
      content: '❌ Você já está na última página!',
      ephemeral: true,
    });
    return;
  }

  const list = wishlist.map((w, i) => {
    const rarity = RARITY_CONFIG[w.character.rarity as keyof typeof RARITY_CONFIG];
    return `${(newPage - 1) * perPage + i + 1}. ${rarity.emoji} **${w.character.name}** (#${w.character.id})`;
  });

  const embed = new EmbedBuilder()
    .setTitle('💫 Sua Wishlist')
    .setDescription(list.join('\n'))
    .setColor(COLORS.primary)
    .setFooter({
      text: `Página ${newPage}/${totalPages} • Total: ${total} personagens`,
    });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`wishlist:prev:${interaction.user.id}:${newPage}`)
      .setLabel('◀ Anterior')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(newPage <= 1),
    new ButtonBuilder()
      .setCustomId(`wishlist:next:${interaction.user.id}:${newPage}`)
      .setLabel('Próximo ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(newPage >= totalPages)
  );

  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleConfirmClear(interaction: ButtonInteraction) {
  const result = await prisma.wishlist.deleteMany({
    where: { userId: interaction.user.id },
  });

  const embed = new EmbedBuilder()
    .setTitle('🗑️ Wishlist Limpa')
    .setDescription(`${result.count} personagens foram removidos da sua wishlist.`)
    .setColor(COLORS.success);

  await interaction.update({ embeds: [embed], components: [] });
}

async function handleCancelClear(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setTitle('❌ Operação Cancelada')
    .setDescription('Sua wishlist permanece inalterada.')
    .setColor(COLORS.warning);

  await interaction.update({ embeds: [embed], components: [] });
}

export default handler;
