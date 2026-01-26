import { Message, EmbedBuilder } from 'discord.js';
import { PrefixCommand } from '../types/discord.js';
import prisma from '../database/prisma.js';
import { COLORS } from '../config/constants.js';

const command: PrefixCommand = {
  name: 'top',
  aliases: ['leaderboard', 'lb', 'ranking'],
  description: 'Rankings do servidor',

  async execute(message: Message, args: string[]) {
    const type = args[0]?.toLowerCase() || 'coins';

    let title: string;
    let users: Array<{ id: string; username: string; value: number }>;

    switch (type) {
      case 'coins':
      case 'moedas':
        title = '💰 Top 10 - Moedas';
        const coinUsers = await prisma.user.findMany({
          orderBy: { coins: 'desc' },
          take: 10,
          select: { id: true, username: true, coins: true },
        });
        users = coinUsers.map(u => ({ id: u.id, username: u.username, value: u.coins }));
        break;

      case 'collection':
      case 'colecao':
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
      case 'batalha':
      case 'rating':
        title = '⚔️ Top 10 - Rating de Batalha';
        const battleUsers = await prisma.user.findMany({
          orderBy: { battleRating: 'desc' },
          take: 10,
          select: { id: true, username: true, battleRating: true },
        });
        users = battleUsers.map(u => ({ id: u.id, username: u.username, value: u.battleRating }));
        break;

      case 'streak':
        title = '🔥 Top 10 - Streak';
        const streakUsers = await prisma.user.findMany({
          orderBy: { dailyStreak: 'desc' },
          take: 10,
          select: { id: true, username: true, dailyStreak: true },
        });
        users = streakUsers.map(u => ({ id: u.id, username: u.username, value: u.dailyStreak }));
        break;

      default:
        const helpEmbed = new EmbedBuilder()
          .setTitle('📊 Rankings Disponíveis')
          .setDescription([
            '`!top coins` - Ranking por moedas',
            '`!top collection` - Ranking por coleção',
            '`!top battle` - Ranking por rating de batalha',
            '`!top streak` - Ranking por streak',
          ].join('\n'))
          .setColor(COLORS.primary);

        await message.reply({ embeds: [helpEmbed] });
        return;
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
      .setFooter({ text: 'Use !top [tipo] para ver outros rankings' });

    await message.reply({ embeds: [embed] });
  },
};

export default command;
