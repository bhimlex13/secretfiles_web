// src/components/StoryCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Story } from '../types';
import { Clock, UserCircle } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  index: number;
}

export default function StoryCard({ story, index }: StoryCardProps) {
  // Format the date nicely
  const formattedDate = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
    >
      <h3 className="text-xl font-bold text-slate-800 mb-2">{story.title}</h3>
      
      <p className="text-slate-600 mb-6 line-clamp-3">
        {story.content}
      </p>

      <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <UserCircle className="w-4 h-4" />
          <span className="font-medium text-indigo-600">
            {story.isAnonymous ? 'Anonymous' : story.author}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
}