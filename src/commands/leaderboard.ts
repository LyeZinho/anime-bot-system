import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { COLORS } from '../config/constants.js';
import prisma from '../database/prisma.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Veja os rankings')
    .addStringOption(option =>
      option
        .setName('tipo')
        .setDescription('Tipo de ranking')
        .setRequired(false)
        .addChoices(
          { name: '💰 Moedas', value: 'coins' },
          { name: '📦 Coleção', value: 'collection' },
          { name: '⚔️ Batalhas', value: 'battle' }
        )
    ),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('tipo') || 'coins';

    let title: string;
    let users: Array<{ id: string; username: string; value: number }>;

    switch (type) {
      case 'coins':
        title = '💰 Top 10 - Moedas';
        const coinUsers = await prisma.user.findMany({
          orderBy: { coins: 'desc' },
          take: 10,
          select: { id: true, username: true, coins: true },
        });
        users = coinUsers.map(u => ({
          id: u.id,
          username: u.username,
          value: u.coins,
        }));
        break;

      case 'collection':
        title = '📦 Top 10 - Coleção';
        const collectionUsers = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            _count: { select: { characters: true } },
          },
          orderBy: { characters: { _count: 'desc' } },
          take: 10,
        });
        users = collectionUsers.map(u => ({
          id: u.id,
          username: u.username,
          value: u._count.characters,
        }));
        break;

      case 'battle':
        title = '⚔️ Top 10 - Rating de Batalha';
        const battleUsers = await prisma.user.findMany({
          orderBy: { battleRating: 'desc' },
          take: 10,
          select: { id: true, username: true, battleRating: true },
        });
        users = battleUsers.map(u => ({
          id: u.id,
          username: u.username,
          value: u.battleRating,
        }));
        break;

      default:
        users = [];
        title = 'Ranking';
    }

    const medals = ['🥇', '🥈', '🥉'];
    const list = users.map((u, i) => {
      const medal = medals[i] || `${i + 1}.`;
      return `${medal} **${u.username}** - ${u.value.toLocaleString()}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(list.join('\n') || 'Nenhum usuário encontrado')
      .setColor(COLORS.primary)
      .setFooter({
        text: 'Use /leaderboard [tipo] para ver outros rankings',
      });

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
