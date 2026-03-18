import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
    }

let user = await User.findOne({ email });
if (user) {
  return NextResponse.json({ message: 'User already exists' }, { status: 400 });
}

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(20).toString('hex');

    user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken
    });

    // Email Sending Logic
    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Pointing the verification link back to your Next.js app
      const verifyUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/auth/verifyemail/${verificationToken}`;
      const message = `Welcome to Veil.\n\nPlease verify your email by clicking the link below so you can enter the archives:\n\n${verifyUrl}`;

      await transporter.sendMail({
        from: 'Veil Archives <noreply@veil.com>',
        to: user.email,
        subject: 'Email Verification',
        text: message,
      });

      return NextResponse.json({ message: 'Registration successful. Please check your email to verify your account.' }, { status: 201 });
    } catch (err) {
      console.error('Email error:', err);
      user.verificationToken = undefined;
      await user.save();
      return NextResponse.json({ message: 'Email could not be sent. Account created but unverified.' }, { status: 500 });
    }

} catch (error: any) {
    // Force the error into your VS Code terminal
    console.error("REGISTER API CRASH:", error);
    
    // Send the exact error directly to your frontend Toast notification
    return NextResponse.json({ message: "SERVER CRASH: " + error.message }, { status: 500 });
  }
}