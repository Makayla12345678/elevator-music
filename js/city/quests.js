// Everything written in the city lives here: who you meet, what they say, and
// what each answer says about your taste. Edit the words freely; the game code
// in game.js only reads this file.
(function (CC) {
  CC.city = CC.city || {};

  // The cafe's floors. Choices score one of these keys.
  CC.city.genres = {
    jazz:   'jazz',
    pop:    'pop',
    rock:   'indie',
    hiphop: 'R&B',
    rap:    'rap'
  };

  // x is the position along the street. Looks use the same options as the wardrobe.
  CC.city.npcs = {
    busker: {
      name: 'Sal', x: 282, idle: 'I could play without a pick. I\'d rather keep my fingernails.',
      look: { skin: 'sand', hair: 'curtains', hairColor: 'walnut', top: 'striped-knit', topColor: 'denim', bottom: 'high-waist-trousers', bottomColor: 'ink', shoes: 'oxfords', shoesColor: 'ink' }
    },
    vendor: {
      name: 'Ines', x: 590, idle: 'Tonight\'s paper. Same as this morning\'s, but later.',
      look: { skin: 'sand', hair: 'buzz', hairColor: 'ash', top: 'flannel', topColor: 'olive', bottom: 'baggy-jeans', bottomColor: 'denim', shoes: 'combat-boots', shoesColor: 'ink' }
    },
    shopkeeper: {
      name: 'Mags', x: 960, idle: 'We\'re closed. Come back when we\'re also closed.',
      look: { skin: 'umber', hair: 'mohawk', hairColor: 'violet', top: 'band-tee', topColor: 'ink', bottom: 'ripped-jeans', bottomColor: 'ink', shoes: 'combat-boots', shoesColor: 'oxblood' }
    },
    dj: {
      name: 'Vesper', x: 1500, idle: 'You\'re listening to the only radio station still awake.',
      look: { skin: 'espresso', hair: 'coils', hairColor: 'ink', top: 'hoodie', topColor: 'plum', bottom: 'joggers', bottomColor: 'ink', shoes: 'high-tops', shoesColor: 'bone' }
    },
    cook: {
      name: 'Bo', x: 1790, idle: 'Kitchen\'s open. The pie is gone. There is always coffee.',
      look: { skin: 'bronze', hair: 'crop', hairColor: 'walnut', top: 'big-tee', topColor: 'bone', bottom: 'cargos', bottomColor: 'slate', shoes: 'sneakers', shoesColor: 'ink' }
    },
    worker: {
      name: 'Pike', x: 1135, idle: 'Road\'s closed. Burst pipe. Take the subway under it, the stairs are right there.',
      look: { skin: 'honey', hair: 'crop', hairColor: 'copper', top: 'crewneck', topColor: 'mustard', bottom: 'cargos', bottomColor: 'ink', shoes: 'combat-boots', shoesColor: 'ink' }
    },
    attendant: {
      name: 'Odile', area: 'subway', x: 356, idle: 'The gate needs a ticket and the machine needs three coins. People drop coins all over this station.',
      look: { skin: 'porcelain', hair: 'bob', hairColor: 'ash', top: 'turtleneck', topColor: 'denim', bottom: 'pencil-skirt', bottomColor: 'ink', shoes: 't-straps', shoesColor: 'ink' }
    },
    doorman: {
      name: 'The Doorman', x: 2072, idle: 'Not yet. The night isn\'t finished with you.',
      look: { skin: 'honey', hair: 'bob', hairColor: 'copper', top: 'turtleneck', topColor: 'oxblood', bottom: 'high-waist-trousers', bottomColor: 'ink', shoes: 'oxfords', shoesColor: 'ink' }
    }
  };

  // ---------- The detour ----------
  // The street is closed between Record Row and the radio tower, so the way on
  // is down the subway stairs, through the ticket gate, and up the far side.

  // Positions along each area. The street art in scene.js is drawn from these.
  CC.city.map = {
    street: { stairsDown: 1085, roadworks: 1180, stairsUp: 1290 },
    subway: { stairsWest: 50, coins: [134, 270, 476], machine: 420, gate: 580, stairsEast: 850 }
  };

  CC.city.detour = {
    card: { time: '12:50 AM', place: 'The Underground' },
    goals: {
      coins: 'Find 3 coins for a subway ticket ({n} of 3)',
      buy: 'Buy a ticket at the machine',
      go: 'Go through the gate and up the far stairs'
    },
    lines: {
      coin: 'You found a coin. That makes {n} of 3.',
      machineShort: 'A ticket costs 3 coins. You have {n}.',
      machineBuy: 'Three coins in. One ticket out.',
      machineDone: 'You already have a ticket.',
      gateShut: 'The gate won\'t move without a ticket.'
    },
    hints: {
      down: 'go down to the subway',
      up: 'climb the stairs to the street',
      coin: 'pick up the coin',
      machine: 'use the ticket machine'
    }
  };

  // The night, in order. Each beat is one conversation with one person.
  //   card:    a stamped title card, shown once you have walked past `at`
  //   auto:    start talking as soon as the beat begins (no need to press Talk)
  //   lines:   what they say first
  //   game:    a challenge to beat before the conversation continues:
  //            'melody', 'records' or 'dial' (see minigames.js)
  //   choice:  a question whose answers each score a genre
  //   after:   what they say once you have answered
  //   carry:   what you are holding when the beat ends ('' for nothing)
  //   goal:    the reminder shown in the corner afterwards
  //   {guess} in a line is replaced by the genre you chose most.
  CC.city.opening = 'Talk to the busker under the lamp';

  CC.city.beats = [
    {
      card: { time: '11:42 PM', place: 'Lamplight Row', at: 0 },
      npc: 'busker',
      lines: [
        'Evening. You\'ve got the look of someone headed somewhere.',
        'I\'d play you a song, but my guitar picks are locked in the case and the key is missing.',
        'Ines at the newsstand borrowed it. Bring it back and I\'ll play whatever you like.'
      ],
      goal: 'Get the key from the newsstand'
    },
    {
      npc: 'vendor',
      lines: [
        'Sal\'s key? I\'ve been using it as a bookmark. Don\'t tell him.',
        'Here you go. Tell him I said sorry.'
      ],
      carry: 'Case key',
      goal: 'Bring the key back to Sal'
    },
    {
      npc: 'busker',
      lines: [
        'That\'s the one! You\'re a hero.',
        'Let\'s see if you have an ear for music. I\'ll play a tune, and you play it back.'
      ],
      game: 'melody',
      choice: {
        prompt: 'Not bad at all! So, what should I play for you?',
        options: [
          { text: 'Something slow and jazzy', genre: 'jazz' },
          { text: 'Something bouncy', genre: 'pop' },
          { text: 'Something loud, with guitars', genre: 'rock' },
          { text: 'Something smooth, with a groove', genre: 'hiphop' },
          { text: 'Something with fast rhymes', genre: 'rap' }
        ]
      },
      after: ['Good choice. Keep walking that way. The night gets louder.'],
      carry: '',
      goal: 'Keep walking right to Record Row'
    },
    {
      card: { time: '12:30 AM', place: 'Record Row', at: 820 },
      npc: 'shopkeeper',
      lines: [
        'We\'re closed. We\'ve been closed since nine. And yet, here I am.',
        'The radio station needs three records for tonight\'s show, and I\'ve broken my glasses.',
        'I\'ll tell you what each one looks like. You find it on the shelf.'
      ],
      game: 'records',
      choice: {
        prompt: 'That\'s all three! Keep one more as a thank you. Which do you take?',
        options: [
          { text: 'A jazz band in dim blue light', genre: 'jazz' },
          { text: 'A pop star in glitter and pink', genre: 'pop' },
          { text: 'An indie band in a messy garage', genre: 'rock' },
          { text: 'A singer under purple neon', genre: 'hiphop' },
          { text: 'A rapper on a city rooftop', genre: 'rap' }
        ]
      },
      after: ['Nice pick. Now carry the box to the radio tower. Vesper hates it when the radio goes quiet.'],
      carry: 'Box of records',
      goal: 'Carry the records to the radio tower'
    },
    {
      npc: 'dj',
      lines: ['Are those my records? You wonderful stranger.'],
      carry: '',
      goal: ''
    },
    {
      card: { time: '1:15 AM', place: 'Signal Tower', at: 0 },
      npc: 'dj',
      auto: true,
      lines: [
        'One more favour. Bo at the diner writes down song requests and never brings them over.',
        'Bring me tonight\'s request and you can choose the next song.'
      ],
      goal: 'Get the song request from the diner'
    },
    {
      npc: 'cook',
      lines: [
        'Song requests? Just one tonight. Somebody wants "anything but the news".',
        'Tell Vesper I said play it loud.'
      ],
      carry: 'Song request',
      goal: 'Take the request back to Vesper'
    },
    {
      npc: 'dj',
      lines: [
        '"Anything but the news." I can work with that.',
        'One problem. Our signal has drifted and nobody can hear us. Help me tune it back in.'
      ],
      game: 'dial',
      choice: {
        prompt: 'We\'re back on the air! What should we play for the whole city?',
        options: [
          { text: 'Live jazz from a tiny club', genre: 'jazz' },
          { text: 'The song from every summer', genre: 'pop' },
          { text: 'An indie song nobody else knows', genre: 'rock' },
          { text: 'A slow love song with a beat', genre: 'hiphop' },
          { text: 'A rap about this very street', genre: 'rap' }
        ]
      },
      after: ['This one is for everyone still awake. Now go, the cafe is just down the street.'],
      carry: '',
      goal: 'Keep walking right to the cafe'
    },
    {
      card: { time: '2:00 AM', place: 'Elevator Music', at: 1960 },
      npc: 'doorman',
      lines: [
        'Late, but not too late.',
        'Let me look at you. Hm. You look like a {guess} person.',
        'Go on in. Every floor is playing something.'
      ],
      goal: ''
    }
  ];
})(window.CozyCafe);
