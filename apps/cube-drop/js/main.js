/* Cube Drop — framework: title, hub, cube drop, intro cards, pause, results, save. */
(function () {
  'use strict';
  const { W, H, COL: C, draw: D, util: U, input: I, audio: A } = CD;
  const canvas = document.getElementById('screen');
  const g = canvas.getContext('2d');

  /* ---------- save ---------- */
  const KEY = 'cubedrop:v1';
  const DEF = () => ({ cleared: {}, best: {}, bank: 0, dark: [], diff: 'easy', muted: false, plays: 0, wins: 0, coreBest: 0, seenHelp: false });
  let save = DEF();
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) save = Object.assign(DEF(), s); } catch (e) { }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { } };
  A.setMuted(!!save.muted);
  CD.save = () => save;

  /* ---------- screen scaling ---------- */
  function fit() {
    const port = CD.touch && innerHeight > innerWidth;
    document.body.classList.toggle('portrait', !!port);
    const availH = port ? innerHeight * 0.5 : innerHeight;
    const s = Math.min(innerWidth / W, availH / H);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = Math.floor(W * s) + 'px';
    canvas.style.height = Math.floor(H * s) + 'px';
    canvas.width = Math.floor(W * s * dpr); canvas.height = Math.floor(H * s * dpr);
    CD.pxScale = s * dpr;
  }
  CD.refit = fit;
  addEventListener('resize', fit); fit();
  function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) (document.documentElement.requestFullscreen || function () { }).call(document.documentElement);
      else document.exitFullscreen();
    } catch (e) { }
  }

  /* ---------- state ---------- */
  let state = 'title', T = 0, st = 0; // st = time in state
  let game = null, gameDef = null, api = null, pauseSel = 0, hubSel = 0, pickSel = 0;
  let bubble = null, banner = null, result = null, drop = null, resetArm = 0, toast = null;
  const go = s => { state = s; st = 0; I.reset(); hits = []; };
  let hits = [], helpSel = 0, core = null, confetti = [], shake = 0, newBest = false, unlockedNow = null;
  CD.state = () => state;
  // Progression: two cubes open at the start; each win opens the next. All five open the Kernel Core Run.
  const ORDER = ['racer', 'platformer', 'shooter', 'fighter', 'catch'];
  CD.games.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const nCleared = () => CD.games.filter(gm => save.cleared[gm.id]).length;
  const isOpen = gm => { const i = CD.games.indexOf(gm); return i < 2 || nCleared() >= i - 1 || !!save.cleared[gm.id]; };
  const needFor = gm => Math.max(0, CD.games.indexOf(gm) - 1);
  const coreOpen = () => nCleared() >= CD.games.length;
  const medal = gm => { const b = save.best[gm.id] || 0; if (!save.cleared[gm.id]) return 0; const m = gm.medals || [0, 1e9, 1e9]; return b >= m[2] ? 3 : b >= m[1] ? 2 : 1; };
  const MEDAL_COL = ['#4a3a66', '#d98b4a', '#dfe6ff', '#ffe066'], MEDAL_NAME = ['', 'BRONZE', 'SILVER', 'GOLD'];
  const medalsTotal = () => CD.games.reduce((a, gm) => a + medal(gm), 0);
  function drawMedal(x, y, m, r) {
    r = r || 9; g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = MEDAL_COL[m]; if (m) { g.shadowColor = MEDAL_COL[m]; g.shadowBlur = 10; } g.fill();
    g.shadowBlur = 0; g.lineWidth = 2; g.strokeStyle = m ? '#fff' : '#6d5f86'; g.stroke(); g.restore();
  }
  const uncleared = () => CD.games.filter(gm => !save.cleared[gm.id]);
  const clearedList = () => CD.games.filter(gm => save.cleared[gm.id]);

  function startDrop(def) {
    drop = { def, reel: 0, names: CD.games.map(x => x.title) };
    A.sfx('hum');
    A.music('hub');
    go('drop');
  }
  function openIntro(def) { gameDef = def; go('intro'); A.music(def.music || 'hub'); }
  function startGame() {
    bubble = null; banner = null;
    api = {
      diff: save.diff, easy: save.diff === 'easy',
      win: score => endGame(true, Math.max(0, Math.round(score || 0))),
      lose: reason => endGame(false, 0, reason),
      say: (text, secs) => { if (CD.touch) text = String(text).replace(/Space/g, 'A').replace(/Shift\/X/g, 'B').replace(/\bC\b/g, 'C'); bubble = { text, t: secs || 3.5, max: secs || 3.5 }; },
      sfx: n => { A.sfx(n); const k = { explode: 0.35, big: 1, hurt: 0.7, bump: 0.4, punch: 0.3 }[n]; if (k) shake = Math.max(shake, k); if (n === 'hurt' && navigator.vibrate) try { navigator.vibrate(60); } catch (e) { } },
      music: n => A.music(n)
    };
    game = gameDef.create(api);
    save.plays++; persist();
    go('play');
  }
  function endGame(won, score, reason) {
    if (state !== 'play') return;
    banner = { won, score, reason };
    A.stopMusic();
    A.sfx(won ? 'win' : 'lose');
    newBest = false; unlockedNow = null;
    if (won) {
      const before = CD.games.filter(isOpen).length, coreBefore = coreOpen();
      newBest = score > (save.best[gameDef.id] || 0) && !!save.cleared[gameDef.id];
      save.cleared[gameDef.id] = true; save.wins++;
      save.bank += score;
      save.best[gameDef.id] = Math.max(save.best[gameDef.id] || 0, score);
      const opened = CD.games.filter(isOpen);
      if (opened.length > before) unlockedNow = opened[opened.length - 1].title;
      else if (coreOpen() && !coreBefore) unlockedNow = 'the KERNEL CORE RUN';
      if (core) { core.total += score; core.i++; }
      for (let i = 0; i < 120; i++) confetti.push({ x: W / 2 + U.rand(-60, 60), y: H / 2, vx: U.rand(-420, 420), vy: U.rand(-620, -150), r: Math.random() * 6, vr: U.rand(-8, 8), c: U.pick([C.pink, C.green, C.gold, C.cyan, '#fff']), t: U.rand(1.5, 2.6) });
      const restored = save.dark.length ? save.dark.shift() : null;
      result = { won, score, sector: restored };
    } else {
      const lit = [0, 1, 2, 3, 4, 5].filter(s => !save.dark.includes(s));
      const sector = lit.length ? U.pick(lit) : null;
      if (sector != null) save.dark.push(sector);
      result = { won, score, sector, reason };
    }
    persist();
    go('end');
  }
  CD.onBlur = () => { if (state === 'play') { go('pause'); pauseSel = 0; } };

  /* ---------- hub menu ---------- */
  function hubItems() {
    const n = clearedList().length;
    void n;
    const next = CD.games.find(gm => isOpen(gm) && !save.cleared[gm.id]);
    return [
      { label: next ? 'PLAY NEXT CUBE: ' + next.title.toUpperCase() : 'DROP A RANDOM CUBE', act: 'drop' },
      { label: 'CHOOSE A CUBE (' + CD.games.filter(isOpen).length + ' / ' + CD.games.length + ' OPEN)', act: 'pick' },
      { label: coreOpen() ? 'KERNEL CORE RUN (ALL 5 IN A ROW)' : 'KERNEL CORE RUN  · beat all 5', act: 'core', off: !coreOpen() },
      { label: 'HOW TO PLAY', act: 'help' },
      { label: 'DIFFICULTY: ' + (save.diff === 'easy' ? 'EASY' : 'NORMAL'), act: 'diff' },
      { label: 'SOUND: ' + (save.muted ? 'OFF' : 'ON') + '   (M)', act: 'mute' },
      { label: resetArm > 0 ? 'PRESS AGAIN TO ERASE SAVE' : 'RESET SAVE', act: 'reset', warn: resetArm > 0 }
    ];
  }
  function hubAct(it) {
    if (it.off) { A.sfx('back'); return; }
    A.sfx('confirm');
    if (it.act === 'drop') { core = null; const next = CD.games.find(gm => isOpen(gm) && !save.cleared[gm.id]); startDrop(next || U.pick(CD.games)); }
    if (it.act === 'core') { core = { i: 0, total: 0 }; startDrop(CD.games[0]); }
    if (it.act === 'help') { helpSel = 0; go('help'); }
    if (it.act === 'pick') { pickSel = 0; go('pick'); }
    if (it.act === 'diff') { save.diff = save.diff === 'easy' ? 'normal' : 'easy'; persist(); }
    if (it.act === 'mute') toggleMute();
    if (it.act === 'reset') {
      if (resetArm > 0) { const d = save.diff; save = DEF(); save.diff = d; persist(); resetArm = 0; toast = { text: 'Save erased. Fresh city.', t: 2.5 }; }
      else resetArm = 3;
    }
  }
  function toggleMute() { save.muted = !save.muted; A.setMuted(save.muted); persist(); toast = { text: save.muted ? 'Sound off' : 'Sound on', t: 1.5 }; }

  function menuList(items, sel, x, y, w) {
    items.forEach((it, i) => {
      const yy = y + i * 40, on = i === sel;
      hits.push({ x: x - 10, y: yy - 26, w, h: 36, i });
      if (on) {
        g.save(); D.roundRect(g, x - 10, yy - 26, w, 36, 8);
        const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(255,79,184,0.55)'); gr.addColorStop(1, 'rgba(57,255,143,0.25)');
        g.fillStyle = gr; g.fill(); g.restore();
      }
      D.text(g, (on ? '▶ ' : '   ') + it.label, x, yy, { size: 19, color: it.off ? '#6d5f86' : it.warn ? C.red : on ? '#fff' : '#d9c8ff' });
    });
  }
  function menuNav(sel, n) {
    if (I.hit('up')) { A.sfx('move'); sel = (sel + n - 1) % n; }
    if (I.hit('down')) { A.sfx('move'); sel = (sel + 1) % n; }
    return sel;
  }

  /* ---------- update ---------- */
  function update(dt) {
    T += dt; st += dt;
    if (I.hit('KeyF')) toggleFullscreen();
    if (I.hit('KeyM') && state !== 'play') toggleMute();
    shake = Math.max(0, shake - dt * 3);
    for (let i = confetti.length - 1; i >= 0; i--) { const q = confetti[i]; q.t -= dt; q.vy += 700 * dt; q.vx *= 0.99; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; if (q.t <= 0) confetti.splice(i, 1); }
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
    if (resetArm > 0) resetArm -= dt;
    switch (state) {
      case 'title':
        if (st > 0.3 && (I.confirm() || I.hit('tap'))) { A.unlock(); A.sfx('confirm'); A.music('hub'); if (!save.seenHelp) { save.seenHelp = true; persist(); helpSel = 0; go('help'); } else go('hub'); }
        break;
      case 'hub': {
        A.music('hub');
        const items = hubItems();
        hubSel = menuNav(hubSel, items.length);
        if (I.confirm() || I.hit('tap')) hubAct(items[hubSel]);
        if (I.hit('esc')) { A.sfx('back'); go('title'); }
        break;
      }
      case 'pick': {
        const list = CD.games;
        pickSel = menuNav(pickSel, list.length);
        if (I.confirm() || I.hit('tap')) {
          if (isOpen(list[pickSel])) { A.sfx('confirm'); core = null; startDrop(list[pickSel]); }
          else { A.sfx('back'); toast = { text: 'Beat ' + needFor(list[pickSel]) + ' cubes to open this one', t: 2 }; }
        }
        if (I.hit('esc')) { A.sfx('back'); go('hub'); }
        break;
      }
      case 'help':
        if (I.hit('left')) { helpSel = (helpSel + 2) % 3; A.sfx('move'); }
        if (I.hit('right') || (I.hit('tap') && st > 0.2)) { helpSel = (helpSel + 1) % 3; A.sfx('move'); }
        if ((I.confirm() && st > 0.25) || I.hit('esc')) { A.sfx('confirm'); go('hub'); }
        break;
      case 'drop': {
        const prevStep = Math.floor((st - dt - 2.4) / 0.9), step = Math.floor((st - 2.4) / 0.9);
        if (st - dt < 2.0 && st >= 2.0) A.sfx('land');
        if (st >= 2.4 && step !== prevStep && step < 3) A.sfx('tick');
        if (st >= 2.4 + 2.7 && st - dt < 2.4 + 2.7) A.sfx('go');
        if (st > 2.4 + 3.4) openIntro(drop.def);
        if ((I.hit('esc') || I.hit('tap') || I.confirm()) && st > 0.3 && st < 5.4) openIntro(drop.def);
        break;
      }
      case 'intro':
        if (st > 0.25 && (I.confirm() || I.hit('tap'))) { A.sfx('confirm'); startGame(); }
        if (I.hit('esc')) { A.sfx('back'); A.music('hub'); core = null; go('hub'); }
        break;
      case 'play':
        if (I.hit('esc')) { A.sfx('select'); pauseSel = 0; go('pause'); break; }
        if (I.hit('KeyM')) toggleMute();
        if (CD.autopilot) { const a = game.ai ? game.ai() : (CD.aiFor && CD.aiFor[gameDef.id] ? CD.aiFor[gameDef.id](game._peek ? game._peek() : {}) : {}); ['left', 'right', 'up', 'down', 'fire', 'alt', 'KeyC'].forEach(k => a[k] ? I.vdown(k) : I.vup(k)); }
        game.update(Math.min(dt, 1 / 30));
        if (bubble) { bubble.t -= dt; if (bubble.t <= 0) bubble = null; }
        break;
      case 'pause': {
        pauseSel = menuNav(pauseSel, 4);
        if (I.hit('esc')) { go('play'); break; }
        if (I.confirm() || I.hit('tap')) {
          A.sfx('confirm');
          if (pauseSel === 0) go('play');
          else if (pauseSel === 1) { A.music(gameDef.music || 'hub', true); startGame(); }
          else if (pauseSel === 2) toggleMute();
          else { A.music('hub'); core = null; go('hub'); }
        }
        break;
      }
      case 'end':
        if (st > 2.4 || (st > 0.8 && (I.confirm() || I.hit('tap')))) { A.music(result.won ? 'win' : 'hub'); go('result'); }
        break;
      case 'result':
        if (st > 0.6) {
          const ok = I.confirm() || I.hit('tap');
          if (result.won && ok && core) {
            A.sfx('confirm');
            if (core.i >= CD.games.length) { save.coreBest = Math.max(save.coreBest || 0, core.total); persist(); toast = { text: 'KERNEL CORE CLEARED! ' + core.total.toLocaleString(), t: 4 }; core = null; A.music('hub'); go('hub'); }
            else startDrop(CD.games[core.i]);
          } else if (result.won && ok) { A.sfx('confirm'); A.music('hub'); go('hub'); }
          if (!result.won && ok) { A.sfx('confirm'); A.music(gameDef.music || 'hub', true); startGame(); }
          if (!result.won && I.hit('esc')) { A.sfx('back'); A.music('hub'); core = null; go('hub'); }
          if (result.won && I.hit('esc')) { A.music('hub'); core = null; go('hub'); }
        }
        break;
    }
    I.endFrame();
  }

  /* ---------- render ---------- */
  function frame(g) {
    switch (state) {
      case 'title': drawTitle(); break;
      case 'hub': drawHub(); break;
      case 'pick': drawPick(); break;
      case 'drop': drawDrop(); break;
      case 'intro': drawIntro(); break;
      case 'play': g.save(); if (shake > 0) g.translate(U.rand(-10, 10) * shake, U.rand(-10, 10) * shake); game.draw(g); g.restore(); drawBubble(); if (core) D.text(g, 'CORE RUN ' + (core.i + 1) + ' / ' + CD.games.length, W / 2, H - 10, { size: 13, align: 'center', color: C.green }); break;
      case 'help': drawHelp(); break;
      case 'pause': game.draw(g); drawPause(); break;
      case 'end': game.draw(g); drawBanner(); break;
      case 'result': drawResult(); break;
    }
    for (const q of confetti) { g.save(); g.globalAlpha = U.clamp(q.t, 0, 1); g.translate(q.x, q.y); g.rotate(q.r); g.fillStyle = q.c; g.fillRect(-5, -3, 10, 6); g.restore(); }
    g.drawImage(overlay, 0, 0, W, H);
    if (toast) {
      g.save(); g.globalAlpha = Math.min(1, toast.t * 2);
      D.panel(g, W / 2 - 160, 14, 320, 44); D.text(g, toast.text, W / 2, 43, { size: 18, align: 'center' }); g.restore();
    }
  }
  function drawTitle() {
    CD.city.draw(g, T, { dark: save.dark, labels: false });
    g.fillStyle = 'rgba(10,4,24,0.35)'; g.fillRect(0, 0, W, H);
    D.cube(g, W / 2, 150 + Math.sin(T) * 8, 62, T * 0.7, T * 1.1, { glowSize: 40 });
    D.bigText(g, 'CUBE DROP', W / 2, 290, 96, C.pink, '#9b2cff', 10);
    D.text(g, 'GAMES FALL FROM THE SKY OVER KERNELPORT. BEAT THEM OR GET ZEROED.', W / 2, 352, { size: 18, align: 'center', color: C.green });
    if (Math.sin(T * 5) > -0.3) D.text(g, CD.touch ? 'TAP TO START' : 'PRESS ENTER  ·  OR CLICK', W / 2, 420, { size: 30, align: 'center', color: '#fff', glow: C.pink });
    D.text(g, 'v1.0  ·  keyboard, touch or gamepad  ·  F fullscreen  ·  M sound', W / 2, 505, { size: 14, align: 'center', color: '#e6d6ff' });
    D.lumi(g, 780, 420, T, 1.6, 'happy');
  }
  function drawHub() {
    CD.city.draw(g, T, { dark: save.dark });
    // idle cube hint high in sky
    D.cube(g, 770, 70 + Math.sin(T * 1.4) * 6, 26, T * 0.5, T * 0.8, { glowSize: 18, alpha: 0.7 });
    D.panel(g, 22, 20, 430, 342);
    D.text(g, 'KERNELPORT', 42, 58, { size: 26, color: C.pink, glow: C.pink });
    D.text(g, 'CITY HUB', 252, 58, { size: 14, color: C.green });
    menuList(hubItems(), hubSel, 46, 102, 394);
    // stats
    D.panel(g, W - 300, 20, 278, 160, { edge: C.green, edge2: 'rgba(255,79,184,0.7)' });
    const lit = 6 - save.dark.length;
    D.text(g, 'BANKED  ' + save.bank.toLocaleString(), W - 280, 56, { size: 19, color: C.gold });
    D.text(g, 'CUBES BEATEN  ' + clearedList().length + ' / ' + CD.games.length, W - 280, 86, { size: 17, color: C.green });
    D.text(g, 'SECTORS LIT  ' + lit + ' / 6', W - 280, 114, { size: 17, color: lit < 6 ? C.pink : C.green });
    CD.games.forEach((gm, i) => drawMedal(W - 270 + i * 30, 138, medal(gm), 10));
    D.text(g, 'MEDALS ' + medalsTotal() + ' / ' + CD.games.length * 3 + (save.coreBest ? '  ·  CORE ' + save.coreBest.toLocaleString() : ''), W - 280, 168, { size: 13, color: '#e6d6ff' });
    let line;
    if (!clearedList().length) line = 'A cube is circling. When it drops, I\'ll go in with you.';
    else if (!uncleared().length) line = 'Every cube beaten! Replay any of them for a higher score.';
    else if (save.dark.length) line = 'Win a cube and I can switch a dark sector back on.';
    else line = 'Nice work, Visitor. ' + uncleared().length + ' game' + (uncleared().length > 1 ? 's' : '') + ' still out there.';
    D.lumiSays(g, line, T);
    if (!CD.touch) D.text(g, '↑↓ choose  ·  Enter select  ·  Esc title  ·  F fullscreen', W - 20, H - 12, { size: 13, align: 'right', color: '#e6d6ff' });
  }
  function drawPick() {
    CD.city.draw(g, T, { dark: save.dark, labels: false });
    D.panel(g, W / 2 - 360, 40, 720, 420);
    D.text(g, 'CHOOSE A CUBE', W / 2, 84, { size: 26, align: 'center', color: C.pink, glow: C.pink });
    CD.games.forEach((gm, i) => {
      const on = i === pickSel, y = 140 + i * 58, open = isOpen(gm), m = medal(gm);
      hits.push({ x: W / 2 - 330, y: y - 32, w: 660, h: 50, i });
      g.save(); D.roundRect(g, W / 2 - 330, y - 32, 660, 50, 10);
      g.fillStyle = on ? 'rgba(255,79,184,0.45)' : 'rgba(57,255,143,0.07)'; g.fill(); g.restore();
      D.cube(g, W / 2 - 300, y - 7, 13, T + i, T * 1.3 + i, { glow: on, alpha: open ? 0.9 : 0.25 });
      D.text(g, open ? gm.title : 'LOCKED', W / 2 - 270, y - 6, { size: 21, color: open ? (on ? '#fff' : '#e8dcff') : '#6d5f86' });
      D.text(g, open ? gm.genre : 'Beat ' + needFor(gm) + ' cube' + (needFor(gm) > 1 ? 's' : '') + ' to open', W / 2 - 270, y + 13, { size: 13, color: open ? C.green : '#8a78ad', stroke: false });
      if (open) {
        D.text(g, 'BEST ' + (save.best[gm.id] || 0).toLocaleString(), W / 2 + 200, y, { size: 16, align: 'right', color: C.gold });
        for (let k = 1; k <= 3; k++) drawMedal(W / 2 + 230 + (k - 1) * 28, y - 6, m >= k ? k : 0, 9);
      }
    });
    D.text(g, (CD.touch ? 'Tap a cube to play' : '↑↓ choose  ·  Enter play') + '  ·  Esc back', W / 2, 446, { size: 15, align: 'center', color: C.green });
  }
  function drawDrop() {
    const shake = st > 2 && st < 2.5 ? (2.5 - st) * 16 : 0;
    g.save(); g.translate(U.rand(-shake, shake), U.rand(-shake, shake));
    CD.city.draw(g, T, { dark: save.dark, labels: false });
    const fall = U.clamp(st / 2, 0, 1);
    const cy = U.lerp(-120, 300, U.easeIn(fall));
    const size = U.lerp(40, 80, fall);
    // shadow + beam
    g.save(); g.globalAlpha = 0.25 + fall * 0.4;
    g.fillStyle = '#000'; g.beginPath(); g.ellipse(W / 2, CD.city.BASE + 40, 60 + fall * 120, 12 + fall * 18, 0, 0, 7); g.fill(); g.restore();
    if (st > 2) {
      const k = U.clamp((st - 2) / 0.8, 0, 1);
      g.save(); g.globalAlpha = 0.35 * (1 - k * 0.4);
      const gr = g.createRadialGradient(W / 2, 300, 10, W / 2, 300, 120 + k * 520);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, C.pink); gr.addColorStop(1, 'rgba(57,255,143,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
    }
    D.cube(g, W / 2, cy, size, T * 1.5, T * 2.2, { glowSize: 50 });
    g.restore();
    if (st < 2) D.text(g, 'INCOMING CUBE!', W / 2, 90, { size: 40, align: 'center', color: C.red, glow: C.red, alpha: 0.6 + 0.4 * Math.sin(T * 14) });
    if (st >= 2.4) {
      const k = st - 2.4;
      const n = 3 - Math.floor(k / 0.9);
      D.panel(g, W / 2 - 260, 70, 520, 150);
      // genre reel: spins then lands on chosen game
      const names = drop.names, final = names.indexOf(drop.def.title);
      const spin = Math.min(1, k / 2.4);
      const idx = spin < 1 ? Math.floor(k * (22 - spin * 18)) % names.length : final;
      D.text(g, 'YOU ARE ENTERING', W / 2, 108, { size: 16, align: 'center', color: C.green });
      D.text(g, (spin < 1 ? names[idx] : drop.def.title).toUpperCase(), W / 2, 150, { size: 34, align: 'center', color: '#fff', glow: C.pink });
      D.text(g, spin < 1 ? '...' : drop.def.genre.toUpperCase(), W / 2, 186, { size: 18, align: 'center', color: C.pink });
      const label = n > 0 ? String(n) : 'GO!';
      D.bigText(g, label, W / 2, 360, 110, n > 0 ? C.green : C.pink, '#2a8f5a', 8);
    }
    if (st > 5.4) { g.fillStyle = `rgba(255,255,255,${U.clamp((st - 5.4) * 3, 0, 1)})`; g.fillRect(0, 0, W, H); }
  }
  function drawIntro() {
    const d = gameDef;
    D.sky(g, '#1b0b3a', '#3a0f63', '#0a0418');
    D.gridFloor(g, 380, T * 0.6, 'rgba(255,79,184,0.4)', ['#240a40', '#06020c']);
    D.cube(g, 880, 70, 30, T, T * 1.3, { glowSize: 20 });
    D.panel(g, 70, 24, 820, 492);
    D.text(g, d.genre.toUpperCase(), 104, 66, { size: 16, color: C.green });
    D.text(g, d.title, 104, 110, { size: 44, color: '#fff', glow: C.pink });
    let y = 142;
    y += 24 * D.wrap(g, d.tagline, 104, y, 750, 17, 24, { color: '#f0d9ff' }) + 10;
    D.text(g, 'GOAL', 104, y, { size: 15, color: C.pink });
    y += 24 * D.wrap(g, typeof d.goal === 'function' ? d.goal(save.diff) : d.goal, 164, y, 690, 17, 24, { color: '#fff' }) + 12;
    D.text(g, 'CONTROLS', 104, y, { size: 15, color: C.pink }); y += 28;
    (CD.touch && d.touchHelp ? d.touchHelp : d.controls).forEach(c => {
      D.text(g, c[0], 104, y, { size: 16, color: C.gold });
      D.text(g, c[1], 300, y, { size: 16, color: '#fff' }); y += 23;
    });
    y += 10;
    D.lumi(g, 122, y + 14, T, 0.9, 'happy');
    D.text(g, 'LUMI HELPS:', 156, y + 8, { size: 15, color: C.green });
    D.wrap(g, d.helper, 156, y + 32, 500, 16, 22, { color: '#dfffee' });
    D.text(g, 'Difficulty: ' + (save.diff === 'easy' ? 'EASY' : 'NORMAL') + (CD.touch ? '  ·  ❚❚ pauses' : '  ·  Esc pause  ·  Gamepad: A / B / X, Start pauses'), 104, 494, { size: 13, color: '#bba7e0' });
    const md = d.medals || [0, 0, 0], m = medal(d);
    D.text(g, 'BEST ' + (save.best[d.id] || 0).toLocaleString(), 860, 66, { size: 17, align: 'right', color: C.gold });
    D.text(g, 'SILVER ' + md[1].toLocaleString() + '   GOLD ' + md[2].toLocaleString(), 860, 90, { size: 13, align: 'right', color: '#e6d6ff' });
    for (let k = 1; k <= 3; k++) drawMedal(790 + (k - 1) * 26, 112, m >= k ? k : 0, 8);
    if (core) D.text(g, 'KERNEL CORE RUN  ' + (core.i + 1) + ' / ' + CD.games.length + '  ·  ' + core.total.toLocaleString(), 860, 140, { size: 14, align: 'right', color: C.green });
    if (Math.sin(T * 5) > -0.3) D.text(g, CD.touch ? 'TAP TO START' : 'ENTER  START', 860, 462, { size: 24, align: 'right', color: '#fff', glow: C.green });
  }
  function drawBubble() {
    if (bubble) D.lumiSays(g, bubble.text, T, U.clamp(bubble.t * 3, 0, 1));
  }
  function drawPause() {
    g.fillStyle = 'rgba(8,3,20,0.7)'; g.fillRect(0, 0, W, H);
    D.panel(g, W / 2 - 200, 110, 400, 300);
    D.text(g, 'PAUSED', W / 2, 160, { size: 34, align: 'center', color: C.pink, glow: C.pink });
    menuList([{ label: 'RESUME' }, { label: 'RESTART THIS GAME' }, { label: 'SOUND: ' + (save.muted ? 'OFF' : 'ON') }, { label: 'QUIT TO CITY (NO PENALTY)' }], pauseSel, W / 2 - 160, 215, 340);
    D.text(g, 'Esc resume  ·  F fullscreen', W / 2, 395, { size: 13, align: 'center', color: C.green });
  }
  function drawBanner() {
    const b = banner, k = U.clamp(st * 3, 0, 1);
    g.fillStyle = b.won ? `rgba(20,60,40,${0.5 * k})` : `rgba(60,0,20,${0.55 * k})`; g.fillRect(0, 0, W, H);
    g.save(); g.translate(W / 2, H / 2 - 30); g.scale(0.6 + 0.4 * U.easeOut(k), 0.6 + 0.4 * U.easeOut(k));
    D.bigText(g, b.won ? 'CUBE CLEARED!' : 'ZEROED!', 0, 0, 84, b.won ? C.green : C.red, b.won ? '#1a7a4a' : '#7a0020', 9);
    g.restore();
    D.text(g, b.won ? 'SCORE ' + b.score.toLocaleString() : (b.reason || 'The cube got you this time.'), W / 2, H / 2 + 50, { size: 24, align: 'center' });
  }
  function drawResult() {
    const r = result;
    CD.city.draw(g, T, { dark: save.dark, flash: !r.won && st < 1.6 ? r.sector : null });
    if (r.won) {
      const k = U.clamp(st / 2.2, 0, 1);
      const cy = U.lerp(300, -160, U.easeIn(k));
      g.save(); g.globalAlpha = (1 - k) * 0.6; g.fillStyle = C.green; g.fillRect(W / 2 - 8, cy, 16, H); g.restore();
      D.cube(g, W / 2, cy, 80 - k * 30, T, T * 1.6, { glowColor: C.green, glowSize: 50 });
      if (r.sector != null && st > 1) {
        g.save(); g.globalAlpha = Math.max(0, 0.5 - (st - 1) * 0.25); g.fillStyle = C.green; g.fillRect(r.sector * 160, 0, 160, H); g.restore();
      }
      D.panel(g, W / 2 - 280, 330 - 270, 560, 160, { edge: C.green });
      D.text(g, 'THE CUBE LIFTS! CITY SAVED.', W / 2, 108, { size: 30, align: 'center', color: C.green, glow: C.green });
      D.text(g, '+' + r.score.toLocaleString() + ' banked  ·  total ' + save.bank.toLocaleString(), W / 2, 146, { size: 20, align: 'center', color: C.gold });
      D.text(g, r.sector != null ? CD.city.SECTORS[r.sector] + ' is back online!' : 'Every sector is glowing.', W / 2, 178, { size: 17, align: 'center' });
      const ex = newBest ? 'NEW BEST SCORE!' : unlockedNow ? 'UNLOCKED: ' + unlockedNow.toUpperCase() + '!' : MEDAL_NAME[medal(gameDef)] + ' MEDAL';
      D.text(g, ex, W / 2, 250, { size: 26, align: 'center', color: C.pink, glow: C.pink, alpha: 0.75 + 0.25 * Math.sin(T * 6) });
      if (newBest && unlockedNow) D.text(g, 'UNLOCKED: ' + unlockedNow.toUpperCase(), W / 2, 282, { size: 18, align: 'center', color: C.green });
      D.text(g, (CD.touch ? 'Tap' : 'Enter') + (core ? '  next cube' : '  back to the city'), W / 2, 206, { size: 15, align: 'center', color: '#e6d6ff' });
    } else {
      D.cube(g, W / 2, 300 + Math.sin(T * 3) * 5, 80, T * 0.6, T * 0.9, { glowColor: C.red, glowSize: 40 });
      D.panel(g, W / 2 - 290, 60, 580, 160, { edge: C.red });
      D.text(g, 'YOU GOT ZEROED', W / 2, 106, { size: 30, align: 'center', color: C.red, glow: C.red });
      D.text(g, r.sector != null ? CD.city.SECTORS[r.sector] + ' went dark. (Win any cube to bring it back.)' : 'The city is already dark. Win to light it up!', W / 2, 142, { size: 17, align: 'center' });
      D.text(g, (CD.touch ? 'Tap' : 'Enter') + '  TRY AGAIN', W / 2, 180, { size: 22, align: 'center', color: C.green, glow: C.green });
      D.text(g, CD.touch ? '❚❚  back to the city' : 'Esc  back to the city', W / 2, 206, { size: 15, align: 'center', color: '#e6d6ff' });
    }
  }

  /* ---------- CRT overlay (scanlines + vignette), drawn once ---------- */
  const overlay = document.createElement('canvas'); overlay.width = W; overlay.height = H;
  (function () {
    const o = overlay.getContext('2d');
    o.fillStyle = 'rgba(0,0,0,0.07)'; for (let y = 0; y < H; y += 3) o.fillRect(0, y, W, 1);
    const v = o.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,0,25,0.45)'); o.fillStyle = v; o.fillRect(0, 0, W, H);
  })();

  /* ---------- taps / clicks on the screen ---------- */
  CD.pointer = function (x, y) {
    const h = hits.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (h && state === 'help') { helpSel = h.i; A.sfx('move'); return true; }
    if (h) { if (state === 'hub') hubSel = h.i; else if (state === 'pick') pickSel = h.i; else if (state === 'pause') pauseSel = h.i; I.tap('tap'); return true; }
    if (['title', 'intro', 'drop', 'end', 'result', 'help'].includes(state)) { I.tap('tap'); return true; }
    return false;
  };

  /* ---------- how to play ---------- */
  function drawHelp() {
    CD.city.draw(g, T, { dark: save.dark, labels: false });
    g.fillStyle = 'rgba(10,4,24,0.45)'; g.fillRect(0, 0, W, H);
    D.panel(g, 60, 26, 840, 488);
    const pages = ['THE IDEA', 'CONTROLS', 'CUBES & MEDALS'];
    pages.forEach((p, i) => {
      const x = 110 + i * 250, on = i === helpSel;
      hits.push({ x: x - 10, y: 46, w: 230, h: 40, i, tab: 1 });
      g.save(); D.roundRect(g, x - 10, 46, 230, 40, 10); g.fillStyle = on ? 'rgba(255,79,184,0.55)' : 'rgba(57,255,143,0.12)'; g.fill(); g.restore();
      D.text(g, p, x + 105, 74, { size: 18, align: 'center', color: on ? '#fff' : '#cdb8ff' });
    });
    let y = 130;
    const line = (a, b, col) => { D.text(g, a, 110, y, { size: 18, color: col || C.gold }); if (b) D.wrap(g, b, 330, y, 540, 17, 22, { color: '#fff' }); y += 34; };
    if (helpSel === 0) {
      y += D.wrap(g, 'Kernelport is a city inside a computer. Game Cubes fall from the sky. Step inside, beat the game, and the cube lifts off.', 110, y, 740, 19, 28, { color: '#fff' }) * 28 + 14;
      line('WIN', 'Your score is banked, a dark part of the city lights up, and the next cube opens.', C.green);
      line('LOSE', 'No game over. You get ZEROED, one part of the city goes dark, and you can try again right away.', C.pink);
      line('EASY', 'Easy mode is on by default: more hearts, slower enemies. Switch it in the city menu.');
      line('RUNS', 'Every cube takes about 1 to 3 minutes. Lumi gives tips while you play.');
    } else if (helpSel === 1) {
      D.text(g, 'KEYBOARD', 110, y, { size: 16, color: C.pink }); D.text(g, 'PHONE / TABLET', 400, y, { size: 16, color: C.pink }); D.text(g, 'GAMEPAD', 680, y, { size: 16, color: C.pink }); y += 34;
      [['Arrows / WASD', 'Left pad ◀ ▲ ▼ ▶', 'D-pad / stick'], ['Space', 'A button', 'A (bottom)'], ['Shift or X', 'B button', 'B (right)'], ['C', 'C button', 'X or Y'], ['Enter', 'Tap the menu item', 'A'], ['Esc', '❚❚ button', 'Start / Back'], ['F / M', '⛶ / ♪ buttons', '—']].forEach(r => {
        D.text(g, r[0], 110, y, { size: 17, color: C.gold }); D.text(g, r[1], 400, y, { size: 17, color: '#fff' }); D.text(g, r[2], 680, y, { size: 17, color: C.green }); y += 32;
      });
      D.text(g, 'Each cube shows its own controls before it starts.', 110, y + 10, { size: 16, color: '#dfffee' });
    } else {
      CD.games.forEach(gm => {
        const open = isOpen(gm), m = medal(gm);
        drawMedal(122, y - 6, m, 10);
        D.text(g, open ? gm.title : '???', 145, y, { size: 18, color: open ? '#fff' : '#6d5f86' });
        D.text(g, open ? gm.genre + (m ? '  ·  ' + MEDAL_NAME[m] : '') : 'Beat ' + needFor(gm) + ' cubes to open', 400, y, { size: 16, color: open ? C.green : '#8a78ad' });
        y += 34;
      });
      y += 6;
      D.wrap(g, 'Beat a cube for BRONZE. Score higher for SILVER and GOLD (targets show on each cube). Beat all five to open the KERNEL CORE RUN: every cube back to back.', 110, y, 740, 17, 24, { color: '#fff' });
    }
    D.text(g, (CD.touch ? 'Tap for next page' : '← → page') + '  ·  Enter / Esc back to the city', W / 2, 500, { size: 15, align: 'center', color: C.green });
  }

  /* ---------- loop ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (CD.padPoll) CD.padPoll();
    try { update(dt); } catch (e) { console.error(e); }
    g.setTransform(CD.pxScale, 0, 0, CD.pxScale, 0, 0);
    g.clearRect(0, 0, W, H);
    try { frame(g); } catch (e) { console.error(e); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Hooks for automated testing only.
  CD.debug = {
    state: () => state,
    game: () => game,
    gameId: () => gameDef && gameDef.id,
    jump(id) { gameDef = CD.getGame(id); startGame(); },
    toHub() { go('hub'); },
    drop(id) { startDrop(CD.getGame(id)); },
    step(dt) { update(dt); },
    unlockAll() { CD.games.forEach(gm => (save.cleared[gm.id] = true)); persist(); },
    fresh() { save = DEF(); persist(); },
    result: () => result
  };
})();
