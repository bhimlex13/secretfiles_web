import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import Post from '../../../../../models/Post';

export async function GET(req: Request, context: any) {
  try {
    await connectDB();
    
    // 1. Await params for Next.js 16 compatibility
    const params = await context.params;
    const { username } = params;
    
    if (!username) {
      return NextResponse.json({ message: 'Username is required' }, { status: 400 });
    }
    
    // 2. Find the user and exclude sensitive data
    // We use .lean() for better performance on GET requests
    const user = await User.findOne({ username })
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
      .populate('followers', 'username')
      .populate('following', 'username')
      .lean();

    if (!user) {
      return NextResponse.json({ message: 'Author not found' }, { status: 404 });
    }

    // 3. Find all public posts by this user
    const posts = await Post.find({ author: user._id, isAnonymous: false })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ user, posts }, { status: 200 });
  } catch (error: any) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ message: error.message || "Unknown Server Error" }, { status: 500 });
  }
}