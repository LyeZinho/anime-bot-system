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
import { UserService } from '../services/UserService.js';
import { RARITY_CONFIG, COLORS } from '../config/constants.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Role um personagem aleatório'),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction) {
    const userService = new UserService();
    const characterService = new CharacterService();

    // Verificar rolls disponíveis
    const canRoll = await userService.checkRolls(interaction.user.id);
    if (!canRoll.available) {
      await interaction.reply({
        content: `❌ Você atingiu o limite de rolls por hora! Aguarde ${Math.ceil(canRoll.cooldown / 60)} minutos.`,
        ephemeral: true,
      });
      return;
    }

    // Consumir roll
    await userService.consumeRoll(interaction.user.id);

    // Fazer roll
    const characters = await characterService.rollCharacters(1);

    if (!characters || characters.length === 0) {
      await interaction.reply({
        content: '❌ Erro ao obter personagem. Tente novamente!',
        ephemeral: true,
      });
      return;
    }

    const apiChar = characters[0];
    // Salvar no banco de dados local para garantir que existe
    const dbChar = await characterService.findOrCreateCharacter(apiChar);
    const rarity = RARITY_CONFIG[apiChar.rarity] || RARITY_CONFIG.common;

    const embed = new EmbedBuilder()
      .setTitle(`${rarity.emoji} ${apiChar.name}`)
      .setDescription(`**Obra:** ${apiChar.workName || 'Desconhecida'}`)
      .setColor(rarity.color)
      .addFields(
        { name: 'Raridade', value: rarity.name, inline: true },
        { name: 'ID', value: `#${apiChar.id}`, inline: true }
      )
      .setFooter({
        text: `Rolls restantes: ${canRoll.remaining - 1}/${canRoll.maxRolls}`,
      });

    if (apiChar.imageUrl || apiChar.image) {
      embed.setImage(apiChar.imageUrl || apiChar.image || null);
    }

    // Botões (usar o ID do banco de dados)
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`claim:${dbChar.id}:${interaction.user.id}:null`)
        .setLabel('✨ Claimar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`reroll:${interaction.user.id}`)
        .setLabel('🔄 Reroll')
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
