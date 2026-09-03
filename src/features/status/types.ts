export type ServerEdition = 'java' | 'bedrock';

export type StatusProvider = 'auto' | 'mcstatus.io' | 'mcsrvstat.us' | 'mcstat.tgb.gg';

export interface PlayerSample {
  name: string;
  id?: string;
}

export interface NormalizedServerStatus {
  online: boolean;
  host: string;
  port: number;
  ip?: string;
  edition: ServerEdition;
  version?: {
    name: string;
    protocol?: number;
  };
  players: {
    online: number;
    max: number;
    sample?: PlayerSample[];
  };
  motd: {
    raw: string;
    clean: string;
    html?: string;
  };
  icon?: string;
  gamemode?: string;
  map?: string;
  srvRecord?: {
    host: string;
    port: number;
  };
  pingMs?: number;
  providerUsed: string;
  debug?: Record<string, unknown>;
}

export interface StatusQueryConfig {
  address: string;
  edition: ServerEdition;
  provider: StatusProvider;
}
