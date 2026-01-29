import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { PhoneRecord } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) throw new Error('No token');
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function POST(request) {
  try {
    verifyToken(request);
    await connectDB();

    const { name, phone } = await request.json();

    // Check for duplicate
    const existing = await PhoneRecord.findOne({ phone });
    if (existing) {
      return NextResponse.json(
        { error: 'Phone number already exists', duplicate: true },
        { status: 400 }
      );
    }

    const record = await PhoneRecord.create({ name, phone });
    return NextResponse.json(
      { record, message: 'Record created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error.message === 'No token' || error.message === 'Invalid token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Phone number already exists', duplicate: true },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    verifyToken(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      PhoneRecord.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PhoneRecord.countDocuments(),
    ]);

    return NextResponse.json({
      records,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    if (error.message === 'No token' || error.message === 'Invalid token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}