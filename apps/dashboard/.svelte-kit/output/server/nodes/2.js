import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.DZeXt45S.js","_app/immutable/chunks/BreV0DEp.js","_app/immutable/chunks/CiPhZLX9.js","_app/immutable/chunks/CNrRf2cf.js","_app/immutable/chunks/Dxfw25y0.js","_app/immutable/chunks/CYhbvGXC.js","_app/immutable/chunks/2zxvPmur.js","_app/immutable/chunks/ByVcOtqw.js","_app/immutable/chunks/BWJ0Oxgw.js","_app/immutable/chunks/BjY2s6yK.js","_app/immutable/chunks/CP4MshlK.js","_app/immutable/chunks/sx3YTrId.js"];
export const stylesheets = ["_app/immutable/assets/StatCard.z9mEq-nu.css","_app/immutable/assets/CharacterCard.BUY9uEnB.css","_app/immutable/assets/2.Dz5xxB7v.css"];
export const fonts = [];
