import { Injectable } from '@nestjs/common';
import { db, characters, characterCategories, categoryValues, categoryTypes, characterRatings, works, userCollections, userFavorites, ledgerLogs, eq, desc, sql, and, inArray, count, users } from '@anime-bot/db';

export interface CharacterFilter {
  gender?: string;
  role?: string;
  personality?: string[];
  hairColor?: string;
  eyeColor?: string;
  bodyType?: string;
  archetype?: string[];
  genre?: string[];
  format?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class CharactersService {
  async findAll(filters: CharacterFilter) {
    const { page = 1, limit = 50, search, gender, role } = filters;
    const offset = (page - 1) * limit;

    const params: (string | number)[] = [];
    const parts: string[] = [];

    if (search) {
      params.push('%' + search + '%');
      parts.push(`name ILIKE $${params.length}`);
    }
    if (gender) {
      params.push(gender.toLowerCase());
      parts.push(`gender = $${params.length}`);
    }
    if (role) {
      params.push(role.toLowerCase());
      parts.push(`role = $${params.length}`);
    }

    const whereClause = parts.length > 0 ? ' WHERE ' + parts.join(' AND ') : '';
    const pg = (db as any).$client;

    const [countResult] = await pg.unsafe(
      'SELECT COUNT(*) as cnt FROM characters' + whereClause,
      params,
    );
    const total = Number(countResult?.cnt ?? 0);

    const rows = await pg.unsafe(
      'SELECT anilist_id, slug, name, alt_names, description, gender, role, image_url, popularity, score, work_id FROM characters'
      + whereClause + ' ORDER BY popularity DESC LIMIT ' + limit + ' OFFSET ' + offset,
      params,
    );

    return {
      data: (rows || []).map((row: any) => ({
        anilistId: row.anilist_id,
        slug: row.slug,
        name: row.name,
        altNames: row.alt_names,
        description: row.description,
        gender: row.gender,
        role: row.role,
        imageUrl: row.image_url,
        popularity: row.popularity,
        score: row.score,
        workId: row.work_id,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(anilistId: number) {
    const character = await db.query.characters.findFirst({
      where: eq(characters.anilistId, anilistId),
      with: {
        work: true,
      },
    });

    if (!character) return null;

    const categories = await db.select({
      type: categoryTypes.type,
      value: categoryValues.value,
    })
    .from(characterCategories)
    .leftJoin(categoryValues, eq(characterCategories.categoryValueId, categoryValues.id))
    .leftJoin(categoryTypes, eq(categoryValues.typeId, categoryTypes.id))
    .where(eq(characterCategories.characterId, anilistId));

    const rating = await db.query.characterRatings.findFirst({
      where: eq(characterRatings.characterId, anilistId),
    });

    return {
      ...character,
      categories: categories.reduce((acc, cat) => {
        if (!acc[cat.type]) acc[cat.type] = [];
        acc[cat.type].push(cat.value);
        return acc;
      }, {}),
      rating: rating || { totalVotes: 0, averageRating: 0 },
    };
  }

  async random(filters: Omit<CharacterFilter, 'page' | 'limit'>) {
    const all = await this.findAll({ ...filters, page: 1, limit: 1000 });
    if (all.data.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * all.data.length);
    return this.findOne(all.data[randomIndex].anilistId);
  }

  async getMetrics(anilistId: number) {
    const character = await db.query.characters.findFirst({
      where: eq(characters.anilistId, anilistId),
    });

    if (!character) return null;

    const [totalClaims] = await db.select({ count: sql<number>`count(*)` })
      .from(userCollections)
      .where(eq(userCollections.characterId, anilistId));

    const [totalFavorites] = await db.select({ count: sql<number>`count(*)` })
      .from(userFavorites)
      .where(eq(userFavorites.characterId, anilistId));

    const [globalRank] = await db.select({ count: count() })
      .from(characters)
      .where(sql`${characters.popularity} > ${character.popularity}`);

    return {
      globalRank: (globalRank?.count || 0) + 1,
      totalClaims: totalClaims?.count || 0,
      totalFavorites: totalFavorites?.count || 0,
    };
  }

  async getRelated(anilistId: number, limit: number = 5) {
    const characterCats = await db.select({
      categoryValueId: characterCategories.categoryValueId,
    })
    .from(characterCategories)
    .where(eq(characterCategories.characterId, anilistId));

    if (characterCats.length === 0) return [];

    const categoryIds = characterCats.map(c => c.categoryValueId);

    const relatedCounts = await db.select({
      characterId: characterCategories.characterId,
      sharedTags: sql<number>`count(*)`,
    })
    .from(characterCategories)
    .where(and(
      inArray(characterCategories.categoryValueId, categoryIds),
      sql`${characterCategories.characterId} != ${anilistId}`
    ))
    .groupBy(characterCategories.characterId)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(limit);

    const relatedIds = relatedCounts.map(r => r.characterId);

    const relatedChars = await db.select({
      anilistId: characters.anilistId,
      name: characters.name,
      imageUrl: characters.imageUrl,
      slug: characters.slug,
    })
    .from(characters)
    .where(inArray(characters.anilistId, relatedIds));

    return relatedChars.map(char => ({
      ...char,
      sharedTags: relatedCounts.find(r => r.characterId === char.anilistId)?.sharedTags || 0,
    })).sort((a, b) => b.sharedTags - a.sharedTags);
  }

  async getVolume(anilistId: number, months: number = 6) {
    const now = new Date();
    const volumes = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(userCollections)
        .where(and(
          eq(userCollections.characterId, anilistId),
          sql`${userCollections.obtainedAt} >= ${monthStart.toISOString()}`,
          sql`${userCollections.obtainedAt} < ${monthEnd.toISOString()}`
        ));

      volumes.push({
        month: monthStart.toLocaleString('en-US', { month: 'short' }),
        year: monthStart.getFullYear(),
        count: countResult?.count || 0,
      });
    }

    return volumes;
  }
}
