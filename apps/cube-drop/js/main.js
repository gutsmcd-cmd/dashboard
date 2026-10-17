/* Cube Drop — framework: title, hub, cube drop, intro cards, pause, results, save. */
(function () {
  'use strict';
  const { W, H, COL: C, draw: D, util: U, input: I, audio: A } = CD;
  const canvas = document.getElementById('screen');
  const g = canvas.getContext('2d');

  /* ---------- save ---------- */
  const KEY = 'cubedrop:v1';
  const DEF = () => ({ cleared: {}, best: {}, bank: 0, dark: [], diff: 'easy', muted: false, plays: 0, wins: 0 });
  let save = DEF();
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) save = Object.assign(DEF(), s); } catch (e) { }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { } };
  A.setMuted(!!save.muted);
  CD.save = () => save;

  /* ---------- screen scaling ---------- */
  function fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = Math.floor(W * s) + 'px';
    canvas.style.height = Math.floor(H * s) + 'px';
    canvas.width = Math.floor(W * s * dpr); canvas.height = Math.floor(H * s * dpr);
    CD.pxScale = s * dpr;
  }
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
  const go = s => { state = s; st = 0; I.reset(); };
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
      say: (text, secs) => { bubble = { text, t: secs || 3.5, max: secs || 3.5 }; },
      sfx: n => A.sfx(n),
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
    if (won) {
      save.cleared[gameDef.id] = true; save.wins++;
      save.bank += score;
      save.best[gameDef.id] = Math.max(save.best[gameDef.id] || 0, score);
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
    return [
      { label: uncleared().length ? 'AWAIT THE CUBE' : 'AWAIT THE CUBE (ANY GAME)', act: 'drop' },
      { label: 'REPLAY A CLEARED GAME' + (n ? ` (${n})` : ''), act: 'pick', off: !n },
      { label: 'DIFFICULTY: ' + (save.diff === 'easy' ? 'EASY' : 'NORMAL'), act: 'diff' },
      { label: 'SOUND: ' + (save.muted ? 'OFF' : 'ON') + '   (M)', act: 'mute' },
      { label: resetArm > 0 ? 'PRESS AGAIN TO ERASE SAVE' : 'RESET SAVE', act: 'reset', warn: resetArm > 0 }
    ];
  }
  function hubAct(it) {
    if (it.off) { A.sfx('back'); return; }
    A.sfx('confirm');
    if (it.act === 'drop') { const pool = uncleared().length ? uncleared() : CD.games; startDrop(U.pick(pool)); }
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
    if (toast) { toast.t -= dt; if (toast.t <= 0) toast = null; }
    if (resetArm > 0) resetArm -= dt;
    switch (state) {
      case 'title':
        if (st > 0.3 && I.confirm()) { A.unlock(); A.sfx('confirm'); A.music('hub'); go('hub'); }
        break;
      case 'hub': {
        A.music('hub');
        const items = hubItems();
        hubSel = menuNav(hubSel, items.length);
        if (I.confirm()) hubAct(items[hubSel]);
        if (I.hit('esc')) { A.sfx('back'); go('title'); }
        break;
      }
      case 'pick': {
        const list = clearedList();
        if (!list.length) { go('hub'); break; }
        pickSel = menuNav(pickSel, list.length);
        if (I.confirm()) { A.sfx('confirm'); startDrop(list[pickSel]); }
        if (I.hit('esc')) { A.sfx('back'); go('hub'); }
        break;
      }
      case 'drop': {
        const prevStep = Math.floor((st - dt - 2.4) / 0.9), step = Math.floor((st - 2.4) / 0.9);
        if (st - dt < 2.0 && st >= 2.0) A.sfx('land');
        if (st >= 2.4 && step !== prevStep && step < 3) A.sfx('tick');
        if (st >= 2.4 + 2.7 && st - dt < 2.4 + 2.7) A.sfx('go');
        if (st > 2.4 + 3.4) openIntro(drop.def);
        if (I.hit('esc') && st < 2.4) { go('hub'); }
        break;
      }
      case 'intro':
        if (st > 0.25 && I.confirm()) { A.sfx('confirm'); startGame(); }
        if (I.hit('esc')) { A.sfx('back'); A.music('hub'); go('hub'); }
        break;
      case 'play':
        if (I.hit('esc')) { A.sfx('select'); pauseSel = 0; go('pause'); break; }
        if (I.hit('KeyM')) toggleMute();
        game.update(Math.min(dt, 1 / 30));
        if (bubble) { bubble.t -= dt; if (bubble.t <= 0) bubble = null; }
        break;
      case 'pause': {
        pauseSel = menuNav(pauseSel, 4);
        if (I.hit('esc')) { go('play'); break; }
        if (I.confirm()) {
          A.sfx('confirm');
          if (pauseSel === 0) go('play');
          else if (pauseSel === 1) { A.music(gameDef.music || 'hub', true); startGame(); }
          else if (pauseSel === 2) toggleMute();
          else { A.music('hub'); go('hub'); }
        }
        break;
      }
      case 'end':
        if (st > 2.4 || (st > 0.8 && I.confirm())) { A.music(result.won ? 'win' : 'hub'); go('result'); }
        break;
      case 'result':
        if (st > 0.6) {
          if (result.won && I.confirm()) { A.sfx('confirm'); A.music('hub'); go('hub'); }
          if (!result.won && I.confirm()) { A.sfx('confirm'); openIntro(gameDef); }
          if (!result.won && I.hit('esc')) { A.sfx('back'); A.music('hub'); go('hub'); }
          if (result.won && I.hit('esc')) { A.music('hub'); go('hub'); }
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
      case 'play': game.draw(g); drawBubble(); break;
      case 'pause': game.draw(g); drawPause(); break;
      case 'end': game.draw(g); drawBanner(); break;
      case 'result': drawResult(); break;
    }
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
    if (Math.sin(T * 5) > -0.3) D.text(g, 'PRESS ENTER', W / 2, 420, { size: 30, align: 'center', color: '#fff', glow: C.pink });
    D.text(g, 'F fullscreen  ·  M sound  ·  Esc pause in games', W / 2, 505, { size: 14, align: 'center', color: '#e6d6ff' });
    D.lumi(g, 780, 420, T, 1.6, 'happy');
  }
  function drawHub() {
    CD.city.draw(g, T, { dark: save.dark });
    // idle cube hint high in sky
    D.cube(g, 770, 70 + Math.sin(T * 1.4) * 6, 26, T * 0.5, T * 0.8, { glowSize: 18, alpha: 0.7 });
    D.panel(g, 22, 20, 380, 262);
    D.text(g, 'KERNELPORT', 42, 58, { size: 26, color: C.pink, glow: C.pink });
    D.text(g, 'CITY HUB', 252, 58, { size: 14, color: C.green });
    menuList(hubItems(), hubSel, 46, 102, 344);
    // stats
    D.panel(g, W - 300, 20, 278, 132, { edge: C.green, edge2: 'rgba(255,79,184,0.7)' });
    const lit = 6 - save.dark.length;
    D.text(g, 'BANKED  ' + save.bank.toLocaleString(), W - 280, 56, { size: 19, color: C.gold });
    D.text(g, 'CUBES BEATEN  ' + clearedList().length + ' / ' + CD.games.length, W - 280, 86, { size: 17, color: C.green });
    D.text(g, 'SECTORS LIT  ' + lit + ' / 6', W - 280, 114, { size: 17, color: lit < 6 ? C.pink : C.green });
    D.text(g, CD.games.map(gm => (save.cleared[gm.id] ? '■' : '□')).join(' '), W - 280, 140, { size: 15, color: '#fff' });
    let line;
    if (!clearedList().length) line = 'A cube is circling. When it drops, I\'ll go in with you.';
    else if (!uncleared().length) line = 'Every cube beaten! Replay any of them for a higher score.';
    else if (save.dark.length) line = 'Win a cube and I can switch a dark sector back on.';
    else line = 'Nice work, Visitor. ' + uncleared().length + ' game' + (uncleared().length > 1 ? 's' : '') + ' still out there.';
    D.lumiSays(g, line, T);
    D.text(g, '↑↓ choose  ·  Enter select  ·  Esc title  ·  F fullscreen', W - 20, H - 12, { size: 13, align: 'right', color: '#e6d6ff' });
  }
  function drawPick() {
    CD.city.draw(g, T, { dark: save.dark, labels: false });
    D.panel(g, W / 2 - 320, 70, 640, 120 + clearedList().length * 44);
    D.text(g, 'REPLAY A CLEARED GAME', W / 2, 112, { size: 24, align: 'center', color: C.pink });
    clearedList().forEach((gm, i) => {
      const on = i === pickSel, y = 162 + i * 44;
      D.text(g, (on ? '▶ ' : '   ') + gm.title + '  ·  ' + gm.genre, W / 2 - 290, y, { size: 20, color: on ? '#fff' : '#cdb8ff' });
      D.text(g, 'BEST ' + (save.best[gm.id] || 0).toLocaleString(), W / 2 + 290, y, { size: 15, align: 'right', color: C.gold });
    });
    D.text(g, 'Enter play  ·  Esc back', W / 2, 162 + clearedList().length * 44 + 4, { size: 14, align: 'center', color: C.green });
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
    d.controls.forEach(c => {
      D.text(g, c[0], 104, y, { size: 16, color: C.gold });
      D.text(g, c[1], 300, y, { size: 16, color: '#fff' }); y += 23;
    });
    y += 10;
    D.lumi(g, 122, y + 14, T, 0.9, 'happy');
    D.text(g, 'LUMI HELPS:', 156, y + 8, { size: 15, color: C.green });
    D.wrap(g, d.helper, 156, y + 32, 500, 16, 22, { color: '#dfffee' });
    D.text(g, 'Difficulty: ' + (save.diff === 'easy' ? 'EASY' : 'NORMAL') + ' (change in city menu)  ·  In game: Esc pause, F fullscreen  ·  Esc now: back to city', 104, 494, { size: 13, color: '#bba7e0' });
    if (Math.sin(T * 5) > -0.3) D.text(g, 'ENTER  START', 860, 462, { size: 24, align: 'right', color: '#fff', glow: C.green });
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
      D.text(g, 'Enter  back to the city', W / 2, 206, { size: 15, align: 'center', color: '#e6d6ff' });
    } else {
      D.cube(g, W / 2, 300 + Math.sin(T * 3) * 5, 80, T * 0.6, T * 0.9, { glowColor: C.red, glowSize: 40 });
      D.panel(g, W / 2 - 290, 60, 580, 160, { edge: C.red });
      D.text(g, 'YOU GOT ZEROED', W / 2, 106, { size: 30, align: 'center', color: C.red, glow: C.red });
      D.text(g, r.sector != null ? CD.city.SECTORS[r.sector] + ' went dark. (Win any cube to bring it back.)' : 'The city is already dark. Win to light it up!', W / 2, 142, { size: 17, align: 'center' });
      D.text(g, 'Enter  TRY AGAIN', W / 2, 180, { size: 22, align: 'center', color: C.green, glow: C.green });
      D.text(g, 'Esc  back to the city', W / 2, 206, { size: 15, align: 'center', color: '#e6d6ff' });
    }
  }

  /* ---------- loop ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
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
    step(dt) { update(dt); }
  };
})();
