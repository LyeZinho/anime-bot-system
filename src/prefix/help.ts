import { Message, EmbedBuilder } from 'discord.js';
import { PrefixCommand } from '../types/discord.js';
import { COLORS } from '../config/constants.js';

const command: PrefixCommand = {
  name: 'help',
  aliases: ['h', 'commands'],
  description: 'Lista de comandos disponíveis',

  async execute(message: Message) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Comandos do Bot')
      .setDescription('Lista completa de comandos disponíveis:')
      .setColor(COLORS.primary)
      .addFields(
        {
          name: '🎲 Roll & Captura',
          value: [
            '`!roll` ou `!r` - Role um personagem',
            '`/roll` - Versão slash',
          ].join('\n'),
        },
        {
          name: '📦 Coleção',
          value: [
            '`!collection` ou `!col` - Sua coleção',
            '`!wishlist` ou `!wl` - Sua wishlist',
          ].join('\n'),
        },
        {
          name: '👤 Perfil',
          value: [
            '`!profile` ou `!p` - Seu perfil',
            '`!daily` ou `!d` - Recompensa diária',
          ].join('\n'),
        },
        {
          name: '🏆 Rankings',
          value: [
            '`!top` - Rankings',
          ].join('\n'),
        },
        {
          name: '💡 Dica',
          value: 'Use `/` para ver todos os comandos slash disponíveis!',
        }
      )
      .setFooter({
        text: 'Use ! ou / para usar os comandos',
      });

    await message.reply({ embeds: [embed] });
  },
};

export default command;
