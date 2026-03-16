'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, AlertCircle } from 'lucide-react';

export default function CreateStory() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    isAnonymous: true,
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convert comma separated tags into an array
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];

      const payload = {
        title: formData.title,
        content: formData.content,
        author: formData.isAnonymous ? 'Anonymous' : formData.author,
        isAnonymous: formData.isAnonymous,
        tags: tagsArray
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to post your secret');
      }

      // Redirect back to the home page to see the new story
      router.push('/');
      router.refresh(); 
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Share Your Secret</h1>
        <p className="text-slate-600">Your space to speak freely. Keep it anonymous or use a pen name.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            type="text"
            id="title"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900"
            placeholder="Give your story a title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Content Field */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">The Secret</label>
          <textarea
            id="content"
            required
            rows={6}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-y text-slate-900"
            placeholder="Write your experience here..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        {/* Anonymous Toggle and Author Name Field */}
        <div className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isAnonymous"
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
            />
            <label htmlFor="isAnonymous" className="text-sm font-medium text-slate-700 cursor-pointer">
              Post Anonymously
            </label>
          </div>

          {!formData.isAnonymous && (
            <div className="flex-1">
              <input
                type="text"
                placeholder="Your Pen Name"
                required={!formData.isAnonymous}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-slate-900"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Tags Field */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">Tags (Optional)</label>
          <input
            type="text"
            id="tags"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-slate-900"
            placeholder="e.g. funny, regret, love (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? 'Posting...' : 'Share Secret'}
        </button>
      </form>
    </motion.div>
  );
}