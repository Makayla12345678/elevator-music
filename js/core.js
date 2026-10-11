// Shared namespace. Plain <script> tags (no modules) so index.html runs by double-click.
window.CozyCafe = window.CozyCafe || {};

(function (CC) {
  CC.W = 32;
  CC.H = 48;
  CC.sprites = {};

  // Expand a compact drawing into the full 48-row x 32-column grid.
  //   y:      row the drawing starts on (rows above and below are left empty)
  //   mirror: rows are the left 16 columns and get flipped onto the right half
  //   rows:   strings where "." is transparent and any other character is a colour slot
  CC.sprite = function (def) {
    var blank = new Array(CC.W + 1).join('.');
    var grid = [];
    var width = def.mirror ? CC.W / 2 : CC.W;
    for (var i = 0; i < CC.H; i++) grid.push(blank);
    def.rows.forEach(function (row, i) {
      if (row.length !== width) {
        throw new Error('Sprite row ' + (def.y + i) + ' is ' + row.length + ' wide, expected ' + width + ': "' + row + '"');
      }
      if (def.y + i >= CC.H) throw new Error('Sprite runs past row ' + (CC.H - 1));
      grid[def.y + i] = def.mirror ? row + row.split('').reverse().join('') : row;
    });
    return grid;
  };

  CC.find = function (list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };
})(window.CozyCafe);
