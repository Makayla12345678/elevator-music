(function (CC) {
  var listeners = [];

  // The character's look. Later sections (the city, the cafe) read this same object.
  CC.state = {
    look: {
      skin: 'honey',
      hair: 'curls',
      hairColor: 'ink',
      top: 'hoodie',
      topColor: 'oxblood',
      bottom: 'cargos',
      bottomColor: 'slate',
      shoes: 'sneakers',
      shoesColor: 'bone'
    },

    set: function (key, value) {
      if (this.look[key] === value) return;
      this.look[key] = value;
      listeners.forEach(function (fn) { fn(CC.state.look); });
    },

    onChange: function (fn) {
      listeners.push(fn);
    }
  };
})(window.CozyCafe);
