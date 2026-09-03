import { parseMiniMessage } from '../parse'
import { legacyToMiniMessage } from '../legacy'

describe('parseMiniMessage', () => {
  it('resolves a named color tag', () => {
    const { components, errors } = parseMiniMessage('<red>hi</red>')
    expect(errors).toHaveLength(0)
    expect(components[0].style.color).toBe('red')
    expect(components[0].text).toBe('hi')
  })

  it('handles hex colors', () => {
    const { components } = parseMiniMessage('<#ff0000>x</#ff0000>')
    expect(components[0].style.color).toBe('#ff0000')
  })

  it('interpolates a gradient across the whole text', () => {
    const { components } = parseMiniMessage('<gradient:#ff0000:#0000ff>hello</gradient>')
    expect(components.length).toBeGreaterThan(1)
    expect(components.map((c) => c.text).join('')).toBe('hello')
  })

  it('supports bold decoration via <b> alias', () => {
    const { components, errors } = parseMiniMessage('<b>x</b>')
    expect(errors).toHaveLength(0)
    expect(components[0].style.bold).toBe(true)
  })

  it('applies a self-closing <!bold> to following content', () => {
    const { components } = parseMiniMessage('a<!bold>b')
    expect(components.find((c) => c.text === 'b')?.style.bold).toBe(true)
  })

  it('flags an unmatched closing tag', () => {
    const { errors } = parseMiniMessage('<red>x</blue>')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('leaves PAPI placeholders untouched (strict)', () => {
    const { components, errors } = parseMiniMessage('<green>%player_name%</green>')
    expect(errors).toHaveLength(0)
    expect(components[0].text).toContain('%player_name%')
  })

  it('converts legacy color codes to MiniMessage', () => {
    expect(legacyToMiniMessage('&cRed&r')).toContain('<red>')
    expect(legacyToMiniMessage('&#ff0000')).toContain('<#ff0000>')
  })
})
