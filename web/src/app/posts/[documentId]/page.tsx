// Dynamic route: /posts/<documentId>
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/strapi";

export default async function PostPage({ params }: PageProps<"/posts/[documentId]">) {
  const { documentId } = await params; // params is a Promise in Next.js 15+

  const post = await getPost(documentId).catch(() => null);
  if (!post) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back
      </Link>
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-sm text-zinc-500">
        by {post.author ?? "Anonymous"} · {new Date(post.createdAt).toLocaleString()}
      </p>
      <p className="whitespace-pre-wrap">{post.content}</p>
    </main>
  );
}
