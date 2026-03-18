import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import Post from '../../../../models/Post';

// Change the second argument to 'context: any'
export async function POST(req: Request, context: any) {
  try {
    await connectDB();
    
    // IMPORTANT: Await the params before accessing the id
    const params = await context.params;
    const { id } = params;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const { reactionType } = await req.json();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    }

    const reactionArray = post.reactions[reactionType] as any[];
    if (!reactionArray) {
       return NextResponse.json({ message: 'Invalid reaction type' }, { status: 400 });
    }

    const userIndex = reactionArray.indexOf(decoded.id);
    if (userIndex > -1) {
      reactionArray.splice(userIndex, 1);
    } else {
      reactionArray.push(decoded.id);
    }

    await post.save();
    return NextResponse.json(post.reactions, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}