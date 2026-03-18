import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import Post from '../../../../../models/Post';

// 1. Change the signature to accept a generic context
export async function GET(req: Request, context: any) {
  try {
    await connectDB();
    
    // 2. IMPORTANT: Safely await the params for Next.js 15 compatibility!
    const params = await context.params;
    const username = params.username;
    
    // Find the user but exclude sensitive data
    const user = await User.findOne({ username })
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
      .populate('followers', 'username')
      .populate('following', 'username');

    if (!user) {
      return NextResponse.json({ message: 'Author not found' }, { status: 404 });
    }

    // Find all public posts by this user
    const posts = await Post.find({ author: user._id, isAnonymous: false })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json({ user, posts }, { status: 200 });
  } catch (error: any) {
    // Add a console.log here so the terminal explicitly tells us if the database fails
    console.error("Profile API Error:", error);
    return NextResponse.json({ message: error.message || "Unknown Server Error" }, { status: 500 });
  }
}