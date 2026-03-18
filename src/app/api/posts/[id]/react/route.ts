import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import Post from '../../../../../models/Post';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const { reactionType } = await req.json();
    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    // Access the specific reaction array dynamically
    const reactionArray = post.reactions[reactionType as keyof typeof post.reactions] as any[];
    
    if (!reactionArray) {
       return NextResponse.json({ message: 'Invalid reaction type' }, { status: 400 });
    }

    // Toggle Logic
    const userIndex = reactionArray.indexOf(decoded.id);
    if (userIndex > -1) {
      reactionArray.splice(userIndex, 1); // Remove if already reacted
    } else {
      reactionArray.push(decoded.id); // Add if not reacted
    }

    await post.save();

    return NextResponse.json(post.reactions, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}