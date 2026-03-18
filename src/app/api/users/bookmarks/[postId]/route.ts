import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export async function POST(req: Request, { params }: { params: { postId: string } }) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isBookmarked = user.bookmarks.includes(params.postId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter((id: any) => id.toString() !== params.postId);
    } else {
      // Add bookmark
      user.bookmarks.push(params.postId);
    }

    await user.save();
    return NextResponse.json({ bookmarks: user.bookmarks }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}