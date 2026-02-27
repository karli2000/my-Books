import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { detectBooksWithLLM } from "@/lib/vision-books";
import { enrichBook } from "@/lib/book-enrichment";
import { getSupabaseServerClient } from "@/lib/supabase-server";

async function getUserIdFromRequest(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.query.books.findMany({
    where: eq(books.userId, userId),
    orderBy: [desc(books.createdAt)],
  });

  return NextResponse.json({ books: result });
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { imageData?: string };

  if (!body.imageData) {
    return NextResponse.json({ error: "Missing imageData" }, { status: 400 });
  }

  const detected = await detectBooksWithLLM(body.imageData);

  if (!detected.length) {
    return NextResponse.json({ books: [] });
  }

  const enriched = await Promise.all(
    detected.map(async (item) => {
      const extra = await enrichBook(item.title, item.author);
      return {
        title: item.title,
        author: item.author,
        confidence: Math.round(item.confidence),
        isbn: extra.isbn,
        publisher: extra.publisher,
        publishYear: extra.publishYear,
        coverUrl: extra.coverUrl ?? body.imageData,
        rawText: JSON.stringify({ detected: item, enrichment: extra }),
      };
    }),
  );

  const inserted = await db
    .insert(books)
    .values(
      enriched.map((item) => ({
        userId,
        ...item,
      })),
    )
    .returning();

  return NextResponse.json({ books: inserted });
}
