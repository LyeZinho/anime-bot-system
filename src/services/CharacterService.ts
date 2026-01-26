import axios from 'axios';
import prisma from '../database/prisma.js';
import redis from '../database/redis.js';
import { CHARLIB_API_URL, RARITY_CONFIG } from '../config/constants.js';
import { APICharacter, APIWork } from '../types/game.js';
import { Rarity, WorkType } from '@prisma/client';

const CACHE_TTL = 300; // 5 minutes

export class CharacterService {
  private normalizeApiChar(item: any): APICharacter {
    const workTitle = item?.workTitle ?? item?.workName ?? '';
    const workName = item?.workName ?? item?.workTitle ?? workTitle;
    const image = item?.image ?? item?.imageUrl ?? null;
    const imageUrl = item?.imageUrl ?? item?.image ?? image;

    const mapped: any = {
      ...item,
      workTitle,
      workName,
      image,
      imageUrl,
      apiData: item,
    };

    return mapped as APICharacter;
  }
  /**
   * Busca personagens aleatórios da API com peso de raridade
   */
  async fetchRandomCharacters(count: number = 1): Promise<APICharacter[]> {
    try {
      const params = new URLSearchParams({
        n: count.toString(),
        weighted: 'true',
      });

      const response = await axios.get<APICharacter[]>(
        `${CHARLIB_API_URL}/characters/random?${params.toString()}`
      );

      const raw = response.data as any;

      // Caso a API retorne diretamente um array
      let arr: any[] | null = null;
      if (Array.isArray(raw)) arr = raw as any[];

      // Caso a API retorne { data: [...] } ou { characters: [...] }
      if (!arr && raw && typeof raw === 'object') {
        if (Array.isArray(raw.data)) arr = raw.data as any[];
        if (!arr && Array.isArray(raw.characters)) arr = raw.characters as any[];
      }

      if (!arr) {
        console.error('❌ API retornou dados inválidos (esperado array ou {data}|{characters}):', typeof raw, raw);
        return [];
      }

      return arr.map(a => this.normalizeApiChar(a));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Erro ao buscar personagens:', error.response?.status, error.response?.data);
      } else {
        console.error('❌ Erro ao buscar personagens aleatórios:', error);
      }
      return [];
    }
  }

  /**
   * Busca personagem por nome (fuzzy search)
   */
  async searchCharacter(query: string, limit: number = 10): Promise<APICharacter[]> {
    try {
      const response = await axios.get(`${CHARLIB_API_URL}/characters/search`, {
        params: { q: query, limit, threshold: 0.4 },
      });

      const raw = response.data as any;

      // API may return an object { results: [...] } or an array directly
      let arr: any[] | null = null;
      if (Array.isArray(raw)) arr = raw as any[];
      if (!arr && raw && typeof raw === 'object') {
        if (Array.isArray(raw.results)) arr = raw.results as any[];
        if (!arr && Array.isArray(raw.data)) arr = raw.data as any[];
      }

      if (!arr) return [];
      return arr.map(a => this.normalizeApiChar(a));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Erro ao buscar personagem (search):', error.response?.status, error.response?.data);
      } else {
        console.error('❌ Erro ao buscar personagem (search):', error);
      }
      return [];
    }
  }

  /**
   * Busca obras por nome
   */
  async searchWorks(query: string, limit: number = 25): Promise<APIWork[]> {
    try {
      const response = await axios.get<APIWork[]>(
        `${CHARLIB_API_URL}/works/search`,
        {
          params: { q: query, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar obras:', error);
      return [];
    }
  }

  /**
   * Busca obra por nome ou slug
   */
  async searchWork(query: string): Promise<APIWork[]> {
    try {
      const response = await axios.get<APIWork[]>(
        `${CHARLIB_API_URL}/works/search`,
        { params: { q: query } }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar obra:', error);
      return [];
    }
  }

  /**
   * Busca personagens de uma obra específica
   */
  async getWorkCharacters(type: string, workSlug: string): Promise<APICharacter[]> {
    try {
      const cacheKey = `work:${type}:${workSlug}:characters`;
      const cached = await redis.get<APICharacter[]>(cacheKey);
      if (cached) return cached;

      const response = await axios.get<APICharacter[]>(
        `${CHARLIB_API_URL}/works/${type}/${workSlug}/characters`
      );

      const arr = Array.isArray(response.data)
        ? response.data.map(a => this.normalizeApiChar(a))
        : [];

      await redis.set(cacheKey, arr, CACHE_TTL);
      return arr;
    } catch (error) {
      console.error('❌ Erro ao buscar personagens da obra:', error);
      return [];
    }
  }

  /**
   * Encontra ou cria um personagem no banco local
   */
  async findOrCreateCharacter(apiChar: APICharacter) {
    // Buscar personagem existente pelo apiId
    let character = await prisma.character.findUnique({
      where: { apiId: apiChar.id },
    });

    if (character) {
      // Atualizar se necessário
      if (character.rarity !== apiChar.rarity || character.imageUrl !== apiChar.image) {
        character = await prisma.character.update({
          where: { id: character.id },
          data: {
            rarity: apiChar.rarity as Rarity,
            imageUrl: apiChar.image,
          },
        });
      }
      return character;
    }

    // Criar novo personagem
    return prisma.character.create({
      data: {
        apiId: apiChar.id,
        name: apiChar.name,
        rarity: apiChar.rarity as Rarity,
        imageUrl: apiChar.image,
        workName: apiChar.workTitle,
        workType: apiChar.workType as WorkType,
      },
    });
  }

  /**
   * Realiza o roll de personagens
   */
  async rollCharacters(count: number = 1) {
    try {
      const apiCharsRaw = await this.fetchRandomCharacters(count);

      if (!Array.isArray(apiCharsRaw) || apiCharsRaw.length === 0) {
        console.error('[CharacterService] rollCharacters: nenhum personagem retornado ou formato inválido', {
          isArray: Array.isArray(apiCharsRaw),
          raw: apiCharsRaw,
        });
        return [];
      }

      const results: APICharacter[] = [];
      for (const item of apiCharsRaw as any[]) {
        try {
          const mapped = this.normalizeApiChar(item);
          if (!mapped || !mapped.id || !mapped.name) continue;
          // Garantir que workTitle está preenchido para evitar leitura undefined
          mapped.workTitle = mapped.workTitle || mapped.workName || '';
          results.push(mapped);
        } catch (err) {
          console.warn('[CharacterService] rollCharacters: failed to process item', err);
          continue;
        }
      }

      return results;
    } catch (error) {
      console.error('[CharacterService] rollCharacters fatal error:', error);
      return [];
    }
  }

  /**
   * Claim de personagem para usuário
   */
  async claimCharacter(
    userId: string,
    username: string,
    characterId: number,
    versionId?: number
  ): Promise<{ success: boolean; error?: string; version?: any }> {
    // Verificar se usuário já tem este personagem
    const existing = await prisma.userCharacter.findFirst({
      where: {
        userId,
        characterId,
        versionId: versionId || null,
      },
    });

    if (existing) {
      return { success: false, error: 'Você já possui este personagem!' };
    }

    // Garantir que o usuário existe
    await prisma.user.upsert({
      where: { id: userId },
      update: { username },
      create: { id: userId, username },
    });

    // Criar userCharacter
    const userChar = await prisma.userCharacter.create({
      data: {
        userId,
        characterId,
        versionId,
      },
      include: {
        character: true,
        version: true,
      },
    });

    return { success: true, version: userChar.version };
  }

  /**
   * Busca coleção do usuário
   */
  async getUserCollection(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const [characters, total] = await Promise.all([
      prisma.userCharacter.findMany({
        where: { userId },
        include: {
          character: true,
          version: true,
        },
        orderBy: { obtainedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userCharacter.count({ where: { userId } }),
    ]);

    return {
      characters,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Busca um personagem pelo ID do banco
   */
  async getCharacterById(characterId: number) {
    return prisma.character.findUnique({
      where: { id: characterId },
    });
  }

  /**
   * Busca um personagem pelo `apiId` (ID/string da API externa)
   */
  async getCharacterByApiId(apiId: string) {
    return prisma.character.findUnique({
      where: { apiId },
    });
  }

  /**
   * Busca um personagem diretamente na API pelo seu `apiId` (slug)
   */
  async getApiCharacterById(apiId: string): Promise<APICharacter | null> {
    try {
      // Try direct lookup first
      const response = await axios.get(`${CHARLIB_API_URL}/characters/${encodeURIComponent(apiId)}`);
      return this.normalizeApiChar(response.data);
    } catch (error: any) {
      // If not found, try slugified form (replace spaces with hyphens, remove unsafe chars)
      if (error?.response?.status === 404 || error?.code === 'ERR_BAD_REQUEST') {
        try {
          const slug = apiId
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '');
          if (!slug) return null;

          const resp2 = await axios.get(`${CHARLIB_API_URL}/characters/${encodeURIComponent(slug)}`);
          return this.normalizeApiChar(resp2.data);
        } catch (err2) {
          console.warn('❌ getApiCharacterById: tentativa com slug falhou:', apiId, (err2 as any)?.message || err2);
          return null;
        }
      }

      console.error('❌ Erro ao buscar personagem na API por id:', apiId, error);
      return null;
    }
  }

  /**
   * Busca personagens por nome da obra
   */
  async getCharactersByWork(
    workName: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ characters: any[]; total: number; totalPages: number } | null> {
    try {
      const cacheKey = `work:${workName}:${page}:${limit}`;
      const cached = await redis.get<{ characters: any[]; total: number; totalPages: number }>(cacheKey);
      if (cached) return cached;

      // Primeiro buscar a obra
      const works = await this.searchWork(workName);
      if (!works.length) return null;

      const work = works[0];

      // Buscar personagens da obra
      const characters = await this.getWorkCharacters(work.type, work.slug);
      
      const total = characters.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedCharacters = characters.slice(startIndex, startIndex + limit);

      // Converter para formato do banco
      const formattedCharacters = paginatedCharacters.map(char => ({
        id: char.id,
        name: char.name,
        rarity: char.rarity || 'common',
        imageUrl: char.image,
      }));

      const result = {
        characters: formattedCharacters,
        total,
        totalPages,
      };

      await redis.set(cacheKey, result, CACHE_TTL);
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar personagens por obra:', error);
      return null;
    }
  }
}

export const characterService = new CharacterService();
