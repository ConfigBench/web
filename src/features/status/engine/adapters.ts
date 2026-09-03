import type { NormalizedServerStatus, PlayerSample, ServerEdition } from '../types';

export function normalizeMcStatus(
  data: Record<string, unknown>,
  host: string,
  edition: ServerEdition,
): NormalizedServerStatus {
  const isOnline = Boolean(data.online);
  const resolvedHost = typeof data.host === 'string' ? data.host : host;
  const defaultPort = edition === 'bedrock' ? 19132 : 25565;
  const resolvedPort = typeof data.port === 'number' ? data.port : defaultPort;

  if (!isOnline) {
    return {
      online: false,
      host: resolvedHost,
      port: resolvedPort,
      edition,
      players: { online: 0, max: 0 },
      motd: { raw: '', clean: '' },
      providerUsed: 'mcstatus.io',
    };
  }

  const versionData = data.version as Record<string, unknown> | undefined;
  const playersData = data.players as Record<string, unknown> | undefined;
  const motdData = data.motd as Record<string, unknown> | undefined;

  let sample: PlayerSample[] | undefined;
  if (Array.isArray(playersData?.list)) {
    sample = playersData.list.map((item) => {
      const p = item as Record<string, unknown>;
      return {
        name: String(p.name_clean || p.name_raw || ''),
        id: typeof p.uuid === 'string' ? p.uuid : undefined,
      };
    });
  }

  return {
    online: true,
    host: resolvedHost,
    port: resolvedPort,
    ip: typeof data.ip_address === 'string' ? data.ip_address : undefined,
    edition,
    version: versionData
      ? {
          name: String(versionData.name_clean || versionData.name_raw || 'Unknown'),
          protocol: typeof versionData.protocol === 'number' ? versionData.protocol : undefined,
        }
      : undefined,
    players: {
      online: Number(playersData?.online) || 0,
      max: Number(playersData?.max) || 0,
      sample,
    },
    motd: {
      raw: String(motdData?.raw || ''),
      clean: String(motdData?.clean || ''),
      html: typeof motdData?.html === 'string' ? motdData.html : undefined,
    },
    icon: typeof data.icon === 'string' ? data.icon : undefined,
    gamemode: typeof data.gamemode === 'string' ? data.gamemode : undefined,
    map: typeof data.map === 'string' ? data.map : undefined,
    srvRecord: data.srv_record as { host: string; port: number } | undefined,
    providerUsed: 'mcstatus.io',
    debug: data,
  };
}

export function normalizeMcSrvStat(
  data: Record<string, unknown>,
  host: string,
  edition: ServerEdition,
): NormalizedServerStatus {
  const isOnline = Boolean(data.online);
  const resolvedHost = typeof data.hostname === 'string' ? data.hostname : host;
  const defaultPort = edition === 'bedrock' ? 19132 : 25565;
  const resolvedPort = typeof data.port === 'number' ? data.port : defaultPort;

  if (!isOnline) {
    return {
      online: false,
      host: resolvedHost,
      port: resolvedPort,
      edition,
      players: { online: 0, max: 0 },
      motd: { raw: '', clean: '' },
      providerUsed: 'mcsrvstat.us',
    };
  }

  const playersData = data.players as Record<string, unknown> | undefined;
  const motdData = data.motd as Record<string, unknown> | undefined;
  const protocolData = data.protocol as Record<string, unknown> | undefined;

  let rawMotd = '';
  let cleanMotd = '';
  let htmlMotd = '';

  if (motdData) {
    if (Array.isArray(motdData.raw)) {
      rawMotd = motdData.raw.map(String).join('\n');
    } else if (typeof motdData.raw === 'string') {
      rawMotd = motdData.raw;
    }

    if (Array.isArray(motdData.clean)) {
      cleanMotd = motdData.clean.map(String).join('\n');
    } else if (typeof motdData.clean === 'string') {
      cleanMotd = motdData.clean;
    }

    if (Array.isArray(motdData.html)) {
      htmlMotd = motdData.html.map(String).join('<br>');
    } else if (typeof motdData.html === 'string') {
      htmlMotd = motdData.html;
    }
  }

  let sample: PlayerSample[] | undefined;
  if (Array.isArray(playersData?.list)) {
    sample = playersData.list.map((item) => {
      if (typeof item === 'string') return { name: item };
      const p = item as Record<string, unknown>;
      return {
        name: String(p.name || ''),
        id: typeof p.uuid === 'string' ? p.uuid : undefined,
      };
    });
  }

  const versionName =
    typeof data.version === 'string'
      ? data.version
      : typeof protocolData?.name === 'string'
        ? protocolData.name
        : 'Unknown';

  return {
    online: true,
    host: resolvedHost,
    port: resolvedPort,
    ip: typeof data.ip === 'string' ? data.ip : undefined,
    edition,
    version: {
      name: versionName,
      protocol: typeof protocolData?.version === 'number' ? protocolData.version : undefined,
    },
    players: {
      online: Number(playersData?.online) || 0,
      max: Number(playersData?.max) || 0,
      sample,
    },
    motd: {
      raw: rawMotd,
      clean: cleanMotd,
      html: htmlMotd || undefined,
    },
    icon: typeof data.icon === 'string' ? data.icon : undefined,
    map: typeof data.map === 'string' ? data.map : undefined,
    gamemode: typeof data.gamemode === 'string' ? data.gamemode : undefined,
    providerUsed: 'mcsrvstat.us',
    debug: typeof data.debug === 'object' && data.debug !== null ? (data.debug as Record<string, unknown>) : data,
  };
}

export function normalizeMcStatTgb(
  data: Record<string, unknown>,
  host: string,
  edition: ServerEdition,
): NormalizedServerStatus {
  const isOnline = Boolean(
    data.online ?? (data.version || data.players || data.motd || data.status === 'online'),
  );
  const defaultPort = edition === 'bedrock' ? 19132 : 25565;
  const resolvedPort = typeof data.port === 'number' ? data.port : defaultPort;

  if (!isOnline) {
    return {
      online: false,
      host,
      port: resolvedPort,
      edition,
      players: { online: 0, max: 0 },
      motd: { raw: '', clean: '' },
      providerUsed: 'mcstat.tgb.gg',
    };
  }

  const playersData = data.players as Record<string, unknown> | undefined;
  const motdData = data.motd as Record<string, unknown> | undefined;
  const versionData = data.version as Record<string, unknown> | undefined;

  let rawMotd = '';
  let cleanMotd = '';
  let htmlMotd: string | undefined;

  if (typeof data.motd === 'string') {
    rawMotd = data.motd;
    cleanMotd = data.motd;
  } else if (motdData) {
    rawMotd = String(motdData.raw || motdData.clean || '');
    cleanMotd = String(motdData.clean || motdData.raw || '');
    htmlMotd = typeof motdData.html === 'string' ? motdData.html : undefined;
  }

  let sample: PlayerSample[] | undefined;
  if (Array.isArray(playersData?.sample)) {
    sample = playersData.sample.map((p) => {
      const item = p as Record<string, unknown>;
      return {
        name: String(item.name || ''),
        id: typeof item.id === 'string' ? item.id : undefined,
      };
    });
  }

  const iconUrl =
    typeof data.favicon === 'string'
      ? data.favicon
      : typeof data.icon === 'string'
        ? data.icon
        : undefined;

  const versionName =
    typeof data.version === 'string'
      ? data.version
      : typeof versionData?.name === 'string'
        ? versionData.name
        : 'Unknown';

  return {
    online: true,
    host,
    port: resolvedPort,
    ip: typeof data.ip === 'string' ? data.ip : undefined,
    edition,
    version: {
      name: versionName,
      protocol: typeof versionData?.protocol === 'number' ? versionData.protocol : undefined,
    },
    players: {
      online: Number(playersData?.online) || Number(data.onlinePlayers) || 0,
      max: Number(playersData?.max) || Number(data.maxPlayers) || 0,
      sample,
    },
    motd: {
      raw: rawMotd,
      clean: cleanMotd,
      html: htmlMotd,
    },
    icon: iconUrl,
    pingMs: typeof data.roundTripLatency === 'number' ? data.roundTripLatency : undefined,
    srvRecord: data.srvRecord as { host: string; port: number } | undefined,
    providerUsed: 'mcstat.tgb.gg',
    debug: data,
  };
}
