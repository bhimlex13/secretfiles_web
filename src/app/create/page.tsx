'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AlertCircle, ArrowLeft, Ghost, BookOpen } from 'lucide-react';
import { useTheme } from '../../components/NavigationLayout';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function CreateEntry() {
  const router = useRouter();
  const { isMidnight } = useTheme(); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isAnonymous: true,
    realm: isMidnight ? 'midnight' : 'stranger',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const setRealm = (realmType: 'stranger' | 'midnight') => {
    setFormData(prev => ({ ...prev, realm: realmType }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const strippedContent = formData.content.replace(/<[^>]*>?/gm, '').trim();
    if (!formData.title.trim() || !strippedContent) {
      return setError('Please provide both a title and your entry.');
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      let tagsArray = formData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');
      
      if (formData.realm === 'midnight' && !tagsArray.includes('ghost')) {
        tagsArray.push('ghost');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          tags: tagsArray,
          isAnonymous: formData.isAnonymous
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save entry');

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['clean']
    ],
  }), []);

  return (
    <div className="py-12 px-4 md:px-12 max-w-4xl mx-auto">
      
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-red-500 transition-colors font-serif italic">
          <ArrowLeft className="w-4 h-4" /> Back to entries
        </Link>
      </div>

      <div className="w-full bg-white dark:bg-zinc-950 p-8 md:p-12 shadow-sm relative overflow-hidden border border-[#E5E5E0] dark:border-red-950/50 min-h-[70vh] transition-colors duration-1000">
        
        <div className="absolute left-10 md:left-16 top-0 bottom-0 w-px bg-red-200 dark:bg-red-900/20 z-0"></div>

        <div className="relative z-10 pl-12 md:pl-20">
          <div className="mb-8 border-b border-slate-100 dark:border-red-950/50 pb-6">
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-red-50 mb-2">
              {formData.realm === 'midnight' ? 'Record Sighting' : 'New Entry'}
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 italic text-sm">
              {formData.realm === 'midnight' ? 'Document the unknown. Warn the others.' : 'Format your thoughts beautifully.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-black text-red-600 dark:text-red-500 text-sm flex items-start gap-2 border-l-2 border-red-600 dark:border-red-800">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-3">
              <label className="text-sm font-serif italic text-slate-500 dark:text-zinc-500">Where does this story belong?</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRealm('stranger')}
                  className={`flex items-start gap-3 p-4 border text-left transition-all ${
                    formData.realm === 'stranger' 
                      ? 'border-slate-800 bg-slate-50 dark:bg-zinc-900 dark:border-slate-600 shadow-sm' 
                      : 'border-slate-200 dark:border-zinc-800/50 hover:border-slate-400 dark:hover:border-zinc-700 opacity-70'
                  }`}
                >
                  <BookOpen className={`w-5 h-5 mt-0.5 ${formData.realm === 'stranger' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-zinc-600'}`} />
                  <div>
                    <h3 className={`font-serif font-bold ${formData.realm === 'stranger' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-zinc-500'}`}>Dear Stranger</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Life, love, advice, and daily confessions.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRealm('midnight')}
                  className={`flex items-start gap-3 p-4 border text-left transition-all ${
                    formData.realm === 'midnight' 
                      ? 'border-red-900 bg-red-50/50 dark:bg-black dark:border-red-900/50 shadow-sm' 
                      : 'border-slate-200 dark:border-zinc-800/50 hover:border-slate-400 dark:hover:border-red-900/30 opacity-70'
                  }`}
                >
                  <Ghost className={`w-5 h-5 mt-0.5 ${formData.realm === 'midnight' ? 'text-red-800 dark:text-red-500' : 'text-slate-400 dark:text-zinc-600'}`} />
                  <div>
                    <h3 className={`font-serif font-bold ${formData.realm === 'midnight' ? 'text-red-900 dark:text-red-200' : 'text-slate-500 dark:text-zinc-500'}`}>Midnight Archives</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Paranormal experiences, ghosts, and the eerie.</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                id="title"
                placeholder="Give your entry a title..."
                className="w-full py-2 bg-transparent border-b border-slate-300 dark:border-red-950/50 focus:border-slate-800 dark:focus:border-red-600 outline-none transition-colors text-slate-900 dark:text-red-50 font-serif text-2xl font-bold placeholder:text-slate-300 dark:placeholder:text-zinc-700 placeholder:font-normal"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1 prose-slate dark:prose-invert">
              <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={handleContentChange} 
                modules={modules}
                placeholder={formData.realm === 'midnight' ? "Describe what you saw in the dark..." : "Write your story..."}
              />
            </div>

            <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-red-950/50 mt-4">
              <input
                type="text"
                id="tags"
                placeholder="Additional Tags (comma separated, optional)"
                className="w-full py-2 bg-transparent border-b border-slate-300 dark:border-red-950/50 focus:border-slate-800 dark:focus:border-red-600 outline-none transition-colors text-slate-600 dark:text-zinc-400 placeholder:text-slate-300 dark:placeholder:text-zinc-700 font-serif text-sm mt-4"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  className="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-800 dark:bg-black dark:border-red-950/50 dark:checked:bg-red-800 cursor-pointer"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                />
                <label htmlFor="isAnonymous" className="text-sm text-slate-600 dark:text-zinc-400 font-serif italic cursor-pointer">
                  Publish anonymously
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`text-[#FDFCF8] px-8 py-3 font-serif tracking-wide transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                  formData.realm === 'midnight' 
                    ? 'bg-red-900/80 hover:bg-red-800 dark:text-red-50' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {isSubmitting ? 'Sealing envelope...' : 'Publish Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}