import { LINE_CONFIG, LINE_PUSH_URL } from './lineConfig';
import { formatPriceCurrency } from './utils';

async function parseLineErrorResponse(response) {
  try {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

// ส่งข้อความการจองไปยังลูกค้าผ่าน LINE
export async function sendBookingNotification(userLineId, booking) {
  const message = [
    `✅ ได้รับการจองเรียบร้อยแล้ว`,
    ``,
    `🏠 ${booking.villaName}`,
    `📅 เช็คอิน: ${booking.checkIn}`,
    `📅 เช็คเอาท์: ${booking.checkOut}`,
    `🌙 จำนวน ${booking.nights} คืน`,
    `👥 ผู้เข้าพัก ${booking.guests} คน`,
    `💰 ราคารวม: ${typeof booking.totalPrice === 'number' ? formatPriceCurrency(booking.totalPrice) : booking.totalPrice}`,
    ``,
    `📌 สถานะ: รอชำระเงิน`,
    `กรุณาชำระเงินเพื่อยืนยันการจอง`,
    `เจ้าหน้าที่จะติดต่อกลับเร็วที่สุด`,
  ].join('\n');

  try {
    const response = await fetch(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CONFIG.messagingAccessToken}`,
      },
      body: JSON.stringify({
        to: userLineId,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await parseLineErrorResponse(response);
      const requestId = response.headers.get('x-line-request-id') || '';
      console.error('LINE Push API Error:', {
        status: response.status,
        requestId,
        error: errorData,
      });
      return {
        success: false,
        status: response.status,
        requestId,
        error: errorData || 'LINE push failed',
      };
    }

    return {
      success: true,
      status: response.status,
      requestId: response.headers.get('x-line-request-id') || '',
    };
  } catch (error) {
    console.error('LINE send message error:', error);
    return { success: false, status: 0, requestId: '', error: error.message };
  }
}

// ส่ง Flex Message แบบสวยงาม (optional)
export async function sendBookingFlexMessage(userLineId, booking) {
  const flexMessage = {
    type: 'flex',
    altText: `การจอง ${booking.villaName} - ${booking.checkIn}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: booking.villaImage || 'https://via.placeholder.com/400x200',
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '✅ ได้รับการจองแล้ว',
            weight: 'bold',
            size: 'lg',
            color: '#1DB446',
          },
          {
            type: 'text',
            text: booking.villaName,
            weight: 'bold',
            size: 'xl',
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '📅 เช็คอิน', size: 'sm', color: '#555555', flex: 0 },
                  { type: 'text', text: booking.checkIn, size: 'sm', color: '#111111', align: 'end' },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '📅 เช็คเอาท์', size: 'sm', color: '#555555', flex: 0 },
                  { type: 'text', text: booking.checkOut, size: 'sm', color: '#111111', align: 'end' },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '🌙 จำนวนคืน', size: 'sm', color: '#555555', flex: 0 },
                  { type: 'text', text: `${booking.nights} คืน`, size: 'sm', color: '#111111', align: 'end' },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '👥 ผู้เข้าพัก', size: 'sm', color: '#555555', flex: 0 },
                  { type: 'text', text: `${booking.guests} คน`, size: 'sm', color: '#111111', align: 'end' },
                ],
              },
              {
                type: 'separator',
                margin: 'md',
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'md',
                contents: [
                  { type: 'text', text: '💰 ราคารวม', size: 'md', color: '#555555', weight: 'bold', flex: 0 },
                  {
                    type: 'text',
                    text: typeof booking.totalPrice === 'number' ? formatPriceCurrency(booking.totalPrice) : booking.totalPrice,
                    size: 'md',
                    color: '#f97316',
                    weight: 'bold',
                    align: 'end',
                  },
                ],
              },
              {
                type: 'separator',
                margin: 'lg',
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'md',
                contents: [
                  { type: 'text', text: '📌 สถานะ', size: 'md', color: '#555555', weight: 'bold', flex: 0 },
                  {
                    type: 'text',
                    text: 'รอชำระเงิน',
                    size: 'md',
                    color: '#f59e0b',
                    weight: 'bold',
                    align: 'end',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };

  try {
    const response = await fetch(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CONFIG.messagingAccessToken}`,
      },
      body: JSON.stringify({
        to: userLineId,
        messages: [flexMessage],
      }),
    });

    if (!response.ok) {
      const errorData = await parseLineErrorResponse(response);
      const requestId = response.headers.get('x-line-request-id') || '';
      console.error('LINE Flex Message Error:', {
        status: response.status,
        requestId,
        error: errorData,
      });
      return {
        success: false,
        status: response.status,
        requestId,
        error: errorData || 'LINE flex push failed',
      };
    }

    return {
      success: true,
      status: response.status,
      requestId: response.headers.get('x-line-request-id') || '',
    };
  } catch (error) {
    console.error('LINE flex message error:', error);
    return { success: false, status: 0, requestId: '', error: error.message };
  }
}

// ส่งข้อความแจ้งสถานะการจองให้ลูกค้า
export async function sendStatusUpdateMessage(userLineId, booking, status) {
  const statusText = status === 'confirmed'
    ? '✅ ยืนยันการจองแล้ว'
    : '❌ การจองถูกยกเลิก';

  const statusDetail = status === 'confirmed'
    ? 'การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ'
    : 'การจองของคุณถูกยกเลิก หากมีข้อสงสัยกรุณาติดต่อเจ้าหน้าที่';

  const statusColor = status === 'confirmed' ? '#1DB446' : '#dc2626';

  const flexMessage = {
    type: 'flex',
    altText: `${statusText} - ${booking.villaName}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: statusText,
            weight: 'bold',
            size: 'lg',
            color: statusColor,
          },
          {
            type: 'text',
            text: booking.villaName,
            weight: 'bold',
            size: 'xl',
            margin: 'md',
          },
          { type: 'separator', margin: 'lg' },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '📅 เช็คอิน', size: 'sm', color: '#555555', flex: 0 },
                  { type: 'text', text: booking.checkIn, size: 'sm', color: '#111111', align: 'end' },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '📅 เช็คเอาท์', size: 'sm', color: '#555555', flex: 0 },
                  { type: 'text', text: booking.checkOut, size: 'sm', color: '#111111', align: 'end' },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '🌙 จำนวนคืน', size: 'sm', color: '#555555', flex: 0 },
                  { type: 'text', text: `${booking.nights} คืน`, size: 'sm', color: '#111111', align: 'end' },
                ],
              },
            ],
          },
          { type: 'separator', margin: 'lg' },
          {
            type: 'text',
            text: statusDetail,
            size: 'sm',
            color: '#888888',
            margin: 'lg',
            wrap: true,
          },
        ],
      },
    },
  };

  try {
    const response = await fetch(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CONFIG.messagingAccessToken}`,
      },
      body: JSON.stringify({
        to: userLineId,
        messages: [flexMessage],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE status update error:', errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('LINE status update error:', error);
    return { success: false, error: error.message };
  }
}
