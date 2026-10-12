// A one-time note asking visitors to sign in to Spotify, since the playlist
// players only play whole songs for someone who is signed in. It shows on the
// first visit and is remembered as seen from then on.
(function () {
  var SEEN_KEY = 'cozycafe.spotifyNotice';

  var root = document.getElementById('notice');
  var close = document.getElementById('notice-close');
  if (!root || !close) return;

  // Storage can be switched off (private windows, blocked site data). Then the
  // note simply shows on every visit.
  function seen() {
    try {
      return !!localStorage.getItem(SEEN_KEY);
    } catch (error) {
      return false;
    }
  }

  function remember() {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch (error) { /* nothing to do: it will show again next time */ }
  }

  function onKey(event) {
    if (event.key === 'Escape') dismiss();
  }

  function dismiss() {
    // Hand focus back to the page if it was inside the note, so it is not lost.
    if (root.contains(document.activeElement)) document.activeElement.blur();
    root.hidden = true;
    window.removeEventListener('keydown', onKey);
  }

  if (seen()) return;

  // Marked as seen on showing, not on closing, so a reload does not bring it back.
  root.hidden = false;
  remember();
  close.addEventListener('click', dismiss);
  window.addEventListener('keydown', onKey);
})();
