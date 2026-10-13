"use server";
// "use server" = these functions run on the server, but a <form> in the
// browser can call them directly. No API route needed.

import { revalidatePath } from "next/cache";
import { createPost } from "@/lib/strapi";

export type FormState = { ok: boolean; message: string };

export async function createPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();

  if (!title) return { ok: false, message: "Title is required." };

  try {
    await createPost({ title, content, author: author || undefined });
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }

  // Tell Next.js the home page data is stale, so the list re-renders with the new post.
  revalidatePath("/");
  return { ok: true, message: `Created “${title}”.` };
}
