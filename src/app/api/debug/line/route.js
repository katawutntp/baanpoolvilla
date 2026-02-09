import { NextResponse } from 'next/server';
import { LINE_CONFIG, LINE_PUSH_URL } from '@/lib/lineConfig';
import { getAllBookings } from '@/lib/firebaseBooking';

// GET /api/debug/line - ทดสอบ LINE Messaging API config
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // Simple auth
  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {};

  // 1. Check env vars
  results.config = {
    hasAccessToken: !!LINE_CONFIG.messagingAccessToken,
    tokenLength: LINE_CONFIG.messagingAccessToken?.length || 0,
    tokenFirst10: LINE_CONFIG.messagingAccessToken?.substring(0, 10) || 'MISSING',
    hasChannelSecret: !!LINE_CONFIG.messagingChannelSecret,
    oaId: LINE_CONFIG.oaId,
  };

  // 2. Verify token by calling LINE Bot Info endpoint
  try {
    const botInfoRes = await fetch('https://api.line.me/v2/bot/info', {
      headers: {
        Authorization: `Bearer ${LINE_CONFIG.messagingAccessToken}`,
      },
    });
    const botInfo = await botInfoRes.json();
    results.botInfo = {
      status: botInfoRes.status,
      data: botInfo,
    };
  } catch (err) {
    results.botInfo = { error: err.message };
  }

  // 3. Check quota
  try {
    const quotaRes = await fetch('https://api.line.me/v2/bot/message/quota', {
      headers: {
        Authorization: `Bearer ${LINE_CONFIG.messagingAccessToken}`,
      },
    });
    const quota = await quotaRes.json();
    results.quota = {
      status: quotaRes.status,
      data: quota,
    };
  } catch (err) {
    results.quota = { error: err.message };
  }

  // 4. Get latest bookings with LINE status
  try {
    const bookings = await getAllBookings();
    results.latestBookings = bookings.slice(0, 5).map((b) => ({
      id: b.id,
      userName: b.userName,
      status: b.status,
      lineMessageSent: b.lineMessageSent,
      lineMessageStatus: b.lineMessageStatus ?? 'N/A',
      lineMessageRequestId: b.lineMessageRequestId || 'N/A',
      lineMessageError: b.lineMessageError || 'N/A',
      userLineId: b.userLineId ? `${b.userLineId.substring(0, 8)}...` : 'MISSING',
      createdAt: b.createdAt,
    }));
  } catch (err) {
    results.latestBookings = { error: err.message };
  }

  // 5. Test push to a specific user (optional)
  const testUserId = searchParams.get('testUser');
  if (testUserId) {
    try {
      const pushRes = await fetch(LINE_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LINE_CONFIG.messagingAccessToken}`,
        },
        body: JSON.stringify({
          to: testUserId,
          messages: [{ type: 'text', text: '🔧 ทดสอบระบบส่งข้อความ BaanPoolVilla' }],
        }),
      });

      const requestId = pushRes.headers.get('x-line-request-id') || '';
      let pushData;
      try {
        const text = await pushRes.text();
        pushData = text ? JSON.parse(text) : {};
      } catch {
        pushData = {};
      }

      results.testPush = {
        status: pushRes.status,
        requestId,
        response: pushData,
        success: pushRes.ok,
      };
    } catch (err) {
      results.testPush = { error: err.message };
    }
  }

  return NextResponse.json(results, { status: 200 });
}
