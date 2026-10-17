CUBE DROP — Kernelport            version 0.1 (private build, not published)
========================================================================

HOW TO PLAY
  Double-click index.html. It opens in Chrome or Firefox and works offline.
  Enter = select / start      Arrows or WASD = move      Space = action
  Esc = pause in a game       F = fullscreen             M = sound on/off

THE IDEA
  Kernelport is a city that lives inside a computer. Every so often a glowing
  Cube falls from the sky and lands on it. Inside the Cube is a game. You are
  the Visitor, and you have to play it. Lumi, the city's little warden-bot,
  jumps in with you and helps.
  Win: the Cube lifts, your score is banked, and a dark sector lights back up.
  Lose: you get ZEROED and one sector of the city goes dark. You can always
  retry. There is no game over.

GAMES
  1. Overclock Run   (racing)     3 laps against 4 rival cars. Space = Lumi Turbo.
  2. Firewall Sprint (platformer) Run, stomp bugs, ride platforms to the portal.
                                  Jump again mid-air for Lumi's boost.
  3. Virus Storm     (shooter)    Virus waves, then the Corruptor boss.
                                  Shift/X = Lumi Shield. Lumi auto-fires.
  4. Byte Brawl      (fighting)   Best of 3 rounds vs KRASH. Space punch,
                                  Shift/X kick, Down block, C = Lumi Beam.

  Easy / Normal is in the city menu. Easy is the default.
  Progress (cleared games, banked score, dark sectors) saves in the browser.
  "Reset save" in the city menu erases it.

ADDING A GAME (for later genres: puzzle, sports...)
  Make games/yourgame.js that calls CD.registerGame({ id, title, genre,
  tagline, goal, controls, helper, music, create(api) }), then add one
  <script> line for it in index.html. create(api) returns { update(dt), draw(g) }
  and calls api.win(score) or api.lose(reason). api.say(text) makes Lumi talk.

All art and sound are made by code (Canvas + WebAudio). No images, samples,
libraries or internet are used.
