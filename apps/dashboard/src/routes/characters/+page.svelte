<script lang="ts">
  import CharacterCard from '$lib/components/CharacterCard.svelte';
  
  let { data } = $props();
  
  let search = $state(data.filters.search);
  let rarityFilter = $state(data.filters.rarity);
  let genderFilter = $state(data.filters.gender);
  let hairFilter = $state(data.filters.hairColor);
  let sortBy = $state(data.filters.sortBy);
  let visibleCount = $state(12);
  
  // Client-side filtering as backup when API is unavailable
  const filteredCharacters = $derived.by(() => {
    if (data.source === 'api') {
      return data.characters;
    }
    
    // Client-side filter for mock data
    let filtered = data.characters;
    
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(s) || 
        (c.series?.toLowerCase().includes(s))
      );
    }
    
    if (rarityFilter !== 'All') {
      filtered = filtered.filter(c => c.rarity === rarityFilter);
    }
    
    if (genderFilter !== 'All') {
      filtered = filtered.filter(c => c.gender === genderFilter);
    }
    
    if (hairFilter !== 'All') {
      filtered = filtered.filter(c => c.hairColor === hairFilter);
    }
    
    // Sort
    switch (sortBy) {
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 'views':
        filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        filtered = [...filtered].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    }
    
    return filtered;
  });
  
  const displayedCharacters = $derived(filteredCharacters.slice(0, visibleCount));
  
  const isFiltered = $derived(
    search || rarityFilter !== 'All' || genderFilter !== 'All' || hairFilter !== 'All' || sortBy !== 'rank'
  );
  
  function clearFilters() {
    search = '';
    rarityFilter = 'All';
    genderFilter = 'All';
    hairFilter = 'All';
    sortBy = 'rank';
    visibleCount = 12;
  }
  
  function handleIntersection(entries: IntersectionObserverEntry[]) {
    if (entries[0].isIntersecting && visibleCount < filteredCharacters.length) {
      visibleCount += 12;
    }
  }
  
  $effect(() => {
    visibleCount = 12;
  });
  
  $effect(() => {
    const observer = new IntersectionObserver(handleIntersection, { threshold: 0.1 });
    const target = document.querySelector('.observer-target');
    if (target) observer.observe(target);
    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>Characters - Nazuna Bot</title>
</svelte:head>

<main class="characters-page">
  <header class="page-header">
    <h1>Characters</h1>
    <p class="page-subtitle">Explore and collect your favorite characters</p>
  </header>
  
  <div class="page-content">
    <!-- Sidebar Filters -->
    <aside class="filters-sidebar">
      <div class="filter-card neobrutal-card">
        <!-- Search -->
        <div class="filter-group">
          <span class="filter-label">Search</span>
          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              bind:value={search}
              placeholder="Name or series..."
              class="filter-input"
            />
          </div>
        </div>
        
        <!-- Sort By -->
        <div class="filter-group">
          <span class="filter-label">Sort By</span>
          <select bind:value={sortBy} class="filter-select">
            <option value="rank">Rank (Low to High)</option>
            <option value="name">Name (A-Z)</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="views">Views (High to Low)</option>
          </select>
        </div>
        
        <!-- Rarity -->
        <div class="filter-group">
          <span class="filter-label">Rarity</span>
          <div class="rarity-buttons">
            {#each ['All', 'Common', 'Rare', 'Epic', 'Legendary'] as rarity}
              <button 
                onclick={() => rarityFilter = rarity}
                class="rarity-btn"
                class:active={rarityFilter === rarity}
              >
                {rarity.toUpperCase()}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Gender -->
        <div class="filter-group">
          <span class="filter-label">Gender</span>
          <div class="gender-buttons">
            {#each ['All', 'Female', 'Male', 'Other'] as gender}
              <button 
                onclick={() => genderFilter = gender}
                class="gender-btn"
                class:active={genderFilter === gender}
              >
                {gender.toUpperCase()}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Hair Color -->
        <div class="filter-group">
          <span class="filter-label">Hair Color</span>
          <select bind:value={hairFilter} class="filter-select">
            <option value="All">All Colors</option>
            <option value="Pink">Pink</option>
            <option value="Red">Red</option>
            <option value="Blonde">Blonde</option>
            <option value="Black">Black</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        
        {#if isFiltered}
          <button onclick={clearFilters} class="reset-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Reset All Filters
          </button>
        {/if}
      </div>
    </aside>
    
    <!-- Character Grid -->
    <div class="characters-main">
      <div class="results-info">
        <p>Showing {filteredCharacters.length} characters</p>
        {#if data.source === 'mock'}
          <span class="mock-badge">DEMO DATA</span>
        {/if}
      </div>
      
      {#if filteredCharacters.length > 0}
        <div class="characters-grid">
          {#each displayedCharacters as char, index (char.id ?? char.anilistId ?? `char-${index}`)}
            <CharacterCard 
              id={char.id ?? char.anilistId ?? index}
              name={char.name}
              series={char.series || char.work?.title}
              image={char.imageUrl || char.image}
              rank={char.rank}
              rating={char.score || char.rating || 0}
              rarity={char.rarity || 'Common'}
            />
          {/each}
        </div>
        
        {#if visibleCount < filteredCharacters.length}
          <div class="observer-target loading">
            <div class="spinner"></div>
          </div>
        {/if}
      {:else}
        <div class="no-results neobrutal-card">
          <h3>No characters found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  .characters-page {
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
  
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  @media (min-width: 1024px) {
    .page-content {
      flex-direction: row;
    }
  }
  
  .filters-sidebar {
    width: 100%;
  }
  
  @media (min-width: 1024px) {
    .filters-sidebar {
      width: 288px;
      flex-shrink: 0;
    }
  }
  
  .filter-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  @media (min-width: 1024px) {
    .filter-card {
      position: sticky;
      top: 96px;
    }
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-label {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: var(--text-secondary);
  }
  
  .search-wrapper {
    position: relative;
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }
  
  .filter-input {
    width: 100%;
    padding: 8px 8px 8px 36px;
    font-size: 12px;
    font-weight: 700;
  }
  
  .filter-select {
    width: 100%;
    padding: 8px;
    font-size: 12px;
    font-weight: 700;
    background: var(--bg-primary);
  }
  
  .rarity-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .rarity-btn, .gender-btn {
    padding: 6px 8px;
    font-size: 10px;
    font-weight: 700;
    border: 2px solid #000;
    background: transparent;
    transition: all var(--transition-fast);
  }
  
  .rarity-btn:hover, .gender-btn:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .rarity-btn.active {
    background: var(--accent-purple);
    color: #000;
    box-shadow: 2px 2px 0 #000;
  }
  
  .gender-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .gender-btn.active {
    background: var(--accent-blue);
    color: #000;
    box-shadow: 2px 2px 0 #000;
  }
  
  .reset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: var(--accent-pink);
    background: transparent;
  }
  
  .reset-btn:hover {
    text-decoration: underline;
  }
  
  .characters-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .results-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .results-info p {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
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
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .loading {
    display: flex;
    justify-content: center;
    padding: 40px;
  }
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 4px solid var(--accent-purple);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .no-results {
    text-align: center;
    padding: 80px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .no-results h3 {
    font-size: 20px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .no-results p {
    color: var(--text-secondary);
  }
</style>
