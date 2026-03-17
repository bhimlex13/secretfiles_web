'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Bookmark } from 'lucide-react';

export default function EntryPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id as string;

    const [post, setPost] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        
        fetchPost();
        
        if (token) {
            checkBookmarkStatus(token);
        }
    }, [postId]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
            if (!res.ok) throw new Error('Failed to fetch entry');
            const data = await res.json();
            setPost(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkBookmarkStatus = async (token: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/bookmarks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const isSaved = data.some((b: any) => b && b._id === postId);
                setIsBookmarked(isSaved);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBookmark = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/bookmarks/${postId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIsBookmarked(data.bookmarks.includes(postId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReaction = async (type: string) => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/react`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reactionType: type }),
            });

            if (res.ok) {
                const updatedReactions = await res.json();
                setPost((prev: any) => ({ ...prev, reactions: updatedReactions }));
            }
        } catch (error) {
            console.error('Failed to react:', error);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !currentUser) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: commentText }),
            });

            if (res.ok) {
                const updatedComments = await res.json();
                setPost((prev: any) => ({ ...prev, comments: updatedComments }));
                setCommentText('');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasReacted = (type: string) => {
        if (!currentUser || !post?.reactions?.[type]) return false;
        return post.reactions[type].includes(currentUser.id);
    };

    const ReactionButton = ({ type, emoji, label }: { type: string, emoji: string, label: string }) => {
        const count = post?.reactions?.[type]?.length || 0;
        const active = hasReacted(type);

        return (
            <button
                onClick={() => handleReaction(type)}
                className={`text-sm transition-colors border px-4 py-2 rounded-full flex items-center gap-2 ${active
                        ? 'bg-slate-800 dark:bg-red-900/30 text-white dark:text-red-400 border-slate-800 dark:border-red-900/50'
                        : 'text-slate-600 dark:text-zinc-500 border-slate-200 dark:border-red-950/30 hover:border-slate-800 dark:hover:border-red-900/50 hover:text-slate-900 dark:hover:text-red-400 bg-white dark:bg-transparent'
                    }`}
            >
                <span>{emoji}</span>
                <span className="font-medium">{label}</span>
                {count > 0 && <span className={`ml-1 ${active ? 'text-slate-200 dark:text-red-300' : 'text-slate-400 dark:text-zinc-600'}`}>({count})</span>}
            </button>
        );
    };

    if (isLoading) {
        return <div className="py-12 px-4 flex items-center justify-center font-serif italic text-slate-500 dark:text-red-900/50">Reading page...</div>;
    }

    if (!post) {
        return <div className="py-12 px-4 flex items-center justify-center font-serif text-slate-800 dark:text-zinc-500">Entry not found.</div>;
    }

    return (
        <div className="py-12 px-4 md:px-12 max-w-4xl mx-auto">

            <div className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-red-500 transition-colors font-serif italic">
                    <ArrowLeft className="w-4 h-4" /> Back to entries
                </Link>
            </div>

            <div className="w-full bg-white dark:bg-zinc-950 shadow-sm relative overflow-hidden border border-[#E5E5E0] dark:border-red-950/50 transition-colors duration-1000">

                <div className="absolute left-10 md:left-16 top-0 bottom-0 w-px bg-red-200 dark:bg-transparent z-0"></div>

                <div className="relative z-10 pl-16 md:pl-24 pr-8 md:pr-12 py-12">

                    <div className="absolute top-8 right-8 z-20">
                        <button
                            onClick={handleBookmark}
                            className={`p-3 rounded-full transition-colors ${
                                isBookmarked
                                    ? 'text-slate-800 dark:text-red-500 bg-slate-100 dark:bg-red-950/30'
                                    : 'text-slate-400 dark:text-zinc-700 hover:text-slate-800 dark:hover:text-red-500 hover:bg-slate-50 dark:hover:bg-red-900/10'
                            }`}
                            title={isBookmarked ? "Remove bookmark" : "Save for later"}
                        >
                            <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    <header className="mb-8 pr-12">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-red-50 mb-4 leading-tight font-serif break-words">{post.title}</h1>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 italic font-serif">
                            <span>By {post.isAnonymous ? 'Anonymous' : (typeof post.author === 'object' ? post.author.username : 'Author')}</span>
                            <span>•</span>
                            <time>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                        </div>
                    </header>

                    <div
                        className="prose prose-slate dark:prose-invert prose-lg max-w-none mb-12 font-serif text-slate-800 dark:text-zinc-300 leading-loose break-words"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-12">
                            {post.tags.map((tag: string, index: number) => (
                                <span key={index} className="text-sm text-slate-500 dark:text-zinc-600 border border-slate-200 dark:border-red-950/50 px-3 py-1 rounded-sm font-serif">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-slate-100 dark:border-red-950/50 pt-8 mb-12">
                        <h3 className="text-slate-500 dark:text-zinc-500 italic font-serif mb-4 text-sm">How does this make you feel?</h3>
                        <div className="flex flex-wrap gap-3">
                            <ReactionButton type="support" emoji="🤝" label="Support" />
                            <ReactionButton type="relate" emoji="🫂" label="Relate" />
                            <ReactionButton type="insightful" emoji="💡" label="Insightful" />
                            <ReactionButton type="happy" emoji="😊" label="Happy" />
                            <ReactionButton type="sad" emoji="😢" label="Sad" />
                            <ReactionButton type="angry" emoji="😠" label="Angry" />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-red-950/50 pt-8">
                        <h3 className="text-2xl font-serif text-slate-800 dark:text-red-100 mb-8">Thoughts & Reflections ({post.comments?.length || 0})</h3>

                        <div className="space-y-8 mb-10">
                            {post.comments?.map((comment: any) => (
                                <div key={comment._id} className="bg-slate-50 dark:bg-black p-6 border border-slate-100 dark:border-red-950/30">
                                    <p className="font-serif text-slate-800 dark:text-zinc-300 mb-3 break-words">{comment.text}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-600 italic font-serif">
                                        Written by {comment.user?.username || 'Someone'}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {currentUser ? (
                            <form onSubmit={handleComment} className="relative">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full p-4 pr-14 bg-[#FDFCF8] dark:bg-zinc-900 border border-slate-300 dark:border-red-950/50 focus:border-slate-800 dark:focus:border-red-600 outline-none font-serif resize-y dark:text-zinc-200 placeholder:dark:text-zinc-600"
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="absolute right-4 bottom-4 text-slate-400 dark:text-zinc-600 hover:text-slate-800 dark:hover:text-red-500 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        ) : (
                            <div className="bg-slate-50 dark:bg-black p-6 text-center border border-slate-100 dark:border-red-950/30">
                                <p className="font-serif text-slate-600 dark:text-zinc-500 italic">
                                    Please <Link href="/login" className="text-slate-800 dark:text-red-600 underline">log in</Link> to leave a thought.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}