// A Server Component (the default in the App Router).
// It runs on the server, calls Strapi, and sends finished HTML to the browser.

import Link from "next/link";
import { getPosts } from "@/lib/strapi";
import { PostForm } from "./post-form";

export default async function Home() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let error: string | null = null;

  try {
    posts = await getPosts();
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <header>
        <h1 className="text-3xl font-bold">Strapi + Next.js</h1>
        <p className="text-zinc-500">Posts are stored in Strapi and fetched through its REST API.</p>
      </header>

      <PostForm />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">All posts ({posts.length})</h2>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-300">
            Couldn’t reach Strapi: {error}. Is it running on :1337?
          </p>
        )}

        {!error && posts.length === 0 && <p className="text-zinc-500">No posts yet. Create one above.</p>}

        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.documentId} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <Link href={`/posts/${post.documentId}`} className="font-medium hover:underline">
                {post.title}
              </Link>
              <p className="text-sm text-zinc-500">
                by {post.author ?? "Anonymous"} · {new Date(post.createdAt).toLocaleString()}
              </p>
              {post.content && <p className="mt-2 line-clamp-2 text-zinc-700 dark:text-zinc-300">{post.content}</p>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
