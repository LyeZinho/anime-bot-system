import prisma from '../database/prisma.js';
import redis from '../database/redis.js';
import { GAME_CONFIG } from '../config/constants.js';

export class UserService {
  /**
   * Encontra ou cria um usuário
   */
  async findOrCreate(userId: string, username: string) {
    return prisma.user.upsert({
      where: { id: userId },
      update: { username },
      create: { 
        id: userId, 
        username,
        lastClaimReset: new Date(),
      },
    });
  }

  /**
   * Busca um usuário pelo ID
   */
  async getUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Verifica rolls disponíveis
   */
  async checkRolls(userId: string): Promise<{
    available: boolean;
    remaining: number;
    maxRolls: number;
    cooldown: number;
  }> {
    const user = await this.findOrCreate(userId, 'Unknown');
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Reset se passou mais de 1 hora desde o último roll
    if (!user.lastRoll || user.lastRoll < oneHourAgo) {
      await prisma.user.update({
        where: { id: userId },
        data: { rollsUsed: 0, lastRoll: now },
      });
      return {
        available: true,
        remaining: GAME_CONFIG.maxRollsPerHour,
        maxRolls: GAME_CONFIG.maxRollsPerHour,
        cooldown: 0,
      };
    }

    const remaining = GAME_CONFIG.maxRollsPerHour - user.rollsUsed;
    const cooldownMs = user.lastRoll.getTime() + (60 * 60 * 1000) - now.getTime();
    const cooldown = Math.max(0, Math.ceil(cooldownMs / 1000));

    return {
      available: remaining > 0,
      remaining: Math.max(0, remaining),
      maxRolls: GAME_CONFIG.maxRollsPerHour,
      cooldown,
    };
  }

  /**
   * Consome um roll
   */
  async consumeRoll(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        rollsUsed: { increment: 1 },
        lastRoll: new Date(),
      },
    });
  }

  /**
   * Verifica claims disponíveis
   */
  async checkClaims(userId: string): Promise<{
    available: boolean;
    remaining: number;
    maxClaims: number;
  }> {
    const user = await this.findOrCreate(userId, 'Unknown');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Reset se é um novo dia
    if (!user.lastClaimReset || user.lastClaimReset < today) {
      await prisma.user.update({
        where: { id: userId },
        data: { claimsUsed: 0, lastClaimReset: now },
      });
      return {
        available: true,
        remaining: GAME_CONFIG.maxClaimsPerDay,
        maxClaims: GAME_CONFIG.maxClaimsPerDay,
      };
    }

    const remaining = GAME_CONFIG.maxClaimsPerDay - user.claimsUsed;

    return {
      available: remaining > 0,
      remaining: Math.max(0, remaining),
      maxClaims: GAME_CONFIG.maxClaimsPerDay,
    };
  }

  /**
   * Consome um claim
   */
  async consumeClaim(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        claimsUsed: { increment: 1 },
      },
    });
  }

  /**
   * Coleta a recompensa diária
   */
  async claimDaily(userId: string, username: string): Promise<{
    success: boolean;
    amount?: number;
    bonus?: number;
    streak?: number;
    total?: number;
    hoursRemaining?: number;
  }> {
    const user = await this.findOrCreate(userId, username);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Verificar se já coletou hoje
    if (user.lastDaily && user.lastDaily >= today) {
      const nextDaily = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const hoursRemaining = (nextDaily.getTime() - now.getTime()) / (60 * 60 * 1000);
      return { success: false, hoursRemaining };
    }

    // Calcular streak
    let newStreak = 1;
    if (user.lastDaily && user.lastDaily >= yesterday) {
      newStreak = user.dailyStreak + 1;
    }

    // Calcular recompensas
    const baseAmount = GAME_CONFIG.dailyCoins;
    const streakBonus = Math.floor(baseAmount * (newStreak - 1) * 0.1); // 10% por dia de streak
    const totalAmount = baseAmount + streakBonus;

    // Atualizar usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: totalAmount },
        dailyStreak: newStreak,
        lastDaily: now,
      },
    });

    return {
      success: true,
      amount: baseAmount,
      bonus: streakBonus,
      streak: newStreak,
      total: user.coins + totalAmount,
    };
  }

  /**
   * Busca estatísticas do usuário
   */
  async getStats(userId: string) {
    const user = await this.findOrCreate(userId, 'Unknown');

    const [totalRolls, totalClaims] = await Promise.all([
      prisma.userCharacter.count({ where: { userId } }),
      prisma.userCharacter.count({ where: { userId } }),
    ]);

    return {
      totalRolls: user.rollsUsed,
      totalClaims,
      collectionSize: totalClaims,
    };
  }

  /**
   * Envia moedas para outro usuário
   */
  async giftCoins(
    senderId: string,
    receiverId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string; senderBalance?: number }> {
    const sender = await this.getUser(senderId);

    if (!sender || sender.coins < amount) {
      return { success: false, error: 'Moedas insuficientes!' };
    }

    const fee = Math.floor(amount * (GAME_CONFIG.giftFeePercent / 100));
    const finalAmount = amount - fee;

    const [updatedSender] = await prisma.$transaction([
      prisma.user.update({
        where: { id: senderId },
        data: { coins: { decrement: amount } },
      }),
      prisma.user.update({
        where: { id: receiverId },
        data: { coins: { increment: finalAmount } },
      }),
      prisma.gift.create({
        data: {
          senderId,
          receiverId,
          amount: finalAmount,
        },
      }),
    ]);

    return { success: true, senderBalance: updatedSender.coins };
  }

  /**
   * Deposita moedas no banco
   */
  async bankDeposit(userId: string, amount: number): Promise<{ 
    success: boolean; 
    error?: string;
    wallet?: number;
    bank?: number;
  }> {
    const user = await this.getUser(userId);

    if (!user || user.coins < amount) {
      return { success: false, error: 'Moedas insuficientes!' };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { decrement: amount },
        bank: { increment: amount },
      },
    });

    return { success: true, wallet: updated.coins, bank: updated.bank };
  }

  /**
   * Saca moedas do banco
   */
  async bankWithdraw(userId: string, amount: number): Promise<{ 
    success: boolean; 
    error?: string;
    wallet?: number;
    bank?: number;
  }> {
    const user = await this.getUser(userId);

    if (!user || user.bank < amount) {
      return { success: false, error: 'Saldo insuficiente no banco!' };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: amount },
        bank: { decrement: amount },
      },
    });

    return { success: true, wallet: updated.coins, bank: updated.bank };
  }

  /**
   * Jogo de sorte (lucky)
   */
  async playLucky(userId: string, bet: number): Promise<{
    success: boolean;
    error?: string;
    result?: string;
    payout?: number;
    newBalance?: number;
  }> {
    const user = await this.getUser(userId);

    if (!user || user.coins < bet) {
      return { success: false, error: 'Moedas insuficientes!' };
    }

    // Determinar resultado
    const random = Math.random() * 100;
    let result: string;
    let multiplier: number;

    if (random < 1) {
      result = 'jackpot';
      multiplier = 10;
    } else if (random < 6) {
      result = 'bigWin';
      multiplier = 3;
    } else if (random < 26) {
      result = 'win';
      multiplier = 1.5;
    } else if (random < 46) {
      result = 'smallWin';
      multiplier = 1.2;
    } else {
      result = 'lose';
      multiplier = 0;
    }

    const payout = Math.floor(bet * multiplier);
    const netChange = payout - bet;

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: netChange },
      },
    });

    // Registrar no histórico
    await prisma.luckyHistory.create({
      data: {
        userId,
        bet,
        result,
        payout,
      },
    });

    return {
      success: true,
      result,
      payout,
      newBalance: updatedUser.coins,
    };
  }
}

export const userService = new UserService();
