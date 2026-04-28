import { parseTextInput } from './parse-text-input';
import type { ParsedEntry } from './parse-text-input';

describe('parseTextInput', () => {
  it('returns a single product code with default quantity 1', () => {
    const result = parseTextInput('ABC');
    expect(result).toEqual<ParsedEntry[]>([{ code: 'ABC', quantity: 1 }]);
  });

  it('returns a code with explicit quantity', () => {
    const result = parseTextInput('ABC 5');
    expect(result).toEqual<ParsedEntry[]>([{ code: 'ABC', quantity: 5 }]);
  });

  it('parses multiple lines into correct array', () => {
    const input = 'ABC 2\nDEF 3\nGHI 1';
    const result = parseTextInput(input);
    expect(result).toEqual<ParsedEntry[]>([
      { code: 'ABC', quantity: 2 },
      { code: 'DEF', quantity: 3 },
      { code: 'GHI', quantity: 1 },
    ]);
  });

  it('parses comma-separated codes on a single line', () => {
    const result = parseTextInput('ABC,5');
    expect(result).toEqual<ParsedEntry[]>([{ code: 'ABC', quantity: 5 }]);
  });

  it('parses semicolon-separated codes', () => {
    const result = parseTextInput('ABC;3');
    expect(result).toEqual<ParsedEntry[]>([{ code: 'ABC', quantity: 3 }]);
  });

  it('returns empty array for empty input', () => {
    expect(parseTextInput('')).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    expect(parseTextInput('   \n  \n  ')).toEqual([]);
  });

  it('defaults to quantity 1 when quantity is NaN', () => {
    const result = parseTextInput('ABC xyz');
    expect(result).toEqual<ParsedEntry[]>([{ code: 'ABC', quantity: 1 }]);
  });

  it('defaults to quantity 1 when quantity is less than 1', () => {
    const result = parseTextInput('ABC 0');
    expect(result).toEqual<ParsedEntry[]>([{ code: 'ABC', quantity: 1 }]);
  });

  it('handles mixed valid and invalid lines', () => {
    const input = 'ABC 2\n\n   \nDEF notanumber\nGHI 10';
    const result = parseTextInput(input);
    expect(result).toEqual<ParsedEntry[]>([
      { code: 'ABC', quantity: 2 },
      { code: 'DEF', quantity: 1 },
      { code: 'GHI', quantity: 10 },
    ]);
  });

  it('handles Windows-style line endings (CRLF)', () => {
    const input = 'ABC 2\r\nDEF 3';
    const result = parseTextInput(input);
    expect(result).toEqual<ParsedEntry[]>([
      { code: 'ABC', quantity: 2 },
      { code: 'DEF', quantity: 3 },
    ]);
  });

  it('trims whitespace around codes', () => {
    const result = parseTextInput('  ABC  5  ');
    expect(result).toEqual<ParsedEntry[]>([{ code: 'ABC', quantity: 5 }]);
  });

  it('returns empty array for null-ish input', () => {
    expect(parseTextInput(null as unknown as string)).toEqual([]);
    expect(parseTextInput(undefined as unknown as string)).toEqual([]);
  });
});
