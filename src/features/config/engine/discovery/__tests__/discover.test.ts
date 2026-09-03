import { discover } from '../walk'

describe('discover', () => {
  it('finds string values with line numbers', () => {
    const result = discover([{ id: 'x', name: 'x.yml', content: 'a: "hi"\nb:\n  - "yo"\n' }])
    expect(result.entries.length).toBe(2)
    expect(result.entries.find((e) => e.source === 'hi')?.line).toBe(1)
    expect(result.entries.find((e) => e.source === 'yo')?.line).toBe(3)
  })

  it('collects yaml errors', () => {
    const result = discover([{ id: 'x', name: 'x.yml', content: 'key: [unclosed' }])
    expect(result.errors.length).toBeGreaterThanOrEqual(1)
    expect(result.totalErrors).toBeGreaterThanOrEqual(1)
  })

  it('skips non-string and empty-string values', () => {
    const result = discover([{ id: 'x', name: 'x.yml', content: 'a: 3\nb: ""\nc: "txt"\n' }])
    expect(result.entries.map((e) => e.source)).toEqual(['txt'])
  })
})
