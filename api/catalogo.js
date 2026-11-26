const DEFAULT_PACK = [
  { id: "guerreira", nome: "Guerreira da Batalha", categoria: "Efeito 3D", arquivo: "pack/guerreira.webm", formato: "WEBM Transparente", ativo: true },
  { id: "zeus", nome: "Zeus — Deus do Olimpo", categoria: "Efeito 3D", arquivo: "pack/zeus.webm", formato: "WEBM Transparente", ativo: true },
  { id: "leao", nome: "Leão Rugindo (Ouro)", categoria: "Efeito 3D", arquivo: "pack/leao.webm", formato: "WEBM Transparente", ativo: true },
  { id: "galaxia", nome: "Galáxia / Universo", categoria: "Efeito 3D", arquivo: "pack/galaxia.webm", formato: "WEBM Transparente", ativo: true },
  { id: "luva-boxe", nome: "Luva de Boxe (PK)", categoria: "Batalha PK", arquivo: "pack/luva-de-boxe.webm", formato: "WEBM Transparente", ativo: true },
  { id: "batalha", nome: "Batalha PK Raio", categoria: "Batalha PK", arquivo: "pack/batalha.webm", formato: "WEBM Transparente", ativo: true },
  { id: "x2", nome: "Multiplicador 2X", categoria: "Batalha PK", arquivo: "pack/2x.webm", formato: "WEBM Transparente", ativo: true },
  { id: "x3", nome: "Multiplicador 3X", categoria: "Batalha PK", arquivo: "pack/3x.webm", formato: "WEBM Transparente", ativo: true },
  { id: "tap-tap", nome: "Tap Tap (Curtidas)", categoria: "Interação", arquivo: "pack/tap-tap.webm", formato: "WEBM Transparente", ativo: true },
  { id: "molduras-png", nome: "Kit Molduras PNG (Pódio)", categoria: "Molduras", arquivo: "pack/molduras-png.zip", formato: "PNG Transparente", ativo: true }
];

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const url = `https://raw.githubusercontent.com/melomiqueias83-netizen/tikscan-pro/main/pack/catalogo.json?t=${Date.now()}`;
    const r = await fetch(url, { cache: 'no-store' });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) return res.status(200).json({ comercialUrl: 'pack/comercial.webm', itens: data });
      return res.status(200).json({ comercialUrl: data.comercialUrl || 'pack/comercial.webm', itens: data.itens || DEFAULT_PACK });
    }
  } catch {}
  return res.status(200).json({ comercialUrl: 'pack/comercial.webm', itens: DEFAULT_PACK });
};
