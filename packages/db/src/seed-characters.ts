import { db, characters, characterCategories, categoryValues, categoryTypes, characterRatings, eq } from './index';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export async function seedCharacters() {
  console.log('🌱 Seeding characters...');

  const dataDir = join(__dirname, '../../../data/unified/characters');
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));

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
  for (const file of files) {
    const anilistId = parseInt(file.replace('.json', ''));
    const data = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));

    await db
      .insert(characters)
      .values({
        anilistId,
        slug: data.id,
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
  }

  console.log(`✅ Seeded ${count} characters!`);
}

// Allow running standalone: node dist/seed-characters.js
if (require.main === module) {
  seedCharacters().catch(console.error);
}
