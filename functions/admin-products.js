import { supabaseAdmin, isAdmin, json, originFrom } from './_supabase.js';

export async function handler(event) {
  const origin = originFrom(event);
  if (event.httpMethod === 'OPTIONS') return json({}, 200, origin);
  if (!isAdmin(event)) return json({ error: 'forbidden' }, 403, origin);

  const sb = supabaseAdmin();
  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return json({ data }, 200, origin);
    }

    const body = JSON.parse(event.body || '{}');

    if (event.httpMethod === 'POST') {
      const { data, error } = await sb.from('products').insert(body).select('*').single();
      if (error) throw error;
      return json({ data }, 201, origin);
    }

    if (event.httpMethod === 'PUT') {
      const id = body.id;
      delete body.id;
      const { data, error } = await sb.from('products').update(body).eq('id', id).select('*').single();
      if (error) throw error;
      return json({ data }, 200, origin);
    }

    if (event.httpMethod === 'DELETE') {
      const id = (JSON.parse(event.body || '{}')).id;
      const { error } = await sb.from('products').delete().eq('id', id);
      if (error) throw error;
      return json({ success: true }, 200, origin);
    }

    return json({ error: 'method not allowed' }, 405, origin);
  } catch (e) { return json({ error: e.message }, 500, origin); }
}