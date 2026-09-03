import { normalizeMcStatus, normalizeMcSrvStat, normalizeMcStatTgb } from '../adapters';
import { fetchServerStatus } from '../fetcher';
import { parseMinecraftFormatting } from '../motdParser';

describe('normalizeMcStatus', () => {
  it('normalizes an offline response', () => {
    const offlinePayload = { online: false, host: 'offline.hypixel.net', port: 25565 };
    const res = normalizeMcStatus(offlinePayload, 'offline.hypixel.net', 'java');
    expect(res.online).toBe(false);
    expect(res.host).toBe('offline.hypixel.net');
    expect(res.port).toBe(25565);
    expect(res.providerUsed).toBe('mcstatus.io');
    expect(res.players.online).toBe(0);
  });

  it('normalizes an online Java response with players and MOTD', () => {
    const onlinePayload = {
      online: true,
      host: 'mc.hypixel.net',
      port: 25565,
      ip_address: '172.65.238.1',
      version: {
        name_raw: '§eRequires MC 1.8 / 1.21',
        name_clean: 'Requires MC 1.8 / 1.21',
        protocol: 47,
      },
      players: {
        online: 21500,
        max: 200000,
        list: [
          { name_clean: 'PlayerOne', uuid: '1111-2222' },
          { name_clean: 'PlayerTwo', uuid: '3333-4444' },
        ],
      },
      motd: {
        raw: '§aHypixel Network §c[1.8-1.21]\n§6Summer Event is Live!',
        clean: 'Hypixel Network [1.8-1.21]\nSummer Event is Live!',
        html: '<span>Hypixel</span>',
      },
      icon: 'data:image/png;base64,sampleicon',
    };

    const res = normalizeMcStatus(onlinePayload, 'mc.hypixel.net', 'java');
    expect(res.online).toBe(true);
    expect(res.host).toBe('mc.hypixel.net');
    expect(res.ip).toBe('172.65.238.1');
    expect(res.version?.name).toBe('Requires MC 1.8 / 1.21');
    expect(res.version?.protocol).toBe(47);
    expect(res.players.online).toBe(21500);
    expect(res.players.max).toBe(200000);
    expect(res.players.sample?.length).toBe(2);
    expect(res.players.sample?.[0].name).toBe('PlayerOne');
    expect(res.motd.clean).toContain('Hypixel Network');
    expect(res.icon).toBe('data:image/png;base64,sampleicon');
    expect(res.providerUsed).toBe('mcstatus.io');
  });

  it('normalizes Bedrock default port', () => {
    const bedrockOffline = { online: false };
    const res = normalizeMcStatus(bedrockOffline, 'play.takensmp.net', 'bedrock');
    expect(res.port).toBe(19132);
    expect(res.edition).toBe('bedrock');
  });
});

describe('normalizeMcSrvStat', () => {
  it('normalizes mcsrvstat array-based MOTD payload', () => {
    const srvPayload = {
      online: true,
      hostname: 'play.takensmp.net',
      port: 19132,
      ip: '140.235.72.45',
      version: '26.45',
      protocol: { version: 2169, name: 'Bedrock 26.45' },
      players: { online: 8, max: 500, list: ['Alice', 'Bob'] },
      motd: {
        raw: ['TAKENSMP | PLAY.TAKENSMP.NET', 'SOMETHING BIG IS COMING'],
        clean: ['TAKENSMP | PLAY.TAKENSMP.NET', 'SOMETHING BIG IS COMING'],
        html: ['<span>Line 1</span>', '<span>Line 2</span>'],
      },
      icon: 'data:image/png;base64,icon',
      map: 'Survival',
      gamemode: 'Survival',
      debug: { ping: true },
    };

    const res = normalizeMcSrvStat(srvPayload, 'play.takensmp.net', 'bedrock');
    expect(res.online).toBe(true);
    expect(res.host).toBe('play.takensmp.net');
    expect(res.ip).toBe('140.235.72.45');
    expect(res.version?.name).toBe('26.45');
    expect(res.version?.protocol).toBe(2169);
    expect(res.players.online).toBe(8);
    expect(res.players.sample?.length).toBe(2);
    expect(res.players.sample?.[0].name).toBe('Alice');
    expect(res.motd.raw).toBe('TAKENSMP | PLAY.TAKENSMP.NET\nSOMETHING BIG IS COMING');
    expect(res.motd.html).toBe('<span>Line 1</span><br><span>Line 2</span>');
    expect(res.gamemode).toBe('Survival');
    expect(res.map).toBe('Survival');
    expect(res.providerUsed).toBe('mcsrvstat.us');
  });
});

describe('normalizeMcStatTgb', () => {
  it('normalizes mcstat.tgb.gg status structure with favicon and latency', () => {
    const tgbPayload = {
      version: { name: 'Requires MC 1.8 / 1.21', protocol: 47 },
      players: { online: 18591, max: 200000, sample: [{ name: 'Player', id: '123' }] },
      motd: {
        raw: '§aHypixel Network',
        clean: 'Hypixel Network',
        html: '<span style="color: #55FF55;">Hypixel</span>',
      },
      favicon: 'data:image/png;base64,tgbIcon',
      srvRecord: { host: 'mc.hypixel.net', port: 25565 },
      roundTripLatency: 53,
    };

    const res = normalizeMcStatTgb(tgbPayload, 'mc.hypixel.net', 'java');
    expect(res.online).toBe(true);
    expect(res.host).toBe('mc.hypixel.net');
    expect(res.players.online).toBe(18591);
    expect(res.players.max).toBe(200000);
    expect(res.players.sample?.[0].name).toBe('Player');
    expect(res.motd.clean).toBe('Hypixel Network');
    expect(res.motd.html).toContain('Hypixel');
    expect(res.icon).toBe('data:image/png;base64,tgbIcon');
    expect(res.pingMs).toBe(53);
    expect(res.srvRecord?.port).toBe(25565);
    expect(res.providerUsed).toBe('mcstat.tgb.gg');
  });
});

describe('parseMinecraftFormatting', () => {
  it('parses modern hex color codes (§#RRGGBB and &#RRGGBB)', () => {
    const raw = '§#FF0000TakenSMP §#AA00FFBig';
    const lines = parseMinecraftFormatting(raw);
    expect(lines.length).toBe(1);
    expect(lines[0][0].color).toBe('#FF0000');
    expect(lines[0][0].text).toBe('TakenSMP ');
    expect(lines[0][1].color).toBe('#AA00FF');
    expect(lines[0][1].text).toBe('Big');
  });

  it('parses BungeeCord hex formats (§x§r§r§g§g§b§b)', () => {
    const raw = '§x§f§f§b§1§0§7⚡ Gold Text';
    const lines = parseMinecraftFormatting(raw);
    expect(lines.length).toBe(1);
    expect(lines[0][0].color).toBe('#ffb107');
    expect(lines[0][0].text).toBe('⚡ Gold Text');
  });
});

describe('fetchServerStatus validation', () => {
  it('throws early error when address is empty or whitespace', async () => {
    await expect(
      fetchServerStatus({ address: '   ', edition: 'java', provider: 'auto' }),
    ).rejects.toThrow('Please enter a server address.');
  });
});
