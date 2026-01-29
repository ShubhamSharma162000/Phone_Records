import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { User } from "@/lib/models";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    await connectDB();
    const { phone, password } = await request.json();

    // Initialize default user if doesn't exist
    let user = await User.findOne({ phone: "1234567890" });
    if (!user) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      user = await User.create({
        phone: "1234567890",
        password: hashedPassword,
      });
    }

    // Find user
    user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return NextResponse.json({ token, message: "Login successful" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
