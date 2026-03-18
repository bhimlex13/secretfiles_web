import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    // We now look for 'identifier' which can be an email OR a username
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Please provide your email/username and password' }, { status: 400 });
    }

    // Search the database for a matching email OR username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id.toString() }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '30d' }
    );

    return NextResponse.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email, isVerified: user.isVerified } 
    }, { status: 200 });

  } catch (error: any) {
    console.error("LOGIN CRASH:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}