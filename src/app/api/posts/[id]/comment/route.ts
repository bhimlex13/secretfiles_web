import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import Post from '../../../../../models/Post';
import User from '../../../../../models/User';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const { text } = await req.json();
    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    // Push the new comment
    post.comments.push({
      user: decoded.id,
      text
    });

    await post.save();

    // Re-populate the comments array so the frontend immediately gets the username
    await post.populate('comments.user', 'username');

    return NextResponse.json(post.comments, { status: 201 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}