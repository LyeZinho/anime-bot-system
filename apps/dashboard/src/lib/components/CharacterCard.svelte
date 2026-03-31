<script lang="ts">
  import type { Rarity } from '$lib/types';
  import StarRating from './StarRating.svelte';
  
  interface Props {
    id: string | number;
    name: string;
    series: string;
    image: string;
    rank?: number;
    rating: number;
    rarity: Rarity;
  }
  
  let { id, name, series, image, rank, rating, rarity }: Props = $props();
  
  const rarityClass: Record<Rarity, string> = {
    'Common': 'rarity-common',
    'Rare': 'rarity-rare',
    'Epic': 'rarity-epic',
    'Legendary': 'rarity-legendary'
  };
  
  const displayImage = image || `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800`;
</script>

<div class="character-card neobrutal-card">
  <div class="card-image">
    <img 
      src={displayImage} 
      alt={name}
      loading="lazy"
    />
    
    {#if rank}
      <div class="rank-badge">#{rank}</div>
    {/if}
    
    <div class="rarity-badge {rarityClass[rarity]}">{rarity}</div>
    
    <div class="rating-badge">
      <StarRating initialRating={rating} readOnly />
    </div>
  </div>
  
  <div class="card-content">
    <h3 class="card-name">{name}</h3>
    <p class="card-series">{series}</p>
    
    <div class="card-actions">
      <div class="rate-section">
        <span class="rate-label">RATE THIS:</span>
        <StarRating initialRating={0} characterId={id} />
      </div>
      
      <a href="/characters/{id}" class="view-btn">
        VIEW DETAILS
      </a>
    </div>
  </div>
</div>

<style>
  .character-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }
  
  .card-image {
    position: relative;
    aspect-ratio: 3/4;
    overflow: hidden;
    border-bottom: var(--border-brutal);
  }
  
  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .character-card:hover .card-image img {
    transform: scale(1.1);
  }
  
  .rank-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: var(--accent-yellow);
    color: #000;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 900;
    border: 2px solid #000;
    box-shadow: 2px 2px 0 #000;
  }
  
  .rarity-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 2px solid #000;
    box-shadow: 2px 2px 0 #000;
  }
  
  .rating-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: var(--bg-card);
    padding: 4px 8px;
    border: 2px solid #000;
    box-shadow: 2px 2px 0 #000;
  }
  
  .card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  
  .card-name {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  
  .card-series {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 16px;
  }
  
  .card-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .rate-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.2);
    padding: 8px;
    border: 2px solid #000;
  }
  
  .rate-label {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
  }
  
  .view-btn {
    display: block;
    width: 100%;
    text-align: center;
    padding: 8px;
    background: var(--accent-blue);
    color: #000;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #000;
    transition: all var(--transition-fast);
  }
  
  .view-btn:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0 #000;
  }
</style>
