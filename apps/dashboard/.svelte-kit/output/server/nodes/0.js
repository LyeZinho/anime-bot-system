import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.BwrCdAkX.js","_app/immutable/chunks/BreV0DEp.js","_app/immutable/chunks/CiPhZLX9.js","_app/immutable/chunks/CP4MshlK.js","_app/immutable/chunks/CFGznXTv.js","_app/immutable/chunks/ByVcOtqw.js","_app/immutable/chunks/BWJ0Oxgw.js","_app/immutable/chunks/CNrRf2cf.js","_app/immutable/chunks/CYhbvGXC.js","_app/immutable/chunks/CGaRBiix.js","_app/immutable/chunks/5wfDrgrL.js","_app/immutable/chunks/BHWHMxoS.js"];
export const stylesheets = ["_app/immutable/assets/0.md6YX718.css"];
export const fonts = [];
