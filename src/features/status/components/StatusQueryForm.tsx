import { useState, type FormEvent } from 'react';
import { Loader2, Search } from 'lucide-react';
import type { ServerEdition, StatusProvider, StatusQueryConfig } from '../types';

interface StatusQueryFormProps {
  config: StatusQueryConfig;
  isLoading: boolean;
  onQuery: (cfg: StatusQueryConfig) => void;
}

export function StatusQueryForm({ config, isLoading, onQuery }: StatusQueryFormProps) {
  const [address, setAddress] = useState(config.address);
  const [edition, setEdition] = useState<ServerEdition>(config.edition);
  const [provider, setProvider] = useState<StatusProvider>(config.provider);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    onQuery({
      address: address.trim(),
      edition,
      provider,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-none border border-line bg-[#15151f] p-4">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. hypixel.net"
            disabled={isLoading}
            className="mc-input h-10 w-full pl-3 pr-8 font-mono text-xs font-semibold text-text placeholder:text-muted/60"
            aria-label="Minecraft server address"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className="mc-btn flex h-10 items-center justify-center gap-2 px-5 text-xs font-semibold text-[var(--accent)] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Checking…</span>
            </>
          ) : (
            <>
              <Search size={14} />
              <span>Get Server Status</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEdition('java')}
              className={`mc-btn h-7 px-2.5 text-xs ${
                edition === 'java' ? 'border-[var(--accent)] text-[var(--accent)]' : 'text-muted'
              }`}
            >
              Java Edition
            </button>
            <button
              type="button"
              onClick={() => setEdition('bedrock')}
              className={`mc-btn h-7 px-2.5 text-xs ${
                edition === 'bedrock' ? 'border-[var(--accent)] text-[var(--accent)]' : 'text-muted'
              }`}
            >
              Bedrock Edition
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="status-provider-select" className="text-[10px] uppercase text-muted">
              Bridge:
            </label>
            <select
              id="status-provider-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value as StatusProvider)}
              className="mc-select h-7 px-2 font-mono text-[11px] text-text"
            >
              <option value="auto">Auto (Fastest + Fallback)</option>
              <option value="mcstatus.io">mcstatus.io</option>
              <option value="mcsrvstat.us">mcsrvstat.us</option>
              <option value="mcstat.tgb.gg">mcstat.tgb.gg</option>
            </select>
          </div>
        </div>

      </div>
    </form>
  );
}
