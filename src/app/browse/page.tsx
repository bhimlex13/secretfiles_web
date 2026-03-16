// src/app/browse/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { Story } from '../../types';
import StoryCard from '../../components/StoryCard';

export default function BrowseStories() {
    const [stories, setStories] = useState<Story[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories`);
                if (!res.ok) throw new Error('Failed to fetch stories');
                const data = await res.json();
                setStories(data);
            } catch (error) {
                console.error("Error loading stories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStories();
    }, []);

    // Filter stories based on the search query
    const filteredStories = stories.filter((story) => {
        const query = searchQuery.toLowerCase();
        return (
            story.title.toLowerCase().includes(query) ||
            story.content.toLowerCase().includes(query) ||
            story.tags.some(tag => tag.toLowerCase().includes(query))
        );
    });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Browse Secrets</h1>
                <p className="text-slate-600">Search through the archives of anonymous stories and confessions.</p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-10 max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none shadow-sm text-slate-900 transition-all"
                    placeholder="Search by title, keyword, or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            ) : (
                /* Results Grid */
                <div className="space-y-6">
                    {filteredStories.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No secrets found matching your search.</p>
                        </div>
                    ) : (
                        filteredStories.map((story, index) => (
                            <StoryCard key={story._id} story={story} index={index} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}