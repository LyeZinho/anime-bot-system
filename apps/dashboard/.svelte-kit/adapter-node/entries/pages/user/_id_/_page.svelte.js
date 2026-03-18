import { s as store_get, j as head, d as unsubscribe_stores, c as escape_html } from "../../../../chunks/index.js";
import { p as page } from "../../../../chunks/stores.js";
/* empty css                                                        */
/* empty css                                                             */
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$page", page).params.id || "me";
    head("1htx3e8", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Profile - ${escape_html("Loading...")} - Nazuna Bot</title>`);
      });
    });
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="loading">Loading profile...</div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
