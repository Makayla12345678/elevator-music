(function (CC) {
  // Slots: k outline, s skin, d skin shadow, w eye white, e eye, m mouth,
  //        u undershirt, v shorts
  CC.sprites.body = {
    id: 'body',
    poses: {
      front: CC.sprite({
        y: 4,
        mirror: true,
        rows: [
          '..........kkkkkk', // 4  head
          '........kkssssss',
          '.......kssssssss',
          '.......kssssssss',
          '.......kssssssss',
          '.......kssssssss',
          '.......kssssssss',
          '.......ksswessss', // 11 eyes
          '.......ksswessss',
          '.......kssssssss',
          '.......ksssssssm', // 14 mouth
          '........ksssssss',
          '.........kksssss',
          '...........kkddd',
          '............kdss', // 18 neck
          '.........kkkksss', // 19 shoulders
          '........kssuusss',
          '.......ksskuuuuu', // 21 arms + torso
          '.......ksskuuuuu',
          '.......ksskuuuuu',
          '.......ksskuuuuu',
          '.......ksskuuuuu',
          '.......ksskuuuuu',
          '.......ksskvvvvv', // 27 hips
          '.......ksskvvvvv',
          '.......ksskvvvvv',
          '.......kddkvvvvv', // 30 hands
          '........kkkvvvvv',
          '..........kvvvvv',
          '..........kvvvvk',
          '..........kssssk', // 34 legs
          '..........kssssk',
          '..........kssssk',
          '..........kssssk',
          '..........kssssk',
          '..........kssssk',
          '..........kssssk',
          '..........kssssk',
          '..........kssssk',
          '..........kssssk',
          '..........kssssk', // 44 feet (stay planted during the bounce)
          '.........ksssssk',
          '.........kkkkkkk'
        ]
      })
    }
  };
})(window.CozyCafe);
