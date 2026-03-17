'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function EditEntry() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isAnonymous: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPostData();
  }, [postId]);

  const fetchPostData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
      if (!res.ok) throw new Error('Entry not found');
      const data = await res.json();
      
      setFormData({
        title: data.title,
        content: data.content,
        tags: data.tags.join(', '),
        isAnonymous: data.isAnonymous,
      });
    } catch (err: any) {
      setError('Could not load entry data.');
    } finally {
      setIsLoading(false);
    }
  };

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
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
        method: 'PUT',
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

      if (!res.ok) throw new Error('Failed to update entry');
      router.push('/library');
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

  if (isLoading) return <div className="py-12 px-4 text-center text-slate-500 font-serif italic">Loading pages...</div>;

  return (
    <div className="py-12 px-4 md:px-12 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/library" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-indigo-300 transition-colors font-serif italic">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>
      </div>

      <div className="w-full bg-white dark:bg-[#111827] p-8 md:p-12 shadow-sm relative overflow-hidden border border-[#E5E5E0] dark:border-slate-800 min-h-[70vh] transition-colors duration-1000">
        <div className="absolute left-10 md:left-16 top-0 bottom-0 w-px bg-red-200 dark:bg-transparent"></div>
        <div className="relative z-10 pl-12 md:pl-20">
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-slate-800 dark:text-slate-100 mb-2">Edit Entry</h1>
            <p className="text-slate-500 dark:text-indigo-400 italic text-sm">Revise your thoughts.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm flex items-start gap-2 border-l-2 border-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-1">
              <input type="text" id="title" placeholder="Give your entry a title..." className="w-full py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-indigo-500 outline-none transition-colors text-slate-900 dark:text-slate-100 font-serif text-2xl font-bold" value={formData.title} onChange={handleChange} />
            </div>

            <div className="space-y-1 prose-slate dark:prose-invert">
              <ReactQuill theme="snow" value={formData.content} onChange={handleContentChange} modules={modules} />
            </div>

            <div className="space-y-1 pt-4">
              <input type="text" id="tags" placeholder="Tags (comma separated)" className="w-full py-2 bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-indigo-500 outline-none transition-colors text-slate-600 dark:text-slate-300 font-serif text-sm" value={formData.tags} onChange={handleChange} />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input type="checkbox" id="isAnonymous" className="w-4 h-4 cursor-pointer" checked={formData.isAnonymous} onChange={handleChange} />
              <label htmlFor="isAnonymous" className="text-sm text-slate-600 dark:text-slate-400 font-serif italic cursor-pointer">Publish anonymously</label>
            </div>

            <div className="pt-6 flex justify-end">
              <button type="submit" disabled={isSubmitting} className="bg-slate-800 dark:bg-indigo-600 text-[#FDFCF8] px-8 py-3 font-serif tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-70">
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}