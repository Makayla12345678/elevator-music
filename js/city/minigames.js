// The challenges people set you. Each one builds its own controls inside `root`,
// calls `done` when beaten, and returns a function that tidies up if the player
// leaves early. Nothing here can be lost: a wrong answer just means another try.
(function (CC) {
  CC.city = CC.city || {};

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = list[i];
      list[i] = list[j];
      list[j] = swap;
    }
    return list;
  }

  // Timers that can all be cancelled at once.
  function timers() {
    var ids = [];
    return {
      after: function (ms, fn) { ids.push(setTimeout(fn, ms)); },
      clear: function () { ids.forEach(clearTimeout); ids = []; }
    };
  }

  // ---------- Sal: play the tune back ----------

  function melody(root, keys, done) {
    var NOTES = [196.0, 246.9, 293.7, 392.0];
    var ROUNDS = [3, 4, 5];
    var clock = timers();
    var round = 0;
    var tune = [];
    var position = 0;
    var listening = true;

    root.appendChild(el('h2', 'minigame__title', 'Play it back'));
    var status = el('p', 'minigame__status');
    root.appendChild(status);
    var row = el('div', 'strings');
    var pads = NOTES.map(function (note, i) {
      var pad = el('button', 'strings__pad strings__pad--' + i, String(i + 1));
      pad.type = 'button';
      pad.addEventListener('click', function () { press(i); });
      row.appendChild(pad);
      return pad;
    });
    root.appendChild(row);
    root.appendChild(el('p', 'minigame__help', 'Click the strings, or press 1 to 4.'));

    function pluck(i) {
      CC.sound.note(NOTES[i]);
      pads[i].classList.add('is-lit');
      clock.after(300, function () { pads[i].classList.remove('is-lit'); });
    }

    function play() {
      listening = true;
      status.textContent = 'Listen...';
      tune.forEach(function (note, i) {
        clock.after(700 + i * 550, function () { pluck(note); });
      });
      clock.after(700 + tune.length * 550, function () {
        listening = false;
        position = 0;
        status.textContent = 'Your turn. Tune ' + (round + 1) + ' of ' + ROUNDS.length + '.';
      });
    }

    function newTune() {
      tune = [];
      for (var i = 0; i < ROUNDS[round]; i++) tune.push(Math.floor(Math.random() * NOTES.length));
      play();
    }

    function press(i) {
      if (listening) return;
      pluck(i);
      if (i !== tune[position]) {
        listening = true;
        status.textContent = 'Not quite. Listen again.';
        clock.after(1000, play);
        return;
      }
      position++;
      if (position < tune.length) return;
      listening = true;
      round++;
      if (round === ROUNDS.length) {
        status.textContent = 'That\'s the tune!';
        clock.after(900, done);
      } else {
        status.textContent = 'Nice. This one is a little longer.';
        clock.after(1000, newTune);
      }
    }

    function onKey(event) {
      if (/^[1-4]$/.test(event.key)) press(Number(event.key) - 1);
    }

    window.addEventListener('keydown', onKey);
    newTune();
    return function () {
      clock.clear();
      window.removeEventListener('keydown', onKey);
    };
  }

  // ---------- Mags: find the record she describes ----------

  var COVER_COLORS = { blue: '#3f5f8a', pink: '#e879b0', red: '#c8443f', gold: '#c9993a', green: '#5fa46a', purple: '#7a55b5' };
  var STRIPES = ['no stripes', 'one stripe', 'two stripes'];
  var SYMBOLS = {
    moon:  ['..XXXX..', '.XXX....', 'XXX.....', 'XXX.....', 'XXX.....', 'XXX.....', '.XXX....', '..XXXX..'],
    star:  ['...XX...', '...XX...', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '.XXXXXX.', '.XX..XX.', 'X......X'],
    heart: ['.XX..XX.', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..', '...XX...', '........'],
    bolt:  ['....XXX.', '...XXX..', '..XXX...', '.XXXXXX.', '...XXX..', '..XXX...', '.XXX....', '.X......']
  };

  function drawCover(record) {
    var canvas = el('canvas', 'shelf__cover');
    canvas.width = 16;
    canvas.height = 16;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = COVER_COLORS[record.color];
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 15, 16, 1);
    ctx.fillRect(15, 0, 1, 16);
    ctx.fillStyle = '#f4efe6';
    SYMBOLS[record.symbol].forEach(function (line, y) {
      for (var x = 0; x < 8; x++) if (line[x] === 'X') ctx.fillRect(4 + x, 1 + y, 1, 1);
    });
    for (var s = 0; s < record.stripes; s++) ctx.fillRect(2, 11 + s * 2, 12, 1);
    return canvas;
  }

  function shared(a, b) {
    return (a.color === b.color) + (a.symbol === b.symbol) + (a.stripes === b.stripes);
  }

  function records(root, keys, done) {
    var ROUNDS = 3;
    var SHELF = 12;
    var clock = timers();
    var round = 0;

    root.appendChild(el('h2', 'minigame__title', 'Find the record'));
    var clue = el('p', 'minigame__clue');
    var status = el('p', 'minigame__status');
    var shelf = el('div', 'shelf');
    root.appendChild(clue);
    root.appendChild(shelf);
    root.appendChild(status);

    function everyRecord() {
      var all = [];
      Object.keys(COVER_COLORS).forEach(function (color) {
        Object.keys(SYMBOLS).forEach(function (symbol) {
          STRIPES.forEach(function (name, stripes) { all.push({ color: color, symbol: symbol, stripes: stripes }); });
        });
      });
      return shuffle(all);
    }

    function newShelf() {
      var all = everyRecord();
      var target = all.shift();
      // Half the shelf nearly matches, so each clue has to be checked.
      var close = all.filter(function (r) { return shared(r, target) === 2; }).slice(0, 6);
      var rest = all.filter(function (r) { return close.indexOf(r) === -1; }).slice(0, SHELF - 1 - close.length);
      var onShelf = shuffle([target].concat(close, rest));

      clue.textContent = '"A ' + target.color + ' cover with a ' + target.symbol + ' and ' + STRIPES[target.stripes] + '."';
      status.textContent = 'Record ' + (round + 1) + ' of ' + ROUNDS + '.';
      shelf.textContent = '';
      onShelf.forEach(function (record) {
        var button = el('button', 'shelf__record');
        button.type = 'button';
        button.setAttribute('aria-label', record.color + ' cover, ' + record.symbol + ', ' + STRIPES[record.stripes]);
        button.appendChild(drawCover(record));
        button.addEventListener('click', function () { pick(record === target, button); });
        shelf.appendChild(button);
      });
    }

    function pick(right, button) {
      if (!right) {
        button.disabled = true;
        status.textContent = 'Not that one. Look again.';
        return;
      }
      button.classList.add('is-right');
      round++;
      if (round === ROUNDS) {
        status.textContent = 'That\'s all three!';
        clock.after(900, done);
      } else {
        status.textContent = 'That\'s it!';
        clock.after(800, newShelf);
      }
    }

    newShelf();
    return clock.clear;
  }

  // ---------- Vesper: tune the signal back in ----------

  function dial(root, keys, done) {
    var STATIONS = ['MOON STREET FM', 'NIGHT OWL RADIO', 'CAFE SIGNAL'];
    var WIDTHS = [0.16, 0.11, 0.08]; // how close you must be; each signal is fussier
    var TURN_SPEED = 0.2;            // dial travel per second
    var LOCK_AT = 0.8;
    var HOLD_SECONDS = 1;
    var STATIC = '#%*~/=+';
    var clock = timers();
    var round = 0;
    var needle = 0.5;
    var target = 0;
    var held = 0;
    var locked = false;
    var alive = true;
    var last = performance.now();
    var lastScramble = 0;

    root.appendChild(el('h2', 'minigame__title', 'Tune the signal'));
    var name = el('p', 'tuner__name');
    var meter = el('div', 'tuner__meter');
    var fill = el('div', 'tuner__fill');
    meter.appendChild(fill);
    var track = el('div', 'tuner__track');
    var pointer = el('div', 'tuner__needle');
    track.appendChild(pointer);
    var status = el('p', 'minigame__status');
    var buttons = el('div', 'tuner__buttons');
    root.appendChild(name);
    root.appendChild(meter);
    root.appendChild(track);
    root.appendChild(buttons);
    root.appendChild(status);
    root.appendChild(el('p', 'minigame__help', 'Hold the arrow keys to turn the dial. When the name comes through, hold still.'));

    [['left', '◀'], ['right', '▶']].forEach(function (pair) {
      var button = el('button', 'pad__button', pair[1]);
      button.type = 'button';
      button.setAttribute('aria-label', 'Turn the dial ' + pair[0]);
      button.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        keys[pair[0]] = true;
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
        button.addEventListener(type, function () { keys[pair[0]] = false; });
      });
      buttons.appendChild(button);
    });

    function newSignal() {
      locked = false;
      held = 0;
      do { target = 0.06 + Math.random() * 0.88; } while (Math.abs(target - needle) < 0.25);
      status.textContent = 'Signal ' + (round + 1) + ' of ' + STATIONS.length + '.';
    }

    function strength() {
      return Math.max(0, 1 - Math.abs(needle - target) / WIDTHS[round]);
    }

    // Letters come through one by one as the signal clears.
    function scramble(text, signal) {
      return text.split('').map(function (letter, i) {
        if (letter === ' ') return ' ';
        var clearsAt = ((i * 7) % text.length) / text.length;
        return signal > clearsAt * 0.8 + 0.1 ? letter : STATIC[Math.floor(Math.random() * STATIC.length)];
      }).join('');
    }

    function tick(now) {
      if (!alive) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!locked) {
        var dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
        needle = Math.max(0, Math.min(1, needle + dir * TURN_SPEED * dt));
        var signal = strength();
        held = signal >= LOCK_AT ? held + dt : 0;
        pointer.style.left = needle * 100 + '%';
        fill.style.width = signal * 100 + '%';
        fill.classList.toggle('is-strong', signal >= LOCK_AT);
        if (now - lastScramble > 90) {
          lastScramble = now;
          name.textContent = scramble(STATIONS[round], signal);
        }

        if (held >= HOLD_SECONDS) {
          locked = true;
          name.textContent = STATIONS[round];
          round++;
          if (round === STATIONS.length) {
            status.textContent = 'Loud and clear. You\'re back on the air!';
            clock.after(1000, done);
          } else {
            status.textContent = 'Locked on! Now the next one.';
            clock.after(1000, newSignal);
          }
        }
      }
      requestAnimationFrame(tick);
    }

    newSignal();
    requestAnimationFrame(tick);
    return function () {
      alive = false;
      clock.clear();
      keys.left = keys.right = false;
    };
  }

  CC.city.minigames = { melody: melody, records: records, dial: dial };
})(window.CozyCafe);
