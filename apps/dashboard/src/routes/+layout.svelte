<script lang="ts">
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
  import BackgroundSVG from '$lib/components/BackgroundSVG.svelte';
  
  let { children, data } = $props();
</script>

<BackgroundSVG />

<div class="app-container">
  <Navigation user={data?.user} />
  
  <main>
    {@render children()}
  </main>
  
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-brand">
        <div class="brand-box">NB</div>
        <p class="brand-text">© 2026 NAZUNA BOT. ALL RIGHTS RESERVED.</p>
      </div>
      <div class="footer-links">
        <a href="https://discord.gg/nazuna" class="footer-link" target="_blank" rel="noopener">DISCORD</a>
        <a href="https://twitter.com/nazunabot" class="footer-link" target="_blank" rel="noopener">TWITTER</a>
        <a href="https://github.com/nazunabot" class="footer-link" target="_blank" rel="noopener">GITHUB</a>
      </div>
    </div>
  </footer>
</div>

<style>
  .app-container {
    position: relative;
    min-height: 100vh;
    z-index: var(--z-base);
  }
  
  main {
    padding: 100px 24px 48px;
    max-width: 80rem;
    margin: 0 auto;
  }
  
  .footer {
    max-width: 80rem;
    margin: 0 auto;
    padding: 48px 24px;
    border-top: var(--border-brutal);
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .footer-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  
  .footer-brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .brand-box {
    background: var(--accent-purple);
    border: var(--border-brutal);
    box-shadow: var(--shadow-brutal);
    padding: 8px;
    font-weight: 900;
    color: #000;
  }
  
  .brand-text {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
  }
  
  .footer-links {
    display: flex;
    gap: 24px;
  }
  
  .footer-link {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    transition: color var(--transition-fast);
  }
  
  .footer-link:hover {
    color: var(--accent-purple);
  }
  
  @media (min-width: 768px) {
    .footer-content {
      flex-direction: row;
    }
  }
</style>
