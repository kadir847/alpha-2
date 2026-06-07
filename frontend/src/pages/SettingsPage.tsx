import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getAiStatus } from '../services/api';
import type { AiStatus } from '../types';

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: aiStatus, isLoading, isError } = useQuery<AiStatus>({
    queryKey: ['aiStatus'],
    queryFn: getAiStatus,
    staleTime: 1000 * 60,
  });

  return (
    <main className="flex-1 p-5 md:p-8">
      <section className="max-w-2xl">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="mt-5 rounded-lg border border-line bg-panel p-5">
          <div className="text-sm text-slate-400">Signed in as</div>
          <div className="mt-1 text-white">{user?.email}</div>
        </div>
        <div className="mt-4 rounded-lg border border-line bg-panel p-5">
          <div className="text-sm text-slate-400">Provider</div>
          {isLoading ? (
            <div className="mt-1 text-white">Loading provider status…</div>
          ) : isError || !aiStatus ? (
            <div className="mt-1 text-white">Unable to load provider status.</div>
          ) : (
            <div className="mt-1 space-y-2 text-white">
              <div>
                <span className="font-semibold">Active provider:</span>{' '}
                <span className="capitalize">{aiStatus.active_provider}</span>
              </div>
              <div>
                <span className="font-semibold">Model:</span> {aiStatus.ai_model}
              </div>
              <div>
                <span className="font-semibold">Mode:</span>{' '}
                {aiStatus.demo_mode ? 'Demo mode' : 'Live provider'}
              </div>
              <div className="text-slate-400">Configured on the backend with environment variables.</div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

