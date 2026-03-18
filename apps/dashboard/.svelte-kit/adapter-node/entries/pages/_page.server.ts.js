import { b as private_env } from "../../chunks/shared-server.js";
const API_BASE = (private_env.PUBLIC_API_URL || "http://localhost:3001") + "/api/v1";
const load = async ({ fetch }) => {
  try {
    const [rankingsRes, charactersRes] = await Promise.all([
      fetch(`${API_BASE}/rankings/combined?page=1&limit=4`),
      fetch(`${API_BASE}/characters?page=1&limit=50`)
    ]);
    const rankings = rankingsRes.ok ? await rankingsRes.json() : { data: [] };
    const characters = charactersRes.ok ? await charactersRes.json() : { data: [], total: 0 };
    return {
      stats: {
        totalCharacters: characters.total || 0,
        activeUsers: 0,
        servers: 0,
        collections: 0
      },
      topCharacters: rankings.data || []
    };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return {
      stats: {
        totalCharacters: 0,
        activeUsers: 0,
        servers: 0,
        collections: 0
      },
      topCharacters: []
    };
  }
};
export {
  load
};
