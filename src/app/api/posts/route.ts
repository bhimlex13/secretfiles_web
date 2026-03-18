import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import Post from '../../../models/Post';
import User from '../../../models/User'; // Essential for .populate()

// 1. GET ALL POSTS (For the Main Feed)
export async function GET() {
  try {
    await connectDB();
    
    // Safety: Ensure User model is registered before populating
    // This prevents "Schema hasn't been registered" errors on Vercel
    const posts = await Post.find()
      .populate({ path: 'author', select: 'username', model: User })
      .sort({ createdAt: -1 })
      .lean(); // .lean() makes the query faster for read-only feeds

    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    console.error("GET POSTS ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. CREATE A NEW POST (Secure Route)
export async function POST(req: Request) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const { title, content, isAnonymous, tags } = await req.json();

    // Basic Validation
    if (!title || !content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    const newPost = await Post.create({
      title,
      content,
      author: decoded.id,
      isAnonymous: isAnonymous || false,
      tags: tags || [],
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
       return NextResponse.json({ message: 'Session expired. Please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}