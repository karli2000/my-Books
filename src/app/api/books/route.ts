import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import Tesseract from "tesseract.js";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { parseBookText } from "@/lib/ocr";

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

  const body = (await request.json()) as {
    imageData?: string;
    title?: string;
    author?: string;
    confidence?: number;
    rawText?: string;
  };

  if (!body.imageData && !(body.title && body.author)) {
    return NextResponse.json({ error: "Missing imageData or metadata" }, { status: 400 });
  }

  let extracted = {
    title: body.title ?? "Unknown Title",
    author: body.author ?? "Unknown Author",
    confidence: body.confidence ?? 0,
    rawText: body.rawText ?? "",
  };

  if (body.imageData) {
    const imageBase64 = body.imageData.split(",")[1] ?? body.imageData;
    const imageBuffer = Buffer.from(imageBase64, "base64");
    const result = await Tesseract.recognize(imageBuffer, "eng");
    extracted = parseBookText(result.data.text, result.data.confidence);
  }

  const [inserted] = await db
    .insert(books)
    .values({
      userId: session.user.id,
      title: extracted.title,
      author: extracted.author,
      confidence: extracted.confidence,
      rawText: extracted.rawText,
      coverUrl: body.imageData ?? null,
    })
    .returning();

  return NextResponse.json({ book: inserted });
}
