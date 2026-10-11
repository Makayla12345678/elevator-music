(function (CC) {
  // Slots: k outline, a base, b shadow, c highlight, w light accent, g its shadow,
  //        x dark accent, y brass
  // dress: true means the top replaces the bottom, so the legs show bare beneath it.
  function top(id, name, style, y, rows, dress) {
    return { id: id, name: name, style: style, dress: !!dress, poses: { front: CC.sprite({ y: y, mirror: true, rows: rows }) } };
  }

  CC.sprites.top = [
    // ---------- Streetwear ----------
    top('hoodie', 'Hoodie', 'streetwear', 18, [
      '..........kaab..', // 18 hood bunched at the neck
      '.......kkkaaabb.',
      '......kaaaaaaawa', // 20 drawstrings
      '......kaaakaaawa',
      '......kaabkaaawa',
      '......kaabkaaaaa',
      '......kaabkaaaaa',
      '......kaabkabbbb', // 25 pocket
      '......kaabkabaaa',
      '......kaabkabaaa',
      '......kaabkabaaa',
      '......kbbbkbbbbb', // 29 cuffs + hem
      '..........kkkkkk'
    ]),

    top('big-tee', 'Big Tee', 'streetwear', 19, [
      '.......kkkaaaab.',
      '......kaaaaaaaab',
      '......kaaakaaaaa',
      '......kaabkaawww', // 22 box logo
      '......kaabkaawww',
      '......kbbbkaaaaa', // 24 sleeve hem
      '......kkkkkaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaab',
      '..........kbbbbb',
      '..........kkkkkk'
    ]),

    top('crewneck', 'Crewneck', 'streetwear', 19, [
      '.......kkkaaaab.',
      '......kaaaaaaaab',
      '......kaaakaaaaa',
      '......kaabkaaaaa',
      '......kwwwkwwwww', // 23 chest stripe
      '......kaabkaaaaa',
      '......kaabkaaaaa',
      '......kaabkaaaaa',
      '......kaabkaaaaa',
      '......kaabkaaaaa',
      '......kbbbkbbbbb',
      '..........kkkkkk'
    ]),

    top('jersey', 'Jersey', 'streetwear', 19, [
      '...........kab..',
      '..........kaab..',
      '..........kaaab.',
      '..........kaaaab',
      '..........kaaaaa',
      '..........kaaawa', // 24 number 11
      '..........kaaawa',
      '..........kaaawa',
      '..........kaaawa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kbbbbb',
      '..........kkkkkk'
    ]),

    // ---------- Cool ----------
    top('flannel', 'Flannel', 'grunge', 19, [
      '.......kkkaaacc.', // 19 collar
      '......kaaaaaaacb',
      '......kabakaabab',
      '......kbcbkbbcbb', // 22 plaid crossbar
      '......kabakaabab',
      '......kabakaabab',
      '......kbcbkbbcbb',
      '......kabakaabab',
      '......kabakaabab',
      '......kbcbkbbcbb',
      '......kabakaabab',
      '..........kaabab', // 30 untucked tail
      '..........kkkkkk'
    ]),

    top('band-tee', 'Band Tee', 'grunge', 19, [
      '.........kkaaab.',
      '........kaaaaaab',
      '.......kaakaaaaa',
      '.......kaakaawww', // 22 skull print
      '.......kbbkawxww',
      '.......kkkkawwww',
      '..........kaawxw',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaab',
      '..........kbabba', // 29 worn hem
      '..........kkkkkk'
    ]),

    top('striped-knit', 'Striped Knit', 'grunge', 19, [
      '......kkkkaaab..', // 19 stretched neck
      '.....kaaaaaaaab.',
      '.....kbbbbkbbbbb',
      '.....kbbbbkbbbbb',
      '.....kcccckccccc',
      '.....kcccckccccc',
      '.....kbbbbkbbbbb',
      '.....kbbbbkbbbbb',
      '.....kcccckccccc',
      '.....kcccckccccc',
      '.....kbbbbkbbbbb',
      '.....kbbbbkbbbbb', // 30 sleeves swallow the hands
      '......kkkkkaaaaa',
      '..........kkkkkk'
    ]),

    // ---------- Deco noir ----------
    top('slip-dress', 'Slip Dress', 'deco', 19, [
      '...........kk...',
      '...........aa...', // 20 thin straps
      '..........kaawww', // 21 lace neckline
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaab',
      '..........kaaaba',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '.........kaaaaaa',
      '.........kaabaaa',
      '........kaaabaaa',
      '........kaaabaab',
      '........kwwwwwww', // 36 lace hem
      '........kkkkkkkk'
    ], true),

    top('flapper-dress', 'Flapper Dress', 'deco', 19, [
      '...........kk...',
      '..........kaab..',
      '..........kaaab.',
      '..........kaaaab',
      '..........kaaaaa',
      '..........kacaaa',
      '..........kacaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kaaaaa',
      '..........kyyyyy', // 30 dropped waist sash
      '..........kaaaaa',
      '.........kaaaaaa',
      '.........kaabaab',
      '.........kaabaab',
      '.........kaabaab',
      '.........kbabbab',
      '.........kababab', // 37 fringe
      '.........k.k.k.k'
    ], true),

    top('turtleneck', 'Turtleneck', 'deco', 17, [
      '............kaaa', // 17 high neck
      '............kbbb',
      '.........kkkaaaa',
      '........kaaaaaaa',
      '.......kaakaaaaa',
      '.......kabkaaaaa',
      '.......kabkaaaaa',
      '.......kabkaaaaa',
      '.......kabkaaaaa',
      '.......kabkaaaaa',
      '.......kabkaaaaa',
      '.......kabkaaaaa',
      '.......kbbkaaaab',
      '..........kkkkkk'
    ])
  ];
})(window.CozyCafe);
