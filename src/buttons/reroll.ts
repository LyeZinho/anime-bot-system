import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonHandler } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { UserService } from '../services/UserService.js';
import { RARITY_CONFIG, COLORS } from '../config/constants.js';

const handler: ButtonHandler = {
  customId: 'reroll',

  async execute(interaction: ButtonInteraction) {
    // Format: reroll:userId
    const [, originalUserId] = interaction.customId.split(':');

    // Verificar se é o usuário que pode fazer reroll
    if (interaction.user.id !== originalUserId) {
      await interaction.reply({
        content: '❌ Apenas quem rolou pode fazer reroll!',
        ephemeral: true,
      });
      return;
    }

    const userService = new UserService();
    const characterService = new CharacterService();

    // Verificar rolls disponíveis
    const canRoll = await userService.checkRolls(interaction.user.id);
    if (!canRoll.available) {
      await interaction.reply({
        content: `❌ Você atingiu o limite de rolls por hora! Aguarde ${canRoll.cooldown} segundos.`,
        ephemeral: true,
      });
      return;
    }

    // Consumir roll
    await userService.consumeRoll(interaction.user.id);

    // Fazer novo roll
    const characters = await characterService.rollCharacters(1);

    if (!characters || characters.length === 0) {
      await interaction.reply({
        content: '❌ Erro ao obter personagem. Tente novamente!',
        ephemeral: true,
      });
      return;
    }

    const apiChar = characters[0];
    // Salvar no banco de dados local
    const dbChar = await characterService.findOrCreateCharacter(apiChar);
    const rarityKey = apiChar.rarity.toLowerCase();
    const rarity = RARITY_CONFIG[rarityKey as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common;

    const embed = new EmbedBuilder()
      .setTitle(`${rarity.emoji} ${apiChar.name}`)
      .setDescription(`**Obra:** ${apiChar.workName || apiChar.workTitle || 'Desconhecido'}`)
      .setColor(rarity.color)
      .addFields(
        { name: 'Raridade', value: rarity.name, inline: true },
        { name: 'ID', value: `#${apiChar.id}`, inline: true }
      )
      .setFooter({
        text: `Rolls restantes: ${canRoll.remaining - 1}/${canRoll.maxRolls}`,
      });

    if (apiChar.imageUrl || apiChar.image) {
      embed.setImage(apiChar.imageUrl || apiChar.image || '');
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

    await interaction.update({
      embeds: [embed],
      components: [row],
    });
  },
};

export default handler;
