function signClientToken(user, exp, plan) {
  const payload = `${String(user).toLowerCase().trim()}|${exp}|${plan}|TIKSCAN_PRO_BR_2026`;
  let h1 = 0x811c9dc5, h2 = 0x9e3779b9;
  for (let i = 0; i < payload.length; i++) {
    const c = payload.charCodeAt(i);
    h1 ^= c; h1 = Math.imul(h1, 0x01000193);
    h2 ^= c + i; h2 = Math.imul(h2, 0x85ebca6b);
  }
  return ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)).slice(0, 10);
}

module.exports = async (req, res) => {
  const token = process.env.MP_ACCESS_TOKEN;
  const paymentId = req.query.payment_id;
  if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN ausente' });
  if (!paymentId) return res.status(400).json({ error: 'payment_id obrigatório' });

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const pay = await mpRes.json();

    if (!mpRes.ok) return res.status(400).json({ approved: false, status: 'error' });
    if (pay.status !== 'approved') {
      return res.status(200).json({ approved: false, status: pay.status });
    }

    let meta = { user: '@cliente', days: 30, plan: 'PRO Lançamento' };
    try { meta = JSON.parse(pay.external_reference || '{}'); } catch {}

    let exp = 'vitalicio';
    if (meta.days && meta.days !== 'vitalicio') {
      const dt = new Date();
      dt.setDate(dt.getDate() + Number(meta.days));
      exp = dt.toISOString().slice(0, 10);
    }

    const user = meta.user || '@cliente';
    const plan = meta.plan || 'PRO Lançamento';
    const sig = signClientToken(user, exp, plan);

    return res.status(200).json({
      approved: true,
      user,
      exp,
      plan,
      k: sig
    });
  } catch (err) {
    return res.status(500).json({ approved: false, error: err.message });
  }
};
