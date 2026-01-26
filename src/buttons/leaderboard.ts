import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonHandler } from '../types/discord.js';
import prisma from '../database/prisma.js';
import { COLORS } from '../config/constants.js';

const handler: ButtonHandler = {
  customId: 'leaderboard',

  async execute(interaction: ButtonInteraction) {
    // Format: leaderboard:action:type:currentPage
    const [, action, type, currentPageStr] = interaction.customId.split(':');
    const currentPage = parseInt(currentPageStr);
    const newPage = action === 'next' ? currentPage + 1 : currentPage - 1;

    if (newPage < 1) {
      await interaction.reply({
        content: '❌ Você já está na primeira página!',
        ephemeral: true,
      });
      return;
    }

    const perPage = 10;
    const skip = (newPage - 1) * perPage;

    let title: string;
    let totalCount: number;
    let users: Array<{ id: string; username: string; value: number }>;

    switch (type) {
      case 'coins':
        title = '💰 Ranking - Moedas';
        totalCount = await prisma.user.count();
        const coinUsers = await prisma.user.findMany({
          orderBy: { coins: 'desc' },
          skip,
          take: perPage,
          select: { id: true, username: true, coins: true },
        });
        users = coinUsers.map(u => ({ id: u.id, username: u.username, value: u.coins }));
        break;

      case 'collection':
        title = '📦 Ranking - Coleção';
        totalCount = await prisma.user.count();
        const collectionUsers = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            _count: { select: { characters: true } },
          },
          orderBy: { characters: { _count: 'desc' } },
          skip,
          take: perPage,
        });
        users = collectionUsers.map(u => ({
          id: u.id,
          username: u.username,
          value: u._count.characters,
        }));
        break;

      case 'battle':
        title = '⚔️ Ranking - Rating de Batalha';
        totalCount = await prisma.user.count();
        const battleUsers = await prisma.user.findMany({
          orderBy: { battleRating: 'desc' },
          skip,
          take: perPage,
          select: { id: true, username: true, battleRating: true },
        });
        users = battleUsers.map(u => ({ id: u.id, username: u.username, value: u.battleRating }));
        break;

      default:
        await interaction.reply({
          content: '❌ Tipo de ranking inválido!',
          ephemeral: true,
        });
        return;
    }

    const totalPages = Math.ceil(totalCount / perPage);

    if (newPage > totalPages) {
      await interaction.reply({
        content: '❌ Você já está na última página!',
        ephemeral: true,
      });
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const list = users.map((u, i) => {
      const position = skip + i;
      const prefix = position < 3 ? medals[position] : `${position + 1}.`;
      return `${prefix} **${u.username}** - ${u.value.toLocaleString()}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(list.join('\n') || 'Nenhum usuário encontrado')
      .setColor(COLORS.primary)
      .setFooter({
        text: `Página ${newPage}/${totalPages}`,
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`leaderboard:prev:${type}:${newPage}`)
        .setLabel('◀ Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(newPage <= 1),
      new ButtonBuilder()
        .setCustomId(`leaderboard:next:${type}:${newPage}`)
        .setLabel('Próximo ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(newPage >= totalPages)
    );

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
  },
};

export default handler;
