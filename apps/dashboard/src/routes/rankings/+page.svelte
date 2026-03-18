<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>Rankings - Nazuna Bot</title>
</svelte:head>

<main class="rankings-page">
  <header class="page-header">
    <h1>Rankings</h1>
    <p class="page-subtitle">The most popular and top-rated characters</p>
  </header>
  
  <!-- Tabs -->
  <div class="tabs">
    <a 
      href="/rankings?type=popularity&page=1" 
      class="tab"
      class:active={data.currentType === 'popularity'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      Popularity
    </a>
    <a 
      href="/rankings?type=ratings&page=1" 
      class="tab"
      class:active={data.currentType === 'ratings'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      Ratings
    </a>
    <a 
      href="/rankings?type=combined&page=1" 
      class="tab"
      class:active={data.currentType === 'combined'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
      Combined
    </a>
  </div>
  
  {#if data.source === 'mock'}
    <div class="mock-banner">
      <span class="mock-badge">DEMO DATA</span>
      <span>API unavailable. Showing mock rankings.</span>
    </div>
  {/if}
  
  <!-- Rankings List -->
  <div class="rankings-list">
    {#each data.rankings as char, index (char.id ?? char.anilistId ?? `rank-${index}`)}
      <div class="ranking-item neobrutal-card">
        <div class="rank" class:top-rank={index < 3}>#{(data.pagination.page - 1) * data.pagination.limit + index + 1}</div>
        
        <div class="item-image">
          <img 
            src={char.imageUrl || char.image || `https://picsum.photos/seed/${char.name}/600/800`}
            alt={char.name}
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div class="item-info">
          <h3>{char.name}</h3>
          <p>{char.series || char.work?.title || 'Unknown'}</p>
        </div>
        
        <div class="item-stats">
          <div class="stat">
            <span class="stat-label">Score</span>
            <span class="stat-value">{(char.score || char.rating || 0).toFixed(1)}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Popularity</span>
            <span class="stat-value">{(char.popularity || 0).toLocaleString()}</span>
          </div>
        </div>
        
        <a href="/characters/{char.id || char.anilistId}" class="view-btn">
          VIEW
        </a>
      </div>
    {/each}
  </div>
  
  <!-- Pagination -->
  {#if data.pagination.totalPages > 1}
    <div class="pagination">
      {#if data.pagination.page > 1}
        <a href="/rankings?type={data.currentType}&page={data.pagination.page - 1}" class="page-btn">
          Previous
        </a>
      {/if}
      
      <span class="page-info">
        Page {data.pagination.page} of {data.pagination.totalPages}
      </span>
      
      {#if data.pagination.page < data.pagination.totalPages}
        <a href="/rankings?type={data.currentType}&page={data.pagination.page + 1}" class="page-btn">
          Next
        </a>
      {/if}
    </div>
  {/if}
</main>

<style>
  .rankings-page {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }
  
  .page-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .page-header h1 {
    font-size: 48px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .page-subtitle {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-secondary);
  }
  
  .mock-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border: 2px solid var(--accent-yellow);
  }
  
  .mock-badge {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--accent-yellow);
    color: #000;
    padding: 2px 6px;
    border: 1px solid #000;
  }
  
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding-bottom: 32px;
    border-bottom: var(--border-brutal);
  }
  
  .tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    font-weight: 900;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    border: var(--border-brutal);
    background: transparent;
    color: white;
    text-decoration: none;
    transition: all var(--transition-fast);
  }
  
  .tab:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .tab.active {
    background: var(--accent-purple);
    color: #000;
    box-shadow: var(--shadow-brutal);
  }
  
  .rankings-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .ranking-item {
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
    align-items: center;
  }
  
  @media (min-width: 768px) {
    .ranking-item {
      flex-direction: row;
    }
  }
  
  .rank {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: var(--text-secondary);
    width: 64px;
    text-align: center;
  }
  
  .rank.top-rank {
    color: var(--accent-yellow);
  }
  
  .item-image {
    width: 96px;
    height: 96px;
    border: var(--border-brutal);
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .item-info {
    flex: 1;
    text-align: center;
  }
  
  @media (min-width: 768px) {
    .item-info {
      text-align: left;
    }
  }
  
  .item-info h3 {
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .item-info p {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent-purple);
  }
  
  .item-stats {
    display: flex;
    gap: 32px;
  }
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  
  .stat-label {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: var(--text-secondary);
  }
  
  .stat-value {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.02em;
  }
  
  .view-btn {
    padding: 8px 24px;
    background: var(--accent-blue);
    color: #000;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    transition: all var(--transition-fast);
    text-decoration: none;
  }
  
  .view-btn:hover {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 32px 0;
  }
  
  .page-btn {
    padding: 12px 24px;
    background: var(--bg-card);
    border: var(--border-brutal);
    border-radius: var(--radius-md);
    font-weight: 700;
    color: var(--text-primary);
    text-decoration: none;
    box-shadow: var(--shadow-brutal-sm);
    transition: all var(--transition-fast);
  }
  
  .page-btn:hover {
    border-color: var(--accent-blue);
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-brutal);
  }
  
  .page-info {
    font-size: 14px;
    color: var(--text-secondary);
  }
</style>
