/* Cube Drop — touch controls, gamepad support, screen taps and phone layout. */
(function () {
  'use strict';
  const I = CD.input;
  const coarse = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  CD.touch = coarse;
  const ui = document.getElementById('ui');
  const canvas = document.getElementById('screen');
  if (coarse) document.body.classList.add('touch');
  addEventListener('touchstart', () => { if (!CD.touch) { CD.touch = true; document.body.classList.add('touch'); CD.refit && CD.refit(); } }, { passive: true });

  /* ---- top buttons: pause, sound, fullscreen ---- */
  function topBtn(id, label, fn) {
    const b = document.createElement('button'); b.id = id; b.className = 'tb'; b.textContent = label;
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); CD.audio.unlock(); fn(); });
    ui.appendChild(b); return b;
  }
  topBtn('b-pause', '❚❚', () => I.tap('esc'));
  topBtn('b-sound', '♪', () => I.tap('KeyM'));
  topBtn('b-full', '⛶', () => {
    try { if (!document.fullscreenElement) { const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen || function () { }).call(el); if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } else document.exitFullscreen(); } catch (e) { }
  });

  /* ---- d-pad (one zone, 8 directions) ---- */
  const pad = document.createElement('div'); pad.id = 'dpad';
  pad.innerHTML = '<i class="u">▲</i><i class="d">▼</i><i class="l">◀</i><i class="r">▶</i><b></b>';
  ui.appendChild(pad);
  const knob = pad.querySelector('b');
  let padId = null, dirs = {};
  function setDirs(nd) {
    ['left', 'right', 'up', 'down'].forEach(k => { if (nd[k] && !dirs[k]) I.vdown(k); if (!nd[k] && dirs[k]) I.vup(k); });
    dirs = nd;
    pad.querySelectorAll('i').forEach(el => el.classList.toggle('on', !!nd[{ u: 'up', d: 'down', l: 'left', r: 'right' }[el.className.split(' ')[0]]]));
  }
  function padMove(e) {
    const r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = e.clientX - cx, dy = e.clientY - cy, dead = r.width * 0.12;
    const nd = {}, ang = Math.atan2(dy, dx), len = Math.hypot(dx, dy);
    if (len > dead) {
      const oct = Math.round(ang / (Math.PI / 4)); // -4..4
      if ([0, 1, -1].includes(oct)) nd.right = true;
      if ([4, -4, 3, -3].includes(oct)) nd.left = true;
      if ([2, 1, 3].includes(oct)) nd.down = true;
      if ([-2, -1, -3].includes(oct)) nd.up = true;
    }
    const k = Math.min(1, len / (r.width / 2)) * r.width * 0.28;
    knob.style.transform = `translate(${Math.cos(ang) * k}px, ${Math.sin(ang) * k}px)`;
    setDirs(nd);
  }
  pad.addEventListener('pointerdown', e => { e.preventDefault(); CD.audio.unlock(); padId = e.pointerId; pad.setPointerCapture(e.pointerId); padMove(e); });
  pad.addEventListener('pointermove', e => { if (e.pointerId === padId) padMove(e); });
  const padEnd = e => { if (e.pointerId !== padId) return; padId = null; knob.style.transform = ''; setDirs({}); };
  pad.addEventListener('pointerup', padEnd); pad.addEventListener('pointercancel', padEnd);

  /* ---- action buttons ---- */
  const acts = document.createElement('div'); acts.id = 'acts'; ui.appendChild(acts);
  const BTN = {};
  [['a', 'fire'], ['b', 'alt'], ['c', 'KeyC']].forEach(([id, act]) => {
    const b = document.createElement('button'); b.className = 'ab ab-' + id; b.innerHTML = '<span>' + id.toUpperCase() + '</span><small></small>';
    const down = e => { e.preventDefault(); CD.audio.unlock(); b.setPointerCapture && b.setPointerCapture(e.pointerId); b.classList.add('on'); I.vdown(act); if (act === 'fire') I.tap('enter'); };
    const up = e => { e.preventDefault(); b.classList.remove('on'); I.vup(act); };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
    acts.appendChild(b); BTN[id] = b;
  });
  const LABELS = {
    racer: { a: 'TURBO' }, platformer: { a: 'JUMP' }, shooter: { a: 'FIRE', b: 'SHIELD' },
    fighter: { a: 'PUNCH', b: 'KICK', c: 'BEAM' }, catch: { a: 'MAGNET' }
  };
  let lastKey = '';
  function refreshButtons() {
    const st = CD.state ? CD.state() : 'title';
    const gid = CD.debug && CD.debug.gameId();
    const inGame = st === 'play' || st === 'pause' || st === 'end';
    const L = inGame ? (LABELS[gid] || { a: 'GO' }) : { a: 'OK' };
    const key = st + gid;
    if (key === lastKey) return; lastKey = key;
    ['a', 'b', 'c'].forEach(k => { BTN[k].style.display = L[k] ? '' : 'none'; BTN[k].querySelector('small').textContent = L[k] || ''; });
    document.body.classList.toggle('ingame', inGame);
  }

  /* ---- taps on the game screen (menus, title, results) ---- */
  canvas.addEventListener('pointerdown', e => {
    CD.audio.unlock();
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * CD.W, y = (e.clientY - r.top) / r.height * CD.H;
    if (CD.pointer && CD.pointer(x, y)) e.preventDefault();
  });
  addEventListener('touchend', () => CD.audio.unlock(), { passive: true });

  /* ---- gamepad ---- */
  const padState = {};
  function pv(k, on) { if (on && !padState[k]) I.vdown(k); if (!on && padState[k]) I.vup(k); padState[k] = on; }
  CD.padPoll = function () {
    refreshButtons();
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null; for (const x of gps) if (x && x.connected) { gp = x; break; }
    if (!gp) return;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    if (!CD.padSeen) { CD.padSeen = true; CD.audio.unlock(); }
    pv('left', b(14) || ax < -0.45); pv('right', b(15) || ax > 0.45);
    pv('up', b(12) || ay < -0.45); pv('down', b(13) || ay > 0.45);
    pv('fire', b(0)); pv('KeyC', b(2) || b(3));
    const st = CD.state ? CD.state() : '';
    const menu = !(st === 'play');
    pv('alt', b(1) && !menu);
    if (b(0) && !padState.a0) I.tap('enter'); padState.a0 = b(0);
    if (b(1) && !padState.b1 && menu && st !== 'title') I.tap('esc'); padState.b1 = b(1);
    if ((b(9) || b(8)) && !padState.st) I.tap('esc'); padState.st = b(9) || b(8);
  };
})();
