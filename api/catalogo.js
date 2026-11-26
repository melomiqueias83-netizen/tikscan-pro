```javascript
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
```

#### `api/salvar-catalogo.js`
```javascript
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
```

---

### 2. Novo `index.html` Completo (Vitrine TikFinity + Mercado Pago R$ 29,99 + Área Cliente Travada + Admin)

* **Link público (`/`)**: Vitrine estilo TikFinity Mobile com Player 9:16 do seu vídeo comercial, oferta **PRO Lançamento (de R$ 99,00 por R$ 29,99 — 50 primeiros)** e botão **Mercado Pago (Pix / Cartão)** que libera o link na hora após aprovação.
* **Link do Cliente (`?u=@...&exp=...&plan=...&k=...`)**: **zero botões de edição**. Só mostra **Baixar Pack** (sincronizado com o que você publicar no Admin), **Guia Completo TikTok LIVE Studio & OBS Studio** e **Overlays da Live**.
* **Acesso Admin (botão discreto `Admin` na vitrine)**: pede sua senha, libera **Publicar Pack Global**, **Estúdio VFX (.WEBM)** e **Links VIP para Influenciadores**.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TIK SCAN PRO — Overlays, Pack VFX 3D &amp; Automação TikTok Live</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ts: { bg:'#0b0f17', sidebar:'#0f1522', panel:'#131b2b', card:'#182235', border:'#25324b', blue:'#2563eb', cyan:'#00f0ff', pink:'#ff1f8e', gold:'#facc15' }
          }
        }
      }
    };
  </script>
  <script type="importmap">{ "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }</script>
  <style>
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#0b0f17;color:#f1f5f9;font-family:Inter,system-ui,-apple-system,sans-serif}
    body.obs-clean-mode{background:transparent!important;overflow:hidden}
    .checkerboard-bg{background-color:#121824;background-image:linear-gradient(45deg,#1a2233 25%,transparent 25%),linear-gradient(-45deg,#1a2233 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a2233 75%),linear-gradient(-45deg,transparent 75%,#1a2233 75%);background-size:22px 22px;background-position:0 0,0 11px,11px -11px,-11px 0}
    ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:#0b0f17} ::-webkit-scrollbar-thumb{background:#29354d;border-radius:999px}
    input[type="range"]{-webkit-appearance:none;appearance:none;height:5px;background:#25324b;border-radius:999px;outline:none}
    input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:15px;height:15px;border-radius:50%;background:#00f0ff;cursor:pointer;border:2px solid #0b0f17}
    input[type="color"]{-webkit-appearance:none;border:none;width:32px;height:28px;border-radius:6px;cursor:pointer;background:transparent;padding:0}
    input[type="color"]::-webkit-color-swatch-wrapper{padding:0} input[type="color"]::-webkit-color-swatch{border:2px solid #334155;border-radius:6px}
    @keyframes animGirar{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes animPulsar{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
    @keyframes animQuicar{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @keyframes animBalancar{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
    @keyframes animBrilhar{0%,100%{filter:drop-shadow(0 0 4px rgba(250,204,21,.5))}50%{filter:drop-shadow(0 0 18px rgba(250,204,21,1))}}
    @keyframes popInAlert{0%{opacity:0;transform:scale(.75) translateY(16px)}100%{opacity:1;transform:scale(1) translateY(0)}}
    .av-girar{animation:animGirar 4s linear infinite}.av-pulsar{animation:animPulsar 1.3s ease-in-out infinite}.av-quicar{animation:animQuicar 1s ease-in-out infinite}
    .av-balancar{animation:animBalancar 1.6s ease-in-out infinite}.av-brilhar{animation:animBrilhar 1.4s ease-in-out infinite}.alert-pop{animation:popInAlert .4s ease-out forwards}
    .flip-scene{perspective:900px}.flip-card{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .85s cubic-bezier(.4,.2,.2,1)}
    .flip-card.is-flipped{transform:rotateY(180deg)}.flip-face{position:absolute;inset:0;backface-visibility:hidden;display:flex;align-items:center;justify-content:center}.flip-face.back{transform:rotateY(180deg)}
    .frame-gold{box-shadow:0 0 18px rgba(250,204,21,.65);border:3px solid #facc15}.frame-silver{box-shadow:0 0 15px rgba(148,163,184,.65);border:3px solid #cbd5e1}
    .frame-bronze{box-shadow:0 0 14px rgba(217,119,6,.6);border:3px solid #d97706}.frame-crystal{box-shadow:0 0 22px rgba(56,189,248,.85);border:3.5px solid #38bdf8}
    .frame-games{box-shadow:0 0 18px #ff1f8e,0 0 26px #00f0ff;border:3px solid #00f0ff;outline:2px dashed #ff1f8e;outline-offset:2px}
  </style>
</head>
<body class="min-h-screen flex flex-col">

  <!-- TELA DE CONFIRMAÇÃO DE PAGAMENTO MERCADO PAGO -->
  <div id="mpProcessingScreen" class="hidden fixed inset-0 z-50 bg-ts-bg flex items-center justify-center p-6">
    <div class="bg-ts-panel border border-cyan-500/40 rounded-2xl max-w-md w-full p-7 text-center space-y-4 shadow-2xl">
      <div class="w-12 h-12 mx-auto rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
      <h2 id="mpProcTitle" class="text-lg font-black text-white">Confirmando pagamento no Mercado Pago...</h2>
      <p id="mpProcMsg" class="text-xs text-slate-400">Aguarde um segundo enquanto liberamos seu acesso exclusivo ao Pack e Overlays.</p>
      <button id="mpRetryBtn" type="button" class="hidden w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">Verificar Pagamento Novamente</button>
      <a href="/" class="block text-xs text-slate-400 underline">Voltar para o início</a>
    </div>
  </div>

  <!-- BLOQUEIO DE LINK EXPIRADO/INVÁLIDO -->
  <div id="accessBlockedScreen" class="hidden fixed inset-0 z-50 bg-ts-bg flex items-center justify-center p-6">
    <div class="bg-ts-panel border border-rose-500/50 rounded-2xl max-w-md w-full p-7 text-center space-y-4 shadow-2xl">
      <div class="text-xs font-black uppercase tracking-widest text-rose-400">Acesso Restrito</div>
      <h2 class="text-xl font-black text-white">Link Expirado ou Inválido</h2>
      <p id="accessBlockedReason" class="text-xs text-slate-400">Adquira seu acesso PRO ou solicite um novo link.</p>
      <a href="/" class="block w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs uppercase">Ir para Oferta PRO (R$ 29,99)</a>
    </div>
  </div>

  <!-- OVERLAY LIMPO OBS -->
  <div id="obsCleanScreen" class="hidden fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
    <div id="obsCleanMount" class="pointer-events-auto"></div>
    <button id="btnExitCleanMode" type="button" class="pointer-events-auto fixed bottom-4 right-4 opacity-25 hover:opacity-100 px-3 py-1.5 rounded-lg bg-black/80 border border-white/20 text-xs text-white">Voltar</button>
  </div>

  <!-- MODAL LOGIN ADMIN (EXCLUSIVO DO DONO) -->
  <div id="adminLoginModal" class="hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-ts-panel border border-ts-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center">
      <button id="btnCloseAdminLogin" type="button" class="absolute top-3 right-4 text-slate-400 hover:text-white">✕</button>
      <div class="text-xs font-black uppercase tracking-widest text-emerald-400">Área Restrita</div>
      <h2 class="text-lg font-black text-white">Acesso Administrador</h2>
      <input id="inputAdminGatePass" type="password" placeholder="Digite sua senha Admin..." class="w-full bg-ts-bg border border-ts-border rounded-xl px-4 py-2.5 text-sm text-white text-center outline-none focus:border-cyan-400" />
      <button id="btnEnterAdminMode" type="button" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs uppercase">Entrar no Painel Admin</button>
      <p id="adminGateErr" class="hidden text-xs text-rose-400">Senha incorreta.</p>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- 1. VITRINE PÚBLICA ESTILO TIKFINITY MOBILE + CHECKOUT MERCADO PAGO     -->
  <!-- ===================================================================== -->
  <div id="publicLandingShell" class="hidden min-h-screen flex flex-col bg-ts-bg">
    <header class="sticky top-0 z-30 bg-ts-sidebar/90 backdrop-blur border-b border-ts-border px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-ts-pink via-blue-600 to-ts-cyan flex items-center justify-center font-black text-white text-sm shadow-lg">TS</div>
        <div>
          <div class="text-sm font-black text-white tracking-tight">TIK SCAN PRO</div>
          <div class="text-[10px] text-cyan-400 font-semibold">Overlays + Pack VFX 3D para Lives</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <a href="#checkoutBox" class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-ts-pink to-blue-600 text-white text-xs font-extrabold">Assinar PRO</a>
        <button id="btnOpenAdminGate" type="button" class="px-2.5 py-1.5 rounded-lg bg-ts-card border border-ts-border text-[11px] font-bold text-slate-400 hover:text-white">Admin</button>
      </div>
    </header>

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 space-y-10">
      <!-- HERO: VÍDEO COMERCIAL 9:16 + OFERTA DE LANÇAMENTO -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
        <!-- COLUNA DO VÍDEO COMERCIAL (9:16) -->
        <div class="lg:col-span-5 flex justify-center">
          <div class="relative w-full max-w-[300px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-cyan-400/50 bg-ts-panel shadow-[0_0_45px_rgba(0,240,255,0.18)]">
            <video id="publicPromoVideo" playsinline controls loop class="w-full h-full object-cover bg-black"></video>
            <div id="publicPromoFallback" class="hidden absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-ts-panel to-ts-bg">
              <div class="text-[11px] font-black uppercase tracking-widest text-cyan-400 mb-2">Demonstração Oficial 9:16</div>
              <div class="text-base font-black text-white mb-2">Efeitos 3D em Batalha PK Real</div>
              <p class="text-xs text-slate-400">O vídeo oficial da apresentação (<span class="font-mono text-cyan-300">pack/comercial.webm</span>) aparecerá aqui automaticamente assim que você publicar.</p>
            </div>
          </div>
        </div>

        <!-- COLUNA DA OFERTA PRO R$ 29,99 (50 PRIMEIROS) + MERCADO PAGO -->
        <div id="checkoutBox" class="lg:col-span-7 space-y-5">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[11px] font-black uppercase tracking-wider">
            Lançamento Exclusivo • 50 Primeiras Vagas
          </div>

          <h1 class="text-2xl sm:text-4xl font-black text-white leading-tight">
            Transforme sua Live do TikTok com <span class="text-transparent bg-clip-text bg-gradient-to-r from-ts-cyan to-ts-pink">Efeitos 3D Reais</span> e Rankings PRO
          </h1>

          <p class="text-sm text-slate-300 leading-relaxed">
            Chega de alertas amadores. Leve o painel completo estilo TikFinity + <strong>Pack Completo de Vídeos 3D Transparentes</strong> prontos para baixar e rodar no TikTok LIVE Studio e OBS.
          </p>

          <!-- CARD PREÇO PRO DE R$ 99 POR R$ 29,99 -->
          <div class="bg-ts-panel border-2 border-cyan-500/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
            <div class="flex flex-wrap items-end justify-between gap-3 border-b border-ts-border pb-4">
              <div>
                <div class="text-xs font-bold uppercase text-cyan-400">Plano Único Lançamento • Acesso PRO + Pack</div>
                <div class="flex items-baseline gap-2.5 mt-1">
                  <span class="text-sm text-slate-500 line-through font-bold">R$ 99,00</span>
                  <span class="text-4xl font-black text-white">R$ 29,99</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">Liberação Automática</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Pack 10 Efeitos (.WEBM Transparente)</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Rankings Moedas, Likes e Shares</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Big Gifter 3D + Notificações OBS</div>
              <div class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>Guia Passo a Passo TikTok Studio &amp; OBS</div>
            </div>

            <div class="space-y-2.5 pt-2">
              <label class="block text-xs font-bold text-slate-300">Seu @ do TikTok (para gerar seu link exclusivo):</label>
              <input id="mpInputUser" type="text" placeholder="@seu_usuario_tiktok" class="w-full bg-ts-bg border border-ts-border rounded-xl px-4 py-3 text-sm text-white font-semibold outline-none focus:border-cyan-400" />
              <button id="btnPayMercadoPago" type="button" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wide shadow-lg transition">
                Adquirir Acesso PRO — R$ 29,99 (Pix / Cartão)
              </button>
              <p id="mpCheckoutErr" class="hidden text-xs text-rose-400 text-center"></p>
              <div class="text-[11px] text-slate-400 text-center">Pagamento processado com segurança pelo Mercado Pago. Após aprovar, seu link abre na hora.</div>
            </div>
          </div>
        </div>
      </section>

      <!-- GRADE DE RECURSOS ESTILO TIKFINITY MOBILE -->
      <section class="space-y-4">
        <div class="text-center space-y-1">
          <h2 class="text-lg sm:text-xl font-black text-white">Tudo o que está incluso no seu Acesso PRO</h2>
          <p class="text-xs text-slate-400">Estrutura limpa, rápida e compatível com PC e Celular</p>
        </div>
        <div id="publicPackPreviewGrid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"></div>
      </section>
    </main>
  </div>

  <!-- ===================================================================== -->
  <!-- 2. PAINEL INTERNO (MODO CLIENTE TRAVADO OU MODO ADMIN COM EDIÇÃO)     -->
  <!-- ===================================================================== -->
  <div id="mainAppShell" class="hidden flex-1 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
    <aside id="sidebarDrawer" class="hidden lg:flex w-64 shrink-0 bg-ts-sidebar border-r border-ts-border flex-col h-full">
      <div class="p-4 border-b border-ts-border space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-ts-pink via-blue-600 to-ts-cyan flex items-center justify-center font-black text-white text-sm">TS</div>
            <div><div class="text-sm font-black text-white leading-none">TIK SCAN PRO</div><div id="roleBadgeLabel" class="text-[10px] text-cyan-400 mt-0.5 font-bold">ÁREA DO CLIENTE</div></div>
          </div>
          <button id="btnCloseMobileMenu" type="button" class="lg:hidden text-slate-400 hover:text-white px-1">✕</button>
        </div>
        <div class="bg-ts-card border border-ts-border rounded-xl px-3 py-2 flex items-center justify-between gap-2">
          <div class="min-w-0"><div id="sidebarUserHandle" class="text-xs font-bold text-white truncate">@cliente</div><div id="sidebarConnStatus" class="text-[10px] font-bold text-emerald-400">● ACESSO LIBERADO</div></div>
          <span id="sidebarPlanBadge" class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold shrink-0">PRO</span>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-2.5 space-y-1 text-xs font-semibold">
        <div class="pt-1 pb-1 px-2 text-[10px] font-bold uppercase text-slate-500">Pack &amp; Instalação</div>
        <button data-tab="pack" class="side-tab w-full text-left px-3 py-2.5 rounded-lg bg-blue-600 text-white shadow">Baixar Meu Pack</button>
        <button data-tab="guia" class="side-tab w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-ts-card">Guia TikTok Studio &amp; OBS</button>

        <div class="pt-3 pb-1 px-2 text-[10px] font-bold uppercase text-slate-500">Overlays da Live</div>
        <button data-tab="conexao" class="side-tab w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-ts-card">Conexão Live</button>
        <button data-tab="moedas" class="side-tab w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-ts-card">Ranking Moedas</button>
        <button data-tab="likes" class="side-tab w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-ts-card">Ranking Likes</button>
        <button data-tab="shares" class="side-tab w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-ts-card">Ranking Shares</button>
        <button data-tab="gifter" class="side-tab w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-ts-card">Big Gifter 3D</button>
        <button data-tab="notificacoes" class="side-tab w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-ts-card">Notificações OBS</button>
        <button data-tab="tts" class="side-tab w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-ts-card">Voice Bot (TTS)</button>

        <!-- SEÇÃO EXCLUSIVA DO ADMINISTRADOR (INVISÍVEL PARA CLIENTES) -->
        <div id="adminSidebarSection" class="hidden pt-3 space-y-1 border-t border-ts-border/70 mt-3">
          <div class="pb-1 px-2 text-[10px] font-bold uppercase text-emerald-400">Administração (Só Você)</div>
          <button data-tab="admpack" class="side-tab w-full text-left px-3 py-2 rounded-lg text-emerald-300 hover:bg-ts-card">Publicar Pack Global</button>
          <button data-tab="vfx" class="side-tab w-full text-left px-3 py-2 rounded-lg text-cyan-300 hover:bg-ts-card">Estúdio Chroma (.WEBM)</button>
          <button data-tab="admlinks" class="side-tab w-full text-left px-3 py-2 rounded-lg text-amber-300 hover:bg-ts-card">Links VIP Influenciadores</button>
        </div>
      </nav>

      <div class="p-3 border-t border-ts-border space-y-2">
        <button id="btnCopyMyAccessLink" type="button" class="w-full py-2 rounded-lg bg-ts-card border border-cyan-500/40 text-cyan-300 font-bold text-xs">Copiar Meu Link de Acesso</button>
        <button id="btnAdminLogout" type="button" class="hidden w-full py-2 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold text-xs">Sair do Modo Admin</button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <header class="h-13 shrink-0 bg-ts-panel border-b border-ts-border px-4 py-2.5 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <button id="btnMobileMenu" type="button" class="lg:hidden px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-xs font-bold">Menu</button>
          <span id="topSectionTitle" class="text-sm font-bold text-white">Baixar Meu Pack</span>
        </div>
        <div class="flex items-center gap-2">
          <span id="headerPlanPill" class="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">PRO</span>
          <button id="btnToggleMute" type="button" class="text-xs px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-slate-200"><span id="muteLabel">Som Ativo</span></button>
        </div>
      </header>

      <!-- BARRA SIMULADOR (APENAS OVERLAYS) -->
      <div id="liveSimToolbar" class="hidden bg-[#0f141e] border-b border-ts-border px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[10px] font-bold uppercase text-amber-400 mr-1">Simular Live:</span>
          <button data-sim="gift1" class="sim-btn text-[11px] px-2.5 py-1 rounded bg-ts-card border border-ts-border text-slate-200 font-semibold">+1 Moeda</button>
          <button data-sim="gift100" class="sim-btn text-[11px] px-2.5 py-1 rounded bg-ts-card border border-ts-border text-pink-300 font-semibold">+100 Moedas</button>
          <button data-sim="strong" class="sim-btn text-[11px] px-2.5 py-1 rounded bg-ts-card border border-ts-border text-amber-300 font-semibold">+500 Big Gift</button>
          <button data-sim="follow" class="sim-btn text-[11px] px-2.5 py-1 rounded bg-ts-card border border-ts-border text-emerald-300 font-semibold">+Seguidor</button>
          <button data-sim="like" class="sim-btn text-[11px] px-2.5 py-1 rounded bg-ts-card border border-ts-border text-cyan-300 font-semibold">+25 Likes</button>
          <button data-sim="share" class="sim-btn text-[11px] px-2.5 py-1 rounded bg-ts-card border border-ts-border text-blue-300 font-semibold">+1 Share</button>
        </div>
        <button id="btnAutoLive" type="button" class="text-[11px] px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold">Auto-Live: OFF</button>
      </div>

      <main class="flex-1 overflow-y-auto">

        <!-- ABA CLIENTE: DOWNLOAD DO PACK (ZERO BOTÕES DE EDIÇÃO) -->
        <section id="tab-pack" class="tab-panel max-w-5xl mx-auto p-4 lg:p-6 space-y-5">
          <div class="bg-gradient-to-r from-ts-panel to-ts-card border border-cyan-500/35 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="text-xs font-black uppercase text-cyan-400">Pack Oficial Liberado</div>
              <h2 class="text-lg font-black text-white mt-0.5">Seus Efeitos 3D &amp; Molduras para Download</h2>
              <p class="text-xs text-slate-400 mt-1">Baixe cada arquivo abaixo e siga o Guia TikTok Studio / OBS para colocar na sua live.</p>
            </div>
            <button data-goto-tab="guia" class="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white">Ver Guia de Instalação</button>
          </div>
          <div id="clientPackGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
        </section>

        <!-- ABA CLIENTE: GUIA TIKTOK LIVE STUDIO & OBS STUDIO -->
        <section id="tab-guia" class="tab-panel hidden max-w-4xl mx-auto p-4 lg:p-6 space-y-5">
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-3">
            <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-ts-pink/20 text-ts-pink border border-ts-pink/40">Passo a Passo Oficial</span>
            <h2 class="text-xl font-black text-white">Como colocar os Vídeos e Imagens no TikTok LIVE Studio e OBS</h2>
            <p class="text-xs text-slate-300">Todos os vídeos deste Pack são exportados em <strong>.WEBM Transparente (1080×1920)</strong> com áudio original, para entrar limpo por cima da sua câmera ou batalha.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-3">
              <div class="text-sm font-black text-cyan-300">1. No TikTok LIVE Studio (PC)</div>
              <ol class="text-xs text-slate-300 space-y-2.5 list-decimal list-inside leading-relaxed">
                <li>Baixe os arquivos desejados na aba <strong>Baixar Meu Pack</strong>.</li>
                <li>Abra o <strong>TikTok LIVE Studio</strong> e selecione a cena da sua live.</li>
                <li>Clique em <strong>Adicionar fonte</strong> → escolha <strong>Vídeo</strong> (para efeitos `.webm`/`.mp4`) ou <strong>Imagem</strong> (para molduras `.png`).</li>
                <li>Selecione o arquivo baixado no seu computador.</li>
                <li>Posicione no centro da tela vertical <strong>9:16</strong> acima da sua webcam.</li>
                <li>Se usar algum vídeo em fundo verde (`.mp4`), clique com botão direito na fonte → <strong>Propriedades / Filtros → Chroma Key (Verde)</strong>. Nos arquivos <strong>.WEBM</strong> já vai recortado direto!</li>
              </ol>
            </div>

            <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-3">
              <div class="text-sm font-black text-emerald-300">2. No OBS Studio (PC)</div>
              <ol class="text-xs text-slate-300 space-y-2.5 list-decimal list-inside leading-relaxed">
                <li>No OBS, vá no painel <strong>Fontes</strong> e clique no botão <strong>+</strong>.</li>
                <li>Para vídeos de efeito (<strong>.WEBM</strong>): escolha <strong>Fonte de Mídia</strong> → clique em <strong>Localizar</strong> e selecione o vídeo baixado.</li>
                <li>Deixe marcada a opção <strong>Reiniciar a reprodução quando a fonte ficar ativa</strong> (desmarque <em>Loop</em> se for um alerta único).</li>
                <li>Para Molduras (<strong>.PNG</strong>): clique em <strong>+ → Imagem</strong> e suba a moldura por cima do seu pódio/câmera.</li>
                <li>O canal transparente (Alpha) do <strong>.WEBM</strong> funciona nativamente no OBS sem precisar configurar Chroma Key!</li>
              </ol>
            </div>
          </div>

          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-3">
            <div class="text-sm font-black text-amber-300">3. Como ligar os Overlays Ao Vivo (Rankings, Notificações e Big Gifter)</div>
            <ol class="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Entre na aba do overlay desejado aqui no menu (ex: <strong>Ranking Moedas</strong> ou <strong>Notificações OBS</strong>) e clique em <strong>Copiar</strong> no campo do link OBS.</li>
              <li>No <strong>OBS Studio</strong> ou <strong>TikTok LIVE Studio</strong>, adicione uma fonte do tipo <strong>Navegador (Browser Source / Link)</strong>.</li>
              <li>Cole o link copiado e configure o tamanho recomendado: <strong>450×240</strong> para Rankings ou <strong>550×180</strong> para Notificações.</li>
              <li>Pronto! O fundo já é 100% transparente e atualiza em tempo real durante sua live.</li>
            </ol>
          </div>
        </section>

        <!-- ABA CONEXÃO -->
        <section id="tab-conexao" class="tab-panel hidden max-w-xl mx-auto p-6">
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-6 space-y-4 text-center shadow-2xl">
            <h2 class="text-lg font-black text-white">Conexão da Live</h2>
            <div class="bg-ts-bg border border-ts-border rounded-xl p-3 flex items-center justify-between text-left">
              <div><div id="connCardUser" class="text-sm font-bold text-white">@cliente</div><div id="connCardStatus" class="text-[11px] font-bold text-emerald-400">● ACESSO ATIVO</div></div>
              <button id="btnDisconnect" type="button" class="text-xs text-slate-400 px-2">✕</button>
            </div>
            <input id="inputTiktokUser" type="text" value="@live_demo" class="w-full bg-ts-bg border border-ts-border rounded-xl px-4 py-2.5 text-sm text-white font-semibold" />
            <button id="btnConnectUser" type="button" class="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold">Atualizar @usuário</button>
            <div class="grid grid-cols-2 gap-2"><span id="connStatusPill" class="py-2 px-3 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-bold">● WS: Offline</span><button id="btnConnectWs" type="button" class="py-2 px-3 rounded-xl bg-ts-card border border-ts-border text-xs font-bold text-white">Conectar Bridge WS</button></div>
            <input id="inputWsUrl" type="text" value="ws://localhost:8081" class="w-full bg-ts-bg border border-ts-border rounded-lg px-3 py-1.5 text-xs font-mono text-white" />
            <button id="btnActivateTestMode" type="button" class="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase">Ativar Modo Simulação</button>
            <button id="btnClearAllLive" type="button" class="w-full py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 font-bold text-xs">Limpar Rankings</button>
          </div>
        </section>

        <!-- ABA MOEDAS -->
        <section id="tab-moedas" class="tab-panel hidden max-w-6xl mx-auto p-4 lg:p-6 space-y-4">
          <div class="flex flex-wrap justify-between gap-2">
            <div class="flex gap-2"><button data-moedas-period="diario" class="period-btn px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white">Diário</button><button data-moedas-period="semanal" class="period-btn px-4 py-2 rounded-xl text-xs font-bold bg-ts-card border border-ts-border text-slate-300">Semanal</button></div>
            <button data-clean="moedas" class="btn-open-clean px-3 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold">Overlay Limpo (OBS)</button>
          </div>
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5"><div id="previewMoedasContainer" class="min-h-[200px] rounded-xl border border-ts-border p-4 flex items-center justify-center checkerboard-bg"></div></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="bg-ts-panel border border-ts-border rounded-2xl p-4 space-y-2.5">
              <div class="flex gap-2"><button data-rank-count="moedas" data-val="3" class="rank-count-btn flex-1 py-1.5 rounded-lg text-xs font-bold border border-blue-500 bg-blue-600/25">3</button><button data-rank-count="moedas" data-val="5" class="rank-count-btn flex-1 py-1.5 rounded-lg text-xs font-bold border border-ts-border bg-ts-card">5</button><button data-rank-count="moedas" data-val="10" class="rank-count-btn flex-1 py-1.5 rounded-lg text-xs font-bold border border-ts-border bg-ts-card">10</button></div>
              <div class="grid grid-cols-2 gap-2"><button id="btnMoedasPodium" class="py-2 rounded-lg text-xs font-bold border border-blue-500 bg-blue-600/25">Pódio</button><button id="btnMoedasLista" class="py-2 rounded-lg text-xs font-bold border border-ts-border bg-ts-card">Lista</button></div>
              <label class="flex justify-between text-xs"><span>Fundo transparente</span><input id="chkMoedasTransparent" type="checkbox" checked /></label>
              <label class="flex justify-between text-xs"><span>Molduras Games</span><input id="chkMoedasGames" type="checkbox" /></label>
            </div>
            <div class="bg-ts-panel border border-ts-border rounded-2xl p-4 space-y-2.5">
              <div class="flex justify-between text-xs font-bold"><span>Molduras PNG Próprias</span><button id="btnRestoreMoedasFrames" type="button" class="text-cyan-400">Restaurar</button></div>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-ts-bg border border-ts-border rounded-lg p-2"><div class="text-[10px] text-yellow-400 font-bold">1º</div><label class="text-[10px] cursor-pointer text-cyan-300">PNG<input type="file" accept="image/*" data-frame-upload="1" class="hidden frame-upload-input" /></label></div>
                <div class="bg-ts-bg border border-ts-border rounded-lg p-2"><div class="text-[10px] text-slate-300 font-bold">2º</div><label class="text-[10px] cursor-pointer text-cyan-300">PNG<input type="file" accept="image/*" data-frame-upload="2" class="hidden frame-upload-input" /></label></div>
                <div class="bg-ts-bg border border-ts-border rounded-lg p-2"><div class="text-[10px] text-amber-500 font-bold">3º</div><label class="text-[10px] cursor-pointer text-cyan-300">PNG<input type="file" accept="image/*" data-frame-upload="3" class="hidden frame-upload-input" /></label></div>
              </div>
              <div class="flex justify-between text-xs"><span>Escala</span><span id="moedasScaleVal">100%</span></div><input id="rangeMoedasScale" type="range" min="60" max="150" value="100" class="w-full" />
            </div>
            <div class="bg-ts-panel border border-ts-border rounded-2xl p-4 space-y-2.5">
              <div class="grid grid-cols-3 gap-1.5"><button data-anim="none" class="anim-btn py-1.5 rounded-lg text-[11px] font-bold border border-fuchsia-500 bg-fuchsia-600/30">Nenhuma</button><button data-anim="girar" class="anim-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card">Girar</button><button data-anim="pulsar" class="anim-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card">Pulsar</button><button data-anim="quicar" class="anim-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card">Quicar</button><button data-anim="balancar" class="anim-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card">Balançar</button><button data-anim="brilhar" class="anim-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card">Brilhar</button></div>
              <div class="flex gap-2"><input id="colorMoedas" type="color" value="#facc15" /><select id="selectMoedasFont" class="flex-1 bg-ts-bg border border-ts-border rounded-lg px-2 py-1 text-xs"><option value="system">System</option><option value="impact">Arcade Impact</option><option value="mono">Mono</option></select></div>
              <div class="flex gap-1.5"><input id="obsUrlMoedas" readonly class="flex-1 bg-ts-bg border border-ts-border rounded-lg px-2 py-1 text-[10px] font-mono text-cyan-300" /><button data-copy="obsUrlMoedas" class="copy-btn px-2 py-1 rounded-lg bg-ts-card border border-ts-border text-[10px] font-bold">Copiar</button></div>
            </div>
          </div>
        </section>

        <!-- ABA LIKES -->
        <section id="tab-likes" class="tab-panel hidden max-w-5xl mx-auto p-4 lg:p-6 space-y-4">
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-3"><div class="flex justify-between"><div><h2 class="text-base font-bold">Ranking Tap-Tap</h2><p class="text-xs text-slate-400" id="likesTotalSubtitle">Total: 0</p></div><button data-clean="likes" class="btn-open-clean px-3 py-1.5 rounded-lg bg-cyan-600 text-xs font-bold">Overlay Limpo</button></div><div id="previewLikesContainer" class="min-h-[210px] rounded-xl border border-ts-border p-4 flex items-center justify-center checkerboard-bg"></div></div>
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-2"><div class="flex gap-2"><button data-rank-count="likes" data-val="3" class="likes-count-btn flex-1 py-1.5 rounded-lg text-xs font-bold border border-ts-border bg-ts-card">3</button><button data-rank-count="likes" data-val="5" class="likes-count-btn flex-1 py-1.5 rounded-lg text-xs font-bold border border-blue-500 bg-blue-600/25">5</button><button data-rank-count="likes" data-val="10" class="likes-count-btn flex-1 py-1.5 rounded-lg text-xs font-bold border border-ts-border bg-ts-card">10</button></div><div class="flex justify-between text-xs"><span>Espaçamento</span><span id="likesGapVal">8px</span></div><input id="rangeLikesGap" type="range" min="2" max="24" value="8" class="w-full" /></div><div class="flex items-end gap-2"><input id="obsUrlLikes" readonly class="flex-1 bg-ts-bg border border-ts-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300" /><button data-copy="obsUrlLikes" class="copy-btn px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-xs font-bold">Copiar</button></div></div>
        </section>

        <!-- ABA SHARES -->
        <section id="tab-shares" class="tab-panel hidden max-w-5xl mx-auto p-4 lg:p-6 space-y-4">
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-3"><div class="flex justify-between"><h2 class="text-base font-bold">Ranking de Shares</h2><div class="flex gap-2"><button id="btnResetShares" type="button" class="px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-xs font-bold">Zerar Batalha</button><button data-clean="shares" class="btn-open-clean px-3 py-1.5 rounded-lg bg-cyan-600 text-xs font-bold">Overlay Limpo</button></div></div><div id="previewSharesContainer" class="min-h-[200px] rounded-xl border border-ts-border p-4 flex items-center justify-center checkerboard-bg"></div></div>
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-4 flex gap-3 items-center justify-between"><div class="flex gap-2"><button data-rank-count="shares" data-val="3" class="shares-count-btn px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-500 bg-blue-600/25">Top 3</button><button data-rank-count="shares" data-val="5" class="shares-count-btn px-3 py-1.5 rounded-lg text-xs font-bold border border-ts-border bg-ts-card">Top 5</button></div><div class="flex gap-2 flex-1 max-w-md"><input id="obsUrlShares" readonly class="flex-1 bg-ts-bg border border-ts-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300" /><button data-copy="obsUrlShares" class="copy-btn px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-xs font-bold">Copiar</button></div></div>
        </section>

        <!-- ABA BIG GIFTER -->
        <section id="tab-gifter" class="tab-panel hidden max-w-5xl mx-auto p-4 lg:p-6 space-y-4">
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-3"><div class="flex justify-between"><h2 class="text-base font-bold">Big Gifter 3D</h2><button data-clean="gifter" class="btn-open-clean px-3 py-1.5 rounded-lg bg-cyan-600 text-xs font-bold">Overlay Limpo</button></div><div id="previewGifterContainer" class="min-h-[210px] rounded-xl border border-ts-border p-4 flex items-center justify-center checkerboard-bg"></div></div>
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-2.5"><div class="grid grid-cols-5 gap-1.5"><button data-gframe="none" class="gframe-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card">Sem</button><button data-gframe="gold" class="gframe-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card text-yellow-300">Ouro</button><button data-gframe="silver" class="gframe-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card text-slate-200">Prata</button><button data-gframe="bronze" class="gframe-btn py-1.5 rounded-lg text-[11px] font-bold border border-ts-border bg-ts-card text-amber-400">Bronze</button><button data-gframe="crystal" class="gframe-btn py-1.5 rounded-lg text-[11px] font-bold border border-cyan-400 bg-cyan-500/20 text-cyan-300">Cristal</button></div><div class="flex flex-wrap items-center gap-3"><div class="flex items-center gap-1.5"><input id="colorGifterTitle" type="color" value="#facc15" /><span class="text-[11px]">Título</span></div><div class="flex items-center gap-1.5"><input id="colorGifterCoins" type="color" value="#ffd700" /><span class="text-[11px]">Moedas</span></div><label class="px-2.5 py-1 rounded-lg bg-ts-bg border border-ts-border text-[11px] text-cyan-300 font-bold cursor-pointer">PNG Presente<input id="inputGifterPng" type="file" accept="image/*" class="hidden" /></label><button id="btnClearGifterPng" type="button" class="text-[11px] text-slate-400 hover:text-rose-400">Limpar</button></div></div><div class="space-y-2"><div class="flex justify-between text-xs"><span>Escala</span><span id="gifterScaleVal">100%</span></div><input id="rangeGifterScale" type="range" min="70" max="160" value="100" class="w-full" /><div class="flex gap-2"><input id="obsUrlGifter" readonly class="flex-1 bg-ts-bg border border-ts-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300" /><button data-copy="obsUrlGifter" class="copy-btn px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-xs font-bold">Copiar</button></div></div></div>
        </section>

        <!-- ABA NOTIFICAÇÕES -->
        <section id="tab-notificacoes" class="tab-panel hidden max-w-5xl mx-auto p-4 lg:p-6 space-y-4">
          <div class="flex flex-wrap gap-2"><button data-notif-type="follow" class="notif-sub-btn px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white">Novo Seguidor</button><button data-notif-type="slim" class="notif-sub-btn px-4 py-2 rounded-xl text-xs font-bold bg-ts-card border border-ts-border">Seguidor Slim</button><button data-notif-type="heartme" class="notif-sub-btn px-4 py-2 rounded-xl text-xs font-bold bg-ts-card border border-ts-border">HeartMe</button><button data-notif-type="strong" class="notif-sub-btn px-4 py-2 rounded-xl text-xs font-bold bg-ts-card border border-ts-border">Strong On</button></div>
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-3"><div class="flex justify-between"><h2 class="text-base font-bold">Notificações OBS</h2><div class="flex gap-2"><button id="btnTestNotif" type="button" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-bold">Testar</button><button data-clean="notif" class="btn-open-clean px-3 py-1.5 rounded-lg bg-cyan-600 text-xs font-bold">Overlay Limpo</button></div></div><div id="previewNotifContainer" class="min-h-[160px] rounded-xl border border-ts-border p-4 flex items-center justify-center checkerboard-bg"></div></div>
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3"><input id="inputNotifMsg" type="text" value="Obrigado por seguir!" class="bg-ts-bg border border-ts-border rounded-lg px-3 py-1.5 text-xs" /><div class="flex items-center gap-2"><input id="colorNotif" type="color" value="#22c55e" /><span id="notifColorHex" class="text-xs font-mono">#22C55E</span></div><input id="inputStrongMin" type="number" value="500" class="bg-ts-bg border border-ts-border rounded-lg px-3 py-1.5 text-xs" /><div class="md:col-span-3 flex gap-2"><input id="obsUrlNotif" readonly class="flex-1 bg-ts-bg border border-ts-border rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300" /><button data-copy="obsUrlNotif" class="copy-btn px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-xs font-bold">Copiar</button></div></div>
        </section>

        <!-- ABA VOICE BOT -->
        <section id="tab-tts" class="tab-panel hidden max-w-4xl mx-auto p-4 lg:p-6 space-y-4">
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-4"><div class="flex justify-between"><h2 class="text-base font-bold">Voice Bot (TTS PT-BR)</h2><label class="flex items-center gap-2 text-xs font-bold text-emerald-300"><input id="chkTtsEnabled" type="checkbox" checked /> ATIVADO</label></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><select id="selTtsVoice" class="bg-ts-bg border border-ts-border rounded-lg px-3 py-2 text-xs"></select><input id="inputTtsPrefix" type="text" value="!tts" class="bg-ts-bg border border-ts-border rounded-lg px-3 py-2 text-xs font-mono" /><div><div class="flex justify-between text-xs"><span>Volume</span><span id="ttsVolVal">100%</span></div><input id="rangeTtsVol" type="range" min="10" max="100" value="100" class="w-full" /></div><div><div class="flex justify-between text-xs"><span>Velocidade</span><span id="ttsRateVal">1.2x</span></div><input id="rangeTtsRate" type="range" min="0.6" max="2.0" step="0.1" value="1.2" class="w-full" /></div></div><div class="flex gap-2"><input id="inputTtsTestMsg" type="text" value="!tts Salve galera! Bora bater a meta da live!" class="flex-1 bg-ts-bg border border-ts-border rounded-lg px-3 py-2 text-xs" /><button id="btnTestTts" type="button" class="px-4 py-2 rounded-lg bg-blue-600 text-xs font-bold">Testar Voz</button></div></div>
        </section>

        <!-- =============================================================== -->
        <!-- ABAS EXCLUSIVAS DO ADMINISTRADOR (INVISÍVEIS PARA CLIENTES)     -->
        <!-- =============================================================== -->

        <!-- ADMIN 1: PUBLICAR PACK GLOBAL (O QUE VOCÊ LANÇAR AQUI APARECE PRO CLIENTE) -->
        <section id="tab-admpack" class="tab-panel hidden max-w-5xl mx-auto p-4 lg:p-6 space-y-4">
          <div class="bg-ts-panel border border-emerald-500/40 rounded-2xl p-5 space-y-4">
            <div class="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 class="text-base font-black text-emerald-300">Publicar Pack Global (Visível para Compradores)</h2>
                <p class="text-xs text-slate-400">Edite os arquivos que ficam disponíveis para download no link de quem comprou. Suba os arquivos `.webm`/`.png` na pasta `pack/` do GitHub e clique em Publicar.</p>
              </div>
              <div class="flex gap-2">
                <button id="btnAdminPublishCatalog" type="button" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs">Publicar para Clientes</button>
                <button id="btnAdminDownloadCatalog" type="button" class="px-3 py-2 rounded-xl bg-ts-card border border-ts-border text-xs font-bold text-white">Baixar catalogo.json</button>
              </div>
            </div>

            <div class="bg-ts-bg border border-ts-border rounded-xl p-3 space-y-2">
              <label class="block text-[11px] font-bold text-cyan-300">Vídeo da Apresentação na Vitrine (URL ou caminho no GitHub):</label>
              <input id="admComercialUrl" type="text" value="pack/comercial.webm" class="w-full bg-ts-panel border border-ts-border rounded-lg px-3 py-1.5 text-xs font-mono text-white" />
            </div>

            <div class="bg-ts-bg border border-ts-border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-5 gap-2">
              <input id="admNewPackName" type="text" placeholder="Nome (ex: Diamante)" class="bg-ts-panel border border-ts-border rounded-lg px-2.5 py-1.5 text-xs text-white" />
              <input id="admNewPackCat" type="text" placeholder="Categoria (Efeito 3D)" class="bg-ts-panel border border-ts-border rounded-lg px-2.5 py-1.5 text-xs text-white" />
              <input id="admNewPackFile" type="text" placeholder="pack/diamante.webm" class="bg-ts-panel border border-ts-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-white" />
              <input id="admNewPackFmt" type="text" value="WEBM Transparente" class="bg-ts-panel border border-ts-border rounded-lg px-2.5 py-1.5 text-xs text-white" />
              <button id="btnAdmAddPackItem" type="button" class="py-1.5 rounded-lg bg-blue-600 text-xs font-bold text-white">+ Adicionar Item</button>
            </div>

            <div id="adminCatalogList" class="space-y-2"></div>
          </div>
        </section>

        <!-- ADMIN 2: ESTÚDIO VFX CHROMA KEY (.WEBM TRANSPARENTE) -->
        <section id="tab-vfx" class="tab-panel hidden lg:h-full flex flex-col lg:flex-row">
          <aside class="w-full lg:w-[37%] lg:min-w-[340px] border-b lg:border-b-0 lg:border-r border-ts-border bg-ts-panel lg:overflow-y-auto p-4 space-y-4">
            <section class="p-3.5 rounded-xl bg-gradient-to-b from-emerald-950/45 to-ts-card border-2 border-emerald-500/60 space-y-3">
              <div class="flex justify-between items-center"><span class="text-xs font-black text-emerald-300">Converter Vídeo para .WEBM Transparente</span><span class="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-bold">1:1</span></div>
              <label class="block w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs text-center cursor-pointer">
                Selecionar Vídeo (.MP4 / .WEBM)
                <input id="inputVideoFile" type="file" accept="video/*" class="hidden" />
              </label>
              <div class="flex items-center gap-2">
                <label class="flex-1 py-1.5 px-2 rounded-lg bg-ts-bg border border-ts-border text-[11px] font-bold text-center cursor-pointer">Trocar Áudio (.MP3)<input id="inputAudioFile" type="file" accept="audio/*" class="hidden" /></label>
                <button id="btnClearAudio" type="button" class="hidden px-2.5 py-1.5 rounded-lg bg-ts-bg border border-ts-border text-[10px]">Áudio Original</button>
              </div>
              <div id="mediaStatusLabel" class="text-[10px] text-emerald-200/80 truncate">Nenhum vídeo selecionado.</div>
              <div class="grid grid-cols-2 gap-2 items-center">
                <select id="selKeyMode" class="bg-ts-bg border border-ts-border rounded-lg px-2 py-1 text-[11px] text-white"><option value="1">Fundo Verde (Chroma)</option><option value="2">Fundo Preto (Luma)</option><option value="0">Sem Corte</option></select>
                <label class="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer"><input id="chkHideCorner" type="checkbox" checked /><span>Ocultar Marca Canto</span></label>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div><div class="flex justify-between text-[9px] text-slate-400"><span>Corte</span><span id="keyThreshVal">0.08</span></div><input id="rangeKeyThresh" type="range" min="0.01" max="0.45" step="0.01" value="0.08" class="w-full" /></div>
                <div><div class="flex justify-between text-[9px] text-slate-400"><span>Suavidade</span><span id="keySmoothVal">0.14</span></div><input id="rangeKeySmooth" type="range" min="0.02" max="0.40" step="0.01" value="0.14" class="w-full" /></div>
                <div><div class="flex justify-between text-[9px] text-slate-400"><span>Despill</span><span id="keyDespillVal">0.90</span></div><input id="rangeKeyDespill" type="range" min="0.00" max="1.00" step="0.05" value="0.90" class="w-full" /></div>
              </div>
            </section>
            <section class="p-3 rounded-xl bg-ts-card/70 border border-ts-border space-y-2">
              <div class="flex justify-between text-xs font-bold uppercase text-slate-300"><span>Rascunhos Locais</span><span id="packCountBadge" class="text-cyan-400 font-mono">0</span></div>
              <div id="savedPackList" class="space-y-1.5 max-h-56 overflow-y-auto"></div>
            </section>
          </aside>

          <div class="w-full lg:w-[63%] flex-1 flex flex-col bg-[#06080d] overflow-hidden">
            <div class="p-3 border-b border-ts-border bg-ts-panel/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div class="flex items-center gap-2">
                <button id="btnReplay" type="button" class="px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-xs font-bold">Reiniciar</button>
                <button id="btnPlayPause" type="button" class="px-3 py-1.5 rounded-lg bg-ts-card border border-ts-border text-xs font-bold"><span id="playPauseLabel">Pausar</span></button>
                <div class="hidden sm:flex items-center gap-2 bg-ts-bg px-2.5 py-1 rounded-lg border border-ts-border"><span class="text-[11px] font-mono text-cyan-400" id="timeDisplay">0.00s</span><div class="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div id="timelineProgress" class="h-full bg-cyan-400 w-0"></div></div><span class="text-[11px] font-mono text-slate-400" id="totalDurDisplay">0.00s</span></div>
              </div>
              <button id="btnRecordWebm" type="button" class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-white font-extrabold text-xs">
                <span id="recBtnText">Baixar (.webm) Transparente</span>
              </button>
            </div>
            <div class="flex-1 p-4 flex items-center justify-center overflow-hidden relative">
              <div class="relative h-[56vh] lg:h-full max-h-[66vh] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-ts-border checkerboard-bg flex items-center justify-center">
                <canvas id="vfxCanvas" width="1080" height="1920" class="w-full h-full block"></canvas>
                <div id="emptyStageOverlay" class="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-xs text-slate-300 bg-black/35">Envie um vídeo ao lado para recortar o fundo e baixar em .WEBM transparente.</div>
                <div id="recordingOverlayBadge" class="hidden pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 border border-rose-500 px-3 py-1 rounded-full text-xs font-mono font-bold text-white" id="recordingTimerText">REC 0.0s</div>
              </div>
            </div>
            <div class="px-4 py-1.5 border-t border-ts-border text-[11px] text-slate-400 flex justify-between"><span>1080×1920 Alpha</span><span id="codecStatusLabel" class="font-mono text-slate-500"></span></div>
          </div>
        </section>

        <!-- ADMIN 3: LINKS VIP GRÁTIS PARA INFLUENCIADORES -->
        <section id="tab-admlinks" class="tab-panel hidden max-w-4xl mx-auto p-4 lg:p-6 space-y-4">
          <div class="bg-ts-panel border border-ts-border rounded-2xl p-5 space-y-4">
            <h2 class="text-base font-black text-amber-300">Gerar Link VIP Grátis (Influenciadores)</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input id="admClientUser" type="text" placeholder="@influenciador" class="bg-ts-bg border border-ts-border rounded-lg px-3 py-2 text-xs text-white font-semibold" />
              <select id="admClientPlan" class="bg-ts-bg border border-ts-border rounded-lg px-3 py-2 text-xs text-white"><option value="Influenciador VIP">Influenciador VIP</option><option value="PRO Mensal">PRO Mensal</option><option value="Teste Parceria">Teste Parceria</option></select>
              <select id="admClientDays" class="bg-ts-bg border border-ts-border rounded-lg px-3 py-2 text-xs text-white"><option value="7">7 dias</option><option value="30" selected>30 dias</option><option value="90">90 dias</option><option value="vitalicio">Vitalício</option></select>
            </div>
            <input id="admClientWs" type="text" placeholder="Bridge WS opcional (wss://...)" class="w-full bg-ts-bg border border-ts-border rounded-lg px-3 py-1.5 text-xs text-white font-mono" />
            <button id="btnAdminCreateClient" type="button" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs uppercase">Gerar Link Exclusivo</button>
            <div class="flex justify-between text-xs font-bold text-slate-400"><span>Cadastrados</span><span id="admCountBadge">0</span></div>
            <div id="admClientList" class="space-y-2 max-h-60 overflow-y-auto"></div>
            <div class="bg-ts-bg border border-ts-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-300">Alterar Senha Admin (local):</span>
              <div class="flex gap-2"><input id="admNewPassInput" type="password" placeholder="Nova senha..." class="bg-ts-panel border border-ts-border rounded-lg px-3 py-1 text-xs text-white" /><button id="btnAdminChangePass" type="button" class="px-3 py-1 rounded-lg bg-blue-600 text-xs font-bold text-white">Salvar</button></div>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>

  <video id="userUploadedVideo" loop playsinline style="position:fixed;left:-9999px;top:0;width:16px;height:16px;opacity:0.001;pointer-events:none;"></video>
  <div id="toastBox" class="pointer-events-none opacity-0 translate-y-2 transition-all duration-300 fixed bottom-5 right-5 z-50 bg-ts-card border border-cyan-400/60 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl"><span id="toastText">Pronto!</span></div>

  <script type="module">
    import * as THREE from 'three';

    // =========================================================================
    // 0. SEGURANÇA, PAPEL (PÚBLICO / CLIENTE / ADMIN) & CATÁLOGO GLOBAL
    // =========================================================================
    const ADMIN_PASS_KEY='tikscan_admin_pass_v1', ADMIN_CLIENTS_KEY='tikscan_admin_clients_v1', ADMIN_SESSION_KEY='tikscan_is_admin_v1';
    function getAdminPass(){return localStorage.getItem(ADMIN_PASS_KEY)||'admin123';}
    function signClientToken(u,e,p){const s=`${String(u).toLowerCase().trim()}|${e}|${p}|TIKSCAN_PRO_BR_2026`;let a=0x811c9dc5,b=0x9e3779b9;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a^=c;a=Math.imul(a,0x01000193);b^=c+i;b=Math.imul(b,0x85ebca6b);}return((a>>>0).toString(36)+(b>>>0).toString(36)).slice(0,10);}
    function loadAdminClients(){try{return JSON.parse(localStorage.getItem(ADMIN_CLIENTS_KEY)||'[]');}catch{return[];}}
    function saveAdminClients(l){localStorage.setItem(ADMIN_CLIENTS_KEY,JSON.stringify(l));renderAdminClients();}
    function buildClientInviteUrl(c){const clean=window.location.href.split('?')[0].split('#')[0],p=new URLSearchParams({u:c.user,exp:c.exp,plan:c.plan,k:c.sig});if(c.ws)p.set('ws',c.ws);return`${clean}?${p.toString()}`;}

    let globalCatalog={comercialUrl:'pack/comercial.webm',itens:[]};
    let isAdminUser=false, activeClientLink=window.location.href;

    async function fetchGlobalCatalog(){
      try{
        const r=await fetch('/api/catalogo?t='+Date.now(),{cache:'no-store'});
        if(r.ok){globalCatalog=await r.json();}
      }catch{}
      if(!globalCatalog.itens||!globalCatalog.itens.length){
        try{
          const r2=await fetch('pack/catalogo.json?t='+Date.now(),{cache:'no-store'});
          if(r2.ok){const d=await r2.json();globalCatalog=Array.isArray(d)?{comercialUrl:'pack/comercial.webm',itens:d}:d;}
        }catch{}
      }
      renderPublicCatalogPreview();
      renderClientPackDownloads();
      renderAdminCatalogEditor();
      setupPublicVideo();
    }

    function setupPublicVideo(){
      const vid=document.getElementById('publicPromoVideo'),fb=document.getElementById('publicPromoFallback');
      if(!vid)return;
      vid.src=globalCatalog.comercialUrl||'pack/comercial.webm';
      vid.onerror=()=>{vid.classList.add('hidden');fb.classList.remove('hidden');};
      vid.onloadeddata=()=>{vid.classList.remove('hidden');fb.classList.add('hidden');};
    }

    function renderPublicCatalogPreview(){
      const grid=document.getElementById('publicPackPreviewGrid');if(!grid)return;
      const items=(globalCatalog.itens||[]).filter(x=>x.ativo!==false);
      grid.innerHTML=items.map(it=>`<div class="bg-ts-panel border border-ts-border rounded-xl p-3 space-y-1"><div class="text-[10px] font-bold uppercase text-cyan-400">${it.categoria||'Efeito'}</div><div class="text-xs font-extrabold text-white truncate">${it.nome}</div><div class="text-[10px] text-slate-400">${it.formato||'WEBM'}</div></div>`).join('');
    }

    function renderClientPackDownloads(){
      const grid=document.getElementById('clientPackGrid');if(!grid)return;
      const items=(globalCatalog.itens||[]).filter(x=>x.ativo!==false);
      if(!items.length){grid.innerHTML='<div class="col-span-full text-xs text-slate-400 text-center py-8 border border-dashed border-ts-border rounded-2xl">Nenhum efeito publicado ainda pelo administrador.</div>';return;}
      grid.innerHTML=items.map(it=>{
        const isVideo=/\.(webm|mp4)$/i.test(it.arquivo||'');
        const fname=(it.arquivo||'efeito.webm').split('/').pop();
        return`<div class="bg-ts-panel border border-ts-border hover:border-cyan-400/60 rounded-2xl p-4 flex flex-col justify-between gap-3 transition">
          <div class="space-y-1.5">
            <div class="flex justify-between items-center gap-2"><span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300">${it.categoria||'VFX'}</span><span class="text-[10px] font-mono text-slate-400">${it.formato||''}</span></div>
            <div class="text-sm font-black text-white">${it.nome}</div>
            ${isVideo?`<video src="${it.arquivo}" muted playsinline loop onmouseover="this.play()" onmouseout="this.pause()" class="w-full h-36 object-contain rounded-xl bg-black/50 border border-ts-border"></video>`:`<div class="h-20 rounded-xl bg-ts-bg border border-ts-border flex items-center justify-center text-xs font-bold text-slate-400">${fname}</div>`}
          </div>
          <a href="${it.arquivo}" download="${fname}" target="_blank" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs text-center uppercase">Baixar Arquivo</a>
        </div>`;
      }).join('');
    }

    // =========================================================================
    // 1. CHECKOUT MERCADO PAGO + RETORNO AUTOMÁTICO
    // =========================================================================
    document.getElementById('btnPayMercadoPago').addEventListener('click',async()=>{
      const u=document.getElementById('mpInputUser').value.trim(),err=document.getElementById('mpCheckoutErr'),btn=document.getElementById('btnPayMercadoPago');
      err.classList.add('hidden');
      if(!u){err.textContent='Digite seu @ do TikTok antes de continuar.';err.classList.remove('hidden');return;}
      btn.disabled=true;btn.textContent='Abrindo Mercado Pago...';
      try{
        const res=await fetch('/api/criar-pagamento',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tiktokUser:u})});
        const data=await res.json();
        if(!res.ok||!data.init_point)throw new Error(data.error||'Erro ao iniciar pagamento.');
        window.location.href=data.init_point;
      }catch(e){
        err.textContent=e.message;err.classList.remove('hidden');
        btn.disabled=false;btn.textContent='Adquirir Acesso PRO — R$ 29,99 (Pix / Cartão)';
      }
    });

    async function handleMercadoPagoReturn(paymentId){
      document.getElementById('mpProcessingScreen').classList.remove('hidden');
      try{
        const res=await fetch(`/api/confirmar-pagamento?payment_id=${encodeURIComponent(paymentId)}`);
        const d=await res.json();
        if(d.approved&&d.k){
          const clean=window.location.href.split('?')[0].split('#')[0];
          const p=new URLSearchParams({u:d.user,exp:d.exp,plan:d.plan,k:d.k});
          const targetUrl=`${clean}?${p.toString()}`;
          localStorage.setItem('tikscan_saved_client_url',targetUrl);
          window.location.replace(targetUrl);
          return;
        }
        document.getElementById('mpProcTitle').textContent='Pagamento Pendente';
        document.getElementById('mpProcMsg').textContent='Se você pagou por Pix agora, aguarde alguns segundos e clique em verificar novamente.';
        const rb=document.getElementById('mpRetryBtn');rb.classList.remove('hidden');rb.onclick=()=>handleMercadoPagoReturn(paymentId);
      }catch{
        document.getElementById('mpProcTitle').textContent='Erro ao validar pagamento';
        document.getElementById('mpRetryBtn').classList.remove('hidden');
      }
    }

    // =========================================================================
    // 2. ESTADO & OVERLAYS
    // =========================================================================
    const SCAN_STORAGE='tikscan_pro_state_v4',PACK_STORAGE_KEY='tikarcade_vfx_pack_v4';
    const syncChannel=new BroadcastChannel('tikscan_pro_sync');
    const defaultUsers=[{name:'Maria_live',color:'#ec4899',coins:25800,weeklyCoins:84200,likes:4200,shares:9},{name:'joao_tk',color:'#3b82f6',coins:14200,weeklyCoins:51400,likes:2800,shares:6},{name:'ana_stars',color:'#f59e0b',coins:8500,weeklyCoins:29100,likes:1500,shares:4}];
    const liveData={tiktokUser:'@live_demo',testMode:true,activeTab:'pack',cleanOverlayMode:null,users:JSON.parse(JSON.stringify(defaultUsers)),bigGifter:{name:'Raynnara Lira',giftName:'Presente VIP',giftImg:null,coins:1000,color:'#a855f7'},totalLikes:10000,moedasCfg:{period:'diario',count:3,mode:'podium',transparent:true,gamesFrames:false,anim:'none',scale:100,font:'system',coinColor:'#facc15',customFrames:{1:null,2:null,3:null}},likesCfg:{count:5,gap:8},sharesCfg:{count:3},gifterCfg:{titleColor:'#facc15',coinColor:'#ffd700',scale:100,frame:'crystal',flipped:false},notifCfg:{type:'follow',msg:'Obrigado por seguir!',color:'#22c55e',strongMin:500,lastTrigger:{user:'Seguidor_Live',coins:1000}}};
    try{const r=localStorage.getItem(SCAN_STORAGE);if(r)Object.assign(liveData,JSON.parse(r));}catch{}
    function persistScan(bc=true){localStorage.setItem(SCAN_STORAGE,JSON.stringify(liveData));if(bc)syncChannel.postMessage({type:'SYNC_STATE',payload:liveData});}
    const toastBox=document.getElementById('toastBox'),toastText=document.getElementById('toastText');let toastTimer=null;
    function showToast(m){toastText.textContent=m;toastBox.classList.remove('opacity-0','translate-y-2');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastBox.classList.add('opacity-0','translate-y-2'),3000);}

    function getAnimClass(a){return a==='girar'?'av-girar':a==='pulsar'?'av-pulsar':a==='quicar'?'av-quicar':a==='balancar'?'av-balancar':a==='brilhar'?'av-brilhar':'';}
    function getFontFamily(k){return k==='impact'?'Impact,"Arial Black",sans-serif':k==='mono'?'ui-monospace,monospace':'Inter,system-ui,sans-serif';}
    function renderAvatarBadge(u,rank,cfg={}){const ini=(u.name||'TT').replace(/[^A-Za-z0-9]/g,'').slice(0,2).toUpperCase()||'TT',cp=cfg.customFrames?.[rank],f=cfg.gamesFrames?'frame-games':rank===1?'frame-gold':rank===2?'frame-silver':rank===3?'frame-bronze':'',a=rank<=3?getAnimClass(cfg.anim||'none'):'',s=rank===1&&cfg.mode==='podium'?'w-20 h-20 text-xl':'w-12 h-12 text-xs';return`<div class="relative inline-flex items-center justify-center ${s} rounded-full ${f} ${a} shrink-0" style="background-color:${u.color||'#3b82f6'}"><span class="font-black text-white">${ini}</span>${cp?`<img src="${cp}" class="absolute inset-0 w-full h-full object-contain scale-125 pointer-events-none" />`:''}${rank<=3?`<span class="absolute -bottom-1.5 px-1.5 rounded-full text-[9px] font-black bg-black/85 border border-white/25 text-yellow-300">${rank}º</span>`:''}</div>`;}
    function buildMoedasMarkup(){const cfg=liveData.moedasCfg,isW=cfg.period==='semanal',sorted=[...liveData.users].sort((a,b)=>(isW?b.weeklyCoins:b.coins)-(isW?a.weeklyCoins:a.coins)).slice(0,cfg.count),st=`transform:scale(${cfg.scale/100});font-family:${getFontFamily(cfg.font)};`;if(cfg.mode==='podium'&&!isW&&sorted.length>=1){const top3=[sorted[1],sorted[0],sorted[2]].filter(Boolean);return`<div class="flex items-end justify-center gap-6 sm:gap-10 py-2" style="${st}">${top3.map(u=>{const r=sorted.indexOf(u)+1;return`<div class="flex flex-col items-center gap-1.5 ${r===1?'-translate-y-3':''}">${renderAvatarBadge(u,r,cfg)}<div class="text-xs font-extrabold text-white max-w-[110px] truncate">${u.name}</div><div class="text-xs font-black" style="color:${cfg.coinColor}">${u.coins.toLocaleString('pt-BR')} pts</div></div>`;}).join('')}</div>`;}return`<div class="w-full max-w-sm space-y-1.5" style="${st}">${sorted.map((u,i)=>`<div class="flex items-center justify-between gap-3 bg-black/70 border border-white/10 rounded-xl px-3 py-2"><div class="flex items-center gap-3 min-w-0"><span class="text-xs font-black w-5 text-slate-300">${i+1}º</span>${renderAvatarBadge(u,i+1,{...cfg,mode:'list'})}<span class="text-xs font-bold text-white truncate">${u.name}</span></div><span class="text-xs font-black shrink-0" style="color:${cfg.coinColor}">${(isW?u.weeklyCoins:u.coins).toLocaleString('pt-BR')}</span></div>`).join('')}</div>`;}
    function buildLikesMarkup(){const cfg=liveData.likesCfg,sorted=[...liveData.users].sort((a,b)=>b.likes-a.likes).slice(0,cfg.count);return`<div class="w-full max-w-sm flex flex-col" style="gap:${cfg.gap}px">${sorted.map((u,i)=>`<div class="flex items-center justify-between gap-3 bg-black/70 border border-white/10 rounded-xl px-3.5 py-2"><div class="flex items-center gap-3 min-w-0"><span class="text-xs font-black w-5 text-yellow-400">${i+1}º</span>${renderAvatarBadge(u,i+1,{anim:i<3?'pulsar':'none'})}<span class="text-xs font-bold text-white truncate">${u.name}</span></div><span class="text-xs font-black text-amber-400">${u.likes.toLocaleString('pt-BR')} likes</span></div>`).join('')}</div>`;}
    function buildSharesMarkup(){const sorted=[...liveData.users].sort((a,b)=>b.shares-a.shares).slice(0,liveData.sharesCfg.count);return`<div class="w-full max-w-sm space-y-2">${sorted.map((u,i)=>`<div class="flex items-center justify-between gap-3 bg-black/70 border border-white/10 rounded-xl px-3.5 py-2"><div class="flex items-center gap-3 min-w-0"><span class="text-xs font-black w-5 text-cyan-300">${i+1}º</span>${renderAvatarBadge(u,i+1,{anim:i===0?'brilhar':'none'})}<span class="text-xs font-bold text-white truncate">${u.name}</span></div><span class="text-xs font-black text-cyan-300">${u.shares} shares</span></div>`).join('')}</div>`;}
    function buildGifterMarkup(){const g=liveData.bigGifter,cfg=liveData.gifterCfg,f=cfg.frame==='none'?'':`frame-${cfg.frame}`,ini=(g.name||'BG').replace(/[^A-Za-z0-9]/g,'').slice(0,2).toUpperCase()||'BG',bf=g.giftImg?`<img src="${g.giftImg}" class="w-16 h-16 object-contain" />`:`<div class="text-center px-2"><div class="text-[10px] font-black uppercase text-cyan-300">${g.giftName||'VIP'}</div><div class="text-xs font-black" style="color:${cfg.coinColor}">${g.coins}</div></div>`;return`<div class="flex flex-col items-center gap-2 text-center" style="transform:scale(${cfg.scale/100})"><div class="text-sm font-black uppercase" style="color:${cfg.titleColor}">BIG GIFTER</div><div class="w-24 h-24 flip-scene"><div class="flip-card ${cfg.flipped?'is-flipped':''}"><div class="flip-face rounded-full ${f}" style="background-color:${g.color||'#a855f7'}"><span class="text-2xl font-black text-white">${ini}</span></div><div class="flip-face back rounded-full bg-black/85 ${f}">${bf}</div></div></div><div><div class="text-sm font-extrabold text-white">${g.name}</div><div class="text-xs font-black" style="color:${cfg.coinColor}">${g.coins} moedas</div></div></div>`;}
    function buildNotifMarkup(){const n=liveData.notifCfg,u=n.lastTrigger.user||'Seguidor';if(n.type==='slim')return`<div class="alert-pop flex flex-col items-center gap-1.5 text-center"><div class="w-16 h-16 rounded-full frame-gold bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xl font-black text-slate-950">${u.slice(0,2).toUpperCase()}</div><div class="text-sm font-extrabold text-white">${u}</div><div class="text-[11px] font-black text-amber-300">NOVO SEGUIDOR</div></div>`;if(n.type==='heartme')return`<div class="alert-pop flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/85 border-2 border-pink-500"><div class="w-11 h-11 rounded-full bg-pink-600 flex items-center justify-center font-black text-white text-sm">HM</div><div><div class="text-sm font-extrabold text-pink-300">Enviou HeartMe!</div><div class="text-xs text-slate-200">@${u}</div></div></div>`;if(n.type==='strong')return`<div class="alert-pop flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-black/85 border-2 border-amber-400"><div class="text-lg font-black text-amber-300">STRONG ON</div><div class="text-xs font-bold text-white">@${u} • ${n.lastTrigger.coins||n.strongMin} moedas</div></div>`;return`<div class="alert-pop flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/85 border-2" style="border-color:${n.color}"><div class="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-sm" style="background:${n.color}">TS</div><div><div class="text-sm font-extrabold" style="color:${n.color}">${n.msg}</div><div class="text-xs text-white">@${u} • Novo Seguidor</div></div></div>`;}
    function refreshAllPreviews(){const pm=document.getElementById('previewMoedasContainer');if(pm){pm.classList.toggle('checkerboard-bg',liveData.moedasCfg.transparent);pm.innerHTML=buildMoedasMarkup();}const pl=document.getElementById('previewLikesContainer');if(pl){pl.innerHTML=buildLikesMarkup();document.getElementById('likesTotalSubtitle').textContent=`Total: ${liveData.totalLikes.toLocaleString('pt-BR')} likes`;}const ps=document.getElementById('previewSharesContainer');if(ps)ps.innerHTML=buildSharesMarkup();const pg=document.getElementById('previewGifterContainer');if(pg)pg.innerHTML=buildGifterMarkup();const pn=document.getElementById('previewNotifContainer');if(pn)pn.innerHTML=buildNotifMarkup();if(liveData.cleanOverlayMode){const m=document.getElementById('obsCleanMount');if(liveData.cleanOverlayMode==='moedas')m.innerHTML=buildMoedasMarkup();else if(liveData.cleanOverlayMode==='likes')m.innerHTML=buildLikesMarkup();else if(liveData.cleanOverlayMode==='shares')m.innerHTML=buildSharesMarkup();else if(liveData.cleanOverlayMode==='gifter')m.innerHTML=buildGifterMarkup();else if(liveData.cleanOverlayMode==='notif')m.innerHTML=buildNotifMarkup();}}
    setInterval(()=>{liveData.gifterCfg.flipped=!liveData.gifterCfg.flipped;refreshAllPreviews();},2600);

    // SIMULADOR & OVERLAYS
    const names=['Maria_live','joao_tk','ana_stars','pedro_go','Raynnara Lira'],colors=['#ec4899','#3b82f6','#f59e0b','#10b981','#8b5cf6'];
    function pickUser(n){let u=liveData.users.find(x=>x.name===n);if(!u){u={name:n,color:colors[Math.floor(Math.random()*colors.length)],coins:0,weeklyCoins:0,likes:0,shares:0};liveData.users.push(u);}return u;}
    function handleEvent(evt){const n=evt.user||names[Math.floor(Math.random()*names.length)],u=pickUser(n);if(evt.type==='gift'){const c=Number(evt.coins)||1;u.coins+=c;u.weeklyCoins+=c;if(c>=liveData.bigGifter.coins)liveData.bigGifter={...liveData.bigGifter,name:u.name,giftName:evt.giftName||'Presente VIP',coins:c,color:u.color};if(c>=liveData.notifCfg.strongMin){liveData.notifCfg.lastTrigger={user:u.name,coins:c};showToast(`STRONG ON: @${u.name}`);}}else if(evt.type==='follow')liveData.notifCfg.lastTrigger={user:n,coins:0};else if(evt.type==='like'){const c=Number(evt.count)||25;u.likes+=c;liveData.totalLikes+=c;}else if(evt.type==='share')u.shares+=1;persistScan(true);refreshAllPreviews();}
    document.querySelectorAll('.sim-btn').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.sim;if(k==='gift1')handleEvent({type:'gift',coins:1});else if(k==='gift100')handleEvent({type:'gift',coins:100});else if(k==='strong')handleEvent({type:'gift',coins:500});else if(k==='follow')handleEvent({type:'follow'});else if(k==='like')handleEvent({type:'like',count:25});else if(k==='share')handleEvent({type:'share'});}));
    let autoIv=null;document.getElementById('btnAutoLive').addEventListener('click',e=>{if(autoIv){clearInterval(autoIv);autoIv=null;e.target.textContent='Auto-Live: OFF';}else{e.target.textContent='Auto-Live: ON';autoIv=setInterval(()=>{const r=Math.random();if(r<0.45)handleEvent({type:'like',count:30});else if(r<0.8)handleEvent({type:'gift',coins:[1,50,150,500][Math.floor(Math.random()*4)]});else handleEvent({type:'share'});},1400);}});

    // NAVEGAÇÃO
    const titles={pack:'Baixar Meu Pack',guia:'Guia TikTok Studio & OBS',conexao:'Conexão Live',moedas:'Ranking de Moedas',likes:'Ranking Tap-Tap',shares:'Ranking de Shares',gifter:'Big Gifter 3D',notificacoes:'Notificações OBS',tts:'Voice Bot (TTS)',admpack:'Publicar Pack Global (Admin)',vfx:'Estúdio Chroma Key (.WEBM)',admlinks:'Links VIP Influenciadores'};
    function closeMobileDrawer(){if(window.innerWidth<1024){const sb=document.getElementById('sidebarDrawer');sb.classList.add('hidden');sb.classList.remove('fixed','inset-y-0','left-0','z-40');}}
    function switchTab(id){
      if(!isAdminUser&&['admpack','vfx','admlinks'].includes(id))id='pack';
      liveData.activeTab=id;
      document.querySelectorAll('.side-tab').forEach(b=>{const c=b.dataset.tab===id;b.classList.toggle('bg-blue-600',c);b.classList.toggle('text-white',c);b.classList.toggle('text-slate-300',!c);});
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('hidden',p.id!==`tab-${id}`));
      document.getElementById('topSectionTitle').textContent=titles[id]||'TIK SCAN PRO';
      const showSim=['conexao','moedas','likes','shares','gifter','notificacoes'].includes(id);
      document.getElementById('liveSimToolbar').classList.toggle('hidden',!showSim);
      if(id!=='vfx'){const v=document.getElementById('userUploadedVideo');if(!v.paused)v.pause();}
      refreshAllPreviews();
    }
    document.querySelectorAll('.side-tab').forEach(b=>b.addEventListener('click',()=>{switchTab(b.dataset.tab);closeMobileDrawer();}));
    document.querySelectorAll('[data-goto-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.gotoTab)));
    document.getElementById('btnMobileMenu').addEventListener('click',()=>{const sb=document.getElementById('sidebarDrawer');if(sb.classList.contains('hidden')){sb.classList.remove('hidden');sb.classList.add('fixed','inset-y-0','left-0','z-40');}else closeMobileDrawer();});
    document.getElementById('btnCloseMobileMenu').addEventListener('click',closeMobileDrawer);

    // OVERLAYS CONTROLS & TTS
    function enterCleanMode(tp){liveData.cleanOverlayMode=tp;document.body.classList.add('obs-clean-mode');document.getElementById('mainAppShell').classList.add('hidden');document.getElementById('publicLandingShell').classList.add('hidden');document.getElementById('obsCleanScreen').classList.remove('hidden');refreshAllPreviews();}
    function exitCleanMode(){liveData.cleanOverlayMode=null;document.body.classList.remove('obs-clean-mode');document.getElementById('obsCleanScreen').classList.add('hidden');document.getElementById('mainAppShell').classList.remove('hidden');refreshAllPreviews();}
    document.querySelectorAll('.btn-open-clean').forEach(b=>b.addEventListener('click',()=>enterCleanMode(b.dataset.clean)));
    document.getElementById('btnExitCleanMode').addEventListener('click',exitCleanMode);
    syncChannel.onmessage=e=>{if(e.data?.type==='SYNC_STATE'){const cm=liveData.cleanOverlayMode;Object.assign(liveData,e.data.payload);liveData.cleanOverlayMode=cm;refreshAllPreviews();}};
    const base=window.location.href.split('?')[0].split('#')[0];
    ['Moedas','Likes','Shares','Gifter','Notif'].forEach(k=>{const el=document.getElementById(`obsUrl${k}`);if(el)el.value=`${base}?overlay=${k.toLowerCase()}`;});
    document.querySelectorAll('.copy-btn').forEach(b=>b.addEventListener('click',()=>{navigator.clipboard?.writeText(document.getElementById(b.dataset.copy).value);showToast('Link OBS copiado!');}));
    function updateUserLabels(u,m){document.getElementById('sidebarUserHandle').textContent=u;document.getElementById('connCardUser').textContent=u;document.getElementById('inputTiktokUser').value=u;document.getElementById('sidebarConnStatus').textContent=`● ${m}`;document.getElementById('connCardStatus').textContent=`● ${m}`;}
    function connectWsUrl(url){if(!url)return;try{const ws=new WebSocket(url);ws.onopen=()=>{document.getElementById('connStatusPill').textContent='● WS: Online';updateUserLabels(liveData.tiktokUser,'CONECTADO');};ws.onmessage=m=>{try{handleEvent(JSON.parse(m.data));}catch{}};ws.onerror=()=>showToast('Sem Bridge ativo.');}catch{}}
    document.getElementById('btnConnectUser').addEventListener('click',()=>{liveData.tiktokUser=document.getElementById('inputTiktokUser').value.trim()||'@live_demo';updateUserLabels(liveData.tiktokUser,'CONECTADO');persistScan(true);});
    document.getElementById('btnActivateTestMode').addEventListener('click',()=>{updateUserLabels(liveData.tiktokUser,'MODO SIMULAÇÃO');showToast('Simulação ativa!');});
    document.getElementById('btnDisconnect').addEventListener('click',()=>updateUserLabels(liveData.tiktokUser,'OFFLINE'));
    document.getElementById('btnConnectWs').addEventListener('click',()=>connectWsUrl(document.getElementById('inputWsUrl').value.trim()));
    document.getElementById('btnClearAllLive').addEventListener('click',()=>{liveData.users=[];liveData.totalLikes=0;persistScan(true);refreshAllPreviews();});

    document.querySelectorAll('.period-btn').forEach(b=>b.addEventListener('click',()=>{liveData.moedasCfg.period=b.dataset.moedasPeriod;document.querySelectorAll('.period-btn').forEach(x=>{x.classList.toggle('bg-blue-600',x===b);x.classList.toggle('text-white',x===b);x.classList.toggle('bg-ts-card',x!==b);});persistScan(true);refreshAllPreviews();}));
    document.querySelectorAll('.rank-count-btn').forEach(b=>b.addEventListener('click',()=>{liveData.moedasCfg.count=Number(b.dataset.val);document.querySelectorAll('.rank-count-btn').forEach(x=>{x.classList.toggle('border-blue-500',x===b);x.classList.toggle('bg-blue-600/25',x===b);});persistScan(true);refreshAllPreviews();}));
    document.getElementById('btnMoedasPodium').addEventListener('click',()=>{liveData.moedasCfg.mode='podium';persistScan(true);refreshAllPreviews();});
    document.getElementById('btnMoedasLista').addEventListener('click',()=>{liveData.moedasCfg.mode='list';persistScan(true);refreshAllPreviews();});
    document.getElementById('chkMoedasTransparent').addEventListener('change',e=>{liveData.moedasCfg.transparent=e.target.checked;persistScan(true);refreshAllPreviews();});
    document.getElementById('chkMoedasGames').addEventListener('change',e=>{liveData.moedasCfg.gamesFrames=e.target.checked;persistScan(true);refreshAllPreviews();});
    document.getElementById('rangeMoedasScale').addEventListener('input',e=>{liveData.moedasCfg.scale=Number(e.target.value);document.getElementById('moedasScaleVal').textContent=`${e.target.value}%`;persistScan(true);refreshAllPreviews();});
    document.getElementById('selectMoedasFont').addEventListener('change',e=>{liveData.moedasCfg.font=e.target.value;persistScan(true);refreshAllPreviews();});
    document.getElementById('colorMoedas').addEventListener('input',e=>{liveData.moedasCfg.coinColor=e.target.value;persistScan(true);refreshAllPreviews();});
    document.querySelectorAll('.anim-btn').forEach(b=>b.addEventListener('click',()=>{liveData.moedasCfg.anim=b.dataset.anim;document.querySelectorAll('.anim-btn').forEach(x=>{x.classList.toggle('border-fuchsia-500',x===b);x.classList.toggle('bg-fuchsia-600/30',x===b);});persistScan(true);refreshAllPreviews();}));
    document.querySelectorAll('.frame-upload-input').forEach(i=>i.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{liveData.moedasCfg.customFrames[i.dataset.frameUpload]=r.result;persistScan(true);refreshAllPreviews();};r.readAsDataURL(f);}));
    document.getElementById('btnRestoreMoedasFrames').addEventListener('click',()=>{liveData.moedasCfg.customFrames={1:null,2:null,3:null};persistScan(true);refreshAllPreviews();});
    document.querySelectorAll('.likes-count-btn').forEach(b=>b.addEventListener('click',()=>{liveData.likesCfg.count=Number(b.dataset.val);persistScan(true);refreshAllPreviews();}));
    document.getElementById('rangeLikesGap').addEventListener('input',e=>{liveData.likesCfg.gap=Number(e.target.value);document.getElementById('likesGapVal').textContent=`${e.target.value}px`;persistScan(true);refreshAllPreviews();});
    document.querySelectorAll('.shares-count-btn').forEach(b=>b.addEventListener('click',()=>{liveData.sharesCfg.count=Number(b.dataset.val);persistScan(true);refreshAllPreviews();}));
    document.getElementById('btnResetShares').addEventListener('click',()=>{liveData.users.forEach(u=>u.shares=0);persistScan(true);refreshAllPreviews();});
    document.getElementById('colorGifterTitle').addEventListener('input',e=>{liveData.gifterCfg.titleColor=e.target.value;persistScan(true);refreshAllPreviews();});
    document.getElementById('colorGifterCoins').addEventListener('input',e=>{liveData.gifterCfg.coinColor=e.target.value;persistScan(true);refreshAllPreviews();});
    document.getElementById('rangeGifterScale').addEventListener('input',e=>{liveData.gifterCfg.scale=Number(e.target.value);document.getElementById('gifterScaleVal').textContent=`${e.target.value}%`;persistScan(true);refreshAllPreviews();});
    document.querySelectorAll('.gframe-btn').forEach(b=>b.addEventListener('click',()=>{liveData.gifterCfg.frame=b.dataset.gframe;persistScan(true);refreshAllPreviews();}));
    document.getElementById('inputGifterPng').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{liveData.bigGifter.giftImg=r.result;persistScan(true);refreshAllPreviews();showToast('PNG aplicado!');};r.readAsDataURL(f);});
    document.getElementById('btnClearGifterPng').addEventListener('click',()=>{liveData.bigGifter.giftImg=null;persistScan(true);refreshAllPreviews();});
    document.querySelectorAll('.notif-sub-btn').forEach(b=>b.addEventListener('click',()=>{liveData.notifCfg.type=b.dataset.notifType;document.querySelectorAll('.notif-sub-btn').forEach(x=>{x.classList.toggle('bg-blue-600',x===b);x.classList.toggle('text-white',x===b);});persistScan(true);refreshAllPreviews();}));
    document.getElementById('inputNotifMsg').addEventListener('input',e=>{liveData.notifCfg.msg=e.target.value;persistScan(true);refreshAllPreviews();});
    document.getElementById('colorNotif').addEventListener('input',e=>{liveData.notifCfg.color=e.target.value;document.getElementById('notifColorHex').textContent=e.target.value.toUpperCase();persistScan(true);refreshAllPreviews();});
    document.getElementById('inputStrongMin').addEventListener('input',e=>{liveData.notifCfg.strongMin=Number(e.target.value)||500;persistScan(true);});
    document.getElementById('btnTestNotif').addEventListener('click',()=>{refreshAllPreviews();showToast('Notificação testada!');});

    function populateVoices(){const sel=document.getElementById('selTtsVoice');if(!window.speechSynthesis)return;const s=[...speechSynthesis.getVoices()].sort((a,b)=>(b.lang.startsWith('pt')?1:0)-(a.lang.startsWith('pt')?1:0));sel.innerHTML=s.length?s.map(v=>`<option value="${v.name}">${v.name} (${v.lang})</option>`).join(''):'<option value="">Voz PT-BR</option>';}
    if(window.speechSynthesis){populateVoices();speechSynthesis.onvoiceschanged=populateVoices;}
    document.getElementById('rangeTtsVol').addEventListener('input',e=>document.getElementById('ttsVolVal').textContent=`${e.target.value}%`);
    document.getElementById('rangeTtsRate').addEventListener('input',e=>document.getElementById('ttsRateVal').textContent=`${e.target.value}x`);
    document.getElementById('btnTestTts').addEventListener('click',()=>{if(!document.getElementById('chkTtsEnabled').checked||!window.speechSynthesis)return;const p=document.getElementById('inputTtsPrefix').value.trim();let c=document.getElementById('inputTtsTestMsg').value.trim();if(p&&c.startsWith(p))c=c.slice(p.length).trim();if(!c)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(c);u.lang='pt-BR';u.volume=Number(document.getElementById('rangeTtsVol').value)/100;u.rate=Number(document.getElementById('rangeTtsRate').value);speechSynthesis.speak(u);});
    document.getElementById('btnCopyMyAccessLink').addEventListener('click',()=>{navigator.clipboard?.writeText(activeClientLink);showToast('Seu link exclusivo foi copiado!');});

    // =========================================================================
    // 3. ÁREA ADMIN: EDITOR GLOBAL DO PACK + LINKS VIP + CHROMA KEY
    // =========================================================================
    function renderAdminCatalogEditor(){
      const list=document.getElementById('adminCatalogList'),cu=document.getElementById('admComercialUrl');
      if(!list)return;
      if(cu)cu.value=globalCatalog.comercialUrl||'pack/comercial.webm';
      const itens=globalCatalog.itens||[];
      list.innerHTML=itens.map((it,idx)=>`
        <div class="bg-ts-bg border border-ts-border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
            <input data-cat-edit="nome" data-idx="${idx}" value="${it.nome||''}" class="bg-ts-panel border border-ts-border rounded-lg px-2.5 py-1 text-xs text-white font-bold" />
            <input data-cat-edit="arquivo" data-idx="${idx}" value="${it.arquivo||''}" class="bg-ts-panel border border-ts-border rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300" />
            <input data-cat-edit="formato" data-idx="${idx}" value="${it.formato||''}" class="bg-ts-panel border border-ts-border rounded-lg px-2.5 py-1 text-xs text-slate-300" />
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <label class="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer"><input type="checkbox" data-cat-toggle="${idx}" ${it.ativo!==false?'checked':''} /> Visível</label>
            <button data-cat-del="${idx}" class="px-2 py-1 text-xs text-rose-400">✕</button>
          </div>
        </div>`).join('');
      list.querySelectorAll('[data-cat-edit]').forEach(inp=>inp.addEventListener('input',()=>{globalCatalog.itens[inp.dataset.idx][inp.dataset.catEdit]=inp.value;renderClientPackDownloads();}));
      list.querySelectorAll('[data-cat-toggle]').forEach(chk=>chk.addEventListener('change',()=>{globalCatalog.itens[chk.dataset.catToggle].ativo=chk.checked;renderClientPackDownloads();}));
      list.querySelectorAll('[data-cat-del]').forEach(btn=>btn.addEventListener('click',()=>{globalCatalog.itens.splice(Number(btn.dataset.catDel),1);renderAdminCatalogEditor();renderClientPackDownloads();}));
    }

    document.getElementById('admComercialUrl').addEventListener('input',e=>{globalCatalog.comercialUrl=e.target.value.trim();setupPublicVideo();});
    document.getElementById('btnAdmAddPackItem').addEventListener('click',()=>{
      const nome=document.getElementById('admNewPackName').value.trim(),cat=document.getElementById('admNewPackCat').value.trim()||'Efeito 3D',arq=document.getElementById('admNewPackFile').value.trim(),fmt=document.getElementById('admNewPackFmt').value.trim()||'WEBM Transparente';
      if(!nome||!arq)return showToast('Preencha Nome e Arquivo!');
      globalCatalog.itens.push({id:Date.now().toString(36),nome,categoria:cat,arquivo:arq,formato:fmt,ativo:true});
      document.getElementById('admNewPackName').value='';document.getElementById('admNewPackFile').value='';
      renderAdminCatalogEditor();renderClientPackDownloads();
    });
    document.getElementById('btnAdminDownloadCatalog').addEventListener('click',()=>{
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(globalCatalog,null,2)],{type:'application/json'}));a.download='catalogo.json';document.body.appendChild(a);a.click();a.remove();
    });
    document.getElementById('btnAdminPublishCatalog').addEventListener('click',async()=>{
      const pass=sessionStorage.getItem('tikscan_admin_pwd')||getAdminPass();
      try{
        const r=await fetch('/api/salvar-catalogo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pass,catalog:globalCatalog})});
        const d=await r.json();
        if(!r.ok)throw new Error(d.error||'Configure GH_TOKEN na Vercel ou baixe o catalogo.json.');
        showToast('Pack publicado para todos os clientes!');
      }catch(e){showToast(e.message);}
    });

    function renderAdminClients(){
      const list=loadAdminClients(),el=document.getElementById('admClientList');
      document.getElementById('admCountBadge').textContent=`${list.length} cadastrados`;
      if(!list.length){el.innerHTML='<div class="text-xs text-slate-500 text-center py-4 border border-dashed border-ts-border rounded-xl">Nenhum influenciador VIP cadastrado.</div>';return;}
      const td=new Date().toISOString().slice(0,10);
      el.innerHTML=list.map(c=>{const ex=c.exp!=='vitalicio'&&c.exp<td,url=buildClientInviteUrl(c),wa=encodeURIComponent(`Seu acesso exclusivo ao TIK SCAN PRO (${c.plan}) para ${c.user}:\n${url}`);return`<div class="bg-ts-bg border border-ts-border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div class="min-w-0"><div class="flex items-center gap-2"><span class="text-xs font-extrabold text-white">${c.user}</span><span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">${c.plan}</span><span class="text-[10px] font-bold ${ex?'text-rose-400':'text-emerald-400'}">${c.exp==='vitalicio'?'Vitalício':`até ${c.exp}`}</span></div><div class="text-[10px] font-mono text-slate-500 truncate mt-0.5">${url}</div></div><div class="flex items-center gap-1.5 shrink-0"><button data-adm-copy="${c.id}" class="px-2.5 py-1.5 rounded-lg bg-ts-card border border-ts-border text-[11px] font-bold text-cyan-300">Copiar</button><a href="https://wa.me/?text=${wa}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-emerald-600/25 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">WhatsApp</a><button data-adm-del="${c.id}" class="px-2 py-1.5 text-xs text-slate-500 hover:text-rose-400">✕</button></div></div>`;}).join('');
      el.querySelectorAll('[data-adm-copy]').forEach(b=>b.addEventListener('click',()=>{const it=loadAdminClients().find(x=>x.id===b.dataset.admCopy);if(it){navigator.clipboard?.writeText(buildClientInviteUrl(it));showToast(`Link de ${it.user} copiado!`);}}));
      el.querySelectorAll('[data-adm-del]').forEach(b=>b.addEventListener('click',()=>saveAdminClients(loadAdminClients().filter(x=>x.id!==b.dataset.admDel))));
    }
    document.getElementById('btnAdminCreateClient').addEventListener('click',()=>{let u=document.getElementById('admClientUser').value.trim();if(!u)return showToast('Digite o @!');if(!u.startsWith('@'))u='@'+u;const plan=document.getElementById('admClientPlan').value,days=document.getElementById('admClientDays').value,ws=document.getElementById('admClientWs').value.trim();let exp='vitalicio';if(days!=='vitalicio'){const dt=new Date();dt.setDate(dt.getDate()+Number(days));exp=dt.toISOString().slice(0,10);}const sig=signClientToken(u,exp,plan),l=loadAdminClients();l.unshift({id:Date.now().toString(36),user:u,plan,exp,ws,sig});saveAdminClients(l);document.getElementById('admClientUser').value='';showToast(`Link VIP gerado para ${u}!`);});
    document.getElementById('btnAdminChangePass').addEventListener('click',()=>{const np=document.getElementById('admNewPassInput').value.trim();if(np.length<4)return showToast('Mínimo 4 caracteres.');localStorage.setItem(ADMIN_PASS_KEY,np);sessionStorage.setItem('tikscan_admin_pwd',np);document.getElementById('admNewPassInput').value='';showToast('Senha alterada!');});

    // =========================================================================
    // 4. ESTÚDIO CHROMA KEY ADMIN (.WEBM TRANSPARENTE 1080x1920)
    // =========================================================================
    function openVideoDb(){return new Promise((res,rej)=>{const r=indexedDB.open('tikscan_video_pack_db',1);r.onupgradeneeded=()=>r.result.createObjectStore('videos');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
    async function saveVideoBlob(id,blob){try{const db=await openVideoDb();db.transaction('videos','readwrite').objectStore('videos').put(blob,id);}catch{}}
    async function loadVideoBlob(id){try{const db=await openVideoDb();return await new Promise(res=>{const r=db.transaction('videos').objectStore('videos').get(id);r.onsuccess=()=>res(r.result||null);r.onerror=()=>res(null);});}catch{return null;}}
    async function deleteVideoBlob(id){try{const db=await openVideoDb();db.transaction('videos','readwrite').objectStore('videos').delete(id);}catch{}}

    const vfxState={playing:true,recording:false,time:0,muted:false,firedCues:new Set(),hasVideo:false,videoBlob:null,videoName:'',videoDur:0,videoW:1080,videoH:1920,keyMode:1,keyThresh:0.08,keySmooth:0.14,keyDespill:0.90,hideCorner:1,customAudioBuffer:null};
    class ProAudioEngine{
      constructor(){this.ctx=null;this.masterRec=null;this.speakerGain=null;this.destination=null;this.activeCustomSource=null;this.videoMediaSrc=null;this.videoGain=null;}
      ensureInit(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}const AC=window.AudioContext||window.webkitAudioContext;this.ctx=new AC();this.destination=this.ctx.createMediaStreamDestination();this.masterRec=this.ctx.createGain();this.masterRec.gain.value=0.95;this.masterRec.connect(this.destination);this.speakerGain=this.ctx.createGain();this.speakerGain.gain.value=vfxState.muted?0:0.90;this.masterRec.connect(this.speakerGain);this.speakerGain.connect(this.ctx.destination);const k=this.ctx.createOscillator(),kg=this.ctx.createGain();kg.gain.value=0.00001;k.connect(kg);kg.connect(this.destination);k.start();}
      connectVideoAudio(v){this.ensureInit();if(!this.videoMediaSrc){this.videoMediaSrc=this.ctx.createMediaElementSource(v);this.videoGain=this.ctx.createGain();this.videoMediaSrc.connect(this.videoGain);this.videoGain.connect(this.masterRec);}this.updateVideoAudioRouting();}
      updateVideoAudioRouting(){if(!this.videoGain||!this.ctx)return;this.videoGain.gain.setTargetAtTime(vfxState.hasVideo&&!vfxState.customAudioBuffer?1:0,this.ctx.currentTime,0.01);}
      setMuted(m){if(this.speakerGain&&this.ctx)this.speakerGain.gain.setTargetAtTime(m?0:0.90,this.ctx.currentTime,0.02);}
      playCustomUploadedAudio(){if(!vfxState.customAudioBuffer||!this.ctx)return;this.stopCustomAudio();const s=this.ctx.createBufferSource();s.buffer=vfxState.customAudioBuffer;s.connect(this.masterRec);s.start(this.ctx.currentTime);this.activeCustomSource=s;}
      stopCustomAudio(){if(this.activeCustomSource){try{this.activeCustomSource.stop();}catch{}this.activeCustomSource=null;}}
    }
    const audioEngine=new ProAudioEngine();
    document.getElementById('btnToggleMute').addEventListener('click',()=>{audioEngine.ensureInit();vfxState.muted=!vfxState.muted;audioEngine.setMuted(vfxState.muted);document.getElementById('muteLabel').textContent=vfxState.muted?'Mudo':'Som Ativo';});

    const vfxCanvas=document.getElementById('vfxCanvas');
    const renderer=new THREE.WebGLRenderer({canvas:vfxCanvas,alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true});
    renderer.setSize(1080,1920,false);renderer.setPixelRatio(1);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(45,1080/1920,0.1,100);camera.position.set(0,0,11.5);
    const stageGroup=new THREE.Group();scene.add(stageGroup);let videoTex=null,videoShaderMat=null;

    function buildVideoStage(){
      stageGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.uniforms?.uTex?.value)o.material.uniforms.uTex.value.dispose();o.material.dispose();}});
      while(stageGroup.children.length)stageGroup.remove(stageGroup.children[0]);
      videoTex=null;videoShaderMat=null;
      const emp=document.getElementById('emptyStageOverlay');if(!vfxState.hasVideo){emp.classList.remove('hidden');return;}emp.classList.add('hidden');
      const vid=document.getElementById('userUploadedVideo');
      videoTex=new THREE.VideoTexture(vid);videoTex.minFilter=THREE.LinearFilter;videoTex.magFilter=THREE.LinearFilter;videoTex.colorSpace=THREE.SRGBColorSpace;
      const visH=2*Math.tan(THREE.MathUtils.degToRad(22.5))*11.5,visW=visH*(1080/1920),vAsp=(vfxState.videoW||1080)/(vfxState.videoH||1920),sAsp=1080/1920;
      const pW=vAsp>sAsp?visW:visH*vAsp,pH=vAsp>sAsp?visW/vAsp:visH;
      videoShaderMat=new THREE.ShaderMaterial({
        uniforms:{uTex:{value:videoTex},uMode:{value:vfxState.keyMode},uThreshold:{value:vfxState.keyThresh},uSmooth:{value:vfxState.keySmooth},uDespill:{value:vfxState.keyDespill},uHideCorner:{value:vfxState.hideCorner}},
        vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader:`uniform sampler2D uTex;uniform int uMode;uniform float uThreshold;uniform float uSmooth;uniform float uDespill;uniform int uHideCorner;varying vec2 vUv;void main(){vec4 tex=texture2D(uTex,vUv);float alpha=tex.a;if(uMode==1){float rb=max(tex.r,tex.b);float gd=tex.g-rb;alpha=1.0-smoothstep(uThreshold,uThreshold+uSmooth,gd);if(tex.g>rb&&uDespill>0.0){tex.g=mix(tex.g,rb,clamp(gd*4.5,0.0,1.0)*uDespill);}}else if(uMode==2){alpha=smoothstep(uThreshold,uThreshold+uSmooth,max(tex.r,max(tex.g,tex.b)));}if(uHideCorner==1){float mx=smoothstep(0.91,0.94,vUv.x);float my=1.0-smoothstep(0.04,0.07,vUv.y);alpha*=(1.0-mx*my);}gl_FragColor=vec4(tex.rgb,alpha);}`,
        transparent:true,depthWrite:false
      });
      stageGroup.add(new THREE.Mesh(new THREE.PlaneGeometry(pW,pH),videoShaderMat));
    }
    function animateVfx(){
      requestAnimationFrame(animateVfx);if(liveData.activeTab!=='vfx'&&!vfxState.recording)return;
      const vid=document.getElementById('userUploadedVideo'),dur=vfxState.videoDur||0;
      if(vfxState.hasVideo){if(videoTex&&vid.readyState>=2)videoTex.needsUpdate=true;if(vid.paused&&(vfxState.playing||vfxState.recording))vid.play().catch(()=>{});if(videoShaderMat){videoShaderMat.uniforms.uMode.value=vfxState.keyMode;videoShaderMat.uniforms.uThreshold.value=vfxState.keyThresh;videoShaderMat.uniforms.uSmooth.value=vfxState.keySmooth;videoShaderMat.uniforms.uDespill.value=vfxState.keyDespill;videoShaderMat.uniforms.uHideCorner.value=vfxState.hideCorner;}vfxState.time=vid.currentTime||0;}
      renderer.render(scene,camera);document.getElementById('timeDisplay').textContent=`${vfxState.time.toFixed(2)}s`;document.getElementById('totalDurDisplay').textContent=`${dur.toFixed(2)}s`;document.getElementById('timelineProgress').style.width=dur>0?`${Math.min(100,(vfxState.time/dur)*100)}%`:'0%';
    }
    function loadPack(){try{const r=localStorage.getItem(PACK_STORAGE_KEY);return r?JSON.parse(r).filter(x=>x&&x.videoId):[];}catch{return[];}}
    function savePack(items){localStorage.setItem(PACK_STORAGE_KEY,JSON.stringify(items));renderPackList();}
    function renderPackList(){const pack=loadPack(),list=document.getElementById('savedPackList');document.getElementById('packCountBadge').textContent=pack.length;list.innerHTML='';pack.forEach(item=>{const row=document.createElement('div');row.className='flex items-center justify-between gap-2 bg-ts-bg border border-ts-border rounded-lg px-2.5 py-2';const btn=document.createElement('button');btn.type='button';btn.className='flex-1 text-left text-xs font-bold text-white truncate';btn.textContent=item.text||'Vídeo';btn.onclick=async()=>{audioEngine.ensureInit();const b=await loadVideoBlob(item.videoId);if(b)loadAdminVideo(b,item.text,false,item.keyMode??1);};const del=document.createElement('button');del.type='button';del.className='text-xs text-slate-500 hover:text-rose-400';del.textContent='✕';del.onclick=()=>{deleteVideoBlob(item.videoId);savePack(loadPack().filter(p=>p.id!==item.id));};row.append(btn,del);list.appendChild(row);});}
    function loadAdminVideo(blob,fileName,autoSave=true,customKey=null){
      const vid=document.getElementById('userUploadedVideo');if(vid.src&&vid.src.startsWith('blob:'))URL.revokeObjectURL(vid.src);vid.src=URL.createObjectURL(blob);
      vid.onloadeddata=()=>{
        audioEngine.connectVideoAudio(vid);vfxState.hasVideo=true;vfxState.videoBlob=blob;vfxState.videoName=fileName;vfxState.videoW=vid.videoWidth||1080;vfxState.videoH=vid.videoHeight||1920;vfxState.videoDur=(vid.duration&&isFinite(vid.duration))?vid.duration:6.0;vid.currentTime=0;vid.playbackRate=1.0;
        if(customKey!==null)vfxState.keyMode=customKey;else{try{const tc=document.createElement('canvas');tc.width=32;tc.height=32;const tx=tc.getContext('2d');tx.drawImage(vid,0,0,32,32);const px=tx.getImageData(2,2,1,1).data;vfxState.keyMode=(px[1]>px[0]*1.25&&px[1]>px[2]*1.25)?1:(px[0]<25&&px[1]<25&&px[2]<25)?2:0;}catch{vfxState.keyMode=1;}}
        document.getElementById('selKeyMode').value=String(vfxState.keyMode);document.getElementById('mediaStatusLabel').textContent=`${fileName} (${vfxState.videoW}x${vfxState.videoH})`;
        if(autoSave){const id='vid_'+Date.now().toString(36);saveVideoBlob(id,blob);const p=loadPack();p.unshift({id,text:fileName.replace(/\.[^.]+$/,''),videoId:id,keyMode:vfxState.keyMode});savePack(p);}
        audioEngine.updateVideoAudioRouting();buildVideoStage();vfxState.playing=true;vid.play().catch(()=>{});
      };
    }
    document.getElementById('inputVideoFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;loadAdminVideo(f,f.name,true,null);e.target.value='';});
    document.getElementById('inputAudioFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;audioEngine.ensureInit();vfxState.customAudioBuffer=await audioEngine.ctx.decodeAudioData(await f.arrayBuffer());audioEngine.updateVideoAudioRouting();document.getElementById('btnClearAudio').classList.remove('hidden');});
    document.getElementById('btnClearAudio').addEventListener('click',()=>{vfxState.customAudioBuffer=null;audioEngine.stopCustomAudio();audioEngine.updateVideoAudioRouting();document.getElementById('btnClearAudio').classList.add('hidden');});
    document.getElementById('selKeyMode').addEventListener('change',e=>vfxState.keyMode=Number(e.target.value));
    document.getElementById('rangeKeyThresh').addEventListener('input',e=>{vfxState.keyThresh=parseFloat(e.target.value);document.getElementById('keyThreshVal').textContent=vfxState.keyThresh.toFixed(2);});
    document.getElementById('rangeKeySmooth').addEventListener('input',e=>{vfxState.keySmooth=parseFloat(e.target.value);document.getElementById('keySmoothVal').textContent=vfxState.keySmooth.toFixed(2);});
    document.getElementById('rangeKeyDespill').addEventListener('input',e=>{vfxState.keyDespill=parseFloat(e.target.value);document.getElementById('keyDespillVal').textContent=vfxState.keyDespill.toFixed(2);});
    document.getElementById('chkHideCorner').addEventListener('change',e=>vfxState.hideCorner=e.target.checked?1:0);
    document.getElementById('btnReplay').addEventListener('click',()=>{audioEngine.ensureInit();const v=document.getElementById('userUploadedVideo');if(vfxState.hasVideo){v.currentTime=0;vfxState.playing=true;v.play().catch(()=>{});}});
    document.getElementById('btnPlayPause').addEventListener('click',()=>{audioEngine.ensureInit();vfxState.playing=!vfxState.playing;document.getElementById('playPauseLabel').textContent=vfxState.playing?'Pausar':'Reproduzir';const v=document.getElementById('userUploadedVideo');if(vfxState.hasVideo){if(vfxState.playing)v.play().catch(()=>{});else v.pause();}});
    const detectedMime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp9','video/webm;codecs=vp8,opus','video/webm'].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||'';
    document.getElementById('codecStatusLabel').textContent=detectedMime?`Codec: ${detectedMime}`:'WebM indisponível';
    document.getElementById('btnRecordWebm').addEventListener('click',()=>{
      if(!vfxState.hasVideo||vfxState.recording||!detectedMime)return showToast('Selecione um vídeo primeiro.');
      audioEngine.ensureInit();const dur=vfxState.videoDur||6,vid=document.getElementById('userUploadedVideo');vfxState.recording=true;vfxState.playing=true;vid.currentTime=0;vid.play().catch(()=>{});if(vfxState.customAudioBuffer)audioEngine.playCustomUploadedAudio();
      const btn=document.getElementById('btnRecordWebm'),txt=document.getElementById('recBtnText'),badge=document.getElementById('recordingOverlayBadge');btn.disabled=true;badge.classList.remove('hidden');
      const vs=vfxCanvas.captureStream(60),at=audioEngine.destination?audioEngine.destination.stream.getAudioTracks():[],rec=new MediaRecorder(new MediaStream([...vs.getVideoTracks(),...at]),{mimeType:detectedMime,videoBitsPerSecond:12_000_000,audioBitsPerSecond:192_000}),chunks=[];
      rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};
      rec.onstop=()=>{const url=URL.createObjectURL(new Blob(chunks,{type:detectedMime})),a=document.createElement('a');a.href=url;a.download=`${(vfxState.videoName||'efeito').replace(/\.[^.]+$/,'')}.webm`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);vfxState.recording=false;btn.disabled=false;txt.textContent='Baixar (.webm) Transparente';badge.classList.add('hidden');showToast('.WEBM Transparente pronto para subir na pasta pack/!');};
      rec.start(100);const t0=performance.now(),iv=setInterval(()=>{const el=Math.min(dur,(performance.now()-t0)/1000);txt.textContent=`Gravando (${el.toFixed(1)}s / ${dur.toFixed(1)}s)`;badge.textContent=`REC ${el.toFixed(1)}s`;},80);setTimeout(()=>{clearInterval(iv);if(rec.state!=='inactive')rec.stop();},dur*1000+80);
    });

    // =========================================================================
    // 5. ADMIN GATE & BOOT DO SISTEMA
    // =========================================================================
    function enterAdminInterface(){
      isAdminUser=true;
      sessionStorage.setItem(ADMIN_SESSION_KEY,'1');
      document.getElementById('adminLoginModal').classList.add('hidden');
      document.getElementById('publicLandingShell').classList.add('hidden');
      document.getElementById('mainAppShell').classList.remove('hidden');
      document.getElementById('adminSidebarSection').classList.remove('hidden');
      document.getElementById('btnAdminLogout').classList.remove('hidden');
      document.getElementById('roleBadgeLabel').textContent='ADMINISTRADOR';
      document.getElementById('headerPlanPill').textContent='ADMIN';
      updateUserLabels(liveData.tiktokUser,'MODO ADMIN');
      renderAdminClients();renderAdminCatalogEditor();renderPackList();buildVideoStage();
      switchTab('admpack');
    }
    document.getElementById('btnOpenAdminGate').addEventListener('click',()=>document.getElementById('adminLoginModal').classList.remove('hidden'));
    document.getElementById('btnCloseAdminLogin').addEventListener('click',()=>document.getElementById('adminLoginModal').classList.add('hidden'));
    document.getElementById('btnEnterAdminMode').addEventListener('click',()=>{
      const p=document.getElementById('inputAdminGatePass').value;
      if(p===getAdminPass()){sessionStorage.setItem('tikscan_admin_pwd',p);document.getElementById('adminGateErr').classList.add('hidden');enterAdminInterface();}
      else document.getElementById('adminGateErr').classList.remove('hidden');
    });
    document.getElementById('btnAdminLogout').addEventListener('click',()=>{sessionStorage.removeItem(ADMIN_SESSION_KEY);window.location.href='/';});

    fetchGlobalCatalog();
    requestAnimationFrame(animateVfx);

    const qp=new URLSearchParams(window.location.search),invU=qp.get('u'),invE=qp.get('exp'),invP=qp.get('plan'),invK=qp.get('k'),invW=qp.get('ws'),ov=qp.get('overlay'),mpRet=qp.get('mp_retorno'),payId=qp.get('payment_id')||qp.get('collection_id');
    if(ov&&['moedas','likes','shares','gifter','notif'].includes(ov)){
      enterCleanMode(ov);
    }else if(mpRet&&payId){
      handleMercadoPagoReturn(payId);
    }else if(invU&&invE&&invP&&invK){
      const exp=signClientToken(invU,invE,invP),td=new Date().toISOString().slice(0,10);
      if(invK!==exp){document.getElementById('accessBlockedReason').textContent='Assinatura inválida.';document.getElementById('accessBlockedScreen').classList.remove('hidden');}
      else if(invE!=='vitalicio'&&invE<td){document.getElementById('accessBlockedReason').textContent=`Acesso expirado em ${invE}.`;document.getElementById('accessBlockedScreen').classList.remove('hidden');}
      else{
        isAdminUser=false;
        activeClientLink=window.location.href;
        liveData.tiktokUser=invU;
        document.getElementById('mainAppShell').classList.remove('hidden');
        document.getElementById('sidebarPlanBadge').textContent=invP.split(' ')[0].toUpperCase();
        document.getElementById('headerPlanPill').textContent=invP;
        updateUserLabels(invU,'ACESSO LIBERADO');
        if(invW){document.getElementById('inputWsUrl').value=invW;connectWsUrl(invW);}
        switchTab('pack');
      }
    }else if(sessionStorage.getItem(ADMIN_SESSION_KEY)==='1'){
      enterAdminInterface();
    }else{
      document.getElementById('publicLandingShell').classList.remove('hidden');
      if(qp.get('admin')==='1')document.getElementById('adminLoginModal').classList.remove('hidden');
    }
  </script>
</body>
</html>
