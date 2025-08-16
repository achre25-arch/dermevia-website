import { createClient } from '@supabase/supabase-js';

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY; // service role
  if (!url || !key) throw new Error('Supabase env missing');
  return createClient(url, key);
}

export function isAdmin(event) {
  try {
    const user = event.clientContext && event.clientContext.user;
    const roles = user?.app_metadata?.roles || [];
    return roles.includes('admin');
  } catch { return false; }
}

export function json(resBody, status = 200, origin = '*') {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    },
    body: JSON.stringify(resBody)
  };
}

export function originFrom(event) {
  const allow = process.env.ALLOWED_ORIGIN || '*';
  return allow;
}