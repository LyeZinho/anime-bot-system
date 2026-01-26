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
import prisma from '../lib/prisma.js';
import { Prisma, Item } from '@prisma/client';

// Items da loja
const SHOP_ITEMS = [
  {
    id: 'roll_reset',
    name: 'Reset de Rolls',
    description: 'Reseta seus rolls instantaneamente',
    price: 500,
    emoji: '🎲',
  },
  {
    id: 'claim_reset',
    name: 'Reset de Claims',
    description: 'Reseta seus claims instantaneamente',
    price: 1000,
    emoji: '📥',
  },
  {
    id: 'wishlist_slot',
    name: 'Slot de Wishlist',
    description: 'Adiciona +5 slots à sua wishlist',
    price: 2000,
    emoji: '❤️',
  },
  {
    id: 'lucky_ticket',
    name: 'Ticket da Sorte',
    description: 'Ticket para jogar no Lucky sem custo',
    price: 100,
    emoji: '🎟️',
  },
  {
    id: 'xp_boost',
    name: 'XP Boost',
    description: 'Dobra seu XP por 1 hora',
    price: 1500,
    emoji: '⚡',
  },
];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Loja do bot')
    .addSubcommand(sub =>
      sub
        .setName('view')
        .setDescription('Visualiza a loja')
    )
    .addSubcommand(sub =>
      sub
        .setName('buy')
        .setDescription('Compra um item')
        .addStringOption(option =>
          option
            .setName('item')
            .setDescription('Item para comprar')
            .setRequired(true)
            .addChoices(
              ...SHOP_ITEMS.map(item => ({
                name: `${item.emoji} ${item.name} - ${item.price} moedas`,
                value: item.id,
              }))
            )
        )
        .addIntegerOption(option =>
          option
            .setName('quantidade')
            .setDescription('Quantidade para comprar')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('inventory')
        .setDescription('Visualiza seu inventário')
    ),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'view':
        await handleView(interaction);
        break;
      case 'buy':
        await handleBuy(interaction);
        break;
      case 'inventory':
        await handleInventory(interaction);
        break;
    }
  },
};

async function handleView(interaction: ChatInputCommandInteraction) {
  const user = await prisma.user.findUnique({
    where: { id: interaction.user.id },
  });

  const itemList = SHOP_ITEMS.map(item =>
    `${item.emoji} **${item.name}** - ${item.price.toLocaleString()} moedas\n└ ${item.description}`
  );

  const embed = new EmbedBuilder()
    .setTitle('🏪 Loja')
    .setDescription([
      `💰 **Seu saldo:** ${user?.coins?.toLocaleString() || 0} moedas`,
      '',
      ...itemList,
      '',
      'Use `/shop buy item:<item>` para comprar!',
    ].join('\n'))
    .setColor(COLORS.primary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    SHOP_ITEMS.slice(0, 5).map(item =>
      new ButtonBuilder()
        .setCustomId(`shop:buy:${item.id}`)
        .setEmoji(item.emoji)
        .setLabel(`${item.price}`)
        .setStyle(ButtonStyle.Secondary)
    )
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

async function handleBuy(interaction: ChatInputCommandInteraction) {
  const itemId = interaction.options.getString('item', true);
  const quantity = interaction.options.getInteger('quantidade') || 1;

  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) {
    await interaction.reply({
      content: '❌ Item não encontrado!',
      ephemeral: true,
    });
    return;
  }

  const totalPrice = item.price * quantity;

  // Busca usuário
  const user = await prisma.user.findUnique({
    where: { id: interaction.user.id },
  });

  if (!user || user.coins < totalPrice) {
    await interaction.reply({
      content: `❌ Você não tem moedas suficientes! (Necessário: ${totalPrice.toLocaleString()})`,
      ephemeral: true,
    });
    return;
  }

  // Processa a compra
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Desconta moedas
    await tx.user.update({
      where: { id: interaction.user.id },
      data: { coins: { decrement: totalPrice } },
    });

    // Adiciona item ao inventário
    const existingItem = await tx.item.findFirst({
      where: {
        userId: interaction.user.id,
        type: itemId,
      },
    });

    if (existingItem) {
      await tx.item.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await tx.item.create({
        data: {
          userId: interaction.user.id,
          type: itemId,
          name: item.name,
          quantity: quantity,
        },
      });
    }
  });

  const embed = new EmbedBuilder()
    .setTitle('🛒 Compra Realizada!')
    .setDescription([
      `Você comprou **${quantity}x ${item.name}**!`,
      '',
      `💸 **Total:** ${totalPrice.toLocaleString()} moedas`,
      `💰 **Novo saldo:** ${(user.coins - totalPrice).toLocaleString()} moedas`,
    ].join('\n'))
    .setColor(COLORS.success);

  await interaction.reply({ embeds: [embed] });
}

async function handleInventory(interaction: ChatInputCommandInteraction) {
  const items = await prisma.item.findMany({
    where: { userId: interaction.user.id },
  });

  if (items.length === 0) {
    await interaction.reply({
      content: '❌ Seu inventário está vazio!',
      ephemeral: true,
    });
    return;
  }

  const itemList = items.map((item: Item) => {
    const shopItem = SHOP_ITEMS.find(i => i.id === item.type);
    const emoji = shopItem?.emoji || '📦';
    return `${emoji} **${item.name}** x${item.quantity}`;
  });

  const embed = new EmbedBuilder()
    .setTitle('🎒 Seu Inventário')
    .setDescription(itemList.join('\n'))
    .setColor(COLORS.primary);

  await interaction.reply({ embeds: [embed] });
}

export default command;
