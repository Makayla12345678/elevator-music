(function (CC) {
  // Rows from here down stay put during the idle bounce; everything above drops one pixel.
  var FEET_ROW = 44;
  // Where the legs separate; the walk shuffle lifts one leg from this row down.
  var LEG_ROW = 33;
  // Sitting lowers everything above the legs this far, hiding the thighs behind the lap.
  var SIT_DROP = 5;

  function wearingDress(look) {
    var top = CC.find(CC.sprites.top, look.top);
    return !!(top && top.dress);
  }

  // Back-to-front list of { grid, colors } for a look.
  function layers(look) {
    var skin = CC.find(CC.palette.skin, look.skin);
    var fixed = CC.palette.body;
    var out = [{
      grid: CC.sprites.body.poses.front,
      colors: { k: skin.k, s: skin.s, d: skin.d, m: skin.m, e: fixed.e, w: fixed.w, u: fixed.u, v: fixed.v }
    }];

    // Shoes, then bottoms over them, then tops over those.
    ['shoes', 'bottom', 'top'].forEach(function (slot) {
      var item = CC.find(CC.sprites[slot], look[slot]);
      if (!item || (slot === 'bottom' && wearingDress(look))) return;
      var ramp = CC.find(CC.palette.cloth, look[slot + 'Color']);
      out.push({ grid: item.poses.front, colors: Object.assign({}, CC.palette.details, ramp) });
    });

    var hair = CC.find(CC.sprites.hair, look.hair);
    if (hair) out.push({ grid: hair.poses.front, colors: CC.find(CC.palette.hair, look.hairColor) });

    return out;
  }

  // Flatten a look into one 32 x 48 canvas.
  function compose(look) {
    var canvas = document.createElement('canvas');
    canvas.width = CC.W;
    canvas.height = CC.H;
    var ctx = canvas.getContext('2d');

    layers(look).forEach(function (layer) {
      for (var y = 0; y < CC.H; y++) {
        var row = layer.grid[y];
        for (var x = 0; x < CC.W; x++) {
          var slot = row[x];
          if (slot === '.') continue;
          ctx.fillStyle = layer.colors[slot] || '#ff00ff'; // magenta = slot with no colour
          ctx.fillRect(x, y, 1, 1);
        }
      }
    });
    return canvas;
  }

  var scratch = null;

  // Apply a pose to a composed character and return it as a 32 x 48 canvas.
  // The canvas is shared and reused, so blit it before calling pose() again.
  //   opts.bob:  true for the "down" frame of the idle bounce
  //   opts.step: 'left' or 'right' lifts that leg one pixel, for the walk shuffle
  //   opts.sit:  true to sit down (bob still applies)
  function pose(composed, opts) {
    opts = opts || {};
    if (!scratch) {
      scratch = document.createElement('canvas');
      scratch.width = CC.W;
      scratch.height = CC.H;
    }
    var ctx = scratch.getContext('2d');
    ctx.clearRect(0, 0, CC.W, CC.H);

    if (opts.sit) {
      var shins = LEG_ROW + 1 + SIT_DROP;
      ctx.drawImage(composed, 0, shins, CC.W, CC.H - shins, 0, shins, CC.W, CC.H - shins);
      ctx.drawImage(composed, 0, 0, CC.W, LEG_ROW + 1, 0, SIT_DROP + (opts.bob ? 1 : 0), CC.W, LEG_ROW + 1);
      return scratch;
    }

    if (opts.bob) {
      var feet = CC.H - FEET_ROW;
      ctx.drawImage(composed, 0, 0, CC.W, FEET_ROW, 0, 1, CC.W, FEET_ROW);
      ctx.clearRect(0, FEET_ROW, CC.W, feet);
      ctx.drawImage(composed, 0, FEET_ROW, CC.W, feet, 0, FEET_ROW, CC.W, feet);
      return scratch;
    }

    ctx.drawImage(composed, 0, 0);
    if (opts.step) {
      var half = CC.W / 2;
      var x = opts.step === 'left' ? 0 : half;
      var legs = CC.H - LEG_ROW;
      ctx.clearRect(x, LEG_ROW, half, legs);
      ctx.drawImage(composed, x, LEG_ROW + 1, half, legs - 1, x, LEG_ROW, half, legs - 1);
    }
    return scratch;
  }

  // Paint a composed character onto a visible canvas.
  //   opts.bob / opts.step: see pose()
  //   opts.crop: { x, y } top-left of the region to show (the canvas size sets how much)
  function draw(target, composed, opts) {
    opts = opts || {};
    var crop = opts.crop || { x: 0, y: 0 };
    var ctx = target.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(pose(composed, opts), -crop.x, -crop.y);
  }

  CC.renderer = { compose: compose, pose: pose, draw: draw, wearingDress: wearingDress };
})(window.CozyCafe);
