'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookmarkMinus } from 'lucide-react';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchBookmarks(token);
  }, [router]);

  const fetchBookmarks = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch bookmarks');
      
      const data = await res.json();
      const validBookmarks = data.filter((b: any) => b !== null);
      setBookmarks(validBookmarks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/bookmarks/${postId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b._id !== postId));
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  const getCleanSnippet = (htmlContent: string) => {
    if (!htmlContent) return '';
    let text = htmlContent.replace(/<[^>]*>?/gm, '');
    text = text.replace(/&nbsp;/g, ' ')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>');
    return text;
  };

  if (isLoading) {
    return <div className="py-12 px-4 flex items-center justify-center font-serif text-slate-500 dark:text-red-900/50 italic">Opening your saved pages...</div>;
  }

  return (
    <div className="py-12 px-4 md:px-12 max-w-4xl mx-auto">
      
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-red-500 transition-colors font-serif italic">
          <ArrowLeft className="w-4 h-4" /> Back to entries
        </Link>
      </div>

      <div className="w-full bg-white dark:bg-zinc-950 shadow-sm relative overflow-hidden border border-[#E5E5E0] dark:border-red-950/50 min-h-[80vh] transition-colors duration-1000">
        
        <div className="absolute left-10 md:left-16 top-0 bottom-0 w-px bg-red-200 dark:bg-red-900/20 z-0"></div>

        <div className="relative z-10 pl-16 md:pl-24 pr-8 md:pr-12 py-12">
          
          <header className="mb-12 border-b border-slate-100 dark:border-red-950/50 pb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-red-50 mb-2 font-serif">Saved Entries</h1>
            <p className="text-slate-500 dark:text-zinc-500 font-serif italic text-sm">
              Pieces you wanted to keep close.
            </p>
          </header>

          <div className="space-y-12">
            {bookmarks.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-600 font-serif italic">You have not bookmarked any entries yet.</p>
            ) : (
              bookmarks.map((post) => {
                const plainTextSnippet = getCleanSnippet(post.content);

                return (
                  <article key={post._id} className="group border border-slate-100 dark:border-red-950/30 p-6 bg-[#FDFCF8] dark:bg-black hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(153,27,27,0.1)] transition-all duration-500 relative">
                    
                    <button
                      onClick={() => removeBookmark(post._id)}
                      className="absolute top-4 right-4 text-slate-400 dark:text-zinc-700 hover:text-red-600 dark:hover:text-red-500 transition-colors p-2 z-20"
                      title="Remove Bookmark"
                    >
                      <BookmarkMinus className="w-5 h-5" />
                    </button>

                    <Link href={`/entry/${post._id}`}>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-red-100 mb-2 font-serif group-hover:underline decoration-slate-300 dark:decoration-red-900/50 pr-8 break-words">{post.title}</h3>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-600 italic font-serif mb-4">
                      <span>{post.isAnonymous ? 'Anonymous' : post.author?.username || 'Author'}</span>
                      <span>•</span>
                      <time>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                    </div>
                    <div className="prose prose-slate dark:prose-invert mb-2 leading-relaxed">
                      <p className="font-serif text-slate-600 dark:text-zinc-400 line-clamp-4 break-words">
                        {plainTextSnippet}
                      </p>
                    </div>

                    <Link href={`/entry/${post._id}`} className="inline-block text-sm font-serif italic text-slate-500 dark:text-red-800 hover:text-slate-800 dark:hover:text-red-500 transition-colors underline decoration-slate-300 dark:decoration-red-900/30 underline-offset-4 mt-2">
                      Read full entry...
                    </Link>
                  </article>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}