<script lang="ts">
  import { goto } from '$app/navigation';
  import * as authLib from '$lib/auth';
  
  let isLoading = $state(false);
  
  function handleDiscordLogin() {
    isLoading = true;
    
    // Generate CSRF state token
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Store state in sessionStorage for validation after callback
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_state', state);
    }
    
    // Redirect to Discord OAuth authorization URL
    const authUrl = authLib.getDiscordAuthUrl(state);
    window.location.href = authUrl;
  }
  
  function continueAsGuest() {
    goto('/');
  }
</script>

<svelte:head>
  <title>Login - Nazuna Bot</title>
</svelte:head>

<main class="login-page">
  <div class="login-card">
    <div class="login-header">
      <div class="icon-wrapper">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
      </div>
      <h1>Welcome Back</h1>
      <p>Connect your Discord to start collecting</p>
    </div>
    
    <div class="login-content neobrutal-card">
      <div class="features">
        <div class="feature">
          <div class="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <p>Secure OAuth2 Connection</p>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p>Sync with Discord Servers</p>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <p>Instant Collection Access</p>
        </div>
      </div>
      
      <button 
        class="discord-btn"
        onclick={handleDiscordLogin}
        disabled={isLoading}
      >
        {#if isLoading}
          <div class="spinner"></div>
        {:else}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          LOGIN WITH DISCORD
        {/if}
      </button>
      
      <p class="terms">
        By logging in, you agree to our <span class="link">Terms of Service</span> and <span class="link">Privacy Policy</span>.
      </p>
    </div>
    
    <div class="login-footer">
      <button onclick={continueAsGuest} class="guest-btn">
        CONTINUE AS GUEST
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  </div>
</main>

<style>
  .login-page {
    min-height: calc(100vh - 200px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
  }
  
  .login-card {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 48px;
  }
  
  .login-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .icon-wrapper {
    display: inline-flex;
    align-self: center;
    background: var(--accent-purple);
    padding: 16px;
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    color: #000;
  }
  
  .login-header h1 {
    font-size: 40px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  
  .login-header p {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--text-secondary);
  }
  
  .login-content {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .features {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .feature {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .feature-icon {
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--accent-purple);
    display: flex;
  }
  
  .feature p {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .discord-btn {
    width: 100%;
    padding: 16px;
    background: #5865F2;
    color: white;
    font-weight: 900;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    border: 2px solid #000;
    box-shadow: 6px 6px 0 #000;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all var(--transition-fast);
  }
  
  .discord-btn:hover:not(:disabled) {
    box-shadow: none;
    transform: translate(3px, 3px);
  }
  
  .discord-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 4px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .terms {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    color: var(--text-secondary);
    text-align: center;
  }
  
  .terms .link {
    color: var(--accent-purple);
    cursor: pointer;
  }
  
  .terms .link:hover {
    text-decoration: underline;
  }
  
  .login-footer {
    text-align: center;
  }
  
  .guest-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: var(--accent-purple);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.1em;
    background: transparent;
  }
  
  .guest-btn:hover {
    text-decoration: underline;
  }
</style>
