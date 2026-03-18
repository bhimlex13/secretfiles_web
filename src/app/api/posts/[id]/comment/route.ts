import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import Post from '../../../../../models/Post';
import User from '../../../../../models/User';

// Change context: any and await the params
export async function POST(req: Request, context: any) {
  try {
    await connectDB();
    
    // Await params before accessing id
    const params = await context.params;
    const postId = params.id;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const { text } = await req.json();
    const post = await Post.findById(postId); // Use the awaited postId

    if (!post) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    post.comments.push({ user: decoded.id, text });
    await post.save();
    await post.populate('comments.user', 'username');

    return NextResponse.json(post.comments, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}