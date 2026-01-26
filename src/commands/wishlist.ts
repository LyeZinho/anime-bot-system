import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { COLORS, RARITY_EMOJIS } from '../config/constants.js';
import prisma from '../lib/prisma.js';
import { Wishlist, Character } from '@prisma/client';

type WishlistWithCharacter = Wishlist & { character: Character };

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wishlist')
    .setDescription('Gerencia sua lista de desejos')
    .addSubcommand(sub =>
      sub
        .setName('view')
        .setDescription('Visualiza sua lista de desejos')
        .addUserOption(option =>
          option
            .setName('usuario')
            .setDescription('Usuário para ver a wishlist')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Adiciona um personagem à lista de desejos')
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('Remove um personagem da lista de desejos')
        .addStringOption(option =>
          option
            .setName('personagem')
            .setDescription('Nome do personagem')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('clear')
        .setDescription('Limpa toda a lista de desejos')
    ),

  cooldown: 5,

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'remove') {
      // Mostra personagens da wishlist do usuário
      const wishlist = await prisma.wishlist.findMany({
        where: { userId: interaction.user.id },
        include: { character: true },
        take: 25,
      });

      const filtered = wishlist.filter((w: WishlistWithCharacter) =>
        w.character.name.toLowerCase().includes(focusedValue.toLowerCase())
      );

      await interaction.respond(
        filtered.map((w: WishlistWithCharacter) => ({
          name: `${w.character.name} (${w.character.workName || 'Unknown'})`.substring(0, 100),
          value: w.characterId.toString(),
        }))
      );
    } else {
      // Busca personagens
      if (focusedValue.length < 2) {
        await interaction.respond([]);
        return;
      }

      const characterService = new CharacterService();
      const characters = await characterService.searchCharacter(focusedValue, 25);

      await interaction.respond(
        characters.slice(0, 25).map(char => ({
          name: `${char.name} (${char.workTitle})`.substring(0, 100),
          value: char.id.toString(),
        }))
      );
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'view':
        await handleView(interaction);
        break;
      case 'add':
        await handleAdd(interaction);
        break;
      case 'remove':
        await handleRemove(interaction);
        break;
      case 'clear':
        await handleClear(interaction);
        break;
    }
  },
};

async function handleView(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('usuario') || interaction.user;

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: targetUser.id },
    include: { character: true },
    orderBy: { createdAt: 'desc' },
  });

  if (wishlist.length === 0) {
    await interaction.reply({
      content: targetUser.id === interaction.user.id
        ? '❌ Sua lista de desejos está vazia!'
        : `❌ A lista de desejos de **${targetUser.displayName}** está vazia!`,
      ephemeral: true,
    });
    return;
  }

  const characterList = wishlist.slice(0, 10).map((w: WishlistWithCharacter, i: number) => {
    const rarity = w.character.rarity.toUpperCase() as keyof typeof RARITY_EMOJIS;
    return `${i + 1}. ${RARITY_EMOJIS[rarity] || '⚪'} **${w.character.name}** (${w.character.workName || 'Unknown'})`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`❤️ Lista de Desejos de ${targetUser.displayName}`)
    .setDescription(characterList.join('\n'))
    .setColor(COLORS.primary)
    .setThumbnail(targetUser.displayAvatarURL())
    .setFooter({ text: `Total: ${wishlist.length} personagens` });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`wishlist:page:${targetUser.id}:0`)
      .setLabel('Primeira')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`wishlist:page:${targetUser.id}:1`)
      .setLabel('Próxima')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(wishlist.length <= 10)
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}

async function handleAdd(interaction: ChatInputCommandInteraction) {
  const charIdOrName = interaction.options.getString('personagem', true);
  const characterService = new CharacterService();

  // Verifica limite
  const currentCount = await prisma.wishlist.count({
    where: { userId: interaction.user.id },
  });

  if (currentCount >= 25) {
    await interaction.reply({
      content: '❌ Sua lista de desejos está cheia! (máximo: 25)',
      ephemeral: true,
    });
    return;
  }

  // Busca personagem
  const results = await characterService.searchCharacter(charIdOrName, 1);
  if (results.length === 0) {
    await interaction.reply({
      content: '❌ Personagem não encontrado!',
      ephemeral: true,
    });
    return;
  }

  const character = await characterService.findOrCreateCharacter(results[0]);

  // Verifica se já está na wishlist
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_characterId: {
        userId: interaction.user.id,
        characterId: character.id,
      },
    },
  });

  if (existing) {
    await interaction.reply({
      content: `❌ **${character.name}** já está na sua lista de desejos!`,
      ephemeral: true,
    });
    return;
  }

  // Adiciona
  await prisma.wishlist.create({
    data: {
      userId: interaction.user.id,
      characterId: character.id,
    },
  });

  const embed = new EmbedBuilder()
    .setTitle('❤️ Adicionado à Lista de Desejos!')
    .setDescription(`**${character.name}** foi adicionado à sua lista de desejos!`)
    .setColor(COLORS.success)
    .setThumbnail(character.imageUrl || '');

  await interaction.reply({ embeds: [embed] });
}

async function handleRemove(interaction: ChatInputCommandInteraction) {
  const characterIdStr = interaction.options.getString('personagem', true);
  const characterId = parseInt(characterIdStr, 10);

  if (isNaN(characterId)) {
    await interaction.reply({
      content: '❌ ID de personagem inválido!',
      ephemeral: true,
    });
    return;
  }

  const deleted = await prisma.wishlist.deleteMany({
    where: {
      userId: interaction.user.id,
      characterId: characterId,
    },
  });

  if (deleted.count === 0) {
    await interaction.reply({
      content: '❌ Personagem não encontrado na sua lista de desejos!',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: '✅ Personagem removido da sua lista de desejos!',
  });
}

async function handleClear(interaction: ChatInputCommandInteraction) {
  const deleted = await prisma.wishlist.deleteMany({
    where: { userId: interaction.user.id },
  });

  if (deleted.count === 0) {
    await interaction.reply({
      content: '❌ Sua lista de desejos já está vazia!',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: `✅ Lista de desejos limpa! (${deleted.count} personagens removidos)`,
  });
}

export default command;
