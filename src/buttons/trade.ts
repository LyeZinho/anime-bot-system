import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { ButtonHandler } from '../types/discord.js';
import { COLORS, RARITY_CONFIG } from '../config/constants.js';
import prisma from '../database/prisma.js';

const handler: ButtonHandler = {
  customId: 'trade',

  async execute(interaction: ButtonInteraction) {
    const [, action, tradeIdStr, receiverId] = interaction.customId.split(':');
    const tradeId = parseInt(tradeIdStr);

    // Verificar se é o destinatário da troca
    if (interaction.user.id !== receiverId) {
      await interaction.reply({
        content: '❌ Apenas o destinatário pode responder a esta troca!',
        ephemeral: true,
      });
      return;
    }

    switch (action) {
      case 'accept':
        await handleAccept(interaction, tradeId);
        break;
      case 'decline':
        await handleDecline(interaction, tradeId);
        break;
    }
  },
};

async function handleAccept(interaction: ButtonInteraction, tradeId: number) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      sender: { select: { username: true } },
      receiver: { select: { username: true } },
      items: {
        include: {
          userCharacter: {
            include: { character: true },
          },
        },
      },
    },
  });

  if (!trade) {
    await interaction.reply({
      content: '❌ Troca não encontrada!',
      ephemeral: true,
    });
    return;
  }

  if (trade.status !== 'PENDING') {
    await interaction.reply({
      content: '❌ Esta troca já foi finalizada!',
      ephemeral: true,
    });
    return;
  }

  // Verificar se todos os personagens ainda estão nas coleções corretas
  const senderItems = trade.items.filter(i => i.isFromSender);
  const receiverItems = trade.items.filter(i => !i.isFromSender);

  for (const item of senderItems) {
    const char = await prisma.userCharacter.findFirst({
      where: { id: item.userCharacterId, userId: trade.senderId },
    });
    if (!char) {
      await interaction.reply({
        content: '❌ Alguns personagens não estão mais disponíveis para troca!',
        ephemeral: true,
      });
      return;
    }
  }

  for (const item of receiverItems) {
    const char = await prisma.userCharacter.findFirst({
      where: { id: item.userCharacterId, userId: trade.receiverId },
    });
    if (!char) {
      await interaction.reply({
        content: '❌ Alguns personagens não estão mais disponíveis para troca!',
        ephemeral: true,
      });
      return;
    }
  }

  // Executar a troca em uma transação
  await prisma.$transaction(async (tx) => {
    // Transferir personagens do sender para o receiver
    for (const item of senderItems) {
      await tx.userCharacter.update({
        where: { id: item.userCharacterId },
        data: { userId: trade.receiverId },
      });
    }

    // Transferir personagens do receiver para o sender
    for (const item of receiverItems) {
      await tx.userCharacter.update({
        where: { id: item.userCharacterId },
        data: { userId: trade.senderId },
      });
    }

    // Atualizar status da troca
    await tx.trade.update({
      where: { id: tradeId },
      data: { status: 'COMPLETED' },
    });
  });

  // Formatar listas
  const senderGave = senderItems.map(i => {
    const rarity = RARITY_CONFIG[i.userCharacter.character.rarity as keyof typeof RARITY_CONFIG];
    return `${rarity.emoji} ${i.userCharacter.character.name}`;
  }).join(', ');

  const receiverGave = receiverItems.map(i => {
    const rarity = RARITY_CONFIG[i.userCharacter.character.rarity as keyof typeof RARITY_CONFIG];
    return `${rarity.emoji} ${i.userCharacter.character.name}`;
  }).join(', ');

  const embed = new EmbedBuilder()
    .setTitle('✅ Troca Concluída!')
    .setDescription([
      `**${trade.sender?.username}** recebeu: ${receiverGave}`,
      `**${trade.receiver?.username}** recebeu: ${senderGave}`,
    ].join('\n'))
    .setColor(COLORS.success);

  await interaction.update({ embeds: [embed], components: [] });
}

async function handleDecline(interaction: ButtonInteraction, tradeId: number) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      sender: { select: { username: true } },
    },
  });

  if (!trade) {
    await interaction.reply({
      content: '❌ Troca não encontrada!',
      ephemeral: true,
    });
    return;
  }

  if (trade.status !== 'PENDING') {
    await interaction.reply({
      content: '❌ Esta troca já foi finalizada!',
      ephemeral: true,
    });
    return;
  }

  await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'CANCELLED' },
  });

  const embed = new EmbedBuilder()
    .setTitle('❌ Troca Recusada')
    .setDescription(`**${interaction.user.displayName}** recusou a proposta de troca de **${trade.sender?.username}**.`)
    .setColor(COLORS.error);

  await interaction.update({ embeds: [embed], components: [] });
}

export default handler;
