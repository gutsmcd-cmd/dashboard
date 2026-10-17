/* Cube Drop — Kernelport, the city inside the computer (hub backdrop). */
(function () {
  'use strict';
  const { W, H, COL: C, draw: D, util: U } = CD;
  const SECTORS = ['Spire Row', 'Neon Docks', 'Cache Market', 'Loop Gardens', 'Port 80', 'Old Kernel'];
  const BASE = 430;
  const rnd = U.seeded(7741);
  const buildings = [];
  for (let s = 0; s < 6; s++) {
    const x0 = s * 160;
    const n = 3;
    for (let i = 0; i < n; i++) {
      const w = 34 + Math.floor(rnd() * 26);
      const h = 90 + Math.floor(rnd() * 170);
      const x = x0 + 12 + i * 48 + Math.floor(rnd() * 10);
      buildings.push({ s, x, w, h, hue: rnd() < 0.5 ? 'p' : 'g', top: Math.floor(rnd() * 3), seed: Math.floor(rnd() * 1000) });
    }
  }
  // Central spire belongs to sector 2/3 boundary visually but counts as sector 2.
  buildings.push({ s: 2, x: 452, w: 54, h: 300, hue: 'spire', top: 3, seed: 5 });
  buildings.sort((a, b) => a.h - b.h);
  const far = [];
  for (let i = 0; i < 26; i++) far.push({ x: i * 38 + rnd() * 10, w: 26 + rnd() * 20, h: 40 + rnd() * 110 });
  const pods = [];
  for (let i = 0; i < 7; i++) pods.push({ x: rnd() * W, y: 150 + rnd() * 170, v: (rnd() < 0.5 ? -1 : 1) * (40 + rnd() * 70), c: rnd() < 0.5 ? C.pink : C.green });

  function drawBuilding(g, b, t, dark, flick) {
    const x = b.x, y = BASE - b.h, w = b.w, h = b.h;
    let front, top, side;
    if (dark) { front = ['#3a3448', '#15121d']; top = '#4b4459'; side = '#1f1b28'; }
    else if (b.hue === 'p') { front = ['#ff7ccc', '#5d1452']; top = '#ffc2e8'; side = '#8a1f6e'; }
    else if (b.hue === 'g') { front = ['#5dffb0', '#0d4a3a']; top = '#c8ffe2'; side = '#137a52'; }
    else { front = ['#ffffff', '#6b2bd1']; top = '#ffffff'; side = '#3d1590'; }
    D.block(g, x, y, w, h, front, top, side, 12);
    // windows
    const r = U.seeded(b.seed + 1);
    for (let yy = y + 10; yy < BASE - 12; yy += 14) {
      for (let xx = x + 5; xx < x + w - 6; xx += 9) {
        const on = r() < 0.62;
        if (dark) {
          if (flick && r() < 0.05 && Math.sin(t * 20 + xx) > 0.6) { g.fillStyle = C.red; g.fillRect(xx, yy, 5, 6); }
          continue;
        }
        if (!on) continue;
        const tw = Math.sin(t * 2 + xx * 0.3 + yy) > 0.93;
        g.fillStyle = tw ? '#ffffff' : (b.hue === 'g' ? '#fff07a' : (b.hue === 'p' ? '#bfffe0' : '#ff9bd6'));
        g.fillRect(xx, yy, 5, 6);
      }
    }
    // roof toppers
    if (!dark) {
      if (b.top === 1) { g.fillStyle = C.cyan; g.fillRect(x + w / 2 - 1, y - 30, 3, 22); g.fillStyle = Math.sin(t * 5 + b.x) > 0 ? C.red : '#550010'; g.fillRect(x + w / 2 - 3, y - 34, 7, 5); }
      if (b.top === 2) { g.save(); g.shadowColor = C.green; g.shadowBlur = 14; g.fillStyle = C.green; g.beginPath(); g.moveTo(x + 4, y - 8); g.lineTo(x + w / 2 + 6, y - 30); g.lineTo(x + w + 6, y - 8); g.fill(); g.restore(); }
      if (b.top === 3) {
        g.save(); g.shadowColor = C.pink; g.shadowBlur = 20;
        g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x + 4, y - 6); g.lineTo(x + w / 2 + 6, y - 70); g.lineTo(x + w + 8, y - 6); g.fill();
        const p = 0.5 + 0.5 * Math.sin(t * 3);
        g.fillStyle = `rgba(57,255,143,${0.5 + p * 0.5})`; g.beginPath(); g.arc(x + w / 2 + 6, y - 74, 6 + p * 3, 0, 7); g.fill(); g.restore();
      }
    }
  }

  CD.city = {
    SECTORS,
    BASE,
    sectorX: s => s * 160 + 80,
    draw(g, t, o) {
      o = o || {};
      const dark = o.dark || [];
      D.sky(g, '#1ad8ff', '#8e3cff', '#ff4fb8', 0, BASE);
      // sun-disc / data moon
      g.save();
      const sg = g.createLinearGradient(0, 120, 0, 300);
      sg.addColorStop(0, '#fffbe0'); sg.addColorStop(0.5, '#ff9bd6'); sg.addColorStop(1, '#ff2d95');
      g.fillStyle = sg; g.globalAlpha = 0.85;
      g.beginPath(); g.arc(W / 2, 290, 120, Math.PI, 0); g.fill();
      g.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 7; i++) g.fillRect(W / 2 - 130, 200 + i * 14 + i * i * 0.6, 260, 2 + i * 0.9);
      g.restore();
      // stars/pixels
      for (let i = 0; i < 40; i++) {
        const x = (i * 197) % W, y = (i * 73) % 150;
        g.fillStyle = `rgba(255,255,255,${0.3 + 0.4 * Math.sin(t * 2 + i)})`; g.fillRect(x, y, 2, 2);
      }
      // far skyline
      g.fillStyle = 'rgba(60,10,90,0.55)';
      for (const f of far) g.fillRect(f.x, BASE - f.h, f.w, f.h);
      // sky traffic pods
      for (const p of pods) {
        const x = ((p.x + p.v * t) % (W + 80) + W + 80) % (W + 80) - 40;
        g.save(); g.shadowColor = p.c; g.shadowBlur = 10; g.fillStyle = p.c;
        g.fillRect(x - 6, p.y, 12, 4);
        g.globalAlpha = 0.35; g.fillRect(p.v > 0 ? x - 40 : x + 6, p.y + 1, 34, 2); g.restore();
      }
      // ground
      D.gridFloor(g, BASE, t * 0.4, 'rgba(57,255,143,0.45)', ['#3a0f63', '#08020f']);
      for (let s = 0; s < 6; s++) {
        if (dark.includes(s)) { g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(s * 160, BASE, 160, H - BASE); }
      }
      // buildings
      for (const b of buildings) drawBuilding(g, b, t, dark.includes(b.s), true);
      // sector darkness veil
      for (let s = 0; s < 6; s++) {
        if (dark.includes(s)) {
          const gr = g.createLinearGradient(0, 0, 0, BASE);
          gr.addColorStop(0, 'rgba(10,4,20,0)'); gr.addColorStop(1, 'rgba(10,4,20,0.45)');
          g.fillStyle = gr; g.fillRect(s * 160, 0, 160, BASE);
        }
      }
      if (o.flash != null) {
        g.fillStyle = `rgba(255,64,87,${0.35 * Math.abs(Math.sin(t * 18))})`;
        g.fillRect(o.flash * 160, 0, 160, H);
      }
      // sector labels
      if (o.labels !== false) {
        for (let s = 0; s < 6; s++) {
          const isD = dark.includes(s);
          D.text(g, SECTORS[s].toUpperCase() + (isD ? ' · DARK' : ' · LIT'), s * 160 + 80, BASE + 20, { size: 11, align: 'center', color: isD ? C.red : C.green, strokeW: 3 });
        }
      }
    }
  };
})();
