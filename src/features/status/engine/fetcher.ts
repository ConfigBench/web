import type { NormalizedServerStatus, ServerEdition, StatusQueryConfig } from '../types';
import { normalizeMcStatus, normalizeMcSrvStat, normalizeMcStatTgb } from './adapters';

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchFromMcStatus(
  address: string,
  edition: ServerEdition,
  timeoutMs = 5000,
): Promise<NormalizedServerStatus> {
  const start = Date.now();
  const endpoint =
    edition === 'bedrock'
      ? `https://api.mcstatus.io/v2/status/bedrock/${encodeURIComponent(address)}`
      : `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(address)}`;

  const res = await fetchWithTimeout(endpoint, timeoutMs);
  if (!res.ok) {
    throw new Error(`mcstatus.io returned HTTP ${res.status}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const normalized = normalizeMcStatus(data, address, edition);
  normalized.pingMs = Date.now() - start;
  return normalized;
}

export async function fetchFromMcSrvStat(
  address: string,
  edition: ServerEdition,
  timeoutMs = 5000,
): Promise<NormalizedServerStatus> {
  const start = Date.now();
  const endpoint =
    edition === 'bedrock'
      ? `https://api.mcsrvstat.us/bedrock/3/${encodeURIComponent(address)}`
      : `https://api.mcsrvstat.us/3/${encodeURIComponent(address)}`;

  const res = await fetchWithTimeout(endpoint, timeoutMs);
  if (!res.ok) {
    throw new Error(`mcsrvstat.us returned HTTP ${res.status}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const normalized = normalizeMcSrvStat(data, address, edition);
  normalized.pingMs = Date.now() - start;
  return normalized;
}

export async function fetchFromMcStatTgb(
  address: string,
  edition: ServerEdition,
  timeoutMs = 5000,
): Promise<NormalizedServerStatus> {
  const start = Date.now();
  const endpoint = `https://mcstat.tgb.gg/api/${edition}/${encodeURIComponent(address)}`;

  const res = await fetchWithTimeout(endpoint, timeoutMs);
  if (!res.ok) {
    throw new Error(`mcstat.tgb.gg returned HTTP ${res.status}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const normalized = normalizeMcStatTgb(data, address, edition);
  normalized.pingMs = Date.now() - start;
  return normalized;
}

export async function fetchServerStatus(
  config: StatusQueryConfig,
): Promise<NormalizedServerStatus> {
  const { address, edition, provider } = config;
  const cleanedAddress = address.trim();
  if (!cleanedAddress) {
    throw new Error('Please enter a server address.');
  }

  if (provider === 'mcstatus.io') {
    return fetchFromMcStatus(cleanedAddress, edition);
  }
  if (provider === 'mcsrvstat.us') {
    return fetchFromMcSrvStat(cleanedAddress, edition);
  }
  if (provider === 'mcstat.tgb.gg') {
    return fetchFromMcStatTgb(cleanedAddress, edition);
  }

  try {
    return await Promise.any([
      fetchFromMcStatus(cleanedAddress, edition, 4000),
      fetchFromMcSrvStat(cleanedAddress, edition, 4000),
      fetchFromMcStatTgb(cleanedAddress, edition, 4000),
    ]);
  } catch (err) {
    if (err instanceof AggregateError) {
      const messages = err.errors.map((e) => (e instanceof Error ? e.message : String(e)));
      throw new Error(`All providers failed to reach the server:\n${messages.join('\n')}`, { cause: err });
    }
    throw new Error(err instanceof Error ? err.message : String(err), { cause: err });
  }
}
