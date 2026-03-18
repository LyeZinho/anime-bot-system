import { b as private_env } from "../../../chunks/shared-server.js";
const API_BASE = (private_env.PUBLIC_API_URL || "http://localhost:3001") + "/api/v1";
const load = async ({ fetch, url }) => {
  const type = url.searchParams.get("type") || "combined";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  try {
    const response = await fetch(`${API_BASE}/rankings/${type}?page=${page}&limit=${limit}`);
    const data = await response.json();
    return {
      rankings: data.data || [],
      pagination: {
        page,
        limit,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / limit)
      },
      currentType: type
    };
  } catch (error) {
    console.error("Failed to fetch rankings:", error);
    return {
      rankings: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      currentType: type
    };
  }
};
export {
  load
};
