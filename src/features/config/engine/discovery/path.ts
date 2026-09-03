export type PathSegment = string | number

export function pathToString(segments: PathSegment[]): string {
  return segments
    .map((seg) => (typeof seg === 'number' ? `[${seg}]` : String(seg)))
    .join('.')
}
