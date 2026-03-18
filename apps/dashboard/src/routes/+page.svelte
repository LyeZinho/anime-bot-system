<script lang="ts">
  import CharacterCard from '$lib/components/CharacterCard.svelte';
  import StatCard from '$lib/components/StatCard.svelte';
  
  let { data } = $props();
  
  const stats = data?.stats ?? { totalCharacters: 0, activeUsers: 0, servers: 0, collections: 0 };
</script>

<svelte:head>
  <title>Nazuna Bot - Home</title>
</svelte:head>

<div class="home">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-tag">Vampire Vibes Only</div>
      
      <h1 class="hero-title">
        Collect Your <br />
        <span class="gradient-text">Waifus</span>
      </h1>
      
      <p class="hero-description">
        The most advanced character collection system. Inspired by the night, built for the bold. Join Nazuna in the ultimate anime hunt.
      </p>
      
      <div class="hero-actions">
        <a href="/characters" class="btn-explore">
          EXPLORE CHARACTERS
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
        <a href="/rankings" class="btn-rankings">
          VIEW RANKINGS
        </a>
      </div>
    </div>
    
    <div class="hero-visual">
      <div class="hero-image-wrapper">
        <div class="hero-image neobrutal-card rotate-3 animate-float">
          <img 
            src="https://images.alphacoders.com/124/1246533.jpg" 
            alt="Nazuna Hero"
            referrerPolicy="no-referrer"
          />
        </div>
        <div class="hero-shadow"></div>
      </div>
    </div>
  </section>
  
  <!-- Stats Grid -->
  <section class="stats-section">
    <StatCard 
      icon='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
      label="Total Characters"
      value={((stats as any)?.totalCharacters ?? 0).toLocaleString()}
      color="var(--accent-blue)"
    />
    <StatCard 
      icon='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
      label="Active Users"
      value={(((stats as any)?.activeUsers ?? 0) / 1000).toFixed(1) + 'k'}
      color="var(--accent-purple)"
    />
    <StatCard 
      icon='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>'
      label="Total Servers"
      value={((stats as any)?.servers ?? 0).toLocaleString()}
      color="var(--accent-pink)"
    />
    <StatCard 
      icon='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
      label="Collections"
      value={(((stats as any)?.collections ?? 0) / 1000000).toFixed(1) + 'M'}
      color="var(--accent-cyan)"
    />
  </section>
  
  <!-- Top Characters -->
  <section class="top-section">
    <div class="section-header">
      <div class="section-title">
        <h2>Popular Right Now</h2>
        <p class="section-subtitle">Top trending characters this week</p>
      </div>
      <a href="/rankings" class="see-all">
        SEE ALL
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </a>
    </div>
    
    <div class="characters-grid">
      {#each data.topCharacters as char (char.id)}
        <CharacterCard 
          id={char.id || char.anilistId}
          name={char.name}
          series={char.series || char.work?.title}
          image={char.imageUrl || char.image}
          rank={char.rank}
          rating={char.score || char.rating || 0}
          rarity={char.rarity || 'Common'}
        />
      {/each}
    </div>
  </section>
  
  <!-- Search Preview -->
  <section class="search-section">
    <div class="search-wrapper">
      <div class="search-row">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <a href="/characters" class="search-input" style="display: block; text-decoration: none;">
            SEARCH FOR A CHARACTER...
          </a>
        </div>
        <a href="/characters" class="filter-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          FILTERS
        </a>
      </div>
    </div>
  </section>
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    gap: 80px;
  }
  
  .hero {
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
    align-items: center;
  }
  
  @media (min-width: 1024px) {
    .hero {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .hero-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .hero-tag {
    display: inline-block;
    background: var(--accent-pink);
    color: #000;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #000;
    width: fit-content;
  }
  
  .hero-title {
    font-size: clamp(48px, 8vw, 80px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    line-height: 0.95;
  }
  
  .hero-description {
    font-size: 18px;
    color: var(--text-secondary);
    font-weight: 500;
    max-width: 480px;
    line-height: 1.6;
  }
  
  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .btn-explore {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    background: var(--accent-purple);
    color: #000;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    transition: all var(--transition-fast);
  }
  
  .btn-explore:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-brutal-lg);
  }
  
  .btn-rankings {
    display: inline-flex;
    align-items: center;
    padding: 16px 24px;
    background: white;
    color: #000;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    transition: all var(--transition-fast);
  }
  
  .btn-rankings:hover {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  
  .hero-visual {
    position: relative;
    display: flex;
    justify-content: center;
  }
  
  .hero-image-wrapper {
    position: relative;
    z-index: 10;
  }
  
  .hero-image {
    padding: 8px;
    background: var(--accent-purple);
    max-width: 400px;
  }
  
  .hero-image img {
    width: 100%;
    height: auto;
    border: var(--border-brutal);
  }
  
  .hero-shadow {
    position: absolute;
    inset: 0;
    background: var(--accent-pink);
    border: var(--border-brutal);
    transform: rotate(-3deg) translate(16px, 16px);
    z-index: -1;
  }
  
  .rotate-3 {
    transform: rotate(3deg);
  }
  
  .stats-section {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 24px;
  }
  
  @media (min-width: 640px) {
    .stats-section {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .stats-section {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .top-section {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .section-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  @media (min-width: 768px) {
    .section-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
    }
  }
  
  .section-title h2 {
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .section-subtitle {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-secondary);
  }
  
  .see-all {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    color: var(--accent-purple);
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.1em;
  }
  
  .see-all:hover {
    text-decoration: underline;
  }
  
  .characters-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 32px;
  }
  
  @media (min-width: 640px) {
    .characters-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .characters-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .search-section {
    background: var(--bg-secondary);
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    padding: 32px;
  }
  
  .search-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .search-row {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  @media (min-width: 768px) {
    .search-row {
      flex-direction: row;
    }
  }
  
  .search-input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    position: absolute;
    left: 16px;
    color: var(--text-secondary);
  }
  
  .search-input {
    width: 100%;
    padding: 16px 16px 16px 48px;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.02em;
    background: var(--bg-primary);
    color: var(--text-secondary);
  }
  
  .filter-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 32px;
    background: white;
    color: #000;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    transition: all var(--transition-fast);
    white-space: nowrap;
  }
  
  .filter-btn:hover {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
</style>
