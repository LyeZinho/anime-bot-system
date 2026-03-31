<script lang="ts">
  import CharacterCard from '$lib/components/CharacterCard.svelte';
  import StarRating from '$lib/components/StarRating.svelte';
  import { enhance } from '$app/forms';
  
  let { data } = $props();
  
  const char = $derived(data.character);
  const charId = $derived(char.anilistId || char.id);

  // Action feedback state
  let collectionState = $state<'idle' | 'loading' | 'added'>('idle');
  let favoriteState = $state<'idle' | 'loading' | 'added'>('idle');
  let shareState = $state<'idle' | 'copied'>('idle');

  function handleShare() {
    const url = `${window.location.origin}/characters/${charId}`;
    navigator.clipboard.writeText(url).then(() => {
      shareState = 'copied';
      setTimeout(() => (shareState = 'idle'), 2000);
    });
  }
</script>

<svelte:head>
  <title>{char.name} - Nazuna Bot</title>
</svelte:head>

<main class="character-detail">
  <a href="/characters" class="back-link">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
    BACK TO CHARACTERS
  </a>
  
  <div class="detail-grid">
    <!-- Character Image -->
    <div class="image-section">
      <div class="image-wrapper neobrutal-card rotate-1">
        <img 
          src={char.imageUrl || char.image || `https://picsum.photos/seed/${char.name}/600/800`}
          alt={char.name}
        />
      </div>
      <div class="image-shadow"></div>
    </div>
    
    <!-- Character Info -->
    <div class="info-section">
      <div class="badges">
        <div class="badge badge-rank">RANK #{data.metrics?.globalRank || char.rank || '?'}</div>
        <div class="badge badge-rarity">{char.rarity || 'Common'}</div>
      </div>
      
      <h1 class="character-name">{char.name}</h1>
      <p class="character-series">{char.series || char.work?.title || 'Unknown Series'}</p>
      
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span class="stat-label">Claims</span>
          <span class="stat-value">{data.metrics?.totalClaims?.toLocaleString() || (char.views?.toLocaleString() || '0')}</span>
        </div>
        <div class="stat-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span class="stat-label">Score</span>
          <span class="stat-value">{Number(char.score || (typeof char.rating === 'number' ? char.rating : char.rating?.averageRating) || 0).toFixed(1)}</span>
        </div>
        <div class="stat-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="stat-label">Favorites</span>
          <span class="stat-value">{data.metrics?.totalFavorites?.toLocaleString() || '12.4k'}</span>
        </div>
        <div class="stat-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          <span class="stat-label">Popularity</span>
          <span class="stat-value">{(char.popularity || 0).toLocaleString()}</span>
        </div>
      </div>
      
      <!-- Rating Section -->
      <div class="rating-section">
        <div class="rating-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3>Rate this character</h3>
        </div>
        <div class="rating-row">
          <StarRating 
            initialRating={Math.round(char.score || 0)} 
            characterId={charId}
            userId="mock-user-123"
          />
          <span class="rating-hint">Click to rate 1–5 stars</span>
        </div>
      </div>
      
      <!-- Description -->
      {#if char.description}
        <div class="description-card neobrutal-card">
          <h3>Description</h3>
          <p>{char.description}</p>
        </div>
      {/if}
      
      <!-- Details -->
      <div class="details-grid">
        {#if char.gender}
          <div class="detail-item">
            <span class="detail-label">Gender</span>
            <span class="detail-value">{char.gender}</span>
          </div>
        {/if}
        {#if char.role}
          <div class="detail-item">
            <span class="detail-label">Role</span>
            <span class="detail-value">{char.role}</span>
          </div>
        {/if}
        {#if char.hairColor}
          <div class="detail-item">
            <span class="detail-label">Hair Color</span>
            <span class="detail-value">{char.hairColor}</span>
          </div>
        {/if}
      </div>
      
      <!-- Volume Chart Preview -->
      {#if data.volume && data.volume.length > 0}
        <div class="chart-preview neobrutal-card">
          <h3>Monthly Claims</h3>
          <div class="mini-chart">
            {#each data.volume as month}
              <div class="chart-bar" style="height: {Math.min((month.count / 500) * 100, 100)}%"></div>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- Actions -->
      <div class="action-buttons">
        <!-- Add to Collection -->
        <form method="POST" action="?/addToCollection" use:enhance={() => {
          collectionState = 'loading';
          return async ({ result, update }) => {
            if (result.type === 'success') {
              collectionState = 'added';
            } else {
              collectionState = 'idle';
            }
            await update();
            if (collectionState === 'added') {
              setTimeout(() => (collectionState = 'idle'), 3000);
            }
          };
        }}>
          <input type="hidden" name="serverId" value="mock-server-456" />
          <button 
            type="submit" 
            class="btn-collect"
            class:btn-added={collectionState === 'added'}
            disabled={collectionState === 'loading' || collectionState === 'added'}
          >
            {#if collectionState === 'loading'}
              <div class="spinner-sm"></div>
            {:else if collectionState === 'added'}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              ADDED!
            {:else}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              ADD TO COLLECTION
            {/if}
          </button>
        </form>

        <!-- Add to Favorites -->
        <form method="POST" action="?/addToFavorites" use:enhance={() => {
          favoriteState = 'loading';
          return async ({ result, update }) => {
            if (result.type === 'success') {
              favoriteState = 'added';
            } else {
              favoriteState = 'idle';
            }
            await update();
            if (favoriteState === 'added') {
              setTimeout(() => (favoriteState = 'idle'), 3000);
            }
          };
        }}>
          <button 
            type="submit" 
            class="btn-favorite"
            class:btn-added={favoriteState === 'added'}
            disabled={favoriteState === 'loading' || favoriteState === 'added'}
          >
            {#if favoriteState === 'loading'}
              <div class="spinner-sm"></div>
            {:else if favoriteState === 'added'}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              SAVED!
            {:else}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              ADD TO FAVORITES
            {/if}
          </button>
        </form>

        <!-- Share -->
        <button 
          class="btn-share"
          class:btn-copied={shareState === 'copied'}
          onclick={handleShare}
        >
          {#if shareState === 'copied'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            COPIED!
          {:else}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            SHARE
          {/if}
        </button>
      </div>

      {#if data.source === 'mock'}
        <div class="demo-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Demo mode — action results are simulated. Connect to backend for real data.
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Related Characters -->
  {#if data.related && data.related.length > 0}
    <section class="related-section">
      <div class="related-header">
        <h2>Related Characters</h2>
        <a href="/characters" class="see-all">
          VIEW ALL
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      </div>
      
      <div class="related-grid">
        {#each data.related as relatedChar, index (relatedChar.id ?? relatedChar.anilistId ?? `related-${index}`)}
          <a href="/characters/{relatedChar.id ?? relatedChar.anilistId ?? index}" class="related-card neobrutal-card">
            <div class="related-image">
              <img 
                src={relatedChar.imageUrl || relatedChar.image || `https://picsum.photos/seed/${relatedChar.name}/600/800`}
                alt={relatedChar.name}
              />
            </div>
            <div class="related-info">
              <h4>{relatedChar.name}</h4>
              <p>{relatedChar.series || relatedChar.work?.title}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  .character-detail {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }
  
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: var(--accent-purple);
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.1em;
  }
  
  .back-link:hover {
    text-decoration: underline;
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
  }
  
  @media (min-width: 1024px) {
    .detail-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .image-section {
    position: relative;
  }
  
  .image-wrapper {
    position: relative;
    z-index: 10;
    padding: 8px;
    background: var(--accent-purple);
    max-width: 400px;
  }
  
  .image-wrapper img {
    width: 100%;
    height: auto;
    border: var(--border-brutal);
  }
  
  .image-shadow {
    position: absolute;
    inset: 0;
    background: var(--accent-pink);
    border: var(--border-brutal);
    transform: rotate(-3deg);
    z-index: -1;
    max-width: 400px;
  }
  
  .rotate-1 {
    transform: rotate(1deg);
  }
  
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .badges {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  
  .badge {
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #000;
  }
  
  .badge-rank {
    background: var(--accent-yellow);
    color: #000;
  }
  
  .badge-rarity {
    background: var(--accent-pink);
    color: #000;
  }
  
  .character-name {
    font-size: clamp(36px, 6vw, 64px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 1;
  }
  
  .character-series {
    font-size: 20px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent-purple);
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  @media (min-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  .stat-item {
    background: var(--bg-secondary);
    border: 2px solid #000;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .stat-item :global(svg) {
    color: var(--accent-purple);
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
  
  .rating-section {
    padding: 20px 24px;
    background: var(--bg-secondary);
    border: 2px solid #000;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .rating-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--accent-yellow);
  }
  
  .rating-header h3 {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }
  
  .rating-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .rating-hint {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
  }
  
  .description-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .description-card h3 {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .description-card p {
    color: var(--text-secondary);
    line-height: 1.7;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .detail-label {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: var(--text-secondary);
  }
  
  .detail-value {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .chart-preview {
    padding: 24px;
  }
  
  .chart-preview h3 {
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  
  .mini-chart {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 60px;
  }
  
  .chart-bar {
    flex: 1;
    background: var(--accent-pink);
    border: 2px solid #000;
    min-height: 4px;
  }
  
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .btn-collect {
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
  
  .btn-collect:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-brutal-lg);
  }
  
  .btn-share {
    display: inline-flex;
    align-items: center;
    gap: 8px;
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
  
  .btn-share:hover {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  
  .btn-favorite {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 24px;
    background: var(--accent-pink);
    color: #000;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    transition: all var(--transition-fast);
  }
  
  .btn-favorite:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-brutal-lg);
  }
  
  .btn-added, .btn-copied {
    background: var(--accent-green) !important;
    color: #000 !important;
  }
  
  .btn-collect:disabled, .btn-favorite:disabled, .btn-share:disabled {
    cursor: not-allowed;
  }
  
  .btn-share.btn-copied {
    box-shadow: var(--shadow-brutal);
  }
  
  .spinner-sm {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(0, 0, 0, 0.3);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .demo-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(255, 212, 0, 0.1);
    border: 1px solid rgba(255, 212, 0, 0.3);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent-yellow);
  }
  
  .related-section {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding-top: 48px;
    border-top: var(--border-brutal);
  }
  
  .related-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  @media (min-width: 768px) {
    .related-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .related-header h2 {
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
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
  
  .related-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 32px;
  }
  
  @media (min-width: 640px) {
    .related-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .related-card {
    overflow: hidden;
  }
  
  .related-card:hover .related-image img {
    transform: scale(1.1);
  }
  
  .related-image {
    aspect-ratio: 3/4;
    overflow: hidden;
    border-bottom: var(--border-brutal);
  }
  
  .related-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .related-info {
    padding: 16px;
  }
  
  .related-info h4 {
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .related-info p {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
