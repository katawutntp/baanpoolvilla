import { NextResponse } from 'next/server';
import { LINE_CONFIG, LINE_LOGIN_URL } from '@/lib/lineConfig';
import crypto from 'crypto';

// GET /api/auth/line - Redirect ไป LINE Login Page
export async function GET(request) {
  if (!LINE_CONFIG.loginChannelId || !LINE_CONFIG.loginChannelSecret) {
    return NextResponse.json(
      { error: 'LINE Login config missing. Please set LINE_LOGIN_CHANNEL_ID and LINE_LOGIN_CHANNEL_SECRET.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawRedirect = searchParams.get('redirect') || '/';
  let redirectTo = '/';
  try {
    if (rawRedirect.startsWith('http')) {
      const parsed = new URL(rawRedirect);
      redirectTo = `${parsed.pathname}${parsed.search}` || '/';
    } else {
      redirectTo = rawRedirect.startsWith('/') ? rawRedirect : `/${rawRedirect}`;
    }
  } catch (e) {
    redirectTo = '/';
  }

  // สร้าง state สำหรับป้องกัน CSRF
  const state = crypto.randomBytes(16).toString('hex');

  // เก็บ state + redirect path ใน cookie
  const stateData = JSON.stringify({ state, redirectTo });
  const stateBase64 = Buffer.from(stateData).toString('base64');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINE_CONFIG.loginChannelId,
    redirect_uri: LINE_CONFIG.loginCallbackUrl,
    state: stateBase64,
    scope: 'profile openid',
    bot_prompt: 'aggressive', // ครั้งแรก: แสดงหน้า Add Friend OA ก่อน consent / ครั้งต่อไป: ข้ามไปเลย
  });

  const lineLoginUrl = `${LINE_LOGIN_URL}?${params.toString()}`;

  return NextResponse.redirect(lineLoginUrl);
}
