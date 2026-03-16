'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, User } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
          <BookOpen className="h-7 w-7" />
          <span>SecretFiles</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href="/browse" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Browse
          </Link>
          <Link href="/create" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            <PenTool className="h-4 w-4" />
            <span>Write a Secret</span>
          </Link>
          
          {/* User Profile Placeholder */}
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 cursor-pointer hover:bg-indigo-200 transition-colors">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}