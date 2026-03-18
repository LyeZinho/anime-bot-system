import { resolve } from 'path';
import { config } from 'dotenv';
config({ path: resolve(__dirname, '../../.env') });

import { db, works } from './index';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BATCH_SIZE = 50;

export async function seedWorks() {
  console.log('🌱 Seeding works...');

  const dataDir = join(__dirname, '../../../data/unified/works');
  let files: string[] = [];

  try {
    files = readdirSync(dataDir).filter(f => f.endsWith('.json'));
  } catch {
    console.warn('   ⚠️  Data directory not found or empty:', dataDir);
    console.log('✅ Seeded 0 works!');
    return;
  }

  if (files.length === 0) {
    console.warn('   ⚠️  No JSON files found in works directory');
    console.log('✅ Seeded 0 works!');
    return;
  }

  const allData = files.map(file => {
    const raw = readFileSync(join(dataDir, file), 'utf-8');
    return { file, data: JSON.parse(raw) };
  });

  let count = 0;
  let errors = 0;

  for (let i = 0; i < allData.length; i += BATCH_SIZE) {
    const batch = allData.slice(i, i + BATCH_SIZE);
    const batchVals = batch.map(({ data }) => ({
      id: data.internalId,
      title: data.title,
      altTitles: data.alt_titles,
      sourceAnimeId: data.source_ids?.anime,
      sourceMangaId: data.source_ids?.manga,
      popularity: data.metadata?.popularity || 0,
      averageScore: data.metadata?.averageScore ? Math.round(data.metadata.averageScore) : null,
      formats: data.metadata?.formats,
      genres: data.metadata?.genres,
      tags: data.metadata?.tags,
      coverImage: data.images?.[0]?.url,
      bannerImage: data.images?.[1]?.url,
    }));

    try {
      await db.insert(works).values(batchVals).onConflictDoUpdate({
        target: works.id,
        set: {
          title: works.title,
          altTitles: works.altTitles,
          popularity: works.popularity,
          averageScore: works.averageScore,
          formats: works.formats,
          genres: works.genres,
          tags: works.tags,
        }
      });
      count += batch.length;
    } catch (e) {
      errors += batch.length;
      console.error(`   ❌ Batch error: ${(e as Error).message}`);
    }

    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`   Processed ${count}/${files.length} works`);
    }
  }

  console.log(`✅ Seeded ${count} works!${errors > 0 ? ` (${errors} errors)` : ''}`);
}

if (require.main === module) {
  seedWorks().catch(console.error);
}
