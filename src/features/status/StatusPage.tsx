import { useEffect, useRef, useState } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import type { NormalizedServerStatus, ServerEdition, StatusProvider, StatusQueryConfig } from './types';
import { fetchServerStatus } from './engine/fetcher';
import { Panel } from '../../shared/components/ui/Panel';
import { StatusQueryForm } from './components/StatusQueryForm';
import { ServerCard } from './components/ServerCard';
import { StatusToasts, type ToastItem } from './components/StatusToasts';

const DEFAULT_CONFIG: StatusQueryConfig = {
  address: '',
  edition: 'java',
  provider: 'auto',
};

function parseInitialQuery(): StatusQueryConfig {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const server = params.get('server');
    const edition = params.get('edition') as ServerEdition | null;
    const provider = params.get('provider') as StatusProvider | null;

    if (server) {
      return {
        address: server,
        edition: edition === 'bedrock' ? 'bedrock' : 'java',
        provider:
          provider && ['auto', 'mcstatus.io', 'mcsrvstat.us', 'mcstat.tgb.gg'].includes(provider)
            ? provider
            : 'auto',
      };
    }
  }

  return DEFAULT_CONFIG;
}

export function StatusPage() {
  const [config, setConfig] = useState<StatusQueryConfig>(parseInitialQuery);
  const [status, setStatus] = useState<NormalizedServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);
  const hasAutoQueried = useRef(false);

  const pushToast = (title: string, description?: string, tone: 'green' | 'red' = 'green') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, title, description, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const runQuery = async (queryConfig: StatusQueryConfig) => {
    setConfig(queryConfig);
    setIsLoading(true);
    setError(null);

    try {
      localStorage.setItem('configbench.status_query', JSON.stringify(queryConfig));
    } catch (e) {
      void e;
    }

    const params = new URLSearchParams();
    params.set('server', queryConfig.address);
    if (queryConfig.edition !== 'java') params.set('edition', queryConfig.edition);
    if (queryConfig.provider !== 'auto') params.set('provider', queryConfig.provider);

    const nextSearch = `?${params.toString()}`;
    if (window.location.search !== nextSearch) {
      window.history.replaceState(null, '', `${window.location.pathname}${nextSearch}`);
    }

    try {
      const result = await fetchServerStatus(queryConfig);
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const server = params.get('server');
      if (!hasAutoQueried.current && server && config.address) {
        hasAutoQueried.current = true;
        void runQuery(config);
      }
    }
  }, [config]);

  return (
    <div className="flex w-full flex-col gap-4 max-w-5xl mx-auto pb-4">
      <Panel title="Server Status" icon={Activity} className="w-full shrink-0">
        <div className="flex flex-col gap-3 p-4">
          <p className="text-xs text-muted max-w-2xl">
            Query Java or Bedrock servers to inspect live connection status, player count, latency,
            and formatted in-game MOTD.
          </p>

          <StatusQueryForm config={config} isLoading={isLoading} onQuery={runQuery} />
        </div>
      </Panel>

      {error && (
        <div className="flex items-start gap-3 rounded-none border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold text-red-200">Unable to reach server</span>
            <pre className="font-mono text-[11px] whitespace-pre-wrap text-red-300/80">
              {error}
            </pre>
          </div>
        </div>
      )}

      {status && (
        <ServerCard
          status={status}
          onCopy={(text, title, desc) => {
            navigator.clipboard.writeText(text);
            pushToast(title, desc);
          }}
        />
      )}

      <StatusToasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
