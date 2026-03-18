'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    identifier: '', // Replaced email with identifier
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success('Welcome back to the archives.');
      router.push('/');

    } catch (err: any) {
      console.error("Login Error:", err.message);
      toast.error(err.message || 'Failed to enter the archives.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-serif selection:bg-slate-200 transition-colors duration-1000">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center fade-in-fast">
        <h1 className="text-4xl font-bold tracking-widest text-slate-900 uppercase">Veil</h1>
        <h2 className="mt-4 text-center text-xl text-slate-600 italic">
          Enter the archives.
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md fade-in-mid">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#E5E5E0] sm:px-10 relative overflow-hidden">
          
          <div className="absolute left-6 top-0 bottom-0 w-px bg-red-200 z-0 transition-transform duration-700 hover:scale-y-110"></div>

          <form className="space-y-6 relative z-10 pl-6" onSubmit={handleSubmit}>
            
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 italic transition-colors group-focus-within:text-slate-900">Email or Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  id="identifier"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border-b border-slate-300 bg-transparent placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors sm:text-sm"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-slate-700 italic transition-colors group-focus-within:text-slate-900">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border-b border-slate-300 bg-transparent placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors sm:text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium text-[#FDFCF8] bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-300 disabled:opacity-70 disabled:cursor-wait hover:-translate-y-0.5 shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Unlocking...</>
                ) : 'Enter'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center relative z-10 pl-6">
            <p className="text-sm text-slate-500 italic">
              Don't have an identity yet?{' '}
              <Link href="/register" className="font-medium text-slate-800 hover:text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}