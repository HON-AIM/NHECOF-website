import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Shared loader for the vendored Fraunces static WOFFs used by OG images.
 *
 * Static WOFFs are vendored locally so OG generation never depends on
 * outbound fonts.googleapis.com calls (satori cannot embed woff2 or
 * multi-axis variable fonts). Literal filenames keep Next's file tracing
 * working for standalone deployments.
 */

export interface OgFontFile {
  data: ArrayBuffer
  name: string
  weight: 500
  style: 'normal' | 'italic'
}

export const FONT_BASE_DIR = join(process.cwd(), 'src', 'assets', 'fonts')
export const FONT_FILES = ['Fraunces-500-normal.woff', 'Fraunces-500-italic.woff'] as const

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

export async function loadFraunces(): Promise<OgFontFile[] | null> {
  try {
    const [normal, italic] = await Promise.all([
      readFile(join(FONT_BASE_DIR, 'Fraunces-500-normal.woff')),
      readFile(join(FONT_BASE_DIR, 'Fraunces-500-italic.woff')),
    ])
    return [
      { data: toArrayBuffer(normal), name: 'Fraunces', weight: 500, style: 'normal' },
      { data: toArrayBuffer(italic), name: 'Fraunces', weight: 500, style: 'italic' },
    ]
  } catch {
    return null
  }
}

/** Word-wrap helper shared by OG templates. */
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars && current) {
      lines.push(current.trim())
      current = word
    } else {
      current = `${current} ${word}`.trim()
    }
  }
  if (current) lines.push(current.trim())
  return lines.slice(0, maxLines)
}