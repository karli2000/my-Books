"use client";

import { useMemo, useRef, useState } from "react";

type Book = {
  id: string;
  title: string;
  author: string;
  confidence: number;
  createdAt: string;
  isbn?: string | null;
  publisher?: string | null;
  coverUrl?: string | null;
};

export function ScanUploader({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState(initialBooks);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const topBooks = useMemo(() => books.slice(0, 24), [books]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(dataUrl);

    setLoading(true);
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: dataUrl }),
    });
    setLoading(false);

    if (!res.ok) {
      alert("Could not detect and save book");
      return;
    }

    const payload = await res.json();
    const newBooks = (payload.books ?? []) as Book[];
    if (!newBooks.length) {
      alert("No books detected. Try a clearer photo of the shelf/spines.");
      return;
    }
    setBooks((prev) => [...newBooks, ...prev]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 shadow-2xl shadow-amber-900/10">
        <h2 className="mb-3 text-lg font-semibold text-amber-100">Scan a new book</h2>
        <div className="relative overflow-hidden rounded-xl border border-amber-300/20 bg-black">
          <video ref={videoRef} className="h-[320px] w-full object-cover" playsInline muted autoPlay />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={startCamera} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-200">Start camera</button>
          <button onClick={capture} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white">Capture & detect</button>
          <button onClick={stopCamera} className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-400">Stop</button>
        </div>
        {loading && <p className="mt-3 text-sm text-amber-200">Detecting multiple books + fetching ISBN metadata…</p>}
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
        <h2 className="mb-3 text-lg font-semibold text-amber-100">Latest detection</h2>
        {preview ? (
          <img src={preview} alt="captured" className="h-[180px] w-full rounded-lg object-cover" />
        ) : (
          <div className="grid h-[180px] place-items-center rounded-lg border border-dashed border-zinc-600 text-sm text-zinc-400">
            No capture yet
          </div>
        )}
        <p className="mt-3 text-xs text-zinc-400">Tip: frame the book spine or cover with high contrast text.</p>
      </section>

      <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
        <h2 className="mb-3 text-lg font-semibold text-amber-100">My shelf ({books.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topBooks.map((book) => (
            <article key={book.id} className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-3">
              {book.coverUrl ? <img src={book.coverUrl} alt={book.title} className="mb-2 h-28 w-full rounded object-cover" /> : null}
              <h3 className="font-medium text-zinc-100">{book.title}</h3>
              <p className="text-sm text-zinc-300">{book.author}</p>
              <p className="mt-1 text-xs text-amber-300">confidence {book.confidence}%</p>
              {book.isbn ? <p className="text-xs text-zinc-400">ISBN: {book.isbn}</p> : null}
              {book.publisher ? <p className="text-xs text-zinc-500">{book.publisher}</p> : null}
            </article>
          ))}
          {books.length === 0 && <p className="text-sm text-zinc-400">No books yet.</p>}
        </div>
      </section>
    </div>
  );
}
