import { c as escape_html, e as ensure_array_like, h as attr_style, a as attr, i as stringify, b as attr_class, l as bind_props, j as head } from "../../../chunks/index.js";
import { C as CharacterCard } from "../../../chunks/CharacterCard.js";
function CharacterGrid($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let loading = false;
    let characters = [];
    let total = 0;
    $$renderer2.push(`<div class="character-grid-container svelte-1kpbrr3"><div class="grid-header svelte-1kpbrr3"><span class="results-count svelte-1kpbrr3">${escape_html(total.toLocaleString())} characters</span> <div class="sort-options svelte-1kpbrr3"><button class="sort-btn active svelte-1kpbrr3">Popular</button> <button class="sort-btn svelte-1kpbrr3">Rating</button> <button class="sort-btn svelte-1kpbrr3">Name</button></div></div> <div class="character-grid svelte-1kpbrr3"><!--[-->`);
    const each_array = ensure_array_like(characters);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let char = each_array[i];
      $$renderer2.push(`<div class="animate-fade-in"${attr_style(`opacity: 0; animation-delay: ${stringify(Math.min(i * 0.05, 0.3))}s`)}><a${attr("href", `/characters/${stringify(char.anilistId)}`)}>`);
      CharacterCard($$renderer2, {
        name: char.name,
        work: char.work?.title || "Unknown",
        rank: char.popularity || 0,
        image: char.imageUrl || ""
      });
      $$renderer2.push(`<!----></a></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="load-more svelte-1kpbrr3"><button class="load-more-btn svelte-1kpbrr3"${attr("disabled", loading, true)}>`);
      {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`Load More`);
      }
      $$renderer2.push(`<!--]--></button></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function FilterPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      searchQuery = void 0,
      selectedGender = void 0,
      selectedPersonality = void 0,
      selectedHairColor = void 0
    } = $$props;
    const genders = [
      { value: "", label: "All Genders" },
      { value: "female", label: "Female" },
      { value: "male", label: "Male" }
    ];
    const personalities = [
      { value: "", label: "All Personalities" },
      { value: "tsundere", label: "Tsundere" },
      { value: "yandere", label: "Yandere" },
      { value: "kuudere", label: "Kuudere" },
      { value: "dandere", label: "Dandere" },
      { value: "genki", label: "Genki" },
      { value: "imouto", label: "Imouto" },
      { value: "onee-san", label: "Onee-san" }
    ];
    const hairColors = [
      { value: "", label: "All Hair Colors" },
      { value: "blonde", label: "Blonde" },
      { value: "black", label: "Black" },
      { value: "pink", label: "Pink" },
      { value: "blue", label: "Blue" },
      { value: "red", label: "Red" },
      { value: "brown", label: "Brown" },
      { value: "white", label: "White" },
      { value: "purple", label: "Purple" }
    ];
    let expandedSections = {
      search: true,
      gender: true,
      personality: true,
      hairColor: true
    };
    $$renderer2.push(`<div class="filter-panel neobrutal-card svelte-85s9jg"><div class="filter-header svelte-85s9jg"><h3 class="filter-title svelte-85s9jg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Filters</h3> <button class="clear-btn svelte-85s9jg">Clear All</button></div> <div class="filter-sections svelte-85s9jg"><div class="filter-section svelte-85s9jg"><button class="section-toggle svelte-85s9jg"><span>Search</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"${attr_class("svelte-85s9jg", void 0, { "rotated": expandedSections.search })}><polyline points="6 9 12 15 18 9"></polyline></svg></button> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="section-content svelte-85s9jg"><input type="text" placeholder="Search characters..."${attr("value", searchQuery)} class="search-input svelte-85s9jg"/></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="filter-section svelte-85s9jg"><button class="section-toggle svelte-85s9jg"><span>Gender</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"${attr_class("svelte-85s9jg", void 0, { "rotated": expandedSections.gender })}><polyline points="6 9 12 15 18 9"></polyline></svg></button> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="section-content svelte-85s9jg"><div class="filter-options svelte-85s9jg"><!--[-->`);
      const each_array = ensure_array_like(genders);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let option = each_array[$$index];
        $$renderer2.push(`<label class="filter-option svelte-85s9jg"><input type="radio" name="gender"${attr("value", option.value)}${attr("checked", selectedGender === option.value, true)} class="svelte-85s9jg"/> <span class="option-label svelte-85s9jg">${escape_html(option.label)}</span></label>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="filter-section svelte-85s9jg"><button class="section-toggle svelte-85s9jg"><span>Personality</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"${attr_class("svelte-85s9jg", void 0, { "rotated": expandedSections.personality })}><polyline points="6 9 12 15 18 9"></polyline></svg></button> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="section-content svelte-85s9jg"><div class="filter-options scrollable svelte-85s9jg"><!--[-->`);
      const each_array_1 = ensure_array_like(personalities);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let option = each_array_1[$$index_1];
        $$renderer2.push(`<label class="filter-option svelte-85s9jg"><input type="radio" name="personality"${attr("value", option.value)}${attr("checked", selectedPersonality === option.value, true)} class="svelte-85s9jg"/> <span class="option-label svelte-85s9jg">${escape_html(option.label)}</span></label>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="filter-section svelte-85s9jg"><button class="section-toggle svelte-85s9jg"><span>Hair Color</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"${attr_class("svelte-85s9jg", void 0, { "rotated": expandedSections.hairColor })}><polyline points="6 9 12 15 18 9"></polyline></svg></button> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="section-content svelte-85s9jg"><div class="filter-options scrollable svelte-85s9jg"><!--[-->`);
      const each_array_2 = ensure_array_like(hairColors);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let option = each_array_2[$$index_2];
        $$renderer2.push(`<label class="filter-option svelte-85s9jg"><input type="radio" name="hairColor"${attr("value", option.value)}${attr("checked", selectedHairColor === option.value, true)} class="svelte-85s9jg"/> <span class="option-label svelte-85s9jg">${escape_html(option.label)}</span></label>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
    bind_props($$props, {
      searchQuery,
      selectedGender,
      selectedPersonality,
      selectedHairColor
    });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let searchQuery = "";
    let selectedGender = "";
    let selectedPersonality = "";
    let selectedHairColor = "";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      head("75i7xh", $$renderer3, ($$renderer4) => {
        $$renderer4.title(($$renderer5) => {
          $$renderer5.push(`<title>Characters - Nazuna Bot</title>`);
        });
      });
      $$renderer3.push(`<div class="characters-page svelte-75i7xh"><header class="page-header animate-slide-up svelte-75i7xh"><h1 class="page-title svelte-75i7xh"><span class="gradient-text">Explore</span> Characters</h1> <p class="page-subtitle svelte-75i7xh">Browse through ${escape_html(Number(12044).toLocaleString())} anime characters</p></header> <div class="page-content svelte-75i7xh"><aside class="filters-sidebar animate-fade-in svelte-75i7xh" style="opacity: 0; animation-delay: 0.1s">`);
      FilterPanel($$renderer3, {
        get searchQuery() {
          return searchQuery;
        },
        set searchQuery($$value) {
          searchQuery = $$value;
          $$settled = false;
        },
        get selectedGender() {
          return selectedGender;
        },
        set selectedGender($$value) {
          selectedGender = $$value;
          $$settled = false;
        },
        get selectedPersonality() {
          return selectedPersonality;
        },
        set selectedPersonality($$value) {
          selectedPersonality = $$value;
          $$settled = false;
        },
        get selectedHairColor() {
          return selectedHairColor;
        },
        set selectedHairColor($$value) {
          selectedHairColor = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></aside> <main class="characters-main">`);
      CharacterGrid($$renderer3);
      $$renderer3.push(`<!----></main></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
