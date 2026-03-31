import { ChatInputCommandInteraction, ButtonInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { ApiService } from '../services/api';
import { Logger } from '../services/logger';

const ROULETTE_COLORS = [
  0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A, 
  0x98D8C8, 0xF7DC6F, 0xBB8FCE, 0x85C1E2
];

function getRandomColor() {
  return ROULETTE_COLORS[Math.floor(Math.random() * ROULETTE_COLORS.length)];
}

async function doSpin(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  api: ApiService,
  logger: Logger,
) {
  try {
    const character = await api.getRandomCharacter();

    if (!character) {
      await interaction.editReply('❌ No character found. Please try again.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎲 ${character.name}`)
      .setURL(`https://anilist.co/character/${character.anilistId}`)
      .setDescription(character.description ?
        (character.description.length > 400 ? character.description.substring(0, 400) + '...' : character.description)
        : '*No description available.*')
      .setColor(getRandomColor())
      .setFooter({
        text: `Nazuna Bot • AniList ID: ${character.anilistId}`,
        iconURL: 'https://anilist.co/favicon.ico'
      })
      .setTimestamp();

    if (character.imageUrl) embed.setImage(character.imageUrl);

    embed.addFields(
      { name: '📚 Work', value: character.work?.title || 'Unknown', inline: true },
      { name: '⭐ Popularity', value: `#${character.popularity?.toLocaleString() || 0}`, inline: true },
      { name: '🎭 Role', value: formatRole(character.role), inline: true }
    );

    if (character.categories) {
      const traits = character.categories.personality?.slice(0, 5) || [];
      if (traits.length > 0) {
        embed.addFields({ name: '💫 Personality', value: traits.map((t: string) => `\`${t}\``).join(', '), inline: false });
      }

      const hair = character.categories.hair_color;
      const eyes = character.categories.eye_color;
      if (hair || eyes) {
        const appearance = [];
        if (hair) appearance.push(`💇 ${formatTrait(hair)} hair`);
        if (eyes) appearance.push(`👁 ${formatTrait(eyes)} eyes`);
        embed.addFields({ name: '🎨 Appearance', value: appearance.join(' | '), inline: true });
      }

      const genres = character.categories.genres?.slice(0, 3) || [];
      if (genres.length > 0) {
        embed.addFields({ name: '🏷️ Genres', value: genres.join(', '), inline: true });
      }
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`keep_${character.anilistId}`)
          .setLabel('❤️ Keep Character!')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('spin_again')
          .setLabel('🎲 Spin Again')
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.editReply({
      content: `✨ **${interaction.user.username}** spun the roulette!`,
      embeds: [embed],
      components: [row]
    });

    await api.logLedger('roulette_spin', interaction.user.id, interaction.guildId || '', character.anilistId);

  } catch (error) {
    logger.error('Roulette failed', error);
    await interaction.editReply('❌ Failed to spin roulette. Please try again.');
  }
}

export const RouletteCommand = {
  async execute(interaction: ChatInputCommandInteraction, api: ApiService, logger: Logger) {
    await interaction.deferReply();
    await doSpin(interaction, api, logger);
  },

  async executeButton(interaction: ButtonInteraction, api: ApiService, logger: Logger) {
    await interaction.deferUpdate();
    await doSpin(interaction, api, logger);
  },
};

function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    'protagonist': '👑 Protagonist',
    'deuteragonist': '⭐ Deuteragonist',
    'antagonist': '😈 Antagonist',
    'supporting': '💼 Supporting',
    'minor': '🔹 Minor',
  };
  return roleMap[role] || role;
}

function formatTrait(trait: string): string {
  return trait.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
