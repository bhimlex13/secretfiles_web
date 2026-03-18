import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Post from '../../../../models/Post';
import User from '../../../../models/User'; // Needed to populate author & comment usernames

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const post = await Post.findById(params.id)
      .populate('author', 'username')
      .populate('comments.user', 'username');

    if (!post) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}