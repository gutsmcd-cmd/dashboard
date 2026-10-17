/* Cube Drop — game 3: VIRUS STORM (side-scrolling shooter with a boss). */
(function () {
  'use strict';
  const { W, H, COL: C, draw: D, util: U, input: I } = CD;

  CD.registerGame({
    id: 'shooter',
    title: 'Virus Storm',
    genre: 'Shooter',
    tagline: 'Blast through virus waves, then take down the Corruptor core.',
    goal: d => 'Survive the waves and destroy the boss. You have ' + (d === 'easy' ? 5 : 3) + ' ships.',
    controls: [['Arrows or WASD', 'Fly'], ['Space (hold)', 'Fire'], ['Shift or X', 'Lumi Shield (recharges)'], ['Esc', 'Pause']],
    helper: 'Lumi flies wing and auto-fires at the nearest virus. Shift/X throws up a shield bubble.',
    music: 'shoot',
    create
  });

  function create(api) {
    const easy = api.easy;
    const BS = easy ? 165 : 230;
    const p = { x: 140, y: H / 2, vx: 0, vy: 0, cd: 0, lvl: 1, inv: 2, lives: easy ? 5 : 3 };
    const wing = { x: 100, y: H / 2 - 60, cd: 0 };
    let t = 0, score = 0, kills = 0, hitsTaken = 0, ended = false, shield = 0, shieldCd = 0, scroll = 0, warn = 0, bossOn = false, boss = null, flash = 0;
    const shots = [], foes = [], eb = [], items = [], fx = [], stars = [];
    for (let i = 0; i < 60; i++) stars.push({ x: U.rand(0, W), y: U.rand(0, 380), v: U.rand(40, 260) });
    const SHIELD_CD = easy ? 8 : 12;

    const events = [];
    const at = (time, fn) => events.push({ time, fn });
    const line = (time, n, y, type, gap) => { for (let i = 0; i < n; i++) at(time + i * (gap || 0.32), () => spawn(type, W + 30, y)); };
    line(1.5, 5, 140, 'drone'); line(4.5, 5, 400, 'drone');
    line(7.5, 3, 270, 'diver', 0.6);
    at(10, () => spawn('pod', W + 40, 190));
    line(12, 6, 270, 'wave', 0.28);
    line(15, 4, 120, 'diver', 0.5); at(15.5, () => spawn('pod', W + 40, 400));
    line(19, 5, 120, 'drone'); line(19.4, 5, 420, 'drone');
    at(23, () => spawn('pod', W + 40, 140)); at(23.4, () => spawn('pod', W + 40, 420));
    line(26, 5, 270, 'diver', 0.45);
    line(29.5, 6, 200, 'wave', 0.25); line(30, 6, 350, 'wave', 0.25);
    at(34, () => { warn = 3; api.sfx('hum'); api.say('Big signal incoming! Stay mobile and keep firing.', 3); });
    at(37, () => { bossOn = true; api.music('boss'); spawnBoss(); });
    events.sort((a, b) => a.time - b.time);

    function spawn(type, x, y) {
      const f = { type, x, y, y0: y, hp: 1, r: 18, t: 0, cd: U.rand(0.8, 1.6) };
      if (type === 'diver') { f.hp = 2; f.r = 20; }
      if (type === 'pod') { f.hp = easy ? 4 : 6; f.r = 26; }
      foes.push(f);
    }
    function spawnBoss() {
      boss = { x: W + 140, y: H / 2, hp: easy ? 80 : 120, max: easy ? 80 : 120, t: 0, a: 1.2, b: 2.5, c: 4, hit: 0 };
    }
    const burst = (x, y, c, n, sp) => { for (let i = 0; i < n; i++) { const a = U.rand(0, 7), s = U.rand(40, sp || 260); fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: U.rand(0.25, 0.7), c }); } };
    function fireAt(x, y, tx, ty, sp, n, spread) {
      const a0 = Math.atan2(ty - y, tx - x);
      for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * (spread || 0.22); eb.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }); }
    }
    function playerHit() {
      if (p.inv > 0 || shield > 0 || ended) return;
      p.lives--; hitsTaken++; p.inv = 2; flash = 0.3; api.sfx('hurt'); burst(p.x, p.y, C.red, 20);
      if (p.lvl > 1) p.lvl--;
      eb.length = 0;
      if (p.lives <= 0) { ended = true; api.lose('Your ship was zeroed. Try again — Lumi\'s shield helps!'); }
      else if (hitsTaken === 1) api.say('Ouch! Press Shift or X and I\'ll shield you.', 3);
    }
    function kill(f) {
      kills++; score += f.type === 'pod' ? 300 : 100; api.sfx('explode'); burst(f.x, f.y, f.type === 'pod' ? C.green : C.pink, 18);
      if (kills % 7 === 0 || (f.type === 'pod' && easy)) items.push({ x: f.x, y: f.y, k: p.lvl < 3 ? 'P' : 'H' });
      else if (f.type === 'pod') items.push({ x: f.x, y: f.y, k: 'P' });
    }
    api.say('Arrows to fly, hold Space to fire. I\'ll cover your wing!', 3.5);

    function update(dt) {
      if (ended) return;
      t += dt; scroll += dt; p.inv -= dt; shield -= dt; shieldCd -= dt; warn -= dt; flash -= dt;
      while (events.length && events[0].time <= t) events.shift().fn();
      // player
      const ix = (I.down('right') ? 1 : 0) - (I.down('left') ? 1 : 0), iy = (I.down('down') ? 1 : 0) - (I.down('up') ? 1 : 0);
      const n = ix && iy ? 0.7071 : 1;
      p.x = U.clamp(p.x + ix * n * 340 * dt, 30, W - 200); p.y = U.clamp(p.y + iy * n * 340 * dt, 30, H - 30);
      p.vy = U.lerp(p.vy, iy, dt * 8);
      p.cd -= dt;
      if (I.down('fire') && p.cd <= 0) {
        p.cd = 0.12; api.sfx('shoot');
        shots.push({ x: p.x + 26, y: p.y, vx: 900, vy: 0 });
        if (p.lvl >= 2) { shots.push({ x: p.x + 20, y: p.y - 10, vx: 900, vy: -60 }); shots.push({ x: p.x + 20, y: p.y + 10, vx: 900, vy: 60 }); }
        if (p.lvl >= 3) { shots.push({ x: p.x + 16, y: p.y - 14, vx: 860, vy: -200 }); shots.push({ x: p.x + 16, y: p.y + 14, vx: 860, vy: 200 }); }
      }
      if (I.hit('alt')) {
        if (shieldCd <= 0) { shield = 3; shieldCd = SHIELD_CD; api.sfx('shield'); }
        else api.say('Shield recharging… ' + Math.ceil(shieldCd) + 's', 1.2);
      }
      // wingman
      wing.x = U.lerp(wing.x, p.x - 34, dt * 5); wing.y = U.lerp(wing.y, p.y - 62, dt * 5);
      wing.cd -= dt;
      if (wing.cd <= 0) {
        let best = null, bd = 1e9;
        for (const f of foes) { const d = U.dist(wing.x, wing.y, f.x, f.y); if (f.x < W && d < bd) { bd = d; best = f; } }
        if (!best && boss && boss.x < W) best = boss;
        if (best) { const a = Math.atan2(best.y - wing.y, best.x - wing.x); shots.push({ x: wing.x, y: wing.y, vx: Math.cos(a) * 700, vy: Math.sin(a) * 700, w: true }); wing.cd = 0.38; api.sfx('zap'); }
      }
      // shots
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i]; s.x += s.vx * dt; s.y += s.vy * dt;
        let gone = s.x > W + 20 || s.y < -20 || s.y > H + 20 || s.x < -20;
        for (const f of foes) if (!gone && f.hp > 0 && U.dist(s.x, s.y, f.x, f.y) < f.r + 6) { f.hp--; gone = true; f.flash = 0.08; if (f.hp <= 0) kill(f); }
        if (!gone && boss && boss.hp > 0 && U.dist(s.x, s.y, boss.x, boss.y) < 62) {
          gone = true; boss.hp--; boss.hit = 0.06; score += 10; if (Math.random() < 0.3) api.sfx('hit');
          if (boss.hp <= 0) { api.sfx('big'); burst(boss.x, boss.y, C.pink, 60, 500); burst(boss.x, boss.y, C.green, 60, 400); boss.dead = 0; eb.length = 0; }
        }
        if (gone) shots.splice(i, 1);
      }
      // foes
      for (let i = foes.length - 1; i >= 0; i--) {
        const f = foes[i]; f.t += dt; f.flash -= dt;
        if (f.type === 'drone') { f.x -= 190 * dt; f.y = f.y0 + Math.sin(f.t * 3) * 30; }
        else if (f.type === 'wave') { f.x -= 220 * dt; f.y = f.y0 + Math.sin(f.t * 4) * 90; }
        else if (f.type === 'diver') { f.x -= 150 * dt; f.y += U.clamp(p.y - f.y, -1, 1) * 110 * dt; }
        else if (f.type === 'pod') {
          if (f.t < 7) f.x = Math.max(760, f.x - 90 * dt); else f.x -= 120 * dt;
          f.cd -= dt;
          if (f.cd <= 0 && f.x < W - 20) { f.cd = easy ? 2.4 : 1.5; fireAt(f.x - 20, f.y, p.x, p.y, BS, easy ? 1 : 3); }
        }
        if (f.hp > 0 && U.dist(f.x, f.y, p.x, p.y) < f.r + 10) { if (shield > 0) { f.hp = 0; kill(f); } else playerHit(); }
        if (shield > 0 && f.hp > 0 && U.dist(f.x, f.y, p.x, p.y) < f.r + 48) { f.hp = 0; kill(f); }
        if (f.hp <= 0 || f.x < -60) foes.splice(i, 1);
      }
      // boss
      if (boss) {
        const b = boss; b.t += dt; b.hit -= dt;
        if (b.hp > 0) {
          b.x = U.lerp(b.x, 780, dt * 1.2);
          b.y = H / 2 + Math.sin(b.t * 0.8) * 150;
          const rage = b.hp / b.max;
          b.a -= dt; b.b -= dt; b.c -= dt;
          if (b.a <= 0) { b.a = easy ? 1.8 : 1.3; fireAt(b.x - 50, b.y, p.x, p.y, BS, easy ? 3 : 5, 0.2); api.sfx('zap'); }
          if (rage < 0.6 && b.b <= 0) { b.b = easy ? 3.4 : 2.4; const k = easy ? 10 : 14; for (let i = 0; i < k; i++) { const a = i / k * Math.PI * 2 + b.t; eb.push({ x: b.x, y: b.y, vx: Math.cos(a) * BS * 0.8, vy: Math.sin(a) * BS * 0.8 }); } }
          if (rage < 0.3 && b.c <= 0) { b.c = 4.5; spawn('drone', W + 30, 120); spawn('drone', W + 30, 420); if (!b.saidRage) { b.saidRage = 1; api.say('It\'s cracking! A few more hits!', 2.5); } }
          if (U.dist(b.x, b.y, p.x, p.y) < 70) playerHit();
        } else {
          b.dead += dt;
          if (Math.random() < 0.4) burst(b.x + U.rand(-60, 60), b.y + U.rand(-60, 60), U.pick([C.pink, C.green, C.cyan]), 6, 200);
          if (b.dead > 1.6 && !ended) {
            ended = true;
            api.win(score + 5000 + p.lives * 1000 + (hitsTaken === 0 ? 3000 : 0));
          }
        }
      }
      // enemy bullets
      for (let i = eb.length - 1; i >= 0; i--) {
        const s = eb[i]; s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) { eb.splice(i, 1); continue; }
        if (shield > 0 && U.dist(s.x, s.y, p.x, p.y) < 50) { eb.splice(i, 1); burst(s.x, s.y, C.green, 3, 100); continue; }
        if (U.dist(s.x, s.y, p.x, p.y) < 9) { eb.splice(i, 1); playerHit(); }
      }
      // items
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i]; it.x -= 80 * dt; it.y += Math.sin(t * 3 + i) * 20 * dt;
        if (U.dist(it.x, it.y, p.x, p.y) < 30) {
          items.splice(i, 1); api.sfx('power');
          if (it.k === 'P') { p.lvl = Math.min(3, p.lvl + 1); api.say(p.lvl === 3 ? 'Max power! Triple spread!' : 'Power up! Double shot!', 2); }
          else { p.lives = Math.min(easy ? 6 : 4, p.lives + 1); api.say('Extra ship!', 1.5); }
          score += 250;
        } else if (it.x < -20) items.splice(i, 1);
      }
      for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.life <= 0) fx.splice(i, 1); }
      for (const s of stars) { s.x -= s.v * dt; if (s.x < 0) { s.x = W; s.y = U.rand(0, 380); } }
    }

    function ship(g, x, y, tilt) {
      g.save(); g.translate(x, y); g.rotate(tilt * 0.15);
      g.fillStyle = C.cyan; g.globalAlpha = 0.6 + Math.random() * 0.4;
      g.beginPath(); g.moveTo(-22, -6); g.lineTo(-40 - Math.random() * 14, 0); g.lineTo(-22, 6); g.fill(); g.globalAlpha = 1;
      g.fillStyle = '#8a1f6e'; g.beginPath(); g.moveTo(-20, 0); g.lineTo(-8, -22); g.lineTo(4, -4); g.fill();
      g.fillStyle = '#b02a86'; g.beginPath(); g.moveTo(-20, 0); g.lineTo(-8, 22); g.lineTo(4, 4); g.fill();
      g.fillStyle = '#ff9bd6'; g.beginPath(); g.moveTo(-22, -7); g.lineTo(28, 0); g.lineTo(-22, 0); g.fill();
      g.fillStyle = C.hot; g.beginPath(); g.moveTo(-22, 7); g.lineTo(28, 0); g.lineTo(-22, 0); g.fill();
      g.fillStyle = C.green; g.beginPath(); g.moveTo(-4, -4); g.lineTo(12, 0); g.lineTo(-4, 4); g.fill();
      g.restore();
    }
    function foeDraw(g, f) {
      g.save(); g.translate(f.x, f.y);
      if (f.flash > 0) g.filter = 'brightness(3)';
      if (f.type === 'drone' || f.type === 'wave') {
        g.rotate(f.t * 4);
        g.fillStyle = f.type === 'wave' ? C.magenta : C.hot; g.beginPath(); g.moveTo(0, -16); g.lineTo(16, 0); g.lineTo(0, 16); g.lineTo(-16, 0); g.fill();
        g.fillStyle = C.lime; g.fillRect(-4, -4, 8, 8);
      } else if (f.type === 'diver') {
        g.fillStyle = '#ff8a3d'; g.beginPath(); g.moveTo(-22, 0); g.lineTo(14, -16); g.lineTo(6, 0); g.lineTo(14, 16); g.fill();
        g.fillStyle = C.gold; g.fillRect(-4, -3, 8, 6);
      } else {
        D.cube(g, 0, 0, 22, f.t * 1.5, f.t, { glowSize: 14, glowColor: C.green, colors: ['#39ff8f', '#138a52', '#a6ff4d', '#0d4a3a', '#5dffb0', '#2aa86a'], alpha: 0.95 });
        g.fillStyle = C.red; g.fillRect(-26, -4, 10, 8);
      }
      g.restore();
    }
    function draw(g) {
      D.sky(g, '#13c8f5', '#7a2cff', '#ff3fa8', 0, 400);
      for (const s of stars) { g.fillStyle = `rgba(255,255,255,${s.v / 400})`; g.fillRect(s.x, s.y, s.v / 40 + 1, 2); }
      g.fillStyle = 'rgba(60,8,90,0.6)';
      for (let i = -1; i < 14; i++) { const x = i * 80 - (scroll * 60) % 80; const hh = 40 + ((i + Math.floor(scroll * 60 / 80)) * 47 % 90 + 90) % 90; g.fillRect(x, 400 - hh, 56, hh); }
      D.gridFloor(g, 400, scroll * 2, 'rgba(255,79,184,0.5)', ['#2a0b4a', '#07020f']);
      if (flash > 0) { g.fillStyle = `rgba(255,64,87,${flash})`; g.fillRect(0, 0, W, H); }
      for (const it of items) {
        g.save(); g.shadowColor = it.k === 'P' ? C.green : C.pink; g.shadowBlur = 16;
        D.block(g, it.x - 14, it.y - 14, 28, 28, it.k === 'P' ? [C.green, '#0d4a3a'] : [C.pink, '#5d1452'], '#fff', 'rgba(0,0,0,0.4)', 6);
        g.restore(); D.text(g, it.k === 'P' ? 'P' : '♥', it.x + 1, it.y + 7, { size: 18, align: 'center' });
      }
      for (const f of foes) foeDraw(g, f);
      if (boss) {
        const b = boss;
        if (b.hp > 0 || b.dead < 1.2) {
          g.save(); g.translate(b.x, b.y);
          if (b.hit > 0) g.filter = 'brightness(2.2)';
          if (b.hp <= 0) g.globalAlpha = Math.max(0, 1 - b.dead / 1.2);
          for (let i = 0; i < 6; i++) { const a = b.t * 1.4 + i * Math.PI / 3; D.cube(g, Math.cos(a) * 92, Math.sin(a) * 92, 14, b.t * 2, b.t * 3 + i, { glowSize: 10, colors: ['#ff4fb8', '#ff2d95', '#d03cff', '#ff9bd6', '#ff4fb8', '#7d1a66'] }); }
          const faces = [[0, -70, -60, 0, '#ff9bd6'], [0, -70, 60, 0, '#ff4fb8'], [-60, 0, 0, 70, '#9b1f78'], [60, 0, 0, 70, '#5d0a4f']];
          for (const f of faces) { g.fillStyle = f[4]; g.beginPath(); g.moveTo(f[0], f[1]); g.lineTo(f[2], f[3]); g.lineTo(0, 0); g.fill(); }
          const pulse = 0.5 + 0.5 * Math.sin(b.t * 6);
          g.fillStyle = C.green; g.shadowColor = C.green; g.shadowBlur = 25;
          g.beginPath(); g.arc(0, 0, 16 + pulse * 6, 0, 7); g.fill();
          g.fillStyle = '#062a18'; g.fillRect(-10, -3, 20, 6);
          g.restore();
        }
        if (b.hp > 0) {
          D.text(g, 'THE CORRUPTOR', W / 2, 30, { size: 16, align: 'center', color: C.pink });
          g.fillStyle = 'rgba(10,5,24,0.8)'; g.fillRect(W / 2 - 200, 38, 400, 12);
          g.fillStyle = b.hp / b.max < 0.3 ? C.red : C.pink; g.fillRect(W / 2 - 200, 38, 400 * b.hp / b.max, 12);
        }
      }
      for (const s of shots) { g.fillStyle = s.w ? C.green : '#fff'; g.shadowColor = s.w ? C.green : C.pink; g.shadowBlur = 8; g.fillRect(s.x - 8, s.y - 2, 16, 4); }
      g.shadowBlur = 0;
      for (const s of eb) { g.fillStyle = C.red; g.beginPath(); g.arc(s.x, s.y, 6, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(s.x, s.y, 2.5, 0, 7); g.fill(); }
      D.lumi(g, wing.x, wing.y, t, 0.7, shield > 0 ? 'happy' : null);
      if (!(p.inv > 0 && Math.floor(t * 16) % 2)) ship(g, p.x, p.y, p.vy);
      if (shield > 0) {
        g.save(); g.globalAlpha = Math.min(1, shield) * (0.5 + 0.2 * Math.sin(t * 20));
        g.strokeStyle = C.green; g.lineWidth = 4; g.shadowColor = C.green; g.shadowBlur = 20;
        g.beginPath(); g.arc(p.x, p.y, 48, 0, 7); g.stroke();
        g.fillStyle = 'rgba(57,255,143,0.12)'; g.fill(); g.restore();
      }
      for (const f of fx) { g.globalAlpha = Math.max(0, f.life * 1.6); g.fillStyle = f.c; g.fillRect(f.x - 3, f.y - 3, 6, 6); }
      g.globalAlpha = 1;
      // HUD
      D.panel(g, 14, H - 64, 370, 52);
      D.text(g, 'SHIPS', 32, H - 31, { size: 14, color: C.pink });
      for (let i = 0; i < p.lives; i++) { g.save(); g.translate(122 + i * 30, H - 37); g.scale(0.55, 0.55); ship(g, 0, 0, 0); g.restore(); }
      D.text(g, 'PWR ' + p.lvl, 368, H - 31, { size: 14, align: 'right', color: C.green });
      D.panel(g, W - 300, H - 64, 286, 52, { edge: C.green });
      D.text(g, String(score), W - 30, H - 30, { size: 20, align: 'right', color: C.gold });
      const sr = shieldCd <= 0 ? 1 : 1 - shieldCd / SHIELD_CD;
      D.text(g, 'SHIELD', W - 282, H - 31, { size: 13, color: C.green });
      g.fillStyle = '#3a2b55'; g.fillRect(W - 222, H - 44, 90, 12);
      g.fillStyle = sr >= 1 ? C.green : '#6aa88a'; g.fillRect(W - 222, H - 44, 90 * sr, 12);
      if (warn > 0 && Math.sin(t * 12) > 0) D.text(g, '⚠ WARNING: BOSS SIGNAL ⚠', W / 2, H / 2 - 120, { size: 34, align: 'center', color: C.red, glow: C.red });
    }
    return { update, draw, _peek: () => ({ p, boss, foes, eb, t, ended }) };
  }
})();
