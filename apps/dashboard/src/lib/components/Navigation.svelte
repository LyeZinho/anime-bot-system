<script lang="ts">
  import { page } from '$app/stores';
  
  interface Props {
    user?: { id: string; username: string; avatar?: string | null } | null;
  }
  
  let { user }: Props = $props();
  
  const navItems = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/characters', label: 'Characters', icon: 'users' },
    { href: '/rankings', label: 'Rankings', icon: 'trophy' },
    { href: '/statistics', label: 'Stats', icon: 'chart' },
  ];
  
  function isActive(href: string, pathname: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }
  
  async function handleLogout() {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout failed:', e);
    }
  }
</script>

<nav class="navbar">
  <div class="nav-content">
    <a href="/" class="logo">
      <span class="logo-box">NB</span>
      <span class="logo-text">NAZUNA<span class="accent">BOT</span></span>
    </a>
    
    <div class="nav-links">
      {#each navItems as item}
        <a 
          href={item.href} 
          class="nav-link" 
          class:active={isActive(item.href, $page.url.pathname)}
        >
          <span class="nav-icon">
            {#if item.icon === 'home'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            {:else if item.icon === 'users'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            {:else if item.icon === 'trophy'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            {:else if item.icon === 'chart'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            {:else if item.icon === 'user'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            {/if}
          </span>
          <span class="nav-label">{item.label}</span>
        </a>
      {/each}
    </div>
    
    {#if user}
      <div class="user-section">
        <a href="/profile" class="user-info">
          <span class="user-avatar">
            {#if user.avatar}
              <img src={user.avatar} alt={user.username} />
            {:else}
              <span class="avatar-placeholder">{user.username.charAt(0).toUpperCase()}</span>
            {/if}
          </span>
          <span class="user-name">{user.username}</span>
        </a>
        <button onclick={handleLogout} class="btn-logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    {:else}
      <a href="/login" class="btn-login">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        <span class="login-text">LOGIN</span>
      </a>
    {/if}
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--z-modal);
    padding: 16px;
    pointer-events: none;
  }
  
  .nav-content {
    max-width: 80rem;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: auto;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  
  .logo-box {
    background: var(--accent-purple);
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    padding: 4px 8px;
    font-size: 14px;
    font-weight: 900;
    color: #000;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: white;
  }
  
  .logo-text .accent {
    font-weight: 400;
  }
  
  .nav-links {
    display: flex;
    gap: 4px;
    background: var(--bg-card);
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    padding: 4px;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 2px;
    color: white;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all var(--transition-fast);
  }
  
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .nav-link.active {
    background: var(--accent-purple);
    color: #000;
  }
  
  .nav-icon {
    display: flex;
    align-items: center;
  }
  
  .btn-login {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-pink);
    color: #000;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    padding: 8px 16px;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all var(--transition-fast);
  }
  
  .btn-login:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-brutal-lg);
  }
  
  .user-section {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-card);
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    padding: 4px 12px 4px 4px;
    text-decoration: none;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--accent-purple);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-placeholder {
    font-size: 14px;
    font-weight: 900;
    color: #000;
  }
  
  .user-name {
    font-size: 12px;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
  }
  
  .btn-logout {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    color: white;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    padding: 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .btn-logout:hover {
    background: var(--accent-pink);
    color: #000;
  }
  
  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }
    
    .login-text {
      display: none;
    }
  }
</style>
