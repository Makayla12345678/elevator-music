(function (CC) {
  // Slots: k outline, a base, b shadow, c highlight
  function hair(id, name, y, rows) {
    return { id: id, name: name, poses: { front: CC.sprite({ y: y, mirror: true, rows: rows }) } };
  }

  CC.sprites.hair = [
    hair('buzz', 'Buzz', 3, [
      '..........kkkkkk',
      '........kkaaaaaa',
      '.......kaaaaaaaa',
      '.......kaaaaaaaa',
      '.......kaabbbbbb',
      '.......kb.......',
      '.......kb.......'
    ]),

    hair('crop', 'Crop', 2, [
      '.........kkkkkkk',
      '.......kkaaacaaa',
      '......kaaaccaaaa',
      '......kaaaaaaaaa',
      '......kaaaaaaaaa',
      '......kaaaaaaaab',
      '......kaabaabbab',
      '......kab.......',
      '......kab.......',
      '.......kb.......'
    ]),

    hair('curtains', 'Curtains', 2, [
      '.........kkkkkkk',
      '.......kkaaaaaab',
      '......kaaacaaaab',
      '.....kaaacaaaab.',
      '.....kaaaaaaab..',
      '.....kaaaaaab...',
      '.....kaaaaab....',
      '.....kaaaab.....',
      '.....kaaab......',
      '.....kaab.......',
      '.....kaab.......',
      '......kab.......',
      '......kkb.......'
    ]),

    hair('bob', 'Bob', 2, [
      '.........kkkkkkk',
      '.......kkaaaaaaa',
      '......kaaaacccaa',
      '.....kaaaaaaaaaa',
      '.....kaaaaaaaaaa',
      '.....kaaaaaaaaaa',
      '.....kaaaaaaaaaa',
      '.....kaabbbbbbbb',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaaab......',
      '......kkkk......'
    ]),

    hair('long', 'Long', 2, [
      '.........kkkkkkk',
      '.......kkaaaaaab',
      '......kaaaaaaaab',
      '.....kaaacaaaaab',
      '.....kaaacaaaab.',
      '.....kaaaaaab...',
      '.....kaaaaab....',
      '.....kaaaab.....',
      '.....kaaab......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaab.......',
      '.....kaaab......',
      '.....kaaab......',
      '.....kaaab......',
      '.....kaaab......',
      '.....kaabb......',
      '.....kaab.......',
      '......kab.......',
      '......kkk.......'
    ]),

    hair('curls', 'Curls', 1, [
      '..........kk.kkk',
      '........kkaakaaa',
      '......kkaaaaaaca',
      '.....kaaaacaaaaa',
      '.....kaaaaaaaaaa',
      '....kaaaaaaaaaaa',
      '....kaaaaaaaaaaa',
      '....kaaabaabaaba',
      '....kaab.bab.ab.',
      '....kaab..b...b.',
      '.....kab........',
      '....kaab........',
      '....kaab........',
      '.....kaab.......',
      '....kaaab.......',
      '....kabab.......',
      '.....kkab.......',
      '......kkk.......'
    ]),

    hair('coils', 'Coils', 0, [
      '.........kkkkkkk',
      '.......kkaacaaca',
      '.....kkaacaaaaaa',
      '....kaacaaaacaaa',
      '...kaaaaacaaaaac',
      '...kacaaaaaacaaa',
      '..kaaaaacaaaaaaa',
      '..kaaacaaaabaaba',
      '..kaaaaaabb.bb.b',
      '..kacaaab.......',
      '..kaaaaab.......',
      '...kaacab.......',
      '...kaaab........',
      '....kaab........',
      '....kkab........',
      '.....kkk........'
    ]),

    hair('mohawk', 'Mohawk', 0, [
      '.............k.k',
      '............kaka',
      '............kaca',
      '............kaaa',
      '..........kkkaca',
      '........kkbbkaaa',
      '.......kbbbbkaaa',
      '.......kbbb.kaaa',
      '.......kb....kbb',
      '.......kb.......'
    ])
  ];
})(window.CozyCafe);
