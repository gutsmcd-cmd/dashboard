/* Cube Drop — game 2: FIREWALL SPRINT (side-scrolling platformer). */
(function () {
  'use strict';
  const { W, H, COL: C, draw: D, util: U, input: I } = CD;

  CD.registerGame({
    id: 'platformer',
    title: 'Firewall Sprint',
    genre: 'Platformer',
    tagline: 'Run, jump and stomp across a glitching server farm to the exit portal.',
    goal: d => 'Reach the exit portal. You have ' + (d === 'easy' ? 5 : 3) + ' hearts; falls send you back to a checkpoint.',
    controls: [['← → or A D', 'Run'], ['Space / ↑ / W', 'Jump (hold for higher)'], ['Jump again mid-air', 'Lumi Boost (double jump)'], ['Esc', 'Pause']],
    helper: 'Lumi flies with you, gives a double-jump boost, and calls out tips along the way.',
    music: 'plat',
    create
  });

  const TS = 36, ROWS = 15, COLS = 192;

  function build() {
    const grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
    const ground = (x0, x1, top) => { for (let x = x0; x <= x1; x++) for (let y = top; y < ROWS; y++) grid[y][x] = 1; };
    const plat = (x0, x1, y) => { for (let x = x0; x <= x1; x++) grid[y][x] = 2; };
    const spike = (x0, x1, y) => { for (let x = x0; x <= x1; x++) grid[y][x] = 3; };
    const L = { grid, shards: [], bugs: [], movers: [], checks: [], hints: [], exit: null, start: { x: 2 * TS, y: 12 * TS } };
    const shard = (x, y) => L.shards.push({ x: x * TS + TS / 2, y: y * TS + TS / 2, got: false });
    const bug = (x, a, b, top) => L.bugs.push({ x: x * TS, y: top * TS, x0: a * TS, x1: (b + 1) * TS, dir: -1, alive: true, dead: 0 });
    const check = (x, top) => L.checks.push({ x: x * TS + TS / 2, y: top * TS, on: false });
    const hint = (x, text) => L.hints.push({ x: x * TS, text, done: false });

    ground(0, 14, 12); [5, 7, 9].forEach(x => shard(x, 10));
    hint(1, 'Run with ← →. Jump with Space or ↑.');
    hint(11, 'A gap! Hold jump longer to leap further.');
    ground(18, 30, 12); ground(22, 23, 10); bug(28, 24, 30, 12); shard(22, 8); shard(23, 8);
    hint(19, 'See that bug? Jump on its head to squash it!');
    ground(34, 44, 11); spike(38, 39, 10); plat(37, 40, 7); [37, 38, 39, 40].forEach(x => shard(x, 6));
    hint(34, 'Spikes hurt. Hop over them, or take the high ledge.');
    check(46, 11); ground(45, 52, 11); shard(49, 5); shard(50, 5);
    hint(46, 'Checkpoint! Now jump, then press jump again in mid-air. I\'ll boost you!');
    L.movers.push({ x: 53 * TS, y: 10 * TS, w: 3 * TS, x0: 53 * TS, x1: 58 * TS, v: 70, dx: 0 });
    hint(51, 'Ride the moving platform across.');
    ground(61, 63, 12); ground(64, 65, 10); ground(66, 67, 8); ground(68, 74, 8); bug(72, 68, 74, 8);
    [61, 62, 63].forEach(x => shard(x, 10)); shard(66, 6); shard(67, 6);
    ground(78, 86, 9); bug(81, 78, 83, 9); bug(86, 84, 86, 9); shard(76, 5); shard(77, 5);
    hint(76, 'Two bugs. Bounce off one onto the other for style.');
    ground(90, 111, 12); check(91, 12);
    ground(96, 97, 7); plat(93, 94, 9); shard(96, 5); shard(97, 5);
    hint(92, 'Big wall! Use the ledge, or double-jump with my boost.');
    bug(102, 99, 105, 12); [100, 102, 104].forEach(x => shard(x, 9));
    // --- second half: bounce pads, high ledge, floating steps ---
    ground(115, 122, 12); L.grid[12][121] = 4; L.grid[12][122] = 4; [116, 117].forEach(x => shard(x, 10));
    hint(114, 'Green bounce pad by the wall! Step on it and keep holding →.');
    ground(123, 131, 6); bug(129, 124, 131, 6); [124, 125, 126].forEach(x => shard(x, 4));
    plat(134, 136, 8); plat(139, 141, 10); plat(144, 146, 8); [135, 140, 145].forEach(x => shard(x, 6));
    hint(131, 'Hop down the floating steps. Don\'t look down!');
    ground(149, 160, 11); check(150, 11);
    L.movers.push({ x: 161 * TS, y: 10 * TS, w: 3 * TS, x0: 161 * TS, x1: 166 * TS, v: 85, dx: 0 });
    hint(157, 'One more ride. Time your jump!');
    ground(170, 191, 12); spike(175, 178, 11); plat(174, 179, 8); [175, 176, 177, 178].forEach(x => shard(x, 6));
    bug(183, 181, 186, 12); bug(186, 184, 188, 12);
    hint(171, 'Almost there! The portal is just past those bugs.');
    L.exit = { x: 189 * TS, y: 12 * TS };
    return L;
  }

  function create(api) {
    const easy = api.easy;
    const L = build();
    const GRAV = 2200, JUMP = 760, DJUMP = 640, RUN = 280;
    const maxHearts = easy ? 5 : 3;
    const p = { x: L.start.x, y: L.start.y - 44, w: 22, h: 44, vx: 0, vy: 0, ground: false, face: 1, coyote: 0, buf: 0, dbl: true, inv: 0, boosted: 0 };
    let bounce = false, hearts = maxHearts, cam = 0, t = 0, score = 0, shards = 0, kills = 0, check = { x: L.start.x, y: L.start.y }, ended = false, ride = null;
    const lumi = { x: p.x - 40, y: p.y - 40 };
    const fx = [];
    const tile = (tx, ty) => (tx < 0 || tx >= COLS) ? 1 : (ty < 0 || ty >= ROWS) ? 0 : L.grid[ty][tx];
    const solid = (tx, ty) => { const k = tile(tx, ty); return k === 1 || k === 4; };
    const burst = (x, y, c, n) => { for (let i = 0; i < (n || 10); i++) fx.push({ x, y, vx: U.rand(-200, 200), vy: U.rand(-300, 50), life: U.rand(0.3, 0.7), c }); };

    function hurt(why) {
      if (p.inv > 0 || ended) return;
      hearts--; p.inv = 1.4; api.sfx('hurt'); burst(p.x + p.w / 2, p.y + p.h / 2, C.red, 14);
      p.vy = -520; p.vx = -p.face * 200;
      if (hearts <= 0) { ended = true; api.lose(why || 'Out of hearts. Lumi believes in you. Try again!'); }
    }
    function respawn() {
      p.x = check.x - p.w / 2; p.y = check.y - p.h - 2; p.vx = 0; p.vy = 0;
    }

    function update(dt) {
      if (ended) return;
      t += dt; p.inv -= dt; p.boosted -= dt;
      const dir = (I.down('right') ? 1 : 0) - (I.down('left') ? 1 : 0);
      const acc = p.ground ? 2600 : 1600;
      if (dir) { p.vx += dir * acc * dt; p.face = dir; } else { const f = (p.ground ? 2400 : 600) * dt; p.vx = Math.abs(p.vx) < f ? 0 : p.vx - Math.sign(p.vx) * f; }
      p.vx = U.clamp(p.vx, -RUN, RUN);
      const jumpHit = I.hit('fire') || I.hit('up');
      const jumpHeld = I.down('fire') || I.down('up');
      if (jumpHit) p.buf = 0.13;
      p.buf -= dt; p.coyote -= dt;
      if (p.buf > 0 && (p.ground || p.coyote > 0)) { p.vy = -JUMP; p.ground = false; p.coyote = 0; p.buf = 0; api.sfx('jump'); ride = null; }
      else if (jumpHit && !p.ground && p.dbl && p.coyote <= 0) {
        p.vy = -DJUMP; p.dbl = false; p.buf = 0; p.boosted = 0.4; api.sfx('boost'); burst(p.x + p.w / 2, p.y + p.h, C.green, 12);
      }
      if (p.vy >= 0) p.launch = false;
      if (!jumpHeld && !p.launch && p.vy < -280) p.vy = -280;
      p.vy = Math.min(p.vy + GRAV * dt, 1100);
      // movers
      for (const m of L.movers) {
        const nx = m.x + m.v * dt;
        if (nx > m.x1 || nx < m.x0) m.v = -m.v;
        m.dx = m.v * dt; m.x += m.dx;
      }
      if (ride) { p.x += ride.dx; }
      // X
      p.x += p.vx * dt;
      let ty0 = Math.floor(p.y / TS), ty1 = Math.floor((p.y + p.h - 1) / TS);
      if (p.vx > 0 || ride) { const tx = Math.floor((p.x + p.w) / TS); for (let ty = ty0; ty <= ty1; ty++) if (solid(tx, ty)) { p.x = tx * TS - p.w; p.vx = 0; } }
      if (p.vx < 0 || ride) { const tx = Math.floor(p.x / TS); for (let ty = ty0; ty <= ty1; ty++) if (solid(tx, ty)) { p.x = (tx + 1) * TS; p.vx = 0; } }
      // Y
      const prevBottom = p.y + p.h;
      p.y += p.vy * dt;
      const wasGround = p.ground; p.ground = false; ride = null;
      const tx0 = Math.floor((p.x + 2) / TS), tx1 = Math.floor((p.x + p.w - 2) / TS);
      if (p.vy >= 0) {
        const ty = Math.floor((p.y + p.h) / TS);
        for (let tx = tx0; tx <= tx1; tx++) {
          const k = tile(tx, ty);
          if (k === 1 || k === 4 || (k === 2 && prevBottom <= ty * TS + 2)) { p.y = ty * TS - p.h; p.vy = 0; p.ground = true; }
          if (k === 4) { bounce = true; }
        }
        for (const m of L.movers) {
          if (p.x + p.w > m.x + 2 && p.x < m.x + m.w - 2 && prevBottom <= m.y + 4 && p.y + p.h >= m.y) { p.y = m.y - p.h; p.vy = 0; p.ground = true; ride = m; }
        }
      } else {
        const ty = Math.floor(p.y / TS);
        for (let tx = tx0; tx <= tx1; tx++) if (solid(tx, ty)) { p.y = (ty + 1) * TS; p.vy = 0; }
      }
      if (bounce) { p.vy = -1150; p.launch = true; p.ground = false; p.dbl = true; api.sfx('boost'); burst(p.x + p.w / 2, p.y + p.h, C.green, 14); bounce = false; }
      if (p.ground) { p.dbl = true; p.coyote = 0.1; if (!wasGround) api.sfx('move'); }
      // spikes
      ty0 = Math.floor((p.y + 8) / TS); ty1 = Math.floor((p.y + p.h - 1) / TS);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
        if (tile(tx, ty) === 3 && p.y + p.h > ty * TS + 14) hurt('Spiked! Hop over the pink spikes next time.');
      }
      // fall
      if (p.y > H + 80) {
        if (!ended) { hearts--; api.sfx('hurt'); if (hearts <= 0) { ended = true; api.lose('Fell into the void one too many times.'); return; } }
        respawn(); p.inv = 1; api.say('Whoops! Back to the checkpoint. Jump a little earlier.', 2.5);
      }
      // bugs
      for (const b of L.bugs) {
        if (!b.alive) { b.dead += dt; continue; }
        b.x += b.dir * (easy ? 50 : 75) * dt;
        if (b.x < b.x0) { b.x = b.x0; b.dir = 1; } if (b.x + 30 > b.x1) { b.x = b.x1 - 30; b.dir = -1; }
        const box = { x: b.x, y: b.y - 24, w: 30, h: 24 };
        if (U.hit(p, box)) {
          if (p.vy > 0 && prevBottom <= box.y + 12) {
            b.alive = false; kills++; score += 200; p.vy = -560; p.dbl = true; api.sfx('hit'); burst(b.x + 15, b.y - 12, C.pink, 16);
          } else hurt('A bug got you. Land on their heads!');
        }
      }
      // shards
      for (const s of L.shards) if (!s.got && Math.abs(p.x + p.w / 2 - s.x) < 22 && Math.abs(p.y + p.h / 2 - s.y) < 30) { s.got = true; shards++; score += 100; api.sfx('coin'); burst(s.x, s.y, C.green, 6); }
      // checkpoints
      for (const c of L.checks) if (!c.on && p.x > c.x - 10) { c.on = true; check = { x: c.x, y: c.y }; api.sfx('power'); if (hearts < maxHearts) hearts++; }
      // hints
      for (const h of L.hints) if (!h.done && p.x > h.x) { h.done = true; api.say(h.text, 4); }
      // exit
      if (Math.abs(p.x + p.w / 2 - (L.exit.x + TS / 2)) < 30 && p.y + p.h > L.exit.y - 90) {
        ended = true;
        api.win(score + hearts * 800 + Math.max(0, Math.round((150 - t) * 30)));
      }
      // fx, camera, lumi
      for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 900 * dt; if (f.life <= 0) fx.splice(i, 1); }
      cam = U.lerp(cam, U.clamp(p.x - W * 0.38, 0, COLS * TS - W), Math.min(1, dt * 6));
      lumi.x = U.lerp(lumi.x, p.x - p.face * 46 + 10, Math.min(1, dt * 4));
      lumi.y = U.lerp(lumi.y, p.y - 34, Math.min(1, dt * 4));
    }

    function drawTile(g, k, x, y, tx, ty) {
      if (k === 1) {
        const exposed = tile(tx, ty - 1) !== 1 && tile(tx, ty - 1) !== 4;
        g.fillStyle = (tx + ty) % 2 ? '#2e1160' : '#341468'; g.fillRect(x, y, TS, TS);
        g.fillStyle = 'rgba(255,79,184,0.35)'; g.fillRect(x + 4, y + 4, TS - 8, 2); g.fillRect(x + 4, y + TS - 6, TS - 8, 2);
        g.fillStyle = 'rgba(57,255,143,0.55)'; if ((tx * 7 + ty * 3) % 5 === 0) g.fillRect(x + 8, y + 14, 4, 4);
        if (exposed) {
          g.fillStyle = C.green; g.fillRect(x, y, TS, 9);
          g.fillStyle = '#d6ffe9'; g.fillRect(x, y, TS, 3);
          g.fillStyle = '#138a52'; g.fillRect(x, y + 9, TS, 3);
        }
      } else if (k === 2) {
        const gr = g.createLinearGradient(0, y, 0, y + 14);
        gr.addColorStop(0, '#ffd1ee'); gr.addColorStop(0.4, C.pink); gr.addColorStop(1, '#7a0f5a');
        g.fillStyle = gr; g.fillRect(x, y, TS, 14);
        g.fillStyle = C.green; g.fillRect(x, y + 14, TS, 2);
      } else if (k === 4) {
        g.fillStyle = '#2e1160'; g.fillRect(x, y + 8, TS, TS - 8);
        const sq = Math.sin(t * 8) * 2;
        g.fillStyle = '#ddd'; for (let i = 0; i < 3; i++) g.fillRect(x + 8 + i * 8, y + 6 + sq, 3, 8);
        g.save(); g.shadowColor = C.green; g.shadowBlur = 14; g.fillStyle = C.green; g.fillRect(x + 2, y + sq, TS - 4, 7); g.restore();
      } else if (k === 3) {
        for (let i = 0; i < 3; i++) {
          g.fillStyle = i % 2 ? '#ff9bd6' : C.hot;
          g.beginPath(); g.moveTo(x + i * 12, y + TS); g.lineTo(x + i * 12 + 6, y + 10); g.lineTo(x + i * 12 + 12, y + TS); g.fill();
        }
      }
    }
    function draw(g) {
      D.sky(g, '#1ad8ff', '#a43cff', '#ff6fc0');
      // far mountains (low-poly)
      g.fillStyle = 'rgba(110,20,140,0.55)';
      for (let i = -1; i < 9; i++) { const x = i * 160 - (cam * 0.15) % 160; g.beginPath(); g.moveTo(x, 420); g.lineTo(x + 80, 250 + (i * 37 % 60)); g.lineTo(x + 160, 420); g.fill(); }
      D.cube(g, 760 - cam * 0.05, 90, 34, t * 0.4, t * 0.7, { glowSize: 22, alpha: 0.65 });
      g.fillStyle = 'rgba(20,110,80,0.55)';
      for (let i = -1; i < 14; i++) { const x = i * 90 - (cam * 0.4) % 90; const hh = 60 + (Math.abs(i * 53 + Math.floor(cam * 0.4 / 90) * 31) % 120); g.fillRect(x, 470 - hh, 60, hh); }
      g.save(); g.translate(-Math.round(cam), 0);
      const c0 = Math.max(0, Math.floor(cam / TS)), c1 = Math.min(COLS - 1, c0 + Math.ceil(W / TS) + 1);
      for (let ty = 0; ty < ROWS; ty++) for (let tx = c0; tx <= c1; tx++) { const k = L.grid[ty][tx]; if (k) drawTile(g, k, tx * TS, ty * TS, tx, ty); }
      for (const m of L.movers) {
        D.block(g, m.x, m.y, m.w, 16, ['#5dffb0', '#0d4a3a'], '#c8ffe2', '#137a52', 6);
        g.fillStyle = 'rgba(57,255,143,0.25)'; g.fillRect(m.x + 10, m.y + 16, m.w - 20, 6 + Math.sin(t * 20) * 2);
      }
      for (const c of L.checks) {
        g.fillStyle = '#ddd'; g.fillRect(c.x - 2, c.y - 70, 4, 70);
        g.fillStyle = c.on ? C.green : '#776'; g.beginPath(); g.moveTo(c.x + 2, c.y - 70); g.lineTo(c.x + 34, c.y - 60 + Math.sin(t * 6) * 3); g.lineTo(c.x + 2, c.y - 48); g.fill();
      }
      for (const s of L.shards) if (!s.got) {
        const yy = s.y + Math.sin(t * 4 + s.x) * 4;
        g.save(); g.shadowColor = C.green; g.shadowBlur = 12; g.fillStyle = C.green;
        g.beginPath(); g.moveTo(s.x, yy - 11); g.lineTo(s.x + 7, yy); g.lineTo(s.x, yy + 11); g.lineTo(s.x - 7, yy); g.fill();
        g.fillStyle = '#fff'; g.fillRect(s.x - 1, yy - 6, 2, 6); g.restore();
      }
      for (const b of L.bugs) {
        if (!b.alive) { if (b.dead < 0.4) { g.fillStyle = C.pink; g.fillRect(b.x, b.y - 6, 30, 6); } continue; }
        const bx = b.x, by = b.y, leg = Math.sin(t * 18) * 3;
        g.strokeStyle = '#1a0533'; g.lineWidth = 3; g.beginPath();
        for (let i = 0; i < 3; i++) { g.moveTo(bx + 6 + i * 9, by - 8); g.lineTo(bx + 3 + i * 9 + (i % 2 ? leg : -leg), by); }
        g.stroke();
        D.block(g, bx, by - 24, 26, 16, [C.hot, '#5d0a3a'], '#ffc2e6', '#8a1f6e', 5);
        g.fillStyle = C.lime; g.fillRect(b.dir > 0 ? bx + 18 : bx + 3, by - 20, 5, 5);
        if (Math.random() < 0.05) { g.fillStyle = C.cyan; g.fillRect(bx + U.rand(0, 26), by - 24 + U.rand(0, 16), 8, 2); }
      }
      // exit portal
      const ex = L.exit.x + TS / 2, ey = L.exit.y - 50;
      g.save(); g.shadowColor = C.green; g.shadowBlur = 25;
      for (let i = 0; i < 3; i++) { g.strokeStyle = i % 2 ? C.pink : C.green; g.lineWidth = 5; g.beginPath(); g.ellipse(ex, ey, 30 - i * 7, 48 - i * 9, 0, t * (2 + i), t * (2 + i) + 4.6); g.stroke(); }
      g.restore();
      D.text(g, 'EXIT', ex, ey - 62, { size: 16, align: 'center', color: C.green });
      // lumi + player
      D.lumi(g, lumi.x, lumi.y, t, 0.75, p.boosted > 0 ? 'happy' : null);
      if (p.boosted > 0) { g.save(); g.globalAlpha = p.boosted * 2; g.strokeStyle = C.green; g.lineWidth = 3; g.beginPath(); g.moveTo(lumi.x, lumi.y); g.lineTo(p.x + p.w / 2, p.y + p.h); g.stroke(); g.restore(); }
      if (!(p.inv > 0 && Math.floor(t * 16) % 2)) D.visitor(g, p.x + p.w / 2, p.y + p.h, 0.68, p.face, t, { run: p.ground ? Math.abs(p.vx) / RUN : 0, air: !p.ground });
      for (const f of fx) { g.globalAlpha = Math.max(0, f.life * 2); g.fillStyle = f.c; g.fillRect(f.x - 3, f.y - 3, 6, 6); }
      g.globalAlpha = 1;
      g.restore();
      // HUD
      D.panel(g, 14, 12, 300, 58);
      for (let i = 0; i < maxHearts; i++) {
        const x = 34 + i * 30, y = 40;
        g.fillStyle = i < hearts ? C.pink : '#3a2b55';
        g.beginPath(); g.moveTo(x, y + 9); g.bezierCurveTo(x - 14, y - 2, x - 6, y - 14, x, y - 5); g.bezierCurveTo(x + 6, y - 14, x + 14, y - 2, x, y + 9); g.fill();
      }
      D.text(g, '◆ ' + shards, 200, 50, { size: 20, color: C.green });
      D.text(g, String(score), 300, 50, { size: 16, align: 'right', color: C.gold });
      const prog = U.clamp(p.x / L.exit.x, 0, 1);
      g.fillStyle = 'rgba(10,5,24,0.7)'; g.fillRect(W - 230, 26, 200, 10);
      g.fillStyle = C.green; g.fillRect(W - 230, 26, 200 * prog, 10);
      D.text(g, 'EXIT', W - 24, 36, { size: 12, align: 'right' });
    }
    return { update, draw, _peek: () => ({ p, L, hearts, TS, ended }) };
  }
})();
