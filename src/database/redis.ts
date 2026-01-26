import { createClient, RedisClientType } from 'redis';

class RedisManager {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected && this.client) return;

    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:11998',
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('🔗 Redis conectando...');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis pronto!');
      this.isConnected = true;
    });

    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  getClient(): RedisClientType {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  // Cache helpers
  async get<T>(key: string): Promise<T | null> {
    const data = await this.getClient().get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const client = this.getClient();
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } else {
      await client.set(key, JSON.stringify(value));
    }
  }

  async del(key: string): Promise<void> {
    await this.getClient().del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.getClient().exists(key)) === 1;
  }

  // Rate limiting
  async rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const client = this.getClient();
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, windowSeconds);
    }

    const ttl = await client.ttl(key);

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetIn: ttl > 0 ? ttl : windowSeconds,
    };
  }

  // Cooldown system
  async setCooldown(userId: string, action: string, seconds: number): Promise<void> {
    const key = `cooldown:${action}:${userId}`;
    await this.set(key, Date.now(), seconds);
  }

  async getCooldown(userId: string, action: string): Promise<number> {
    const key = `cooldown:${action}:${userId}`;
    const client = this.getClient();
    const ttl = await client.ttl(key);
    return ttl > 0 ? ttl : 0;
  }

  async isOnCooldown(userId: string, action: string): Promise<boolean> {
    const ttl = await this.getCooldown(userId, action);
    return ttl > 0;
  }
}

export const redis = new RedisManager();
export default redis;
