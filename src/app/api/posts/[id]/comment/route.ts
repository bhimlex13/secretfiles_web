import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import Post from '../../../../../models/Post';
import User from '../../../../../models/User'; // Ensure this is imported

export async function POST(req: Request, context: any) {
  try {
    await connectDB();
    
    // 1. Await params for Next.js 16
    const params = await context.params;
    const postId = params.id;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const { text } = await req.json();
    
    // 2. Fetch the post
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    // 3. Add comment and save
    post.comments.push({ user: decoded.id, text });
    await post.save();
    
    // 4. Populate with the User model explicitly registered
    // We pass 'User' as the model to be safe
    await post.populate({ path: 'comments.user', select: 'username', model: User });

    return NextResponse.json(post.comments, { status: 201 });
  } catch (error: any) {
    console.error("Comment API Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}