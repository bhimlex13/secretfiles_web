import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import Post from '../../../../../models/Post';
import User from '../../../../../models/User';

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Fetch all posts where the author matches the logged-in user
    const posts = await Post.find({ author: decoded.id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}