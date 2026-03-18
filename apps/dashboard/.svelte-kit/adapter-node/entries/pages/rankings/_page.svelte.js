import { j as head, e as ensure_array_like, a as attr, i as stringify, b as attr_class, c as escape_html } from "../../../chunks/index.js";
import { C as CharacterCard } from "../../../chunks/CharacterCard.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    const tabs = [
      { value: "popularity", label: "Popularity" },
      { value: "ratings", label: "Ratings" },
      { value: "combined", label: "Combined" }
    ];
    head("78bavc", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Rankings - Nazuna Bot</title>`);
      });
    });
    $$renderer2.push(`<div class="rankings-page svelte-78bavc"><header class="page-header animate-slide-up svelte-78bavc"><h1 class="page-title svelte-78bavc"><span class="gradient-text">Rankings</span></h1> <p class="page-subtitle svelte-78bavc">Top characters by popularity and ratings</p></header> <div class="tabs svelte-78bavc"><!--[-->`);
    const each_array = ensure_array_like(tabs);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<a${attr("href", `/rankings?type=${stringify(tab.value)}`)}${attr_class("tab svelte-78bavc", void 0, { "active": data.currentType === tab.value })}>${escape_html(tab.label)}</a>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="rankings-grid svelte-78bavc"><!--[-->`);
    const each_array_1 = ensure_array_like(data.rankings);
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      let char = each_array_1[i];
      $$renderer2.push(`<div class="ranking-item svelte-78bavc"><span class="rank svelte-78bavc">#${escape_html((data.pagination.page - 1) * data.pagination.limit + i + 1)}</span> `);
      CharacterCard($$renderer2, {
        name: char.name,
        work: char.work?.title || "Unknown",
        rank: (data.pagination.page - 1) * data.pagination.limit + i + 1,
        image: char.imageUrl || ""
      });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (data.pagination.totalPages > 1) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="pagination svelte-78bavc">`);
      if (data.pagination.page > 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<a${attr("href", `/rankings?type=${stringify(data.currentType)}&page=${stringify(data.pagination.page - 1)}`)} class="page-btn svelte-78bavc">Previous</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <span class="page-info svelte-78bavc">Page ${escape_html(data.pagination.page)} of ${escape_html(data.pagination.totalPages)}</span> `);
      if (data.pagination.page < data.pagination.totalPages) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<a${attr("href", `/rankings?type=${stringify(data.currentType)}&page=${stringify(data.pagination.page + 1)}`)} class="page-btn svelte-78bavc">Next</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
