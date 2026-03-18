'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }
    if (!formData.acceptTerms) {
      return toast.error('You must accept the Terms and Conditions to proceed.');
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed due to a server error.');
      }

      toast.success('Identity forged! Please check your email to verify your account.');
      setFormData({ username: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
      
      // Optional: Redirect them to login after a few seconds
      setTimeout(() => router.push('/login'), 3000);

    } catch (err: any) {
      console.error("Registration Error:", err.message);
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-serif selection:bg-slate-200 transition-colors duration-1000">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center fade-in-fast">
        <h1 className="text-4xl font-bold tracking-widest text-slate-900 uppercase">Veil</h1>
        <h2 className="mt-4 text-center text-xl text-slate-600 italic">
          Forge a new identity.
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md fade-in-mid">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#E5E5E0] sm:px-10 relative overflow-hidden">
          
          <div className="absolute left-6 top-0 bottom-0 w-px bg-red-200 z-0 transition-transform duration-700 hover:scale-y-110"></div>

          <form className="space-y-6 relative z-10 pl-6" onSubmit={handleSubmit}>
            
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 italic transition-colors group-focus-within:text-slate-900">Pen Name (Username)</label>
              <div className="mt-1">
                <input
                  type="text"
                  id="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border-b border-slate-300 bg-transparent placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors sm:text-sm"
                />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-sm font-medium text-slate-700 italic transition-colors group-focus-within:text-slate-900">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
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

            <div className="group">
              <label className="block text-sm font-medium text-slate-700 italic transition-colors group-focus-within:text-slate-900">Confirm Password</label>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border-b border-slate-300 bg-transparent placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors sm:text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 mt-2 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 font-sans leading-relaxed">
                  <strong>Our Privacy Promise:</strong> Your anonymity is our highest priority. Your password is cryptographically encrypted (meaning we can never see it), and your email is kept strictly confidential, only accessed if you explicitly request account assistance. Your secrets are safe behind the Veil.
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-1 w-4 h-4 text-slate-800 border-slate-300 focus:ring-slate-800 cursor-pointer"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <label htmlFor="acceptTerms" className="text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                I agree to the Terms and Conditions and promise to treat this space with respect.
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium text-[#FDFCF8] bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-300 disabled:opacity-70 disabled:cursor-wait hover:-translate-y-0.5 shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating identity...</>
                ) : 'Join Veil'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center relative z-10 pl-6">
            <p className="text-sm text-slate-500 italic">
              Already have an identity?{' '}
              <Link href="/login" className="font-medium text-slate-800 hover:text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}