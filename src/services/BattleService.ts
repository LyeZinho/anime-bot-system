import prisma from '../database/prisma.js';
import { BATTLE_STATS } from '../config/constants.js';
import { BattleCard, RoundLog, BattleResult } from '../types/game.js';

const ELO_K_FACTOR = 32;

export class BattleService {
  /**
   * Cria um desafio de batalha
   */
  async createBattle(
    challengerId: string,
    opponentId: string,
    challengerUsername?: string,
    opponentUsername?: string
  ) {
    // Garantir que os usuários existem
    await prisma.user.upsert({
      where: { id: challengerId },
      update: challengerUsername ? { username: challengerUsername } : {},
      create: { id: challengerId, username: challengerUsername || 'Unknown' },
    });

    await prisma.user.upsert({
      where: { id: opponentId },
      update: opponentUsername ? { username: opponentUsername } : {},
      create: { id: opponentId, username: opponentUsername || 'Unknown' },
    });

    return prisma.battle.create({
      data: {
        challengerId,
        opponentId,
        status: 'PENDING',
      },
      include: {
        challenger: true,
        opponent: true,
      },
    });
  }

  /**
   * Aceita uma batalha pendente
   */
  async acceptBattle(battleId: number, opponentId: string) {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle || battle.status !== 'PENDING' || battle.opponentId !== opponentId) {
      return null;
    }

    return prisma.battle.update({
      where: { id: battleId },
      data: { status: 'IN_PROGRESS' },
      include: {
        challenger: true,
        opponent: true,
      },
    });
  }

  /**
   * Cancela uma batalha pendente
   */
  async cancelBattle(battleId: number) {
    return prisma.battle.update({
      where: { id: battleId },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Busca uma batalha por ID
   */
  async getBattle(battleId: number) {
    return prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        challenger: true,
        opponent: true,
      },
    });
  }

  /**
   * Executa a batalha completa
   */
  async executeBattle(battleId: number): Promise<BattleResult | null> {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        challenger: true,
        opponent: true,
      },
    });

    if (!battle || battle.status !== 'IN_PROGRESS') {
      return null;
    }

    // Carregar os 3 melhores personagens de cada jogador
    const challengerCards = await this.loadBattleCards(battle.challengerId);
    const opponentCards = await this.loadBattleCards(battle.opponentId);

    if (challengerCards.length < 3 || opponentCards.length < 3) {
      return null;
    }

    // Simular a batalha
    const result = this.simulateBattle(challengerCards, opponentCards);

    // Determinar vencedor
    const winnerId = result.challengerHP > result.opponentHP 
      ? battle.challengerId 
      : result.opponentHP > result.challengerHP 
        ? battle.opponentId 
        : null;

    // Calcular mudança de rating
    const ratingChange = this.calculateRatingChange(
      battle.challenger!.battleRating,
      battle.opponent!.battleRating,
      winnerId === battle.challengerId ? 'challenger' : winnerId === battle.opponentId ? 'opponent' : 'draw'
    );

    // Atualizar banco de dados
    await prisma.$transaction([
      prisma.battle.update({
        where: { id: battleId },
        data: {
          winnerId,
          status: 'FINISHED',
        },
      }),
      prisma.user.update({
        where: { id: battle.challengerId },
        data: {
          battleRating: { increment: ratingChange.challenger },
          battleWins: winnerId === battle.challengerId ? { increment: 1 } : undefined,
          battleLosses: winnerId === battle.opponentId ? { increment: 1 } : undefined,
        },
      }),
      prisma.user.update({
        where: { id: battle.opponentId },
        data: {
          battleRating: { increment: ratingChange.opponent },
          battleWins: winnerId === battle.opponentId ? { increment: 1 } : undefined,
          battleLosses: winnerId === battle.challengerId ? { increment: 1 } : undefined,
        },
      }),
    ]);

    return {
      battleId,
      winnerId,
      challengerHP: result.challengerHP,
      opponentHP: result.opponentHP,
      rounds: result.rounds,
      challengerRatingChange: ratingChange.challenger,
      opponentRatingChange: ratingChange.opponent,
    };
  }

  /**
   * Carrega as cartas de batalha de um usuário
   */
  private async loadBattleCards(userId: string): Promise<BattleCard[]> {
    const userCharacters = await prisma.userCharacter.findMany({
      where: { userId },
      include: {
        character: true,
        version: true,
      },
      orderBy: {
        character: {
          rarity: 'desc',
        },
      },
      take: 3,
    });

    return userCharacters.map(uc => {
      const rarity = uc.character.rarity as keyof typeof BATTLE_STATS;
      const baseStats = BATTLE_STATS[rarity] || BATTLE_STATS.common;

      return {
        id: uc.id,
        name: uc.character.name,
        rarity: uc.character.rarity,
        imageUrl: uc.character.imageUrl || undefined,
        stats: {
          attack: baseStats.attack,
          defense: baseStats.defense,
          hp: baseStats.hp,
        },
      };
    });
  }

  /**
   * Simula a batalha entre dois jogadores
   */
  private simulateBattle(
    challengerCards: BattleCard[],
    opponentCards: BattleCard[]
  ): { rounds: RoundLog[]; challengerHP: number; opponentHP: number } {
    const rounds: RoundLog[] = [];
    
    // HP total é a soma dos HPs de todas as cartas
    let challengerHP = challengerCards.reduce((sum, card) => sum + card.stats.hp, 0);
    let opponentHP = opponentCards.reduce((sum, card) => sum + card.stats.hp, 0);

    // 3 rounds, uma carta de cada por round
    for (let i = 0; i < 3; i++) {
      const challengerCard = challengerCards[i];
      const opponentCard = opponentCards[i];

      // Challenger ataca
      const challengerDamage = Math.max(1, challengerCard.stats.attack - Math.floor(opponentCard.stats.defense * 0.3));
      opponentHP -= challengerDamage;

      // Opponent ataca
      const opponentDamage = Math.max(1, opponentCard.stats.attack - Math.floor(challengerCard.stats.defense * 0.3));
      challengerHP -= opponentDamage;

      rounds.push({
        round: i + 1,
        attackerCard: challengerCard,
        defenderCard: opponentCard,
        damage: challengerDamage,
        winner: challengerDamage > opponentDamage ? 'challenger' : 'opponent',
      });
    }

    return {
      rounds,
      challengerHP: Math.max(0, challengerHP),
      opponentHP: Math.max(0, opponentHP),
    };
  }

  /**
   * Calcula mudança de rating ELO
   */
  private calculateRatingChange(
    challengerRating: number,
    opponentRating: number,
    winner: 'challenger' | 'opponent' | 'draw'
  ): { challenger: number; opponent: number } {
    const expectedChallenger = 1 / (1 + Math.pow(10, (opponentRating - challengerRating) / 400));
    const expectedOpponent = 1 - expectedChallenger;

    let actualChallenger: number;
    let actualOpponent: number;

    if (winner === 'challenger') {
      actualChallenger = 1;
      actualOpponent = 0;
    } else if (winner === 'opponent') {
      actualChallenger = 0;
      actualOpponent = 1;
    } else {
      actualChallenger = 0.5;
      actualOpponent = 0.5;
    }

    return {
      challenger: Math.round(ELO_K_FACTOR * (actualChallenger - expectedChallenger)),
      opponent: Math.round(ELO_K_FACTOR * (actualOpponent - expectedOpponent)),
    };
  }

  /**
   * Busca ranking de batalhas
   */
  async getBattleRanking(limit: number = 10) {
    return prisma.user.findMany({
      where: {
        OR: [
          { battleWins: { gt: 0 } },
          { battleLosses: { gt: 0 } },
        ],
      },
      orderBy: { battleRating: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        battleWins: true,
        battleLosses: true,
        battleRating: true,
      },
    });
  }
}

export const battleService = new BattleService();
