// All communication with Strapi lives in this file.
// It only runs on the server (Server Components / Server Actions),
// so the API token below is never sent to the browser.
import "server-only";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Shape of one Post as Strapi 5 returns it (flat — no `attributes` wrapper like v4).
export type Post = {
  id: number; // internal database id
  documentId: string; // stable public id — use this in URLs
  title: string;
  content: string | null;
  author: string | null;
  createdAt: string;
  updatedAt: string;
};

// Strapi wraps every response like this: { data, meta }
type StrapiList<T> = {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};
type StrapiSingle<T> = { data: T; meta: object };

async function strapiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // Bearer token = "this request is allowed to do what the token permits"
      ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
      ...init.headers,
    },
    cache: "no-store", // always fetch fresh data (fine for learning; see notes on caching)
  });

  if (!res.ok) {
    // Strapi errors look like: { error: { status, name, message, details } }
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Strapi request failed: ${res.status}`);
  }
  return res.json();
}

// GET /api/posts?sort=createdAt:desc  — "take out" (read) all posts
export async function getPosts() {
  const json = await strapiFetch<StrapiList<Post>>("/posts?sort=createdAt:desc");
  return json.data;
}

// GET /api/posts/:documentId — read one post
export async function getPost(documentId: string) {
  const json = await strapiFetch<StrapiSingle<Post>>(`/posts/${documentId}`);
  return json.data;
}

// POST /api/posts — create a post. Body MUST be wrapped in { data: {...} }
export async function createPost(input: { title: string; content?: string; author?: string }) {
  const json = await strapiFetch<StrapiSingle<Post>>("/posts", {
    method: "POST",
    body: JSON.stringify({ data: input }),
  });
  return json.data;
}
