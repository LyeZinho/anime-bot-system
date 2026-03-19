/**
 * Script de Unificação de Anime e Manga
 * 
 * Objetivo:
 * 1. Unificar obras por título japonês (ID interno)
 * 2. Usar popularity MÁXIMA entre anime e manga
 * 3. Unificar personagens por external_ids.anilist
 * 4. Gerar ranking baseado em popularidade absoluta
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UNIFIED_DIR = path.join(DATA_DIR, 'unified');

// Helper: slugify - cria ID interno a partir do título japonês
function createInternalId(altTitles) {
    if (!altTitles || altTitles.length === 0) return null;
    
    // Procura título japonês (contém caracteres japoneses)
    const japaneseTitle = altTitles.find(t => /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(t));
    
    if (japaneseTitle) {
        return japaneseTitle
            .toLowerCase()
            .replace(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    return null;
}

// Helper: slugify padrão para fallback
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Helper: mescla objetos, preferindo valores não-nulos
function mergeObjects(obj1, obj2) {
    const result = { ...obj1 };
    for (const key in obj2) {
        if (obj2[key] !== null && obj2[key] !== undefined) {
            if (typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
                result[key] = mergeObjects(result[key] || {}, obj2[key]);
            } else if (!result[key]) {
                result[key] = obj2[key];
            }
        }
    }
    return result;
}

// Helper: escolhe melhor imagem
function selectBestImage(images) {
    if (!images || images.length === 0) return null;
    
    // Prioridade: portrait > full-body > art > screenshot > other
    const priority = ['portrait', 'full-body', 'art', 'screenshot', 'other'];
    
    for (const type of priority) {
        const found = images.find(img => img.type === type);
        if (found) return found.url;
    }
    return images[0].url;
}

// Carrega todos os info.json de um diretório
function loadWorks(type) {
    const dir = path.join(DATA_DIR, type);
    const works = [];
    
    if (!fs.existsSync(dir)) return works;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const infoPath = path.join(dir, entry.name, 'info.json');
        if (!fs.existsSync(infoPath)) continue;
        
        try {
            const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
            works.push({
                ...info,
                _sourceType: type,
                _sourceFolder: entry.name
            });
        } catch (e) {
            console.error(`Erro ao carregar ${infoPath}:`, e.message);
        }
    }
    
    return works;
}

// Carrega personagens de uma obra
function loadCharacters(type, folder) {
    const charsPath = path.join(DATA_DIR, type, folder, 'characters.json');
    if (!fs.existsSync(charsPath)) return [];
    
    try {
        const data = JSON.parse(fs.readFileSync(charsPath, 'utf-8'));
        return data.characters || [];
    } catch (e) {
        console.error(`Erro ao carregar personagens de ${charsPath}:`, e.message);
        return [];
    }
}

// Processa todas as obras
function processWorks() {
    console.log('🔄 Carregando obras...');
    
    const animeWorks = loadWorks('anime');
    const mangaWorks = loadWorks('manga');
    
    console.log(`   Anime: ${animeWorks.length} obras`);
    console.log(`   Manga: ${mangaWorks.length} obras`);
    
    // Agrupar por ID interno (título japonês)
    const unifiedWorks = new Map();
    const worksWithInternalId = new Map(); // internalId -> [{ work, type }]
    
    // Processa anime
    for (const work of animeWorks) {
        const internalId = createInternalId(work.alt_titles) || slugify(work.title);
        
        if (!worksWithInternalId.has(internalId)) {
            worksWithInternalId.set(internalId, []);
        }
        worksWithInternalId.get(internalId).push({ work, type: 'anime' });
    }
    
    // Processa manga (une com anime se possível)
    for (const work of mangaWorks) {
        const internalId = createInternalId(work.alt_titles) || slugify(work.title);
        
        if (!worksWithInternalId.has(internalId)) {
            worksWithInternalId.set(internalId, []);
        }
        worksWithInternalId.get(internalId).push({ work, type: 'manga' });
    }
    
    // Agora cria as obras unificadas
    console.log('🔄 Unificando obras...');
    
    let hasAnimeOnly = 0;
    let hasMangaOnly = 0;
    let hasBoth = 0;
    
    for (const [internalId, variants] of worksWithInternalId) {
        const animeVariant = variants.find(v => v.type === 'anime');
        const mangaVariant = variants.find(v => v.type === 'manga');
        
        let popularity, averageScore, bestWork;
        
        if (animeVariant && mangaVariant) {
            hasBoth++;
            // Usar máximo de popularity
            popularity = Math.max(
                animeVariant.work.metadata?.popularity || 0,
                mangaVariant.work.metadata?.popularity || 0
            );
            // Usar máximo de score
            averageScore = Math.max(
                animeVariant.work.metadata?.averageScore || 0,
                mangaVariant.work.metadata?.averageScore || 0
            );
            // Escolher obra com maior popularity como base
            bestWork = animeVariant.work.metadata?.popularity >= mangaVariant.work.metadata?.popularity 
                ? animeVariant.work 
                : mangaVariant.work;
        } else if (animeVariant) {
            hasAnimeOnly++;
            popularity = animeVariant.work.metadata?.popularity || 0;
            averageScore = animeVariant.work.metadata?.averageScore || 0;
            bestWork = animeVariant.work;
        } else if (mangaVariant) {
            hasMangaOnly++;
            popularity = mangaVariant.work.metadata?.popularity || 0;
            averageScore = mangaVariant.work.metadata?.averageScore || 0;
            bestWork = mangaVariant.work;
        }
        
        unifiedWorks.set(internalId, {
            internalId,
            title: bestWork.title,
            alt_titles: bestWork.alt_titles,
            // Manter todos os source_ids
            source_ids: {
                anime: animeVariant?.work.source_id,
                manga: mangaVariant?.work.source_id
            },
            metadata: {
                popularity,
                averageScore,
                formats: [
                    animeVariant && 'anime',
                    mangaVariant && 'manga'
                ].filter(Boolean),
                genres: [...new Set([
                    ...(animeVariant?.work.metadata?.genres || []),
                    ...(mangaVariant?.work.metadata?.genres || [])
                ])],
                tags: [...new Set([
                    ...(animeVariant?.work.tags || []),
                    ...(mangaVariant?.work.tags || [])
                ])]
            },
            images: bestWork.images,
            _variants: variants
        });
    }
    
    console.log(`   Apenas anime: ${hasAnimeOnly}`);
    console.log(`   Apenas manga: ${hasMangaOnly}`);
    console.log(`   Ambos: ${hasBoth}`);
    console.log(`   Total unificado: ${unifiedWorks.size}`);
    
    return unifiedWorks;
}

// Processa personagens unificados
function processCharacters(unifiedWorks) {
    console.log('🔄 Processando personagens...');
    
    const charactersMap = new Map(); // anilist_id -> character data
    
    for (const [internalId, unifiedWork] of unifiedWorks) {
        const variants = unifiedWork._variants;
        
        for (const variant of variants) {
            const chars = loadCharacters(variant.type, variant.work._sourceFolder);
            
            for (const char of chars) {
                const anilistId = char.external_ids?.anilist;
                
                if (!anilistId) continue;
                
                if (!charactersMap.has(anilistId)) {
                    // Primeiro encontro deste personagem
                    charactersMap.set(anilistId, {
                        id: char.id,
                        anilist_id: anilistId,
                        name: char.name,
                        alt_names: [...(char.alt_names || [])],
                        role: char.role,
                        description: char.description,
                        gender: char.metadata?.gender,
                        images: [...(char.images || [])],
                        works: [{
                            internalId,
                            workTitle: unifiedWork.title,
                            role: char.role
                        }],
                        _imageSource: variant.type
                    });
                } else {
                    // Personagem já existe, agregar
                    const existing = charactersMap.get(anilistId);
                    
                    // Agregar alt_names
                    for (const alt of char.alt_names || []) {
                        if (!existing.alt_names.includes(alt)) {
                            existing.alt_names.push(alt);
                        }
                    }
                    
                    // Agregar works
                    const alreadyHasWork = existing.works.some(w => w.internalId === internalId);
                    if (!alreadyHasWork) {
                        existing.works.push({
                            internalId,
                            workTitle: unifiedWork.title,
                            role: char.role
                        });
                    }
                    
                    // Atualizar imagem se a nova for melhor
                    const newImg = selectBestImage(char.images);
                    const existingImg = selectBestImage(existing.images);
                    if (newImg && (!existingImg || variant.type === 'anime')) {
                        existing.images = char.images;
                        existing._imageSource = variant.type;
                    }
                    
                    // Se novo personagem tem role de protagonista, promover
                    if (char.role === 'protagonist' && existing.role !== 'protagonist') {
                        existing.role = 'protagonist';
                    }
                }
            }
        }
    }
    
    console.log(`   Personagens únicos: ${charactersMap.size}`);
    return charactersMap;
}

// Gera ranking
function generateRanking(unifiedWorks, charactersMap) {
    console.log('🔄 Gerando ranking...');
    
    const ranking = [];
    
    for (const [anilistId, char] of charactersMap) {
        // Encontra a obra com maior popularity para este personagem
        let maxPopularity = 0;
        let workInfo = null;
        
        for (const workRef of char.works) {
            const work = unifiedWorks.get(workRef.internalId);
            if (work && work.metadata.popularity > maxPopularity) {
                maxPopularity = work.metadata.popularity;
                workInfo = {
                    internalId: workRef.internalId,
                    title: workRef.workTitle,
                    popularity: work.metadata.popularity,
                    score: work.metadata.averageScore
                };
            }
        }
        
        if (!workInfo) continue;
        
        // Calcular score do personagem (popularity + bônus por papel)
        const roleBonus = {
            'protagonist': 10,
            'deuteragonist': 7,
            'antagonist': 5,
            'supporting': 2,
            'minor': 1,
            'other': 0
        };
        
        const baseScore = workInfo.popularity;
        const bonus = roleBonus[char.role] || 0;
        const characterScore = baseScore + (baseScore * bonus / 100);
        
        const image = selectBestImage(char.images);
        
        ranking.push({
            id: char.id,
            anilist_id: anilistId,
            name: char.name,
            internal_work_id: workInfo.internalId,
            work_title: workInfo.title,
            role: char.role,
            popularity: workInfo.popularity,
            score: Math.round(characterScore * 100) / 100,
            image,
            gender: char.gender
        });
    }
    
    // Ordenar por score decrescente
    ranking.sort((a, b) => b.score - a.score);
    
    // Adicionar rank
    ranking.forEach((item, index) => {
        item.rank = index + 1;
    });
    
    console.log(`   Total no ranking: ${ranking.length}`);
    return ranking;
}

// Salva tudo
function saveResults(unifiedWorks, charactersMap, ranking) {
    console.log('🔄 Salvando resultados...');
    
    // Criar diretórios
    const worksDir = path.join(UNIFIED_DIR, 'works');
    const charsDir = path.join(UNIFIED_DIR, 'characters');
    
    fs.mkdirSync(worksDir, { recursive: true });
    fs.mkdirSync(charsDir, { recursive: true });
    
    // Salvar obras
    let worksCount = 0;
    for (const [internalId, work] of unifiedWorks) {
        const workFile = {
            internalId: work.internalId,
            title: work.title,
            alt_titles: work.alt_titles,
            source_ids: work.source_ids,
            metadata: work.metadata,
            images: work.images
        };
        
        fs.writeFileSync(
            path.join(worksDir, `${internalId}.json`),
            JSON.stringify(workFile, null, 2)
        );
        worksCount++;
    }
    
    // Salvar personagens
    let charsCount = 0;
    for (const [anilistId, char] of charactersMap) {
        const charFile = {
            anilist_id: anilistId,
            name: char.name,
            alt_names: char.alt_names,
            role: char.role,
            description: char.description,
            gender: char.gender,
            images: char.images,
            works: char.works,
            _imageSource: char._imageSource
        };
        
        fs.writeFileSync(
            path.join(charsDir, `${anilistId}.json`),
            JSON.stringify(charFile, null, 2)
        );
        charsCount++;
    }
    
    // Salvar ranking
    fs.writeFileSync(
        path.join(UNIFIED_DIR, 'ranking.json'),
        JSON.stringify(ranking, null, 2)
    );
    
    // Salvar stats
    const stats = {
        generated_at: new Date().toISOString(),
        total_works: worksCount,
        total_characters: charsCount,
        distribution: {
            by_role: {},
            by_gender: {}
        }
    };
    
    // Calcular distribuições
    for (const char of ranking) {
        stats.distribution.by_role[char.role] = (stats.distribution.by_role[char.role] || 0) + 1;
        if (char.gender) {
            stats.distribution.by_gender[char.gender] = (stats.distribution.by_gender[char.gender] || 0) + 1;
        }
    }
    
    fs.writeFileSync(
        path.join(UNIFIED_DIR, 'stats.json'),
        JSON.stringify(stats, null, 2)
    );
    
    console.log(`   Obras salvas: ${worksCount}`);
    console.log(`   Personagens salvos: ${charsCount}`);
    console.log(`   Ranking salvo: ${ranking.length}`);
    console.log(`   \n✅ Dados salvos em: ${UNIFIED_DIR}`);
}

// Main
function main() {
    console.log('🚀 Iniciando unificação de anime e manga...\n');
    
    // Limpar diretório anterior
    if (fs.existsSync(UNIFIED_DIR)) {
        fs.rmSync(UNIFIED_DIR, { recursive: true });
    }
    
    const unifiedWorks = processWorks();
    const charactersMap = processCharacters(unifiedWorks);
    const ranking = generateRanking(unifiedWorks, charactersMap);
    saveResults(unifiedWorks, charactersMap, ranking);
    
    console.log('\n✅ Unificação concluída!');
}

main();
