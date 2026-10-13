"use client";
// A Client Component: it runs in the browser so it can show pending/error state.

import { useActionState, useEffect, useRef } from "react";
import { createPostAction, type FormState } from "./actions";

const initialState: FormState = { ok: false, message: "" };

export function PostForm() {
  const [state, formAction, pending] = useActionState(createPostAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h2 className="text-lg font-semibold">Create a post</h2>

      <input
        name="title"
        placeholder="Title *"
        required
        maxLength={120}
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      <input
        name="author"
        placeholder="Author (optional)"
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      <textarea
        name="content"
        placeholder="Write something…"
        rows={4}
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        {pending ? "Saving…" : "Create post"}
      </button>

      {state.message && (
        <p className={state.ok ? "text-green-600" : "text-red-600"}>{state.message}</p>
      )}
    </form>
  );
}
