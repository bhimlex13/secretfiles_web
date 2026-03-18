import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

// Change the second argument to 'context: any' to handle async params
export async function POST(req: Request, context: any) {
  try {
    await connectDB();
    
    // IMPORTANT: Await params for Next.js 16 compatibility
    const params = await context.params;
    const { username } = params;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Use the awaited username from params
    const targetUser = await User.findOne({ username });
    const currentUser = await User.findById(decoded.id);

    if (!targetUser || !currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (targetUser._id.toString() === currentUser._id.toString()) {
      return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
    }

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id: any) => id.toString() !== targetUser._id.toString());
      targetUser.followers = targetUser.followers.filter((id: any) => id.toString() !== currentUser._id.toString());
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    return NextResponse.json({ 
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length
    }, { status: 200 });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}