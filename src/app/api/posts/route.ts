import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import Post from '../../../models/Post';
import User from '../../../models/User';

// 1. GET ALL POSTS (For the Main Feed)
export async function GET() {
  try {
    await connectDB();
    
    // Fetch all posts, populate the author's username, and sort by newest first
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    console.error("API CRASH REASON:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. CREATE A NEW POST (Secure Route)
export async function POST(req: Request) {
  try {
    await connectDB();
    
    // Extract the token from the headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized to create a post' }, { status: 401 });
    }

    // Verify the token securely
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Parse the incoming post data
    const { title, content, isAnonymous, tags } = await req.json();

    // Create the new entry in MongoDB
    const newPost = await Post.create({
      title,
      content,
      author: decoded.id, // We safely get the user ID from the verified token
      isAnonymous: isAnonymous || false,
      tags: tags || [],
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    // Catch token expiration or verification errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
       return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}