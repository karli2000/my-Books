import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { detectBooksWithLLM } from "@/lib/vision-books";
import { enrichBook } from "@/lib/book-enrichment";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.query.books.findMany({
    where: eq(books.userId, session.user.id),
    orderBy: [desc(books.createdAt)],
  });

  return NextResponse.json({ books: result });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
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
        userId: session.user.id,
        ...item,
      })),
    )
    .returning();

  return NextResponse.json({ books: inserted });
}
