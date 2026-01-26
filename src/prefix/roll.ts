import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PrefixCommand } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { UserService } from '../services/UserService.js';
import { COLORS, RARITY_CONFIG } from '../config/constants.js';

const command: PrefixCommand = {
  name: 'roll',
  aliases: ['r'],
  description: 'Role um personagem aleatório',
  cooldown: 3,

  async execute(message: Message, _args: string[]) {
    try {
      const userService = new UserService();
      const characterService = new CharacterService();

      // Get or create user
      const user = await userService.findOrCreate(
        message.author.id,
        message.author.username
      );

      // Check rolls
      const rollStatus = await userService.checkRolls(user.id);

      if (!rollStatus.available) {
        const resetTimestamp = Math.floor(Date.now() / 1000) + rollStatus.cooldown;

        const embed = new EmbedBuilder()
          .setTitle('❌ Sem Rolls')
          .setDescription(
            `Você não tem rolls disponíveis!\n\n` +
            `⏰ Próximo roll <t:${resetTimestamp}:R>`
          )
          .setColor(COLORS.error);

        await message.reply({ embeds: [embed] });
        return;
      }

      // Roll character
      const results = await characterService.rollCharacters(1);
      if (results.length === 0) {
        await message.reply('❌ Erro ao rolar personagem. Tente novamente!');
        return;
      }

      const apiChar = results[0];
      // Salvar no banco de dados local
      const dbChar = await characterService.findOrCreateCharacter(apiChar);

      // Consume roll
      await userService.consumeRoll(user.id);

      const rarityKey = apiChar.rarity.toLowerCase();
      const rarityInfo = RARITY_CONFIG[rarityKey] || RARITY_CONFIG.common;

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`${rarityInfo.emoji} ${apiChar.name}`)
        .setDescription(
          `**${apiChar.workName || apiChar.workTitle}**\n` +
          `${apiChar.workType === 'anime' ? '🎬' : apiChar.workType === 'manga' ? '📖' : '🎮'} ${apiChar.workType}\n\n` +
          `**Raridade:** ${rarityInfo.name}\n` +
          `**Role:** ${apiChar.role || 'Desconhecido'}`
        )
        .setColor(rarityInfo.color)
        .setFooter({
          text: `Rolls restantes: ${rollStatus.remaining - 1}`,
        });

      if (apiChar.imageUrl || apiChar.image) {
        embed.setImage(apiChar.imageUrl || apiChar.image || '');
      }

      // Check claims
      const claimStatus = await userService.checkClaims(user.id);

      // Create claim button (usar o ID do banco de dados)
      const claimButton = new ButtonBuilder()
        .setCustomId(`claim:${dbChar.id}:${message.author.id}:null`)
        .setLabel(claimStatus.available ? '❤️ Capturar' : '❌ Sem Claims')
        .setStyle(claimStatus.available ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!claimStatus.available);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimButton);

      await message.reply({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.error('❌ Erro no comando roll:', error);
      await message.reply('❌ Ocorreu um erro ao rolar o personagem.');
    }
  },
};

export default command;
