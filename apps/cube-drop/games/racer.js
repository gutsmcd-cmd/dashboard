/* Cube Drop — game 1: OVERCLOCK RUN (pseudo-3D lane racer). */
(function () {
  'use strict';
  const { W, H, COL: C, draw: D, util: U, input: I } = CD;

  CD.registerGame({
    id: 'racer',
    title: 'Overclock Run',
    genre: 'Racing',
    tagline: 'Three laps of data highway against four rival racers.',
    goal: d => (d === 'easy' ? 'Finish 3 laps in the top 3. (Easy: the car speeds up by itself.)' : 'Finish 3 laps in 1st place.'),
    controls: [['← → or A D', 'Steer'], ['↑ or W', 'Accelerate'], ['↓ or S', 'Brake'], ['Space', 'Lumi Turbo (limited charges)'], ['Esc', 'Pause']],
    helper: 'Lumi rides along with Turbo charges. Press Space for a big burst of speed.',
    music: 'race',
    create
  });

  function create(api) {
    const easy = api.easy;
    const SEG = 200, RW = 2000, CAMH = 1000, DEPTH = 1 / Math.tan(50 * Math.PI / 180), DRAW = 150, LAPS = 3;
    const MAX = SEG * 60, ACC = MAX / 4.2, BRAKE = MAX * 1.2, DECEL = MAX / 6, OFF_DECEL = MAX / 1.6, OFF_LIMIT = MAX / 3.2;
    const playerZ = CAMH * DEPTH;
    const segs = [];
    const lastY = () => (segs.length ? segs[segs.length - 1].p2.wy : 0);
    const eio = (a, b, t) => a + (b - a) * ((-Math.cos(t * Math.PI) / 2) + 0.5);
    function addSeg(curve, y) {
      const n = segs.length;
      segs.push({ i: n, curve, p1: { wx: 0, wy: lastY(), wz: n * SEG }, p2: { wx: 0, wy: y, wz: (n + 1) * SEG }, sprites: [], alt: Math.floor(n / 3) % 2, clip: 0 });
    }
    function road(enter, hold, leave, curve, height) {
      const sy = lastY(), ey = sy + height * SEG, tot = enter + hold + leave;
      for (let i = 0; i < enter; i++) addSeg(U.lerp(0, curve, Math.pow(i / enter, 2)), eio(sy, ey, i / tot));
      for (let i = 0; i < hold; i++) addSeg(curve, eio(sy, ey, (enter + i) / tot));
      for (let i = 0; i < leave; i++) addSeg(eio(curve, 0, i / leave), eio(sy, ey, (enter + hold + i) / tot));
    }
    road(30, 30, 30, 0, 0);
    road(40, 60, 40, 3, 20);
    road(30, 40, 30, 0, -20);
    road(40, 70, 40, -4, 0);
    road(50, 50, 50, 0, 40);
    road(40, 60, 40, 5, -40);
    road(30, 40, 30, -2, 0);
    road(40, 60, 40, -5, 20);
    road(30, 80, 30, 0, -20);
    road(40, 50, 40, 4, 0);
    road(30, 30, 30, 0, 0);
    road(40, 40, 40, -3, -lastY() / SEG);
    const N = segs.length, trackLen = N * SEG;
    const signs = ['KERNELPORT', 'OVERCLOCK', 'LUMI ♥ YOU', 'CACHE MARKET', 'PORT 80', 'NO ZEROES'];
    for (let i = 10; i < N; i += 7) segs[i].sprites.push({ t: 'pylon', o: (i % 14 ? 1.25 : -1.25), c: (i % 21 < 7 ? C.pink : C.green) });
    for (let i = 25; i < N; i += 45) segs[i].sprites.push({ t: 'sign', o: (i % 90 < 45 ? -1.9 : 1.9), text: signs[(i / 45 | 0) % signs.length] });
    for (let i = 5; i < N; i += 18) segs[i].sprites.push({ t: 'tower', o: (i % 36 < 18 ? 3.6 : -3.6) + U.rand(-0.6, 0.6), h: U.rand(2600, 5200), c: U.pick(['p', 'g', 'v']) });

    const RCOL = [['#3ff0ff', '#0a6c8a', 'AXL'], ['#b066ff', '#3d1590', 'VEKTOR'], ['#ffe066', '#9a6a00', 'BLIP'], ['#ff8a3d', '#8a2e00', 'NULLA']];
    const spd = easy ? [0.70, 0.74, 0.78, 0.82] : [0.85, 0.88, 0.91, 0.94];
    const rivals = RCOL.map((c, i) => ({ dist: playerZ + 400 + i * 450, offset: i % 2 ? 0.5 : -0.5, target: i % 2 ? 0.5 : -0.5, speed: MAX * spd[i], base: MAX * spd[i], body: c[0], trim: c[1], name: c[2], wander: U.rand(1, 3), done: false }));
    let travel = 0, speed = 0, px = 0, steer = 0, t = 0, startT = 2.6, raceT = 0, sky = 0, bumpCd = 0, offCd = 0, said = {}, finished = false;
    let turbo = easy ? 5 : 3, turboT = 0, finishedOrder = 0, lap = 1, shake = 0;
    const need = easy ? 3 : 1;
    api.say(easy ? 'Steer with ← →. The car speeds up by itself. Space = my Turbo!' : 'Hold ↑ to go, ← → to steer. Space = my Turbo!', 4.5);

    const segAt = z => segs[Math.floor(((z % trackLen) + trackLen) % trackLen / SEG) % N];
    const playerDist = () => travel + playerZ;
    const place = () => 1 + rivals.filter(r => r.dist > playerDist()).length;
    const ord = n => n + (['th', 'st', 'nd', 'rd'][n] || 'th');

    function update(dt) {
      t += dt; bumpCd -= dt; offCd -= dt; shake = Math.max(0, shake - dt * 4);
      if (startT > 0) {
        const before = Math.ceil(startT); startT -= dt;
        if (Math.ceil(startT) !== before) api.sfx(startT <= 0 ? 'go' : 'tick');
        return;
      }
      if (finished) return;
      raceT += dt;
      const pseg = segAt(playerDist());
      const pct = speed / MAX;
      const dx = dt * 2.2 * Math.max(0.25, pct);
      const left = I.down('left'), right = I.down('right');
      steer = U.lerp(steer, (right ? 1 : 0) - (left ? 1 : 0), Math.min(1, dt * 10));
      if (left) px -= dx; if (right) px += dx;
      px -= dx * pct * pseg.curve * 0.28;
      // turbo
      if (I.hit('fire') && turbo > 0 && turboT <= 0) { turbo--; turboT = 2.2; api.sfx('boost'); if (!said.turbo) { said.turbo = 1; api.say('Turbo! Hold on to your visor!', 2); } }
      turboT -= dt;
      const top = turboT > 0 ? MAX * 1.38 : MAX;
      const gas = I.down('up') || (easy && !I.down('down'));
      if (turboT > 0) speed += ACC * 2.5 * dt;
      else if (gas) speed += ACC * dt;
      else if (I.down('down')) speed -= BRAKE * dt;
      else speed -= DECEL * dt;
      if (Math.abs(px) > 1 && speed > OFF_LIMIT) {
        speed -= OFF_DECEL * dt; shake = 0.4;
        if (offCd < 0) { offCd = 6; api.say('Off the road slows you down. Steer back to the middle!', 2.5); }
      }
      speed = U.clamp(speed, 0, top + (speed > top ? (speed - top) * 0.9 : 0));
      if (speed > top) speed = Math.max(top, speed - MAX * dt);
      px = U.clamp(px, -2.2, 2.2);
      travel += speed * dt;
      // rivals
      for (const r of rivals) {
        r.wander -= dt;
        if (r.wander < 0) { r.wander = U.rand(2, 4.5); r.target = U.pick([-0.6, 0, 0.6]); }
        r.offset += U.clamp(r.target - r.offset, -0.5 * dt, 0.5 * dt);
        const rs = segAt(r.dist);
        r.speed = U.lerp(r.speed, r.base * (1 - Math.min(0.08, Math.abs(rs.curve) * 0.012)), dt);
        // avoid the player from behind
        const d = r.dist - playerDist();
        if (d < 0 && d > -SEG * 3 && Math.abs(r.offset - px) < 0.5) { r.target = px > 0 ? -0.6 : 0.6; if (d > -SEG) r.speed = Math.min(r.speed, speed * 0.95); }
        r.dist += r.speed * dt;
        if (!r.done && r.dist >= LAPS * trackLen + playerZ) { r.done = true; finishedOrder++; }
        // collision: player hits a rival from behind
        if (d > 0 && d < SEG * 1.1 && Math.abs(r.offset - px) < 0.42 && speed > r.speed && bumpCd < 0) {
          speed = r.speed * 0.78; bumpCd = 0.5; shake = 1; api.sfx('bump');
          if (!said.bump) { said.bump = 1; api.say('Bump! Steer around them to pass.', 2.5); }
        }
      }
      sky += pseg.curve * pct * dt * 0.02;
      const nl = Math.min(LAPS, Math.floor(travel / trackLen) + 1);
      if (nl !== lap) {
        lap = nl; api.sfx('power');
        api.say(lap === LAPS ? 'Final lap! Save a Turbo for the straights.' : 'Lap ' + lap + '! You\'re ' + ord(place()) + '.', 3);
      }
      if (travel >= LAPS * trackLen) {
        finished = true;
        const p = 1 + finishedOrder;
        if (p <= need) {
          const score = [0, 6000, 4000, 2500][p] + Math.max(0, Math.round((130 - raceT) * 40)) + turbo * 300;
          api.win(score);
        } else api.lose('You finished ' + ord(p) + '. ' + (need === 1 ? 'You need 1st place.' : 'You need top 3.'));
      }
    }

    function quad(g, x1, y1, x2, y2, x3, y3, x4, y4, c) {
      g.fillStyle = c; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.lineTo(x4, y4); g.closePath(); g.fill();
    }
    function project(p, cx, cy, cz) {
      p.camz = p.wz - cz;
      p.scale = DEPTH / p.camz;
      p.sx = W / 2 + p.scale * (p.wx - cx) * W / 2;
      p.sy = H / 2 - p.scale * (p.wy - cy) * H / 2;
      p.sw = p.scale * RW * W / 2;
    }
    function drawCar(g, x, y, w, body, trim, st, glow) {
      const h = w * 0.46;
      g.save(); g.translate(x, y);
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(0, -h * 0.05, w * 0.55, h * 0.13, 0, 0, 7); g.fill();
      if (glow) { g.save(); g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 30); g.fillStyle = glow; g.shadowColor = glow; g.shadowBlur = 20; g.fillRect(-w * 0.38, -h * 0.14, w * 0.76, h * 0.07); g.restore(); }
      g.fillStyle = '#15082a'; g.fillRect(-w * 0.5, -h * 0.34, w * 0.15, h * 0.28); g.fillRect(w * 0.35, -h * 0.34, w * 0.15, h * 0.28);
      const bg = g.createLinearGradient(0, -h * 0.62, 0, -h * 0.12);
      bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.25, body); bg.addColorStop(1, trim);
      g.fillStyle = bg;
      g.beginPath(); g.moveTo(-w / 2, -h * 0.16); g.lineTo(w / 2, -h * 0.16); g.lineTo(w * 0.42, -h * 0.58); g.lineTo(-w * 0.42, -h * 0.58); g.closePath(); g.fill();
      const cg = g.createLinearGradient(0, -h, 0, -h * 0.58);
      cg.addColorStop(0, '#b9fff0'); cg.addColorStop(1, '#0a3a40');
      g.fillStyle = cg;
      g.beginPath(); g.moveTo(-w * 0.28, -h * 0.58); g.lineTo(w * 0.28, -h * 0.58); g.lineTo(w * 0.18 + st * w * 0.05, -h * 0.92); g.lineTo(-w * 0.18 + st * w * 0.05, -h * 0.92); g.closePath(); g.fill();
      g.fillStyle = trim; g.fillRect(-w * 0.5, -h * 0.7, w, h * 0.09);
      g.fillRect(-w * 0.46, -h * 0.7, w * 0.05, h * 0.2); g.fillRect(w * 0.41, -h * 0.7, w * 0.05, h * 0.2);
      g.fillStyle = '#ff2050'; g.fillRect(-w * 0.43, -h * 0.44, w * 0.2, h * 0.09); g.fillRect(w * 0.23, -h * 0.44, w * 0.2, h * 0.09);
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-w * 0.4, -h * 0.57, w * 0.8, h * 0.04);
      g.restore();
    }
    function drawSprite(g, s, x, y, sc, clip) {
      const k = sc * W / 2;
      g.save(); g.beginPath(); g.rect(0, 0, W, clip); g.clip();
      if (s.t === 'pylon') {
        const w = 160 * k, h = 1100 * k;
        g.shadowColor = s.c; g.shadowBlur = 12;
        g.fillStyle = s.c; g.fillRect(x - w / 2, y - h, w, h);
        g.fillStyle = '#fff'; g.fillRect(x - w / 2, y - h, w, h * 0.08);
      } else if (s.t === 'sign') {
        const w = 1500 * k, h = 650 * k;
        g.fillStyle = '#2a0b4a'; g.fillRect(x - w * 0.04, y - h * 1.7, w * 0.08, h * 1.7);
        D.block(g, x - w / 2, y - h * 1.7 - h, w, h, ['#ff4fb8', '#5d1452'], '#ffc2e8', '#8a1f6e', Math.max(1, 70 * k));
        if (w > 60) D.text(g, s.text, x, y - h * 1.7 - h * 0.35, { size: Math.max(8, h * 0.38), align: 'center', color: C.green, stroke: '#1a0533' });
      } else if (s.t === 'tower') {
        const w = 1300 * k, h = s.h * k;
        const f = s.c === 'p' ? ['#ff7ccc', '#3b0d35'] : s.c === 'g' ? ['#5dffb0', '#063026'] : ['#b48cff', '#22094a'];
        D.block(g, x - w / 2, y - h, w, h, f, '#ffffff', 'rgba(0,0,0,0.5)', Math.max(1, 120 * k));
        if (w > 20) { g.fillStyle = 'rgba(255,255,255,0.55)'; for (let yy = y - h + w * 0.2; yy < y - w * 0.2; yy += w * 0.35) g.fillRect(x - w * 0.3, yy, w * 0.6, Math.max(1, w * 0.06)); }
      }
      g.restore();
    }

    function draw(g) {
      g.save();
      if (shake > 0) g.translate(U.rand(-3, 3) * shake, U.rand(-2, 2) * shake);
      // sky
      D.sky(g, '#18d4ff', '#9b3cff', '#ff4fb8', 0, H / 2 + 20);
      const so = ((sky * 600) % W + W) % W;
      D.cube(g, ((W * 0.7 - so * 0.3) % W + W) % W, 70, 30, t * 0.4, t * 0.6, { glowSize: 20, alpha: 0.6 });
      g.fillStyle = 'rgba(70,10,100,0.7)';
      for (let i = -1; i < 12; i++) { const x = ((i * 97 - so) % (W + 100) + W + 100) % (W + 100) - 50; const hh = 30 + ((i * 53) % 70); g.fillRect(x, H / 2 + 10 - hh, 60, hh + 20); }
      g.fillStyle = 'rgba(255,79,184,0.5)';
      for (let i = -1; i < 16; i++) { const x = ((i * 71 - so * 1.6) % (W + 100) + W + 100) % (W + 100) - 50; const hh = 14 + ((i * 37) % 40); g.fillRect(x, H / 2 + 14 - hh, 40, hh + 20); }
      // road
      const pos = travel % trackLen;
      const base = segAt(pos), bpct = (pos % SEG) / SEG;
      const pseg = segAt(pos + playerZ), ppct = ((pos + playerZ) % SEG) / SEG;
      const py = U.lerp(pseg.p1.wy, pseg.p2.wy, ppct);
      let maxy = H, x = 0, dx = -(base.curve * bpct);
      g.fillStyle = '#12052a'; g.fillRect(0, H / 2, W, H / 2);
      for (let n = 0; n < DRAW; n++) {
        const s = segs[(base.i + n) % N];
        const looped = s.i < base.i;
        const cz = pos - (looped ? trackLen : 0);
        project(s.p1, px * RW - x, py + CAMH, cz);
        project(s.p2, px * RW - x - dx, py + CAMH, cz);
        x += dx; dx += s.curve;
        s.clip = maxy;
        const p1 = s.p1, p2 = s.p2;
        if (p1.camz <= DEPTH || p2.sy >= p1.sy || p2.sy >= maxy) continue;
        const fog = Math.min(1, n / DRAW);
        g.fillStyle = s.alt ? '#0c3a2a' : '#2a0b48'; g.fillRect(0, p2.sy, W, p1.sy - p2.sy + 1);
        const r1 = p1.sw / 7, r2 = p2.sw / 7;
        const rc = s.alt ? C.pink : C.green;
        quad(g, p1.sx - p1.sw - r1, p1.sy, p1.sx - p1.sw, p1.sy, p2.sx - p2.sw, p2.sy, p2.sx - p2.sw - r2, p2.sy, rc);
        quad(g, p1.sx + p1.sw + r1, p1.sy, p1.sx + p1.sw, p1.sy, p2.sx + p2.sw, p2.sy, p2.sx + p2.sw + r2, p2.sy, rc);
        const start = s.i < 3;
        quad(g, p1.sx - p1.sw, p1.sy, p1.sx + p1.sw, p1.sy, p2.sx + p2.sw, p2.sy, p2.sx - p2.sw, p2.sy, start ? '#ffffff' : s.alt ? '#3b1873' : '#331463');
        if (s.alt && !start) {
          const l1 = p1.sw / 30, l2 = p2.sw / 30;
          for (const k of [-1 / 3, 1 / 3]) {
            quad(g, p1.sx + p1.sw * k * 2 - l1, p1.sy, p1.sx + p1.sw * k * 2 + l1, p1.sy, p2.sx + p2.sw * k * 2 + l2, p2.sy, p2.sx + p2.sw * k * 2 - l2, p2.sy, C.cyan);
          }
        }
        if (fog > 0.5) { g.fillStyle = `rgba(155,60,255,${(fog - 0.5) * 0.9})`; g.fillRect(0, p2.sy, W, p1.sy - p2.sy + 1); }
        maxy = p1.sy;
      }
      // sprites & rivals, far to near
      const bySeg = {};
      for (const r of rivals) { const si = segAt(r.dist).i; (bySeg[si] = bySeg[si] || []).push(r); }
      for (let n = DRAW - 1; n > 0; n--) {
        const s = segs[(base.i + n) % N];
        if (s.p1.camz <= DEPTH) continue;
        for (const sp of s.sprites) drawSprite(g, sp, s.p1.sx + s.p1.scale * sp.o * RW * W / 2, s.p1.sy, s.p1.scale, s.clip);
        const rs = bySeg[s.i];
        if (rs) for (const r of rs) {
          const pc = ((r.dist % trackLen) % SEG) / SEG;
          const sc = U.lerp(s.p1.scale, s.p2.scale, pc);
          const sx = U.lerp(s.p1.sx, s.p2.sx, pc) + sc * r.offset * RW * W / 2;
          const sy = U.lerp(s.p1.sy, s.p2.sy, pc);
          const w = sc * 620 * W / 2;
          if (sy - w > s.clip) continue;
          g.save(); g.beginPath(); g.rect(0, 0, W, s.clip); g.clip();
          drawCar(g, sx, sy, w, r.body, r.trim, 0);
          if (w > 50) D.text(g, r.name, sx, sy - w * 0.55, { size: Math.min(16, w * 0.12), align: 'center', color: r.body });
          g.restore();
        }
      }
      // player car + Lumi
      const bounce = speed > 0 ? Math.sin(t * 40) * 1.5 * (speed / MAX) : 0;
      drawCar(g, W / 2, H - 18 + bounce, 190, C.pink, '#7a0f5a', steer, turboT > 0 ? C.green : C.cyan);
      D.lumi(g, W / 2 + 120 + steer * 10, H - 120 + Math.sin(t * 3) * 6, t, 0.8, turboT > 0 ? 'happy' : null);
      if (turboT > 0) {
        g.save(); g.strokeStyle = 'rgba(57,255,143,0.6)'; g.lineWidth = 2;
        for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + t; const r0 = 160 + ((t * 900 + i * 50) % 300); g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0 * 0.6); g.lineTo(W / 2 + Math.cos(a) * (r0 + 60), H / 2 + Math.sin(a) * (r0 + 60) * 0.6); g.stroke(); }
        g.restore();
      }
      g.restore();
      // HUD
      D.panel(g, 14, 12, 250, 92);
      D.text(g, 'LAP ' + Math.min(LAPS, lap) + ' / ' + LAPS, 32, 44, { size: 22, color: C.green });
      const p = finished ? 1 + finishedOrder : place();
      D.text(g, ord(p) + ' / 5', 32, 80, { size: 30, color: p <= need ? C.gold : C.pink });
      D.text(g, Math.round(speed / MAX * 300) + ' km/h', 248, 80, { size: 18, align: 'right' });
      D.text(g, raceT.toFixed(1) + 's', 248, 44, { size: 16, align: 'right', color: '#d9c8ff' });
      D.panel(g, W - 214, 12, 200, 60, { edge: C.green });
      D.text(g, 'TURBO', W - 196, 48, { size: 16, color: C.green });
      for (let i = 0; i < (easy ? 5 : 3); i++) { g.fillStyle = i < turbo ? C.green : '#3a2b55'; g.fillRect(W - 120 + i * 20, 32, 14, 22); }
      // progress strip
      const bx = 300, bw = 360;
      g.fillStyle = 'rgba(10,5,24,0.7)'; g.fillRect(bx, 20, bw, 10);
      const tot = LAPS * trackLen;
      for (const r of rivals) { g.fillStyle = r.body; g.fillRect(bx + U.clamp((r.dist - playerZ) / tot, 0, 1) * bw - 3, 16, 6, 18); }
      g.fillStyle = C.pink; g.fillRect(bx + U.clamp(travel / tot, 0, 1) * bw - 4, 13, 8, 24);
      D.text(g, 'FINISH', bx + bw + 8, 30, { size: 12, color: '#fff' });
      if (startT > 0) {
        const n = Math.ceil(startT);
        D.bigText(g, String(n), W / 2, H / 2 - 60, 120, C.pink, '#7a0f5a', 8);
      } else if (raceT < 0.8) D.bigText(g, 'GO!', W / 2, H / 2 - 60, 120, C.green, '#1a7a4a', 8);
    }
    return { update, draw, _peek: () => ({ travel, trackLen, place: place(), lap, speed, px, rivals, playerZ, raceT, finished }) };
  }
})();
