// Draws the street. Three layers are painted once onto hidden canvases and then
// slid past the camera at different speeds; only the blinking lights are live.
(function (CC) {
  var VIEW_W = 320;
  var VIEW_H = 180;
  var GROUND = 150;   // top of the pavement
  var WORLD = 2240;   // length of the street
  var SUBWAY = 900;   // length of the station under it
  var FAR_SPEED = 0.15;
  var MID_SPEED = 0.45;
  var FLOOR_LIGHTS = ['#e8a23c', '#e879b0', '#c8443f', '#9a6be0', '#5fc48a']; // one per cafe floor

  var C = {
    skyTop: '#0b0910', skyMid: '#1a1424', skyLow: '#2e2140',
    moon: '#e8dfcc', moonRing: 'rgba(232, 223, 204, 0.08)',
    far: '#1a1524', farLit: '#7d6638',
    mid: '#221a2d', midEdge: '#2d2339', midDim: '#34293f',
    near: '#17121d', nearEdge: '#231c2b', nearDim: '#2c2436',
    lit: '#f2c96b', brass: '#c9a45c', brassDim: '#7d6638', neon: '#d4485c',
    black: '#0c0a10', bone: '#e8dfcc',
    walk: '#2a2430', walkLine: '#1b1720', curb: '#3d3548', road: '#121016', lane: '#4a3f2a'
  };

  var far, mid, near, subway;

  // Small repeatable random generator, so the skyline is the same every visit.
  function seeded(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function layer(width) {
    var canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width);
    canvas.height = VIEW_H;
    return canvas;
  }

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function label(ctx, text, x, y, color) {
    ctx.font = '8px Silkscreen, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color;
    ctx.fillText(text, Math.round(x), Math.round(y));
  }

  // A tower that narrows in steps toward the top, the art deco silhouette.
  function ziggurat(ctx, x, w, h, steps, color) {
    var top = GROUND - h;
    rect(ctx, x, top, w, h, color);
    for (var i = 1; i <= steps; i++) {
      var inset = Math.round((w / 2) * (i / (steps + 1)));
      rect(ctx, x + inset, top - i * 6, w - inset * 2, 6, color);
    }
    return top - steps * 6;
  }

  function buildFar() {
    var rand = seeded(7);
    var canvas = layer(VIEW_W + WORLD * FAR_SPEED);
    var ctx = canvas.getContext('2d');
    for (var x = -10; x < canvas.width; ) {
      var w = 16 + Math.floor(rand() * 22);
      var h = 40 + Math.floor(rand() * 62);
      var top = ziggurat(ctx, x, w, h, 1 + Math.floor(rand() * 3), C.far);
      if (rand() < 0.4) rect(ctx, x + w / 2, top - 12, 1, 12, C.far); // spire
      for (var i = 0; i < 5; i++) {
        rect(ctx, x + 2 + Math.floor(rand() * (w - 4)), GROUND - 4 - Math.floor(rand() * (h - 8)), 1, 1, C.farLit);
      }
      x += w + Math.floor(rand() * 6);
    }
    return canvas;
  }

  function buildMid() {
    var rand = seeded(23);
    var canvas = layer(VIEW_W + WORLD * MID_SPEED);
    var ctx = canvas.getContext('2d');
    for (var x = -20; x < canvas.width; ) {
      var w = 38 + Math.floor(rand() * 34);
      var h = 62 + Math.floor(rand() * 58);
      var top = GROUND - h;
      ziggurat(ctx, x, w, h, 2, C.mid);
      for (var px = x + 4; px < x + w - 2; px += 8) rect(ctx, px, top, 1, h, C.midEdge); // pilasters
      for (var wy = top + 6; wy < GROUND - 8; wy += 9) {
        for (var wx = x + 6; wx < x + w - 4; wx += 8) {
          rect(ctx, wx, wy, 3, 4, rand() < 0.22 ? C.lit : C.midDim);
        }
      }
      if (rand() < 0.45) { // vertical neon sign
        var sx = x + w - 5;
        ctx.globalAlpha = 0.25;
        rect(ctx, sx - 2, top + 8, 7, 30, C.neon);
        ctx.globalAlpha = 1;
        rect(ctx, sx, top + 10, 3, 26, C.neon);
      }
      x += w + 2 + Math.floor(rand() * 10);
    }
    return canvas;
  }

  function lamp(ctx, x) {
    ctx.fillStyle = 'rgba(242, 201, 107, 0.09)';
    ctx.beginPath();
    ctx.moveTo(x + 1, GROUND - 58);
    ctx.lineTo(x - 26, GROUND + 14);
    ctx.lineTo(x + 28, GROUND + 14);
    ctx.fill();
    rect(ctx, x, GROUND - 56, 2, 56, C.black);
    rect(ctx, x - 2, GROUND - 2, 6, 2, C.black);
    rect(ctx, x - 3, GROUND - 58, 8, 2, C.black);
    rect(ctx, x - 2, GROUND - 63, 6, 5, C.lit);
    rect(ctx, x - 1, GROUND - 65, 4, 2, C.brass);
  }

  // The busker's corner: a guitar leaning on the lamp post and its locked case.
  function buskerGear(ctx, x) {
    var floor = GROUND + 4;

    // Case, lying on the pavement to the busker's left.
    var cx = x - 40;
    rect(ctx, cx, floor - 8, 24, 8, C.black);
    rect(ctx, cx + 1, floor - 7, 22, 6, '#4a2f22');
    rect(ctx, cx + 24, floor - 6, 12, 5, C.black);   // neck end
    rect(ctx, cx + 24, floor - 5, 11, 3, '#4a2f22');
    rect(ctx, cx + 1, floor - 7, 34, 1, '#6b4632');   // lid highlight
    rect(ctx, cx + 6, floor - 4, 2, 2, C.brass);      // latches
    rect(ctx, cx + 17, floor - 4, 2, 2, C.brass);
    rect(ctx, cx + 11, floor - 5, 3, 3, C.lit);       // the lock
    rect(ctx, cx + 12, floor - 4, 1, 1, C.black);

    // Guitar, standing against the lamp post on the right.
    var gx = x + 22;
    rect(ctx, gx + 4, floor - 36, 4, 5, '#2a160c');   // headstock
    rect(ctx, gx + 5, floor - 31, 2, 14, '#4d2c1c');  // neck
    rect(ctx, gx + 1, floor - 19, 10, 6, '#7a4a1f');  // upper body
    rect(ctx, gx + 2, floor - 18, 8, 4, '#c98a45');
    rect(ctx, gx + 2, floor - 13, 8, 2, '#7a4a1f');   // waist
    rect(ctx, gx, floor - 11, 12, 11, '#7a4a1f');     // lower body
    rect(ctx, gx + 1, floor - 10, 10, 9, '#c98a45');
    rect(ctx, gx + 4, floor - 9, 4, 4, C.black);      // sound hole
    rect(ctx, gx + 3, floor - 3, 6, 1, '#2a160c');    // bridge
    rect(ctx, gx + 6, floor - 31, 1, 22, C.bone);     // strings
  }

  function shopfront(ctx, x, w, h, sign, signColor) {
    var top = GROUND - h;
    rect(ctx, x, top, w, h, C.near);
    rect(ctx, x, top, w, 2, C.brassDim);
    rect(ctx, x + 4, top + 5, w - 8, 12, C.black);
    label(ctx, sign, x + w / 2, top + 14, signColor);
    return top;
  }

  function newsstand(ctx, x) {
    var top = GROUND - 44;
    rect(ctx, x, top + 10, 54, 34, '#2b2f3a');
    for (var i = 0; i < 54; i += 6) rect(ctx, x + i, top, 6, 10, i % 12 ? C.neon : C.bone); // striped awning
    rect(ctx, x, top + 10, 54, 1, C.black);
    rect(ctx, x + 4, top + 14, 46, 14, '#3a2f22');
    for (var p = 0; p < 5; p++) rect(ctx, x + 6 + p * 9, top + 16, 7, 10, p % 2 ? C.bone : '#b9ad95'); // papers
    rect(ctx, x + 4, top + 30, 46, 2, C.brassDim);
    label(ctx, 'NEWS', x + 27, top + 41, C.brass);
  }

  function recordShop(ctx, x) {
    var top = shopfront(ctx, x, 116, 78, 'RECORDS', C.neon);
    rect(ctx, x + 8, top + 24, 60, 40, '#2a2038');
    var sleeves = ['#3f5f8a', '#e879b0', '#c9993a', '#6a3c6e', '#646b3c', '#8a2433'];
    for (var i = 0; i < 6; i++) {
      var sx = x + 12 + (i % 3) * 19;
      var sy = top + 28 + Math.floor(i / 3) * 18;
      rect(ctx, sx, sy, 14, 14, sleeves[i]);
      rect(ctx, sx + 4, sy + 4, 6, 6, C.black);
      rect(ctx, sx + 6, sy + 6, 2, 2, C.bone);
    }
    rect(ctx, x + 80, top + 30, 24, 48, C.black); // door
    rect(ctx, x + 82, top + 32, 20, 22, C.nearDim);
  }

  function radioTower(ctx, x) {
    // Lattice mast running off the top of the screen.
    for (var y = 0; y < GROUND - 56; y += 8) {
      rect(ctx, x + 34, y, 1, 8, C.brassDim);
      rect(ctx, x + 44, y, 1, 8, C.brassDim);
      rect(ctx, x + 34, y, 11, 1, C.brassDim);
      ctx.strokeStyle = C.brassDim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 34.5, y + 0.5);
      ctx.lineTo(x + 44.5, y + 8.5);
      ctx.stroke();
    }
    var top = shopfront(ctx, x, 80, 56, 'RADIO', C.brass);
    rect(ctx, x + 8, top + 22, 40, 20, '#2a3340'); // studio window
    rect(ctx, x + 12, top + 34, 12, 8, C.black);
    rect(ctx, x + 28, top + 28, 2, 14, C.brassDim);
    rect(ctx, x + 26, top + 26, 6, 4, C.brass);   // microphone
    rect(ctx, x + 56, top + 24, 18, 32, C.black);
  }

  function diner(ctx, x) {
    var top = GROUND - 58;
    rect(ctx, x, top, 140, 58, '#2b2f3a');
    rect(ctx, x - 3, top - 4, 146, 5, C.neon);
    rect(ctx, x, top + 1, 140, 2, C.bone);
    rect(ctx, x + 8, top + 12, 92, 26, '#e3c56f'); // one long lit window
    for (var m = x + 30; m < x + 100; m += 23) rect(ctx, m, top + 12, 2, 26, '#2b2f3a');
    for (var s = x + 14; s < x + 96; s += 12) rect(ctx, s, top + 30, 6, 8, '#8a2433'); // stools
    rect(ctx, x + 8, top + 38, 92, 2, C.bone);
    rect(ctx, x + 110, top + 16, 22, 42, C.black);
    rect(ctx, x + 112, top + 18, 18, 18, '#e3c56f');
    rect(ctx, x + 44, top - 20, 52, 14, C.black);
    label(ctx, 'DINER', x + 70, top - 9, C.neon);
  }

  function cafe(ctx, x) {
    var w = 150;
    rect(ctx, x, 0, w, GROUND, '#1d1626');
    rect(ctx, x, 0, 3, GROUND, C.brassDim);
    rect(ctx, x + w - 3, 0, 3, GROUND, C.brassDim);
    for (var p = x + 18; p < x + w - 10; p += 19) rect(ctx, p, 0, 1, GROUND - 52, '#2d2339');

    // Five floors, each glowing its own colour: one per kind of music.
    for (var f = 0; f < 5; f++) {
      var y = 6 + f * 17;
      for (var wx = x + 9; wx < x + w - 14; wx += 19) {
        rect(ctx, wx, y, 14, 11, FLOOR_LIGHTS[f]);
        rect(ctx, wx + 6, y, 1, 11, '#1d1626');
        rect(ctx, wx, y + 5, 14, 1, '#1d1626');
      }
      rect(ctx, x + 3, y + 13, w - 6, 1, C.brassDim);
    }

    // Entrance: sunburst over a brass-framed door.
    var cx = x + w / 2;
    rect(ctx, cx - 50, GROUND - 52, 100, 13, C.black);
    rect(ctx, cx - 50, GROUND - 52, 100, 1, C.brass);
    rect(ctx, cx - 50, GROUND - 40, 100, 1, C.brass);
    label(ctx, 'ELEVATOR MUSIC', cx, GROUND - 42, C.brass);
    ctx.strokeStyle = C.brass;
    ctx.lineWidth = 1;
    for (var a = 0; a <= 8; a++) {
      var angle = Math.PI + (a * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 6, GROUND - 28 + Math.sin(angle) * 6 + 0.5);
      ctx.lineTo(cx + Math.cos(angle) * 15, GROUND - 28 + Math.sin(angle) * 10 + 0.5);
      ctx.stroke();
    }
    rect(ctx, cx - 14, GROUND - 28, 28, 28, C.brass);
    rect(ctx, cx - 12, GROUND - 26, 24, 26, '#e8a23c');
    rect(ctx, cx - 1, GROUND - 26, 2, 26, C.brass);
    rect(ctx, cx - 4, GROUND - 13, 2, 2, C.black);
    rect(ctx, cx + 2, GROUND - 13, 2, 2, C.black);
    rect(ctx, cx - 22, GROUND - 3, 44, 3, C.brassDim); // step
  }

  // Railings and a lit sign around a stairwell down to the subway.
  function subwayStairs(ctx, x) {
    rect(ctx, x - 17, GROUND - 12, 34, 16, C.black);
    for (var i = 0; i < 4; i++) rect(ctx, x - 14 + i * 3, GROUND - 9 + i * 3, 28 - i * 6, 2, C.nearDim); // steps going down
    rect(ctx, x - 19, GROUND - 14, 38, 2, C.brassDim);
    rect(ctx, x - 19, GROUND - 40, 2, 40, C.black);
    rect(ctx, x + 17, GROUND - 40, 2, 40, C.black);
    rect(ctx, x - 21, GROUND - 45, 6, 5, C.lit);
    rect(ctx, x + 15, GROUND - 45, 6, 5, C.lit);
    rect(ctx, x - 22, GROUND - 60, 44, 12, C.black);
    rect(ctx, x - 22, GROUND - 60, 44, 1, C.brass);
    rect(ctx, x - 22, GROUND - 49, 44, 1, C.brass);
    label(ctx, 'SUBWAY', x, GROUND - 51, C.brass);
  }

  // A dug-up stretch of pavement that cannot be crossed.
  function roadworks(ctx, x) {
    rect(ctx, x - 22, GROUND + 2, 44, 10, C.black);       // the hole
    rect(ctx, x - 18, GROUND + 6, 36, 2, '#4a5560');      // burst pipe
    rect(ctx, x - 4, GROUND + 4, 5, 6, '#6f7480');
    [-30, 14].forEach(function (offset) {                  // striped barriers
      var bx = x + offset;
      for (var i = 0; i < 16; i += 4) rect(ctx, bx + i, GROUND - 14, 4, 5, (i / 4) % 2 ? C.bone : C.neon);
      rect(ctx, bx + 1, GROUND - 9, 2, 13, C.black);
      rect(ctx, bx + 13, GROUND - 9, 2, 13, C.black);
    });
    rect(ctx, x - 31, GROUND - 38, 62, 12, C.black);
    rect(ctx, x - 31, GROUND - 38, 62, 1, C.neon);
    label(ctx, 'ROAD CLOSED', x, GROUND - 29, C.neon);
    rect(ctx, x - 1, GROUND - 26, 2, 12, C.black);
    rect(ctx, x + 34, GROUND - 4, 6, 8, '#d9772e');        // cone
    rect(ctx, x + 35, GROUND - 8, 4, 4, '#d9772e');
    rect(ctx, x + 34, GROUND - 1, 6, 1, C.bone);
  }

  // The station under the street: tiled walls, arches, a booth, a gate.
  function buildSubway() {
    var map = CC.city.map.subway;
    var canvas = layer(SUBWAY);
    var ctx = canvas.getContext('2d');
    var tile = '#39464a', grout = '#2c373a', dark = '#1a1522';

    rect(ctx, 0, 0, SUBWAY, VIEW_H, C.black);
    rect(ctx, 0, 20, SUBWAY, GROUND - 20, tile);
    for (var gx = 0; gx < SUBWAY; gx += 8) rect(ctx, gx, 20, 1, GROUND - 20, grout);
    for (var gy = 20; gy < GROUND; gy += 6) rect(ctx, 0, gy, SUBWAY, 1, grout);
    rect(ctx, 0, 54, SUBWAY, 1, C.brass);
    rect(ctx, 0, 56, SUBWAY, 6, '#8a2433');                // oxblood band
    rect(ctx, 0, 63, SUBWAY, 1, C.brass);
    rect(ctx, 0, 118, SUBWAY, GROUND - 118, '#263134');    // darker lower wall
    rect(ctx, 0, 117, SUBWAY, 1, C.brassDim);

    // Stepped arches between pillars.
    for (var px = 95; px < SUBWAY; px += 150) {
      rect(ctx, px, 20, 10, GROUND - 20, dark);
      rect(ctx, px - 2, 20, 14, 3, C.brassDim);
      rect(ctx, px - 8, 20, 26, 6, dark);
      rect(ctx, px - 16, 20, 42, 3, dark);
      rect(ctx, px - 1, GROUND - 4, 12, 4, C.brassDim);
    }

    // Station name in tiles.
    [200, 640].forEach(function (sx) {
      rect(ctx, sx - 44, 30, 88, 14, C.black);
      rect(ctx, sx - 44, 30, 88, 1, C.brass);
      rect(ctx, sx - 44, 43, 88, 1, C.brass);
      label(ctx, 'MOON STREET', sx, 40, C.bone);
    });

    // Hanging lamps.
    for (var lx = 40; lx < SUBWAY; lx += 110) {
      ctx.fillStyle = 'rgba(242, 201, 107, 0.07)';
      ctx.beginPath();
      ctx.moveTo(lx, 28);
      ctx.lineTo(lx - 34, GROUND + 14);
      ctx.lineTo(lx + 34, GROUND + 14);
      ctx.fill();
      rect(ctx, lx, 20, 1, 6, C.black);
      rect(ctx, lx - 3, 26, 7, 4, C.lit);
    }

    // Posters, one for each kind of music upstairs.
    [262, 444, 505, 610, 740].forEach(function (x, i) {
      rect(ctx, x, 74, 18, 26, C.black);
      rect(ctx, x + 1, 75, 16, 24, FLOOR_LIGHTS[i]);
      rect(ctx, x + 5, 79, 8, 8, C.black);
      rect(ctx, x + 8, 82, 2, 2, C.bone);
      rect(ctx, x + 3, 91, 12, 1, C.black);
      rect(ctx, x + 3, 94, 8, 1, C.black);
    });

    // Benches and a bin.
    [118, 690].forEach(function (x) {
      rect(ctx, x, GROUND - 16, 34, 2, C.brassDim);
      rect(ctx, x, GROUND - 9, 34, 3, '#6b4632');
      rect(ctx, x + 2, GROUND - 16, 2, 16, C.black);
      rect(ctx, x + 30, GROUND - 16, 2, 16, C.black);
    });
    rect(ctx, 480, GROUND - 14, 9, 14, '#2b2f3a');
    rect(ctx, 479, GROUND - 15, 11, 2, C.brassDim);

    // Ticket booth.
    rect(ctx, 290, GROUND - 60, 50, 60, dark);
    rect(ctx, 290, GROUND - 60, 50, 2, C.brass);
    rect(ctx, 296, GROUND - 46, 38, 22, '#e3c56f');
    rect(ctx, 314, GROUND - 46, 2, 22, dark);
    rect(ctx, 296, GROUND - 24, 38, 2, C.brassDim);
    label(ctx, 'TICKETS', 315, GROUND - 50, C.brass);

    // Ticket machine.
    var m = map.machine;
    rect(ctx, m - 9, GROUND - 40, 18, 40, '#2b4365');
    rect(ctx, m - 9, GROUND - 40, 18, 2, C.brass);
    rect(ctx, m - 6, GROUND - 35, 12, 9, '#9fd0c8');
    rect(ctx, m - 6, GROUND - 23, 4, 4, C.lit);
    rect(ctx, m + 1, GROUND - 23, 5, 2, C.black);
    rect(ctx, m - 5, GROUND - 12, 10, 4, C.black);

    // Ticket gate posts (the arms are drawn live, open or shut).
    var g = map.gate;
    rect(ctx, g - 1, 20, 2, GROUND - 60, C.brassDim);
    for (var bar = 26; bar < GROUND - 44; bar += 8) rect(ctx, g - 12, bar, 24, 1, C.brassDim);
    rect(ctx, g - 14, GROUND - 26, 5, 26, '#2b2f3a');
    rect(ctx, g + 9, GROUND - 26, 5, 26, '#2b2f3a');
    rect(ctx, g - 14, GROUND - 27, 5, 2, C.brass);
    rect(ctx, g + 9, GROUND - 27, 5, 2, C.brass);

    // Stairs up at each end, with light falling down them.
    [[map.stairsWest, -1], [map.stairsEast, 1]].forEach(function (pair) {
      var x = pair[0], dir = pair[1];
      ctx.fillStyle = 'rgba(232, 223, 204, 0.10)';
      ctx.fillRect(x - 22, 20, 44, GROUND - 20);
      rect(ctx, x - 24, 20, 2, GROUND - 20, C.black);
      rect(ctx, x + 22, 20, 2, GROUND - 20, C.black);
      for (var i = 0; i < 9; i++) {
        var sx = dir > 0 ? x - 22 + i * 5 : x + 22 - (i + 1) * 5;
        rect(ctx, sx, GROUND - (i + 1) * 5, 5, (i + 1) * 5, '#4a4654');
        rect(ctx, sx, GROUND - (i + 1) * 5, 5, 1, C.bone);
      }
      rect(ctx, x - 16, 66, 32, 11, C.black);
      label(ctx, 'EXIT', x, 75, '#5fc48a');
    });

    // Platform, safety line and the track pit.
    rect(ctx, 0, GROUND, SUBWAY, 12, '#3a3344');
    for (var s = 0; s < SUBWAY; s += 16) rect(ctx, s, GROUND, 1, 12, '#2a2430');
    rect(ctx, 0, GROUND + 12, SUBWAY, 2, '#c9993a');
    rect(ctx, 0, GROUND + 14, SUBWAY, VIEW_H - GROUND - 14, '#08070a');
    rect(ctx, 0, GROUND + 24, SUBWAY, 1, '#4a4a55');
    return canvas;
  }

  function buildNear() {
    var rand = seeded(91);
    var canvas = layer(WORLD);
    var ctx = canvas.getContext('2d');

    // A wall of dark frontages behind everything.
    for (var x = 0; x < WORLD; ) {
      var w = 60 + Math.floor(rand() * 50);
      var h = 66 + Math.floor(rand() * 32);
      var top = GROUND - h;
      rect(ctx, x, top, w, h, C.near);
      rect(ctx, x, top, w, 1, C.nearEdge);
      rect(ctx, x + w - 1, top, 1, h, C.black);
      for (var wy = top + 8; wy < GROUND - 30; wy += 14) {
        for (var wx = x + 8; wx < x + w - 10; wx += 14) rect(ctx, wx, wy, 6, 8, rand() < 0.12 ? C.lit : C.nearDim);
      }
      rect(ctx, x + 6, GROUND - 24, w - 12, 24, C.nearEdge); // shutter
      for (var sy = GROUND - 22; sy < GROUND; sy += 3) rect(ctx, x + 6, sy, w - 12, 1, C.near);
      x += w;
    }

    newsstand(ctx, 610);
    recordShop(ctx, 850);
    radioTower(ctx, 1420);
    diner(ctx, 1690);
    cafe(ctx, 2040);

    // Pavement, curb and road.
    rect(ctx, 0, GROUND, WORLD, 14, C.walk);
    for (var s = 0; s < WORLD; s += 24) rect(ctx, s, GROUND, 1, 14, C.walkLine);
    rect(ctx, 0, GROUND + 14, WORLD, 2, C.curb);
    rect(ctx, 0, GROUND + 16, WORLD, VIEW_H - GROUND - 16, C.road);
    for (var d = 10; d < WORLD; d += 40) rect(ctx, d, GROUND + 23, 16, 1, C.lane);

    for (var l = 110; l < WORLD - 220; l += 190) lamp(ctx, l);
    buskerGear(ctx, CC.city.npcs.busker.x);

    // Drawn after the pavement so the stairwells and the hole cut into it.
    subwayStairs(ctx, CC.city.map.street.stairsDown);
    subwayStairs(ctx, CC.city.map.street.stairsUp);
    roadworks(ctx, CC.city.map.street.roadworks);
    return canvas;
  }

  function build() {
    far = buildFar();
    mid = buildMid();
    near = buildNear();
    subway = buildSubway();
  }

  // Paint the whole background for a camera position. `time` is in milliseconds.
  function draw(ctx, camX, time) {
    var sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, C.skyTop);
    sky.addColorStop(0.6, C.skyMid);
    sky.addColorStop(1, C.skyLow);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // Moon with deco rings.
    var mx = 236 - camX * 0.03;
    ctx.fillStyle = C.moonRing;
    [34, 26].forEach(function (r) {
      ctx.beginPath();
      ctx.arc(mx, 40, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = C.moon;
    ctx.beginPath();
    ctx.arc(mx, 40, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(far, -Math.round(camX * FAR_SPEED), 0);
    ctx.drawImage(mid, -Math.round(camX * MID_SPEED), 0);
    ctx.drawImage(near, -Math.round(camX), 0);

    // Live lights: the tower beacon and the ON AIR sign.
    if (Math.floor(time / 600) % 2) rect(ctx, 1420 + 37 - camX, 2, 5, 3, C.neon);
    if (Math.floor(time / 900) % 3) rect(ctx, 1420 + 54 - camX, GROUND - 38, 22, 3, C.neon);
    if (Math.floor(time / 450) % 2) rect(ctx, CC.city.map.street.roadworks - 2 - camX, GROUND - 42, 4, 4, '#f2a03c');
  }

  // Paint the station. `gateOpen` swings the ticket gate's arms out of the way.
  function drawSubway(ctx, camX, time, gateOpen) {
    ctx.drawImage(subway, -Math.round(camX), 0);

    // A train rushes through the pit every so often.
    var t = time % 14000;
    if (t < 2400) {
      var x = VIEW_W - (t / 2400) * (VIEW_W + 700);
      rect(ctx, x, GROUND + 15, 700, 15, '#2b2f3a');
      for (var w = 6; w < 700; w += 18) rect(ctx, x + w, GROUND + 18, 12, 6, C.lit);
    }

    var g = CC.city.map.subway.gate - camX;
    if (gateOpen) {
      rect(ctx, g - 12, GROUND - 31, 3, 3, '#5fc48a');
    } else {
      rect(ctx, g - 9, GROUND - 16, 18, 2, C.neon);
      rect(ctx, g - 9, GROUND - 9, 18, 2, C.neon);
      rect(ctx, g - 12, GROUND - 31, 3, 3, C.neon);
    }
  }

  CC.city = CC.city || {};
  CC.city.scene = { VIEW_W: VIEW_W, VIEW_H: VIEW_H, GROUND: GROUND, WORLD: WORLD, SUBWAY: SUBWAY, rect: rect, label: label, layer: layer, build: build, draw: draw, drawSubway: drawSubway };
})(window.CozyCafe);
