import { supabaseAdmin, json, originFrom } from './_supabase.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json({}, 200, originFrom(event));
  try {
    const sb = supabaseAdmin();
    const { data: pixelsRow } = await sb.from('settings').select('value').eq('key','pixels').single();
    const { data: tgRow } = await sb.from('settings').select('value').eq('key','telegram').single();
    return json({ pixels: pixelsRow?.value || {}, telegram: tgRow?.value || {} }, 200, originFrom(event));
  } catch (e) { return json({ error: e.message }, 500, originFrom(event)); }
}