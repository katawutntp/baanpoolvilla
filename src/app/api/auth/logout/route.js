import { NextResponse } from 'next/server';

// POST /api/auth/logout - Logout
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('line_token');
  response.cookies.delete('line_profile');
  return response;
}
