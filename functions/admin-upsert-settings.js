import { supabaseAdmin, isAdmin, json, originFrom } from './_supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json({}, 200, originFrom(event));
  if (!isAdmin(event)) return json({ error: 'forbidden' }, 403, originFrom(event));
  try {
    const body = JSON.parse(event.body || '{}');
    const sb = supabaseAdmin();
    const updates = [];

    if (body.pixels) updates.push(sb.from('settings').upsert({ key: 'pixels', value: body.pixels, updated_at: new Date().toISOString() }));
    if (body.telegram) updates.push(sb.from('settings').upsert({ key: 'telegram', value: body.telegram, updated_at: new Date().toISOString() }));

    await Promise.all(updates);
    return json({ success: true }, 200, originFrom(event));
  } catch (e) { return json({ error: e.message }, 500, originFrom(event)); }
}