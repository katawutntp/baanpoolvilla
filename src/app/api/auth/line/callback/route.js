import { NextResponse } from 'next/server';
import { LINE_CONFIG, LINE_TOKEN_URL, LINE_PROFILE_URL } from '@/lib/lineConfig';
import { upsertLineUser } from '@/lib/firebaseBooking';
import jwt from 'jsonwebtoken';

// GET /api/auth/line/callback - LINE OAuth Callback
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateBase64 = searchParams.get('state');
  const error = searchParams.get('error');

  // ถ้า user ยกเลิก
  if (error) {
    return NextResponse.redirect(new URL('/?login=cancelled', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?login=error', request.url));
  }

  // อ่าน redirect path จาก state
  let redirectTo = '/';
  try {
    if (stateBase64) {
      const stateData = JSON.parse(Buffer.from(stateBase64, 'base64').toString());
      const rawRedirect = stateData.redirectTo || '/';
      if (rawRedirect.startsWith('http')) {
        const parsed = new URL(rawRedirect);
        redirectTo = `${parsed.pathname}${parsed.search}` || '/';
      } else {
        redirectTo = rawRedirect.startsWith('/') ? rawRedirect : `/${rawRedirect}`;
      }
    }
  } catch (e) {
    // ignore
  }

  try {
    // 1. แลก code เป็น access token
    const tokenRes = await fetch(LINE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINE_CONFIG.loginCallbackUrl,
        client_id: LINE_CONFIG.loginChannelId,
        client_secret: LINE_CONFIG.loginChannelSecret,
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error('LINE Token Error:', errData);
      return NextResponse.redirect(new URL('/?login=error', request.url));
    }

    const tokenData = await tokenRes.json();

    // Log friendship status change (bot_prompt result)
    console.log('LINE Login token response:', {
      friendship_status_changed: tokenData.friendship_status_changed,
      scope: tokenData.scope,
    });

    // 2. ดึง profile ด้วย access token
    const profileRes = await fetch(LINE_PROFILE_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) {
      console.error('LINE Profile Error');
      return NextResponse.redirect(new URL('/?login=error', request.url));
    }

    const profile = await profileRes.json();

    // 2.5 ตรวจสอบว่า user เป็นเพื่อนกับ OA หรือยัง
    let isFriend = false;
    try {
      const friendRes = await fetch('https://api.line.me/friendship/v1/status', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (friendRes.ok) {
        const friendData = await friendRes.json();
        isFriend = friendData.friendFlag === true;
        console.log('LINE Friendship status:', friendData);
      }
    } catch (e) {
      console.error('Friendship check error:', e);
    }

    // 3. สร้างหรืออัปเดต user ใน Firebase (พร้อมสถานะเพื่อน)
    const user = await upsertLineUser({
      ...profile,
      isFriend,
      friendshipChanged: tokenData.friendship_status_changed,
    });

    // 4. สร้าง JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        lineId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl || '',
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '30d' }
    );

    // 5. Redirect พร้อม set cookie
    const requestOrigin = new URL(request.url).origin;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || requestOrigin;
    const response = NextResponse.redirect(new URL(redirectTo, baseUrl));
    response.cookies.set('line_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 วัน
      path: '/',
    });

    // เก็บ public profile ใน cookie (client-side อ่านได้)
    response.cookies.set(
      'line_profile',
      JSON.stringify({
        userId: user.id,
        lineId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl || '',
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      }
    );

    return response;
  } catch (err) {
    console.error('LINE Login Callback Error:', err);
    return NextResponse.redirect(new URL('/?login=error', request.url));
  }
}
