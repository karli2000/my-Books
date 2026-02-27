type ParsedBook = {
  title: string;
  author: string;
  confidence: number;
  rawText: string;
};

const cleanLine = (line: string) => line.replace(/[^\p{L}\p{N}\s:'"\-.,&]/gu, "").trim();

export function parseBookText(rawText: string, confidence: number): ParsedBook {
  const lines = rawText
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 1);

  const likelyTitle = lines.find((line) => line.length > 4 && line.length < 90) ?? "Unknown Title";

  const authorByPattern =
    lines.find((line) => /^by\s+/i.test(line))?.replace(/^by\s+/i, "") ||
    lines.find((line) => /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line));

  return {
    title: likelyTitle,
    author: authorByPattern ?? "Unknown Author",
    confidence: Math.round(confidence),
    rawText,
  };
}
