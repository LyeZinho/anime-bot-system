import { db, works } from './index';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export async function seedWorks() {
  console.log('🌱 Seeding works...');

  const dataDir = join(__dirname, '../../../data/unified/works');
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'));

  let count = 0;
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
    
    await db
      .insert(works)
      .values({
        id: data.internalId,
        title: data.title,
        altTitles: data.alt_titles,
        sourceAnimeId: data.source_ids?.anime,
        sourceMangaId: data.source_ids?.manga,
        popularity: data.metadata?.popularity || 0,
        averageScore: data.metadata?.averageScore,
        formats: data.metadata?.formats,
        genres: data.metadata?.genres,
        tags: data.metadata?.tags,
        coverImage: data.images?.[0]?.url,
        bannerImage: data.images?.[1]?.url,
      })
      .onConflictDoUpdate({
        target: works.id,
        set: {
          title: data.title,
          altTitles: data.alt_titles,
          popularity: data.metadata?.popularity || 0,
          averageScore: data.metadata?.averageScore,
          formats: data.metadata?.formats,
          genres: data.metadata?.genres,
          tags: data.metadata?.tags,
        }
      });

    count++;
    if (count % 50 === 0) console.log(`   Processed ${count}/${files.length} works`);
  }

  console.log(`✅ Seeded ${count} works!`);
}

// Allow running standalone: node dist/seed-works.js
if (require.main === module) {
  seedWorks().catch(console.error);
}
