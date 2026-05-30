import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="h-10 w-10 rounded-lg bg-accent text-ink grid place-items-center font-black">A2</div>
          <h1 className="mt-5 text-3xl font-semibold tracking-normal">Alpha 2</h1>
          <p className="mt-2 text-sm text-slate-400">Secure AI workspace for focused conversations.</p>
        </div>
        <Outlet />
      </div>
    </main>
  );
}

