import { e as ensure_array_like, a as attr, b as attr_class, s as store_get, c as escape_html, d as unsubscribe_stores } from "../../chunks/index.js";
import { p as page } from "../../chunks/stores.js";
function Navigation($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const navItems = [
      { href: "/", label: "Home", icon: "home" },
      { href: "/characters", label: "Characters", icon: "users" },
      { href: "/rankings", label: "Rankings", icon: "trophy" },
      { href: "/user/me", label: "Profile", icon: "user" }
    ];
    $$renderer2.push(`<nav class="navbar svelte-ocbj1u"><div class="nav-content svelte-ocbj1u"><a href="/" class="logo svelte-ocbj1u"><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="url(#logoGrad)" stroke-width="2"></circle><circle cx="16" cy="16" r="8" fill="url(#logoGrad)" opacity="0.3"></circle><circle cx="16" cy="16" r="4" fill="url(#logoGrad)"></circle><defs><linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stop-color="#3b82f6"></stop><stop offset="100%" stop-color="#8b5cf6"></stop></linearGradient></defs></svg> <span class="logo-text gradient-text svelte-ocbj1u">Nazuna<span class="accent svelte-ocbj1u">Bot</span></span></a> <div class="nav-links svelte-ocbj1u"><!--[-->`);
    const each_array = ensure_array_like(navItems);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let item = each_array[$$index];
      $$renderer2.push(`<a${attr("href", item.href)}${attr_class("nav-link svelte-ocbj1u", void 0, {
        "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === item.href || store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith(item.href) && item.href !== "/"
      })}><span class="nav-icon svelte-ocbj1u">`);
      if (item.icon === "home") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`);
      } else if (item.icon === "users") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`);
      } else if (item.icon === "trophy") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>`);
      } else if (item.icon === "user") {
        $$renderer2.push("<!--[3-->");
        $$renderer2.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></span> ${escape_html(item.label)}</a>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="nav-auth"><a href="/auth/discord/callback" class="btn-login svelte-ocbj1u"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg> Login with Discord</a></div></div></nav>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function BackgroundSVG($$renderer, $$props) {
  $$renderer.push(`<svg class="bg-svg svelte-10suvi" viewBox="0 0 200 200" preserveAspectRatio="none"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a1a28" stroke-width="1"></path></pattern><pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="#2a2a3a"></circle></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"></rect><rect width="100%" height="100%" fill="url(#dots)"></rect></svg>`);
}
function _layout($$renderer, $$props) {
  let { children } = $$props;
  BackgroundSVG($$renderer);
  $$renderer.push(`<!----> <div class="app-container svelte-12qhfyh">`);
  Navigation($$renderer);
  $$renderer.push(`<!----> <main class="svelte-12qhfyh">`);
  children($$renderer);
  $$renderer.push(`<!----></main></div>`);
}
export {
  _layout as default
};
