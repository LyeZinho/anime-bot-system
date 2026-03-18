import { resolve } from 'path';
import { config } from 'dotenv';
config({ path: resolve(__dirname, '../../.env') });

import { db, categoryTypes, categoryValues, eq } from './index';

const categories = [
  {
    name: 'personality_trait',
    type: 'personality_trait' as const,
    values: [
      'tsundere', 'yandere', 'kuudere', 'dandere',
      'imouto', 'onee-san', 'ojousama', 'bokukko',
      'genki', 'meido', 'neko',
      'witch', 'elf', 'demon', 'angel', 'ghost', 'zombie', 'vampire',
      'robot', 'alien', 'dragon',
      'warrior', 'knight', 'ninja', 'samurai',
      'hunter', 'detective', 'scientist', 'doctor', 'police', 'hacker',
      'musician', 'artist', 'writer', 'chef', 'idol',
      'athlete', 'gamer', 'otaku',
      'chuunibyou', 'sadist', 'masochist',
      'lolicon', 'shotacon', 'siscon', 'brocon',
      'trap', 'femboy', 'bishounen', 'bishoujo', 'gyaru',
      'lucky_pervert'
    ]
  },
  {
    name: 'hair_color',
    type: 'hair_color' as const,
    values: ['black', 'blonde', 'brown', 'red', 'blue', 'pink', 'green', 'purple', 'white', 'grey', 'multi']
  },
  {
    name: 'eye_color',
    type: 'eye_color' as const,
    values: ['black', 'blue', 'red', 'green', 'purple', 'brown', 'grey', 'pink', 'gold']
  },
  {
    name: 'body_type',
    type: 'body_type' as const,
    values: ['petite', 'curvy', 'athletic', 'tall', 'skinny', 'chubby']
  },
  {
    name: 'archetype',
    type: 'archetype' as const,
    values: [
      'magical-girl', 'catgirl', 'elf', 'demon', 'angel', 'vampire',
      'warrior', 'ninja', 'samurai', 'knight',
      'idol', 'maid', 'professional', 'creative',
      'younger-sister', 'older-sister',
      'tsundere', 'yandere', 'kuudere', 'dandere',
      'energetic', 'athlete'
    ]
  },
  {
    name: 'genre',
    type: 'genre' as const,
    values: [
      'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
      'Horror', 'Mecha', 'Music', 'Mystery', 'Psychological',
      'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
      'Thriller', 'Ecchi', 'Mahou Shoujo'
    ]
  },
  {
    name: 'work_format',
    type: 'work_format' as const,
    values: ['anime', 'manga']
  }
];

export async function seedCategories() {
  console.log('🌱 Seeding categories...');

  for (const cat of categories) {
    const [type] = await db
      .insert(categoryTypes)
      .values({
        name: cat.name,
        type: cat.type,
      })
      .onConflictDoNothing()
      .returning();

    if (!type) {
      const existing = await db.query.categoryTypes.findFirst({
        where: eq(categoryTypes.name, cat.name)
      });
      if (!existing) continue;
      console.log(`   Category ${cat.name} already exists`);
      
      for (const value of cat.values) {
        await db
          .insert(categoryValues)
          .values({
            typeId: existing.id,
            value,
          })
          .onConflictDoNothing();
      }
      continue;
    }

    console.log(`   Created category: ${cat.name}`);

    for (const value of cat.values) {
      await db
        .insert(categoryValues)
        .values({
          typeId: type.id,
          value,
        })
        .onConflictDoNothing();
    }

    console.log(`   Added ${cat.values.length} values to ${cat.name}`);
  }

  console.log('✅ Categories seeded!');
}

// Allow running standalone: node dist/seed-categories.js
if (require.main === module) {
  seedCategories().catch(console.error);
}
