import crypto from 'crypto';

const SECRET = process.env.BOOKING_TOKEN_SECRET || 'dev-secret';

export function makeHoldToken(
  roomId: string,
  startIso: string,
  userId: string,
): string {
  const base = `${roomId}|${startIso}|${userId}`;
  return crypto.createHmac('sha256', SECRET).update(base).digest('hex'); // 64 chars
}
