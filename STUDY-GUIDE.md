# Strapi + Next.js — Study Guide

```
strapi-study/
├── cms/   ← Strapi 5 (headless CMS, backend)  → http://localhost:1337/admin
└── web/   ← Next.js 16 (frontend)             → http://localhost:3000
```

## Running it

```bash
# Terminal 1 — CMS (needs Node 22; .nvmrc pins it)
cd ~/strapi-study/cms && nvm use && npm run develop

# Terminal 2 — Web
cd ~/strapi-study/web && npm run dev
```

Admin login: `jasim@tinkerhub.org`, password in `cms/.admin-login.local`.
Change it: `cd cms && npx strapi admin:reset-user-password --email=jasim@tinkerhub.org --password=NewPass123!`

---

## 1. What is a headless CMS?

A traditional CMS (WordPress) stores content **and** renders the website.
A **headless** CMS only stores content and exposes it over an **API**. The "head"
(the website/app) is separate — here, Next.js. One CMS can feed a website, a
mobile app, and a kiosk at the same time.

```
 Editor ──► Strapi admin panel ──► SQLite DB
                    │
              REST API /api/posts
                    │
        Next.js server (holds token) ──► HTML ──► Browser
```

## 2. Strapi's building blocks

| Concept | Where | What it is |
|---|---|---|
| **Content type** | `cms/src/api/post/content-types/post/schema.json` | The data model (like a table). Fields = attributes. |
| **Collection vs Single type** | `"kind"` in schema | Collection = many entries (posts). Single = one entry (homepage settings). |
| **Route** | `src/api/post/routes/post.ts` | Maps URL + method → controller action. |
| **Controller** | `src/api/post/controllers/post.ts` | Handles request/response. Override to customize. |
| **Service** | `src/api/post/services/post.ts` | Reusable business logic. |
| **Document Service** | `strapi.documents('api::post.post')` | Strapi 5's API for reading/writing content in code. |
| **Lifecycle (bootstrap)** | `src/index.ts` | Code that runs at startup. We use it to set permissions. |
| **Config** | `cms/config/*.ts` + `cms/.env` | Server, DB, admin, plugins. |

The Content-Type Builder in the admin panel (dev mode only) just **writes these same
files**. Try it: add a field in the UI, then look at `schema.json` change.

`api::post.post` is the **UID**: `api::<api-name>.<content-type-name>`.

## 3. The REST API (Strapi 5)

| Action | Method & URL | Permission |
|---|---|---|
| find | `GET /api/posts` | Public ✅ |
| findOne | `GET /api/posts/:documentId` | Public ✅ |
| create | `POST /api/posts` body `{ "data": {...} }` | Token only 🔑 |
| update | `PUT /api/posts/:documentId` body `{ "data": {...} }` | not granted |
| delete | `DELETE /api/posts/:documentId` | not granted |

**Response shape** — always `{ data, meta }`:
```json
{ "data": [{ "id": 1, "documentId": "td21kj...", "title": "Hello" }],
  "meta": { "pagination": { "page": 1, "pageSize": 25, "total": 1 } } }
```
- `id` = internal DB id. `documentId` = stable public id → **use this** in URLs.
- Strapi **v4** wrapped fields in `attributes` — v5 is flat. Old tutorials will confuse you here.

**Query parameters** (try them in the browser):
```
/api/posts?sort=createdAt:desc
/api/posts?filters[author][$eq]=Jasim
/api/posts?filters[title][$containsi]=hello
/api/posts?fields[0]=title&fields[1]=author
/api/posts?pagination[page]=1&pagination[pageSize]=5
/api/posts?populate=*            ← needed to include relations/media
```
(With curl, add `-g` so the `[ ]` aren't treated as globs.)

## 4. Auth & permissions — two systems

1. **Users & Permissions roles** (`Public`, `Authenticated`) — for requests with *no token*
   or an *end-user JWT*. We granted Public `find` + `findOne` in `src/index.ts`.
   UI: Settings → Users & Permissions → Roles → Public.
2. **API Tokens** — for *your own apps/servers*. Sent as `Authorization: Bearer <token>`.
   Types: Read-only, Full access, Custom. Ours is **Custom**: find/findOne/create on Post only.
   UI: Settings → API Tokens.

Principle of least privilege: give each thing only what it needs. Try `PUT` with our
token — you'll get 403 because update isn't in its permissions.

## 5. The Next.js side

| File | Runs on | Role |
|---|---|---|
| `web/src/lib/strapi.ts` | Server only (`import "server-only"`) | The only file that talks to Strapi. Holds the token. |
| `web/src/app/page.tsx` | Server Component | `await getPosts()` → renders HTML. |
| `web/src/app/actions.ts` | Server Action (`"use server"`) | Form submits here → `createPost()` → `revalidatePath("/")`. |
| `web/src/app/post-form.tsx` | Client Component (`"use client"`) | `useActionState` for pending/error/success UI. |
| `web/src/app/posts/[documentId]/page.tsx` | Server Component | Dynamic route, `notFound()` on bad id. |
| `web/.env.local` | — | `STRAPI_URL`, `STRAPI_API_TOKEN` (git-ignored). |

**Why is the token safe?** Env vars without `NEXT_PUBLIC_` never reach the browser,
and all Strapi calls happen on the server. Open DevTools → Network: the browser only
talks to `localhost:3000`, never to `:1337`.

**The create flow:**
```
<form action={formAction}>  ── POST to Next ──►  createPostAction(formData)
                                                 └► fetch POST :1337/api/posts  (Bearer token)
                                                 └► revalidatePath("/")  → list re-renders
```

## 6. Try these yourself (exercises)

1. **curl the API**: `curl -s localhost:1337/api/posts | npx -y json` — read the raw shape.
2. **Add a field**: in the admin panel, add a Boolean `featured` to Post. Watch `schema.json`
   change. Add `featured?: boolean` to the `Post` type and show a ⭐ in the list.
3. **Filtering**: add `?author=Jasim` support to the home page using `filters[author][$eq]`.
4. **Delete**: add `api::post.post.delete` to the token (Settings → API Tokens → nextjs-web),
   write `deletePost(documentId)` + a Server Action + a button.
5. **Relations**: create a `Category` collection type, relate Post → Category,
   then fetch with `populate=category`.
6. **Media**: add an image field; fetch with `populate=cover`; URLs are relative →
   prefix with `STRAPI_URL`.
7. **Draft & Publish**: set `"draftAndPublish": true` in schema. Notice new posts via API
   are drafts and don't appear in `GET` until published (`?status=draft` to see them).
8. **Custom controller**: override `find` in `controllers/post.ts` to log or modify output:
   ```ts
   export default factories.createCoreController('api::post.post', ({ strapi }) => ({
     async find(ctx) {
       const result = await super.find(ctx);
       strapi.log.info(`Returned ${result.data.length} posts`);
       return result;
     },
   }));
   ```
9. **Caching**: we use `cache: "no-store"`. Try removing it and using
   `next: { revalidate: 60 }` — then explore Strapi **webhooks** (Settings → Webhooks) to
   trigger on-demand revalidation when an editor publishes.

## 7. Gotchas I hit while building this

- **Node version**: Strapi supports LTS (20/22/24), not Node 25. `cms/.nvmrc` pins 22.
- **Empty env var**: `.env` had `DATABASE_FILENAME=` (empty) → "unable to open database file".
  An empty string overrides the default. Fixed to `.tmp/data.db`.
- Content-Type Builder only works in `develop` mode — in production, schema is code.
- The SQLite DB lives at `cms/.tmp/data.db` — delete it to start completely fresh.
