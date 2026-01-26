import { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ButtonHandler } from '../types/discord.js';
import { BattleService } from '../services/BattleService.js';
import { COLORS } from '../config/constants.js';

const handler: ButtonHandler = {
  customId: 'battle',

  async execute(interaction: ButtonInteraction) {
    // Format: battle:action:battleId:challengerId
    const [, action, battleIdStr, challengerId] = interaction.customId.split(':');
    const battleId = parseInt(battleIdStr);

    const battleService = new BattleService();

    switch (action) {
      case 'accept':
        await handleAccept(interaction, battleService, battleId, challengerId);
        break;

      case 'decline':
        await handleDecline(interaction, battleService, battleId, challengerId);
        break;

      default:
        await interaction.reply({
          content: '❌ Ação inválida!',
          ephemeral: true,
        });
    }
  },
};

async function handleAccept(
  interaction: ButtonInteraction,
  battleService: BattleService,
  battleId: number,
  challengerId: string
) {
  // O usuário que clica no accept é o oponente
  const battle = await battleService.acceptBattle(battleId, interaction.user.id);

  if (!battle) {
    await interaction.reply({
      content: '❌ Esta batalha não existe ou já foi resolvida!',
      ephemeral: true,
    });
    return;
  }

  // Desabilitar botões
  await interaction.update({
    components: [],
  });

  // Executar a batalha
  const result = await battleService.executeBattle(battleId);

  if (!result) {
    await interaction.followUp({
      content: '❌ Erro ao executar a batalha!',
    });
    return;
  }

  // Construir embed do resultado
  const embed = new EmbedBuilder()
    .setTitle('⚔️ Resultado da Batalha')
    .setColor(COLORS.primary);

  // Adicionar log da batalha
  const roundsDescription = result.rounds.map((round, i) => {
    const emoji = round.winner === battle.challengerId ? '🔵' : '🔴';
    return `**Round ${i + 1}:** ${emoji} ${round.attackerCard.name} vs ${round.defenderCard.name} - Dano: ${round.damage}`;
  }).join('\n');

  embed.setDescription([
    roundsDescription,
    '',
    `🏆 **Vencedor:** <@${result.winnerId}>`,
    '',
    `📊 **Mudança de Rating:**`,
    `<@${battle.challengerId}>: ${result.challengerRatingChange > 0 ? '+' : ''}${result.challengerRatingChange}`,
    `<@${battle.opponentId}>: ${result.opponentRatingChange > 0 ? '+' : ''}${result.opponentRatingChange}`,
  ].join('\n'));

  embed.addFields(
    {
      name: `🔵 ${battle.challenger?.username || 'Desafiante'}`,
      value: `HP Final: ${result.challengerHP}`,
      inline: true,
    },
    {
      name: `🔴 ${battle.opponent?.username || 'Oponente'}`,
      value: `HP Final: ${result.opponentHP}`,
      inline: true,
    }
  );

  await interaction.followUp({ embeds: [embed] });
}

async function handleDecline(
  interaction: ButtonInteraction,
  battleService: BattleService,
  battleId: number,
  challengerId: string
) {
  // Verificar se é o oponente declinando ou o desafiante cancelando
  const battle = await battleService.getBattle(battleId);

  if (!battle) {
    await interaction.reply({
      content: '❌ Esta batalha não existe!',
      ephemeral: true,
    });
    return;
  }

  if (battle.status !== 'PENDING') {
    await interaction.reply({
      content: '❌ Esta batalha já foi resolvida!',
      ephemeral: true,
    });
    return;
  }

  // Cancelar a batalha
  await battleService.cancelBattle(battleId);

  // Desabilitar botões
  await interaction.update({
    components: [],
  });

  const embed = new EmbedBuilder()
    .setTitle('❌ Batalha Recusada')
    .setDescription(`<@${interaction.user.id}> recusou o desafio de <@${challengerId}>`)
    .setColor(COLORS.error);

  await interaction.followUp({ embeds: [embed] });
}

export default handler;
