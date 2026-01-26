import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { BattleService } from '../services/BattleService.js';
import { COLORS } from '../config/constants.js';
import prisma from '../lib/prisma.js';
import { UserCharacter, Character } from '@prisma/client';

type UserCharacterWithChar = UserCharacter & { character: Character };

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('battle')
    .setDescription('Sistema de batalhas TCG')
    .addSubcommand(sub =>
      sub
        .setName('challenge')
        .setDescription('Desafia outro jogador para uma batalha')
        .addUserOption(option =>
          option
            .setName('oponente')
            .setDescription('Jogador que você quer desafiar')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('stats')
        .setDescription('Visualiza estatísticas de batalha')
        .addUserOption(option =>
          option
            .setName('usuario')
            .setDescription('Usuário para ver estatísticas')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('ranking')
        .setDescription('Mostra o ranking de batalhas')
    )
    .addSubcommand(sub =>
      sub
        .setName('deck')
        .setDescription('Mostra seu deck de batalha')
    ),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'challenge':
        await handleChallenge(interaction);
        break;
      case 'stats':
        await handleStats(interaction);
        break;
      case 'ranking':
        await handleRanking(interaction);
        break;
      case 'deck':
        await handleDeck(interaction);
        break;
    }
  },
};

async function handleChallenge(interaction: ChatInputCommandInteraction) {
  const opponent = interaction.options.getUser('oponente', true);
  const battleService = new BattleService();

  if (opponent.id === interaction.user.id) {
    await interaction.reply({
      content: '❌ Você não pode desafiar a si mesmo!',
      ephemeral: true,
    });
    return;
  }

  if (opponent.bot) {
    await interaction.reply({
      content: '❌ Você não pode desafiar bots!',
      ephemeral: true,
    });
    return;
  }

  // Verifica se ambos têm personagens suficientes
  const challengerCards = await prisma.userCharacter.count({
    where: { userId: interaction.user.id },
  });

  const opponentCards = await prisma.userCharacter.count({
    where: { userId: opponent.id },
  });

  if (challengerCards < 5) {
    await interaction.reply({
      content: '❌ Você precisa de pelo menos 5 personagens para batalhar!',
      ephemeral: true,
    });
    return;
  }

  if (opponentCards < 5) {
    await interaction.reply({
      content: `❌ **${opponent.displayName}** precisa de pelo menos 5 personagens para batalhar!`,
      ephemeral: true,
    });
    return;
  }

  // Cria a batalha
  const battle = await battleService.createBattle(
    interaction.user.id,
    opponent.id,
    interaction.user.username,
    opponent.username
  );

  const embed = new EmbedBuilder()
    .setTitle('⚔️ Desafio de Batalha!')
    .setDescription([
      `**${interaction.user.displayName}** desafiou **${opponent.displayName}** para uma batalha!`,
      '',
      `${opponent.displayName}, você aceita o desafio?`,
    ].join('\n'))
    .setColor(COLORS.primary)
    .setFooter({ text: 'O desafio expira em 2 minutos' });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`battle:accept:${battle.id}`)
      .setLabel('Aceitar')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`battle:decline:${battle.id}`)
      .setLabel('Recusar')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({
    content: `${opponent}`,
    embeds: [embed],
    components: [row],
  });
}

async function handleStats(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuario') || interaction.user;

  const user = await prisma.user.findUnique({
    where: { id: targetUser.id },
  });

  if (!user) {
    await interaction.reply({
      content: '❌ Usuário não encontrado!',
      ephemeral: true,
    });
    return;
  }

  const wins = await prisma.battle.count({
    where: { winnerId: targetUser.id },
  });

  const battles = await prisma.battle.count({
    where: {
      OR: [
        { challengerId: targetUser.id },
        { opponentId: targetUser.id },
      ],
      status: 'FINISHED',
    },
  });

  const losses = battles - wins;
  const winRate = battles > 0 ? ((wins / battles) * 100).toFixed(1) : '0.0';

  const embed = new EmbedBuilder()
    .setTitle(`⚔️ Estatísticas de ${targetUser.displayName}`)
    .setDescription([
      `🏆 **Rating:** ${user.battleRating}`,
      '',
      `📊 **Batalhas:** ${battles}`,
      `✅ **Vitórias:** ${wins}`,
      `❌ **Derrotas:** ${losses}`,
      `📈 **Taxa de Vitória:** ${winRate}%`,
    ].join('\n'))
    .setColor(COLORS.primary)
    .setThumbnail(targetUser.displayAvatarURL());

  await interaction.reply({ embeds: [embed] });
}

async function handleRanking(interaction: ChatInputCommandInteraction) {
  const battleService = new BattleService();
  const ranking = await battleService.getBattleRanking(10);

  if (ranking.length === 0) {
    await interaction.reply({
      content: '❌ Ainda não há jogadores no ranking!',
      ephemeral: true,
    });
    return;
  }

  const rankingList = await Promise.all(
    ranking.map(async (user, i) => {
      const medals = ['🥇', '🥈', '🥉'];
      const medal = medals[i] || `**${i + 1}.**`;
      
      try {
        const discordUser = await interaction.client.users.fetch(user.id);
        return `${medal} ${discordUser.displayName} - **${user.battleRating}** rating`;
      } catch {
        return `${medal} Usuário - **${user.battleRating}** rating`;
      }
    })
  );

  const embed = new EmbedBuilder()
    .setTitle('🏆 Ranking de Batalhas')
    .setDescription(rankingList.join('\n'))
    .setColor(COLORS.primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('battle:ranking:0')
      .setLabel('Primeira')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId('battle:ranking:1')
      .setLabel('Próxima')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(ranking.length < 10)
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

async function handleDeck(interaction: ChatInputCommandInteraction) {
  const characters = await prisma.userCharacter.findMany({
    where: { userId: interaction.user.id },
    include: { character: true },
    orderBy: { character: { rarity: 'desc' } },
    take: 5,
  });

  if (characters.length < 5) {
    await interaction.reply({
      content: `❌ Você precisa de pelo menos 5 personagens para ter um deck! (Você tem: ${characters.length})`,
      ephemeral: true,
    });
    return;
  }

  const deckList = characters.map((uc: UserCharacterWithChar, i: number) => {
    const char = uc.character;
    const rarityBonus = char.rarity === 'legendary' ? 30 : char.rarity === 'epic' ? 20 : char.rarity === 'rare' ? 10 : 0;
    const stats = {
      attack: Math.floor(Math.random() * 50) + 50 + rarityBonus,
      defense: Math.floor(Math.random() * 50) + 50 + rarityBonus,
      hp: Math.floor(Math.random() * 100) + 100 + rarityBonus * 2,
    };
    return `${i + 1}. **${char.name}** (${char.rarity})\n   ⚔️ ATK: ${stats.attack} | 🛡️ DEF: ${stats.defense} | ❤️ HP: ${stats.hp}`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`🎴 Deck de ${interaction.user.displayName}`)
    .setDescription([
      'Seu deck é formado pelos seus 5 personagens mais fortes:',
      '',
      ...deckList,
    ].join('\n'))
    .setColor(COLORS.primary)
    .setFooter({ text: 'Stats baseados na raridade do personagem' });

  await interaction.reply({ embeds: [embed] });
}

export default command;
