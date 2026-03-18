import { a as attr, h as attr_style, c as escape_html, i as stringify } from "./index.js";
/* empty css                                            */
function CharacterCard($$renderer, $$props) {
  let { name, work, rank, image } = $$props;
  const rankColors = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  $$renderer.push(`<a${attr("href", `/characters/${stringify(rank)}`)} class="character-card svelte-19e1lap"${attr_style(`--rank-color: ${stringify(rankColors[rank] || "#6366f1")}`)}><div class="card-image svelte-19e1lap"><img${attr("src", image)}${attr("alt", name)} loading="lazy" class="svelte-19e1lap"/> <span class="rank-badge svelte-19e1lap">#${escape_html(rank)}</span></div> <div class="card-content svelte-19e1lap"><h3 class="character-name svelte-19e1lap">${escape_html(name)}</h3> <p class="character-work svelte-19e1lap">${escape_html(work)}</p></div></a>`);
}
export {
  CharacterCard as C
};
