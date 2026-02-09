import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET /api/auth/me - ดึงข้อมูล user ปัจจุบัน
export async function GET(request) {
  try {
    const token = request.cookies.get('line_token')?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    return NextResponse.json({
      user: {
        userId: decoded.userId,
        lineId: decoded.lineId,
        displayName: decoded.displayName,
        pictureUrl: decoded.pictureUrl,
      },
    });
  } catch (error) {
    // Token expired or invalid
    const response = NextResponse.json({ user: null }, { status: 200 });
    response.cookies.delete('line_token');
    response.cookies.delete('line_profile');
    return response;
  }
}
