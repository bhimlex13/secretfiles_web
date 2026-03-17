'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (!formData.acceptTerms) {
      return setError('You must accept the Terms and Conditions to proceed.');
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Registration successful! Please check your email to verify your account.');
      setFormData({ username: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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
            <h1 className="text-4xl font-serif text-slate-800 mb-2">Dear Stranger,</h1>
            <p className="text-slate-500 italic">Please introduce yourself.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm flex items-start gap-2 border-l-2 border-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm flex items-start gap-2 border-l-2 border-green-600">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-1">
              <input
                type="text"
                id="username"
                required
                placeholder="Pen Name"
                className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-slate-800 outline-none transition-colors text-slate-800 placeholder:text-slate-400 font-serif text-lg"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

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
            </div>

            <div className="space-y-1">
              <input
                type="password"
                id="confirmPassword"
                required
                placeholder="Confirm Password"
                className="w-full py-2 bg-transparent border-b border-slate-300 focus:border-slate-800 outline-none transition-colors text-slate-800 placeholder:text-slate-400 font-serif text-lg"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="pt-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-1 w-4 h-4 text-slate-800 border-slate-300 focus:ring-slate-800 cursor-pointer"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <label htmlFor="acceptTerms" className="text-sm text-slate-600 cursor-pointer">
                I agree to the <span className="underline hover:text-slate-800">Terms and Conditions</span> and promise to treat this space with respect.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 bg-slate-800 text-[#FDFCF8] py-3 font-serif tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing...' : 'Begin Writing'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Already have a journal? <Link href="/login" className="text-slate-800 hover:underline italic">Open it here.</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}