import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';
import { Command } from '../types/discord.js';
import { COLORS } from '../config/constants.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lista de comandos disponíveis'),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Comandos do Bot')
      .setDescription('Lista completa de comandos disponíveis:')
      .setColor(COLORS.primary)
      .addFields(
        {
          name: '🎲 Roll & Captura',
          value: [
            '`/roll` - Role um personagem aleatório',
            '`/collection` - Veja sua coleção',
          ].join('\n'),
        },
        {
          name: '👤 Perfil & Economia',
          value: [
            '`/profile` - Veja seu perfil',
            '`/daily` - Recompensa diária',
            '`/gift` - Envie moedas para outro usuário',
            '`/bank` - Depósito e saque de moedas',
          ].join('\n'),
        },
        {
          name: '⚔️ Batalhas',
          value: [
            '`/battle challenge` - Desafie outro jogador',
            '`/battle stats` - Suas estatísticas de batalha',
            '`/battle ranking` - Ranking de batalhas',
          ].join('\n'),
        },
        {
          name: '🏆 Rankings',
          value: [
            '`/leaderboard` - Rankings (moedas, coleção, batalhas)',
          ].join('\n'),
        },
        {
          name: '🔍 Busca',
          value: [
            '`/character` - Busque um personagem por nome',
            '`/work` - Busque personagens por obra',
          ].join('\n'),
        },
        {
          name: '💫 Wishlist',
          value: [
            '`/wishlist view` - Veja sua wishlist',
            '`/wishlist add` - Adicione um personagem',
            '`/wishlist remove` - Remova um personagem',
          ].join('\n'),
        },
        {
          name: '🛒 Loja & Itens',
          value: [
            '`/shop view` - Veja a loja',
            '`/shop buy` - Compre um item',
            '`/shop inventory` - Seu inventário',
          ].join('\n'),
        },
        {
          name: '🎰 Minigames',
          value: [
            '`/lucky` - Jogo da sorte',
          ].join('\n'),
        }
      )
      .setFooter({
        text: 'Use ! como prefixo para comandos de texto',
      });

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
