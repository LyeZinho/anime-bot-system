import * as server from '../entries/pages/rankings/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/rankings/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/rankings/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.BHf7Narq.js","_app/immutable/chunks/BreV0DEp.js","_app/immutable/chunks/CiPhZLX9.js","_app/immutable/chunks/CP4MshlK.js","_app/immutable/chunks/CNrRf2cf.js","_app/immutable/chunks/Dxfw25y0.js","_app/immutable/chunks/CYhbvGXC.js","_app/immutable/chunks/sx3YTrId.js"];
export const stylesheets = ["_app/immutable/assets/CharacterCard.BUY9uEnB.css","_app/immutable/assets/6.BFGSx-iN.css"];
export const fonts = [];
