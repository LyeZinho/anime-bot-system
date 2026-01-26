# Anime Bot System 🎮

Sistema base para bots waifu de anime estilo Mudae/Bongo, integrando com a API CharLib.

## 📋 Funcionalidades

- 🎲 **Roll System** - Role personagens aleatórios com sistema de raridade
- 📦 **Coleção** - Colecione personagens de animes, mangás e games
- 🎬📖🎮 **Múltiplas Versões** - Um personagem pode ter versões diferentes (anime/manga/game)
- 💝 **Wishlist** - Adicione personagens desejados à sua wishlist
- 🎁 **Daily Rewards** - Recompensas diárias com sistema de streak
- 🏆 **Leaderboard** - Rankings por coleção e coins
- 🎯 **Achievements** - Sistema de conquistas desbloqueáveis
- 🔄 **Auto Spawn** - Personagens aparecem automaticamente nos canais
- 💱 **Trading** - Troque personagens com outros jogadores (WIP)
- 🃏 **Sistemas de Batalha** - Batalhas PvP entre personagens (WIP)

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Uma aplicação Discord (bot)


### Commandos do bot:

Claro! Abaixo está uma **versão melhorada, organizada e mais clara** da lista de comandos do seu bot de *waifu roll*, com foco em:

* Padronização de linguagem
* Melhor legibilidade para usuários
* Estrutura típica de bots de Discord
* Explicações mais objetivas (sem perder detalhes importantes)

Você pode usar isso diretamente no `!help` ou na documentação do bot.

---

## 🎲 Comandos de Roll & Captura

### 🎴 `!roll` ou `/roll`

Role **1 personagem aleatório**.

**Sistema de Rolls:**

* Cada usuário possui **11 rolls**
* Os rolls **resetam a cada 30 minutos**
* Cada uso consome **1 roll**

**Sistema de Claims (Captura):**

* Cada card possui um botão **❤️ Capturar**
* Capturar consome **1 claim**
* Cada usuário possui:

  * **1 claim base**, que reseta a cada **60 minutos**
  * **+1 claim bônus** ao usar `!daily`
  * **Claims extras por streak**:

    * A cada **5 dias consecutivos** usando `!daily`, ganha **+1 claim permanente**
    * Máximo de **+3 claims adicionais**
* Total máximo: **3 claims por dia**
* Botões de captura usam **Interações do Discord** e expiram em **60 segundos**

---

## 📦 Coleções & Wishlist

### 📚 `!collection` ou `/collection`

Veja sua **coleção de personagens capturados**.

* Exibe todos os personagens obtidos via `!roll`
* Sistema de **paginação com botões de interação**

---

### ⭐ `!wishlist` ou `/wishlist`

Veja sua **wishlist de personagens desejados**.

* Lista personagens que você pretende capturar no futuro
* Sistema de **paginação com botões**

---

### ➕ `!addwishlist <nome>` ou `/addwishlist <nome>`

Adicione um personagem à sua wishlist.

* Aceita **nome ou slug**
* Usa **busca fuzzy**
* Se houver múltiplos resultados, o bot exibe um **menu dropdown** para seleção
* Caso o personagem já esteja na wishlist, o bot informa

---

### ➖ `!removewishlist <nome>` ou `/removewishlist <nome>`

Remova um personagem da sua wishlist.

* Aceita **nome ou slug**
* Usa **busca fuzzy**
* Menu dropdown caso haja múltiplos resultados
* Informa caso o personagem não esteja na wishlist

---

## 👤 Perfil & Economia

### 🧾 `!profile` ou `/profile`

Veja seu **perfil de usuário**, incluindo:

* Coins
* Streak diária
* Total de personagens capturados
* Distribuição por:

  * Tipo (anime / manga / game)
  * Raridade

---

### 🎁 `!daily` ou `/daily`

Reivindique sua **recompensa diária**.

* Concede **coins**
* Sistema de **streak**
* Cada uso concede:

  * **+1 claim bônus**
* Streaks aumentam o número de claims resetados diariamente

---

## 🏆 Rankings & Estatísticas

### 🥇 `!top` ou `/top`

Veja os **leaderboards do bot**.

Tipos de ranking:

* 🧩 Top colecionadores (número de personagens)
* 💰 Top colecionadores (coins)
* 🔥 Top streaks
* ❤️ Personagens mais capturados

> Cada captura é registrada e incrementa o contador global do personagem, formando o ranking de popularidade.

---

## 🔍 Informações Detalhadas

### 🧍 `!character <nome>` ou `/character <nome>`

Veja detalhes de um personagem específico.

Inclui:

* Imagens
* Descrição
* Obra de origem
* Estatísticas de captura global

🔎 Usa **busca fuzzy** com **menu dropdown** se necessário.

---

### 📖 `!work <nome>` ou `/work <nome>`

Veja detalhes de uma obra (anime, manga ou jogo).

Inclui:

* Descrição da obra
* Lista de personagens
* Estatísticas de capturas totais da obra

🔎 Usa **busca fuzzy** com **menu dropdown** se necessário.

---

## 🔁 Interações entre Usuários

### 🔄 `!trade <@usuário> <personagem>` ou `/trade <@usuário> <personagem>`

Proponha uma **troca de personagem** com outro usuário.

* Usa **busca fuzzy** para o personagem
* Menu dropdown se houver múltiplos resultados
* Sistema de troca com:

  * Botões **Aceitar / Recusar**
  * Timeout de **2 minutos**
* O bot gerencia todo o estado da troca

---

### ⚔️ `!battle <@usuário> <personagem>` ou `/battle <@usuário> <personagem>` *(WIP)*

Inicie uma **batalha PvP** contra outro usuário.

* Usa **busca fuzzy**
* Menu dropdown para seleção
* Sistema de turnos, ataques e resultados (em desenvolvimento)

**Sistema de Batalha:**

* Cada personagem possui:

  * Ataque
  * Defesa
  * Velocidade
* Os stats são calculados com base em:

  * **Raridade**
  * **Popularidade na database**

---

## ❓ Ajuda

### 📜 `!help` ou `/help`

Veja a **lista completa de comandos disponíveis**.


Claro! Vou sugerir **novos comandos** e **minigames** pensando em **retenção**, **economia balanceada**, **interação social** e **progressão a longo prazo** — tudo bem alinhado com o sistema de roll/claim que você já tem.

Vou separar por categorias para ficar fácil de implementar aos poucos.

---

# 🧩 NOVOS COMANDOS (QUALITY OF LIFE)

### 🔍 `!search <nome>` ou `/search <nome>`

Busca global de personagens.

* Mostra resultados filtráveis por:

  * Raridade
  * Obra
  * Tipo (anime/manga/game)
* Ótimo para colecionadores avançados

---

### 🎯 `!missing` ou `/missing`

Veja personagens que **faltam na sua coleção**.

* Pode filtrar por:

  * Obra específica
  * Raridade
* Excelente para completar coleções

---

### 🧮 `!stats` ou `/stats`

Estatísticas avançadas do usuário:

* Taxa de captura (%)
* Personagem mais capturado
* Raridade mais comum
* Quantidade de trocas realizadas

---

### 🔔 `!notify` ou `/notify`

Ative notificações:

* Quando alguém rolar um personagem da sua wishlist
* Quando seu claim resetar
* Quando um evento começar

---

# 💰 ECONOMIA & PROGRESSÃO

### 🏦 `!bank` ou `/bank`

Sistema de banco:

* Depositar coins (protegido de perdas futuras)
* Sacar coins
* Limite diário de saque

---

### 🛒 `!shop` ou `/shop`

Loja do bot.

* Comprar:

  * Claims extras
  * Rolls extras
  * Skins de card
  * Títulos de perfil
* Loja pode rotacionar diariamente

---

### 🎁 `!gift <@user> <coins>`

Enviar coins para outro usuário.

* Taxa de transação (sink de economia)

---

### 🔄 `!reroll`

Re-role um personagem recém-rolado.

* Custa coins ou item
* Limitado por dia

---

# 🧪 SISTEMAS DE CRAFT & FUSÃO

### 🧬 `!fusion`

Funda personagens repetidos.

* Exemplo:

  * 3 personagens comuns → 1 raro
  * 3 raros → 1 épico
* Remove excesso da economia

---

### 💎 `!shards`

Sistema de fragmentos.

* Personagens duplicados viram shards
* Shards podem:

  * Comprar personagens específicos
  * Melhorar stats de batalha

---

# 🎮 MINIGAMES (ALTA RETENÇÃO)

## 🎰 1. Gacha Clash

### `!gachaclash`

* Dois usuários apostam coins
* Cada um rola um personagem aleatório
* Quem tiver maior raridade vence
* Popularidade entra como desempate

💡 **Rápido, viciante, ótimo sink de coins**

---

## 🃏 4. Card Draft

### `!draft`

* Bot mostra 3 personagens
* Usuário escolhe 1
* Os outros são descartados
* Limitado por dia

---

## 🧩 6. Bingo de Waifus

### `!bingo`

* Cartela com personagens aleatórios baseado na coleção do usuário
* Completar linha dá prêmios
* Eventos semanais

---

## 🎲 7. Lucky Claim

### `!lucky`

* Minigame rápido:

  * 30% → claim extra
  * 10% → roll extra
  * 1% → personagem raro grátis
* Cooldown diário


#### Api CharLib:

Endpoints importantes:

👥 Personagens por Obra
GET
/api/works/{type}/{workSlug}/characters

Descrição: Lista todos os personagens pertencentes a uma obra específica.

Path Parameters:

    • type, workSlug: mesmos parâmetros do endpoint anterior

RESPONSE (200 OK):

[
  {
    "id": "naruto-uzumaki",
    "slug": "naruto-uzumaki",
    "name": "Naruto Uzumaki",
    "alt_names": ["うずまき ナルト", "Uzumaki Naruto"],
    "role": "protagonist",
    "images": [
      { "type": "cover", "url": "https://..." }
    ],
    "description": "...",
    "metadata": { ... }
  },
  ...
]

Use case: Exibir galeria de personagens em página de obra
GET
/api/works/{type}/{workSlug}/characters/{characterId}

Descrição: Retorna informações detalhadas de um personagem específico.

Path Parameters:

    • characterId: ID ou slug do personagem

RESPONSE (200 OK):

{
  "id": "naruto-uzumaki",
  "slug": "naruto-uzumaki",
  "name": "Naruto Uzumaki",
  "alt_names": ["うずまき ナルト"],
  "role": "protagonist",
  "description": "Naruto is a young ninja...",
  "images": [
    {
      "type": "cover",
      "url": "https://cdn.myanimelist.net/...",
      "width": 225,
      "height": 350
    }
  ],
  "metadata": {
    "age": "16",
    "birthday": "October 10",
    "height": "166 cm"
  }
}

Status codes:

• 200 - Personagem encontrado

• 404 - Personagem não encontrado



⚡ Busca Fuzzy (Inteligente)
GET
/api/characters/search
⚡ FUZZY⭐ RECOMENDADO

🎯 Busca inteligente de personagens com tolerância a erros ortográficos, nomes parciais, variações e acentos. Usa o algoritmo de Levenshtein para calcular similaridade e retornar os melhores matches.

Query Parameters:

    • q *obrigatório: termo de busca (mínimo 2 caracteres)
    • type (opcional): anime | manga | game
    • limit (opcional): max resultados (padrão: 20, máx: 100)
    • threshold (opcional): similaridade mínima 0-1 (padrão: 0.4)

EXEMPLOS:

// Busca básica
fetch('/api/characters/search?q=goku&limit=10')
  .then(res => res.json())
  .then(data => {
    console.log(`Encontrados: ${data.total} personagens`);
    data.results.forEach(char => {
      console.log(`${char.name} - Score: ${char._searchScore.toFixed(2)}`);
      console.log(`  Obra: ${char.work.title} (${char.work.type})`);
      console.log(`  Match: ${char._matchType}`);
    });
  });

// Com typo → ainda funciona!
fetch('/api/characters/search?q=goko&limit=5')
// Retorna "Goku" com score alto

// Filtrar por tipo
fetch('/api/characters/search?q=naruto&type=anime')

// Busca rigorosa (threshold alto)
fetch('/api/characters/search?q=edward&threshold=0.7')

// Nome parcial
fetch('/api/characters/search?q=uzumaki')
// Retorna "Naruto Uzumaki", "Kushina Uzumaki", etc.

RESPONSE STRUCTURE:

{
  "query": "goko",
  "total": 3,
  "threshold": 0.4,
  "results": [
    {
      "id": "goku",
      "name": "Son Goku",
      "alt_names": ["孫悟空", "Kakarot"],
      "role": "protagonist",
      "images": [...],
      "work": {
        "id": "dragon-ball",
        "slug": "dragon-ball",
        "type": "anime",
        "title": "Dragon Ball",
        "cover_image": "https://..."
      },
      "_searchScore": 0.92,
      "_matchType": "fuzzy"
    },
    ...
  ]
}

✨ Funcionalidades:

Tipos de Match:

    • exact: match perfeito (score 1.0)
    • contains: substring (score 0.95)
    • startsWith: começa com (score 0.9)
    • partialWord: palavra parcial
    • fuzzy: similaridade Levenshtein

Tolerância:

    • Erros ortográficos
    • Acentos e caracteres especiais
    • Maiúsculas/minúsculas
    • Ordem de palavras
    • Nomes alternativos (alt_names)

Use cases:

• Barra de busca com autocompletar

• "Você quis dizer..." (sugestões)

• Busca por nome parcial (primeiro/último nome)

• Correção automática de typos





🎲 Personagens Aleatórios
GET
/api/characters/random
🎲 RANDOM

Descrição: Retorna personagens aleatórios da database. Perfeito para descoberta, features de "personagem do dia" ou recomendações surpresa.

Query Parameters:

    • n (opcional): quantidade (padrão: 1, máx: 50)
    • type (opcional): anime | manga | game
    • workType + work (opcional): filtrar por obra específica
    • weighted (opcional): true | false — quando false a seleção é uniforme; padrão: true (usa probabilidades ponderadas por rarity e rank)

EXEMPLOS:

// Um personagem aleatório de qualquer tipo
fetch('/api/characters/random')

// 5 personagens aleatórios de anime
fetch('/api/characters/random?type=anime&n=5')

// 10 personagens de games
fetch('/api/characters/random?type=game&n=10')

// 3 personagens de uma obra específica
fetch('/api/characters/random?workType=anime&work=naruto&n=3')

// Mais importante o wheighted=true para retornar de acordo com raridade
fetch('/api/characters/random?weighted=true&n=1')

// RESPONSE:
{
  "count": 3,
  "characters": [
    {
      "id": "...",
      "name": "...",
      "images": [...],
      "work": {
        "type": "anime",
        "slug": "naruto"
      }
    },
    ...
  ]
}

exemplo:

{
  "count": 3,
  "characters": [
    {
      "id": "shouko-nishimiya",
      "name": "Shouko Nishimiya",
      "workId": "a-silent-voice",
      "workTitle": "A Silent Voice",
      "workType": "anime",
      "role": "protagonist",
      "score": 97.91,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b80243-RzxE51iUU5eq.png",
      "rank": 31,
      "work": {
        "type": "anime",
        "slug": "a-silent-voice"
      },
      "weight": 0.008980265101338746,
      "pullChance": 0.004937129104015126
    },
    {
      "id": "mouseman",
      "name": "Mouseman",
      "workId": "one-piece",
      "workTitle": "One Piece",
      "workType": "manga",
      "role": "supporting",
      "score": 34.17,
      "rarity": "common",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b127900-sYnzRTsvGN0w.png",
      "rank": 15445,
      "work": {
        "type": "manga",
        "slug": "one-piece"
      },
      "weight": 0.01609296398437917,
      "pullChance": 0.00884751618805786
    },
    {
      "id": "meimei",
      "name": "Meimei",
      "workId": "the-apothecary-diaries",
      "workTitle": "The Apothecary Diaries",
      "workType": "manga",
      "role": "supporting",
      "score": 46.89,
      "rarity": "uncommon",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b244319-UtvzNJwwo7bD.jpg",
      "rank": 7899,
      "work": {
        "type": "manga",
        "slug": "the-apothecary-diaries"
      },
      "weight": 0.013501909389383936,
      "pullChance": 0.007423018034975938
    }
  ],
  "method": "weighted"
}



💡 Use Cases:

    • "Personagem do dia" na homepage
    • Carrossel de descoberta de personagens
    • Recomendações aleatórias
    • Easter eggs / surpresas
    • Placeholders para mockups




🏆 Ranking de Personagens
GET
/api/ranking
🏆 RANKING

Descrição: Retorna o ranking global de personagens ordenado por score. O score é calculado com base na popularidade da obra (40%), score médio (30%) e papel do personagem (30%).

📌 PARÂMETROS DE QUERY:
page
Número da página (padrão: 1)
Ex: ?page=2
limit
Personagens por página (padrão: 50)
Ex: ?limit=100
rarity
Filtrar por raridade
Valores: legendary, epic, rare, uncommon, common
type
Filtrar por tipo de obra
Valores: anime, manga, game

💎 SISTEMA DE RARIDADES:
⭐
Lendário
Top 5%
💎
Épico
Top 20%
💠
Raro
Top 45%
🔹
Incomum
Top 70%
○
Comum
Resto

RESPONSE STRUCTURE:

{
  "generated_at": "2025-12-28T...",
  "total_characters": 18610,
  "distribution": {
    "legendary": 930,
    "epic": 3722,
    "rare": 4651,
    "uncommon": 4651,
    "common": 4656
  },
  "page": 1,
  "limit": 50,
  "total_pages": 373,
  "characters": [
    {
      "rank": 1,
      "id": "eren-yeager",
      "name": "Eren Yeager",
      "workId": "attack-on-titan",
      "workTitle": "Attack on Titan",
      "workType": "anime",
      "role": "protagonist",
      "score": 97.21,
      "rarity": "legendary",
      "image": "https://..."
    }
  ]
}

📝 EXEMPLOS DE USO:

/api/ranking

Top 50 personagens

/api/ranking?rarity=legendary&limit=100

Todos lendários (100 por página)

/api/ranking?type=anime&page=2

Ranking só de anime, página 2

📐 FÓRMULA DO SCORE:

Score =

Popularidade × 0.4 +

Score Médio × 0.3 +

Multiplicador de Role × 0.3

Role Multipliers:

Protagonist: 1.0 | Antagonist: 0.9

Deuteragonist: 0.85 | Supporting: 0.5

Status codes: 200 OK, 404 Ranking não encontrado, 500 Erro
Status:200

{
  "generated_at": "2025-12-29T17:17:49.929Z",
  "total_characters": 16300,
  "distribution": {
    "legendary": 817,
    "epic": 2478,
    "rare": 4044,
    "uncommon": 4139,
    "common": 4822
  },
  "page": 1,
  "limit": 10,
  "total_pages": 1630,
  "characters": [
    {
      "id": "eren-yeager",
      "name": "Eren Yeager",
      "workId": "attack-on-titan",
      "workTitle": "Attack on Titan",
      "workType": "anime",
      "role": "protagonist",
      "score": 111.79,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg",
      "rank": 1
    },
    {
      "id": "mikasa-ackerman",
      "name": "Mikasa Ackerman",
      "workId": "attack-on-titan",
      "workTitle": "Attack on Titan",
      "workType": "anime",
      "role": "protagonist",
      "score": 111.79,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png",
      "rank": 2
    },
    {
      "id": "armin-arlert",
      "name": "Armin Arlert",
      "workId": "attack-on-titan",
      "workTitle": "Attack on Titan",
      "workType": "anime",
      "role": "protagonist",
      "score": 111.79,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b46494-g7xYYuBtYPnO.png",
      "rank": 3
    },
    {
      "id": "tanjirou-kamado",
      "name": "Tanjirou Kamado",
      "workId": "demon-slayer-kimetsu-no-yaiba",
      "workTitle": "Demon Slayer: Kimetsu no Yaiba",
      "workType": "anime",
      "role": "protagonist",
      "score": 108.26,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTNEc1nRIv68.png",
      "rank": 4
    },
    {
      "id": "nezuko-kamado",
      "name": "Nezuko Kamado",
      "workId": "demon-slayer-kimetsu-no-yaiba",
      "workTitle": "Demon Slayer: Kimetsu no Yaiba",
      "workType": "anime",
      "role": "protagonist",
      "score": 108.26,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b127518-NRlq1CQ1v1ro.png",
      "rank": 5
    },
    {
      "id": "inosuke-hashibira",
      "name": "Inosuke Hashibira",
      "workId": "demon-slayer-kimetsu-no-yaiba",
      "workTitle": "Demon Slayer: Kimetsu no Yaiba",
      "workType": "anime",
      "role": "protagonist",
      "score": 108.26,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/n129130-SJC0Kn1DU39E.jpg",
      "rank": 6
    },
    {
      "id": "zenitsu-agatsuma",
      "name": "Zenitsu Agatsuma",
      "workId": "demon-slayer-kimetsu-no-yaiba",
      "workTitle": "Demon Slayer: Kimetsu no Yaiba",
      "workType": "anime",
      "role": "protagonist",
      "score": 108.26,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b129131-FZrQ7lSlxmEr.png",
      "rank": 7
    },
    {
      "id": "l-lawliet",
      "name": "L Lawliet",
      "workId": "death-note",
      "workTitle": "Death Note",
      "workType": "anime",
      "role": "protagonist",
      "score": 107.28,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b71-1W4panC53vfs.png",
      "rank": 8
    },
    {
      "id": "ryuk",
      "name": "Ryuk",
      "workId": "death-note",
      "workTitle": "Death Note",
      "workType": "anime",
      "role": "protagonist",
      "score": 107.28,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b75-IkEpzO21LgFy.jpg",
      "rank": 9
    },
    {
      "id": "light-yagami",
      "name": "Light Yagami",
      "workId": "death-note",
      "workTitle": "Death Note",
      "workType": "anime",
      "role": "protagonist",
      "score": 107.28,
      "rarity": "legendary",
      "image": "https://s4.anilist.co/file/anilistcdn/character/large/b80-26EhwSsSqQ50.png",
      "rank": 10
    }
  ]
}

Role para ver mais conteúdo