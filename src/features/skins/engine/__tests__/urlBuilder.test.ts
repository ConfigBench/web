import { buildRenderUrl, getAllSkinVariations, isValidMinecraftIdentifier } from '../urlBuilder';

describe('urlBuilder engine', () => {
  it('builds flat head and overlay helm URLs', () => {
    expect(buildRenderUrl('avatar', 'Eiki', 100, 'png')).toBe('https://mineskin.eu/avatar/Eiki/100.png');
    expect(buildRenderUrl('helm', 'Eiki', 200, 'png')).toBe('https://mineskin.eu/helm/Eiki/200.png');
    expect(buildRenderUrl('helm', 'Eiki', 100, 'svg')).toBe('https://mineskin.eu/helm/Eiki/100.svg');
  });

  it('builds chest / bust URLs with and without armor overlay', () => {
    expect(buildRenderUrl('bust', 'Eiki', 100)).toBe('https://mineskin.eu/bust/Eiki/100.png');
    expect(buildRenderUrl('armor_bust', 'Eiki', 100)).toBe('https://mineskin.eu/armor/bust/Eiki/100.png');
  });

  it('builds full body URLs with and without armor overlay', () => {
    expect(buildRenderUrl('body', 'Eiki', 100)).toBe('https://mineskin.eu/body/Eiki/100.png');
    expect(buildRenderUrl('armor_body', 'Eiki', 100)).toBe('https://mineskin.eu/armor/body/Eiki/100.png');
  });

  it('builds isometric head URLs with and without overlay', () => {
    expect(buildRenderUrl('head', 'Eiki', 100)).toBe('https://mineskin.eu/head/Eiki/100.png');
    expect(buildRenderUrl('headhelm', 'Eiki', 100)).toBe('https://mineskin.eu/headhelm/Eiki/100.png');
  });

  it('builds raw skin and download URLs', () => {
    expect(buildRenderUrl('skin', 'Eiki')).toBe('https://mineskin.eu/skin/Eiki');
    expect(buildRenderUrl('download', 'Eiki')).toBe('https://mineskin.eu/download/Eiki');
  });

  it('clamps sizes between 16 and 512', () => {
    expect(buildRenderUrl('avatar', 'Steve', 5)).toBe('https://mineskin.eu/avatar/Steve/16.png');
    expect(buildRenderUrl('avatar', 'Steve', 1000)).toBe('https://mineskin.eu/avatar/Steve/512.png');
  });

  it('returns empty string for blank targets', () => {
    expect(buildRenderUrl('avatar', '   ')).toBe('');
  });

  it('generates all standard skin variations', () => {
    const list = getAllSkinVariations('Notch', 100, 'png');
    expect(list.length).toBe(9);
    expect(list.some((v) => v.id === 'helm')).toBe(true);
    expect(list.some((v) => v.id === 'armor_body')).toBe(true);
    expect(list.some((v) => v.id === 'skin')).toBe(true);
  });

  it('validates minecraft usernames and uuids', () => {
    expect(isValidMinecraftIdentifier('Eiki')).toBe(true);
    expect(isValidMinecraftIdentifier('Steve')).toBe(true);
    expect(isValidMinecraftIdentifier('Player_123')).toBe(true);
    expect(isValidMinecraftIdentifier('c06f89064c8a49119c29ea1dbd1aab82')).toBe(true);
    expect(isValidMinecraftIdentifier('c06f8906-4c8a-4911-9c29-ea1dbd1aab82')).toBe(true);

    expect(isValidMinecraftIdentifier('ab')).toBe(false);
    expect(isValidMinecraftIdentifier('this_name_is_way_too_long')).toBe(false);
    expect(isValidMinecraftIdentifier('invalid name!')).toBe(false);
  });
});
