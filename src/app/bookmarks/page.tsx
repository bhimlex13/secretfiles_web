'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookmarkMinus, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useTheme } from '../../components/NavigationLayout';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const router = useRouter();
  const { isMidnight } = useTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 6;

  // Reset to page 1 if they search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      setPosts(data.filter((p: any) => p !== null));
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
        setPosts(prev => prev.filter(post => post._id !== postId));
        toast.success('Book removed from saved items.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCleanSnippet = (htmlContent: string) => {
    if (!htmlContent) return '';
    let text = htmlContent.replace(/<[^>]*>?/gm, '');
    return text.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(query) || 
           post.content.toLowerCase().includes(query) ||
           (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(query)));
  });

  // Pagination Logic (Applied to filtered results)
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const quickFilters = isMidnight 
    ? ['Ghost', 'Paranormal', 'Unexplained'] 
    : ['Love', 'Family', 'Work', 'Advice'];

  if (isLoading) return <div className="py-12 px-4 flex items-center justify-center font-serif text-slate-500 dark:text-red-900/50 italic">Retrieving saved pages...</div>;

  return (
    <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto relative fade-in-fast">
      <div className="mb-6 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-red-500 transition-colors font-serif italic">
          <ArrowLeft className="w-4 h-4" /> Back to entries
        </Link>
      </div>

      <header className="mb-12 border-b border-slate-100 dark:border-red-950/50 pb-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-red-50 mb-2 font-serif">Saved Entries</h1>
        <p className="text-slate-500 dark:text-zinc-500 font-serif italic text-sm">
          Stories and encounters you wanted to keep safe.
        </p>
      </header>

      {/* --- Search & Filter Bar --- */}
      {posts.length > 0 && (
        <div className="max-w-2xl mx-auto mb-16 fade-in-mid">
          <div className="relative mb-4">
            <Search className="absolute left-0 top-3 w-5 h-5 text-slate-400 dark:text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search your saved entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-8 bg-transparent border-b border-slate-300 dark:border-red-950/50 focus:border-slate-800 dark:focus:border-red-600 outline-none text-lg placeholder:text-slate-400 dark:placeholder:text-zinc-700 placeholder:italic transition-colors dark:text-zinc-200"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={() => setSearchQuery('')} className="text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-red-400 italic transition-colors">Clear</button>
            {quickFilters.map(filter => (
              <button 
                key={filter}
                onClick={() => setSearchQuery(filter)}
                className="text-xs text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-red-950/50 px-3 py-1 rounded-full hover:border-slate-400 dark:hover:border-red-800 transition-colors hover:-translate-y-0.5"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="max-w-4xl mx-auto">
          <p className="text-slate-500 dark:text-zinc-600 font-serif italic">You haven't bookmarked any entries yet.</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-zinc-600 italic">
          No entries found matching your search.
        </div>
      ) : (
        <div className="fade-in-slow relative">
          <div className="columns-1 lg:columns-2 gap-12 lg:gap-16">
            {currentPosts.map((post: any) => {
              const plainTextSnippet = getCleanSnippet(post.content);

              return (
                <article key={post._id} className="break-inside-avoid mb-12 relative group bg-[#FDFCF8] dark:bg-zinc-950 p-8 rounded-r-2xl rounded-l-md border-y border-r border-[#E5E5E0] dark:border-red-950/30 border-l-[16px] border-l-slate-800 dark:border-l-red-950 shadow-md hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(153,27,27,0.15)] hover:-translate-y-1 transition-all duration-500 min-h-[300px] flex flex-col justify-between">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/10 to-transparent dark:from-black/40 z-0"></div>
                  <div className="relative z-10 flex-grow flex flex-col">
                    
                    <div className="absolute -right-2 top-0">
                      <button onClick={() => removeBookmark(post._id)} className="p-2 inline-block rounded-full transition-colors text-slate-800 dark:text-red-500 hover:bg-slate-100 dark:hover:bg-red-900/30" title="Remove Bookmark">
                        <BookmarkMinus className="w-5 h-5" />
                      </button>
                    </div>

                    <header className="mb-6 pr-8">
                      <Link href={`/entry/${post._id}`}>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-red-100 mb-3 leading-snug hover:underline decoration-slate-300 dark:decoration-red-900/50 break-words font-serif">{post.title}</h2>
                      </Link>
                      <div className="flex flex-col gap-1 text-sm text-slate-500 dark:text-zinc-500 italic font-serif">
                        <span>By {post.isAnonymous ? 'Anonymous' : (typeof post.author === 'object' ? post.author?.username : 'Author')}</span>
                        <time className="text-xs">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                      </div>
                    </header>
                    
                    <div className="prose prose-slate dark:prose-invert mb-6 leading-relaxed flex-grow">
                      <p className="line-clamp-4 text-slate-600 dark:text-zinc-400 break-words font-serif">{plainTextSnippet}</p>
                    </div>

                    <div>
                      <Link href={`/entry/${post._id}`} className="inline-block mb-6 text-sm font-serif italic text-slate-500 dark:text-red-800 hover:text-slate-800 dark:hover:text-red-500 transition-colors underline decoration-slate-300 dark:decoration-red-900/30 underline-offset-4 mt-2">
                        Open book...
                      </Link>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-auto">
                          {post.tags.map((tag: string, index: number) => (
                            <span key={index} className="text-xs text-slate-500 dark:text-zinc-600 border border-slate-200 dark:border-red-950/30 px-2 py-1 rounded-sm font-serif transition-colors hover:bg-slate-50 dark:hover:bg-red-900/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-8 mb-12 border-t border-slate-200 dark:border-red-950/50 pt-8">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:text-slate-600">
                <ChevronLeft className="w-5 h-5" /> <span className="text-sm font-serif italic">Previous Pages</span>
              </button>
              <span className="font-serif text-sm text-slate-500 dark:text-zinc-500">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:hover:text-slate-600">
                <span className="text-sm font-serif italic">Next Pages</span> <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}