const state = { token: null, selectedProduct: null };

function $(s, p=document){ return p.querySelector(s); }
function el(tag, attrs={}, children=[]){ const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') e.className=v; else e.setAttribute(k,v); }); children.forEach(c=>e.appendChild(c)); return e; }

function authHeader(){ return state.token ? { Authorization: `Bearer ${state.token}` } : {}; }
async function api(path, opts={}) {
  const url = `/.netlify/functions/${path}`;
  const res = await fetch(url, { ...opts, headers: { 'Content-Type':'application/json', ...(opts.headers||{}), ...authHeader() } });
  if (!res.ok) throw new Error(await res.text());
  const ct = res.headers.get('content-type')||'';
  return ct.includes('application/json') ? res.json() : res.text();
}

function requireAdmin(user) {
  const roles = user?.app_metadata?.roles || [];
  if (!roles.includes('admin')) {
    alert('هذا الحساب لا يملك صلاحية المشرف (admin).');
    throw new Error('not admin');
  }
}

function switchView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  $('#'+id).classList.add('active');
  document.querySelector(`.tab[data-view="${id}"]`).classList.add('active');
}

/* ========== AUTH ========== */
netlifyIdentity.on('login', async user => {
  requireAdmin(user);
  const token = await netlifyIdentity.currentUser().jwt();
  state.token = token;
  $('#loginBtn').style.display = 'none';
  $('#logoutBtn').style.display = 'inline-block';
  await initData();
});
netlifyIdentity.on('logout', () => {
  state.token = null;
  $('#loginBtn').style.display = 'inline-block';
  $('#logoutBtn').style.display = 'none';
});

$('#loginBtn').onclick = () => netlifyIdentity.open();
$('#logoutBtn').onclick = () => netlifyIdentity.logout();

/* ========== NAV ========== */
document.querySelectorAll('.tab').forEach(t => t.onclick = () => switchView(t.dataset.view));

/* ========== ORDERS ========== */
async function loadOrders() {
  const q = $('#ordersSearch').value.trim();
  const status = $('#ordersStatus').value;
  const qs = new URLSearchParams();
  if (q) qs.set('q', q);
  if (status) qs.set('status', status);
  const { data } = await api(`admin-orders?${qs.toString()}`);
  const tbody = $('#ordersTable tbody');
  tbody.innerHTML = '';
  data.forEach(o => {
    const tr = el('tr');
    tr.innerHTML = `
      <td>${new Date(o.created_at).toLocaleString()}</td>
      <td>${o.name||''}</td>
      <td>${o.phone||''}</td>
      <td>${o.product_name||''}</td>
      <td>${o.quantity||1}</td>
      <td>${o.total_price||0}</td>
      <td>
        <select data-id="${o.id}" class="order-status">
          ${['new','confirmed','shipped','canceled'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td><button class="btn secondary" data-action="note" data-id="${o.id}">ملاحظة</button></td>
    `;
    tbody.appendChild(tr);
  });
}

$('#refreshOrders').onclick = loadOrders;
$('#ordersSearch').onkeyup = e => { if (e.key==='Enter') loadOrders(); };
$('#ordersStatus').onchange = loadOrders;
$('#exportCsv').onclick = (e)=>{ e.preventDefault(); window.open('/.netlify/functions/export-orders', '_blank'); };

document.addEventListener('change', async (e) => {
  const sel = e.target.closest('.order-status');
  if (!sel) return;
  await api('admin-orders', { method:'PUT', body: JSON.stringify({ id: sel.dataset.id, status: sel.value }) });
});

document.addEventListener('click', async (e) => {
  if (e.target.matches('[data-action="note"]')) {
    const id = e.target.dataset.id;
    const notes = prompt('أدخل ملاحظة للطلب:');
    if (notes != null) await api('admin-orders', { method:'PUT', body: JSON.stringify({ id, notes }) });
  }
});

/* ========== PRODUCTS ========== */
async function loadProducts() {
  const { data } = await api('admin-products');
  const tbody = $('#productsTable tbody'); tbody.innerHTML = '';
  data.forEach(p => {
    const tr = el('tr');
    tr.innerHTML = `
      <td>${p.name_ar}</td>
      <td>${p.name_fr}</td>
      <td>${p.price} ${p.currency||'دج'}</td>
      <td>${p.active ? 'نعم':'لا'}</td>
      <td><button class="btn secondary" data-edit="${p.id}">تعديل</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => {
    const p = data.find(x => x.id === btn.dataset.edit);
    state.selectedProduct = p;
    $('#p_sku').value = p.sku || '';
    $('#p_price').value = p.price || 0;
    $('#p_active').value = String(!!p.active);
    $('#p_image').value = p.image_url || '';
    $('#p_name_ar').value = p.name_ar || '';
    $('#p_name_fr').value = p.name_fr || '';
    $('#p_desc_ar').value = p.description_ar || '';
    $('#p_desc_fr').value = p.description_fr || '';
  });
}

$('#addProductBtn').onclick = () => {
  state.selectedProduct = null;
  ['p_sku','p_price','p_image','p_name_ar','p_name_fr','p_desc_ar','p_desc_fr'].forEach(id => $('#'+id).value = '');
  $('#p_active').value = 'true';
};

$('#saveProduct').onclick = async () => {
  const body = {
    sku: $('#p_sku').value.trim() || null,
    price: parseInt($('#p_price').value||'0'),
    active: $('#p_active').value === 'true',
    image_url: $('#p_image').value.trim() || null,
    name_ar: $('#p_name_ar').value.trim(),
    name_fr: $('#p_name_fr').value.trim(),
    description_ar: $('#p_desc_ar').value.trim() || null,
    description_fr: $('#p_desc_fr').value.trim() || null,
  };
  if (state.selectedProduct?.id) {
    body.id = state.selectedProduct.id;
    await api('admin-products', { method:'PUT', body: JSON.stringify(body) });
  } else {
    await api('admin-products', { method:'POST', body: JSON.stringify(body) });
  }
  await loadProducts();
  alert('تم الحفظ');
};

$('#deleteProduct').onclick = async () => {
  if (!state.selectedProduct?.id) return alert('اختر منتجًا أولاً');
  if (!confirm('تأكيد حذف المنتج؟')) return;
  await api('admin-products', { method:'DELETE', body: JSON.stringify({ id: state.selectedProduct.id }) });
  state.selectedProduct = null;
  await loadProducts();
};

/* ========== SETTINGS ========== */
async function loadSettings() {
  const res = await api('public-settings');
  const px = res.pixels || {};
  $('#s_fb').value = px.facebook_pixel_id || '';
  $('#s_tt').value = px.tiktok_pixel_id || '';
  $('#s_gtag').value = px.gtag_id || '';
  $('#s_px_enabled').value = String(px.enabled !== false);
  $('#s_head').value = px.custom_head_html || '';
  $('#s_body').value = px.custom_body_end_html || '';

  const tg = res.telegram || {};
  $('#t_enabled').value = String(!!tg.enabled);
  $('#t_token').value = tg.bot_token || '';
  $('#t_chat').value = tg.chat_id || '';
}

$('#saveSettings').onclick = async () => {
  const pixels = {
    facebook_pixel_id: $('#s_fb').value.trim() || null,
    tiktok_pixel_id: $('#s_tt').value.trim() || null,
    gtag_id: $('#s_gtag').value.trim() || null,
    enabled: $('#s_px_enabled').value === 'true',
    custom_head_html: $('#s_head').value || null,
    custom_body_end_html: $('#s_body').value || null
  };
  const telegram = {
    enabled: $('#t_enabled').value === 'true',
    bot_token: $('#t_token').value.trim() || null,
    chat_id: $('#t_chat').value.trim() || null
  };
  await api('admin-upsert-settings', { method:'POST', body: JSON.stringify({ pixels, telegram }) });
  alert('تم حفظ الإعدادات');
};

/* ========== INIT ========== */
async function initData(){
  await Promise.all([loadOrders(), loadProducts(), loadSettings()]);
}

window.addEventListener('load', () => {
  // إن كنت مسجّلاً يدخل تلقائيًا
  const user = netlifyIdentity.currentUser();
  if (user) {
    try { requireAdmin(user); } catch { return; }
    user.jwt().then(tok => { state.token = tok; initData(); });
    $('#loginBtn').style.display = 'none';
    $('#logoutBtn').style.display = 'inline-block';
  }
});