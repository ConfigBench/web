const PLACEHOLDER_RE = /%([a-zA-Z0-9_]+)%/g

export function resolvePlaceholders(input: string, overrides?: Record<string, string>): string {
  if (!overrides || Object.keys(overrides).length === 0) return input
  return input.replace(PLACEHOLDER_RE, (whole, key) =>
    Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : whole,
  )
}
