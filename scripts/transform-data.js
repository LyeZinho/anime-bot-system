#!/usr/bin/env node

/**
 * Transform anime data from data/anime/* into unified format
 * Outputs to data/unified/works/ and data/unified/characters/
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ANIME_DIR = path.join(DATA_DIR, 'anime');
const UNIFIED_DIR = path.join(DATA_DIR, 'unified');
const WORKS_DIR = path.join(UNIFIED_DIR, 'works');
const CHARACTERS_DIR = path.join(UNIFIED_DIR, 'characters');

// Ensure directories exist
[UNIFIED_DIR, WORKS_DIR, CHARACTERS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const anilistIdToWorkInternalId = new Map();
let workCounter = 1;

console.log('🔄 Transforming anime data...\n');

// Step 1: Process works (info.json files)
console.log('📚 Processing works...');
let workCount = 0;

const animeDir = fs.readdirSync(ANIME_DIR);
for (const animeFolder of animeDir) {
  const animeFolderPath = path.join(ANIME_DIR, animeFolder);
  const infoPath = path.join(animeFolderPath, 'info.json');

  if (!fs.existsSync(infoPath)) continue;

  try {
    const infoData = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    const anilistId = infoData.external_ids?.anilist || infoData.source_id;

    const workData = {
      internalId: workCounter,
      anilistId,
      title: infoData.title,
      alt_titles: infoData.alt_titles || [],
      source_ids: {
        anime: anilistId,
        manga: null
      },
      metadata: {
        popularity: infoData.metadata?.popularity || 0,
        averageScore: infoData.metadata?.averageScore || 0,
        formats: [infoData.metadata?.format || 'UNKNOWN'],
        genres: infoData.metadata?.genres || [],
        tags: infoData.tags || [],
        status: infoData.metadata?.status || 'UNKNOWN',
        episodes: infoData.metadata?.episodes || null
      },
      images: infoData.images || [],
      description: infoData.description || ''
    };

    const workFile = path.join(WORKS_DIR, `${anilistId}.json`);
    fs.writeFileSync(workFile, JSON.stringify(workData, null, 2));

    // Map anilist ID to internal ID for character reference
    anilistIdToWorkInternalId.set(anilistId, workCounter);

    workCount++;
    workCounter++;

    if (workCount % 10 === 0) {
      console.log(`  ✓ Processed ${workCount} works...`);
    }
  } catch (e) {
    console.warn(`  ⚠️  Failed to process ${infoPath}: ${e.message}`);
  }
}

console.log(`✅ Transformed ${workCount} works!\n`);

// Step 2: Process characters (characters.json files)
console.log('👥 Processing characters...');
let characterCount = 0;

for (const animeFolder of animeDir) {
  const animeFolderPath = path.join(ANIME_DIR, animeFolder);
  const charactersPath = path.join(animeFolderPath, 'characters.json');
  const infoPath = path.join(animeFolderPath, 'info.json');

  if (!fs.existsSync(charactersPath)) continue;

  try {
    const charactersData = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));
    const infoData = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    const anilistId = infoData.external_ids?.anilist || infoData.source_id;
    const workInternalId = anilistIdToWorkInternalId.get(anilistId);

    if (!charactersData.characters || !Array.isArray(charactersData.characters)) {
      continue;
    }

    for (const char of charactersData.characters) {
      // Use anilist ID or generate deterministic ID from slug + anime folder
      const anilistCharId = char.external_ids?.anilist || null;
      
      // Skip characters without valid anilist IDs
      if (!anilistCharId || typeof anilistCharId !== 'number' || anilistCharId <= 0) {
        continue;
      }

      const characterData = {
        anilistId: anilistCharId,
        slug: char.id,
        name: char.name,
        alt_names: char.alt_names || [],
        description: char.description || '',
        role: char.role || 'supporting',
        gender: null, // Not in source data
        imageUrl: char.images?.[0]?.url || null,
        popularity: 0,
        score: 0,
        workId: workInternalId,
        rarity: char.rarity || 'common',
        categories: {}
      };

      const charFile = path.join(CHARACTERS_DIR, `${anilistCharId}.json`);
      fs.writeFileSync(charFile, JSON.stringify(characterData, null, 2));

      characterCount++;
    }

    if (characterCount % 100 === 0) {
      console.log(`  ✓ Processed ${characterCount} characters...`);
    }
  } catch (e) {
    console.warn(`  ⚠️  Failed to process ${charactersPath}: ${e.message}`);
  }
}

console.log(`✅ Transformed ${characterCount} characters!\n`);
console.log(`🎉 Transformation complete!`);
console.log(`   Works: ${WORKS_DIR}`);
console.log(`   Characters: ${CHARACTERS_DIR}`);
