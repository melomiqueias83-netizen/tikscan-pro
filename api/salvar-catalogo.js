module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const adminPass = process.env.ADMIN_PASS || 'admin123';
  const ghToken = process.env.GH_TOKEN;
  const { password, catalog } = req.body || {};

  if (!password || password !== adminPass) {
    return res.status(401).json({ error: 'Senha de administrador inválida' });
  }
  if (!ghToken) {
    return res.status(400).json({ error: 'GH_TOKEN não configurado na Vercel' });
  }

  const repoPath = 'https://api.github.com/repos/melomiqueias83-netizen/tikscan-pro/contents/pack/catalogo.json';
  const headers = {
    'Authorization': `Bearer ${ghToken}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'TikScan-Pro-Admin',
    'Content-Type': 'application/json'
  };

  try {
    let sha = undefined;
    const getRes = await fetch(repoPath, { headers });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    const content = Buffer.from(JSON.stringify(catalog, null, 2), 'utf8').toString('base64');
    const putRes = await fetch(repoPath, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: 'Atualiza catalogo do Pack via Painel Admin',
        content,
        ...(sha ? { sha } : {})
      })
    });

    const putData = await putRes.json();
    if (!putRes.ok) return res.status(500).json({ error: putData.message || 'Erro ao salvar no GitHub' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
