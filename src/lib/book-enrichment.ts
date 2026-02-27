export type EnrichedBook = {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  coverUrl?: string;
};

async function fromOpenLibrary(title: string, author: string): Promise<Partial<EnrichedBook> | null> {
  const q = encodeURIComponent(`${title} ${author}`.trim());
  const url = `https://openlibrary.org/search.json?q=${q}&limit=1`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as { docs?: Array<Record<string, unknown>> };
  const doc = json.docs?.[0];
  if (!doc) return null;

  const isbn = Array.isArray(doc.isbn) ? String(doc.isbn[0]) : undefined;
  const publisher = Array.isArray(doc.publisher) ? String(doc.publisher[0]) : undefined;
  const year = typeof doc.first_publish_year === "number" ? doc.first_publish_year : undefined;
  const coverI = typeof doc.cover_i === "number" ? doc.cover_i : undefined;

  return {
    isbn,
    publisher,
    publishYear: year,
    coverUrl: coverI ? `https://covers.openlibrary.org/b/id/${coverI}-L.jpg` : undefined,
  };
}

async function fromGoogleBooks(title: string, author: string): Promise<Partial<EnrichedBook> | null> {
  const q = encodeURIComponent(`intitle:${title} inauthor:${author}`.trim());
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as { items?: Array<{ volumeInfo?: Record<string, unknown> }> };
  const info = json.items?.[0]?.volumeInfo;
  if (!info) return null;

  const identifiers = Array.isArray(info.industryIdentifiers)
    ? (info.industryIdentifiers as Array<{ type?: string; identifier?: string }>)
    : [];
  const isbn = identifiers.find((id) => id.type?.includes("ISBN"))?.identifier;
  const publisher = typeof info.publisher === "string" ? info.publisher : undefined;
  const publishedDate = typeof info.publishedDate === "string" ? info.publishedDate : undefined;
  const year = publishedDate ? Number.parseInt(publishedDate.slice(0, 4), 10) : undefined;
  const imageLinks = info.imageLinks as { thumbnail?: string } | undefined;

  return {
    isbn,
    publisher,
    publishYear: Number.isFinite(year) ? year : undefined,
    coverUrl: imageLinks?.thumbnail,
  };
}

export async function enrichBook(title: string, author: string): Promise<Partial<EnrichedBook>> {
  const [openLibrary, google] = await Promise.all([
    fromOpenLibrary(title, author).catch(() => null),
    fromGoogleBooks(title, author).catch(() => null),
  ]);

  return {
    ...(google ?? {}),
    ...(openLibrary ?? {}),
  };
}
