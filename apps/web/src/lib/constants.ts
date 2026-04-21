// IMPORTANT:
// These MUST be overridden in production via env vars.
// Defaults are intentionally local/dev-friendly to avoid accidentally pointing to the original domains.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const PLAY_STORE = 'https://play.google.com/store/apps/details?id=uz.osonprava.app';
export const APP_STORE = 'https://apps.apple.com/uz/app/oson-prava/id6759248402';
export const YANDEX_METRIKA_ID = '106763806';
