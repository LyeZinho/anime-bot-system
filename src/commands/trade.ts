import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { COLORS, RARITY_EMOJIS } from '../config/constants.js';
import prisma from '../lib/prisma.js';
import { UserCharacter, Character } from '@prisma/client';

type UserCharacterWithChar = UserCharacter & { character: Character };

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Sistema de trocas de personagens')
    .addSubcommand(sub =>
      sub
        .setName('offer')
        .setDescription('Oferece uma troca para outro jogador')
        .addUserOption(option =>
          option
            .setName('usuario')
            .setDescription('Usuário para trocar')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('pending')
        .setDescription('Lista trocas pendentes')
    )
    .addSubcommand(sub =>
      sub
        .setName('history')
        .setDescription('Histórico de trocas')
    ),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'offer':
        await handleOffer(interaction);
        break;
      case 'pending':
        await handlePending(interaction);
        break;
      case 'history':
        await handleHistory(interaction);
        break;
    }
  },
};

async function handleOffer(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuario', true);

  if (targetUser.id === interaction.user.id) {
    await interaction.reply({
      content: '❌ Você não pode trocar consigo mesmo!',
      ephemeral: true,
    });
    return;
  }

  if (targetUser.bot) {
    await interaction.reply({
      content: '❌ Você não pode trocar com bots!',
      ephemeral: true,
    });
    return;
  }

  // Busca personagens do usuário para mostrar
  const characters = await prisma.userCharacter.findMany({
    where: { userId: interaction.user.id },
    include: { character: true },
    take: 10,
  });

  if (characters.length === 0) {
    await interaction.reply({
      content: '❌ Você não tem personagens para trocar!',
      ephemeral: true,
    });
    return;
  }

  // Cria troca pendente
  const trade = await prisma.trade.create({
    data: {
      senderId: interaction.user.id,
      receiverId: targetUser.id,
      status: 'PENDING',
    },
  });

  const characterList = characters.map((uc: UserCharacterWithChar, i: number) => {
    const rarity = uc.character.rarity.toUpperCase() as keyof typeof RARITY_EMOJIS;
    return `${i + 1}. ${RARITY_EMOJIS[rarity] || '⚪'} **${uc.character.name}** (${uc.character.workName || 'Unknown'})`;
  });

  const embed = new EmbedBuilder()
    .setTitle('🔄 Nova Proposta de Troca')
    .setDescription([
      `**${interaction.user.displayName}** quer trocar com **${targetUser.displayName}**!`,
      '',
      '📦 Selecione personagens para a troca:',
      '',
      ...characterList,
      '',
      'Use os botões para adicionar/remover personagens da troca.',
    ].join('\n'))
    .setColor(COLORS.primary)
    .setFooter({ text: `Trade ID: ${trade.id}` });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`trade:select:${trade.id}`)
      .setLabel('Selecionar Personagens')
      .setEmoji('📦')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`trade:confirm:${trade.id}`)
      .setLabel('Enviar Proposta')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`trade:cancel:${trade.id}`)
      .setLabel('Cancelar')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

async function handlePending(interaction: ChatInputCommandInteraction) {
  const trades = await prisma.trade.findMany({
    where: {
      OR: [
        { senderId: interaction.user.id },
        { receiverId: interaction.user.id },
      ],
      status: 'PENDING',
    },
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (trades.length === 0) {
    await interaction.reply({
      content: '❌ Você não tem trocas pendentes!',
      ephemeral: true,
    });
    return;
  }

  const tradeList = await Promise.all(
    trades.map(async (trade, i) => {
      const isSender = trade.senderId === interaction.user.id;
      const otherUserId = isSender ? trade.receiverId : trade.senderId;
      
      try {
        const otherUser = await interaction.client.users.fetch(otherUserId);
        const direction = isSender ? '➡️' : '⬅️';
        const itemCount = trade.items.length;
        return `${i + 1}. ${direction} **${otherUser.displayName}** - ${itemCount} item(s)`;
      } catch {
        return `${i + 1}. ❓ Usuário desconhecido - ${trade.items.length} item(s)`;
      }
    })
  );

  const embed = new EmbedBuilder()
    .setTitle('🔄 Trocas Pendentes')
    .setDescription([
      '➡️ = Você enviou | ⬅️ = Você recebeu',
      '',
      ...tradeList,
    ].join('\n'))
    .setColor(COLORS.primary);

  await interaction.reply({ embeds: [embed] });
}

async function handleHistory(interaction: ChatInputCommandInteraction) {
  const trades = await prisma.trade.findMany({
    where: {
      OR: [
        { senderId: interaction.user.id },
        { receiverId: interaction.user.id },
      ],
      status: { in: ['COMPLETED', 'CANCELLED'] },
    },
    include: {
      items: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  if (trades.length === 0) {
    await interaction.reply({
      content: '❌ Você não tem histórico de trocas!',
      ephemeral: true,
    });
    return;
  }

  const statusEmoji: Record<string, string> = {
    COMPLETED: '✅',
    CANCELLED: '🚫',
  };

  const tradeList = await Promise.all(
    trades.map(async (trade, i) => {
      const isSender = trade.senderId === interaction.user.id;
      const otherUserId = isSender ? trade.receiverId : trade.senderId;
      const emoji = statusEmoji[trade.status] || '❓';
      
      try {
        const otherUser = await interaction.client.users.fetch(otherUserId);
        return `${i + 1}. ${emoji} **${otherUser.displayName}** - ${trade.items.length} item(s)`;
      } catch {
        return `${i + 1}. ${emoji} Usuário desconhecido - ${trade.items.length} item(s)`;
      }
    })
  );

  const embed = new EmbedBuilder()
    .setTitle('📜 Histórico de Trocas')
    .setDescription([
      '✅ = Completa | 🚫 = Cancelada',
      '',
      ...tradeList,
    ].join('\n'))
    .setColor(COLORS.primary);

  await interaction.reply({ embeds: [embed] });
}

export default command;
