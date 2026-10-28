/* Cube Drop — procedural WebAudio: sound effects + tiny chiptune sequencer. No samples. */
(function () {
  'use strict';
  const A = (CD.audio = { ctx: null, muted: false, track: null });
  const NOTE = { c: 0, 'c#': 1, d: 2, 'd#': 3, e: 4, f: 5, 'f#': 6, g: 7, 'g#': 8, a: 9, 'a#': 10, b: 11 };
  const midi = s => { const m = /^([a-g]#?)(\d)$/.exec(s); return m ? 12 * (+m[2] + 1) + NOTE[m[1]] : 0; };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const seq = s => s.trim().split(/\s+/).map(t => (t === '.' ? 0 : midi(t)));

  A.unlock = function () {
    try {
      if (!A.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        A.ctx = new AC();
        A.master = A.ctx.createGain(); A.master.gain.value = A.muted ? 0 : 0.55; A.master.connect(A.ctx.destination);
        A.sfxBus = A.ctx.createGain(); A.sfxBus.gain.value = 0.7; A.sfxBus.connect(A.master);
        A.musBus = A.ctx.createGain(); A.musBus.gain.value = 0.32; A.musBus.connect(A.master);
        const len = A.ctx.sampleRate;
        A.noiseBuf = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
        const d = A.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        if (A.track) A.music(A.track, true);
      }
      if (A.ctx.state === 'suspended') A.ctx.resume();
    } catch (e) { /* audio is optional */ }
  };
  A.setMuted = function (m) { A.muted = m; if (A.master) A.master.gain.value = m ? 0 : 0.55; };

  function tone(f, dur, type, vol, slide, when, bus) {
    if (!A.ctx) return;
    const t = (when || A.ctx.currentTime) + 0.001;
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || A.sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, freq, when, bus, type) {
    if (!A.ctx) return;
    const t = (when || A.ctx.currentTime) + 0.001;
    const s = A.ctx.createBufferSource(); s.buffer = A.noiseBuf;
    const f = A.ctx.createBiquadFilter(); f.type = type || 'highpass'; f.frequency.value = freq || 1000;
    const g = A.ctx.createGain();
    g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || A.sfxBus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  A.tone = tone; A.noise = noise;

  const SFX = {
    select: () => tone(880, 0.07, 'square', 0.12),
    move: () => tone(520, 0.04, 'square', 0.07),
    confirm: () => { tone(660, 0.08, 'square', 0.14); tone(990, 0.12, 'square', 0.12, 0, A.ctx.currentTime + 0.07); },
    back: () => tone(440, 0.1, 'triangle', 0.15, 0.6),
    jump: () => tone(300, 0.16, 'square', 0.12, 2.4),
    boost: () => { tone(220, 0.35, 'sawtooth', 0.12, 3); noise(0.3, 0.08, 2000); },
    shoot: () => tone(1400, 0.06, 'square', 0.05, 0.4),
    zap: () => tone(1900, 0.07, 'triangle', 0.06, 0.5),
    hit: () => { noise(0.12, 0.22, 600); tone(160, 0.12, 'square', 0.12, 0.5); },
    hurt: () => { tone(400, 0.25, 'sawtooth', 0.18, 0.25); noise(0.2, 0.15, 400); },
    explode: () => { noise(0.45, 0.3, 200, 0, 0, 'lowpass'); tone(120, 0.4, 'square', 0.1, 0.3); },
    big: () => { noise(1.2, 0.35, 300, 0, 0, 'lowpass'); tone(90, 1.0, 'sawtooth', 0.18, 0.2); },
    coin: () => { tone(1320, 0.06, 'square', 0.1); tone(1760, 0.1, 'square', 0.1, 0, A.ctx.currentTime + 0.05); },
    power: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, 'square', 0.1, 0, A.ctx.currentTime + i * 0.06)),
    bump: () => { tone(90, 0.15, 'square', 0.2, 0.6); noise(0.1, 0.15, 300, 0, 0, 'lowpass'); },
    tick: () => tone(1000, 0.08, 'square', 0.12),
    go: () => tone(1500, 0.35, 'square', 0.14),
    land: () => { tone(70, 0.8, 'sine', 0.4, 0.4); noise(0.6, 0.25, 180, 0, 0, 'lowpass'); },
    hum: () => tone(55, 1.6, 'sawtooth', 0.08, 1.6),
    win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'square', 0.12, 0, A.ctx.currentTime + i * 0.11)),
    lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.18, 0.9, A.ctx.currentTime + i * 0.18)),
    shield: () => { tone(300, 0.4, 'triangle', 0.14, 2.5); tone(450, 0.4, 'sine', 0.1, 2) },
    punch: () => { noise(0.08, 0.25, 900); tone(200, 0.08, 'square', 0.1, 0.5); },
    block: () => tone(1200, 0.05, 'triangle', 0.12, 0.7)
  };
  A.sfx = function (name) { if (!A.ctx || A.muted) return; try { SFX[name] && SFX[name](); } catch (e) { } };

  /* ---------- music ---------- */
  // Each track: bpm, 32-step bass + lead lines, drum string (k=kick s=snare h=hat .=rest).
  const TRACKS = {
    hub: { bpm: 96, wave: 'triangle',
      bass: seq('a2 . . . a2 . e3 . f2 . . . f2 . c3 . c2 . . . c2 . g2 . g2 . . . g2 . d3 .'),
      lead: seq('e5 . . . c5 . a4 . . . c5 . . . e5 . g5 . . . e5 . c5 . d5 . . . b4 . . .'),
      drum: 'k...h...s...h.h.k...h...s...h...' },
    race: { bpm: 150, wave: 'square',
      bass: seq('e2 e2 e3 e2 e2 e3 e2 e3 c2 c2 c3 c2 c2 c3 c2 c3 d2 d2 d3 d2 d2 d3 d2 d3 b1 b1 b2 b1 d2 d3 f#2 b2'),
      lead: seq('b4 . e5 . g5 . f#5 e5 . . b4 . e5 . . . c5 . e5 . g5 . a5 g5 . . f#5 . d5 . . .'),
      drum: 'k.h.s.h.k.h.s.hhk.h.s.h.k.k.s.hs' },
    plat: { bpm: 128, wave: 'square',
      bass: seq('c3 . g2 . c3 . g2 . f2 . c3 . f2 . c3 . a2 . e3 . a2 . e3 . g2 . d3 . g2 . b2 .'),
      lead: seq('e5 g5 c6 . g5 . e5 . f5 a5 c6 . a5 . f5 . e5 . c5 . e5 . a5 . g5 . . d5 . b4 d5 .'),
      drum: 'k.h.s.h.k.hks.h.k.h.s.h.k.h.s.ss' },
    shoot: { bpm: 140, wave: 'sawtooth',
      bass: seq('a1 a2 a1 a2 a1 a2 g2 a2 f1 f2 f1 f2 f1 f2 e2 f2 d2 d3 d2 d3 d2 d3 c3 d3 e2 e3 e2 e3 g#2 g#3 b2 e3'),
      lead: seq('a4 . c5 . e5 . a5 . g5 . e5 . c5 . . . d5 . f5 . a5 . d6 . c6 . b5 . g#5 . e5 .'),
      drum: 'k.hhs.h.k.hhs.hkk.hhs.h.k.hhs.ss' },
    boss: { bpm: 156, wave: 'sawtooth',
      bass: seq('d2 d2 d3 d2 d#2 d#2 d#3 d#2 d2 d2 d3 d2 c2 c2 c3 c2 d2 d2 d3 d2 d#2 d#2 d#3 d#2 f2 f2 f3 f2 a#1 a#1 a2 c3'),
      lead: seq('d5 . . a4 . . d5 d#5 . . d5 . c5 . a4 . d5 . . a4 . . f5 d#5 . d5 . . c5 . a#4 .'),
      drum: 'k.hsk.hsk.hsk.ssk.hsk.hsk.hsksss' },
    fight: { bpm: 138, wave: 'square',
      bass: seq('g2 . g2 g3 . g2 a#2 . c3 . c3 c4 . c3 a#2 . g2 . g2 g3 . g2 f2 . d#2 . d#2 d#3 f2 . f#2 .'),
      lead: seq('g5 . f5 g5 . d5 . . a#4 . c5 . d5 . . . g5 . a#5 . a5 . f5 . g5 . . . d5 . . .'),
      drum: 'k.h.s.hkk.h.s.h.k.h.s.hkk.hss.ss' },
    catch: { bpm: 132, wave: 'square',
      bass: seq('f2 . f3 . c3 . f3 . d#2 . d#3 . a#2 . d#3 . c#2 . c#3 . g#2 . c#3 . c2 . c3 . g2 . e3 .'),
      lead: seq('c5 . f5 . g#5 . c6 . a#5 . g5 . d#5 . . . c#5 . f5 . g#5 . c#6 . c6 . . g5 . e5 . . .'),
      drum: 'k.h.s.h.k.h.s.h.k.h.s.h.k.k.s.hh' },
    win: { bpm: 120, wave: 'square',
      bass: seq('c3 . c3 . f3 . f3 . g3 . g3 . c3 . c3 . c3 . c3 . f3 . f3 . g3 . g3 . c4 . . .'),
      lead: seq('c5 e5 g5 c6 . a5 f5 . b5 g5 d5 . c6 . . . e5 g5 c6 e6 . c6 a5 . d6 b5 g5 . c6 . . .'),
      drum: 'k...s...k...s...k...s...k.k.s.s.' }
  };
  let timer = null, step = 0, nextT = 0;
  function playStep(tr, i, t) {
    const sp = 60 / tr.bpm / 4;
    const b = tr.bass[i % tr.bass.length], l = tr.lead[i % tr.lead.length], d = tr.drum[i % tr.drum.length];
    if (b) tone(hz(b), sp * 1.6, 'triangle', 0.32, 0, t, A.musBus);
    if (l) { tone(hz(l), sp * 1.8, tr.wave, 0.09, 0, t, A.musBus); tone(hz(l) * 1.005, sp * 1.5, 'square', 0.03, 0, t + 0.01, A.musBus); }
    if (d === 'k') { tone(150, 0.12, 'sine', 0.55, 0.3, t, A.musBus); }
    else if (d === 's') noise(0.1, 0.22, 1800, t, A.musBus);
    else if (d === 'h') noise(0.03, 0.08, 7000, t, A.musBus);
  }
  A.music = function (name, force) {
    if (A.track === name && timer && !force) return;
    A.stopMusic(); A.track = name;
    if (!A.ctx || !TRACKS[name]) return;
    const tr = TRACKS[name]; step = 0; nextT = A.ctx.currentTime + 0.08;
    timer = setInterval(() => {
      if (!A.ctx) return;
      const sp = 60 / tr.bpm / 4;
      while (nextT < A.ctx.currentTime + 0.15) { if (!A.muted) playStep(tr, step, nextT); step++; nextT += sp; }
    }, 30);
  };
  A.stopMusic = function () { if (timer) clearInterval(timer); timer = null; };
})();
