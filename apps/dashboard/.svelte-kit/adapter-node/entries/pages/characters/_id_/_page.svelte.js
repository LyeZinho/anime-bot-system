import { s as store_get, j as head, d as unsubscribe_stores, c as escape_html } from "../../../../chunks/index.js";
import { p as page } from "../../../../chunks/stores.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    Number(store_get($$store_subs ??= {}, "$page", page).params.id);
    head("1nlw825", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("Loading...")} - Nazuna Bot</title>`);
      });
    });
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="loading svelte-1nlw825">Loading character...</div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
