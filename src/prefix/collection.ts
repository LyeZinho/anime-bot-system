import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { PrefixCommand } from '../types/discord.js';
import { CharacterService } from '../services/CharacterService.js';
import { RARITY_CONFIG, COLORS } from '../config/constants.js';

const command: PrefixCommand = {
  name: 'collection',
  aliases: ['col', 'coll'],
  description: 'Veja sua coleção de personagens',

  async execute(message: Message, args: string[]) {
    const page = parseInt(args[0]) || 1;
    const characterService = new CharacterService();

    const result = await characterService.getUserCollection(message.author.id, page, 10);

    if (result.characters.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('📦 Sua Coleção')
        .setDescription('Sua coleção está vazia! Use `!roll` para obter personagens.')
        .setColor(COLORS.warning);

      await message.reply({ embeds: [embed] });
      return;
    }

    const characterList = result.characters.map((uc, index) => {
      const rarity = RARITY_CONFIG[uc.character.rarity as keyof typeof RARITY_CONFIG];
      const version = uc.version?.name ? ` (${uc.version.name})` : '';
      return `${(page - 1) * 10 + index + 1}. ${rarity.emoji} **${uc.character.name}**${version}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`📦 Coleção de ${message.author.displayName}`)
      .setDescription(characterList.join('\n'))
      .setColor(COLORS.primary)
      .setFooter({
        text: `Página ${page}/${result.totalPages} • Total: ${result.total} personagens`,
      });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`collection:prev:${message.author.id}:${page}`)
        .setLabel('◀ Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 1),
      new ButtonBuilder()
        .setCustomId(`collection:next:${message.author.id}:${page}`)
        .setLabel('Próximo ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= result.totalPages)
    );

    await message.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
