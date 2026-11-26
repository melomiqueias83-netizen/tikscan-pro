module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado na Vercel' });

  try {
    const { tiktokUser, productId } = req.body || {};
    let user = String(tiktokUser || '').trim();
    if (!user) return res.status(400).json({ error: 'Informe seu @ do TikTok' });
    if (!user.startsWith('@')) user = '@' + user;

    // Preços definidos SOMENTE no servidor (segurança contra fraude)
    const CATALOG = {
      pro_lancamento: { title: 'TIK SCAN PRO — Assinatura Lançamento (50 Primeiros)', price: 29.00, days: 30, plan: 'PRO Lançamento' },
      pack_vip: { title: 'Pack Completo VFX 3D + Molduras (.WEBM Transparente)', price: 97.00, days: 'vitalicio', plan: 'Pack VIP' }
    };

    const item = CATALOG[productId] || CATALOG.pro_lancamento;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${proto}://${host}`;

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          title: item.title,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: item.price
        }],
        external_reference: JSON.stringify({ user, productId: productId || 'pro_lancamento', days: item.days, plan: item.plan }),
        back_urls: {
          success: `${baseUrl}/?mp_retorno=approved`,
          pending: `${baseUrl}/?mp_retorno=pending`,
          failure: `${baseUrl}/?mp_retorno=failure`
        },
        auto_return: 'approved'
      })
    });

    const data = await mpRes.json();
    if (!mpRes.ok || !data.init_point) {
      return res.status(500).json({ error: data.message || 'Erro ao criar checkout no Mercado Pago' });
    }

    return res.status(200).json({ init_point: data.init_point });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
