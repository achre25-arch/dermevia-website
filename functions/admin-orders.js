import { supabaseAdmin, isAdmin, json, originFrom } from './_supabase.js';

export async function handler(event) {
  const origin = originFrom(event);
  if (event.httpMethod === 'OPTIONS') return json({}, 200, origin);
  if (!isAdmin(event)) return json({ error: 'forbidden' }, 403, origin);

  const sb = supabaseAdmin();
  try {
    if (event.httpMethod === 'GET') {
      const url = new URL(event.rawUrl);
      const q = url.searchParams.get('q') || '';
      const status = url.searchParams.get('status') || '';
      let query = sb.from('orders').select('*').order('created_at', { ascending: false }).limit(500);

      if (q) query = query.or(`phone.ilike.%${q}%,name.ilike.%${q}%`);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return json({ data }, 200, origin);
    }

    if (['PUT','PATCH'].includes(event.httpMethod)) {
      const body = JSON.parse(event.body || '{}');
      const { id, status, notes } = body;
      const { data, error } = await sb.from('orders').update({ status, notes }).eq('id', id).select('*').single();
      if (error) throw error;
      return json({ data }, 200, origin);
    }

    return json({ error: 'method not allowed' }, 405, origin);
  } catch (e) { return json({ error: e.message }, 500, origin); }
}