import { useAuthStore } from '../store/authStore';

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
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
          <div className="mt-1 text-white">Configured on the backend with environment variables.</div>
        </div>
      </section>
    </main>
  );
}

