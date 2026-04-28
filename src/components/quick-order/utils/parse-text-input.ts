export interface ParsedEntry {
  code: string;
  quantity: number;
}

/**
 * Parses multi-line text input into an array of product code + quantity entries.
 *
 * Each line is split by comma, semicolon, or whitespace.
 * First token = product code, second token (optional) = quantity (defaults to 1).
 * Empty lines and whitespace-only lines are ignored.
 */
export function parseTextInput(text: string): ParsedEntry[] {
  if (!text || !text.trim()) {
    return [];
  }

  const lines = text.split(/\r?\n/);
  const entries: ParsedEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    // Split by comma, semicolon, or whitespace
    const tokens = trimmed.split(/[,;\s]+/).filter(Boolean);
    if (tokens.length === 0) {
      continue;
    }

    const code = tokens[0].trim();
    if (!code) {
      continue;
    }

    let quantity = 1;
    if (tokens.length >= 2) {
      const parsed = parseInt(tokens[1], 10);
      quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }

    entries.push({ code, quantity });
  }

  return entries;
}
