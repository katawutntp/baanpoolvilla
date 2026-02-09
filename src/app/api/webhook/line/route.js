import { NextResponse } from 'next/server';
import crypto from 'crypto';

// POST /api/webhook/line - รับ Webhook จาก LINE
export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    // ตรวจสอบ signature
    const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET;
    const expectedSignature = crypto
      .createHmac('SHA256', channelSecret)
      .update(body)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('Invalid LINE webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const events = JSON.parse(body).events || [];

    for (const event of events) {
      // Follow event - user เพิ่มเพื่อน OA
      if (event.type === 'follow') {
        console.log('New follower:', event.source.userId);
      }

      // Message event - user ส่งข้อความ
      if (event.type === 'message') {
        console.log('Message from:', event.source.userId, event.message);
        // สามารถตอบกลับอัตโนมัติได้ที่นี่
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET - สำหรับ LINE verify webhook
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
