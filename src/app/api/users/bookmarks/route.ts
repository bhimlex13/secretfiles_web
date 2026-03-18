import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Post from '../../../../models/Post'; // Needed to populate the bookmarked posts

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await User.findById(decoded.id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'username' }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Reverse the array so the most recently saved items appear first
    return NextResponse.json(user.bookmarks.reverse(), { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}