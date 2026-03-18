import { resolve } from 'path';
import { config } from 'dotenv';
config({ path: resolve(__dirname, '../../.env') });

import { db, characters, characterCategories, categoryValues, categoryTypes, characterRatings, eq } from './index';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export async function seedCharacters() {
  console.log('🌱 Seeding characters...');

  const dataDir = join(__dirname, '../../../data/unified/characters');
  let files: string[] = [];

  try {
    files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
  } catch {
    console.warn('   ⚠️  Data directory not found or empty:', dataDir);
    console.log('✅ Seeded 0 characters!');
    return;
  }

  if (files.length === 0) {
    console.warn('   ⚠️  No JSON files found in characters directory');
    console.log('✅ Seeded 0 characters!');
    return;
  }

  console.log(`   Loading ${files.length} character files...`);

  const personalityType = await db.query.categoryTypes.findFirst({ where: eq(categoryTypes.name, 'personality_trait') });
  const hairColorType = await db.query.categoryTypes.findFirst({ where: eq(categoryTypes.name, 'hair_color') });
  const eyeColorType = await db.query.categoryTypes.findFirst({ where: eq(categoryTypes.name, 'eye_color') });
  const bodyTypeType = await db.query.categoryTypes.findFirst({ where: eq(categoryTypes.name, 'body_type') });
  const archetypeType = await db.query.categoryTypes.findFirst({ where: eq(categoryTypes.name, 'archetype') });
  const genreType = await db.query.categoryTypes.findFirst({ where: eq(categoryTypes.name, 'genre') });

  const [persVals, hairVals, eyeVals, bodyVals, archVals, genreVals] = await Promise.all([
    personalityType ? db.query.categoryValues.findMany({ where: eq(categoryValues.typeId, personalityType.id) }) : [],
    hairColorType ? db.query.categoryValues.findMany({ where: eq(categoryValues.typeId, hairColorType.id) }) : [],
    eyeColorType ? db.query.categoryValues.findMany({ where: eq(categoryValues.typeId, eyeColorType.id) }) : [],
    bodyTypeType ? db.query.categoryValues.findMany({ where: eq(categoryValues.typeId, bodyTypeType.id) }) : [],
    archetypeType ? db.query.categoryValues.findMany({ where: eq(categoryValues.typeId, archetypeType.id) }) : [],
    genreType ? db.query.categoryValues.findMany({ where: eq(categoryValues.typeId, genreType.id) }) : [],
  ]);

  const persMap = new Map(persVals.map(v => [v.value, v.id]));
  const hairMap = new Map(hairVals.map(v => [v.value, v.id]));
  const eyeMap = new Map(eyeVals.map(v => [v.value, v.id]));
  const bodyMap = new Map(bodyVals.map(v => [v.value, v.id]));
  const archMap = new Map(archVals.map(v => [v.value, v.id]));
  const genreMap = new Map(genreVals.map(v => [v.value, v.id]));

  let count = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
      const anilistId = Math.round(Number(data.anilistId));

      if (!anilistId || !data.slug) {
        throw new Error(`Missing required fields: anilistId=${anilistId}, slug=${data.slug}`);
      }

      await db
        .insert(characters)
        .values({
          anilistId,
          slug: data.slug,
          name: data.name,
          altNames: data.alt_names,
          description: data.description,
          gender: data.categories?.demographics?.gender,
          role: data.role,
          imageUrl: data.images?.[0]?.url,
          popularity: data.categories?.work?.popularity || 0,
          score: 0,
          workId: data.works?.[0]?.internalId,
        })
        .onConflictDoUpdate({
          target: characters.anilistId,
          set: {
            name: data.name,
            altNames: data.alt_names,
            gender: data.categories?.demographics?.gender,
            role: data.role,
            imageUrl: data.images?.[0]?.url,
            popularity: data.categories?.work?.popularity || 0,
          }
        });

      await db
        .insert(characterRatings)
        .values({ characterId: anilistId, totalVotes: 0, averageRating: 0, sumRatings: 0 })
        .onConflictDoNothing();

      const cats = data.categories || {};
      const catInserts: { characterId: number; categoryValueId: string }[] = [];

      if (cats.personality?.length) {
        for (const trait of cats.personality) {
          const id = persMap.get(trait);
          if (id) catInserts.push({ characterId: anilistId, categoryValueId: id });
        }
      }
      if (cats.hair_color) {
        const id = hairMap.get(cats.hair_color);
        if (id) catInserts.push({ characterId: anilistId, categoryValueId: id });
      }
      if (cats.eye_color) {
        const id = eyeMap.get(cats.eye_color);
        if (id) catInserts.push({ characterId: anilistId, categoryValueId: id });
      }
      if (cats.body_type) {
        const id = bodyMap.get(cats.body_type);
        if (id) catInserts.push({ characterId: anilistId, categoryValueId: id });
      }
      if (cats.archetype?.length) {
        for (const arch of cats.archetype) {
          const id = archMap.get(arch);
          if (id) catInserts.push({ characterId: anilistId, categoryValueId: id });
        }
      }
      if (cats.genres?.length) {
        for (const genre of cats.genres) {
          const id = genreMap.get(genre);
          if (id) catInserts.push({ characterId: anilistId, categoryValueId: id });
        }
      }

      if (catInserts.length > 0) {
        await db.insert(characterCategories).values(catInserts).onConflictDoNothing();
      }

      count++;
      if (count % 200 === 0) console.log(`   Processed ${count}/${files.length} characters`);
    } catch (e) {
      errors++;
      console.error(`   ❌ Error processing ${file}: ${(e as Error).message}`);
    }
  }

  console.log(`✅ Seeded ${count} characters!${errors > 0 ? ` (${errors} errors)` : ''}`);
}

if (require.main === module) {
  seedCharacters().catch(console.error);
}
