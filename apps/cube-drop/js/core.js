/* Cube Drop — core: registry, input, utilities, shared drawing. Plain script, no modules (works from file://). */
(function () {
  'use strict';
  const W = 960, H = 540;
  const CD = (window.CD = {
    W, H,
    games: [],
    registerGame(def) { CD.games.push(def); },
    getGame(id) { return CD.games.find(g => g.id === id); },
    util: {}, draw: {},
    COL: {
      pink: '#ff4fb8', hot: '#ff2d95', green: '#39ff8f', lime: '#a6ff4d', cyan: '#3ff0ff',
      magenta: '#d03cff', deep: '#140a2e', ink: '#0a0518', white: '#fff6fd', gold: '#ffe066', red: '#ff4057'
    }
  });

  /* ---------- input ---------- */
  const keys = {}, pressed = {};
  const MAP = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    Space: 'fire', Enter: 'enter', NumpadEnter: 'enter', Escape: 'esc',
    ShiftLeft: 'alt', ShiftRight: 'alt', KeyX: 'alt'
  };
  const PREVENT = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter', 'Tab']);
  CD.input = {
    down: a => !!keys[a],
    hit: a => !!pressed[a],
    confirm: () => !!(pressed.enter || pressed.fire),
    endFrame() { for (const k in pressed) delete pressed[k]; },
    reset() { for (const k in keys) delete keys[k]; for (const k in pressed) delete pressed[k]; },
    // used by automated tests
    _press(code, held) { const a = [code, MAP[code]].filter(Boolean); a.forEach(x => { pressed[x] = true; if (held) keys[x] = true; }); },
    _release(code) { const a = [code, MAP[code]].filter(Boolean); a.forEach(x => delete keys[x]); }
  };
  addEventListener('keydown', e => {
    if (PREVENT.has(e.code)) e.preventDefault();
    const acts = [e.code, MAP[e.code]].filter(Boolean);
    if (!e.repeat) acts.forEach(a => (pressed[a] = true));
    acts.forEach(a => (keys[a] = true));
    if (CD.audio) CD.audio.unlock();
  });
  addEventListener('keyup', e => { [e.code, MAP[e.code]].filter(Boolean).forEach(a => delete keys[a]); });
  addEventListener('blur', () => { CD.input.reset(); if (CD.onBlur) CD.onBlur(); });
  addEventListener('pointerdown', () => { if (CD.audio) CD.audio.unlock(); });

  /* ---------- utils ---------- */
  const U = CD.util;
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randi = (a, b) => Math.floor(U.rand(a, b + 1));
  U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  U.easeOut = t => 1 - Math.pow(1 - t, 3);
  U.easeIn = t => t * t * t;
  U.hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  U.dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  U.seeded = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* ---------- drawing ---------- */
  const D = CD.draw, C = CD.COL;
  D.FONT = '"Trebuchet MS", "Verdana", "DejaVu Sans", sans-serif';
  D.text = function (g, s, x, y, o) {
    o = o || {};
    g.save();
    g.font = (o.weight || 'bold') + ' ' + (o.size || 20) + 'px ' + (o.font || D.FONT);
    g.textAlign = o.align || 'left';
    g.textBaseline = o.base || 'alphabetic';
    if (o.alpha != null) g.globalAlpha = o.alpha;
    if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowSize || 14; }
    if (o.stroke !== false) {
      g.lineJoin = 'round';
      g.lineWidth = o.strokeW || Math.max(3, (o.size || 20) / 6);
      g.strokeStyle = o.stroke || C.ink;
      g.strokeText(s, x, y);
    }
    g.fillStyle = o.color || C.white;
    g.fillText(s, x, y);
    g.restore();
  };
  // Chunky extruded title text, early-CGI style.
  D.bigText = function (g, s, x, y, size, c1, c2, depth) {
    g.save();
    g.font = '900 ' + size + 'px ' + D.FONT;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    depth = depth || Math.round(size / 9);
    for (let i = depth; i > 0; i--) {
      g.fillStyle = i === depth ? '#05020c' : (i % 2 ? '#3a0f5c' : '#4b1470');
      g.fillText(s, x + i, y + i);
    }
    const gr = g.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.18, c1); gr.addColorStop(0.55, c2); gr.addColorStop(1, '#1b0533');
    g.fillStyle = gr;
    g.shadowColor = c1; g.shadowBlur = 18;
    g.fillText(s, x, y);
    g.shadowBlur = 0;
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,0.65)';
    g.strokeText(s, x, y);
    g.restore();
  };
  D.roundRect = function (g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  };
  D.panel = function (g, x, y, w, h, o) {
    o = o || {};
    g.save();
    D.roundRect(g, x, y, w, h, 14);
    const gr = g.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, 'rgba(48,18,92,0.94)'); gr.addColorStop(1, 'rgba(14,6,34,0.94)');
    g.fillStyle = gr; g.fill();
    g.lineWidth = 3; g.strokeStyle = o.edge || C.pink;
    g.shadowColor = o.edge || C.pink; g.shadowBlur = 12; g.stroke();
    g.shadowBlur = 0;
    D.roundRect(g, x + 5, y + 5, w - 10, h - 10, 10);
    g.lineWidth = 1.5; g.strokeStyle = o.edge2 || 'rgba(57,255,143,0.7)'; g.stroke();
    // gloss
    D.roundRect(g, x + 8, y + 8, w - 16, Math.min(40, h / 4), 8);
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fill();
    g.restore();
  };
  // Glossy pseudo-3D block (front + top + side face).
  D.block = function (g, x, y, w, h, front, top, side, d) {
    d = d == null ? 10 : d;
    g.fillStyle = side;
    g.beginPath(); g.moveTo(x + w, y); g.lineTo(x + w + d, y - d); g.lineTo(x + w + d, y + h - d); g.lineTo(x + w, y + h); g.fill();
    g.fillStyle = top;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + d, y - d); g.lineTo(x + w + d, y - d); g.lineTo(x + w, y); g.fill();
    const gr = g.createLinearGradient(x, y, x, y + h);
    gr.addColorStop(0, front[0]); gr.addColorStop(1, front[1]);
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, y, w, Math.max(2, h * 0.08));
  };
  D.sky = function (g, top, mid, bottom, y0, y1) {
    const gr = g.createLinearGradient(0, y0 || 0, 0, y1 || H);
    gr.addColorStop(0, top || '#1fd6ff'); gr.addColorStop(0.55, mid || '#9b3cff'); gr.addColorStop(1, bottom || '#ff3fa8');
    g.fillStyle = gr; g.fillRect(0, y0 || 0, W, (y1 || H) - (y0 || 0));
  };
  // Perspective grid floor (synth/early CGI).
  D.gridFloor = function (g, horizon, scroll, color, bg) {
    g.save();
    const gr = g.createLinearGradient(0, horizon, 0, H);
    gr.addColorStop(0, bg ? bg[0] : '#2a0b4a'); gr.addColorStop(1, bg ? bg[1] : '#07020f');
    g.fillStyle = gr; g.fillRect(0, horizon, W, H - horizon);
    g.strokeStyle = color || 'rgba(57,255,143,0.55)'; g.lineWidth = 1.5;
    g.beginPath();
    for (let i = -14; i <= 14; i++) { g.moveTo(W / 2 + i * 18, horizon); g.lineTo(W / 2 + i * 150, H); }
    const s = ((scroll || 0) % 1 + 1) % 1;
    for (let i = 0; i < 14; i++) {
      const t = (i + s) / 14, yy = horizon + Math.pow(t, 2.2) * (H - horizon);
      g.moveTo(0, yy); g.lineTo(W, yy);
    }
    g.stroke();
    g.restore();
  };

  // The sidekick: LUMI the Warden-bot. Original design: a faceted diamond body,
  // green visor band, two pink fin-antennae, and a hover ring.
  D.lumi = function (g, x, y, t, s, mood) {
    s = s || 1; t = t || 0;
    const sway = Math.sin(t * 4) * 3 * s;
    g.save(); g.translate(x, y + sway); g.scale(s, s);
    // hover ring
    g.save(); g.globalAlpha = 0.55 + 0.25 * Math.sin(t * 8);
    g.strokeStyle = C.green; g.lineWidth = 3; g.shadowColor = C.green; g.shadowBlur = 12;
    g.beginPath(); g.ellipse(0, 26, 16, 5, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    // fins
    g.fillStyle = C.hot;
    g.beginPath(); g.moveTo(-10, -12); g.lineTo(-22, -30 + Math.sin(t * 6) * 2); g.lineTo(-4, -16); g.fill();
    g.beginPath(); g.moveTo(10, -12); g.lineTo(22, -30 - Math.sin(t * 6) * 2); g.lineTo(4, -16); g.fill();
    // faceted body: 4 triangles
    const faces = [
      [[0, -22], [-18, 0], [0, 4], '#ff9bd6'], [[0, -22], [18, 0], [0, 4], '#ff4fb8'],
      [[-18, 0], [0, 22], [0, 4], '#b02a86'], [[18, 0], [0, 22], [0, 4], '#7d1a66']
    ];
    for (const f of faces) { g.fillStyle = f[3]; g.beginPath(); g.moveTo(f[0][0], f[0][1]); g.lineTo(f[1][0], f[1][1]); g.lineTo(f[2][0], f[2][1]); g.fill(); }
    // visor
    g.fillStyle = '#062a18';
    g.beginPath(); g.moveTo(-14, -4); g.lineTo(14, -4); g.lineTo(11, 3); g.lineTo(-11, 3); g.fill();
    g.fillStyle = C.green; g.shadowColor = C.green; g.shadowBlur = 8;
    const blink = (Math.sin(t * 1.3) > 0.97) ? 0.3 : 1;
    const ex = mood === 'worried' ? -1 : 1;
    g.fillRect(-9, -2, 5, 3 * blink); g.fillRect(4, -2, 5, 3 * blink);
    if (mood === 'happy') { g.fillRect(-3, 1, 6, 1.5); }
    g.shadowBlur = 0;
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(0, -22); g.lineTo(-18, 0); g.lineTo(0, 22); g.lineTo(18, 0); g.closePath(); g.stroke();
    void ex;
    g.restore();
  };

  // The Player avatar ("the Visitor"): chunky low-poly suit, pink helmet, green visor.
  D.visitor = function (g, x, y, s, face, t, o) {
    o = o || {};
    s = s || 1; face = face || 1;
    const run = o.run || 0, air = o.air;
    g.save(); g.translate(x, y); g.scale(s * face, s);
    const leg = Math.sin(t * 14) * 7 * run;
    // legs
    g.fillStyle = '#2b1258';
    g.fillRect(-9, -18, 7, 18 + (air ? -4 : leg * 0.4)); g.fillRect(2, -18, 7, 18 + (air ? -6 : -leg * 0.4));
    g.fillStyle = C.green; g.fillRect(-11 + (air ? 0 : leg * 0.3), -4 + (air ? -4 : 0), 10, 4); g.fillRect(1 - (air ? 0 : leg * 0.3), -4 + (air ? -6 : 0), 10, 4);
    // torso
    const tg = g.createLinearGradient(-12, -44, 12, -18);
    tg.addColorStop(0, '#7a3cff'); tg.addColorStop(1, '#2e0f6b');
    g.fillStyle = tg;
    g.beginPath(); g.moveTo(-12, -44); g.lineTo(12, -44); g.lineTo(9, -18); g.lineTo(-9, -18); g.fill();
    g.fillStyle = C.pink; g.fillRect(-12, -30, 24, 4);
    // arm
    g.fillStyle = '#5a2bc4';
    const arm = o.punch ? 18 : Math.sin(t * 14) * 5 * run;
    g.save(); g.translate(4, -40); g.rotate(o.punch ? -1.45 : 0.25 + arm * 0.05);
    g.fillRect(-3, 0, 7, o.punch ? 24 : 18); g.fillStyle = C.green; g.fillRect(-4, o.punch ? 22 : 16, 9, 6); g.restore();
    // helmet
    const hg = g.createLinearGradient(-12, -66, 12, -44);
    hg.addColorStop(0, '#ffc2e6'); hg.addColorStop(0.5, C.pink); hg.addColorStop(1, '#a01a6c');
    g.fillStyle = hg;
    g.beginPath(); g.moveTo(-11, -46); g.lineTo(-13, -58); g.lineTo(-6, -67); g.lineTo(7, -67); g.lineTo(13, -58); g.lineTo(11, -46); g.fill();
    g.fillStyle = '#04261a'; g.fillRect(0, -60, 13, 7);
    g.fillStyle = C.green; g.shadowColor = C.green; g.shadowBlur = 6; g.fillRect(2, -58, 10, 3); g.shadowBlur = 0;
    g.restore();
  };

  // Rotating shaded cube (the Drop). Returns nothing; draws at cx,cy.
  D.cube = function (g, cx, cy, size, rx, ry, o) {
    o = o || {};
    const v = [];
    for (let i = 0; i < 8; i++) {
      let x = (i & 1 ? 1 : -1), y = (i & 2 ? 1 : -1), z = (i & 4 ? 1 : -1);
      let x1 = x * Math.cos(ry) - z * Math.sin(ry), z1 = x * Math.sin(ry) + z * Math.cos(ry);
      let y1 = y * Math.cos(rx) - z1 * Math.sin(rx), z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      const p = 4 / (4 + z2);
      v.push([cx + x1 * size * p, cy + y1 * size * p, z2]);
    }
    const F = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
    const cols = o.colors || ['#ff4fb8', '#39ff8f', '#d03cff', '#3ff0ff', '#ff2d95', '#a6ff4d'];
    const list = F.map((f, i) => ({ f, i, z: f.reduce((a, k) => a + v[k][2], 0) / 4 })).sort((a, b) => b.z - a.z);
    g.save();
    if (o.glow !== false) { g.shadowColor = o.glowColor || C.pink; g.shadowBlur = o.glowSize || 30; }
    for (const L of list) {
      const p = L.f.map(k => v[k]);
      g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (let k = 1; k < 4; k++) g.lineTo(p[k][0], p[k][1]); g.closePath();
      const gr = g.createLinearGradient(p[0][0], p[0][1], p[2][0], p[2][1]);
      gr.addColorStop(0, cols[L.i]); gr.addColorStop(1, '#12052a');
      g.globalAlpha = o.alpha != null ? o.alpha : 0.82;
      g.fillStyle = gr; g.fill();
      g.globalAlpha = 1;
      g.lineWidth = o.edge || 2.5; g.strokeStyle = 'rgba(255,255,255,0.85)'; g.stroke();
    }
    g.restore();
  };

  // Split text into lines that fit maxW at the given font size.
  D.lines = function (g, text, maxW, size) {
    g.save(); g.font = 'bold ' + size + 'px ' + D.FONT;
    const out = []; let cur = '';
    for (const w of String(text).split(' ')) {
      const test = cur ? cur + ' ' + w : w;
      if (g.measureText(test).width > maxW && cur) { out.push(cur); cur = w; } else cur = test;
    }
    if (cur) out.push(cur);
    g.restore(); return out;
  };
  D.wrap = function (g, text, x, y, maxW, size, lh, o) {
    const ls = D.lines(g, text, maxW, size);
    ls.forEach((l, i) => D.text(g, l, x, y + i * lh, Object.assign({ size }, o || {})));
    return ls.length;
  };
  // Speech bubble with Lumi portrait (sidekick hint text). Wraps to two lines if needed.
  D.lumiSays = function (g, text, t, alpha) {
    if (!text) return;
    g.save(); g.globalAlpha = alpha == null ? 1 : alpha;
    const ls = D.lines(g, text, 600, 17);
    g.font = 'bold 17px ' + D.FONT;
    const w = Math.max(...ls.map(l => g.measureText(l).width)) + 32;
    const bh = 26 + ls.length * 22;
    const x = 84, y = H - 28 - bh;
    D.roundRect(g, x, y, w, bh, 12);
    g.fillStyle = 'rgba(10,5,24,0.88)'; g.fill();
    g.lineWidth = 2.5; g.strokeStyle = CD.COL.green; g.stroke();
    g.fillStyle = CD.COL.green; g.font = 'bold 12px ' + D.FONT; g.fillText('LUMI', x + 14, y + 16);
    ls.forEach((l, i) => D.text(g, l, x + 14, y + 36 + i * 22, { size: 17, stroke: false, color: '#fff' }));
    D.lumi(g, 44, H - 50, t, 1.1, 'happy');
    g.restore();
  };
})();
