// Draws the inside of the cafe: the lobby and each music floor. Like the
// street, every room is painted once onto a hidden canvas.
(function (CC) {
  var scene = CC.city.scene;
  var rect = scene.rect;
  var label = scene.label;
  var layer = scene.layer;
  var GROUND = scene.GROUND;
  var VIEW_H = scene.VIEW_H;
  var LOBBY_W = 320;
  var JAZZ_W = 480;
  var HIPHOP_W = 480;
  var RAP_W = 480;
  var POP_W = 480;
  var ROCK_W = 480;
  var YOURS_W = 320;  // one screen wide, so the whole room shows while you decorate

  var C = {
    black: '#0c0a10', brass: '#c9a45c', brassDim: '#7d6638', lit: '#f2c96b', bone: '#e8dfcc',
    wall: '#1d1626', wallEdge: '#2d2339', panel: '#17121d', wood: '#3b2a22', woodLight: '#6b4632',
    velvet: '#8a2433', velvetDark: '#5f1622',
    neon: '#5fc48a', neonDim: '#2f6b4a', steel: '#5b6068', steelDark: '#33373d',
    red: '#c8443f', redDim: '#7a2a2a', block: '#2a2a31', blockDark: '#202026',
    pink: '#e879b0', pinkDim: '#8f3f6a', lilac: '#b9a0e0', cyan: '#6fd6e0', plum: '#2a1430', plumDark: '#1f0f26',
    violet: '#9a6be0', violetDim: '#4f3578', drape: '#241a3a', drapeDark: '#1a1230',
    acid: '#4df58f', acidDim: '#1f6b47', hot: '#ff4fa8', ultra: '#4d6bff', ultraDim: '#232f7a', club: '#0e1220', clubEdge: '#182036'
  };

  // `seat` is where you can sit and listen; `perch` lifts you onto a taller seat.
  var places = {
    lobby: { door: 40, lift: 270 },
    jazz: { lift: 40, stage: 398, seat: 346, perch: 4 },
    hiphop: { lift: 40, stage: 398, seat: 314, perch: 4 },
    rap: { lift: 40, stage: 398, seat: 120, perch: 4 },
    pop: { lift: 40, stage: 398, seat: 128, perch: 8 },
    rock: { lift: 40, stage: 398, seat: 314, perch: 4 },
    yours: { lift: 40, decor: 98, seat: 222, perch: 4 }
  };
  var layers = {};

  function glow(ctx, x, y, reach, spread) {
    ctx.fillStyle = 'rgba(242, 201, 107, 0.07)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - spread, y + reach);
    ctx.lineTo(x + spread, y + reach);
    ctx.fill();
  }

  // Brass elevator doors with a floor dial above them.
  function lift(ctx, x) {
    rect(ctx, x - 22, GROUND - 62, 44, 62, C.brass);
    rect(ctx, x - 20, GROUND - 60, 40, 60, C.black);
    rect(ctx, x - 18, GROUND - 46, 17, 46, C.brassDim);
    rect(ctx, x + 1, GROUND - 46, 17, 46, C.brassDim);
    for (var i = 0; i < 4; i++) { // stepped chevrons on each door
      rect(ctx, x - 16 + i * 2, GROUND - 40 + i * 6, 13 - i * 4 > 1 ? 13 - i * 4 : 1, 1, C.brass);
      rect(ctx, x + 3 + i * 2, GROUND - 40 + i * 6, 13 - i * 4 > 1 ? 13 - i * 4 : 1, 1, C.brass);
    }
    rect(ctx, x - 10, GROUND - 58, 20, 9, C.panel);
    rect(ctx, x - 8, GROUND - 51, 16, 1, C.brass);
    rect(ctx, x, GROUND - 57, 1, 6, C.lit);
    rect(ctx, x + 26, GROUND - 30, 3, 5, C.lit); // call button
  }

  function chequeredFloor(ctx, width, dark, light) {
    rect(ctx, 0, GROUND, width, VIEW_H - GROUND, dark);
    for (var row = 0; row < 2; row++) {
      for (var x = row * 16; x < width; x += 32) rect(ctx, x, GROUND + row * 15, 16, 15, light);
    }
    rect(ctx, 0, GROUND, width, 1, C.brassDim);
  }

  function buildLobby() {
    var canvas = layer(LOBBY_W);
    var ctx = canvas.getContext('2d');
    rect(ctx, 0, 0, LOBBY_W, GROUND, C.wall);
    rect(ctx, 0, 104, LOBBY_W, GROUND - 104, C.panel);
    rect(ctx, 0, 103, LOBBY_W, 1, C.brass);
    for (var p = 2; p < LOBBY_W; p += 63) {
      rect(ctx, p, 0, 6, GROUND, C.wallEdge);
      rect(ctx, p - 1, 0, 8, 3, C.brassDim);
      rect(ctx, p - 1, GROUND - 4, 8, 4, C.brassDim);
    }

    // Sunburst mural with the name over it.
    var cx = 176;
    ctx.strokeStyle = C.brassDim;
    ctx.lineWidth = 1;
    for (var a = 0; a <= 16; a++) {
      var angle = Math.PI + (a * Math.PI) / 16;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 16, 102 + Math.sin(angle) * 16);
      ctx.lineTo(cx + Math.cos(angle) * 62, 102 + Math.sin(angle) * 58);
      ctx.stroke();
    }
    ctx.fillStyle = C.brass;
    ctx.beginPath();
    ctx.arc(cx, 103, 13, Math.PI, 0);
    ctx.fill();
    rect(ctx, cx - 50, 18, 100, 14, C.black);
    rect(ctx, cx - 50, 18, 100, 1, C.brass);
    rect(ctx, cx - 50, 31, 100, 1, C.brass);
    label(ctx, 'ELEVATOR MUSIC', cx, 28, C.brass);

    // Chandelier.
    glow(ctx, 100, 20, GROUND, 70);
    rect(ctx, 100, 0, 1, 8, C.brassDim);
    rect(ctx, 90, 8, 21, 2, C.brass);
    rect(ctx, 94, 10, 13, 2, C.brass);
    rect(ctx, 98, 12, 5, 2, C.brass);
    [90, 96, 102, 108].forEach(function (x) { rect(ctx, x, 10, 2, 3, C.lit); });

    // Front door back to the street.
    var d = places.lobby.door;
    rect(ctx, d - 16, GROUND - 50, 32, 50, C.brass);
    rect(ctx, d - 14, GROUND - 48, 28, 48, '#1a2233');
    rect(ctx, d - 1, GROUND - 48, 2, 48, C.brass);
    rect(ctx, d - 9, GROUND - 40, 4, 1, C.lit); // a lit window across the street
    rect(ctx, d + 6, GROUND - 32, 3, 1, C.lit);

    // Host's desk.
    rect(ctx, 132, GROUND - 24, 52, 24, C.wood);
    rect(ctx, 130, GROUND - 26, 56, 3, C.brass);
    rect(ctx, 138, GROUND - 18, 40, 1, C.woodLight);
    rect(ctx, 172, GROUND - 34, 2, 8, C.brassDim);
    rect(ctx, 168, GROUND - 38, 10, 4, C.lit);

    // A palm either side of the elevator.
    [228, 306].forEach(function (x) {
      rect(ctx, x - 4, GROUND - 10, 9, 10, C.brassDim);
      rect(ctx, x, GROUND - 26, 1, 16, '#2f5a3a');
      [[-8, -30], [-5, -34], [0, -36], [5, -34], [8, -30]].forEach(function (leaf) {
        rect(ctx, x + leaf[0] - 1, GROUND + leaf[1], 3, 9, '#3f7a4c');
      });
    });

    lift(ctx, places.lobby.lift);
    chequeredFloor(ctx, LOBBY_W, '#2a2430', '#3a3344');
    return canvas;
  }

  function buildJazz() {
    var canvas = layer(JAZZ_W);
    var ctx = canvas.getContext('2d');
    var amber = '#e8a23c';
    rect(ctx, 0, 0, JAZZ_W, GROUND, '#16202a');
    rect(ctx, 0, 100, JAZZ_W, GROUND - 100, '#1b1622');
    rect(ctx, 0, 99, JAZZ_W, 1, C.brassDim);

    // Wall lamps.
    for (var s = 76; s < 390; s += 104) {
      glow(ctx, s + 2, 52, 100, 34);
      rect(ctx, s, 50, 5, 3, C.brassDim);
      rect(ctx, s, 44, 5, 6, amber);
    }

    // Window onto the night.
    rect(ctx, 96, 36, 64, 46, C.brass);
    var sky = ctx.createLinearGradient(0, 38, 0, 80);
    sky.addColorStop(0, '#0d0b11');
    sky.addColorStop(1, '#2e2140');
    ctx.fillStyle = sky;
    ctx.fillRect(98, 38, 60, 42);
    ctx.fillStyle = C.bone;
    ctx.beginPath();
    ctx.arc(140, 50, 6, 0, Math.PI * 2);
    ctx.fill();
    [[100, 20, 14], [116, 14, 22], [132, 18, 10], [146, 12, 17]].forEach(function (tower) {
      rect(ctx, tower[0], 80 - tower[2], tower[1], tower[2], '#1a1524');
      rect(ctx, tower[0] + 3, 80 - tower[2] + 3, 1, 1, C.lit);
    });
    rect(ctx, 127, 38, 2, 42, C.brass);
    rect(ctx, 98, 58, 60, 1, C.brass);

    // Back bar: mirror and bottles.
    rect(ctx, 186, 30, 108, 14, C.black);
    label(ctx, 'JAZZ', 240, 41, amber);
    rect(ctx, 190, 50, 100, 52, C.wood);
    rect(ctx, 194, 54, 92, 44, '#243038');
    var bottles = ['#5fc48a', '#e8a23c', '#c8443f', '#e8dfcc', '#9a6be0', '#e879b0', '#3f5f8a'];
    [68, 84].forEach(function (shelf, row) {
      rect(ctx, 194, shelf, 92, 2, C.woodLight);
      for (var b = 0; b < 9; b++) {
        var bx = 198 + b * 10;
        rect(ctx, bx, shelf - 9, 4, 9, bottles[(b + row * 3) % bottles.length]);
        rect(ctx, bx + 1, shelf - 12, 2, 3, bottles[(b + row * 3) % bottles.length]);
      }
    });

    // Small tables with candles.
    [322, 370].forEach(function (x) {
      rect(ctx, x - 9, GROUND - 16, 18, 2, C.woodLight);
      rect(ctx, x - 1, GROUND - 14, 2, 14, C.wood);
      rect(ctx, x - 5, GROUND - 1, 10, 1, C.wood);
      rect(ctx, x - 1, GROUND - 20, 2, 4, C.bone);
      rect(ctx, x - 1, GROUND - 22, 2, 2, C.lit);
    });

    // A velvet armchair between them, for sitting and listening.
    var seat = places.jazz.seat;
    rect(ctx, seat - 11, GROUND - 32, 22, 22, C.velvet);      // back
    rect(ctx, seat - 11, GROUND - 32, 22, 1, C.brassDim);
    rect(ctx, seat - 14, GROUND - 19, 4, 17, C.velvetDark);   // arms
    rect(ctx, seat + 10, GROUND - 19, 4, 17, C.velvetDark);
    rect(ctx, seat - 10, GROUND - 10, 20, 6, C.velvet);       // cushion
    rect(ctx, seat - 10, GROUND - 4, 20, 2, C.velvetDark);
    rect(ctx, seat - 13, GROUND - 2, 2, 2, C.brassDim);       // feet
    rect(ctx, seat + 11, GROUND - 2, 2, 2, C.brassDim);

    // Stage: velvet curtain, spotlight, piano.
    var st = places.jazz.stage;
    rect(ctx, st, 14, JAZZ_W - st, GROUND - 14, C.velvet);
    for (var fold = st + 4; fold < JAZZ_W; fold += 9) rect(ctx, fold, 14, 3, GROUND - 14, C.velvetDark);
    rect(ctx, st, 10, JAZZ_W - st, 6, C.brass);
    for (var sc = st; sc < JAZZ_W; sc += 12) rect(ctx, sc + 2, 16, 8, 3, C.brassDim);
    ctx.fillStyle = 'rgba(232, 223, 204, 0.12)';
    ctx.beginPath();
    ctx.moveTo(438, 0);
    ctx.lineTo(398, GROUND - 8);
    ctx.lineTo(480, GROUND - 8);
    ctx.fill();

    lift(ctx, places.jazz.lift);
    chequeredFloor(ctx, JAZZ_W, '#241c2c', '#30263a');
    rect(ctx, st, GROUND - 8, JAZZ_W - st, 8, C.wood); // stage riser
    rect(ctx, st, GROUND - 8, JAZZ_W - st, 1, C.brass);
    return canvas;
  }

  // A speaker cabinet standing on the floor at `base`.
  function speaker(ctx, x, base) {
    rect(ctx, x, base - 40, 13, 40, C.black);
    rect(ctx, x + 1, base - 39, 11, 38, '#1c1a22');
    rect(ctx, x + 4, base - 36, 5, 5, C.steelDark);   // tweeter
    rect(ctx, x + 2, base - 28, 9, 9, C.steelDark);   // cones
    rect(ctx, x + 2, base - 15, 9, 9, C.steelDark);
  }

  // One stack on the floor beside the stage and one up on it: [x, base].
  var RAP_SPEAKERS = [[places.rap.stage - 15, GROUND], [RAP_W - 14, GROUND - 8]];

  // The stage truss lamps, and the moving heads over the dance floor: [x, colour].
  var RAP_LAMPS = [places.rap.stage + 12, places.rap.stage + 34, places.rap.stage + 56, places.rap.stage + 78];
  var RAP_HEADS = [[318, C.hot], [366, C.ultra]];
  // The LED strips on the wall behind the dance floor: [first x, how many, gap].
  var RAP_STRIPS = [300, 9, 10];
  var RAP_LASER = [390, 30];
  // The bottle-service table, and the top of the bottle where the sparkler burns.
  var RAP_TABLE = 156;
  var RAP_BOTTLE = [RAP_TABLE + 1, GROUND - 29];

  // The VIP corner: a rope across the way in, a leather banquette and a bottle-service table.
  function vipCorner(ctx) {
    var seat = places.rap.seat;
    var table = RAP_TABLE;

    // Quilted wall panel under a pin spot.
    rect(ctx, seat - 18, 70, 84, GROUND - 70, C.clubEdge);
    rect(ctx, seat - 18, 69, 84, 1, C.hot);
    for (var qy = 76; qy < GROUND - 26; qy += 6) {
      for (var qx = seat - 14 + (qy % 12 ? 0 : 4); qx < seat + 64; qx += 8) rect(ctx, qx, qy, 1, 1, C.club);
    }
    ctx.fillStyle = 'rgba(255, 79, 168, 0.08)';
    ctx.beginPath();
    ctx.moveTo(table, 27);
    ctx.lineTo(table - 44, GROUND);
    ctx.lineTo(table + 30, GROUND);
    ctx.fill();
    label(ctx, 'VIP', seat + 24, 62, C.hot);

    // Velvet rope between two chrome posts.
    [seat - 42, seat - 22].forEach(function (x) {
      rect(ctx, x, GROUND - 18, 2, 18, '#b9b3ad');
      rect(ctx, x - 1, GROUND - 20, 4, 2, C.bone);
      rect(ctx, x - 2, GROUND - 1, 6, 1, C.steel);
    });
    for (var link = 0; link < 18; link++) {
      var sag = Math.round(Math.sin((link + 0.5) / 18 * Math.PI) * 4);
      rect(ctx, seat - 40 + link, GROUND - 16 + sag, 1, 2, C.velvet);
      rect(ctx, seat - 40 + link, GROUND - 14 + sag, 1, 1, C.velvetDark);
    }

    // Black leather banquette, lit along the top and underneath.
    rect(ctx, seat - 14, GROUND - 26, 74, 26, '#1d1b27');
    rect(ctx, seat - 14, GROUND - 26, 74, 1, C.hot);
    for (var seam = seat - 6; seam < seat + 60; seam += 9) rect(ctx, seam, GROUND - 24, 1, 13, C.black);
    rect(ctx, seat - 14, GROUND - 10, 74, 6, '#2a2736');
    rect(ctx, seat - 14, GROUND - 10, 74, 1, '#3a3648');
    rect(ctx, seat - 14, GROUND - 4, 74, 4, C.black);
    rect(ctx, seat - 14, GROUND - 1, 74, 1, C.hot);
    rect(ctx, seat - 17, GROUND - 18, 4, 18, '#1d1b27');
    rect(ctx, seat + 59, GROUND - 18, 4, 18, '#1d1b27');

    // Low table: a bottle on ice and two flutes.
    rect(ctx, table - 12, GROUND - 12, 24, 2, C.steelDark);
    rect(ctx, table - 12, GROUND - 10, 24, 1, C.ultra);
    rect(ctx, table - 2, GROUND - 9, 4, 9, C.black);
    rect(ctx, table - 6, GROUND - 1, 12, 1, C.steelDark);
    rect(ctx, table + 1, GROUND - 27, 2, 8, C.acidDim);              // bottle
    rect(ctx, table + 1, GROUND - 28, 2, 3, C.lit);
    rect(ctx, table - 4, GROUND - 19, 8, 7, C.steel);                // ice bucket
    rect(ctx, table - 5, GROUND - 20, 10, 1, '#b9b3ad');
    rect(ctx, table - 3, GROUND - 18, 1, 5, '#b9b3ad');
    rect(ctx, table - 3, GROUND - 21, 2, 1, C.bone);
    rect(ctx, table + 3, GROUND - 21, 1, 1, C.bone);
    [table - 10, table + 7].forEach(function (x) {
      rect(ctx, x, GROUND - 18, 3, 3, 'rgba(232, 223, 204, 0.55)');
      rect(ctx, x, GROUND - 17, 3, 2, C.lit);
      rect(ctx, x + 1, GROUND - 15, 1, 3, C.bone);
    });
  }

  function buildRap() {
    var canvas = layer(RAP_W);
    var ctx = canvas.getContext('2d');
    var st = places.rap.stage;

    // Matte black panels, darker towards the floor.
    rect(ctx, 0, 0, RAP_W, GROUND, C.club);
    for (var seam = 22; seam < RAP_W; seam += 24) rect(ctx, seam, 28, 1, GROUND - 28, C.clubEdge);
    ctx.fillStyle = 'rgba(12, 10, 16, 0.35)';
    ctx.fillRect(0, 104, RAP_W, GROUND - 104);

    // Black ceiling, a cove of blue light and a lighting truss the length of the room.
    rect(ctx, 0, 0, RAP_W, 19, C.black);
    ctx.fillStyle = 'rgba(77, 107, 255, 0.10)';
    ctx.fillRect(0, 19, RAP_W, 14);
    rect(ctx, 0, 19, RAP_W, 1, C.ultra);
    rect(ctx, 0, 21, RAP_W, 1, C.steel);
    rect(ctx, 0, 26, RAP_W, 1, C.steelDark);
    for (var brace = 2; brace < RAP_W; brace += 6) rect(ctx, brace, 22, 1, 4, C.steelDark);
    RAP_HEADS.forEach(function (head) {
      rect(ctx, head[0] - 1, 27, 7, 2, C.steelDark);
      rect(ctx, head[0], 29, 5, 4, C.steel);
    });
    rect(ctx, RAP_LASER[0] - 2, 27, 5, 3, C.steel);

    // LED strips up the wall behind the dance floor, unlit.
    for (var strip = 0; strip < RAP_STRIPS[1]; strip++) {
      rect(ctx, RAP_STRIPS[0] + strip * RAP_STRIPS[2], 36, 2, 72, C.ultraDim);
    }
    vipCorner(ctx);

    // Neon sign over the bar: the name inside a tube bent into a lozenge.
    rect(ctx, 214, 32, 52, 1, C.hot);
    rect(ctx, 214, 48, 52, 1, C.hot);
    rect(ctx, 211, 35, 1, 11, C.hot);
    rect(ctx, 268, 35, 1, 11, C.hot);
    [[213, 33], [212, 34], [266, 33], [267, 34], [212, 46], [213, 47], [267, 46], [266, 47]].forEach(function (bend) {
      rect(ctx, bend[0], bend[1], 1, 1, C.hot);
    });
    label(ctx, 'RAP', 240, 44, C.acid);

    // Back bar: bottles on glass shelves, each lit along its edge.
    rect(ctx, 190, 54, 100, 50, C.black);
    rect(ctx, 192, 56, 96, 46, '#0a0e1a');
    var bottles = ['#e8dfcc', '#c9a45c', '#6fd6e0', '#e879b0', '#e8a23c', '#b9a0e0'];
    [68, 81, 94].forEach(function (shelf, row) {
      ctx.fillStyle = 'rgba(77, 107, 255, 0.16)';
      ctx.fillRect(192, shelf - 10, 96, 10);
      for (var b = 0; b < 11; b++) {
        var bx = 196 + b * 8 + (b > 5 ? 4 : 0);
        rect(ctx, bx, shelf - 7, 4, 7, bottles[(b + row * 2) % bottles.length]);
        rect(ctx, bx + 1, shelf - 10, 2, 3, bottles[(b + row * 2) % bottles.length]);
      }
      rect(ctx, 192, shelf, 96, 1, C.ultra);
    });

    // Stage: black backdrop, an LED screen, a blue wash and a speaker stack each side.
    rect(ctx, st, 19, RAP_W - st, GROUND - 19, C.black);
    rect(ctx, st, 19, 2, GROUND - 19, C.steelDark);
    rect(ctx, st + 2, 24, RAP_W - st - 2, 2, C.steel); // lighting truss
    RAP_LAMPS.forEach(function (lamp) { rect(ctx, lamp, 26, 5, 4, C.ultra); });
    ctx.fillStyle = 'rgba(77, 107, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(438, 28);
    ctx.lineTo(st, GROUND - 8);
    ctx.lineTo(RAP_W, GROUND - 8);
    ctx.fill();
    rect(ctx, st + 24, 32, 54, 42, C.steelDark); // LED screen
    rect(ctx, st + 25, 33, 52, 40, '#080b14');

    lift(ctx, places.rap.lift);

    // Polished black floor, catching the lights: [x, y, width, colour].
    rect(ctx, 0, GROUND, RAP_W, VIEW_H - GROUND, '#0a0b12');
    rect(ctx, 0, GROUND, RAP_W, 1, C.ultraDim);
    [
      [108, 4, 70, C.hot], [124, 13, 38, C.hot], [204, 6, 72, C.hot], [222, 15, 36, C.acid],
      [302, 5, 78, C.ultra], [318, 12, 46, C.ultra], [334, 20, 22, C.acid], [st + 14, 5, 52, C.acid], [st + 26, 16, 28, C.ultra]
    ].forEach(function (shine) {
      ctx.globalAlpha = 0.14;
      rect(ctx, shine[0], GROUND + shine[1], shine[2], 1, shine[3]);
    });
    ctx.globalAlpha = 1;

    rect(ctx, st, GROUND - 8, RAP_W - st, 8, C.clubEdge); // stage riser
    rect(ctx, st, GROUND - 8, RAP_W - st, 1, C.acid);
    RAP_SPEAKERS.forEach(function (at) { speaker(ctx, at[0], at[1]); });
    return canvas;
  }

  // One stack on the floor beside the stage: [x, base].
  var HIPHOP_SPEAKERS = [[places.hiphop.stage - 15, GROUND]];
  // Framed records on the wall: [x, y, label colour]. The first one turns.
  var HIPHOP_RECORDS = [[92, 62, C.violet], [124, 62, C.lit], [156, 62, C.pink]];
  // The neon ring behind the band: [x, y, radius].
  var HIPHOP_HALO = [places.hiphop.stage + 40, 62, 20];

  // The neon sign over the counter and the ring behind the band.
  function hiphopNeon(ctx, camX, color) {
    rect(ctx, 212 - camX, 33, 56, 1, color);
    rect(ctx, 212 - camX, 46, 56, 1, color);
    rect(ctx, 212 - camX, 33, 1, 14, color);
    rect(ctx, 267 - camX, 33, 1, 14, color);
    label(ctx, 'R&B', 240 - camX, 44, color);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(HIPHOP_HALO[0] - camX, HIPHOP_HALO[1], HIPHOP_HALO[2], 0, Math.PI * 2);
    ctx.stroke();
  }

  function buildHiphop() {
    var canvas = layer(HIPHOP_W);
    var ctx = canvas.getContext('2d');
    var st = places.hiphop.stage;

    // Heavy curtains all the way round, darker towards the floor.
    rect(ctx, 0, 0, HIPHOP_W, GROUND, C.drape);
    for (var fold = 5; fold < HIPHOP_W; fold += 11) rect(ctx, fold, 0, 4, GROUND, C.drapeDark);
    ctx.fillStyle = 'rgba(12, 10, 16, 0.35)';
    ctx.fillRect(0, 104, HIPHOP_W, GROUND - 104);
    rect(ctx, 0, 0, HIPHOP_W, 8, C.black);
    rect(ctx, 0, 8, HIPHOP_W, 1, C.violetDim);

    // Low pendant lamps.
    [110, 340].forEach(function (x) {
      ctx.fillStyle = 'rgba(154, 107, 224, 0.08)';
      ctx.beginPath();
      ctx.moveTo(x + 2, 30);
      ctx.lineTo(x - 36, GROUND);
      ctx.lineTo(x + 40, GROUND);
      ctx.fill();
      rect(ctx, x + 2, 9, 1, 15, C.brassDim);
      rect(ctx, x - 2, 24, 9, 3, C.brass);
      rect(ctx, x, 27, 5, 3, C.lilac);
    });

    // Framed records.
    HIPHOP_RECORDS.forEach(function (record) {
      rect(ctx, record[0] - 11, record[1] - 11, 22, 22, C.brassDim);
      rect(ctx, record[0] - 10, record[1] - 10, 20, 20, C.wallEdge);
      ctx.fillStyle = C.black;
      ctx.beginPath();
      ctx.arc(record[0], record[1], 8, 0, Math.PI * 2);
      ctx.fill();
      rect(ctx, record[0] - 2, record[1] - 2, 4, 4, record[2]);
      rect(ctx, record[0], record[1], 1, 1, C.black);
    });

    // Neon sign over the counter, unlit.
    rect(ctx, 212, 33, 56, 14, C.black);

    // Back bar, lit from behind.
    rect(ctx, 190, 52, 100, 52, C.wood);
    rect(ctx, 194, 56, 92, 44, C.drapeDark);
    ctx.fillStyle = 'rgba(154, 107, 224, 0.22)';
    ctx.fillRect(194, 56, 92, 44);
    var bottles = ['#e8dfcc', '#b9a0e0', '#e8a23c', '#e879b0', '#6fd6e0', '#c9993a'];
    [72, 90].forEach(function (shelf, row) {
      rect(ctx, 194, shelf, 92, 2, C.violetDim);
      for (var b = 0; b < 9; b++) {
        var bx = 198 + b * 10;
        rect(ctx, bx, shelf - 9, 4, 9, bottles[(b + row * 2) % bottles.length]);
        rect(ctx, bx + 1, shelf - 12, 2, 3, bottles[(b + row * 2) % bottles.length]);
      }
    });

    // A velvet booth.
    rect(ctx, 304, GROUND - 26, 72, 26, C.violetDim);
    rect(ctx, 304, GROUND - 26, 72, 1, '#6b4a9c');
    for (var tuft = 312; tuft < 376; tuft += 12) {
      rect(ctx, tuft, GROUND - 21, 1, 1, C.drapeDark);
      rect(ctx, tuft + 6, GROUND - 15, 1, 1, C.drapeDark);
    }
    rect(ctx, 304, GROUND - 10, 72, 6, '#6b4a9c');
    rect(ctx, 304, GROUND - 4, 72, 4, C.black);
    rect(ctx, 301, GROUND - 18, 4, 18, C.violetDim);
    rect(ctx, 375, GROUND - 18, 4, 18, C.violetDim);

    // Stage: a dark backdrop, a violet wash and the unlit ring.
    rect(ctx, st, 9, HIPHOP_W - st, GROUND - 9, '#120c1e');
    for (var pleat = st + 8; pleat < HIPHOP_W; pleat += 10) rect(ctx, pleat, 9, 1, GROUND - 9, C.drapeDark);
    rect(ctx, st, 9, 2, GROUND - 9, C.violetDim);
    ctx.fillStyle = 'rgba(154, 107, 224, 0.10)';
    ctx.beginPath();
    ctx.moveTo(HIPHOP_HALO[0], 9);
    ctx.lineTo(st, GROUND - 8);
    ctx.lineTo(HIPHOP_W, GROUND - 8);
    ctx.fill();
    hiphopNeon(ctx, 0, C.violetDim);

    lift(ctx, places.hiphop.lift);

    // Polished floor, catching the neon.
    rect(ctx, 0, GROUND, HIPHOP_W, VIEW_H - GROUND, '#15101f');
    rect(ctx, 0, GROUND, HIPHOP_W, 1, C.violetDim);
    ctx.fillStyle = 'rgba(154, 107, 224, 0.10)';
    [[204, 6, 72], [222, 15, 36], [st + 14, 5, 52], [st + 26, 16, 28], [96, 9, 30], [330, 11, 30]].forEach(function (shine) {
      ctx.fillRect(shine[0], GROUND + shine[1], shine[2], 1);
    });
    rect(ctx, st, GROUND - 8, HIPHOP_W - st, 8, C.drapeDark); // stage riser
    rect(ctx, st, GROUND - 8, HIPHOP_W - st, 1, C.violet);
    HIPHOP_SPEAKERS.forEach(function (at) { speaker(ctx, at[0], at[1]); });
    return canvas;
  }

  // A small pixel heart with its top-left corner at x, y.
  function heart(ctx, x, y, color) {
    rect(ctx, x + 1, y, 2, 1, color);
    rect(ctx, x + 4, y, 2, 1, color);
    rect(ctx, x, y + 1, 7, 2, color);
    rect(ctx, x + 1, y + 3, 5, 1, color);
    rect(ctx, x + 2, y + 4, 3, 1, color);
    rect(ctx, x + 3, y + 5, 1, 1, color);
  }

  // The light-up dance floor: [x, columns]. Tiles match the chequered floor.
  var POP_DANCE = [300, 6];
  var POP_BALL = [348, 24];
  var POP_LIGHTS = [C.pink, C.lilac, C.cyan];

  function buildPop() {
    var canvas = layer(POP_W);
    var ctx = canvas.getContext('2d');
    var st = places.pop.stage;

    rect(ctx, 0, 0, POP_W, GROUND, C.plum);
    rect(ctx, 0, 100, POP_W, GROUND - 100, C.plumDark);
    rect(ctx, 0, 99, POP_W, 1, C.pinkDim);
    rect(ctx, 0, 0, POP_W, 6, C.black);
    rect(ctx, 0, 6, POP_W, 1, C.pinkDim);

    // Framed posters: [x, y, colour, shape].
    [[78, 38, C.cyan, 'star'], [108, 46, C.pink, 'heart'], [138, 38, C.lilac, 'disc'], [308, 52, C.lit, 'heart'], [368, 52, C.cyan, 'disc']].forEach(function (poster) {
      var x = poster[0];
      var y = poster[1];
      rect(ctx, x, y, 22, 30, C.bone);
      rect(ctx, x + 1, y + 1, 20, 28, poster[2]);
      rect(ctx, x + 1, y + 20, 20, 9, C.black);
      rect(ctx, x + 4, y + 23, 14, 1, C.bone);
      rect(ctx, x + 7, y + 26, 8, 1, C.bone);
      if (poster[3] === 'heart') heart(ctx, x + 8, y + 7, C.black);
      if (poster[3] === 'disc') {
        rect(ctx, x + 7, y + 5, 8, 10, C.black);
        rect(ctx, x + 6, y + 7, 10, 6, C.black);
        rect(ctx, x + 10, y + 9, 2, 2, poster[2]);
      }
      if (poster[3] === 'star') {
        rect(ctx, x + 10, y + 4, 2, 12, C.black);
        rect(ctx, x + 5, y + 9, 12, 2, C.black);
        rect(ctx, x + 8, y + 7, 6, 6, C.black);
      }
    });

    // Neon sign over the counter, a heart either side of the name.
    ctx.fillStyle = 'rgba(232, 121, 176, 0.12)';
    ctx.fillRect(194, 26, 92, 26);
    rect(ctx, 208, 33, 64, 14, C.black);
    rect(ctx, 208, 33, 64, 1, C.pink);
    rect(ctx, 208, 46, 64, 1, C.pink);
    rect(ctx, 208, 33, 1, 14, C.pink);
    rect(ctx, 271, 33, 1, 14, C.pink);
    label(ctx, 'POP', 240, 44, C.pink);
    heart(ctx, 213, 37, C.pink);
    heart(ctx, 260, 37, C.pink);

    // Soda fountain: sundae glasses on mirrored shelves, syrup taps below.
    rect(ctx, 190, 54, 100, 50, C.bone);
    rect(ctx, 192, 56, 96, 46, '#3a1f44');
    var scoops = [C.pink, C.bone, C.lilac, '#7a4a2b', C.cyan, C.lit];
    [70, 86].forEach(function (shelf, row) {
      rect(ctx, 192, shelf, 96, 2, C.pink);
      for (var g = 0; g < 8; g++) {
        var gx = 197 + g * 12;
        rect(ctx, gx, shelf - 7, 6, 3, 'rgba(232, 223, 204, 0.55)'); // bowl
        rect(ctx, gx + 1, shelf - 4, 4, 2, 'rgba(232, 223, 204, 0.55)');
        rect(ctx, gx + 2, shelf - 2, 2, 2, C.bone);                  // stem
        rect(ctx, gx + 1, shelf - 10, 4, 3, scoops[(g + row * 2) % scoops.length]);
        rect(ctx, gx + 2, shelf - 11, 1, 1, '#c8443f');              // cherry
      }
    });
    [200, 210, 270, 280].forEach(function (x, i) { // syrup taps
      rect(ctx, x, 91, 3, 9, '#b9b3ad');
      rect(ctx, x - 1, 90, 5, 2, POP_LIGHTS[i % 3]);
      rect(ctx, x + 3, 96, 2, 1, '#b9b3ad');
    });

    // Disco ball.
    var ball = POP_BALL;
    rect(ctx, ball[0], 6, 1, ball[1] - 14, '#b9b3ad');
    ctx.fillStyle = '#8d9099';
    ctx.beginPath();
    ctx.arc(ball[0] + 0.5, ball[1], 8, 0, Math.PI * 2);
    ctx.fill();
    for (var fy = -6; fy <= 6; fy += 3) {
      for (var fx = -6; fx <= 6; fx += 3) {
        if (fx * fx + fy * fy > 49) continue;
        rect(ctx, ball[0] + fx - 1, ball[1] + fy - 1, 2, 2, (fx + fy) % 2 ? '#c9ccd4' : C.steel);
      }
    }

    // Round stools by the posters.
    [128, 152].forEach(function (x) {
      rect(ctx, x - 6, GROUND - 13, 12, 4, C.pink);
      rect(ctx, x - 5, GROUND - 14, 10, 1, '#f3a6cc');
      rect(ctx, x - 1, GROUND - 9, 2, 9, '#b9b3ad');
      rect(ctx, x - 4, GROUND - 1, 8, 1, '#b9b3ad');
    });

    // Stage: a glitter streamer curtain under a pink pelmet.
    rect(ctx, st, 14, POP_W - st, GROUND - 14, '#3a1f44');
    var streamers = [C.pinkDim, '#5d3f8a', '#3f6f8a'];
    for (var sx = st + 1, n = 0; sx < POP_W; sx += 3, n++) {
      rect(ctx, sx, 14, 2, GROUND - 14, streamers[n % 3]);
      for (var sy = 18 + (n * 7) % 11; sy < GROUND - 8; sy += 11 + (n * 5) % 7) {
        rect(ctx, sx, sy, 1, 2, n % 2 ? C.bone : POP_LIGHTS[n % 3]);
      }
    }
    rect(ctx, st, 10, POP_W - st, 6, C.pink);
    rect(ctx, st, 16, POP_W - st, 1, C.pinkDim);
    ctx.fillStyle = 'rgba(232, 121, 176, 0.14)';
    ctx.beginPath();
    ctx.moveTo(438, 0);
    ctx.lineTo(st, GROUND - 8);
    ctx.lineTo(POP_W, GROUND - 8);
    ctx.fill();

    lift(ctx, places.pop.lift);
    chequeredFloor(ctx, POP_W, '#261a2e', '#32223c');
    rect(ctx, 0, GROUND, POP_W, 1, C.pinkDim);
    rect(ctx, POP_DANCE[0] - 1, GROUND + 1, POP_DANCE[1] * 16 + 2, VIEW_H - GROUND - 1, C.black); // dance floor, unlit
    rect(ctx, st, GROUND - 8, POP_W - st, 8, '#3a1f44'); // stage riser
    rect(ctx, st, GROUND - 8, POP_W - st, 1, C.pink);
    return canvas;
  }

  // A guitar amp standing on the floor at `base`.
  function amp(ctx, x, base) {
    rect(ctx, x, base - 30, 14, 30, C.black);
    rect(ctx, x + 1, base - 26, 12, 25, '#3a3530');   // grille cloth
    rect(ctx, x + 1, base - 29, 12, 3, C.steelDark);  // control panel
    for (var knob = x + 2; knob < x + 9; knob += 2) rect(ctx, knob, base - 28, 1, 1, C.bone);
    rect(ctx, x + 1, base - 14, 12, 1, C.black);      // two cabinets stacked
  }

  // One amp on the floor beside the stage and one up on it: [x, base].
  var ROCK_AMPS = [[places.rock.stage - 16, GROUND], [places.rock.stage + 20, GROUND - 8]];
  // Bulbs strung in swags below the ceiling: [x, y].
  var ROCK_BULBS = [];
  for (var bulb = 70; bulb < places.rock.stage - 6; bulb += 12) {
    ROCK_BULBS.push([bulb, 15 + Math.round(Math.sin(((bulb - 70) % 72) / 72 * Math.PI) * 5)]);
  }
  var ROCK_LIGHTS = [C.lit, C.red, C.bone];

  function buildRock() {
    var canvas = layer(ROCK_W);
    var ctx = canvas.getContext('2d');
    var st = places.rock.stage;

    // Painted breeze blocks, with a strip of wood panelling below.
    rect(ctx, 0, 0, ROCK_W, GROUND, C.block);
    for (var by = 12; by < 104; by += 12) {
      rect(ctx, 0, by, ROCK_W, 1, C.blockDark);
      for (var bx = (by / 12) % 2 ? 0 : 12; bx < ROCK_W; bx += 24) rect(ctx, bx, by - 11, 1, 11, C.blockDark);
    }
    rect(ctx, 0, 104, ROCK_W, GROUND - 104, C.wood);
    for (var plank = 6; plank < ROCK_W; plank += 11) rect(ctx, plank, 105, 1, GROUND - 105, '#2f211b');
    rect(ctx, 0, 103, ROCK_W, 2, C.woodLight);
    rect(ctx, 0, 0, ROCK_W, 8, C.black);
    rect(ctx, 0, 8, ROCK_W, 1, C.steelDark);

    // The string-light wire; the bulbs are lit in front.
    ROCK_BULBS.forEach(function (at, i) {
      var next = ROCK_BULBS[i + 1];
      if (!next) return;
      rect(ctx, at[0], at[1] - 1, 7, 1, C.black);
      rect(ctx, at[0] + 6, next[1] - 1, 7, 1, C.black);
    });

    // Roll-up garage door, half covered in flyers.
    rect(ctx, 76, 30, 88, 74, C.steelDark);
    rect(ctx, 78, 32, 84, 72, '#4a4e56');
    for (var slat = 37; slat < 104; slat += 6) rect(ctx, 78, slat, 84, 1, C.steelDark);
    rect(ctx, 116, 98, 8, 2, C.steel); // handle
    // Flyers: [x, y, w, h, paper, ink].
    [[82, 38, 15, 20, C.bone, C.red], [99, 44, 13, 17, C.lit, C.black], [128, 36, 16, 22, C.red, C.bone],
     [146, 48, 12, 16, C.bone, C.black], [88, 66, 14, 18, '#6fd6e0', C.black], [134, 68, 15, 19, C.bone, C.red],
     [306, 40, 16, 22, C.bone, C.black], [326, 48, 14, 18, C.red, C.bone], [344, 38, 15, 20, C.lit, C.black],
     [364, 50, 13, 17, C.bone, C.red]].forEach(function (flyer) {
      var x = flyer[0];
      var y = flyer[1];
      rect(ctx, x, y, flyer[2], flyer[3], flyer[4]);
      rect(ctx, x + 2, y + 2, flyer[2] - 4, 6, flyer[5]);               // picture
      rect(ctx, x + 2, y + 10, flyer[2] - 4, 1, flyer[5]);              // lines of type
      rect(ctx, x + 2, y + 12, flyer[2] - 7, 1, flyer[5]);
      rect(ctx, x + Math.floor(flyer[2] / 2), y - 1, 2, 2, C.steel);    // tape
    });

    // Neon sign over the merch table.
    ctx.fillStyle = 'rgba(200, 68, 63, 0.12)';
    ctx.fillRect(194, 20, 92, 26);
    rect(ctx, 206, 26, 68, 14, C.black);
    rect(ctx, 206, 26, 68, 1, C.red);
    rect(ctx, 206, 39, 68, 1, C.red);
    rect(ctx, 206, 26, 1, 14, C.red);
    rect(ctx, 273, 26, 1, 14, C.red);
    label(ctx, 'INDIE', 240, 37, C.red);

    // Merch wall: band tees on a rail, records in a crate rack below.
    rect(ctx, 190, 46, 100, 58, C.black);
    rect(ctx, 192, 48, 96, 54, '#2d2a2e');
    rect(ctx, 194, 51, 92, 1, C.steel); // rail
    [C.bone, C.red, '#34303d', C.lit, C.bone, '#3f5f8a'].forEach(function (tee, i) {
      var tx = 197 + i * 15;
      rect(ctx, tx + 5, 50, 1, 3, C.steel);        // hanger
      rect(ctx, tx, 53, 11, 4, tee);               // shoulders and sleeves
      rect(ctx, tx + 2, 57, 7, 11, tee);
      rect(ctx, tx + 4, 53, 3, 1, '#2d2a2e');      // collar
      rect(ctx, tx + 4, 60, 3, 3, i % 2 ? C.black : C.red); // print
    });
    rect(ctx, 192, 74, 96, 2, C.woodLight);
    var sleeves = [C.red, C.bone, '#3f5f8a', C.lit, '#646b3c', '#6a3c6e', C.black, C.bone];
    for (var r = 0; r < 23; r++) {
      rect(ctx, 195 + r * 4, 78 + (r * 5) % 3, 3, 22 - (r * 5) % 3, sleeves[(r * 3) % sleeves.length]);
    }
    rect(ctx, 192, 96, 96, 6, C.wood); // front of the crates
    rect(ctx, 239, 76, 2, 26, C.wood);

    // A worn sofa under the flyers.
    rect(ctx, 304, GROUND - 22, 40, 12, '#5a4a3a');   // back
    rect(ctx, 305, GROUND - 21, 38, 1, '#6f5c48');
    rect(ctx, 300, GROUND - 16, 6, 14, '#4a3c2e');    // arms
    rect(ctx, 342, GROUND - 16, 6, 14, '#4a3c2e');
    rect(ctx, 306, GROUND - 11, 36, 7, '#6f5c48');    // cushions
    rect(ctx, 323, GROUND - 11, 1, 7, '#4a3c2e');
    rect(ctx, 304, GROUND - 4, 40, 2, '#4a3c2e');
    rect(ctx, 302, GROUND - 2, 3, 2, C.black);        // feet
    rect(ctx, 343, GROUND - 2, 3, 2, C.black);
    rect(ctx, 312, GROUND - 9, 5, 3, C.red);          // a patch
    // A guitar case leaning on the wall.
    rect(ctx, 366, GROUND - 34, 6, 14, C.black);
    rect(ctx, 364, GROUND - 20, 10, 20, C.black);
    rect(ctx, 367, GROUND - 12, 4, 1, C.brassDim);

    // Stage: a painted backdrop, a lighting bar and the band's banner.
    rect(ctx, st, 9, ROCK_W - st, GROUND - 9, '#16141a');
    rect(ctx, st, 9, 2, GROUND - 9, C.steelDark);
    rect(ctx, st + 2, 14, ROCK_W - st - 2, 2, C.steel);
    for (var lamp = st + 10; lamp < ROCK_W; lamp += 20) {
      rect(ctx, lamp, 16, 5, 4, lamp % 40 < 20 ? C.red : C.lit);
    }
    rect(ctx, st + 14, 28, 60, 18, C.bone);            // banner
    rect(ctx, st + 14, 28, 60, 1, C.red);
    rect(ctx, st + 14, 45, 60, 1, C.red);
    label(ctx, 'THE MOTHS', st + 44, 41, C.black);
    rect(ctx, st + 16, 24, 1, 4, C.steel);             // ties
    rect(ctx, st + 71, 24, 1, 4, C.steel);
    ctx.fillStyle = 'rgba(200, 68, 63, 0.13)';
    ctx.beginPath();
    ctx.moveTo(438, 18);
    ctx.lineTo(st, GROUND - 8);
    ctx.lineTo(ROCK_W, GROUND - 8);
    ctx.fill();

    lift(ctx, places.rock.lift);

    // Scuffed floorboards, and a rug on the stage for the drums.
    rect(ctx, 0, GROUND, ROCK_W, VIEW_H - GROUND, '#33261f');
    for (var row = 0; row < 3; row++) {
      rect(ctx, 0, GROUND + row * 10, ROCK_W, 1, '#241a15');
      for (var end = 14 + row * 23; end < ROCK_W; end += 61) rect(ctx, end, GROUND + row * 10, 1, 10, '#241a15');
    }
    rect(ctx, 0, GROUND, ROCK_W, 1, C.woodLight);
    for (var tape = 150; tape < 180; tape += 6) rect(ctx, tape, GROUND + 14, 4, 1, C.lit); // gaffer tape cross
    rect(ctx, st, GROUND - 8, ROCK_W - st, 8, C.black); // stage riser
    rect(ctx, st, GROUND - 8, ROCK_W - st, 1, C.red);
    rect(ctx, 440, GROUND - 10, 40, 2, C.velvet);       // rug
    for (var fringe = 441; fringe < ROCK_W; fringe += 4) rect(ctx, fringe, GROUND - 10, 2, 1, C.lit);
    ROCK_AMPS.forEach(function (at) { amp(ctx, at[0], at[1]); });
    return canvas;
  }

  // ---------- The band ----------
  // Instruments are drawn in front of the players, with hands that move in time.

  var STAGE_FLOOR = GROUND - 8;

  function mic(ctx, x, time) {
    rect(ctx, x + 6, STAGE_FLOOR - 21, 1, 21, C.brassDim);
    rect(ctx, x + 3, STAGE_FLOOR - 1, 7, 1, C.brassDim);
    rect(ctx, x + 4, STAGE_FLOOR - 25, 5, 4, '#b9b3ad');
    rect(ctx, x + 5, STAGE_FLOOR - 24, 3, 2, C.black);
  }

  function bass(ctx, x, time, skin) {
    var beat = Math.floor(time / 300) % 4;
    rect(ctx, x + 5, STAGE_FLOOR - 44, 4, 3, '#2a160c');            // scroll
    rect(ctx, x + 6, STAGE_FLOOR - 41, 2, 20, '#2a160c');           // neck
    rect(ctx, x + 3, STAGE_FLOOR - 23, 8, 9, '#7a4a1f');            // upper body
    rect(ctx, x + 4, STAGE_FLOOR - 22, 6, 7, '#a8652c');
    rect(ctx, x + 1, STAGE_FLOOR - 14, 12, 13, '#7a4a1f');          // lower body
    rect(ctx, x + 2, STAGE_FLOOR - 13, 10, 11, '#a8652c');
    rect(ctx, x + 3, STAGE_FLOOR - 9, 1, 4, C.black);               // f-holes
    rect(ctx, x + 10, STAGE_FLOOR - 9, 1, 4, C.black);
    rect(ctx, x + 6, STAGE_FLOOR - 41, 1, 36, C.bone);              // string
    rect(ctx, x + 6, STAGE_FLOOR, 2, 1, C.brassDim);                // end pin
    rect(ctx, x + 4, STAGE_FLOOR - 36 + (beat % 2) * 5, 4, 2, skin); // hand walking the neck
    rect(ctx, x + 5 + (beat < 2 ? 0 : 2), STAGE_FLOOR - 16, 3, 2, skin); // hand plucking
  }

  function piano(ctx, x, time, skin) {
    var beat = Math.floor(time / 220) % 4;
    rect(ctx, x - 17, STAGE_FLOOR - 16, 34, 16, C.black);           // body
    rect(ctx, x - 16, STAGE_FLOOR - 15, 32, 1, '#2d2339');
    rect(ctx, x - 17, STAGE_FLOOR - 19, 34, 3, C.bone);             // keys
    for (var k = x - 15; k < x + 16; k += 4) rect(ctx, k, STAGE_FLOOR - 19, 2, 2, C.black);
    rect(ctx, x - 15, STAGE_FLOOR - 4, 2, 4, C.brassDim);           // legs
    rect(ctx, x + 13, STAGE_FLOOR - 4, 2, 4, C.brassDim);
    rect(ctx, x - 11 + [0, 3, 1, 5][beat], STAGE_FLOOR - 21 - (beat % 2), 4, 2, skin);
    rect(ctx, x + 4 + [2, 0, 4, 1][beat], STAGE_FLOOR - 21 - ((beat + 1) % 2), 4, 2, skin);
  }

  // Notes drifting up from the stage.
  function notes(ctx, x, time) {
    for (var n = 0; n < 4; n++) {
      var life = ((time / 3200) + n / 4) % 1;
      var nx = Math.round(x + n * 17 + Math.sin(life * 6 + n) * 4);
      var ny = Math.round(STAGE_FLOOR - 52 - life * 34);
      ctx.globalAlpha = life < 0.75 ? 0.9 : (1 - life) * 3.6;
      rect(ctx, nx, ny + 4, 3, 2, C.lit);
      rect(ctx, nx + 2, ny, 1, 5, C.lit);
      if (n % 2) rect(ctx, nx + 3, ny, 2, 1, C.lit);
    }
    ctx.globalAlpha = 1;
  }

  // A table with two turntables and a mixer between them.
  function decks(ctx, x, time, skin) {
    var beat = Math.floor(time / 180) % 4;
    rect(ctx, x - 15, STAGE_FLOOR - 15, 30, 15, C.black);           // table
    rect(ctx, x - 14, STAGE_FLOOR - 14, 28, 1, C.steelDark);
    rect(ctx, x - 15, STAGE_FLOOR - 18, 30, 3, C.steel);            // top
    rect(ctx, x - 13, STAGE_FLOOR - 20, 9, 2, '#1c1a22');           // records
    rect(ctx, x + 4, STAGE_FLOOR - 20, 9, 2, '#1c1a22');
    rect(ctx, x - 9, STAGE_FLOOR - 20, 1, 1, C.neon);
    rect(ctx, x + 8, STAGE_FLOOR - 20, 1, 1, C.neon);
    rect(ctx, x - 2, STAGE_FLOOR - 20, 4, 2, C.steelDark);          // mixer
    rect(ctx, x - 2 + (beat % 2) * 2, STAGE_FLOOR - 21, 2, 1, C.lit);
    rect(ctx, x - 9, STAGE_FLOOR - 9, 18, 1, C.neonDim);
    rect(ctx, x - 6, STAGE_FLOOR - 6, 12, 1, C.neonDim);
    rect(ctx, x - 12 + [0, 3, 1, 4][beat], STAGE_FLOOR - 22, 4, 2, skin); // hand scratching
    rect(ctx, x + 5 + [1, 0, 2, 0][beat], STAGE_FLOOR - 22 - (beat === 2 ? 1 : 0), 4, 2, skin);
  }

  // A keytar worn on a strap, the neck pointing up and away.
  function keytar(ctx, x, time, skin) {
    var beat = Math.floor(time / 200) % 4;
    rect(ctx, x - 9, STAGE_FLOOR - 20, 14, 7, C.pink);              // body
    rect(ctx, x - 9, STAGE_FLOOR - 14, 14, 1, C.pinkDim);
    rect(ctx, x - 8, STAGE_FLOOR - 19, 12, 3, C.bone);              // keys
    for (var k = x - 7; k < x + 4; k += 3) rect(ctx, k, STAGE_FLOOR - 19, 1, 2, C.black);
    rect(ctx, x + 5, STAGE_FLOOR - 21, 4, 3, C.lilac);              // neck
    rect(ctx, x + 9, STAGE_FLOOR - 23, 4, 3, C.lilac);
    rect(ctx, x + 13, STAGE_FLOOR - 25, 3, 3, C.bone);
    rect(ctx, x - 7 + [0, 4, 2, 6][beat], STAGE_FLOOR - 20 - (beat % 2), 3, 2, skin); // hand on the keys
    rect(ctx, x + 8 + (beat < 2 ? 0 : 2), STAGE_FLOOR - 24 + (beat < 2 ? 1 : 0), 3, 2, skin); // hand on the neck
  }

  // An electric guitar on a strap, the neck pointing up and away.
  function guitar(ctx, x, time, skin) {
    var beat = Math.floor(time / 160) % 4;
    rect(ctx, x - 10, STAGE_FLOOR - 20, 13, 10, C.red);             // body
    rect(ctx, x - 12, STAGE_FLOOR - 18, 2, 7, C.red);
    rect(ctx, x - 10, STAGE_FLOOR - 11, 13, 1, C.redDim);
    rect(ctx, x - 7, STAGE_FLOOR - 18, 7, 6, C.bone);               // scratch plate
    rect(ctx, x - 6, STAGE_FLOOR - 17, 5, 1, C.black);              // pickups
    rect(ctx, x - 6, STAGE_FLOOR - 14, 5, 1, C.black);
    rect(ctx, x + 3, STAGE_FLOOR - 20, 4, 3, C.lit);                // neck
    rect(ctx, x + 7, STAGE_FLOOR - 22, 4, 3, C.lit);
    rect(ctx, x + 11, STAGE_FLOOR - 24, 4, 3, C.lit);
    rect(ctx, x + 15, STAGE_FLOOR - 28, 3, 5, C.red);               // headstock
    rect(ctx, x - 6 + (beat % 2) * 2, STAGE_FLOOR - 19 + [0, 4, 1, 4][beat], 3, 2, skin); // hand strumming
    rect(ctx, x + 6 + [0, 3, 5, 2][beat], STAGE_FLOOR - 23 - (beat > 1 ? 1 : 0), 3, 2, skin); // hand on the neck
  }

  // A drum kit: kick in the middle, snare and hi-hat one side, a tom and a crash the other.
  function drums(ctx, x, time, skin) {
    var beat = Math.floor(time / 160) % 4;
    var crash = beat === 0 ? 1 : 0;
    rect(ctx, x - 17, STAGE_FLOOR - 26, 1, 30, C.steel);            // hi-hat
    rect(ctx, x - 22, STAGE_FLOOR - 27 - (beat % 2), 11, 1, C.brass);
    rect(ctx, x - 22, STAGE_FLOOR - 25, 11, 1, C.brassDim);
    rect(ctx, x + 17, STAGE_FLOOR - 33, 1, 37, C.steel);            // crash cymbal
    rect(ctx, x + 11, STAGE_FLOOR - 34 + crash, 9, 1, C.brass);
    rect(ctx, x + 12, STAGE_FLOOR - 35 + crash * 2, 7, 1, C.lit);
    rect(ctx, x - 16, STAGE_FLOOR - 19, 10, 6, C.red);              // snare
    rect(ctx, x - 16, STAGE_FLOOR - 20, 10, 2, C.bone);
    rect(ctx, x - 16, STAGE_FLOOR - 14, 10, 1, C.steel);
    rect(ctx, x - 12, STAGE_FLOOR - 13, 1, 17, C.steel);
    rect(ctx, x + 7, STAGE_FLOOR - 24, 9, 7, C.red);                // tom
    rect(ctx, x + 7, STAGE_FLOOR - 25, 9, 2, C.bone);
    rect(ctx, x - 7, STAGE_FLOOR - 18, 15, 23, C.red);              // kick drum
    rect(ctx, x - 9, STAGE_FLOOR - 16, 19, 19, C.red);
    rect(ctx, x - 6, STAGE_FLOOR - 16, 13, 19, C.bone);
    rect(ctx, x - 7, STAGE_FLOOR - 14, 15, 15, C.bone);
    rect(ctx, x - 4, STAGE_FLOOR - 11, 3, 6, C.black);              // the band's moth
    rect(ctx, x + 2, STAGE_FLOOR - 11, 3, 6, C.black);
    rect(ctx, x - 5, STAGE_FLOOR - 10, 11, 3, C.black);
    rect(ctx, x, STAGE_FLOOR - 13, 1, 10, C.red);
    var left = [[-12, -26], [-15, -31], [-12, -26], [-14, -32]][beat]; // sticks: snare and hi-hat
    var right = [[13, -40], [10, -31], [6, -34], [10, -31]][beat];     // crash, then the tom
    rect(ctx, x + left[0], STAGE_FLOOR + left[1], 1, 6, C.woodLight);
    rect(ctx, x + left[0] - 1, STAGE_FLOOR + left[1] - 2, 3, 2, skin);
    rect(ctx, x + right[0], STAGE_FLOOR + right[1], 1, 6, C.woodLight);
    rect(ctx, x + right[0] - 1, STAGE_FLOOR + right[1] - 2, 3, 2, skin);
  }

  var INSTRUMENTS = { mic: mic, bass: bass, piano: piano, decks: decks, keytar: keytar, guitar: guitar, drums: drums };

  // Each player's instrument on one floor.
  function instruments(ctx, room, camX, time) {
    Object.keys(CC.cafe.npcs).forEach(function (id) {
      var who = CC.cafe.npcs[id];
      if (who.area !== room || !who.plays) return;
      var skin = CC.find(CC.palette.skin, who.look.skin).s;
      INSTRUMENTS[who.plays](ctx, who.x - camX, time, skin);
    });
  }

  // The bar counter and the band's instruments, drawn over the people behind them.
  function jazzFront(ctx, camX, time) {
    rect(ctx, 188 - camX, GROUND - 26, 104, 31, C.wood);
    rect(ctx, 186 - camX, GROUND - 28, 108, 3, C.brass);
    rect(ctx, 192 - camX, GROUND - 20, 96, 1, C.woodLight);
    rect(ctx, 188 - camX, GROUND + 1, 104, 1, C.brassDim);
    [204, 240, 276].forEach(function (x) { // stools
      rect(ctx, x - 5 - camX, GROUND - 10, 10, 3, C.velvet);
      rect(ctx, x - 1 - camX, GROUND - 7, 2, 12, C.brassDim);
    });

    instruments(ctx, 'jazz', camX, time);
    notes(ctx, places.jazz.stage + 8 - camX, time);
  }

  // The LED screen on the stage wall: columns of cells bouncing with the beat.
  function levels(ctx, x, time) {
    var step = Math.floor(time / 140);
    for (var b = 0; b < 13; b++) {
      var cells = 2 + Math.abs(Math.round(Math.sin(step * 0.9 + b * 1.7) * 6 + Math.sin(step * 0.37 + b) * 4));
      for (var c = 0; c < cells; c++) {
        rect(ctx, x + b * 4, 70 - c * 3, 3, 2, c === cells - 1 ? C.bone : c > 7 ? C.hot : C.acid);
      }
    }
  }

  // The light show, the bar, the pulsing speakers and the DJ booth, drawn over the people behind them.
  function rapFront(ctx, camX, time) {
    var beat = Math.floor(time / 240);
    var thump = beat % 2;

    ctx.globalAlpha = thump ? 0.16 : 0.09;                           // the sign glowing on the beat
    rect(ctx, 200 - camX, 27, 80, 27, C.hot);
    ctx.globalAlpha = 1;

    for (var strip = 0; strip < RAP_STRIPS[1]; strip++) {            // a wave rolling along the LED strips
      var sx = RAP_STRIPS[0] + strip * RAP_STRIPS[2] - camX;
      var crest = 66 + Math.round(Math.sin(time / 420 + strip * 0.8) * 24);
      rect(ctx, sx, crest - 6, 2, 18, strip % 3 ? C.ultra : C.hot);
      rect(ctx, sx, crest, 2, 6, C.bone);
    }

    RAP_HEADS.forEach(function (head, i) {                           // moving heads sweeping the dance floor
      var aim = head[0] + Math.sin(time / 1100 + i * 2.4) * 44;
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = head[1];
      ctx.beginPath();
      ctx.moveTo(head[0] + 2 - camX, 32);
      ctx.lineTo(aim - 13 - camX, GROUND + 12);
      ctx.lineTo(aim + 13 - camX, GROUND + 12);
      ctx.fill();
      ctx.globalAlpha = 1;
      rect(ctx, head[0] + 1 - camX, 32, 3, 1, head[1]);
    });

    ctx.globalAlpha = 0.55;                                          // a laser fan opening and closing
    for (var ray = 0; ray < 4; ray++) {
      var lean = (ray - 1.5) * (10 + Math.sin(time / 700) * 8) - 46;
      for (var ly = RAP_LASER[1]; ly < GROUND + 10; ly += 2) {
        rect(ctx, Math.round(RAP_LASER[0] + lean * (ly - RAP_LASER[1]) / 130) - camX, ly, 1, 2, C.acid);
      }
    }
    ctx.globalAlpha = 0.035;                                         // haze drifting across the floor
    for (var puff = 0; puff < 5; puff++) {
      var drift = Math.round((time / (50 + puff * 14) + puff * 140) % (RAP_W + 90) - 90) - camX;
      rect(ctx, drift + 16, 118 + puff * 6, 52, 2, C.bone);
      rect(ctx, drift, 120 + puff * 6, 90, 2, C.bone);
      rect(ctx, drift + 22, 122 + puff * 6, 58, 2, C.bone);
    }
    ctx.globalAlpha = 1;

    RAP_LAMPS.forEach(function (lamp, i) {                           // truss lamps chasing with the thump
      if ((i + beat) % 2) rect(ctx, lamp - camX, 26, 5, 4, C.ultraDim);
      else rect(ctx, lamp + 1 - camX, 27, 3, 1, C.bone);
    });

    var fizz = Math.floor(time / 90);                                // the sparkler in the bottle
    for (var spark = 0; spark < 5; spark++) {
      var reach = 1 + (fizz + spark * 2) % 4;
      var px = RAP_BOTTLE[0] + Math.round(Math.cos(fizz * 2.4 + spark * 1.3) * reach);
      var py = RAP_BOTTLE[1] - 2 + Math.round(Math.sin(fizz * 2.4 + spark * 1.3) * reach);
      rect(ctx, px - camX, py, 1, 1, spark % 2 ? C.lit : '#ffffff');
    }
    rect(ctx, RAP_BOTTLE[0] - camX, RAP_BOTTLE[1] - 1, 1, 1, '#ffffff');

    rect(ctx, 188 - camX, GROUND - 26, 104, 31, '#0c0e16');          // gloss black bar, lit from below
    for (var fin = 200; fin < 292; fin += 12) rect(ctx, fin - camX, GROUND - 23, 1, 25, C.clubEdge);
    rect(ctx, 186 - camX, GROUND - 28, 108, 3, C.steel);
    rect(ctx, 186 - camX, GROUND - 25, 108, 1, thump ? C.acid : C.acidDim);
    rect(ctx, 188 - camX, GROUND + 4, 104, 1, C.hot);
    ctx.globalAlpha = 0.25;
    rect(ctx, 184 - camX, GROUND + 5, 112, 2, C.hot);
    ctx.globalAlpha = 1;
    [204, 276].forEach(function (x) { // stools
      rect(ctx, x - 5 - camX, GROUND - 10, 10, 3, '#3a3648');
      rect(ctx, x - 1 - camX, GROUND - 7, 2, 12, '#b9b3ad');
    });

    RAP_SPEAKERS.forEach(function (at) { // cones thumping
      [at[1] - 28, at[1] - 15].forEach(function (y) {
        rect(ctx, at[0] + 3 - thump - camX, y + 1 - thump, 7 + thump * 2, 7 + thump * 2, C.steel);
        rect(ctx, at[0] + 5 - camX, y + 3, 3, 3, C.black);
      });
    });
    levels(ctx, places.rap.stage + 26 - camX, time);
    instruments(ctx, 'rap', camX, time);

    var booth = CC.cafe.npcs.deejay.x - camX;                        // LED slats across the front of the DJ booth
    rect(ctx, booth - 17, STAGE_FLOOR - 15, 34, 15, C.black);
    for (var slat = 0; slat < 8; slat++) {
      rect(ctx, booth - 15 + slat * 4, STAGE_FLOOR - 12, 2, 10, (slat + beat) % 4 ? C.ultraDim : C.acid);
    }
  }

  // The breathing neon, the turning record, the bar and the band.
  function hiphopFront(ctx, camX, time) {
    var breath = 0.6 + Math.sin(time / 900) * 0.4;
    ctx.globalAlpha = breath * 0.12;
    rect(ctx, 196 - camX, 28, 88, 24, C.violet);
    ctx.globalAlpha = breath;
    hiphopNeon(ctx, camX, C.violet);
    ctx.globalAlpha = 1;

    var turn = (Math.floor(time / 180) % 8) * Math.PI / 4;
    var record = HIPHOP_RECORDS[0];
    rect(ctx, record[0] + Math.round(Math.cos(turn) * 5) - camX, record[1] + Math.round(Math.sin(turn) * 5), 2, 2, C.steel);

    rect(ctx, 188 - camX, GROUND - 26, 104, 31, C.drapeDark);        // fluted front
    for (var flute = 192; flute < 292; flute += 8) rect(ctx, flute - camX, GROUND - 25, 1, 30, C.violetDim);
    rect(ctx, 186 - camX, GROUND - 28, 108, 3, C.bone);
    ctx.globalAlpha = breath;
    rect(ctx, 186 - camX, GROUND - 25, 108, 1, C.violet);            // glow under the lip
    ctx.globalAlpha = 1;
    rect(ctx, 188 - camX, GROUND + 1, 104, 1, C.black);
    [204, 240, 276].forEach(function (x) { // stools
      rect(ctx, x - 5 - camX, GROUND - 10, 10, 3, '#6b4a9c');
      rect(ctx, x - 1 - camX, GROUND - 7, 2, 12, C.brassDim);
    });

    var thump = Math.floor(time / 420) % 2;
    HIPHOP_SPEAKERS.forEach(function (at) { // cones thumping, slow
      [at[1] - 28, at[1] - 15].forEach(function (y) {
        rect(ctx, at[0] + 3 - thump - camX, y + 1 - thump, 7 + thump * 2, 7 + thump * 2, C.steel);
        rect(ctx, at[0] + 5 - camX, y + 3, 3, 3, C.black);
      });
    });
    instruments(ctx, 'hiphop', camX, time);
  }

  // Sparkles drifting up from the stage.
  function sparkles(ctx, x, time) {
    for (var n = 0; n < 5; n++) {
      var life = ((time / 2600) + n / 5) % 1;
      var sx = Math.round(x + n * 15 + Math.sin(life * 5 + n * 2) * 3);
      var sy = Math.round(STAGE_FLOOR - 50 - life * 36);
      var color = POP_LIGHTS[n % 3];
      ctx.globalAlpha = life < 0.7 ? 0.9 : (1 - life) * 3;
      rect(ctx, sx, sy - 2, 1, 5, color);
      rect(ctx, sx - 2, sy, 5, 1, color);
      rect(ctx, sx, sy, 1, 1, C.bone);
    }
    ctx.globalAlpha = 1;
  }

  // The dance floor, the disco ball's light, the soda counter and the band.
  function popFront(ctx, camX, time) {
    var step = Math.floor(time / 480);
    for (var row = 0; row < 2; row++) {
      for (var col = 0; col < POP_DANCE[1]; col++) {
        var turn = (col * 2 + row * 3 + step) % 4;
        ctx.globalAlpha = turn === 3 ? 0.12 : (col + row + step) % 2 ? 0.75 : 0.45;
        rect(ctx, POP_DANCE[0] + col * 16 + 1 - camX, GROUND + 2 + row * 15, 14, row ? 12 : 13, POP_LIGHTS[turn % 3]);
      }
    }

    // Flecks from the disco ball sweep the walls; the ball itself glints.
    for (var f = 0; f < 14; f++) {
      var drift = (f * 97 + time / (46 + (f % 3) * 9)) % (POP_W + 40) - 20;
      var fx = f % 2 ? drift : POP_W - drift;
      var fy = 30 + (f * 37) % 96 + Math.round(Math.sin(time / 900 + f) * 2);
      ctx.globalAlpha = 0.28 + (f % 3) * 0.12;
      rect(ctx, fx - camX, fy, 2, 2, f % 4 ? C.bone : POP_LIGHTS[f % 3]);
    }
    ctx.globalAlpha = 1;
    var glint = Math.floor(time / 260) % 4;
    rect(ctx, POP_BALL[0] - 4 + glint * 2 - camX, POP_BALL[1] - 4 + (glint % 2) * 4, 2, 2, '#ffffff');

    rect(ctx, 188 - camX, GROUND - 26, 104, 31, '#f3c6dc');          // pastel tiles
    for (var seam = 196; seam < 292; seam += 8) rect(ctx, seam - camX, GROUND - 25, 1, 30, '#d99abb');
    for (var course = GROUND - 18; course < GROUND + 5; course += 8) rect(ctx, 188 - camX, course, 104, 1, '#d99abb');
    rect(ctx, 186 - camX, GROUND - 28, 108, 3, C.bone);
    rect(ctx, 186 - camX, GROUND - 25, 108, 1, C.pink);
    rect(ctx, 188 - camX, GROUND + 1, 104, 1, C.pinkDim);
    [204, 240, 276].forEach(function (x) { // stools
      rect(ctx, x - 5 - camX, GROUND - 10, 10, 3, C.pink);
      rect(ctx, x - 1 - camX, GROUND - 7, 2, 12, '#b9b3ad');
    });

    var st = places.pop.stage;
    for (var lamp = st + 6, i = 0; lamp < POP_W; lamp += 10, i++) { // footlights chasing along the riser
      rect(ctx, lamp - camX, GROUND - 6, 4, 3, (i + step) % 3 ? C.pinkDim : POP_LIGHTS[i % 3]);
    }
    instruments(ctx, 'pop', camX, time);
    sparkles(ctx, st + 8 - camX, time);
  }

  // The string lights, the merch table, the humming amps and the band.
  function rockFront(ctx, camX, time) {
    var step = Math.floor(time / 520);
    ROCK_BULBS.forEach(function (at, i) { // bulbs twinkling in turn
      var on = (i + step) % 4 !== 0;
      rect(ctx, at[0] - camX, at[1], 2, 3, on ? ROCK_LIGHTS[i % 3] : C.steelDark);
      if (on) {
        ctx.globalAlpha = 0.16;
        rect(ctx, at[0] - 1 - camX, at[1] - 1, 4, 5, ROCK_LIGHTS[i % 3]);
        ctx.globalAlpha = 1;
      }
    });

    rect(ctx, 188 - camX, GROUND - 26, 104, 31, C.black);            // table cloth
    rect(ctx, 186 - camX, GROUND - 28, 108, 3, C.woodLight);
    rect(ctx, 186 - camX, GROUND - 25, 108, 1, C.wood);
    rect(ctx, 188 - camX, GROUND + 1, 104, 1, C.steelDark);
    label(ctx, 'MERCH', 240 - camX, GROUND - 10, C.bone);
    [[194, -20, C.red], [280, -18, C.lit], [198, -5, C.bone], [282, -4, C.red]].forEach(function (sticker) {
      rect(ctx, sticker[0] - camX, GROUND + sticker[1], 5, 4, sticker[2]);
    });
    [204, 276].forEach(function (x) { // stools
      rect(ctx, x - 5 - camX, GROUND - 10, 10, 3, C.red);
      rect(ctx, x - 1 - camX, GROUND - 7, 2, 12, C.steelDark);
    });

    var buzz = Math.floor(time / 160) % 2;
    ROCK_AMPS.forEach(function (at, i) { // power lamps, and the cloth shaking
      rect(ctx, at[0] + 11 - camX, at[1] - 28, 1, 1, (buzz + i) % 2 ? C.red : C.lit);
      rect(ctx, at[0] + 3 - camX, at[1] - 23 + buzz, 8, 1, '#4a443e');
      rect(ctx, at[0] + 3 - camX, at[1] - 9 + buzz, 8, 1, '#4a443e');
    });
    instruments(ctx, 'rock', camX, time);
  }

  // ---------- Your floor ----------
  // Painted from the choices in cafe.custom.settings, and again whenever they change.

  var YOURS_ART = 166;
  var YOURS_LAMP = 270;
  var YOURS_PLANT = 300;
  // Fixed pieces that come with the room, whatever you choose.
  var YOURS_SPEAKER = 133;
  var YOURS_TABLE = 257;
  var YOURS_CLOCK = [286, 54];
  // String-light bulbs in swags below the ceiling: [x, y].
  var YOURS_BULBS = [];
  for (var light = 66; light < YOURS_W - 6; light += 12) {
    YOURS_BULBS.push([light, 12 + Math.round(Math.sin(((light - 66) % 72) / 72 * Math.PI) * 5)]);
  }

  function cloth(id) {
    return CC.find(CC.palette.cloth, id);
  }

  // A clock hand, one pixel at a time from the centre. `turn` runs 0 to 1 clockwise from twelve.
  function hand(ctx, x, y, turn, length, color) {
    var angle = turn * Math.PI * 2;
    for (var i = 1; i <= length; i++) {
      rect(ctx, Math.round(x + Math.sin(angle) * i), Math.round(y - Math.cos(angle) * i), 1, 1, color);
    }
  }

  // The three seats, each centred on x and standing on the floor.
  var SEATS = {
    armchair: function (ctx, x, r) {
      rect(ctx, x - 11, GROUND - 32, 22, 22, r.a);      // back
      rect(ctx, x - 11, GROUND - 32, 22, 1, r.c);
      rect(ctx, x - 14, GROUND - 19, 4, 17, r.b);       // arms
      rect(ctx, x + 10, GROUND - 19, 4, 17, r.b);
      rect(ctx, x - 10, GROUND - 10, 20, 6, r.a);       // cushion
      rect(ctx, x - 10, GROUND - 10, 20, 1, r.c);
      rect(ctx, x - 10, GROUND - 4, 20, 2, r.b);
      rect(ctx, x - 13, GROUND - 2, 2, 2, r.k);         // feet
      rect(ctx, x + 11, GROUND - 2, 2, 2, r.k);
    },
    sofa: function (ctx, x, r) {
      rect(ctx, x - 20, GROUND - 24, 40, 14, r.a);      // back
      rect(ctx, x - 20, GROUND - 24, 40, 1, r.c);
      rect(ctx, x - 24, GROUND - 17, 6, 15, r.b);       // arms
      rect(ctx, x + 18, GROUND - 17, 6, 15, r.b);
      rect(ctx, x - 18, GROUND - 11, 36, 7, r.a);       // cushions
      rect(ctx, x - 18, GROUND - 11, 36, 1, r.c);
      rect(ctx, x, GROUND - 11, 1, 7, r.b);
      rect(ctx, x - 20, GROUND - 4, 40, 2, r.b);
      rect(ctx, x - 22, GROUND - 2, 3, 2, r.k);         // feet
      rect(ctx, x + 19, GROUND - 2, 3, 2, r.k);
    },
    beanbag: function (ctx, x, r) {
      rect(ctx, x - 8, GROUND - 18, 16, 4, r.a);
      rect(ctx, x - 6, GROUND - 19, 12, 1, r.c);
      rect(ctx, x - 12, GROUND - 14, 24, 9, r.a);
      rect(ctx, x - 14, GROUND - 6, 28, 6, r.b);
      rect(ctx, x - 4, GROUND - 13, 8, 2, r.b);         // the dent you sit in
    }
  };

  function buildYours() {
    var canvas = layer(YOURS_W);
    var ctx = canvas.getContext('2d');
    var set = CC.cafe.custom.settings;
    var wall = cloth(set.wall);
    var floor = cloth(set.floor);
    var seat = places.yours.seat;

    // Painted wall, a darker band below the rail.
    rect(ctx, 0, 0, YOURS_W, GROUND, wall.a);
    rect(ctx, 0, 104, YOURS_W, GROUND - 104, wall.b);
    rect(ctx, 0, 103, YOURS_W, 1, wall.c);
    rect(ctx, 0, 0, YOURS_W, 6, wall.k);
    rect(ctx, 0, GROUND - 3, YOURS_W, 3, wall.k);

    // Window onto the night, over the seat.
    rect(ctx, seat - 23, 34, 46, 44, C.brass);
    var sky = ctx.createLinearGradient(0, 36, 0, 76);
    sky.addColorStop(0, '#0d0b11');
    sky.addColorStop(1, '#2e2140');
    ctx.fillStyle = sky;
    ctx.fillRect(seat - 21, 36, 42, 40);
    ctx.fillStyle = C.bone;
    ctx.beginPath();
    ctx.arc(seat + 10, 47, 5, 0, Math.PI * 2);
    ctx.fill();
    [[-21, 13, 12], [-8, 11, 20], [3, 9, 9], [12, 9, 15]].forEach(function (tower) {
      rect(ctx, seat + tower[0], 76 - tower[2], tower[1], tower[2], '#1a1524');
      rect(ctx, seat + tower[0] + 3, 76 - tower[2] + 3, 1, 1, C.lit);
    });
    rect(ctx, seat - 1, 36, 2, 40, C.brass);
    rect(ctx, seat - 21, 55, 42, 1, C.brass);

    // Wall art.
    var art = cloth(set.artColor);
    if (set.art === 'poster') {
      rect(ctx, YOURS_ART - 11, 38, 22, 30, C.bone);
      rect(ctx, YOURS_ART - 10, 39, 20, 28, art.a);
      rect(ctx, YOURS_ART - 1, 43, 2, 12, art.k);       // a star
      rect(ctx, YOURS_ART - 6, 48, 12, 2, art.k);
      rect(ctx, YOURS_ART - 3, 46, 6, 6, art.k);
      rect(ctx, YOURS_ART - 10, 58, 20, 9, C.black);
      rect(ctx, YOURS_ART - 7, 61, 14, 1, C.bone);
      rect(ctx, YOURS_ART - 4, 64, 8, 1, C.bone);
    } else if (set.art === 'record') {
      rect(ctx, YOURS_ART - 11, 42, 22, 22, C.brassDim);
      rect(ctx, YOURS_ART - 10, 43, 20, 20, C.bone);
      ctx.fillStyle = C.black;
      ctx.beginPath();
      ctx.arc(YOURS_ART, 53, 8, 0, Math.PI * 2);
      ctx.fill();
      rect(ctx, YOURS_ART - 2, 51, 4, 4, art.a);
      rect(ctx, YOURS_ART, 53, 1, 1, C.black);
    }

    // A shelf of books, a mug and a trailing plant.
    rect(ctx, 120, 80, 30, 2, C.woodLight);
    rect(ctx, 123, 82, 1, 3, C.wood);
    rect(ctx, 146, 82, 1, 3, C.wood);
    var spine = 122;
    [[3, 9, C.velvet], [2, 8, C.brassDim], [3, 10, C.steel], [2, 7, C.bone], [3, 9, C.violetDim]].forEach(function (book) {
      rect(ctx, spine, 80 - book[1], book[0], book[1], book[2]);
      rect(ctx, spine, 80 - book[1] + 2, book[0], 1, C.black);
      spine += book[0];
    });
    rect(ctx, 137, 76, 4, 4, C.bone);
    rect(ctx, 141, 77, 1, 2, C.bone);
    rect(ctx, 144, 75, 5, 5, C.brassDim);
    rect(ctx, 143, 73, 7, 2, '#3f7a4c');
    rect(ctx, 150, 75, 1, 14, '#2f5a3a');
    rect(ctx, 147, 80, 1, 8, '#2f5a3a');
    [[149, 79], [151, 83], [149, 87], [146, 84], [148, 87]].forEach(function (leaf) {
      rect(ctx, leaf[0], leaf[1], 1, 2, '#3f7a4c');
    });

    // The wall clock, stopped at 11:42 but for its second hand.
    var cx = YOURS_CLOCK[0];
    var cy = YOURS_CLOCK[1];
    ctx.fillStyle = C.brass;
    ctx.beginPath();
    ctx.arc(cx + 0.5, cy + 0.5, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.bone;
    ctx.beginPath();
    ctx.arc(cx + 0.5, cy + 0.5, 7, 0, Math.PI * 2);
    ctx.fill();
    [[0, -6], [6, 0], [0, 6], [-6, 0]].forEach(function (mark) {
      rect(ctx, cx + mark[0], cy + mark[1], 1, 1, C.brassDim);
    });
    hand(ctx, cx, cy, 11.7 / 12, 3, C.black);
    hand(ctx, cx, cy, 42 / 60, 5, C.black);
    rect(ctx, cx, cy, 1, 1, C.black);

    // The string-light wire; the bulbs are lit in front.
    if (set.lamp === 'string') {
      YOURS_BULBS.forEach(function (at, i) {
        var next = YOURS_BULBS[i + 1];
        if (!next) return;
        rect(ctx, at[0], at[1] - 1, 7, 1, C.black);
        rect(ctx, at[0] + 6, next[1] - 1, 7, 1, C.black);
      });
    }

    lift(ctx, places.yours.lift);

    // Floorboards.
    rect(ctx, 0, GROUND, YOURS_W, VIEW_H - GROUND, floor.a);
    for (var row = 0; row < 3; row++) {
      rect(ctx, 0, GROUND + row * 10, YOURS_W, 1, floor.b);
      for (var end = 14 + row * 23; end < YOURS_W; end += 61) rect(ctx, end, GROUND + row * 10, 1, 10, floor.b);
    }
    rect(ctx, 0, GROUND, YOURS_W, 1, floor.c);

    if (set.rug === 'on') {
      var rug = cloth(set.rugColor);
      rect(ctx, seat - 40, GROUND + 9, 80, 15, rug.a);
      rect(ctx, seat - 38, GROUND + 11, 76, 1, rug.c);
      rect(ctx, seat - 38, GROUND + 21, 76, 1, rug.c);
      for (var fringe = GROUND + 9; fringe < GROUND + 24; fringe += 2) {
        rect(ctx, seat - 42, fringe, 2, 1, rug.c);
        rect(ctx, seat + 40, fringe, 2, 1, rug.c);
      }
    }

    // Paint cans by the elevator, holding the wall and floor colours.
    var cans = places.yours.decor;
    rect(ctx, cans - 8, GROUND - 10, 10, 10, '#b9b3ad');
    rect(ctx, cans - 8, GROUND - 10, 10, 2, wall.a);
    rect(ctx, cans - 6, GROUND - 8, 2, 4, wall.a);      // a drip
    rect(ctx, cans + 4, GROUND - 8, 8, 8, '#8d9099');
    rect(ctx, cans + 4, GROUND - 8, 8, 2, floor.a);
    rect(ctx, cans + 15, GROUND - 13, 1, 13, C.woodLight); // a brush leaning on the wall
    rect(ctx, cans + 14, GROUND - 17, 3, 4, C.bone);

    // Record player on a side table, a speaker underneath.
    rect(ctx, YOURS_ART - 11, GROUND - 17, 22, 2, C.woodLight);
    rect(ctx, YOURS_ART - 9, GROUND - 15, 2, 15, C.wood);
    rect(ctx, YOURS_ART + 7, GROUND - 15, 2, 15, C.wood);
    rect(ctx, YOURS_ART - 8, GROUND - 21, 16, 4, C.wood);
    rect(ctx, YOURS_ART - 6, GROUND - 22, 9, 1, C.black);
    rect(ctx, YOURS_ART + 5, GROUND - 24, 1, 3, C.brass);
    rect(ctx, YOURS_ART - 6, GROUND - 12, 12, 12, C.black);
    rect(ctx, YOURS_ART - 4, GROUND - 10, 8, 8, C.steelDark);

    // A tower speaker, and a crate of records beside it.
    rect(ctx, YOURS_SPEAKER - 7, GROUND - 36, 14, 36, C.black);
    rect(ctx, YOURS_SPEAKER - 7, GROUND - 36, 14, 1, C.steelDark);
    rect(ctx, YOURS_SPEAKER - 2, GROUND - 32, 4, 4, C.steelDark);
    rect(ctx, YOURS_SPEAKER - 1, GROUND - 31, 2, 2, C.steel);
    rect(ctx, YOURS_SPEAKER - 4, GROUND - 25, 8, 8, C.steelDark);
    rect(ctx, YOURS_SPEAKER - 4, GROUND - 13, 8, 8, C.steelDark);
    [[144, 4, C.red], [146, 5, C.bone], [148, 3, C.cyan], [150, 5, C.violet]].forEach(function (sleeve) {
      rect(ctx, sleeve[0], GROUND - 9 - sleeve[1], 2, sleeve[1], sleeve[2]);
    });
    rect(ctx, 143, GROUND - 9, 11, 9, C.wood);
    rect(ctx, 143, GROUND - 8, 11, 1, C.woodLight);
    rect(ctx, 143, GROUND - 4, 11, 1, C.woodLight);

    // A side table by the seat, with a mug of something hot.
    rect(ctx, YOURS_TABLE - 6, GROUND - 14, 12, 2, C.woodLight);
    rect(ctx, YOURS_TABLE - 1, GROUND - 12, 2, 11, C.wood);
    rect(ctx, YOURS_TABLE - 4, GROUND - 1, 8, 1, C.wood);
    rect(ctx, YOURS_TABLE - 2, GROUND - 19, 5, 5, C.bone);
    rect(ctx, YOURS_TABLE + 3, GROUND - 18, 1, 3, C.bone);
    rect(ctx, YOURS_TABLE - 1, GROUND - 19, 3, 1, C.wood);

    SEATS[set.seat](ctx, seat, cloth(set.seatColor));

    if (set.lamp === 'floor') {
      var shade = cloth(set.lampColor);
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = shade.c;
      ctx.beginPath();
      ctx.moveTo(YOURS_LAMP, GROUND - 44);
      ctx.lineTo(YOURS_LAMP - 32, GROUND);
      ctx.lineTo(YOURS_LAMP + 33, GROUND);
      ctx.fill();
      ctx.globalAlpha = 1;
      rect(ctx, YOURS_LAMP, GROUND - 42, 1, 42, C.brassDim);
      rect(ctx, YOURS_LAMP - 4, GROUND - 1, 9, 1, C.brassDim);
      rect(ctx, YOURS_LAMP - 3, GROUND - 54, 7, 2, shade.a);
      rect(ctx, YOURS_LAMP - 5, GROUND - 52, 11, 9, shade.a);
      rect(ctx, YOURS_LAMP - 5, GROUND - 44, 11, 1, shade.c);
    }

    if (set.plant === 'on') {
      rect(ctx, YOURS_PLANT - 4, GROUND - 10, 9, 10, C.brassDim);
      rect(ctx, YOURS_PLANT, GROUND - 26, 1, 16, '#2f5a3a');
      [[-8, -30], [-5, -34], [0, -36], [5, -34], [8, -30]].forEach(function (leaf) {
        rect(ctx, YOURS_PLANT + leaf[0] - 1, GROUND + leaf[1], 3, 9, '#3f7a4c');
      });
    }
    return canvas;
  }

  // The twinkling string lights, the clock and the steam, and the record
  // player and speakers when a playlist is on.
  function yoursFront(ctx, camX, time) {
    var set = CC.cafe.custom.settings;
    if (set.lamp === 'string') {
      var bulb = cloth(set.lampColor);
      var step = Math.floor(time / 520);
      YOURS_BULBS.forEach(function (at, i) {
        var on = (i + step) % 4 !== 0;
        rect(ctx, at[0] - camX, at[1], 2, 3, on ? (i % 2 ? bulb.c : bulb.a) : C.steelDark);
        if (on) {
          ctx.globalAlpha = 0.16;
          rect(ctx, at[0] - 1 - camX, at[1] - 1, 4, 5, bulb.c);
          ctx.globalAlpha = 1;
        }
      });
    }
    hand(ctx, YOURS_CLOCK[0] - camX, YOURS_CLOCK[1], (Math.floor(time / 1000) % 60) / 60, 5, C.red);
    var drift = Math.floor(time / 420) % 3;
    ctx.globalAlpha = 0.5;
    rect(ctx, YOURS_TABLE - 1 + drift % 2 - camX, GROUND - 22 - drift, 1, 2, C.bone);
    rect(ctx, YOURS_TABLE + 1 - drift % 2 - camX, GROUND - 25 - drift, 1, 2, C.bone);
    ctx.globalAlpha = 1;

    if (!set.playlist) return;
    var turn = Math.floor(time / 180) % 4;
    var thump = Math.floor(time / 300) % 2;
    [GROUND - 21, GROUND - 9].forEach(function (cone) {
      rect(ctx, YOURS_SPEAKER - 3 - thump - camX, cone - 3 - thump, 6 + thump * 2, 6 + thump * 2, C.steel);
      rect(ctx, YOURS_SPEAKER - 1 - camX, cone - 1, 2, 2, C.black);
    });
    rect(ctx, YOURS_ART - 5 + turn * 2 - camX, GROUND - 22, 1, 1, C.steel);
    rect(ctx, YOURS_ART - 3 - thump - camX, GROUND - 9 - thump, 6 + thump * 2, 6 + thump * 2, C.steel);
    rect(ctx, YOURS_ART - 1 - camX, GROUND - 7, 2, 2, C.black);
  }

  function build() {
    layers.lobby = buildLobby();
    layers.jazz = buildJazz();
    layers.hiphop = buildHiphop();
    layers.rap = buildRap();
    layers.pop = buildPop();
    layers.rock = buildRock();
    layers.yours = buildYours();
  }

  // Repaint your floor after a change in the decorate panel.
  function refresh() {
    layers.yours = buildYours();
  }

  function draw(room, ctx, camX) {
    ctx.drawImage(layers[room], -Math.round(camX), 0);
  }

  CC.cafe.rooms = {
    places: places,
    widths: { lobby: LOBBY_W, jazz: JAZZ_W, hiphop: HIPHOP_W, rap: RAP_W, pop: POP_W, rock: ROCK_W, yours: YOURS_W },
    fronts: { jazz: jazzFront, hiphop: hiphopFront, rap: rapFront, pop: popFront, rock: rockFront, yours: yoursFront },
    build: build,
    refresh: refresh,
    draw: draw
  };
})(window.CozyCafe);
