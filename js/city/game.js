// Runs the walk through the city: movement, the camera, conversations, the
// stamped title cards, the challenges, the subway detour, and the cafe with
// its elevator and music. The story is data in quests.js; the cafe is data in
// cafe/floors.js.
(function (CC) {
  var scene = CC.city.scene;
  var map = CC.city.map;
  var detour = CC.city.detour;
  var cafe = CC.cafe;
  var rooms = cafe.rooms;
  var CAFE_DOOR = 2115;     // the cafe's front door, on the street
  var SAVE_KEY = 'cozycafe.guess';
  var WALK_SPEED = 70;      // pixels per second
  var TALK_RANGE = 30;
  var USE_RANGE = 18;       // stairs, coins, the ticket machine
  var WALL_GAP = 14;        // how close you can get to a barrier
  var COINS_NEEDED = 3;
  var STEP_MS = 140;
  var BOUNCE_MS = 500;
  var CARD_MS = 2600;
  var TYPE_MS = 28;         // per letter of dialogue
  var POUR_MS = 1600;       // being served a drink: pour, slide, sip
  var SLIDE_MS = 900;
  var SIP_MS = 3400;
  var FEET_Y = scene.GROUND + 5;
  var STEPS = ['left', null, 'right', null];
  var AREA_WIDTH = { street: scene.WORLD, subway: scene.SUBWAY };
  Object.keys(rooms.widths).forEach(function (room) { AREA_WIDTH[room] = rooms.widths[room]; });

  // Things you can use that are not people.
  var SPOTS = [
    { kind: 'door', area: 'street', x: map.street.stairsDown, to: 'subway', toX: map.subway.stairsWest, hint: detour.hints.down },
    { kind: 'door', area: 'street', x: map.street.stairsUp, to: 'subway', toX: map.subway.stairsEast, hint: detour.hints.down },
    { kind: 'door', area: 'subway', x: map.subway.stairsWest, to: 'street', toX: map.street.stairsDown, hint: detour.hints.up },
    { kind: 'door', area: 'subway', x: map.subway.stairsEast, to: 'street', toX: map.street.stairsUp, hint: detour.hints.up },
    { kind: 'machine', area: 'subway', x: map.subway.machine, hint: detour.hints.machine },
    { kind: 'door', area: 'street', x: CAFE_DOOR, to: 'lobby', toX: rooms.places.lobby.door, hint: cafe.text.enter, when: storyDone },
    { kind: 'door', area: 'lobby', x: rooms.places.lobby.door, to: 'street', toX: CAFE_DOOR, hint: cafe.text.leave },
    { kind: 'lift', area: 'lobby', x: rooms.places.lobby.lift, hint: cafe.text.lift }
  ].concat(cafe.floors.filter(function (floor) { return floor.open; }).map(function (floor) {
    return { kind: 'lift', area: floor.id, x: rooms.places[floor.id].lift, hint: cafe.text.lift };
  })).concat(cafe.floors.filter(function (floor) { return rooms.places[floor.id].seat; }).map(function (floor) {
    return { kind: 'seat', area: floor.id, x: rooms.places[floor.id].seat, raise: rooms.places[floor.id].perch, hint: cafe.text.sit };
  })).concat([
    { kind: 'decor', area: 'yours', x: rooms.places.yours.decor, hint: cafe.text.decorate }
  ]).concat(map.subway.coins.map(function (x, i) {
    return { kind: 'coin', id: i, area: 'subway', x: x, hint: detour.hints.coin };
  }));

  var $ = function (id) { return document.getElementById(id); };
  var creatorEl = document.querySelector('.creator');
  var cityEl = $('city');
  var canvas = $('street');
  var ctx = canvas.getContext('2d');

  var keys = { left: false, right: false };
  var running = false;
  var built = false;
  var lastTime = 0;

  var player, npcs, area, beatIndex, cardShownFor, mode, scores, carrying, goal;
  var dialog, typing, cardTimer, cardDone, stopGame, coins, ticket, seenSubway, serving, seat;
  var listening = false; // the melody challenge is up, so the street music hushes
  var stride = -1;       // which frame of the walk shuffle was drawn last

  // ---------- Setup ----------

  function reset() {
    player = { x: 60, moving: false, sprite: CC.renderer.compose(CC.state.look) };
    var everyone = Object.assign({}, CC.city.npcs, cafe.npcs);
    npcs = Object.keys(everyone).map(function (id, i) {
      var def = everyone[id];
      return {
        id: id, name: def.name, area: def.area || 'street', x: def.x, idle: def.idle, menu: def.menu,
        behind: !!def.behind, raise: def.raise || 0, sways: def.plays === 'mic',
        sprite: CC.renderer.compose(def.look), phase: i * 170
      };
    });
    area = 'street';
    beatIndex = 0;
    cardShownFor = -1;
    mode = 'walk';
    scores = {};
    carrying = '';
    goal = CC.city.opening;
    coins = {};
    ticket = false;
    seenSubway = false;
    serving = null;
    seat = null;
    dialog = null;
    stopTyping();
    endGame();
    $('dialog').hidden = true;
    $('card').hidden = true;
    $('lift').hidden = true;
    $('decor').hidden = true;
    setMusic(null);
    $('hud-time').textContent = '';
    $('hud-place').textContent = '';
  }

  // opts.cafe: skip the walk and begin in the lobby (for return visits).
  function start(opts) {
    CC.sound.unlock();
    creatorEl.hidden = true;
    cityEl.hidden = false;
    window.scrollTo(0, 0);
    // The street signs use the pixel font, so wait for it before painting them.
    var ready = document.fonts && document.fonts.load ? document.fonts.load('8px Silkscreen') : Promise.resolve();
    ready.catch(function () {}).then(function () {
      if (!built) {
        scene.build();
        rooms.build();
        built = true;
      }
      reset();
      if (opts && opts.cafe) {
        beatIndex = CC.city.beats.length;
        scores[savedGuess()] = 1;
        CC.state.taste = { scores: scores, guess: savedGuess() };
        enter('lobby', rooms.places.lobby.door);
      }
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(frame);
    });
  }

  function stop() {
    running = false;
    CC.sound.music(false);
    clearTimeout(cardTimer);
    stopTyping();
    endGame();
    setMusic(null);
    $('lift').hidden = true;
    $('decor').hidden = true;
    keys.left = keys.right = false;
    cityEl.hidden = true;
    creatorEl.hidden = false;
    CC.showSkip();
  }

  // ---------- Story ----------

  function beat() {
    return CC.city.beats[beatIndex];
  }

  function storyDone() {
    return beatIndex >= CC.city.beats.length;
  }

  function floorOf(room) {
    return CC.find(cafe.floors, room);
  }

  // The doorman's guess is remembered so later visits can skip the walk.
  function savedGuess() {
    try {
      var saved = localStorage.getItem(SAVE_KEY);
      return CC.city.genres[saved] ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function coinCount() {
    return Object.keys(coins).length;
  }

  function fill(text) {
    return text.replace('{n}', coinCount()).replace('{guess}', CC.city.genres[guess()]);
  }

  // What the corner of the screen should say right now.
  function goalText() {
    var text = goal;
    if (storyDone()) {
      var floor = floorOf(area);
      text = floor ? floor.goal : area === 'lobby' ? cafe.text.goalLobby : area === 'street' ? cafe.text.goalStreet : '';
    }
    if (area === 'subway' && beat() && CC.city.npcs[beat().npc].x > map.street.roadworks) {
      if (ticket) text = detour.goals.go;
      else text = fill(coinCount() < COINS_NEEDED ? detour.goals.coins : detour.goals.buy);
    }
    return [text, carrying ? 'Carrying: ' + carrying : ''].filter(Boolean).join(' · ');
  }

  function guess() {
    var best = null;
    Object.keys(CC.city.genres).forEach(function (genre) {
      if ((scores[genre] || 0) > (scores[best] || 0)) best = genre;
    });
    return best || Object.keys(CC.city.genres)[0];
  }

  function showCard(card, done) {
    mode = 'card';
    cardDone = done;
    $('card-time').textContent = card.time;
    $('card-place').textContent = card.place;
    $('hud-time').textContent = card.time;
    $('hud-place').textContent = card.place;
    $('card').hidden = false;
    cardTimer = setTimeout(closeCard, CARD_MS);
  }

  function closeCard() {
    if (mode !== 'card') return;
    clearTimeout(cardTimer);
    $('card').hidden = true;
    mode = 'walk';
    if (cardDone) cardDone();
  }

  // A conversation is a list of pages, then an optional challenge, then an
  // optional question, then more pages.
  function openDialog(who, lines, story) {
    mode = 'dialog';
    dialog = { who: who, pages: lines.slice(), story: story || null, played: false, asked: false };
    $('dialog').hidden = false;
    $('dialog-who').textContent = who;
    nextPage();
  }

  // Everyone babbles at their own pitch, worked out from their name.
  function voiceOf(name) {
    var sum = 0;
    for (var i = 0; i < name.length; i++) sum += name.charCodeAt(i) * (i + 1);
    return 300 + (sum % 9) * 35;
  }

  // Reveal a line one letter at a time. `done` runs once it is fully shown.
  // Lines somebody says (not the narrator's) babble as they appear.
  function type(text, done) {
    stopTyping();
    var el = $('dialog-text');
    var shown = 0;
    var voice = dialog && dialog.who ? voiceOf(dialog.who) : 0;
    el.textContent = '';
    typing = {
      text: text,
      done: done,
      timer: setInterval(function () {
        shown++;
        el.textContent = text.slice(0, shown);
        var letter = text.charAt(shown - 1);
        if (voice && shown % 2 && /[a-z0-9]/i.test(letter)) CC.sound.blip(voice, letter);
        if (shown >= text.length) finishTyping();
      }, TYPE_MS)
    };
  }

  // Show the rest of the line at once (pressing Talk mid-line does this).
  function finishTyping() {
    if (!typing) return;
    var line = typing;
    stopTyping();
    $('dialog-text').textContent = line.text;
    if (line.done) line.done();
  }

  function stopTyping() {
    if (typing) clearInterval(typing.timer);
    typing = null;
  }

  function nextPage() {
    var choicesEl = $('dialog-choices');
    var hint = $('dialog-hint');
    choicesEl.textContent = '';
    hint.hidden = true;

    if (dialog.pages.length) {
      type(fill(dialog.pages.shift()), function () { hint.hidden = false; });
      return;
    }

    var story = dialog.story;
    if (story && story.game && !dialog.played) {
      dialog.played = true;
      playGame(story.game);
      return;
    }

    if (story && story.choice && !dialog.asked) {
      dialog.asked = true;
      type(story.choice.prompt, function () {
        story.choice.options.forEach(function (option, i) {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'choice';
          var key = document.createElement('span');
          key.className = 'choice__key';
          key.textContent = i + 1;
          button.appendChild(key);
          button.appendChild(document.createTextNode(option.text));
          button.addEventListener('click', function () { choose(option); });
          choicesEl.appendChild(button);
        });
      });
      return;
    }

    closeDialog();
  }

  // Hand the screen to a challenge, then pick the conversation back up.
  function playGame(name) {
    var root = $('minigame');
    mode = 'game';
    listening = name === 'melody';
    keys.left = keys.right = false;
    $('dialog').hidden = true;
    root.textContent = '';
    root.hidden = false;
    stopGame = CC.city.minigames[name](root, keys, function () {
      endGame();
      mode = 'dialog';
      $('dialog').hidden = false;
      nextPage();
    });
  }

  function endGame() {
    if (stopGame) stopGame();
    stopGame = null;
    listening = false;
    $('minigame').hidden = true;
    $('minigame').textContent = '';
  }

  function awaitingAnswer() {
    return dialog.asked && $('dialog-choices').childElementCount > 0;
  }

  function choose(option) {
    if (option.genre) scores[option.genre] = (scores[option.genre] || 0) + 1;
    if (option.carry !== undefined) carrying = option.carry;
    dialog.picked = option;
    dialog.pages = (dialog.story.after || []).slice();
    nextPage();
  }

  function closeDialog() {
    var story = dialog.story;
    var picked = dialog.picked;
    dialog = null;
    $('dialog').hidden = true;
    mode = 'walk';
    if (story && story.serve && picked) serve(story.serve, picked);
    if (!story || story.free) return;

    if (story.carry !== undefined) carrying = story.carry;
    goal = story.goal || '';
    beatIndex++;
    if (storyDone()) finish();
  }

  // The walk is over: remember the doorman's guess. The cafe door now opens.
  function finish() {
    var best = guess();
    CC.state.taste = { scores: scores, guess: best };
    try {
      localStorage.setItem(SAVE_KEY, best);
    } catch (error) { /* private browsing: the guess just won't be remembered */ }
  }

  // ---------- The cafe ----------

  // Move to another area and set up whatever it needs.
  function enter(to, x) {
    area = to;
    player.x = x;
    var floor = floorOf(to);
    setMusic(floor);
    if (floor) return showCard({ time: 'Floor ' + floor.number, place: floor.name });
    if (to === 'lobby' || (to === 'street' && storyDone())) {
      $('hud-time').textContent = '2:00 AM';
      $('hud-place').textContent = to === 'lobby' ? cafe.text.lobbyName : cafe.text.streetName;
    }
    if (to === 'subway' && !seenSubway) {
      seenSubway = true;
      showCard(detour.card);
    }
  }

  // Show a floor's playlist under the game and start it playing, or clear it.
  // Spotify's embed script, when it has loaded, hands over a player we can
  // tell to play; without it the plain player still shows and waits for a click.
  var spotify = null;
  var playing = null;
  var musicFor = null;
  window.onSpotifyIframeApiReady = function (api) {
    spotify = api;
    if (musicFor) setMusic(musicFor); // already on a floor: swap in the player that can start itself
  };
  var embedScript = document.createElement('script');
  embedScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
  embedScript.async = true;
  document.head.appendChild(embedScript);

  function setMusic(floor) {
    var frame = $('player-frame');
    var id = floor && (floor.playlist.match(/playlist\/([A-Za-z0-9]+)/) || [])[1];
    if (playing) playing.destroy();
    playing = null;
    musicFor = id ? floor : null;
    frame.textContent = '';
    $('player').hidden = !id;
    if (!id) return;
    $('player-title').textContent = floor.playing || 'Now playing on the ' + floor.name + ' floor';
    $('player-note').textContent = cafe.text.playerNote;

    if (spotify) {
      var slot = document.createElement('div');
      frame.appendChild(slot);
      spotify.createController(slot, { uri: 'spotify:playlist:' + id, width: '100%', height: 152, theme: 'dark' }, function (controller) {
        if (musicFor !== floor) return controller.destroy(); // left before it loaded
        playing = controller;
        controller.addListener('ready', function () { controller.play(); });
      });
      return;
    }
    var iframe = document.createElement('iframe');
    iframe.src = 'https://open.spotify.com/embed/playlist/' + id + '?theme=0';
    iframe.title = floor.name + ' playlist';
    iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    frame.appendChild(iframe);
  }

  function liftButton(number, name, tag, color, onPick) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'lift__floor';
    var badge = document.createElement('span');
    badge.className = 'lift__number';
    badge.textContent = number;
    if (color) badge.style.setProperty('--floor', color);
    var title = document.createElement('span');
    title.className = 'lift__name';
    title.textContent = name;
    var note = document.createElement('span');
    note.className = 'lift__tag';
    note.textContent = tag;
    button.appendChild(badge);
    button.appendChild(title);
    button.appendChild(note);
    if (onPick) button.addEventListener('click', onPick);
    else button.disabled = true;
    return button;
  }

  // The elevator panel: one button per floor.
  function openLift() {
    var root = $('lift');
    var list = document.createElement('div');
    var heading = document.createElement('h2');
    mode = 'lift';
    keys.left = keys.right = false;
    root.textContent = '';
    heading.className = 'minigame__title';
    heading.textContent = cafe.text.liftTitle;
    list.className = 'lift__floors';
    root.appendChild(heading);
    root.appendChild(list);

    var pick = CC.state.taste && CC.state.taste.guess;
    cafe.floors.forEach(function (floor) {
      var here = floor.id === area;
      var tag = !floor.open ? cafe.text.liftSoon : floor.id === pick ? cafe.text.liftPick : '';
      var go = floor.open && !here ? function () { ride(floor.id); } : null;
      list.appendChild(liftButton(floor.number, floor.name, tag, floor.color, go));
    });
    if (area !== 'lobby') list.appendChild(liftButton('L', cafe.text.liftLobby, '', null, function () { ride('lobby'); }));
    list.appendChild(liftButton('\u00d7', cafe.text.liftStay, '', null, closeLift));

    root.hidden = false;
    var first = list.querySelector('button:not(:disabled)');
    if (first) first.focus();
  }

  function closeLift() {
    if (document.activeElement) document.activeElement.blur();
    $('lift').hidden = true;
    if (mode === 'lift') mode = 'walk';
  }

  function ride(to) {
    closeLift();
    enter(to, rooms.places[to].lift);
  }

  // ---------- Decorating your floor ----------

  var custom = cafe.custom;

  function decorButton(className, text) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    if (text) button.textContent = text;
    return button;
  }

  // The decorate panel: a playlist link, then a row of choices per piece.
  // It sits to one side so the room can be seen changing beside it.
  function openDecor() {
    var root = $('decor');
    var floor = floorOf(area);
    var marks = []; // every choice button, so the pressed ones can be kept in step
    mode = 'decor';
    keys.left = keys.right = false;
    root.textContent = '';

    function change(key, value) {
      custom.settings[key] = value;
      custom.save();
      rooms.refresh();
      marks.forEach(function (mark) {
        mark.button.setAttribute('aria-pressed', String(custom.settings[mark.key] === mark.value));
      });
    }

    function choice(button, key, value) {
      marks.push({ button: button, key: key, value: value });
      button.setAttribute('aria-pressed', String(custom.settings[key] === value));
      button.addEventListener('click', function () { change(key, value); });
      return button;
    }

    function heading(text) {
      var title = document.createElement('p');
      title.className = 'decor__label';
      title.textContent = text;
      return title;
    }

    var top = document.createElement('h2');
    top.className = 'minigame__title';
    top.textContent = cafe.text.decorTitle;
    root.appendChild(top);

    var link = document.createElement('div');
    var input = document.createElement('input');
    var set = decorButton('decor__option', cafe.text.decorSet);
    var status = document.createElement('p');
    link.className = 'decor__link';
    input.type = 'text';
    input.className = 'decor__input';
    input.placeholder = cafe.text.decorPaste;
    input.value = custom.settings.playlist;
    input.setAttribute('aria-label', cafe.text.decorPlaylist);
    status.className = 'decor__status';

    function setPlaylist() {
      var text = input.value.trim();
      var url = custom.playlist(text);
      if (text && !url) {
        status.textContent = cafe.text.decorBadLink;
        return;
      }
      input.value = url;
      status.textContent = url ? cafe.text.decorLinked : cafe.text.decorQuiet;
      if (url === custom.settings.playlist) return;
      change('playlist', url);
      floor.playlist = url;
      setMusic(floor);
    }
    set.addEventListener('click', setPlaylist);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') setPlaylist();
    });
    link.appendChild(input);
    link.appendChild(set);
    root.appendChild(heading(cafe.text.decorPlaylist));
    root.appendChild(link);
    root.appendChild(status);

    custom.rows.forEach(function (row) {
      var line = document.createElement('div');
      line.className = 'decor__row';
      line.appendChild(heading(row.title));
      if (row.pick) {
        var options = document.createElement('div');
        options.className = 'decor__options';
        row.options.forEach(function (option) {
          options.appendChild(choice(decorButton('decor__option', option.name), row.pick, option.id));
        });
        line.appendChild(options);
      }
      if (row.color) {
        var swatches = document.createElement('div');
        swatches.className = 'swatches decor__swatches';
        CC.palette.cloth.forEach(function (color) {
          var swatch = choice(decorButton('swatch'), row.color, color.id);
          swatch.style.setProperty('--chip', color.a);
          swatch.title = color.name;
          swatch.setAttribute('aria-label', row.title + ' colour: ' + color.name);
          swatches.appendChild(swatch);
        });
        line.appendChild(swatches);
      }
      root.appendChild(line);
    });

    var done = decorButton('decor__option decor__done', cafe.text.decorDone);
    done.addEventListener('click', closeDecor);
    root.appendChild(done);
    root.hidden = false;
    root.scrollTop = 0;
  }

  function closeDecor() {
    if (document.activeElement) document.activeElement.blur();
    $('decor').hidden = true;
    if (mode === 'decor') mode = 'walk';
  }

  // ---------- Being served ----------

  // The bartender pours your drink, slides it over, and you drink it.
  function serve(bartender, drink) {
    mode = 'serve';
    keys.left = keys.right = false;
    serving = { from: bartender, drink: drink, start: null, cupX: bartender.x + 12 };
  }

  function drawCup(x, y, drink, full) {
    ctx.fillStyle = '#e8dfcc';
    ctx.fillRect(x - 3, y - 6, 6, 6);
    ctx.fillRect(x + 3, y - 4, 2, 2);
    ctx.fillStyle = full ? drink.color : '#b9ad95';
    ctx.fillRect(x - 2, y - 5, 4, 1);
  }

  function drawSteam(x, y, time) {
    var drift = Math.floor(time / 260) % 3;
    ctx.fillStyle = 'rgba(232, 223, 204, 0.7)';
    ctx.fillRect(x - 2 + drift, y - 9 - drift, 1, 2);
    ctx.fillRect(x + 1 - drift, y - 11 - drift, 1, 2);
  }

  function drawServing(camX, time) {
    if (serving.start === null) serving.start = time;
    var t = time - serving.start;
    var drink = serving.drink;
    var counter = scene.GROUND - 28;
    var from = serving.cupX;
    var to = Math.max(from - 44, Math.min(from + 36, player.x));

    if (t < POUR_MS) {
      // A brass pot tips over the cup and the drink streams in.
      var px = Math.round(from - camX);
      ctx.fillStyle = '#c9a45c';
      ctx.fillRect(px - 9, counter - 17, 7, 6);
      ctx.fillRect(px - 2, counter - 15, 2, 2);
      ctx.fillStyle = '#7d6638';
      ctx.fillRect(px - 11, counter - 16, 2, 4);
      if (t > 300 && !serving.poured) {
        serving.poured = true;
        CC.sound.pour((POUR_MS - 550) / 1000);
      }
      if (t > 300 && t < POUR_MS - 250) {
        ctx.fillStyle = drink.color;
        ctx.fillRect(px - 1, counter - 13, 1, 8);
      }
      drawCup(px, counter, drink, t > 700);
    } else if (t < POUR_MS + SLIDE_MS) {
      var slide = (t - POUR_MS) / SLIDE_MS;
      var sx = Math.round(from + (to - from) * slide - camX);
      drawCup(sx, counter, drink, true);
      if (drink.hot) drawSteam(sx, counter, time);
    } else if (t < POUR_MS + SLIDE_MS + SIP_MS) {
      // Three sips: the cup rises to your mouth, then rests at your chest.
      var sip = (t - POUR_MS - SLIDE_MS) % (SIP_MS / 3);
      var drinking = sip > 300 && sip < 850;
      var hx = Math.round(player.x - camX) + (drinking ? 1 : 5);
      var hy = FEET_Y - CC.H + (drinking ? 19 : 29);
      drawCup(hx, hy, drink, t < POUR_MS + SLIDE_MS + SIP_MS * 0.7);
      ctx.fillStyle = CC.find(CC.palette.skin, CC.state.look.skin).s;
      ctx.fillRect(hx - 2, hy, 4, 2);
      if (drink.hot && !drinking) drawSteam(hx, hy, time);
    } else {
      var who = serving.from;
      serving = null;
      carrying = '';
      openDialog('', [who.menu.done.replace('{drink}', drink.carry.toLowerCase())]);
    }
  }

  // ---------- Sitting down ----------

  // Take a seat and just listen. Space, or walking off, stands you back up.
  function sit(spot) {
    mode = 'sit';
    keys.left = keys.right = false;
    seat = spot;
    player.x = spot.x;
  }

  function stand() {
    seat = null;
    mode = 'walk';
  }

  // ---------- Using things ----------

  // The closest person or thing within reach, or null.
  function nearby() {
    var best = null;
    var bestGap = Infinity;
    function consider(thing, range) {
      var gap = Math.abs(thing.x - player.x);
      if (thing.area === area && gap <= range && gap < bestGap) {
        best = thing;
        bestGap = gap;
      }
    }
    npcs.forEach(function (npc) { consider(npc, TALK_RANGE); });
    SPOTS.forEach(function (spot) {
      if (spot.kind === 'coin' && coins[spot.id]) return;
      if (spot.when && !spot.when()) return;
      consider(spot, USE_RANGE);
    });
    return best;
  }

  function useSpot(spot) {
    if (spot.kind === 'door') {
      enter(spot.to, spot.toX);
    } else if (spot.kind === 'lift') {
      openLift();
    } else if (spot.kind === 'seat') {
      sit(spot);
    } else if (spot.kind === 'decor') {
      openDecor();
    } else if (spot.kind === 'coin') {
      coins[spot.id] = true;
      openDialog('', [detour.lines.coin]);
    } else if (spot.kind === 'machine') {
      if (ticket) return openDialog('', [detour.lines.machineDone]);
      if (coinCount() < COINS_NEEDED) return openDialog('', [detour.lines.machineShort]);
      ticket = true;
      openDialog('', [detour.lines.machineBuy]);
    }
  }

  // The Talk button and Space both land here.
  function act() {
    if (mode === 'card') return closeCard();
    if (mode === 'sit') return stand();
    if (mode === 'dialog') {
      if (typing) finishTyping();
      else if (!awaitingAnswer()) nextPage();
      return;
    }
    if (mode !== 'walk') return;
    var thing = nearby();
    if (!thing) return;
    if (thing.kind) return useSpot(thing);
    var story = beat();
    if (story && story.npc === thing.id) openDialog(thing.name, story.lines, story);
    else if (thing.menu) openDialog(thing.name, [], { free: true, choice: thing.menu, after: [thing.menu.after], serve: thing.menu.serve && thing });
    else openDialog(thing.name, [thing.idle]);
  }

  function hintFor(thing) {
    if (!thing) return '';
    return 'Space: ' + (thing.kind ? thing.hint : 'talk to ' + thing.name);
  }

  // ---------- Movement ----------

  // Barriers in the current area: the roadworks, and the gate until you hold a ticket.
  function walls() {
    if (area === 'street') return [map.street.roadworks];
    if (area === 'subway') return ticket ? [] : [map.subway.gate];
    return rooms.places[area].stage ? [rooms.places[area].stage] : [];
  }

  function move(dx) {
    var from = player.x;
    var to = Math.max(16, Math.min(AREA_WIDTH[area] - 24, from + dx));
    walls().forEach(function (wall) {
      if (from <= wall - WALL_GAP && to > wall - WALL_GAP) to = wall - WALL_GAP;
      if (from >= wall + WALL_GAP && to < wall + WALL_GAP) to = wall + WALL_GAP;
    });
    player.x = to;
  }

  // Where the brass marker should hover, or null.
  function markerX() {
    var story = beat();
    if (mode !== 'walk') return null;
    if (storyDone()) return area === 'street' ? CAFE_DOOR : area === 'lobby' ? rooms.places.lobby.lift : null;
    if (!story) return null;
    var target = CC.city.npcs[story.npc].x;
    var block = map.street.roadworks;
    if (area === 'street') {
      if ((player.x < block) === (target < block)) return target;
      return player.x < block ? map.street.stairsDown : map.street.stairsUp;
    }
    if (target < block) return map.subway.stairsWest;
    if (ticket) return map.subway.stairsEast;
    return coinCount() >= COINS_NEEDED ? map.subway.machine : null;
  }

  // ---------- Loop ----------

  function update(dt) {
    if (mode === 'sit' && (keys.left || keys.right)) stand();
    if (mode !== 'walk') {
      player.moving = false;
      return;
    }

    var story = beat();
    if (story && cardShownFor !== beatIndex && area === 'street') {
      if (!story.card || player.x >= story.card.at) {
        cardShownFor = beatIndex;
        var begin = function () {
          if (story.auto) openDialog(CC.city.npcs[story.npc].name, story.lines, story);
        };
        if (story.card) return showCard(story.card, begin);
        begin();
        if (mode !== 'walk') return;
      }
    }

    var dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    player.moving = dir !== 0;
    if (dir) move(dir * WALK_SPEED * dt);
  }

  function drawCharacter(sprite, x, camX, opts, raise) {
    var posed = CC.renderer.pose(sprite, opts);
    ctx.drawImage(posed, Math.round(x - CC.W / 2 - camX), FEET_Y - CC.H - (raise || 0));
  }

  function drawNpcs(camX, time, behind) {
    npcs.forEach(function (npc) {
      if (npc.area !== area || npc.behind !== behind) return;
      var bob = Math.floor((time + npc.phase) / BOUNCE_MS) % 2 === 1;
      var sway = npc.sways ? Math.round(Math.sin(time / 420)) : 0;
      drawCharacter(npc.sprite, npc.x + sway, camX, { bob: bob }, npc.raise);
    });
  }

  function setText(id, text) {
    var el = $(id);
    if (el.textContent !== text) el.textContent = text;
  }

  function render(time) {
    var camX = Math.max(0, Math.min(AREA_WIDTH[area] - scene.VIEW_W, player.x - scene.VIEW_W / 2));
    ctx.imageSmoothingEnabled = false;
    if (area === 'street') scene.draw(ctx, camX, time);
    else if (area === 'subway') scene.drawSubway(ctx, camX, time, ticket);
    else rooms.draw(area, ctx, camX);

    // Dropped coins glint so they can be spotted.
    if (area === 'subway') {
      map.subway.coins.forEach(function (x, i) {
        if (coins[i]) return;
        var bright = Math.floor((time + i * 260) / 380) % 3 === 0;
        ctx.fillStyle = bright ? '#fff3c4' : '#c9a45c';
        ctx.fillRect(Math.round(x - camX) - 1, FEET_Y - 3, 3, 2);
        if (bright) ctx.fillRect(Math.round(x - camX), FEET_Y - 5, 1, 6);
      });
    }

    // People behind a counter first, then the counter, then everyone else.
    drawNpcs(camX, time, true);
    if (rooms.fronts[area]) rooms.fronts[area](ctx, camX, time);
    drawNpcs(camX, time, false);

    // A brass marker hovers over whoever, or wherever, you need next.
    var mark = markerX();
    if (mark !== null) {
      var mx = Math.round(mark - camX);
      var my = FEET_Y - CC.H - 7 + (Math.floor(time / 300) % 2);
      ctx.fillStyle = '#f2c96b';
      ctx.fillRect(mx - 1, my - 2, 2, 6);
      ctx.fillRect(mx - 3, my, 6, 2);
    }

    // A footstep each time the shuffle sets a foot back down.
    var shuffle = player.moving ? Math.floor(time / STEP_MS) % STEPS.length : -1;
    if (shuffle !== stride && shuffle >= 0 && !STEPS[shuffle]) CC.sound.step(shuffle === 1);
    stride = shuffle;

    var pose = player.moving
      ? { step: STEPS[Math.floor(time / STEP_MS) % STEPS.length] }
      : { bob: Math.floor(time / BOUNCE_MS) % 2 === 1 };
    if (seat) pose.sit = true;
    drawCharacter(player.sprite, player.x, camX, pose, seat ? seat.raise : 0);
    if (serving) drawServing(camX, time);

    setText('hud-goal', goalText());
    setText('hud-hint', mode === 'walk' ? hintFor(nearby()) : mode === 'sit' ? 'Space: ' + cafe.text.stand : '');
  }

  function frame(time) {
    if (!running) return;
    var dt = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    // Lofi out on the street and down in the subway; the cafe has its own playlists.
    CC.sound.music((area === 'street' || area === 'subway') && !listening);
    update(dt);
    render(time);
    requestAnimationFrame(frame);
  }

  // ---------- Input ----------

  var KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };

  window.addEventListener('keydown', function (event) {
    if (!running) return;
    // Typing a playlist link: leave the letters alone.
    if (event.target.tagName === 'INPUT' && event.key !== 'Escape') return;
    if (KEYMAP[event.key]) {
      keys[KEYMAP[event.key]] = true;
      event.preventDefault();
    } else if (event.key === ' ' || event.key === 'Enter' || event.key === 'e' || event.key === 'E') {
      // Let Enter and Space press a focused button (an answer, a record) as usual.
      var focused = document.activeElement;
      if (focused && focused.tagName === 'BUTTON' && focused.offsetParent && mode !== 'walk') return;
      event.preventDefault();
      if (!event.repeat) act();
    } else if (event.key === 'Escape' && mode === 'lift') {
      closeLift();
    } else if (event.key === 'Escape' && mode === 'decor') {
      closeDecor();
    } else if (mode === 'dialog' && /^[1-9]$/.test(event.key)) {
      var button = $('dialog-choices').children[Number(event.key) - 1];
      if (button) button.click();
    }
  });

  window.addEventListener('keyup', function (event) {
    if (KEYMAP[event.key]) keys[KEYMAP[event.key]] = false;
  });

  window.addEventListener('blur', function () {
    keys.left = keys.right = false;
  });

  function hold(id, key) {
    var button = $(id);
    button.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      keys[key] = true;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
      button.addEventListener(type, function () { keys[key] = false; });
    });
  }

  hold('pad-left', 'left');
  hold('pad-right', 'right');
  $('pad-talk').addEventListener('click', act);
  $('card').addEventListener('click', closeCard);
  $('dialog').addEventListener('click', function (event) {
    if (event.target.closest('.choice')) return;
    act();
  });
  $('city-back').addEventListener('click', stop);

  // ---------- Full screen ----------

  // Only the game frame goes full screen; the music player stays on the page
  // behind it and keeps playing.
  var screenEl = $('screen');
  var fullButton = $('fullscreen');
  var enterFull = screenEl.requestFullscreen || screenEl.webkitRequestFullscreen;
  var exitFull = document.exitFullscreen || document.webkitExitFullscreen;

  function isFull() {
    return (document.fullscreenElement || document.webkitFullscreenElement) === screenEl;
  }

  // Scale the frame to fill the screen, keeping its 16:9 shape.
  function fitScreen() {
    var frame = screenEl.firstElementChild;
    var fit = Math.min(screenEl.clientWidth / frame.offsetWidth, screenEl.clientHeight / frame.offsetHeight);
    if (isFull() && fit > 0) screenEl.style.setProperty('--fit', fit);
    else screenEl.style.removeProperty('--fit');
  }

  function onFullChange() {
    var full = isFull();
    var label = full ? 'Exit full screen' : 'Full screen';
    screenEl.classList.toggle('is-full', full);
    fullButton.title = label;
    fullButton.setAttribute('aria-label', label);
    fitScreen();
  }

  if (enterFull && exitFull) {
    fullButton.hidden = false;
    fullButton.addEventListener('click', function () {
      // Drop focus so Space keeps talking instead of pressing this button again.
      fullButton.blur();
      if (isFull()) exitFull.call(document);
      else enterFull.call(screenEl);
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (type) {
      document.addEventListener(type, onFullChange);
    });
    window.addEventListener('resize', fitScreen);
  }

  CC.city.start = start;
  CC.city.reachedCafe = function () { return !!savedGuess(); };
  CC.showSkip();
})(window.CozyCafe);
