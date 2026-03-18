import { h as attr_style, i as stringify, c as escape_html, j as head, e as ensure_array_like, b as attr_class, k as spread_props } from "../../chunks/index.js";
/* empty css                                                  */
import { C as CharacterCard } from "../../chunks/CharacterCard.js";
function StatCard($$renderer, $$props) {
  let { label, value, icon, color } = $$props;
  const colorMap = {
    blue: {
      bg: "var(--accent-blue)",
      shadow: "var(--shadow-brutal-blue)"
    },
    purple: {
      bg: "var(--accent-purple)",
      shadow: "var(--shadow-brutal-accent)"
    },
    cyan: {
      bg: "var(--accent-cyan)",
      shadow: "var(--shadow-brutal-cyan)"
    },
    pink: {
      bg: "var(--accent-pink)",
      shadow: "var(--shadow-brutal-pink)"
    }
  };
  $$renderer.push(`<div class="stat-card svelte-17xvzis"${attr_style(`--card-color: ${stringify(colorMap[color].bg)}; --card-shadow: ${stringify(colorMap[color].shadow)}`)}><div class="stat-icon svelte-17xvzis">`);
  if (icon === "users") {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`);
  } else if (icon === "user-check") {
    $$renderer.push("<!--[1-->");
    $$renderer.push(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>`);
  } else if (icon === "server") {
    $$renderer.push("<!--[2-->");
    $$renderer.push(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`);
  } else if (icon === "box") {
    $$renderer.push("<!--[3-->");
    $$renderer.push(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div> <div class="stat-content svelte-17xvzis"><span class="stat-value svelte-17xvzis">${escape_html(value)}</span> <span class="stat-label svelte-17xvzis">${escape_html(label)}</span></div></div>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const stats = [
      {
        label: "Total Characters",
        value: String(data.stats.totalCharacters || 0),
        icon: "users",
        color: "blue"
      },
      {
        label: "Active Users",
        value: String(data.stats.activeUsers || 0),
        icon: "user-check",
        color: "purple"
      },
      {
        label: "Servers",
        value: String(data.stats.servers || 0),
        icon: "server",
        color: "cyan"
      },
      {
        label: "Collections",
        value: String(data.stats.collections || 0),
        icon: "box",
        color: "pink"
      }
    ];
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Nazuna Bot - Home</title>`);
      });
    });
    $$renderer2.push(`<div class="home svelte-1uha8ag"><header class="hero animate-slide-up svelte-1uha8ag"><div class="hero-content"><h1 class="hero-title svelte-1uha8ag">Collect Your <span class="gradient-text">Waifus</span></h1> <p class="hero-subtitle svelte-1uha8ag">Spin the roulette, collect anime characters, and build your collection!</p> <div class="hero-actions svelte-1uha8ag"><a href="/characters" class="btn-primary svelte-1uha8ag"><span>Explore Characters</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a> <a href="/rankings" class="btn-secondary svelte-1uha8ag">View Rankings</a></div></div> <div class="hero-visual svelte-1uha8ag"><div class="floating-cards svelte-1uha8ag"><div class="floating-card card-1 animate-float svelte-1uha8ag"><div class="card-glow svelte-1uha8ag"></div></div> <div class="floating-card card-2 animate-float svelte-1uha8ag" style="animation-delay: -1s"></div> <div class="floating-card card-3 animate-float svelte-1uha8ag" style="animation-delay: -2s"></div></div></div></header> <section class="stats-section svelte-1uha8ag"><div class="stats-grid svelte-1uha8ag"><!--[-->`);
    const each_array = ensure_array_like(stats);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let stat = each_array[i];
      $$renderer2.push(`<div${attr_class(`animate-fade-in stagger-${stringify(i + 1)}`, "svelte-1uha8ag")} style="opacity: 0">`);
      StatCard($$renderer2, spread_props([stat]));
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="featured-section"><div class="section-header svelte-1uha8ag"><h2 class="section-title svelte-1uha8ag"><span class="section-icon svelte-1uha8ag"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></span> Top Characters</h2> <a href="/rankings" class="see-all svelte-1uha8ag">See All <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a></div> <div class="characters-grid svelte-1uha8ag"><!--[-->`);
    const each_array_1 = ensure_array_like(data.topCharacters);
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      let char = each_array_1[i];
      CharacterCard($$renderer2, {
        name: char.name,
        work: char.work?.title || "Unknown",
        rank: i + 1,
        image: char.imageUrl || ""
      });
    }
    $$renderer2.push(`<!--]--></div></section></div>`);
  });
}
export {
  _page as default
};
