// LINE Configuration - centralized config
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || process.env.NEXTAUTH_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const LINE_CONFIG = {
  // LINE Login OAuth
  loginChannelId: process.env.LINE_LOGIN_CHANNEL_ID || process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID,
  loginChannelSecret: process.env.LINE_LOGIN_CHANNEL_SECRET,

  // LINE Messaging API
  messagingAccessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN,
  messagingChannelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET,

  // LINE OA
  oaId: process.env.NEXT_PUBLIC_LINE_OA_ID || '@313mzore',

  // URLs
  loginCallbackUrl: `${siteUrl}/api/auth/line/callback`,
  lineOaUrl: `https://line.me/R/oaid/${process.env.NEXT_PUBLIC_LINE_OA_ID || '@313mzore'}`,
};

// LINE Login OAuth URLs
export const LINE_LOGIN_URL = 'https://access.line.me/oauth2/v2.1/authorize';
export const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
export const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

// LINE Messaging API URLs
export const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';
export const LINE_REPLY_URL = 'https://api.line.me/v2/bot/message/reply';
