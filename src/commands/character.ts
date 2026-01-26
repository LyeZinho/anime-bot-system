import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { COLORS, RARITY_COLORS, RARITY_EMOJIS } from '../config/constants.js';
import prisma from '../lib/prisma.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Busca informações sobre um personagem')
    .addStringOption(option =>
      option
        .setName('nome')
        .setDescription('Nome do personagem')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  cooldown: 5,

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    
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
  },

  async execute(interaction: ChatInputCommandInteraction) {
    let charIdOrName = interaction.options.getString('nome') || interaction.options.getString('name');
    charIdOrName = charIdOrName?.trim() || '';
    if (!charIdOrName) {
      await interaction.reply({ content: 'Por favor informe o nome ou ID do personagem.', ephemeral: true });
      return;
    }
    const characterService = new CharacterService();

    await interaction.deferReply();

    // Buscar na API (fuzzy search)
    const results = await characterService.searchCharacter(charIdOrName, 10);

    if (!results || results.length === 0) {
      // Tentar buscar diretamente por apiId
      const apiSingle = await characterService.getApiCharacterById(charIdOrName);
      if (!apiSingle) {
        await interaction.editReply({ content: '❌ Personagem não encontrado!' });
        return;
      }
      const character = await characterService.findOrCreateCharacter(apiSingle);
      // mostrar embed para único resultado
      const stats = await prisma.userCharacter.aggregate({ where: { characterId: character.id }, _count: true });
      const rarity = character.rarity.toUpperCase() as keyof typeof RARITY_COLORS;
      const embed = new EmbedBuilder()
        .setTitle(`${RARITY_EMOJIS[rarity] || '⚪'} ${character.name}`)
        .setDescription([
          `**Obra:** ${character.workName || apiSingle.workTitle}`,
          `**Raridade:** ${character.rarity}`,
          '',
          `📊 **Estatísticas:**`,
          `• Total coletados: ${stats._count}`,
        ].join('\n'))
        .setColor(RARITY_COLORS[rarity] || COLORS.primary)
        .setImage(character.imageUrl || apiSingle.image || '');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`wishlist:add:${character.id}`)
          .setLabel('Adicionar à Wishlist')
          .setEmoji('❤️')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
      return;
    }

    if (results.length === 1) {
      const apiChar = results[0];
      const character = await characterService.findOrCreateCharacter(apiChar);

      const stats = await prisma.userCharacter.aggregate({ where: { characterId: character.id }, _count: true });

      const rarity = character.rarity.toUpperCase() as keyof typeof RARITY_COLORS;
      const embed = new EmbedBuilder()
        .setTitle(`${RARITY_EMOJIS[rarity] || '⚪'} ${character.name}`)
        .setDescription([
          `**Obra:** ${character.workName || apiChar.workTitle}`,
          `**Raridade:** ${character.rarity}`,
          '',
          `📊 **Estatísticas:**`,
          `• Total coletados: ${stats._count}`,
        ].join('\n'))
        .setColor(RARITY_COLORS[rarity] || COLORS.primary)
        .setImage(character.imageUrl || apiChar.image || '');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`wishlist:add:${character.id}`)
          .setLabel('Adicionar à Wishlist')
          .setEmoji('❤️')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
      return;
    }

    // Mais de 1 resultado: mostrar select menu para o usuário escolher
    const options = results.slice(0, 10).map((r, idx) => {
      const label = `${r.name}`.substring(0, 100);
      const descRaw = (r.workTitle || r.workName || '').toString().trim();
      const description = descRaw.length ? descRaw.substring(0, 100) : undefined;
      const apiId = String((r as any).id);
      // Ensure unique option values by appending an index suffix
      const value = `${apiId}::${idx}`;
      const opt: any = { label, value };
      if (description) opt.description = description;
      return opt;
    });

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`character_select:${interaction.user.id}`)
      .setPlaceholder('Selecione o personagem correto')
      .addOptions(options as any);

    const rowSel = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu as any);

    await interaction.editReply({ content: '⚠️ Foram encontrados vários resultados — selecione o personagem correto:', components: [rowSel] });
    return;
  },
};

export default command;
