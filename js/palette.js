(function (CC) {
  CC.palette = {
    // s base, d shadow, k outline, m mouth
    skin: [
      { id: 'porcelain', name: 'Porcelain', s: '#f3d6c1', d: '#d9ab95', k: '#6b3f3a', m: '#b0545a' },
      { id: 'sand',      name: 'Sand',      s: '#e6b991', d: '#c48f6c', k: '#5c3528', m: '#a34a4a' },
      { id: 'honey',     name: 'Honey',     s: '#cf9a66', d: '#a87446', k: '#4d2c1c', m: '#8e3f3c' },
      { id: 'bronze',    name: 'Bronze',    s: '#a9713f', d: '#85532b', k: '#3c2113', m: '#7a3230' },
      { id: 'umber',     name: 'Umber',     s: '#7d4e2d', d: '#5f381e', k: '#2a160c', m: '#5e2423' },
      { id: 'espresso',  name: 'Espresso',  s: '#573520', d: '#402514', k: '#1c0e07', m: '#451a1b' }
    ],

    // a base, b shadow, c highlight, k outline
    hair: [
      { id: 'ink',      name: 'Ink',        a: '#2a2530', b: '#18141d', c: '#4a4356', k: '#0c0a10' },
      { id: 'walnut',   name: 'Walnut',     a: '#5a3a26', b: '#3d2618', c: '#7d5638', k: '#22140c' },
      { id: 'copper',   name: 'Copper',     a: '#a8522a', b: '#7c3619', c: '#cf7a45', k: '#44190a' },
      { id: 'brass',    name: 'Brass',      a: '#d2a95a', b: '#a57f3b', c: '#ecd08c', k: '#5e4418' },
      { id: 'ash',      name: 'Ash',        a: '#a9a4a0', b: '#7c7773', c: '#d4d0cb', k: '#45413f' },
      { id: 'oxblood',  name: 'Oxblood',    a: '#9a2233', b: '#6b1422', c: '#c7445a', k: '#3a0a13' },
      { id: 'absinthe', name: 'Absinthe',   a: '#2f8f84', b: '#1e655d', c: '#5cc0b3', k: '#0d3430' },
      { id: 'violet',   name: 'Violet',     a: '#6b4a9c', b: '#4a3172', c: '#9675c9', k: '#261740' }
    ],

    // a base, b shadow, c highlight, k outline. Shared by tops, bottoms and shoes.
    // Optional w and g override the accent colours where bone-on-bone would vanish.
    cloth: [
      { id: 'ink',     name: 'Ink',     a: '#34303d', b: '#221f29', c: '#524c5e', k: '#0c0a10' },
      { id: 'bone',    name: 'Bone',    a: '#e3d9c4', b: '#b9ad95', c: '#f6f0e2', k: '#2b2722', w: '#34303d', g: '#221f29' },
      { id: 'slate',   name: 'Slate',   a: '#6f7480', b: '#4f535d', c: '#9297a3', k: '#25272d' },
      { id: 'oxblood', name: 'Oxblood', a: '#8a2433', b: '#5f1622', c: '#b3404f', k: '#2d0910' },
      { id: 'olive',   name: 'Olive',   a: '#646b3c', b: '#454a27', c: '#868e57', k: '#20230f' },
      { id: 'denim',   name: 'Denim',   a: '#3f5f8a', b: '#2b4365', c: '#6485b0', k: '#111d2e' },
      { id: 'mustard', name: 'Mustard', a: '#c9993a', b: '#987025', c: '#e4bd68', k: '#49340d' },
      { id: 'plum',    name: 'Plum',    a: '#6a3c6e', b: '#48274c', c: '#8e5b92', k: '#211024' }
    ],

    // Accent colours clothing can use on top of its ramp: w light, g its shadow, x dark, y brass.
    details: { w: '#e8dfcc', g: '#b9ad95', x: '#17141d', y: '#c9a45c' },

    // Fixed colours on the base body.
    body: { e: '#1a1420', w: '#f4efe6', u: '#cfc8bb', v: '#6e6a70' }
  };
})(window.CozyCafe);
