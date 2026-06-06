import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { login, register } from '../services/api';
import { useAuthStore } from '../store/authStore';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (!email || !password) {
        toast.error('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      console.log('🔐 Attempting', mode === 'login' ? 'login' : 'registration', 'with email:', email);
      const response = mode === 'login' ? await login(email, password) : await register(email, password);
      console.log('✅ Auth successful, storing session');
      setSession(response.access_token, response.user);
      toast.success(`${mode === 'login' ? 'Logged in' : 'Account created'} successfully!`);
      navigate('/');
    } catch (error) {
      let errorMessage = 'Authentication failed';
      let errorDetails = '';
      
      console.error('❌ Auth error:', error);
      
      if (axios.isAxiosError(error)) {
        errorDetails = `Status: ${error.response?.status}`;
        if (error.response?.status === 409) {
          errorMessage = 'Email already registered';
        } else if (error.response?.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response?.status === 422) {
          errorMessage = 'Invalid input format';
          if (error.response?.data?.detail) {
            errorDetails = JSON.stringify(error.response.data.detail);
          }
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message === 'Network Error') {
          errorMessage = 'Cannot connect to server. Is the backend running?';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error('📋 Error Details:', errorDetails || 'No additional details');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-panel p-5 shadow-2xl shadow-black/30">
      <label className="block text-sm text-slate-300">
        Email
        <input
          className="mt-2 h-11 w-full rounded-md border border-line bg-ink px-3 text-white outline-none focus:border-accent"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
        />
      </label>
      <label className="mt-4 block text-sm text-slate-300">
        Password
        <input
          className="mt-2 h-11 w-full rounded-md border border-line bg-ink px-3 text-white outline-none focus:border-accent"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          minLength={8}
          required
        />
      </label>
      <button disabled={loading} className="mt-5 h-11 w-full rounded-md bg-accent text-ink font-semibold disabled:opacity-60">
        {loading ? 'Working...' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
      <p className="mt-4 text-sm text-slate-400">
        {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
        <Link className="text-accent hover:underline" to={mode === 'login' ? '/register' : '/login'}>
          {mode === 'login' ? 'Register' : 'Log in'}
        </Link>
      </p>
    </form>
  );
}

