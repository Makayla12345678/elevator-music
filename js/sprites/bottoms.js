(function (CC) {
  // Slots: k outline, a base, b shadow, c highlight, w light accent
  function bottom(id, name, style, y, rows) {
    return { id: id, name: name, style: style, poses: { front: CC.sprite({ y: y, mirror: true, rows: rows }) } };
  }

  CC.sprites.bottom = [
    // ---------- Streetwear ----------
    bottom('cargos', 'Cargos', 'streetwear', 27, [
      '..........kaaaaa', // 27 waist
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '.........kaaaaab',
      '.........kaaaaak',
      '.........kaaaaak',
      '.........kaaaaak',
      '.........kbbbaak', // 36 cargo pocket
      '.........kbaaaak',
      '.........kbaaaak',
      '.........kbbbaak',
      '.........kaaaaak',
      '.........kaaaaak',
      '.........kaaaaak',
      '.........kaaaaak',
      '.........kbbbbbk'  // 44 cuff stacked on the shoe
    ]),

    bottom('joggers', 'Joggers', 'streetwear', 27, [
      '..........kwaaaa', // 27 waist, side stripe
      '..........kwaaaa',
      '..........kwaaaa',
      '..........kwaaaa',
      '..........kwaaaa',
      '..........kwaaaa',
      '..........kwaaak',
      '..........kwaaak',
      '..........kwaaak',
      '..........kwaaak',
      '..........kwaaak',
      '..........kwaaak',
      '..........kwaaak',
      '..........kwaaak',
      '..........kwaaak',
      '..........kwaaak',
      '..........kbbbbk'  // 43 ankle cuff
    ]),

    bottom('baggy-shorts', 'Baggy Shorts', 'streetwear', 27, [
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '.........kaaaaab',
      '.........kaaaaak',
      '.........kaaaaak',
      '.........kaaaaak',
      '.........kaaaaak',
      '.........kbbbbbk', // 37 hem at the knee
      '.........kkkkkkk'
    ]),

    // ---------- Cool ----------
    bottom('ripped-jeans', 'Ripped Jeans', 'grunge', 27, [
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaak',
      '..........kaaaak',
      '..........kaaaak',
      '..........kaaaak',
      '..........ka..ak', // 37 knee rip (the gap shows skin)
      '..........kaw.ak',
      '..........kaaaak',
      '..........kaaaak',
      '..........kaaaak',
      '..........kaaaak',
      '..........kaaaak',
      '..........kbbbbk'
    ]),

    bottom('plaid-skirt', 'Plaid Skirt', 'grunge', 27, [
      '..........kaaaaa',
      '..........kbbbbb',
      '..........kabaab',
      '..........kabaab',
      '.........kaabaab',
      '.........kcccccc', // 32 plaid crossbar
      '........kaabaaba',
      '........kaabaaba',
      '........kbbbbbbb',
      '........kkkkkkkk'
    ]),

    bottom('baggy-jeans', 'Baggy Jeans', 'grunge', 27, [
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '.........kaaaaaa',
      '.........kaaaabk',
      '.........kaaaabk',
      '.........kaaaabk',
      '.........kaaaabk',
      '.........kaaaabk',
      '........kbaaaabk',
      '........kbaaaabk',
      '........kbaaaabk',
      '........kbaaaabk',
      '........kbaaaabk',
      '........kbaaaabk',
      '........kaaaaabk',
      '........kaaaaabk',
      '........kbbbbbbk'  // 46 hems puddle over the shoes
    ]),

    // ---------- Deco noir ----------
    bottom('high-waist-trousers', 'High-Waist Trousers', 'deco', 27, [
      '..........kbbbbb', // 27 waistband
      '..........kaaaay', // brass button
      '..........kaabaa', // pleat
      '..........kaabaa',
      '..........kaabaa',
      '.........kaaabaa',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kaaabak',
      '.........kbbbbbk'  // 44 turn-ups
    ]),

    bottom('pencil-skirt', 'Pencil Skirt', 'deco', 27, [
      '..........kbbbbb',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaab',
      '..........kaaaab',
      '..........kbbbbb', // 40 hem at the calf
      '..........kkkkkk'
    ]),

    bottom('pinstripe-slacks', 'Pinstripe Slacks', 'deco', 27, [
      '..........kbbbbb',
      '..........kacaca',
      '..........kacaca',
      '..........kacaca',
      '..........kacaca',
      '..........kacaca',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kacack',
      '..........kbbbbk'
    ])
  ];
})(window.CozyCafe);
