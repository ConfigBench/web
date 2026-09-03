import { useState } from 'react';
import {
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Globe,
  HardDrive,
  Layers,
  Server,
  Users,
} from 'lucide-react';
import type { NormalizedServerStatus } from '../types';
import { MotdRenderer } from './MotdRenderer';

interface ServerCardProps {
  status: NormalizedServerStatus;
  onCopy: (text: string, title: string, description?: string) => void;
}

export function ServerCard({ status, onCopy }: ServerCardProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMotd, setCopiedMotd] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const fullAddress =
    status.port === 25565 && status.edition === 'java'
      ? status.host
      : status.port === 19132 && status.edition === 'bedrock'
        ? status.host
        : `${status.host}:${status.port}`;

  const handleCopy = (
    text: string,
    title: string,
    description: string,
    setter: (v: boolean) => void,
  ) => {
    setter(true);
    setTimeout(() => setter(false), 1200);
    onCopy(text, title, description);
  };

  const percentFull =
    status.players.max > 0
      ? Math.min(100, Math.round((status.players.online / status.players.max) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-4 rounded-none border border-line bg-[#15151f] p-4">
      <div className="flex flex-col gap-2 rounded-none border border-line/90 bg-[#090910] p-3 shadow-inner max-w-3xl w-full mx-auto">
        <div className="flex items-start gap-3.5">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-none border border-line/60 bg-[#12121d]">
            {status.icon ? (
              <img
                src={status.icon}
                alt={`${status.host} server icon`}
                className="h-full w-full object-contain [image-rendering:pixelated]"
              />
            ) : (
              <Server size={30} className="text-muted/50" />
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between self-stretch min-w-0 overflow-hidden py-0.5">
            <MotdRenderer
              raw={status.motd.raw}
              clean={status.motd.clean}
              html={status.motd.html}
            />
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
            <div className="flex items-center gap-1.5 font-mc text-xs text-[#a6adc8]">
              <span>
                {status.players.online.toLocaleString('en-US')}/
                {status.players.max.toLocaleString('en-US')}
              </span>
              <img
                src="/minecraft_ping_5.png"
                alt="ping"
                className="h-3.5 w-4 object-contain [image-rendering:pixelated]"
              />
            </div>
            {status.pingMs !== undefined && (
              <span className="font-mono text-[10px] text-muted">
                {status.pingMs}ms
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 max-w-3xl w-full mx-auto">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="font-mc text-base font-bold text-text">
            {status.host}
          </span>
          <span className="rounded-none border border-line bg-[#20202e] px-1.5 py-0.5 text-[10px] text-muted uppercase">
            {status.edition}
          </span>
          {status.online ? (
            <span className="flex items-center gap-1.5 rounded-none border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-none border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              OFFLINE
            </span>
          )}
          <span className="text-muted text-[11px]">•</span>
          <span className="text-muted text-[11px]">Port: {status.port}</span>
          {status.ip && (
            <>
              <span className="text-muted text-[11px]">•</span>
              <span className="text-muted text-[11px]">IP: {status.ip}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleCopy(fullAddress, 'Server Address Copied!', fullAddress, setCopiedAddress)
            }
            data-active={copiedAddress}
            className="mc-icon-btn h-8 w-[96px] justify-center rounded-none px-2 text-xs"
            title="Copy server connection address"
          >
            <span key={copiedAddress ? 'check' : 'copy'} className="pop-in flex items-center gap-1.5">
              {copiedAddress ? <Check size={13} /> : <Copy size={13} />}
              {copiedAddress ? 'Copied' : 'Copy IP'}
            </span>
          </button>
          <button
            type="button"
            onClick={() =>
              handleCopy(status.motd.clean, 'MOTD Copied!', status.motd.clean, setCopiedMotd)
            }
            data-active={copiedMotd}
            className="mc-icon-btn h-8 w-[102px] justify-center rounded-none px-2 text-xs"
            title="Copy plain MOTD text"
          >
            <span key={copiedMotd ? 'check' : 'copy'} className="pop-in flex items-center gap-1.5">
              {copiedMotd ? <Check size={13} /> : <Copy size={13} />}
              {copiedMotd ? 'Copied' : 'Copy MOTD'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-none border border-line bg-[#101018] p-3">
          <div className="flex items-center justify-between text-muted text-[11px]">
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-[var(--accent)]" />
              Players
            </span>
            <span className="font-mono">{percentFull}% full</span>
          </div>
          <span className="font-mc text-lg text-text">
            {status.players.online.toLocaleString('en-US')} /{' '}
            {status.players.max.toLocaleString('en-US')}
          </span>
          <div className="mt-1 h-1.5 w-full bg-[#20202e] rounded-none overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${percentFull}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-none border border-line bg-[#101018] p-3">
          <span className="flex items-center gap-1.5 text-muted text-[11px]">
            <Layers size={13} className="text-blue-400" />
            Version
          </span>
          <span className="font-mc text-base text-text truncate" title={status.version?.name}>
            {status.version?.name || 'Unknown'}
          </span>
          {status.version?.protocol !== undefined && (
            <span className="font-mono text-[10px] text-muted">
              Protocol: {status.version.protocol}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 rounded-none border border-line bg-[#101018] p-3">
          <span className="flex items-center gap-1.5 text-muted text-[11px]">
            <Globe size={13} className="text-purple-400" />
            Network
          </span>
          <span className="font-mc text-base text-text truncate">
            {status.ip || status.host}:{status.port}
          </span>
          <span className="font-mono text-[10px] text-muted truncate">
            Bridge: {status.providerUsed}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-none border border-line bg-[#101018] p-3">
          <span className="flex items-center gap-1.5 text-muted text-[11px]">
            <Activity size={13} className="text-amber-400" />
            Mode & World
          </span>
          <span className="font-mc text-base text-text">
            {status.gamemode || 'Standard'}
          </span>
          <span className="font-mono text-[10px] text-muted truncate">
            {status.map ? `Map: ${status.map}` : `Type: ${status.edition.toUpperCase()}`}
          </span>
        </div>
      </div>

      {status.players.sample && status.players.sample.length > 0 && (
        <div className="flex flex-col gap-2 rounded-none border border-line bg-[#101018] p-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Online Players Sample ({status.players.sample.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {status.players.sample.map((p, idx) => (
              <span
                key={p.id || `${p.name}-${idx}`}
                className="rounded-none border border-line bg-[#181826] px-2 py-1 font-mono text-[11px] text-text"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {status.debug && (
        <div className="flex flex-col gap-2 rounded-none border border-line/60 bg-[#0a0a10] p-3">
          <button
            type="button"
            onClick={() => setShowDebug((v) => !v)}
            className="flex items-center justify-between text-left text-xs font-semibold text-muted hover:text-text"
          >
            <span className="flex items-center gap-1.5">
              <HardDrive size={13} />
              Diagnostic & DNS Information
            </span>
            {showDebug ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDebug && (
            <pre className="mt-1 max-h-60 overflow-x-auto rounded-none border border-line/40 bg-[#0d0d17] p-2.5 font-mono text-[11px] text-[#a6adc8]">
              {JSON.stringify(status.debug, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
