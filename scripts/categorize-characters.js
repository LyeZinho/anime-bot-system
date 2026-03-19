const fs = require('fs');
const path = require('path');

const UNIFIED_DIR = path.join(__dirname, '..', 'data', 'unified');

const PERSONALITY_TRAITS = {
    'tsundere': ['tsundere', 'acts tough', 'denies feelings', 'embarrassed'],
    'yandere': ['yandere', 'obsessive love', 'possessive', 'psychotic'],
    'kuudere': ['kuudere', 'cold', 'stoic', 'emotionless', 'reserved'],
    'dandere': ['dandere', 'shy', 'quiet', 'timid', 'silent'],
    'imouto': ['imouto', 'little sister', 'younger sister'],
    'onee-san': ['onee-san', 'older sister', 'big sister'],
    'genki': ['genki', 'energetic', 'cheerful', 'lively', 'hyper'],
    'ojousama': ['ojousama', 'young lady', 'noble', 'princess'],
    'bokukko': ['bokukko', 'boyish girl', 'tomboy'],
    'meido': ['maid', 'meido', 'servant'],
    'neko': ['neko', 'catgirl', 'cat-like'],
    'vampire': ['vampire', 'bloodsucker'],
    'demon': ['demon', 'devil', 'fiend'],
    'angel': ['angel', 'heavenly'],
    'ghost': ['ghost', 'spirit', 'specter'],
    'zombie': ['zombie', 'undead'],
    'robot': ['robot', 'android', 'cyborg', 'ai'],
    'alien': ['alien', 'extraterrestrial'],
    'dragon': ['dragon', 'drake'],
    'elf': ['elf', 'fairy'],
    'witch': ['witch', 'sorceress', 'mage', 'wizard'],
    'warrior': ['warrior', 'fighter', 'soldier'],
    'knight': ['knight', 'paladin'],
    'ninja': ['ninja', 'shinobi'],
    'samurai': ['samurai', 'ronin'],
    'hunter': ['hunter', 'hunter'],
    'detective': ['detective', 'investigator'],
    'scientist': ['scientist', 'researcher', 'professor'],
    'doctor': ['doctor', 'physician', 'medic'],
    'police': ['police', 'cop', 'detective'],
    'hacker': ['hacker', 'programmer', 'coder'],
    'musician': ['musician', 'singer', 'bard'],
    'artist': ['artist', 'painter'],
    'writer': ['writer', 'author', 'novelist'],
    'chef': ['chef', 'cook'],
    'idol': ['idol', 'singer', 'performer'],
    'athlete': ['athlete', 'sports'],
    'gamer': ['gamer', 'plays games'],
    'otaku': ['otaku', 'nerd', 'fan'],
    'chuunibyou': ['chuunibyou', 'delusional', 'middle schooler syndrome'],
    'sadist': ['sadist', 'pain', 'torture'],
    'masochist': ['masochist', 'pain lover'],
    'lolicon': ['lolicon', 'little girl'],
    'shotacon': ['shotacon', 'little boy'],
    'siscon': ['siscon', 'sister complex'],
    'brocon': ['brocon', 'brother complex'],
    'harem': ['harem', 'many love interests'],
    'trap': ['trap', 'crossdresser'],
    'femboy': ['femboy', 'feminine boy'],
    'bishounen': ['bishounen', 'beautiful boy'],
    'bishoujo': ['bishoujo', 'beautiful girl'],
    'gyaru': ['gyaru', 'gal', 'fashionable'],
    'mohawk': ['mohawk', 'unique hair'],
    'harem_king': ['harem king', 'harem protagonist'],
    'lucky_pervert': ['pervert', 'lecher', 'lucky'],
    'ecchi': ['ecchi', 'suggestive'],
    'nyaa': ['nyaa', 'cat speech']
};

const HAIR_COLORS = {
    black: ['black', 'dark hair', 'raven', 'jet black'],
    blonde: ['blonde', 'blond', 'golden hair', 'yellow'],
    brown: ['brown', 'brunette', 'auburn', 'chestnut'],
    red: ['red', 'ginger', 'auburn', 'orange hair'],
    blue: ['blue hair', 'azure', 'cobalt'],
    pink: ['pink hair', 'rose', 'magenta'],
    green: ['green hair', 'emerald', 'teal'],
    purple: ['purple hair', 'violet', 'lavender'],
    white: ['white hair', 'silver', 'pale', 'platinum'],
    grey: ['grey hair', 'gray', 'silver'],
    multi: ['multicolored', 'gradient', 'two-tone', 'split']
};

const EYE_COLORS = {
    black: ['black eyes', 'dark eyes'],
    blue: ['blue eyes', 'azure', 'cobalt'],
    red: ['red eyes', 'crimson', 'ruby'],
    green: ['green eyes', 'emerald', 'teal'],
    purple: ['purple eyes', 'violet', 'amethyst'],
    brown: ['brown eyes', 'amber', 'hazel'],
    grey: ['grey eyes', 'gray eyes', 'silver'],
    pink: ['pink eyes', 'rose'],
    gold: ['gold eyes', 'golden eyes', 'yellow']
};

const BODY_TYPES = {
    petite: ['petite', 'small', 'tiny', 'short', 'slim', 'thin'],
    curvy: ['curvy', 'voluptuous', 'busty', 'big breasts', 'hourglass'],
    athletic: ['athletic', 'muscular', 'fit', 'toned'],
    tall: ['tall', 'long legs', 'height'],
    skinny: ['skinny', 'thin', 'slim'],
    chubby: ['chubby', 'plump', 'soft'],
    plus: ['plus size', 'full figured']
};

function loadCharacters() {
    const charsDir = path.join(UNIFIED_DIR, 'characters');
    const characters = new Map();
    
    const files = fs.readdirSync(charsDir);
    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const data = JSON.parse(fs.readFileSync(path.join(charsDir, file), 'utf-8'));
        characters.set(data.anilist_id, data);
    }
    
    return characters;
}

function loadWorks() {
    const worksDir = path.join(UNIFIED_DIR, 'works');
    const works = new Map();
    
    const files = fs.readdirSync(worksDir);
    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const data = JSON.parse(fs.readFileSync(path.join(worksDir, file), 'utf-8'));
        works.set(data.internalId, data);
    }
    
    return works;
}

function extractPersonalityTraits(text) {
    if (!text) return [];
    
    const textLower = text.toLowerCase();
    const traits = [];
    
    const traitPatterns = {
        'tsundere': /\b(tsundere)\b/i,
        'yandere': /\b(yandere)\b/i,
        'kuudere': /\b(kuudere)\b/i,
        'dandere': /\b(dandere)\b/i,
        'imouto': /\b(imouto|little sister|younger sister)\b/i,
        'onee-san': /\b(onee-san|oneechan|older sister|big sister)\b/i,
        'genki': /\b(genki|energetic|cheerful|lively|hyper)\b/i,
        'ojousama': /\b(ojousama|young lady)\b/i,
        'bokukko': /\b(bokukko|boyish girl|tomboy)\b/i,
        'meido': /\b(maid|meido)\bservant/i,
        'neko': /\b(nekotype|catgirl|cat-?girl|nekomimi)\b/i,
        'vampire': /\b(vampire|bloodsucker)\b/i,
        'demon': /\b(demon|devil|fiend)\s+(girl|boy|woman|man|character)/i,
        'angel': /\b(angel|heavenly|angelic)\s+(girl|boy|woman|man|being)/i,
        'ghost': /\b(ghost|spirit|specter)\s+(girl|boy|woman|man)/i,
        'zombie': /\b(zombie|undead)\b/i,
        'robot': /\b(robot|android|cyborg|ai\s+(girl|boy|character))\b/i,
        'alien': /\b(extraterrestrial|alien\s+(girl|boy|being))\b/i,
        'dragon': /\b(dragon|drake)\s+(girl|boy|woman|man|character)/i,
        'elf': /\b(elf|fairy)\s+(girl|boy|woman|man|character)\b/i,
        'witch': /\b(witch|sorceress|mage|wizard|spellcaster)\b/i,
        'warrior': /\b(warrior|fighter|soldier)\s+(girl|boy|woman|man|character)/i,
        'knight': /\b(knight|paladin)\b/i,
        'ninja': /\b(ninja|shinobi)\b/i,
        'samurai': /\b(samurai|ronin)\b/i,
        'hunter': /\b(hunter)\s+(girl|boy|woman|man|character)\b/i,
        'detective': /\b(detective|investigator)\b/i,
        'scientist': /\b(scientist|researcher|professor)\b/i,
        'doctor': /\b(doctor|physician|medic)\b/i,
        'police': /\b(police|cop|officer)\s+(girl|boy|woman|man)/i,
        'hacker': /\b(hacker|programmer|coder)\b/i,
        'musician': /\b(musician|singer|bard)\b/i,
        'artist': /\b(artist|painter)\b/i,
        'writer': /\b(writer|author|novelist)\b/i,
        'chef': /\b(chef|cook)\b/i,
        'idol': /\b(idol|performer)\s+(girl|boy|woman|man)/i,
        'athlete': /\b(athlete|sports\s+(girl|boy|woman|man|player))\b/i,
        'gamer': /\b(gamer)\b/i,
        'otaku': /\b(otaku|nerd|fan)\b/i,
        'chuunibyou': /\b(chuunibyou)\b/i,
        'sadist': /\b(sadist)\b/i,
        'masochist': /\b(masochist)\b/i,
        'lolicon': /\b(lolicon)\b/i,
        'shotacon': /\b(shotacon)\b/i,
        'siscon': /\b(sister\s+complex|siscon)\b/i,
        'brocon': /\b(brother\s+complex|brocon)\b/i,
        'harem': /\b(harem\s+(king|protagonist|master))\b/i,
        'trap': /\b(cross-?dresser|feminine\s+(boy|man))\b/i,
        'femboy': /\b(femboy|feminine\s+boy)\b/i,
        'bishounen': /\b(bishounen|beautiful\s+(boy|young\s+man))\b/i,
        'bishoujo': /\b(bishoujo|beautiful\s+(girl|woman))\b/i,
        'gyaru': /\b(gyaru|gal)\b/i,
        'idol': /\b(idol)\b/i,
        'lucky_pervert': /\b(pervert|lecher|playboy)\b/i
    };
    
    for (const [trait, regex] of Object.entries(traitPatterns)) {
        if (regex.test(textLower)) {
            traits.push(trait);
        }
    }
    
    return [...new Set(traits)];
}

function extractHairColor(text) {
    if (!text) return null;
    
    const textLower = text.toLowerCase();
    
    const hairPatterns = {
        'black': /\b(black|dark\s+hair|raven|jet\s+black)\b/i,
        'blonde': /\b(blonde|blond|golden\s+hair|yellow\s+hair)\b/i,
        'brown': /\b(brown|brunette|auburn|chestnut)\b/i,
        'red': /\b(red\s+hair|ginger|auburn|orange\s+hair)\b/i,
        'blue': /\b(blue\s+hair|azure|cobalt)\b/i,
        'pink': /\b(pink\s+hair|rose|magenta)\b/i,
        'green': /\b(green\s+hair|emerald|teal)\b/i,
        'purple': /\b(purple\s+hair|violet|lavender)\b/i,
        'white': /\b(white\s+hair|silver\s+hair|pale|platinum)\b/i,
        'grey': /\b(grey\s+hair|gray\s+hair)\b/i,
        'multi': /\b(multicolored|gradient|two-?tone|split\s+hair)\b/i
    };
    
    for (const [color, regex] of Object.entries(hairPatterns)) {
        if (regex.test(textLower)) {
            return color;
        }
    }
    
    return null;
}

function extractEyeColor(text) {
    if (!text) return null;
    
    const textLower = text.toLowerCase();
    
    const eyePatterns = {
        'black': /\b(black\s+eyes|dark\s+eyes)\b/i,
        'blue': /\b(blue\s+eyes|azure|cobalt)\b/i,
        'red': /\b(red\s+eyes|crimson|ruby)\b/i,
        'green': /\b(green\s+eyes|emerald|teal)\b/i,
        'purple': /\b(purple\s+eyes|violet|amethyst)\b/i,
        'brown': /\b(brown\s+eyes|amber|hazel)\b/i,
        'grey': /\b(grey\s+eyes|gray\s+eyes|silver\s+eyes)\b/i,
        'pink': /\b(pink\s+eyes|rose)\b/i,
        'gold': /\b(gold\s+eyes|golden\s+eyes|yellow\s+eyes)\b/i
    };
    
    for (const [color, regex] of Object.entries(eyePatterns)) {
        if (regex.test(textLower)) {
            return color;
        }
    }
    
    return null;
}

function extractBodyType(text) {
    if (!text) return null;
    
    const textLower = text.toLowerCase();
    
    const bodyPatterns = {
        'petite': /\b(very\s+short|tiny|small\s+stature|little|small\s+(and\s+)?(thin|slim|petite))\b/i,
        'curvy': /\b(curvy|voluptuous|busty|big\s+breasts|hourglass|full\s+figure)\b/i,
        'athletic': /\b(athletic|muscular|fit|toned|well-?built)\b/i,
        'tall': /\b(tall|long\s+legs|towering|big\s+and\s+tall)\b/i,
        'skinny': /\b(skinny|thin\s+and\s+thin|very\s+thin)\b/i,
        'chubby': /\b(chubby|plump|soft\s+and\s+round)\b/i
    };
    
    for (const [type, regex] of Object.entries(bodyPatterns)) {
        if (regex.test(textLower)) {
            return type;
        }
    }
    
    return null;
}

function categorizeCharacter(char, works) {
    const categories = {
        demographics: {
            gender: char.gender || null,
            age: char.age || char.metadata?.age || null
        },
        role: char.role,
        personality: [],
        appearance: {
            hair_color: null,
            eye_color: null,
            body_type: null
        },
        work: {
            genres: [],
            tags: [],
            formats: [],
            popularity: 0,
            score: 0
        },
        archetype: [],
        source: []
    };
    
    const combinedText = [
        char.description,
        char.alt_names?.join(' '),
        ...(char.works?.map(w => w.workTitle) || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    categories.personality = extractPersonalityTraits(combinedText);
    categories.appearance.hair_color = extractHairColor(combinedText);
    categories.appearance.eye_color = extractEyeColor(combinedText);
    categories.appearance.body_type = extractBodyType(combinedText);
    
    if (char.works && char.works.length > 0) {
        const mainWork = works.get(char.works[0].internalId);
        if (mainWork) {
            categories.work.genres = mainWork.metadata?.genres || [];
            categories.work.tags = mainWork.metadata?.tags || [];
            categories.work.formats = mainWork.metadata?.formats || [];
            categories.work.popularity = mainWork.metadata?.popularity || 0;
            categories.work.score = mainWork.metadata?.averageScore || 0;
        }
        
        for (const workRef of char.works) {
            const work = works.get(workRef.internalId);
            if (work) {
                for (const format of work.metadata?.formats || []) {
                    if (!categories.source.includes(format)) {
                        categories.source.push(format);
                    }
                }
            }
        }
    }
    
    if (categories.personality.includes('imouto')) categories.archetype.push('younger-sister');
    if (categories.personality.includes('onee-san')) categories.archetype.push('older-sister');
    if (categories.personality.includes('neko')) categories.archetype.push('catgirl');
    if (categories.personality.includes('witch')) categories.archetype.push('magical-girl');
    if (categories.personality.includes('angel')) categories.archetype.push('angelic');
    if (categories.personality.includes('demon')) categories.archetype.push('demon');
    if (categories.personality.includes('elf')) categories.archetype.push('elf');
    if (categories.personality.includes('robot')) categories.archetype.push('android');
    if (categories.personality.includes('vampire')) categories.archetype.push('vampire');
    if (categories.personality.includes('idol')) categories.archetype.push('idol');
    if (categories.personality.includes('maid')) categories.archetype.push('maid');
    if (categories.personality.includes('warrior') || categories.personality.includes('knight')) categories.archetype.push('warrior');
    if (categories.personality.includes('ninja')) categories.archetype.push('ninja');
    if (categories.personality.includes('samurai')) categories.archetype.push('samurai');
    if (categories.personality.includes('hunter')) categories.archetype.push('hunter');
    if (categories.personality.includes('chef')) categories.archetype.push('chef');
    if (categories.personality.includes('doctor') || categories.personality.includes('scientist')) categories.archetype.push('professional');
    if (categories.personality.includes('musician') || categories.personality.includes('artist')) categories.archetype.push('creative');
    if (categories.personality.includes('athlete')) categories.archetype.push('athlete');
    if (categories.personality.includes('detective') || categories.personality.includes('police')) categories.archetype.push('authority');
    if (categories.personality.includes('yandere')) categories.archetype.push('yandere');
    if (categories.personality.includes('tsundere')) categories.archetype.push('tsundere');
    if (categories.personality.includes('kuudere')) categories.archetype.push('kuudere');
    if (categories.personality.includes('dandere')) categories.archetype.push('dandere');
    if (categories.personality.includes('genki')) categories.archetype.push('energetic');
    
    if (categories.demographics.gender === 'female') {
        if (categories.appearance.body_type === 'curvy' || categories.appearance.body_type === 'petite') {
            categories.archetype.push(categories.appearance.body_type);
        }
    }
    
    categories.source = [...new Set(categories.source)];
    categories.work.genres = [...new Set(categories.work.genres)];
    categories.work.tags = [...new Set(categories.work.tags)];
    categories.personality = [...new Set(categories.personality)];
    categories.archetype = [...new Set(categories.archetype)];
    
    return categories;
}

function generateStats(characters) {
    const stats = {
        total: characters.size,
        by_gender: {},
        by_role: {},
        personality_traits: {},
        hair_colors: {},
        eye_colors: {},
        body_types: {},
        archetypes: {},
        genres: {},
        formats: {}
    };
    
    for (const char of characters.values()) {
        const cats = char.categories;
        
        if (cats.demographics.gender) {
            stats.by_gender[cats.demographics.gender] = (stats.by_gender[cats.demographics.gender] || 0) + 1;
        }
        
        if (cats.role) {
            stats.by_role[cats.role] = (stats.by_role[cats.role] || 0) + 1;
        }
        
        for (const trait of cats.personality || []) {
            stats.personality_traits[trait] = (stats.personality_traits[trait] || 0) + 1;
        }
        
        if (cats.appearance.hair_color) {
            stats.hair_colors[cats.appearance.hair_color] = (stats.hair_colors[cats.appearance.hair_color] || 0) + 1;
        }
        
        if (cats.appearance.eye_color) {
            stats.eye_colors[cats.appearance.eye_color] = (stats.eye_colors[cats.appearance.eye_color] || 0) + 1;
        }
        
        if (cats.appearance.body_type) {
            stats.body_types[cats.appearance.body_type] = (stats.body_types[cats.appearance.body_type] || 0) + 1;
        }
        
        for (const arch of cats.archetype || []) {
            stats.archetypes[arch] = (stats.archetypes[arch] || 0) + 1;
        }
        
        for (const genre of cats.work?.genres || []) {
            stats.genres[genre] = (stats.genres[genre] || 0) + 1;
        }
        
        for (const format of cats.work?.formats || []) {
            stats.formats[format] = (stats.formats[format] || 0) + 1;
        }
    }
    
    return stats;
}

function main() {
    console.log('🔄 Carregando dados...');
    
    const characters = loadCharacters();
    const works = loadWorks();
    
    console.log(`   Personagens: ${characters.size}`);
    console.log(`   Obras: ${works.size}`);
    
    console.log('🔄 Categorizando personagens...');
    
    let categorized = 0;
    for (const [anilistId, char] of characters) {
        char.categories = categorizeCharacter(char, works);
        categorized++;
    }
    
    console.log(`   Categorizados: ${categorized}`);
    
    console.log('🔄 Salvando personagens categorizados...');
    
    for (const [anilistId, char] of characters) {
        fs.writeFileSync(
            path.join(UNIFIED_DIR, 'characters', `${anilistId}.json`),
            JSON.stringify(char, null, 2)
        );
    }
    
    console.log('🔄 Gerando estatísticas...');
    
    const stats = generateStats(characters);
    fs.writeFileSync(
        path.join(UNIFIED_DIR, 'categories-stats.json'),
        JSON.stringify(stats, null, 2)
    );
    
    console.log('🔄 Atualizando ranking com categorias...');
    
    const ranking = JSON.parse(fs.readFileSync(path.join(UNIFIED_DIR, 'ranking.json'), 'utf-8'));
    
    for (const entry of ranking) {
        const char = characters.get(entry.anilist_id);
        if (char && char.categories) {
            entry.categories = {
                gender: char.categories.demographics.gender,
                role: char.categories.role,
                personality: char.categories.personality,
                archetype: char.categories.archetype,
                hair_color: char.categories.appearance.hair_color,
                eye_color: char.categories.appearance.eye_color,
                body_type: char.categories.appearance.body_type,
                genres: char.categories.work.genres,
                formats: char.categories.work.formats
            };
        }
    }
    
    fs.writeFileSync(
        path.join(UNIFIED_DIR, 'ranking.json'),
        JSON.stringify(ranking, null, 2)
    );
    
    console.log('\n✅ Categorização concluída!');
    console.log(`   Personality traits encontrados: ${Object.keys(stats.personality_traits).length}`);
    console.log(`   Hair colors encontrados: ${Object.keys(stats.hair_colors).length}`);
    console.log(`   Archetypes encontrados: ${Object.keys(stats.archetypes).length}`);
    console.log(`   Géneros encontrados: ${Object.keys(stats.genres).length}`);
}

main();
