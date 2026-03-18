# Nazuna Bot - Estrutura do Frontend

## Visão Geral

Este documento descreve a estrutura e funcionamento do frontend do Nazuna Bot, um sistema de coleta de personagens de anime. O site permite aos usuários explorar personagens, visualizar rankings, avaliar personagens e gerenciar suas coleções pessoais.

**Stack Tecnológico:**
- **Framework**: SvelteKit
- **Linguagem**: TypeScript
- **Estilização**: CSS Custom Properties (design brutalista)
- **API**: REST API externa (porta 3001)
- **Autenticação**: Discord OAuth2

---

## Estrutura de Arquivos

```
apps/dashboard/
├── src/
│   ├── routes/
│   │   ├── +page.svelte              # Home (página inicial)
│   │   ├── +page.server.ts            # Dados do servidor para Home
│   │   ├── +layout.svelte             # Layout principal
│   │   ├── +layout.server.ts          # Layout server (auth)
│   │   │
│   │   ├── characters/
│   │   │   ├── +page.svelte           # Lista de personagens com filtros
│   │   │   └── [id]/
│   │   │       └── +page.svelte       # Detalhes de um personagem
│   │   │
│   │   ├── rankings/
│   │   │   ├── +page.svelte           # Rankings (popularidade, ratings)
│   │   │   └── +page.server.ts        # Dados dos rankings
│   │   │
│   │   ├── user/
│   │   │   └── [id]/
│   │   │       └── +page.svelte       # Perfil do usuário
│   │   │
│   │   └── auth/
│   │       └── discord/
│   │           └── callback/
│   │               └── +page.server.ts # Callback OAuth Discord
│   │
│   ├── lib/
│   │   ├── api.ts                     # Cliente API (endpoints)
│   │   │
│   │   └── components/
│   │       ├── Navigation.svelte       # Navbar fixa
│   │       ├── CharacterCard.svelte    # Card de personagem
│   │       ├── CharacterGrid.svelte    # Grid de personagens
│   │       ├── FilterPanel.svelte      # Painel de filtros
│   │       ├── StatCard.svelte        # Cartão de estatística
│   │       ├── StarRating.svelte      # Componente de rating
│   │       └── BackgroundSVG.svelte   # Background animado
│   │
│   ├── app.css                        # Estilos globais
│   └── app.html                       # Template HTML
│
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Páginas e Funcionalidades

### 1. Home (`/`)

**Arquivo:** `routes/+page.svelte`

**Funcionalidades:**
- Hero section com tagline "Collect Your Waifus"
- Cards flutuantes animados
- Estatísticas (Total Characters, Active Users, Servers, Collections)
- Lista dos top 4 personagens

**Dados carregados do servidor:**
- `stats`: totalCharacters, activeUsers, servers, collections
- `topCharacters`: array dos 4 personagens mais populares

**Links:**
- Botão "Explore Characters" → `/characters`
- Botão "View Rankings" → `/rankings`

---

### 2. Characters (`/characters`)

**Arquivo:** `routes/characters/+page.svelte`

**Funcionalidades:**
- Busca por nome
- Filtros por:
  - Gênero
  - Personalidade
  - Cor do cabelo
- Grid de personagens com paginação

**Componentes utilizados:**
- `FilterPanel`: Sidebar com controles de filtro
- `CharacterGrid`: Grid responsivo de personagens

---

### 3. Character Detail (`/characters/[id]`)

**Arquivo:** `routes/characters/[id]/+page.svelte`

**Funcionalidades:**
- Dados completos do personagem
- Imagem
- Série/origem
- Métricas (views, ratings)
- Personagens relacionados
- Histórico de volume

---

### 4. Rankings (`/rankings`)

**Arquivo:** `routes/rankings/+page.svelte`

**Funcionalidades:**
- Abas: Popularity | Ratings | Combined
- Lista de personagens ranqueados
- Paginação
- Exibição de rank (#1, #2, etc.)

**Tipos de ranking:**
- `popularity`: por popularidade
- `ratings`: por avaliação média
- `combined`: combinação de ambos

---

### 5. User Profile (`/user/[id]`)

**Arquivo:** `routes/user/[id]/+page.svelte`

**Funcionalidades:**
- Dados do usuário
- Personagens favoritos
- Coleção pessoal
- Histórico de interações

---

### 6. Autenticação (`/auth/discord/callback`)

**Arquivo:** `routes/auth/discord/callback/+page.server.ts`

**Funcionalidades:**
- OAuth2 Flow com Discord
- Criação de sessão
- Redirecionamento para perfil

---

## Layout Principal

**Arquivo:** `routes/+layout.svelte`

```
┌─────────────────────────────────────────────┐
│  [Logo]  NazunaBot              [Login]     │  ← Navigation (fixed)
├─────────────────────────────────────────────┤
│                                             │
│              <Page Content>                │  ← Main content
│                                             │
└─────────────────────────────────────────────┘
```

**Componentes do Layout:**
- `BackgroundSVG`: Background com padrões SVG animados
- `Navigation`: Navbar fixa com links e login
- `<main>`: Área de conteúdo com padding

---

## API Cliente

**Arquivo:** `lib/api.ts`

Base URL: `http://localhost:3001/api/v1` (configurável via `PUBLIC_API_URL`)

### Endpoints Disponíveis:

```typescript
// Characters
api.characters.list(params)           // GET /characters
api.characters.get(id)                // GET /characters/:id
api.characters.getMetrics(id)         // GET /characters/:id/metrics
api.characters.getRelated(id, limit)  // GET /characters/:id/related
api.characters.getVolume(id, months)  // GET /characters/:id/volume
api.characters.random(filters)        // GET /characters/random

// Rankings
api.rankings.popularity(page, limit)  // GET /rankings/popularity
api.rankings.ratings(page, limit)     // GET /rankings/ratings
api.rankings.combined(page, limit)    // GET /rankings/combined

// Ratings
api.ratings.get(characterId)          // GET /ratings/character/:id
api.ratings.submit(userId, charId, r)  // POST /ratings

// Favorites
api.favorites.list(userId)             // GET /favorites/:userId
api.favorites.add(userId, charId)     // POST /favorites
api.favorites.remove(userId, charId)  // DELETE /favorites/:charId

// Users
api.users.get(userId)                 // GET /users/:userId
```

---

## Sistema de Design (CSS)

**Arquivo:** `app.css`

### Variáveis CSS:

```css
/* Cores de Fundo */
--bg-primary: #0a0a0f
--bg-secondary: #111118
--bg-card: #18181f
--bg-hover: #222230

/* Cores de Texto */
--text-primary: #e8e8ef
--text-secondary: #9999aa
--text-muted: #666677

/* Cores de Accent */
--accent-blue: #4d8eff
--accent-purple: #a855f7
--accent-pink: #f43f7a
--accent-cyan: #22d3ee
--accent-yellow: #facc15
--accent-green: #4ade80

/* Bordas e Sombras (Estilo Brutalista) */
--border-brutal: 3px solid #555566
--shadow-brutal: 4px 4px 0 #000
--shadow-brutal-lg: 6px 6px 0 #000
```

### Classes Utilitárias:

```css
/* Animações */
.animate-fade-in    /* Fade in com translate */
.animate-slide-up   /* Slide up animation */
.animate-scale-in   /* Scale in animation */

/* Componentes */
.neobrutal-card     /* Card com estilo brutalista */
.neobrutal-button   /* Botão brutalista */
.gradient-text      /* Texto com gradiente */
.neobrutal-tag      /* Tag estilo brutalista */
```

---

## Componentes

### Navigation.svelte

Navbar fixa com:
- Logo (NazunaBot)
- Links: Home, Characters, Rankings, Profile
- Botão "Login with Discord"

### CharacterCard.svelte

Card de personagem mostrando:
- Imagem
- Nome
- Obra de origem
- Rank (opcional)

### CharacterGrid.svelte

Grid responsivo de personagens com:
- Layout automático (minmax 200px)
- Carregamento sob demanda

### FilterPanel.svelte

Sidebar com:
- Campo de busca
- Select para gênero
- Select para personalidade
- Select para cor do cabelo

### StatCard.svelte

Cartão de estatística:
- Ícone
- Label
- Valor

---

## Fluxo de Dados

### Carregamento de Página (SSR)

1. SvelteKit executa `+page.server.ts`
2. Servidor faz fetch à API externa
3. Dados são passados para o componente via `data` prop
4. Componente renderiza

### Exemplo: Home Page

```
/ → +page.server.ts
   ↓
fetch(/api/v1/rankings/combined?page=1&limit=4)
fetch(/api/v1/characters?page=1&limit=50)
   ↓
+page.svelte
   ↓
Render: Hero + Stats + Top Characters
```

---

## Variáveis de Ambiente

```env
PUBLIC_API_URL=http://localhost:3001  # URL da API (opcional)
```

---

## Como Executar

```bash
# Desenvolvimento
cd apps/dashboard
npm run dev

# Build
npm run build

# Preview
npm run preview
```

Acesse: `http://localhost:5173`

---

## Pontos de Extensão

Para refatorar/melhorar o site:

1. **Adicionar cache**: Implementar SvelteKit loaders com cache
2. **SEO**: Adicionar metadados via `<svelte:head>`
3. **Lazy loading**: Images lazy nos CharacterCards
4. **Infinite scroll**: Substituir paginação por scroll infinito
5. **State management**: Svelte stores para filtros globais
6. **Testing**: Adicionar testes com Vitest/Playwright

---

## Dependências Principais

```json
{
  "@sveltejs/kit": "^2.x",
  "svelte": "^5.x",
  "typescript": "^5.x",
  "vite": "^6.x"
}
```
