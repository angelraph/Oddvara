/**
 * Clean common Tesseract OCR artefacts from bet slip screenshots.
 * Call this on raw OCR output before passing it to the parser.
 */
export function cleanOcrText(raw: string): string {
  let text = raw;

  // Normalise line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Remove control characters (keep \t and \n)
  text = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, ' ');

  // | between word characters → I or l depending on context
  text = text.replace(/(?<=[A-Za-z])\|(?=[A-Za-z])/g, 'l');
  text = text.replace(/(?<=[A-Za-z])\|(?=\s)/g, 'l');
  text = text.replace(/(?<=\s)\|(?=[A-Za-z])/g, 'l');
  text = text.replace(/\|/g, 'I'); // remaining pipes → capital I

  // 0 between letters → O (e.g. "MANCH0STER" → "MANCHESTER")
  text = text.replace(/(?<=[A-Za-z])0(?=[A-Za-z])/g, 'O');

  // Normalise all "vs" separator variants
  text = text.replace(/\bv[\.\s]+s\.?\b/gi, ' vs ');
  text = text.replace(/\bversus\b/gi, ' vs ');
  text = text.replace(/\bV\/S\b/gi, ' vs ');

  // Fix lowercase l immediately before a digit (OCR reads "1" as "l")
  text = text.replace(/\bl(\d)/g, '1$1');

  // Collapse 3+ consecutive blank lines to a double newline
  text = text.replace(/\n{3,}/g, '\n\n');

  // Trim trailing and leading whitespace per line
  text = text
    .split('\n')
    .map((line) => line.replace(/^\s+|\s+$/g, ''))
    .join('\n');

  // Collapse multiple inline spaces
  text = text.replace(/[ \t]{2,}/g, ' ');

  return text.trim();
}
