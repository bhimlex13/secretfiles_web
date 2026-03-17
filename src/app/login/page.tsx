'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user info to the browser's local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to the main feed
      router.push('/');
      
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
      {/* The Notebook Page Container */}
      <div className="w-full max-w-md bg-white p-10 shadow-sm relative overflow-hidden border border-[#E5E5E0]">
        
        {/* The Notebook Margin Line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-red-200"></div>

        <div className="relative z-10 pl-4">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-serif text-slate-800 mb-2">Welcome Back,</h1>
            <p className="text-slate-500 italic">Open your journal.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm flex items-start gap-2 border-l-2 border-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-1">
              <input
                type="email"
                id="email"
                required
                placeholder="Email Address"
                className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-slate-800 outline-none transition-colors text-slate-800 placeholder:text-slate-400 font-serif text-lg"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <input
                type="password"
                id="password"
                required
                placeholder="Password"
                className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-slate-800 outline-none transition-colors text-slate-800 placeholder:text-slate-400 font-serif text-lg"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="flex justify-end pt-2">
                <Link href="/forgot-password" className="text-sm text-slate-500 hover:text-slate-800 italic">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-slate-800 text-[#FDFCF8] py-3 font-serif tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Opening...' : 'Read Entries'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Do not have a journal yet? <Link href="/register" className="text-slate-800 hover:underline italic">Create one here.</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}