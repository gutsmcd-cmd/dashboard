/* Cube Drop — game 4: BYTE BRAWL (one-on-one fighting, best of 3). */
(function () {
  'use strict';
  const { W, H, COL: C, draw: D, util: U, input: I } = CD;

  CD.registerGame({
    id: 'fighter',
    title: 'Byte Brawl',
    genre: 'Fighting',
    tagline: 'One-on-one against KRASH, a hulking static brute. Best of three rounds.',
    goal: 'Win 2 of 3 rounds: knock KRASH out, or have more health at time-up.',
    controls: [['← → or A D', 'Move'], ['↑ or W', 'Jump'], ['↓ or S (hold)', 'Block'], ['Space', 'Punch (fast)'], ['Shift or X', 'Kick (strong)'], ['C', 'Lumi Beam (when the meter is full)']],
    helper: 'Lumi warns you before KRASH\'s big smash and charges your beam.',
    music: 'fight',
    touchHelp: [['◀ ▶', 'Walk'], ['▲', 'Jump'], ['▼ (hold)', 'Block'], ['A / B', 'Punch / Kick'], ['C', 'Lumi Beam (when the meter is full)']],
    medals: [4000, 7000, 10000],
    create
  });

  const FLOOR = 450;
  const MOVES = {
    punch: { start: 0.07, act: 0.09, rec: 0.14, dmg: 6, range: 78, kb: 120 },
    kick: { start: 0.16, act: 0.1, rec: 0.24, dmg: 10, range: 98, kb: 260 },
    jab: { start: 0.12, act: 0.09, rec: 0.25, dmg: 6, range: 82, kb: 140 },
    smash: { start: 0.6, act: 0.12, rec: 0.45, dmg: 15, range: 105, kb: 380 }
  };

  function create(api) {
    const easy = api.easy;
    const pDmg = easy ? 1.35 : 1, eDmg = easy ? 0.6 : 1;
    if (easy) MOVES.smash.start = 0.8; else MOVES.smash.start = 0.6;
    const mk = (x, face) => ({ x, y: FLOOR, vy: 0, face, hp: 100, atk: null, stun: 0, block: false, walk: 0, flash: 0 });
    let P, E, round = 1, pw = 0, ew = 0, phase = 'intro', pt = 0, clock = 45, t = 0, meter = 0, beam = 0, ai = { think: 0, plan: 'approach' }, fx = [], ended = false, warned = 0, totalT = 0;
    function reset() { P = mk(280, 1); E = mk(680, -1); phase = 'intro'; pt = 0; clock = 45; beam = 0; }
    reset();
    api.say('Space punches, Shift/X kicks, hold ↓ to block. I\'ll warn you about the big one!', 4);

    const burst = (x, y, c, n) => { for (let i = 0; i < n; i++) fx.push({ x, y, vx: U.rand(-260, 260), vy: U.rand(-300, 60), life: U.rand(0.2, 0.5), c }); };
    function startAtk(f, type) { if (f.atk || f.stun > 0 || f.hp <= 0) return; f.atk = { type, t: 0, hit: false }; if (type === 'smash') api.sfx('hum'); }
    function stepAtk(f, o, mult, isP) {
      if (!f.atk) return;
      const m = MOVES[f.atk.type]; f.atk.t += dtNow;
      const a = f.atk;
      if (!a.hit && a.t >= m.start && a.t <= m.start + m.act) {
        const reach = Math.abs(o.x - f.x) <= m.range + 20 && Math.sign(o.x - f.x) === f.face && Math.abs(o.y - f.y) < 90;
        if (reach) {
          a.hit = true;
          const blocked = o.block && o.face === -f.face && o.stun <= 0;
          const dmg = m.dmg * mult * (blocked ? 0.15 : 1);
          o.hp = Math.max(0, o.hp - dmg);
          o.x += f.face * (blocked ? m.kb * 0.3 : m.kb) * 0.25;
          if (blocked) { api.sfx('block'); burst(o.x - f.face * 20, o.y - 70, C.green, 6); }
          else { o.stun = a.type === 'smash' ? 0.55 : 0.28; o.atk = null; o.flash = 0.12; api.sfx('punch'); burst(o.x - f.face * 10, o.y - 70, isP ? C.pink : C.red, 12); }
          if (isP) meter = Math.min(100, meter + (blocked ? 3 : 12)); else meter = Math.min(100, meter + (blocked ? 2 : 8));
        }
      }
      if (a.t > m.start + m.act + m.rec) f.atk = null;
    }
    let dtNow = 0;
    function physics(f, dt) {
      f.vy += 2400 * dt; f.y += f.vy * dt;
      if (f.y >= FLOOR) { f.y = FLOOR; f.vy = 0; }
      f.x = U.clamp(f.x, 60, W - 60);
      f.stun -= dt; f.flash -= dt;
    }
    function endRound(winner) {
      phase = 'ko'; pt = 0;
      if (winner === 'p') pw++; else if (winner === 'e') ew++;
      api.sfx(winner === 'p' ? 'power' : 'hurt');
    }

    function update(dt) {
      if (ended) return;
      t += dt; pt += dt; dtNow = dt; beam -= dt;
      for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 800 * dt; if (f.life <= 0) fx.splice(i, 1); }
      if (phase === 'intro') { if (pt > 1.6) { phase = 'fight'; pt = 0; api.sfx('go'); } return; }
      if (phase === 'ko') {
        physics(P, dt); physics(E, dt);
        if (pt > 2.2) {
          if (pw >= 2) { ended = true; api.win(3000 + Math.round(P.hp) * 30 + (ew === 0 ? 2000 : 0) + Math.max(0, Math.round(150 - totalT) * 10)); return; }
          if (ew >= 2) { ended = true; api.lose('KRASH won 2 rounds. Block his glowing smash, then punish!'); return; }
          round++; reset();
        }
        return;
      }
      clock -= dt; totalT += dt;
      // player
      P.block = I.down('down') && P.y >= FLOOR && !P.atk && P.stun <= 0;
      const dir = (I.down('right') ? 1 : 0) - (I.down('left') ? 1 : 0);
      P.walk = 0;
      if (P.stun <= 0 && !P.block && !(P.atk && P.y >= FLOOR)) { P.x += dir * 250 * dt; P.walk = dir; }
      if (I.hit('up') && P.y >= FLOOR && P.stun <= 0 && !P.atk) { P.vy = -820; api.sfx('jump'); }
      if (I.hit('fire')) startAtk(P, 'punch');
      if (I.hit('alt')) startAtk(P, 'kick');
      if (I.hit('KeyC')) {
        if (meter >= 100 && P.stun <= 0) {
          meter = 0; beam = 0.5; api.sfx('boost');
          const blocked = E.block && E.face === -P.face;
          E.hp = Math.max(0, E.hp - (blocked ? 6 : 22) * pDmg); E.stun = 0.7; E.atk = null; E.x += P.face * 60; E.flash = 0.2; burst(E.x, E.y - 70, C.green, 30);
          api.say('Lumi Beam!', 1.2);
        } else api.say('My beam needs a full meter. Land some hits!', 1.5);
      }
      // ai
      const d = E.x - P.x, ad = Math.abs(d);
      ai.think -= dt;
      E.block = false;
      if (E.stun <= 0 && !E.atk) {
        if (ai.think <= 0) {
          ai.think = U.rand(0.25, 0.6) * (easy ? 1.5 : 1);
          const r = Math.random();
          if (ad > 140) ai.plan = r < 0.8 ? 'approach' : 'wait';
          else ai.plan = r < (easy ? 0.3 : 0.4) ? 'jab' : r < (easy ? 0.45 : 0.62) ? 'smash' : r < 0.8 ? 'retreat' : 'wait';
        }
        if (P.atk && P.atk.t < 0.1 && ad < 130 && Math.random() < (easy ? 0.12 : 0.45) * dt * 30) ai.plan = 'guard';
        if (ai.plan === 'approach') { E.x -= Math.sign(d) * 190 * dt; E.walk = -Math.sign(d); }
        else if (ai.plan === 'retreat') { E.x += Math.sign(d) * 150 * dt; E.walk = Math.sign(d); }
        else if (ai.plan === 'guard') E.block = true;
        else if (ai.plan === 'jab' && ad < 120) { startAtk(E, 'jab'); ai.plan = 'wait'; }
        else if (ai.plan === 'smash' && ad < 140) {
          startAtk(E, 'smash'); ai.plan = 'wait';
          if (warned < (easy ? 99 : 3)) { warned++; api.say('He\'s glowing red — hold ↓ to BLOCK!', 1.4); }
        } else E.walk = 0;
      } else E.walk = 0;
      if (E.stun <= 0) E.face = d > 0 ? -1 : 1;
      if (P.stun <= 0 && !P.atk) P.face = d > 0 ? 1 : -1;
      stepAtk(P, E, pDmg, true); stepAtk(E, P, eDmg, false);
      // keep apart
      if (ad < 60 && Math.abs(P.y - E.y) < 60) { const push = (60 - ad) / 2 * Math.sign(d || 1); P.x -= push; E.x += push; }
      physics(P, dt); physics(E, dt);
      if (E.hp <= 0) { endRound('p'); burst(E.x, E.y - 60, C.pink, 40); }
      else if (P.hp <= 0) endRound('e');
      else if (clock <= 0) endRound(P.hp >= E.hp ? 'p' : 'e');
    }

    function drawKrash(g, f) {
      const a = f.atk, m = a && MOVES[a.type];
      const wind = a && a.t < m.start, act = a && a.t >= m.start && a.t < m.start + m.act + 0.05;
      g.save(); g.translate(f.x, f.y); g.scale(f.face * 1.35, 1.35);
      if (f.flash > 0) g.filter = 'brightness(2.5)';
      if (a && a.type === 'smash' && wind) { g.shadowColor = C.red; g.shadowBlur = 30 * (0.5 + 0.5 * Math.sin(t * 40)); }
      const sway = Math.sin(t * 6) * 2 + (f.walk ? Math.sin(t * 14) * 2 : 0);
      g.fillStyle = '#1b0a33'; g.fillRect(-16, -26, 12, 26); g.fillRect(6, -26, 12, 26);
      g.fillStyle = C.red; g.fillRect(-18, -6, 15, 6); g.fillRect(5, -6, 15, 6);
      const tg = g.createLinearGradient(0, -86, 0, -24); tg.addColorStop(0, '#7a3cbf'); tg.addColorStop(1, '#2a0b4a');
      g.fillStyle = tg; g.beginPath(); g.moveTo(-30, -84 + sway); g.lineTo(30, -84 + sway); g.lineTo(18, -24); g.lineTo(-18, -24); g.fill();
      g.fillStyle = C.red; g.fillRect(-26, -66 + sway, 52, 5);
      g.fillStyle = '#4b1d8c'; g.beginPath(); g.moveTo(-12, -84 + sway); g.lineTo(12, -84 + sway); g.lineTo(9, -104 + sway); g.lineTo(-9, -104 + sway); g.fill();
      g.fillStyle = C.red; g.shadowColor = C.red; g.shadowBlur = 10; g.fillRect(0, -98 + sway, 10, 4); g.shadowBlur = a && a.type === 'smash' && wind ? 30 : 0;
      // arm
      let reach = 0, lift = 0;
      if (a) { if (wind) { reach = -10; lift = a.type === 'smash' ? -30 : 0; } else if (act) reach = a.type === 'smash' ? 60 : 44; }
      g.fillStyle = '#5a2bc4'; g.fillRect(10, -78 + sway + lift, 20 + reach, 14);
      g.fillStyle = a && a.type === 'smash' && wind ? C.red : '#ff8a3d';
      g.fillRect(26 + reach, -82 + sway + lift, 20, 22);
      if (f.block) { g.fillStyle = 'rgba(255,64,87,0.35)'; g.fillRect(30, -100, 10, 90); }
      g.restore();
    }
    function drawPlayer(g, f) {
      const a = f.atk, m = a && MOVES[a.type];
      const act = a && a.t >= m.start && a.t < m.start + m.act + 0.06;
      g.save();
      if (f.flash > 0) g.filter = 'brightness(2.5)';
      D.visitor(g, f.x, f.y, 1.45, f.face, t, { run: Math.abs(f.walk), air: f.y < FLOOR, punch: act && a.type === 'punch' });
      if (act && a.type === 'kick') {
        g.save(); g.translate(f.x, f.y); g.scale(f.face, 1);
        g.fillStyle = '#2b1258'; g.fillRect(4, -40, 58, 12); g.fillStyle = C.green; g.fillRect(56, -44, 16, 18); g.restore();
      }
      if (f.block) {
        g.save(); g.translate(f.x + f.face * 34, f.y - 55);
        g.strokeStyle = C.green; g.lineWidth = 4; g.shadowColor = C.green; g.shadowBlur = 14; g.globalAlpha = 0.85;
        g.beginPath(); for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2 + Math.PI / 6; g.lineTo(Math.cos(an) * 22, Math.sin(an) * 40); } g.closePath(); g.stroke();
        g.fillStyle = 'rgba(57,255,143,0.15)'; g.fill(); g.restore();
      }
      g.restore();
    }
    function bar(g, x, y, w, v, c, right) {
      g.fillStyle = 'rgba(10,5,24,0.85)'; g.fillRect(x - 3, y - 3, w + 6, 24);
      g.fillStyle = '#3a2b55'; g.fillRect(x, y, w, 18);
      const vw = w * v / 100;
      const gr = g.createLinearGradient(0, y, 0, y + 18); gr.addColorStop(0, '#fff'); gr.addColorStop(0.3, c); gr.addColorStop(1, '#2a0b4a');
      g.fillStyle = gr; g.fillRect(right ? x + w - vw : x, y, vw, 18);
    }
    function draw(g) {
      D.sky(g, '#13c8f5', '#8e3cff', '#ff4fb8', 0, FLOOR);
      // arena: inside-the-cube walls
      g.save(); g.globalAlpha = 0.35; g.strokeStyle = C.green; g.lineWidth = 2;
      for (let i = 0; i <= 12; i++) { g.beginPath(); g.moveTo(i * 80, 0); g.lineTo(i * 80, FLOOR); g.stroke(); }
      for (let j = 0; j < 6; j++) { g.beginPath(); g.moveTo(0, j * 80 + (t * 20) % 80); g.lineTo(W, j * 80 + (t * 20) % 80); g.stroke(); }
      g.restore();
      D.cube(g, W / 2, 120, 40, t * 0.3, t * 0.5, { glowSize: 26, alpha: 0.5 });
      D.gridFloor(g, FLOOR - 10, t * 0.5, 'rgba(255,79,184,0.55)', ['#3a0f63', '#07020f']);
      // crowd of Kernelport citizens (silhouettes)
      for (let i = 0; i < 24; i++) { const x = i * 42 + 10, y = FLOOR - 20 + Math.sin(t * 6 + i) * 3; g.fillStyle = i % 2 ? 'rgba(255,79,184,0.35)' : 'rgba(57,255,143,0.3)'; g.fillRect(x, y - 30, 18, 30); g.fillRect(x + 3, y - 42, 12, 12); }
      // shadows
      for (const f of [P, E]) { g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(f.x, FLOOR + 4, 40 * (1 - (FLOOR - f.y) / 400), 8, 0, 0, 7); g.fill(); }
      drawKrash(g, E); drawPlayer(g, P);
      if (beam > 0) { g.save(); g.globalAlpha = beam * 2; g.strokeStyle = C.green; g.lineWidth = 14; g.shadowColor = C.green; g.shadowBlur = 30; g.beginPath(); g.moveTo(P.x, P.y - 130); g.lineTo(E.x, E.y - 70); g.stroke(); g.restore(); }
      D.lumi(g, P.x - P.face * 50, P.y - 150, t, 0.75, meter >= 100 ? 'happy' : null);
      for (const f of fx) { g.globalAlpha = Math.max(0, f.life * 2); g.fillStyle = f.c; g.fillRect(f.x - 3, f.y - 3, 7, 7); }
      g.globalAlpha = 1;
      // HUD
      bar(g, 30, 24, 360, P.hp, C.pink, false); bar(g, W - 390, 24, 360, E.hp, C.red, true);
      D.text(g, 'YOU', 30, 66, { size: 16, color: C.pink }); D.text(g, 'KRASH', W - 30, 66, { size: 16, align: 'right', color: C.red });
      for (let i = 0; i < 2; i++) {
        g.fillStyle = i < pw ? C.gold : '#3a2b55'; g.beginPath(); g.arc(80 + i * 22, 60, 7, 0, 7); g.fill();
        g.fillStyle = i < ew ? C.gold : '#3a2b55'; g.beginPath(); g.arc(W - 120 - i * 22, 60, 7, 0, 7); g.fill();
      }
      D.panel(g, W / 2 - 40, 12, 80, 56);
      D.text(g, String(Math.max(0, Math.ceil(clock))), W / 2, 52, { size: 30, align: 'center', color: clock < 10 ? C.red : '#fff' });
      D.text(g, 'LUMI BEAM', 30, 98, { size: 13, color: C.green });
      g.fillStyle = '#3a2b55'; g.fillRect(120, 87, 160, 12);
      g.fillStyle = meter >= 100 ? (Math.sin(t * 10) > 0 ? '#fff' : C.green) : '#4fc88a'; g.fillRect(120, 87, 1.6 * meter, 12);
      if (meter >= 100) D.text(g, 'PRESS C!', 290, 98, { size: 13, color: '#fff' });
      if (phase === 'intro') D.bigText(g, 'ROUND ' + round, W / 2, 230, 80, C.green, '#1a7a4a', 8);
      if (phase === 'intro' && pt > 0.9) D.text(g, 'FIGHT!', W / 2, 310, { size: 44, align: 'center', color: C.pink, glow: C.pink });
      if (phase === 'ko' && !ended) D.bigText(g, P.hp <= 0 || E.hp <= 0 ? 'K.O.!' : 'TIME!', W / 2, 230, 96, C.pink, '#7a0f5a', 9);
    }
    return { update, draw, _peek: () => ({ P, E, phase, pw, ew, meter, round }) };
  }
})();
