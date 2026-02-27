import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const schema = z.object({
  books: z
    .array(
      z.object({
        title: z.string().min(1),
        author: z.string().min(1).default("Unknown Author"),
        confidence: z.number().min(0).max(100).default(60),
      }),
    )
    .max(20)
    .default([]),
});

export async function detectBooksWithLLM(imageData: string) {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterApiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Add it to .env");
  }

  const openrouter = createOpenAI({
    apiKey: openrouterApiKey,
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  });

  // Cheap and strong for visual extraction:
  // qwen/qwen2.5-vl-7b-instruct (typically among the best price/performance options).
  const model = process.env.BOOKS_VISION_MODEL || "qwen/qwen2.5-vl-7b-instruct";

  const { object } = await generateObject({
    model: openrouter.chat(model),
    schema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Detect all visible books in this image. Return one entry per distinct book. Extract title and author as accurately as possible. If uncertain, still include a best guess with lower confidence.",
          },
          {
            type: "image",
            image: imageData,
          },
        ],
      },
    ],
  });

  return object.books;
}
