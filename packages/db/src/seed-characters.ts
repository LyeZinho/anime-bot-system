import { db, characters, characterCategories, categoryValues, categoryTypes, characterRatings, eq } from './index';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export async function seedCharacters() {
  console.log('🌱 Seeding characters...');

  const dataDir = join(__dirname, '../../../data/unified/characters');
  let files: string[] = [];
  
  try {
    files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
  } catch (e) {
    console.warn(`   ⚠️  Data directory not found or empty: ${dataDir}`);
    console.log(`✅ Seeded 0 characters!`);
    return;
  }
  
  if (files.length === 0) {
    console.warn('   ⚠️  No JSON files found in characters directory');
    console.log(`✅ Seeded 0 characters!`);
    return;
  }

  const personalityType = await db.query.categoryTypes.findFirst({
    where: eq(categoryTypes.name, 'personality_trait')
  });
  const hairColorType = await db.query.categoryTypes.findFirst({
    where: eq(categoryTypes.name, 'hair_color')
  });
  const eyeColorType = await db.query.categoryTypes.findFirst({
    where: eq(categoryTypes.name, 'eye_color')
  });
  const bodyTypeType = await db.query.categoryTypes.findFirst({
    where: eq(categoryTypes.name, 'body_type')
  });
  const archetypeType = await db.query.categoryTypes.findFirst({
    where: eq(categoryTypes.name, 'archetype')
  });
  const genreType = await db.query.categoryTypes.findFirst({
    where: eq(categoryTypes.name, 'genre')
  });

  let count = 0;
  let errors = 0;
  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
      
      // Use anilistId from data file, not from filename
      const anilistId = data.anilistId;
      
      // Validate required fields
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
        .values({
          characterId: anilistId,
          totalVotes: 0,
          averageRating: 0,
          sumRatings: 0,
        })
        .onConflictDoNothing();

      if (data.categories) {
        const cats = data.categories;

        if (cats.personality?.length && personalityType) {
          const values = await db.query.categoryValues.findMany({
            where: eq(categoryValues.typeId, personalityType.id)
          });
          for (const trait of cats.personality) {
            const found = values.find(v => v.value === trait);
            if (found) {
              await db.insert(characterCategories).values({
                characterId: anilistId,
                categoryValueId: found.id
              }).onConflictDoNothing();
            }
          }
        }

        if (cats.hair_color && hairColorType) {
          const values = await db.query.categoryValues.findMany({
            where: eq(categoryValues.typeId, hairColorType.id)
          });
          const found = values.find(v => v.value === cats.hair_color);
          if (found) {
            await db.insert(characterCategories).values({
              characterId: anilistId,
              categoryValueId: found.id
            }).onConflictDoNothing();
          }
        }

        if (cats.eye_color && eyeColorType) {
          const values = await db.query.categoryValues.findMany({
            where: eq(categoryValues.typeId, eyeColorType.id)
          });
          const found = values.find(v => v.value === cats.eye_color);
          if (found) {
            await db.insert(characterCategories).values({
              characterId: anilistId,
              categoryValueId: found.id
            }).onConflictDoNothing();
          }
        }

        if (cats.body_type && bodyTypeType) {
          const values = await db.query.categoryValues.findMany({
            where: eq(categoryValues.typeId, bodyTypeType.id)
          });
          const found = values.find(v => v.value === cats.body_type);
          if (found) {
            await db.insert(characterCategories).values({
              characterId: anilistId,
              categoryValueId: found.id
            }).onConflictDoNothing();
          }
        }

        if (cats.archetype?.length && archetypeType) {
          const values = await db.query.categoryValues.findMany({
            where: eq(categoryValues.typeId, archetypeType.id)
          });
          for (const arch of cats.archetype) {
            const found = values.find(v => v.value === arch);
            if (found) {
              await db.insert(characterCategories).values({
                characterId: anilistId,
                categoryValueId: found.id
              }).onConflictDoNothing();
            }
          }
        }

        if (cats.genres?.length && genreType) {
          const values = await db.query.categoryValues.findMany({
            where: eq(categoryValues.typeId, genreType.id)
          });
          for (const genre of cats.genres) {
            const found = values.find(v => v.value === genre);
            if (found) {
              await db.insert(characterCategories).values({
                characterId: anilistId,
                categoryValueId: found.id
              }).onConflictDoNothing();
            }
          }
        }
      }

      count++;
      if (count % 100 === 0) console.log(`   Processed ${count}/${files.length} characters`);
    } catch (e) {
      errors++;
      console.error(`   ❌ Error processing ${file}: ${(e as Error).message}`);
    }
  }

  console.log(`✅ Seeded ${count} characters!${errors > 0 ? ` (${errors} errors)` : ''}`);
}

// Allow running standalone: node dist/seed-characters.js
if (require.main === module) {
  seedCharacters().catch(console.error);
}
