(function (CC) {
  // Slots: k outline, a base, b shadow, c highlight, w light accent
  function shoes(id, name, style, y, rows) {
    return { id: id, name: name, style: style, poses: { front: CC.sprite({ y: y, mirror: true, rows: rows }) } };
  }

  CC.sprites.shoes = [
    // ---------- Streetwear ----------
    shoes('sneakers', 'Sneakers', 'streetwear', 43, [
      '..........kaaaak',
      '.........kaawaak', // 44 laces
      '........kwwaaaak', // 45 toe cap
      '........kwwwwwwk', // 46 sole
      '........kkkkkkkk'
    ]),

    shoes('high-tops', 'High-Tops', 'streetwear', 40, [
      '..........kaaaak',
      '..........kaawak',
      '..........kaawak',
      '..........kaawak',
      '.........kaaawak',
      '........kwwaaaak',
      '........kwwwwwwk',
      '........kkkkkkkk'
    ]),

    // ---------- Cool ----------
    shoes('combat-boots', 'Combat Boots', 'grunge', 37, [
      '..........kaaaak',
      '..........kaawak', // laces
      '..........kaaaak',
      '..........kaawak',
      '..........kaaaak',
      '..........kaawak',
      '.........kaaaaak',
      '........kaaaaaak',
      '.......kaaacaaak', // 45 chunky toe
      '.......kbbbbbbbk',
      '.......kkkkkkkkk'
    ]),

    // ---------- Deco noir ----------
    shoes('oxfords', 'Oxfords', 'deco', 44, [
      '..........kaaaak',
      '........kccaaaak', // 45 polished toe
      '........kkkkkkkk'
    ]),

    shoes('t-straps', 'T-Straps', 'deco', 43, [
      '..........kaaaak', // 43 ankle strap
      '..........k.aa.k', // 44 the gaps show the foot
      '.........kaaaaak',
      '.........kkkkkkk'
    ])
  ];
})(window.CozyCafe);
