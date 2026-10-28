/* Cube Drop — game 5: PACKET CATCH (arcade catcher). Unlocks after 3 cleared cubes. */
(function () {
  'use strict';
  const { W, H, COL: C, draw: D, util: U, input: I } = CD;

  CD.registerGame({
    id: 'catch',
    title: 'Packet Catch',
    genre: 'Arcade',
    tagline: 'Data packets rain down on Kernelport. Catch the good ones, dodge the viruses.',
    goal: d => 'Catch ' + (d === 'easy' ? 30 : 40) + ' green packets. Red viruses cost a heart; you have ' + (d === 'easy' ? 5 : 3) + '.',
    controls: [['← → or A D', 'Move the catcher'], ['Space', 'Lumi Magnet (pulls packets in)'], ['Esc', 'Pause']],
    touchHelp: [['◀ ▶', 'Move'], ['A', 'Lumi Magnet']],
    helper: 'Lumi powers a magnet. Press Space and nearby green packets fly into your catcher for a few seconds.',
    music: 'catch',
    medals: [5000, 9000, 13000],
    create
  });

  function create(api) {
    const easy = api.easy, NEED = easy ? 30 : 40;
    const p = { x: W / 2, w: 120, vx: 0, inv: 0, squash: 0 };
    let hearts = easy ? 5 : 3, got = 0, combo = 0, score = 0, t = 0, spawn = 0.6, ended = false;
    let magnet = 0, magCd = 0, shake = 0, flash = 0;
    const drops = [], parts = [], pops = [];
    api.say('Move with ← →. Catch the GREEN packets, dodge the RED viruses!', 4);
    function burst(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 7, s = U.rand(80, 320); parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, t: U.rand(0.4, 0.8), col }); } }
    function update(dt) {
      t += dt;
      const prog = got / NEED;
      spawn -= dt;
      if (spawn <= 0) {
        spawn = U.lerp(easy ? 0.85 : 0.7, easy ? 0.5 : 0.38, prog);
        const r = Math.random(), bad = r < U.lerp(0.18, easy ? 0.3 : 0.38, prog);
        const gold = !bad && r > 0.93;
        drops.push({ x: U.rand(40, W - 40), y: -30, vy: U.rand(150, 210) + prog * (easy ? 90 : 150), bad, gold, rot: Math.random() * 6, vr: U.rand(-3, 3) });
        if (got > 8 && Math.random() < 0.12) { spawn += 0.4; }
      }
      const ax = (I.down('right') ? 1 : 0) - (I.down('left') ? 1 : 0);
      p.vx = U.lerp(p.vx, ax * 640, Math.min(1, dt * 14));
      p.x = U.clamp(p.x + p.vx * dt, p.w / 2, W - p.w / 2);
      if (magCd > 0) magCd -= dt;
      if (magnet > 0) magnet -= dt;
      if (I.hit('fire') && magCd <= 0) { magnet = 3; magCd = easy ? 7 : 10; api.sfx('shield'); api.say('Magnet on!', 1.2); }
      if (p.inv > 0) p.inv -= dt;
      p.squash = Math.max(0, p.squash - dt * 4);
      shake = Math.max(0, shake - dt * 3); flash = Math.max(0, flash - dt);
      const CY = H - 70;
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        if (magnet > 0 && !d.bad && d.y < CY) { const dx = p.x - d.x; d.x += U.clamp(dx, -1, 1) * Math.min(Math.abs(dx), 520 * dt); d.vy = Math.max(d.vy, 260); }
        d.y += d.vy * dt; d.rot += d.vr * dt;
        if (d.y > CY - 12 && d.y < CY + 18 && Math.abs(d.x - p.x) < p.w / 2 + 14) {
          drops.splice(i, 1);
          if (d.bad) {
            if (p.inv > 0) { burst(d.x, d.y, C.cyan, 8); continue; }
            hearts--; combo = 0; p.inv = 1.2; shake = 1; flash = 0.25; api.sfx('hurt'); burst(d.x, d.y, C.red, 18);
            if (hearts === 1) api.say('Last heart! Stay away from red.', 2);
            if (hearts <= 0 && !ended) { ended = true; api.lose('The viruses got through. Watch for red and step aside!'); return; }
          } else {
            got += d.gold ? 2 : 1; combo++; p.squash = 1;
            const pts = (d.gold ? 300 : 100) * (1 + Math.min(4, Math.floor(combo / 5)));
            score += pts; pops.push({ x: d.x, y: CY - 30, t: 0.8, s: '+' + pts });
            api.sfx(d.gold ? 'power' : 'coin'); burst(d.x, d.y, d.gold ? C.gold : C.green, 10);
            if (combo === 10) api.say('10 in a row! Points multiply with your streak.', 2);
            if (got >= NEED && !ended) { ended = true; api.win(score + hearts * 1000 + Math.max(0, Math.round((90 - t) * 40))); return; }
          }
        } else if (d.y > H + 30) { drops.splice(i, 1); if (!d.bad) combo = 0; }
      }
      for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 600 * dt; if (q.t <= 0) parts.splice(i, 1); }
      for (let i = pops.length - 1; i >= 0; i--) { pops[i].t -= dt; pops[i].y -= 40 * dt; if (pops[i].t <= 0) pops.splice(i, 1); }
    }
    function packet(g, d) {
      g.save(); g.translate(d.x, d.y); g.rotate(d.rot);
      if (d.bad) {
        g.fillStyle = C.red; g.shadowColor = C.red; g.shadowBlur = 16;
        g.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 10 : 20, a = k / 16 * Math.PI * 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill();
        g.shadowBlur = 0; g.fillStyle = '#2a0010'; g.fillRect(-7, -4, 5, 5); g.fillRect(2, -4, 5, 5);
      } else {
        const col = d.gold ? C.gold : C.green;
        g.shadowColor = col; g.shadowBlur = 14;
        D.block(g, -14, -12, 28, 24, [col, d.gold ? '#a07a00' : '#138a4a'], '#ffffff', d.gold ? '#7a5a00' : '#0d5c32', 6);
        g.shadowBlur = 0; g.fillStyle = 'rgba(10,5,24,0.7)'; g.fillRect(-8, -3, 16, 3);
      }
      g.restore();
    }
    function draw(g) {
      g.save();
      if (shake > 0) g.translate(U.rand(-8, 8) * shake, U.rand(-8, 8) * shake);
      D.sky(g, '#120634', '#3b0c63', '#7a1260');
      for (let i = 0; i < 40; i++) { const x = (i * 97) % W, y = ((i * 53 + t * (20 + i % 5 * 12)) % H); g.fillStyle = i % 3 ? 'rgba(57,255,143,0.25)' : 'rgba(255,79,184,0.3)'; g.fillRect(x, y, 2, 8); }
      D.gridFloor(g, H - 60, t * 1.2, 'rgba(57,255,143,0.5)');
      drops.forEach(d => packet(g, d));
      // catcher
      const CY = H - 70, sq = p.squash;
      g.save(); g.translate(p.x, CY); g.scale(1 + sq * 0.12, 1 - sq * 0.2);
      if (p.inv > 0 && Math.floor(p.inv * 12) % 2) g.globalAlpha = 0.4;
      if (magnet > 0) { g.strokeStyle = C.cyan; g.lineWidth = 3; g.globalAlpha *= 0.5 + 0.3 * Math.sin(t * 20); g.beginPath(); g.ellipse(0, -40, 90, 120, 0, 0, 7); g.stroke(); g.globalAlpha = p.inv > 0 ? 0.4 : 1; }
      D.block(g, -p.w / 2, 0, p.w, 18, [C.pink, '#8a1a5c'], '#ffc2e6', '#5a0f3c', 8);
      g.fillStyle = C.green; g.shadowColor = C.green; g.shadowBlur = 12; g.fillRect(-p.w / 2, -4, p.w, 4); g.shadowBlur = 0;
      g.restore();
      D.lumi(g, p.x + Math.sin(t * 2) * 40, CY - 70, t, 0.7, 'happy');
      parts.forEach(q => { g.globalAlpha = U.clamp(q.t * 2, 0, 1); g.fillStyle = q.col; g.fillRect(q.x - 2, q.y - 2, 4, 4); });
      g.globalAlpha = 1;
      pops.forEach(o => D.text(g, o.s, o.x, o.y, { size: 18, align: 'center', color: C.gold, alpha: U.clamp(o.t * 2, 0, 1) }));
      g.restore();
      if (flash > 0) { g.fillStyle = `rgba(255,40,80,${flash})`; g.fillRect(0, 0, W, H); }
      // HUD
      D.panel(g, 16, 12, 300, 58);
      D.text(g, 'PACKETS ' + Math.min(got, NEED) + ' / ' + NEED, 34, 40, { size: 20, color: C.green });
      g.fillStyle = '#2a1a44'; g.fillRect(34, 50, 260, 8); g.fillStyle = C.green; g.fillRect(34, 50, 260 * Math.min(1, got / NEED), 8);
      for (let i = 0; i < hearts; i++) D.text(g, '♥', W - 40 - i * 30, 46, { size: 28, color: C.pink, align: 'center' });
      D.text(g, 'SCORE ' + score.toLocaleString() + (combo >= 5 ? '   x' + (1 + Math.min(4, Math.floor(combo / 5))) : ''), W / 2, 40, { size: 20, align: 'center', color: C.gold });
      D.text(g, magCd > 0 ? 'MAGNET ' + Math.ceil(magCd) + 's' : 'MAGNET READY', W - 20, 80, { size: 14, align: 'right', color: magCd > 0 ? '#9a86c0' : C.cyan });
    }
    // autopilot hook for tests
    function ai() {
      const CY = H - 70; let tx = p.x, best = 1e9;
      for (const d of drops) if (!d.bad && d.y < CY) { const k = (CY - d.y) / d.vy; if (k < best) { best = k; tx = d.x; } }
      for (const d of drops) if (d.bad && d.y > CY - 160 && Math.abs(d.x - tx) < p.w / 2 + 20) tx += (d.x > tx ? -1 : 1) * 90;
      return { left: tx < p.x - 12, right: tx > p.x + 12, fire: magCd <= 0 };
    }
    return { update, draw, ai };
  }
})();
