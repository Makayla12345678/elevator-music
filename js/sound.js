// All the game's own sound, made on the spot with Web Audio (no audio files):
// plucked notes for the melody challenge, the babble people make while they
// talk, your footsteps, a drink being poured and sipped, and the lofi loop that plays out
// on the street. Silent if the browser has no Web Audio.
(function (CC) {
  var audio = null;
  var STEP_VOLUME = 0.5;    // footsteps; turn these two up or down to taste
  var POUR_VOLUME = 0.6;    // a drink being poured
  var SIP_VOLUME = 0.5;     // a sip of that drink
  var CLICK_VOLUME = 0.25;  // picking something in the wardrobe

  // ---------- Street lofi ----------

  var MUSIC_VOLUME = 0.5;
  var STEP = 60 / 74 / 2;   // one eighth note, in seconds
  var SWING = 0.05;         // how late the off-beats land
  var LOOKAHEAD = 1.2;      // seconds of music queued ahead of the clock
  // One chord per bar, as MIDI notes: Fmaj7, Em7, Dm9, Cmaj7.
  var CHORDS = [
    [53, 57, 60, 64],
    [52, 55, 59, 62],
    [50, 53, 57, 60, 64],
    [48, 52, 55, 59]
  ];
  var KICK = [1, 0, 0, 0, 0, 1, 0, 0];
  var SNARE = [0, 0, 1, 0, 0, 0, 1, 0];

  var bus = null;      // everything in the loop runs through this, so it can fade
  var keysTone = null; // muffles the chords
  var noise = null;
  var musicOn = false;
  var ticker = null;
  var nextTime = 0;
  var step = 0;

  function hertz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function noiseBuffer(seconds, fill) {
    var buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * seconds), audio.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = fill();
    return buffer;
  }

  function buildBus() {
    bus = audio.createGain();
    bus.gain.value = 0;
    bus.connect(audio.destination);
    keysTone = audio.createBiquadFilter();
    keysTone.type = 'lowpass';
    keysTone.frequency.value = 900;
    keysTone.connect(bus);

    // Vinyl crackle: faint hiss with the odd pop, looping under everything.
    var crackle = audio.createBufferSource();
    crackle.buffer = noiseBuffer(4, function () {
      var hiss = (Math.random() * 2 - 1) * 0.006;
      return Math.random() < 0.0006 ? hiss + (Math.random() * 2 - 1) * 0.25 : hiss;
    });
    crackle.loop = true;
    crackle.connect(bus);
    crackle.start();
  }

  // One soft tone that swells in and dies away.
  function tone(type, frequency, at, seconds, volume, out) {
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = Math.random() * 14 - 7; // slightly out of tune, like worn tape
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    osc.connect(gain);
    gain.connect(out);
    osc.start(at);
    osc.stop(at + seconds + 0.02);
  }

  function kick(at) {
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.frequency.setValueAtTime(130, at);
    osc.frequency.exponentialRampToValueAtTime(45, at + 0.12);
    gain.gain.setValueAtTime(0.5, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.28);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(at);
    osc.stop(at + 0.3);
  }

  function whiteNoise() {
    if (!noise) noise = noiseBuffer(1, function () { return Math.random() * 2 - 1; });
    return noise;
  }

  // A burst of filtered noise: the snare, the hi-hat and a footstep.
  // `out` is where it plays; left out, it joins the street loop.
  function hiss(at, filterType, frequency, volume, seconds, out) {
    var source = audio.createBufferSource();
    var filter = audio.createBiquadFilter();
    var gain = audio.createGain();
    source.buffer = whiteNoise();
    filter.type = filterType;
    filter.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + seconds);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(out || bus);
    source.start(at, Math.random() * 0.5);
    source.stop(at + seconds + 0.02);
  }

  function playStep(index, at) {
    var beat = index % 8;
    var chord = CHORDS[Math.floor(index / 8) % CHORDS.length];
    if (beat % 2) at += SWING;
    if (beat === 0) {
      chord.forEach(function (midi, i) {
        tone('triangle', hertz(midi), at + i * 0.025, STEP * 7.5, 0.07, keysTone);
      });
      tone('triangle', hertz(chord[0] - 12), at, STEP * 3, 0.16, bus);
    }
    if (beat === 5) tone('triangle', hertz(chord[0] - 12), at, STEP * 2, 0.12, bus);
    // A few stray notes from the chord, an octave up, so no two bars match.
    if (beat > 1 && Math.random() < 0.3) {
      var pick = chord[Math.floor(Math.random() * chord.length)];
      tone('sine', hertz(pick + 12), at, STEP * 2.5, 0.05, bus);
    }
    if (KICK[beat]) kick(at);
    if (SNARE[beat]) hiss(at, 'bandpass', 1800, 0.14, 0.13);
    hiss(at, 'highpass', 7000, beat % 2 ? 0.02 : 0.035, 0.04);
  }

  // Queue up the steps that fall inside the lookahead window.
  function schedule() {
    if (!musicOn) {
      clearInterval(ticker);
      ticker = null;
      return;
    }
    while (nextTime < audio.currentTime + LOOKAHEAD) {
      playStep(step, nextTime);
      step++;
      nextTime += STEP;
    }
  }

  CC.sound = {
    // Browsers only allow sound after a click or key press, so call this from one.
    unlock: function () {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      if (!audio) audio = new Ctor();
      if (audio.state === 'suspended') audio.resume();
    },

    note: function (frequency, seconds) {
      if (!audio) return;
      seconds = seconds || 0.45;
      var now = audio.currentTime;
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.type = 'triangle';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + seconds);
    },

    // One syllable of talking. `voice` is the speaker's pitch in hertz and
    // `letter` nudges it, so a line rises and falls as it is spelled out.
    blip: function (voice, letter) {
      if (!audio) return;
      var now = audio.currentTime;
      var pitch = voice * Math.pow(2, (letter.toLowerCase().charCodeAt(0) % 6) / 12);
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(pitch * 0.9, now);
      osc.frequency.exponentialRampToValueAtTime(pitch, now + 0.02);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    },

    // A small, soft tick for picking something in the wardrobe. The pitch
    // wobbles a little each time so a run of clicks doesn't sound mechanical.
    click: function () {
      if (!audio) return;
      var now = audio.currentTime;
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900 + Math.random() * 120, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.05);
      gain.gain.setValueAtTime(CLICK_VOLUME, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + 0.08);
      hiss(now, 'highpass', 3000, CLICK_VOLUME * 0.4, 0.02, audio.destination);
    },

    // One soft footfall. The left foot lands a little lower than the right.
    step: function (left) {
      if (!audio) return;
      hiss(audio.currentTime, 'lowpass', left ? 420 : 520, STEP_VOLUME, 0.07, audio.destination);
    },

    // A drink trickling into a cup for `seconds`, rising in pitch as it fills.
    pour: function (seconds) {
      if (!audio) return;
      var now = audio.currentTime;
      var source = audio.createBufferSource();
      var filter = audio.createBiquadFilter();
      var gain = audio.createGain();
      var gurgle = audio.createOscillator();
      var depth = audio.createGain();
      source.buffer = whiteNoise();
      source.loop = true;
      filter.type = 'bandpass';
      filter.Q.value = 3;
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.linearRampToValueAtTime(1700, now + seconds);
      gurgle.frequency.value = 13;
      depth.gain.value = 220;
      gurgle.connect(depth);
      depth.connect(filter.frequency);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(POUR_VOLUME, now + 0.08);
      gain.gain.setValueAtTime(POUR_VOLUME, now + seconds - 0.12);
      gain.gain.linearRampToValueAtTime(0.0001, now + seconds);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      source.start(now);
      gurgle.start(now);
      source.stop(now + seconds + 0.02);
      gurgle.stop(now + seconds + 0.02);
    },

    // One sip: a slurp of air and liquid rising in pitch, then a soft swallow.
    sip: function () {
      if (!audio) return;
      var now = audio.currentTime;
      var source = audio.createBufferSource();
      var filter = audio.createBiquadFilter();
      var gain = audio.createGain();
      source.buffer = whiteNoise();
      filter.type = 'bandpass';
      filter.Q.value = 4;
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(2600, now + 0.3);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(SIP_VOLUME, now + 0.06);
      gain.gain.linearRampToValueAtTime(SIP_VOLUME * 0.6, now + 0.25);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.34);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      source.start(now, Math.random() * 0.5);
      source.stop(now + 0.36);
      var gulp = audio.createOscillator();
      var gulpGain = audio.createGain();
      gulp.type = 'sine';
      gulp.frequency.setValueAtTime(190, now + 0.38);
      gulp.frequency.exponentialRampToValueAtTime(110, now + 0.5);
      gulpGain.gain.setValueAtTime(0.0001, now + 0.38);
      gulpGain.gain.linearRampToValueAtTime(SIP_VOLUME * 0.5, now + 0.4);
      gulpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
      gulp.connect(gulpGain);
      gulpGain.connect(audio.destination);
      gulp.start(now + 0.38);
      gulp.stop(now + 0.54);
    },

    // Fade the street's lofi loop in or out. Safe to call every frame.
    music: function (on) {
      on = !!on;
      if (!audio || on === musicOn) return;
      musicOn = on;
      if (!bus) buildBus();
      var now = audio.currentTime;
      bus.gain.cancelScheduledValues(now);
      bus.gain.setTargetAtTime(on ? MUSIC_VOLUME : 0, now, on ? 0.6 : 0.25);
      if (!on) return;
      if (nextTime < now + 0.05) nextTime = now + 0.05;
      if (!ticker) ticker = setInterval(schedule, 200);
      schedule();
    }
  };
})(window.CozyCafe);
