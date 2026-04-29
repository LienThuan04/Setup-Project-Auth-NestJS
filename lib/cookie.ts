import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import ms, { StringValue } from 'ms';

const COOKIE_NAME = process.env.NEXT_PUBLIC_DEVICE_COOKIE_NAME;
const DEVICEID_COOKIE_EXPIRE = process.env.NEXT_PUBLIC_DEVICE_COOKIE_EXPIRE;
const EXTRA_MS = 10000; // 10s buffer

if (!COOKIE_NAME || COOKIE_NAME.trim() === '') {
  throw new Error('NEXT_PUBLIC_DEVICE_COOKIE_NAME is required');
}
if (!DEVICEID_COOKIE_EXPIRE || DEVICEID_COOKIE_EXPIRE.trim() === '') {
  throw new Error('NEXT_PUBLIC_DEVICE_COOKIE_EXPIRE is required');
}

function parseExpireToDays(value: string): number {
  const pureNumber = Number(value);
  if (!isNaN(pureNumber) && pureNumber > 0) {
    const totalMs = pureNumber * 24 * 60 * 60 * 1000 + EXTRA_MS;
    return Math.ceil(totalMs / (24 * 60 * 60 * 1000));
  }
  const parsedMs = ms(value as StringValue);
  if (!parsedMs || parsedMs <= 0) {
    throw new Error(`Invalid time format: ${value}`);
  }
  const totalMs = parsedMs + EXTRA_MS;
  return Math.max(1, Math.ceil(totalMs / (24 * 60 * 60 * 1000)));
}

const EXPIRE_DAYS = parseExpireToDays(DEVICEID_COOKIE_EXPIRE);

export const ensureDeviceId = (): string => {
  let deviceId = Cookies.get(COOKIE_NAME);

  if (!deviceId) {
    deviceId = uuidv4();
  }

  // Luôn set lại cookie để gia hạn thời gian sống
  Cookies.set(COOKIE_NAME, deviceId, {
    expires: EXPIRE_DAYS,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    withCredentials: true,
  });

  return deviceId;
};

export const getDeviceId = (): string | undefined => {
  return Cookies.get(COOKIE_NAME);
};

export const removeDeviceId = (): void => {
  Cookies.remove(COOKIE_NAME);
};