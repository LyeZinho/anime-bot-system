<script lang="ts">
  import CharacterCard from '$lib/components/CharacterCard.svelte';
  
  let { data } = $props();
  
  const { user, collection, favorites, activities } = $derived(data);
</script>

<svelte:head>
  <title>Profile - Nazuna Bot</title>
</svelte:head>

<main class="profile-page">
  <!-- Profile Header -->
  <section class="profile-header neobrutal-card">
    <div class="avatar">
      <img 
        src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Nazuna'}`}
        alt="User Avatar"
      />
    </div>
    
    <div class="profile-info">
      <div class="profile-name">
        <h1>{user?.name || 'Guest'}</h1>
        <p>{user?.memberSince ? `Member since ${user.memberSince}` : 'New Member'}</p>
      </div>
      <div class="profile-stats">
        <div class="stat-tag">COLLECTION: {data.stats?.collectionCount || 0}</div>
        <div class="stat-tag stat-tag-light">FAVORITES: {data.stats?.favoritesCount || 0}</div>
      </div>
    </div>
    
    <div class="profile-actions">
      <a href="/settings" class="action-btn" aria-label="Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </a>
      <a href="/login" class="action-btn action-btn-logout" aria-label="Logout">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </a>
    </div>
  </section>
  
  {#if data.source === 'mock'}
    <div class="demo-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Demo mode — showing sample data. Connect to backend for real data.
    </div>
  {/if}
  
  <div class="content-grid">
    <div class="main-content">
      <!-- Collection Section -->
      <section class="section">
        <div class="section-header">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <h2>Your Collection</h2>
        </div>
        <div class="collection-grid">
          {#each collection as char, index (char.anilistId ?? char.id ?? `col-${index}`)}
            <CharacterCard 
              id={char.anilistId ?? char.id ?? index}
              name={char.name}
              series={char.work?.title || char.series}
              image={char.imageUrl || char.image}
              rank={char.rank}
              rating={char.score || char.rating}
              rarity={char.rarity}
            />
          {/each}
        </div>
        <button class="view-all-btn">VIEW FULL COLLECTION</button>
      </section>
      
      <!-- Favorites Section -->
      <section class="section">
        <div class="section-header">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h2>Favorites</h2>
        </div>
        <div class="collection-grid">
          {#each favorites as char, index (char.anilistId ?? char.id ?? `fav-${index}`)}
            <CharacterCard 
              id={char.anilistId ?? char.id ?? index}
              name={char.name}
              series={char.work?.title || char.series}
              image={char.imageUrl || char.image}
              rank={char.rank}
              rating={char.score || char.rating}
              rarity={char.rarity}
            />
          {/each}
        </div>
      </section>
    </div>
    
    <!-- Sidebar -->
    <aside class="sidebar">
      <!-- Activity -->
      <div class="sidebar-card neobrutal-card">
        <div class="sidebar-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <h3>Recent Activity</h3>
        </div>
        <div class="activity-list">
          {#each activities as activity}
            <div class="activity-item">
              <p class="activity-text">{activity.text}</p>
              <p class="activity-time">{activity.time}</p>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Pro Member -->
      <div class="pro-card neobrutal-card">
        <h3>Pro Member</h3>
        <p>Unlock exclusive characters and unlimited collection space.</p>
        <button class="upgrade-btn">UPGRADE NOW</button>
      </div>
    </aside>
  </div>
</main>

<style>
  .profile-page {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }
  
  .demo-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(255, 212, 0, 0.1);
    border: 1px solid rgba(255, 212, 0, 0.3);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent-yellow);
  }
  
  .profile-header {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 32px;
    background: var(--accent-purple);
  }
  
  @media (min-width: 768px) {
    .profile-header {
      flex-direction: row;
    }
  }
  
  .avatar {
    width: 128px;
    height: 128px;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    overflow: hidden;
    background: white;
    flex-shrink: 0;
  }
  
  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .profile-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  @media (min-width: 768px) {
    .profile-info {
      text-align: left;
      justify-content: center;
    }
  }
  
  .profile-name h1 {
    font-size: 32px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: #000;
  }
  
  .profile-name p {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(0, 0, 0, 0.6);
  }
  
  .profile-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }
  
  @media (min-width: 768px) {
    .profile-stats {
      justify-content: flex-start;
    }
  }
  
  .stat-tag {
    padding: 8px 16px;
    background: #000;
    color: white;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 2px solid #000;
  }
  
  .stat-tag-light {
    background: white;
    color: #000;
  }
  
  .profile-actions {
    display: flex;
    gap: 16px;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: white;
    color: #000;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    transition: all var(--transition-fast);
  }
  
  .action-btn:hover {
    box-shadow: none;
    transform: translate(2px, 2px);
  }
  
  .action-btn-logout {
    background: var(--accent-pink);
  }
  
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
  }
  
  @media (min-width: 1024px) {
    .content-grid {
      grid-template-columns: 2fr 1fr;
    }
  }
  
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }
  
  .section {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .section-header :global(svg) {
    color: var(--accent-purple);
  }
  
  .section-header h2 {
    font-size: 24px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .collection-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 32px;
  }
  
  @media (min-width: 640px) {
    .collection-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .view-all-btn {
    padding: 16px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    background: transparent;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: all var(--transition-fast);
  }
  
  .view-all-btn:hover {
    border-color: var(--accent-purple);
    color: var(--accent-purple);
  }
  
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .sidebar-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .sidebar-header :global(svg) {
    color: var(--accent-blue);
  }
  
  .sidebar-header h3 {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .activity-item {
    border-left: 2px solid var(--accent-blue);
    padding-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .activity-text {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.4;
  }
  
  .activity-time {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: var(--text-secondary);
  }
  
  .pro-card {
    padding: 24px;
    background: var(--accent-blue);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .pro-card h3 {
    font-size: 18px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: #000;
  }
  
  .pro-card p {
    font-size: 12px;
    font-weight: 500;
    color: #000;
  }
  
  .upgrade-btn {
    padding: 8px 16px;
    background: #000;
    color: white;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 #000;
    transition: all var(--transition-fast);
  }
  
  .upgrade-btn:hover {
    box-shadow: none;
    transform: translate(1px, 1px);
  }
</style>
