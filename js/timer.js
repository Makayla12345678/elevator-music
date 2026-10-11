// A countdown at the top of the screen, for studying or reading along to the
// music. It counts against the clock, so it stays right in a background tab.
(function (CC) {
  var STEP = 5, SHORTEST = 5, LONGEST = 120; // minutes
  var CHIME = [660, 880, 1320];              // hertz

  var root = document.getElementById('timer');
  var timeEl = document.getElementById('timer-time');
  var less = document.getElementById('timer-less');
  var more = document.getElementById('timer-more');
  var go = document.getElementById('timer-go');
  var reset = document.getElementById('timer-reset');

  var length = 25;            // minutes
  var left = length * 60000;  // milliseconds to go while stopped
  var endsAt = 0;             // when it runs out, or 0 while stopped
  var done = false;
  var ticking;

  function remaining() {
    return endsAt ? Math.max(0, endsAt - Date.now()) : left;
  }

  function two(n) { return (n < 10 ? '0' : '') + n; }

  function render() {
    var seconds = Math.ceil(remaining() / 1000);
    var label = endsAt ? 'Pause timer' : 'Start timer';
    timeEl.textContent = two(Math.floor(seconds / 60)) + ':' + two(seconds % 60);
    go.textContent = endsAt ? 'II' : '▶';
    go.title = label;
    go.setAttribute('aria-label', label);
    less.disabled = !!endsAt || length <= SHORTEST;
    more.disabled = !!endsAt || length >= LONGEST;
    root.classList.toggle('is-running', !!endsAt);
    root.classList.toggle('is-done', done);
  }

  function stop() {
    left = remaining();
    endsAt = 0;
    clearInterval(ticking);
  }

  function tick() {
    if (!remaining()) {
      stop();
      done = true;
      CHIME.forEach(function (frequency, i) {
        setTimeout(function () { CC.sound.note(frequency, 0.6); }, i * 180);
      });
    }
    render();
  }

  function rewind() {
    stop();
    left = length * 60000;
    done = false;
  }

  // Drop focus after each press so Space keeps talking instead of pressing the button again.
  function press(button, action) {
    button.addEventListener('click', function () {
      button.blur();
      action();
      render();
    });
  }

  press(go, function () {
    if (endsAt) return stop();
    if (!left) rewind();
    CC.sound.unlock(); // so the chime can play when time is up
    endsAt = Date.now() + left;
    ticking = setInterval(tick, 250);
  });
  press(less, function () { length = Math.max(SHORTEST, length - STEP); rewind(); });
  press(more, function () { length = Math.min(LONGEST, length + STEP); rewind(); });
  press(reset, rewind);

  less.title = 'Five minutes less';
  more.title = 'Five minutes more';
  reset.title = 'Reset timer';
  render();
})(window.CozyCafe);
