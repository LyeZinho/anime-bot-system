import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { ButtonHandler } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { UserService } from '../services/UserService.js';
import { RARITY_CONFIG, COLORS } from '../config/constants.js';

const handler: ButtonHandler = {
  customId: 'claim',

  async execute(interaction: ButtonInteraction) {
    // Format: claim:characterId:userId:versionId (versionId pode ser 'null')
    const [, characterId, originalUserId, versionId] = interaction.customId.split(':');

    // Verificar se é o usuário que rolou
    if (interaction.user.id !== originalUserId) {
      await interaction.reply({
        content: '❌ Apenas quem rolou pode claimar este personagem!',
        ephemeral: true,
      });
      return;
    }

    const userService = new UserService();
    const characterService = new CharacterService();

    // Verificar claims disponíveis
    const canClaim = await userService.checkClaims(interaction.user.id);
    if (!canClaim.available) {
      await interaction.reply({
        content: `❌ Você atingiu o limite de claims diários! Volte amanhã.`,
        ephemeral: true,
      });
      return;
    }

    // Validar characterId vindo do customId
    if (!characterId) {
      console.warn('[claim] customId inválido:', interaction.customId);
      await interaction.reply({ content: '❌ ID do personagem inválido.', ephemeral: true });
      return;
    }

    let dbCharacter: any = null;

    // Tentar interpretar como número; se falhar, tratar como `apiId` (string)
    const parsedCharId = Number(characterId);
    if (Number.isFinite(parsedCharId) && !Number.isNaN(parsedCharId)) {
      dbCharacter = await characterService.getCharacterById(parsedCharId);
    } else {
      console.warn('[claim] characterId não é numérico, buscando por apiId:', characterId);
      dbCharacter = await characterService.getCharacterByApiId(characterId);
    }

    const character = dbCharacter;
    if (!character) {
      await interaction.reply({
        content: '❌ Personagem não encontrado!',
        ephemeral: true,
      });
      return;
    }

    // Tentar claimar
    try {
      const charIdForClaim = character.id;
      const result = await characterService.claimCharacter(
        interaction.user.id,
        interaction.user.username,
        charIdForClaim,
        versionId !== 'null' ? parseInt(versionId) : undefined
      );

      if (!result.success) {
        await interaction.reply({
          content: `❌ ${result.error}`,
          ephemeral: true,
        });
        return;
      }

      // Consumir claim
      await userService.consumeClaim(interaction.user.id);

      const rarity = RARITY_CONFIG[character.rarity as keyof typeof RARITY_CONFIG];
      const versionName = result.version?.name ? ` (${result.version.name})` : '';

      const embed = new EmbedBuilder()
        .setTitle(`${rarity.emoji} Personagem Claimado!`)
        .setDescription(`**${character.name}**${versionName} foi adicionado à sua coleção!`)
        .setColor(rarity.color)
        .setThumbnail(character.imageUrl || null)
        .setFooter({
          text: `Claims restantes: ${canClaim.remaining - 1}`,
        });

      // Desabilitar o botão
      await interaction.update({
        components: [],
      });

      await interaction.followUp({
        embeds: [embed],
      });
    } catch (error) {
      console.error('Erro ao claimar:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao claimar o personagem.',
        ephemeral: true,
      });
    }
  },
};

export default handler;
