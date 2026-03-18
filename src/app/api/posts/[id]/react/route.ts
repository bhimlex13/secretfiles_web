import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../../lib/mongodb'; // Counted dots based on [id]/react folder
import Post from '../../../../../../models/Post';

// 1. We change the signature to 'context: any' to satisfy the Next.js 16 build constraint
export async function POST(req: Request, context: any) {
  try {
    await connectDB();
    
    // 2. IMPORTANT: We must await context.params in Next.js 16
    const params = await context.params;
    const postId = params.id;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const { reactionType } = await req.json();
    
    // 3. Use the awaited postId
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    // Access the specific reaction array dynamically
    const reactions = post.reactions as any;
    const reactionArray = reactions[reactionType];
    
    if (!reactionArray) {
       return NextResponse.json({ message: 'Invalid reaction type' }, { status: 400 });
    }

    // Toggle Logic
    const userIndex = reactionArray.indexOf(decoded.id);
    if (userIndex > -1) {
      reactionArray.splice(userIndex, 1); 
    } else {
      reactionArray.push(decoded.id); 
    }

    await post.save();

    return NextResponse.json(post.reactions, { status: 200 });
  } catch (error: any) {
    console.error("REACT API ERROR:", error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}