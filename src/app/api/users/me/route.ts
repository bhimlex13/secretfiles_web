import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function PUT(req: Request) {
  try {
    await connectDB();
    
    // 1. Authenticate the User
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

    // 2. Parse the requested changes
    const { username, email, currentPassword, newPassword } = await req.json();

    // 3. Handle Username Change
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json({ message: 'That pen name is already taken.' }, { status: 400 });
      }
      user.username = username;
    }

    // 4. Handle Email Change (With Verification Lockout)
    if (email && email !== user.email) {
      if (user.isVerified) {
        return NextResponse.json({ message: 'Verified email addresses cannot be changed for security purposes.' }, { status: 403 });
      }
      
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return NextResponse.json({ message: 'That email is already in use.' }, { status: 400 });
      }
      user.email = email;
    }

    // 5. Handle Password Change
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Incorrect current password.' }, { status: 401 });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // 6. Return the updated safe user data
    return NextResponse.json({
      message: 'Profile updated successfully!',
      user: { id: user._id, username: user.username, email: user.email, isVerified: user.isVerified }
    }, { status: 200 });

  } catch (error: any) {
    console.error("EDIT PROFILE API CRASH:", error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token invalid or expired' }, { status: 401 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}