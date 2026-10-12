// The cafe: its floors, the playlist on each one, and the people inside.
// To change a floor's music, paste a different Spotify playlist link into
// its `playlist` line. Floors with `open: false` show as "opening soon".
(function (CC) {
  CC.cafe = {};

  // Listed top floor first, matching the lit windows on the building outside.
  CC.cafe.floors = [
    {
      // Yours to decorate. Its playlist and furniture are chosen in the game and
      // remembered by the browser (see CC.cafe.custom below).
      id: 'yours', number: 6, name: 'Your Floor', color: '#6fd6e0', open: true,
      playlist: '', playing: 'Now playing on your floor',
      goal: 'Your floor. Use the paint cans to decorate.'
    },
    {
      id: 'jazz', number: 5, name: 'Jazz', color: '#e8a23c', open: true,
      playlist: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo',
      goal: 'The band is playing. The bar is open.'
    },
    {
      id: 'pop', number: 4, name: 'Pop', color: '#e879b0', open: true,
      playlist: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
      goal: 'The music is on. The dance floor is lit.'
    },
    {
      id: 'rock', number: 3, name: 'Indie', color: '#c8443f', open: true,
      playlist: 'https://open.spotify.com/playlist/37i9dQZF1EQqkOPvHGajmW',
      goal: 'The amps are on. The band is loud.'
    },
    {
      id: 'hiphop', number: 2, name: 'R&B', color: '#9a6be0', open: true,
      playlist: 'https://open.spotify.com/playlist/37i9dQZF1DX4SBhb3fqCJd',
      goal: 'The lights are low. The slow jam is on.'
    },
    {
      id: 'rap', number: 1, name: 'Rap', color: '#5fc48a', open: true,
      playlist: 'https://open.spotify.com/playlist/3rRR3uuNMbtnQBe6EOvHK1',
      goal: 'The beat is on. The cypher is open.'
    }
  ];

  CC.cafe.text = {
    enter: 'go inside the cafe',
    leave: 'step back outside',
    lift: 'call the elevator',
    sit: 'sit and listen',
    stand: 'stand up',
    goalStreet: 'Go inside the cafe',
    goalLobby: 'Take the elevator to a floor',
    streetName: 'Elevator Music',
    lobbyName: 'The lobby',
    liftTitle: 'Which floor?',
    liftPick: 'The doorman\'s pick',
    liftSoon: 'Opening soon',
    liftLobby: 'Lobby',
    liftStay: 'Stay here',
    decorate: 'decorate your floor',
    decorTitle: 'Decorate',
    decorPlaylist: 'Playlist',
    decorPaste: 'Paste a Spotify playlist link',
    decorSet: 'Set',
    decorDone: 'Done',
    decorLinked: 'Playlist set.',
    decorQuiet: 'No playlist. The room is quiet.',
    decorBadLink: 'That is not a Spotify playlist link.',
    playerNote: 'The music starts by itself. If it stays quiet, press play, then click the game again to keep walking.'
  };

  // Your floor. Each row of the decorate panel: `pick` chooses a piece and
  // `color` its colour, both naming a setting below. Colours are the wardrobe's
  // cloth colours.
  var SAVE_KEY = 'cozycafe.floor';
  var onOff = [{ id: 'on', name: 'On' }, { id: 'off', name: 'Off' }];
  var custom = CC.cafe.custom = {
    rows: [
      { title: 'Walls', color: 'wall' },
      { title: 'Floor', color: 'floor' },
      { title: 'Seat', pick: 'seat', color: 'seatColor', options: [{ id: 'armchair', name: 'Armchair' }, { id: 'sofa', name: 'Sofa' }, { id: 'beanbag', name: 'Beanbag' }] },
      { title: 'Rug', pick: 'rug', color: 'rugColor', options: onOff },
      { title: 'Lamp', pick: 'lamp', color: 'lampColor', options: [{ id: 'floor', name: 'Floor lamp' }, { id: 'string', name: 'String lights' }] },
      { title: 'Wall art', pick: 'art', color: 'artColor', options: [{ id: 'poster', name: 'Poster' }, { id: 'record', name: 'Record' }, { id: 'none', name: 'None' }] },
      { title: 'Plant', pick: 'plant', options: onOff }
    ],
    defaults: {
      playlist: '', wall: 'plum', floor: 'ink',
      seat: 'armchair', seatColor: 'oxblood', rug: 'on', rugColor: 'mustard',
      lamp: 'floor', lampColor: 'mustard', art: 'poster', artColor: 'denim', plant: 'on'
    },

    // A pasted link tidied into the form the music player reads, or '' if it is not a Spotify playlist.
    playlist: function (text) {
      var id = /spotify/i.test(text) && (String(text).match(/playlist[\/:]([A-Za-z0-9]+)/) || [])[1];
      return id ? 'https://open.spotify.com/playlist/' + id : '';
    },

    save: function () {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(custom.settings));
      } catch (error) { /* private browsing: the floor just won't be remembered */ }
    }
  };

  // Start from the defaults and keep only saved choices that are still on offer.
  custom.settings = (function () {
    var settings = Object.assign({}, custom.defaults);
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
    } catch (error) { /* nothing saved, or not readable */ }
    custom.rows.forEach(function (row) {
      if (row.pick && CC.find(row.options, saved[row.pick])) settings[row.pick] = saved[row.pick];
      if (row.color && CC.find(CC.palette.cloth, saved[row.color])) settings[row.color] = saved[row.color];
    });
    settings.playlist = custom.playlist(saved.playlist || '');
    return settings;
  })();
  CC.find(CC.cafe.floors, 'yours').playlist = custom.settings.playlist;

  // People inside. `menu` gives someone a list to order from.
  // `behind: true` stands them behind the counter or their instrument; `raise`
  // lifts them onto the stage; `plays` gives them an instrument: 'mic', 'bass',
  // 'piano', 'decks', 'keytar', 'guitar' or 'drums'.
  CC.cafe.npcs = {
    host: {
      name: 'Celeste', area: 'lobby', x: 112,
      idle: 'Hey, welcome in! The doorman told me you\'re into {guess}, so you\'re going to love it here. The elevator\'s just over there on your right.',
      look: { skin: 'bronze', hair: 'long', hairColor: 'ink', top: 'flapper-dress', topColor: 'mustard', bottom: 'pencil-skirt', bottomColor: 'ink', shoes: 't-straps', shoesColor: 'ink' }
    },
    bartender: {
      name: 'Remy', area: 'jazz', x: 238, behind: true, raise: 12,
      menu: {
        prompt: 'Hey, good to see you. What can I get you tonight?',
        options: [
          { text: 'A midnight espresso', carry: 'Midnight espresso', color: '#3b2416', hot: true },
          { text: 'A hot chocolate', carry: 'Hot chocolate', color: '#7a4a2b', hot: true },
          { text: 'A chai latte', carry: 'Chai latte', color: '#c39a66', hot: true },
          { text: 'A lavender lemonade', carry: 'Lavender lemonade', color: '#b9a0e0', hot: false }
        ],
        after: 'Nice, give me one second.',
        // After this line Remy pours the drink and you drink it. {drink} is what you ordered.
        serve: true,
        done: 'You finish your {drink}. Exactly what the night needed.'
      },
      look: { skin: 'sand', hair: 'crop', hairColor: 'ink', top: 'turtleneck', topColor: 'ink', bottom: 'high-waist-trousers', bottomColor: 'ink', shoes: 'oxfords', shoesColor: 'ink' }
    },
    singer: {
      name: 'Odessa', area: 'jazz', x: 408, raise: 8, behind: true, plays: 'mic',
      idle: 'Oh, hi! I\'m just catching my breath between songs. Is there anything you want to hear? Name it and I\'ll sing it for you.',
      look: { skin: 'espresso', hair: 'bob', hairColor: 'ink', top: 'slip-dress', topColor: 'oxblood', bottom: 'pencil-skirt', bottomColor: 'ink', shoes: 't-straps', shoesColor: 'bone' }
    },
    bassist: {
      name: 'Lou', area: 'jazz', x: 432, raise: 8, behind: true, plays: 'bass',
      idle: 'My fingers are killing me, honestly. It\'s worth it, though. Are you having a good night?',
      look: { skin: 'umber', hair: 'buzz', hairColor: 'ink', top: 'turtleneck', topColor: 'ink', bottom: 'high-waist-trousers', bottomColor: 'slate', shoes: 'oxfords', shoesColor: 'ink' }
    },
    pianist: {
      name: 'Art', area: 'jazz', x: 464, raise: 8, behind: true, plays: 'piano',
      idle: 'Hang on, hang on, this next bit is my favourite. Okay, I\'ll come and say hi after, I promise.',
      look: { skin: 'porcelain', hair: 'curtains', hairColor: 'ash', top: 'turtleneck', topColor: 'bone', bottom: 'pinstripe-slacks', bottomColor: 'ink', shoes: 'oxfords', shoesColor: 'ink' }
    },
    fountain: {
      name: 'Mimi', area: 'pop', x: 238, behind: true, raise: 12,
      menu: {
        prompt: 'Hi! Oh my gosh, I love your outfit. What can I get you?',
        options: [
          { text: 'A strawberry milkshake', carry: 'Strawberry milkshake', color: '#f3a6cc', hot: false },
          { text: 'A cherry cola', carry: 'Cherry cola', color: '#5a1a22', hot: false },
          { text: 'A bubble tea', carry: 'Bubble tea', color: '#c39a66', hot: false },
          { text: 'A pink lemonade', carry: 'Pink lemonade', color: '#f08aa0', hot: false }
        ],
        after: 'Ooh, good choice, that one\'s my favourite.',
        serve: true,
        done: 'You finish your {drink}. This song is stuck in your head now.'
      },
      look: { skin: 'honey', hair: 'bob', hairColor: 'oxblood', top: 'striped-knit', topColor: 'bone', bottom: 'plaid-skirt', bottomColor: 'plum', shoes: 'sneakers', shoesColor: 'bone' }
    },
    dancer: {
      name: 'Bea', area: 'pop', x: 346,
      idle: 'I love this song so much! Come and dance with me. This floor was made for it.',
      look: { skin: 'umber', hair: 'curls', hairColor: 'violet', top: 'big-tee', topColor: 'bone', bottom: 'baggy-shorts', bottomColor: 'denim', shoes: 'high-tops', shoesColor: 'bone' }
    },
    popstar: {
      name: 'Stella', area: 'pop', x: 410, raise: 8, behind: true, plays: 'mic',
      idle: 'Hi! Thanks for coming over. Are you having fun? I love a full room, and there are so many people here tonight.',
      look: { skin: 'sand', hair: 'long', hairColor: 'brass', top: 'slip-dress', topColor: 'plum', bottom: 'pencil-skirt', bottomColor: 'plum', shoes: 't-straps', shoesColor: 'bone' }
    },
    keys: {
      name: 'Kit', area: 'pop', x: 448, raise: 8, behind: true, plays: 'keytar',
      idle: 'Yeah, it\'s a keytar. My dad had one in the eighties. It\'s the coolest thing I own, honestly.',
      look: { skin: 'espresso', hair: 'mohawk', hairColor: 'absinthe', top: 'crewneck', topColor: 'bone', bottom: 'ripped-jeans', bottomColor: 'ink', shoes: 'combat-boots', shoesColor: 'ink' }
    },
    merch: {
      name: 'Wren', area: 'rock', x: 238, behind: true, raise: 12,
      menu: {
        prompt: 'Hey! Loud in here, right? I love it. What do you want to drink?',
        options: [
          { text: 'A root beer', carry: 'Root beer', color: '#4a2a18', hot: false },
          { text: 'A black coffee', carry: 'Black coffee', color: '#2a1a12', hot: true },
          { text: 'A cherry soda', carry: 'Cherry soda', color: '#c8443f', hot: false },
          { text: 'An orange fizz', carry: 'Orange fizz', color: '#e8862c', hot: false }
        ],
        after: 'Cool, coming right up.',
        serve: true,
        done: 'You finish your {drink}. Your ears are ringing a little.'
      },
      look: { skin: 'porcelain', hair: 'curtains', hairColor: 'copper', top: 'flannel', topColor: 'oxblood', bottom: 'ripped-jeans', bottomColor: 'ink', shoes: 'combat-boots', shoesColor: 'ink' }
    },
    fan: {
      name: 'Sage', area: 'rock', x: 350,
      idle: 'I\'ve seen this band four times now. Nobody at school has even heard of them. That\'s the best part.',
      look: { skin: 'bronze', hair: 'bob', hairColor: 'absinthe', top: 'band-tee', topColor: 'ink', bottom: 'plaid-skirt', bottomColor: 'oxblood', shoes: 'combat-boots', shoesColor: 'ink' }
    },
    frontman: {
      name: 'Rhett', area: 'rock', x: 408, raise: 8, behind: true, plays: 'mic',
      idle: 'Hi! Thanks for coming. We wrote that last one in my mum\'s garage. Was it loud? Good. It\'s meant to be loud.',
      look: { skin: 'honey', hair: 'long', hairColor: 'walnut', top: 'band-tee', topColor: 'bone', bottom: 'ripped-jeans', bottomColor: 'denim', shoes: 'sneakers', shoesColor: 'ink' }
    },
    guitarist: {
      name: 'Frankie', area: 'rock', x: 430, raise: 8, behind: true, plays: 'guitar',
      idle: 'I broke a string in the first song and played right through it. Nobody even noticed.',
      look: { skin: 'umber', hair: 'mohawk', hairColor: 'oxblood', top: 'flannel', topColor: 'olive', bottom: 'baggy-jeans', bottomColor: 'ink', shoes: 'high-tops', shoesColor: 'bone' }
    },
    drummer: {
      name: 'Pip', area: 'rock', x: 460, raise: 8, behind: true, plays: 'drums',
      idle: 'I can\'t hear you over the drums! It was something nice, I can tell, so thank you!',
      look: { skin: 'sand', hair: 'curls', hairColor: 'brass', top: 'big-tee', topColor: 'slate', bottom: 'baggy-shorts', bottomColor: 'ink', shoes: 'sneakers', shoesColor: 'bone' }
    },
    lounge: {
      name: 'Sol', area: 'hiphop', x: 238, behind: true, raise: 12,
      menu: {
        prompt: 'Hey, come on in. It\'s a slow one tonight. What can I make you?',
        options: [
          { text: 'A taro milk tea', carry: 'Taro milk tea', color: '#b9a0e0', hot: false },
          { text: 'A peach iced tea', carry: 'Peach iced tea', color: '#e8a23c', hot: false },
          { text: 'A vanilla cream soda', carry: 'Vanilla cream soda', color: '#e8dfcc', hot: false },
          { text: 'A honey ginger tea', carry: 'Honey ginger tea', color: '#c9993a', hot: true }
        ],
        after: 'Good pick. Take your time with it.',
        serve: true,
        done: 'You finish your {drink}. You could stay here all night.'
      },
      look: { skin: 'bronze', hair: 'coils', hairColor: 'violet', top: 'turtleneck', topColor: 'plum', bottom: 'high-waist-trousers', bottomColor: 'ink', shoes: 'oxfords', shoesColor: 'ink' }
    },
    slowjam: {
      name: 'Imani', area: 'hiphop', x: 340,
      idle: 'I only come up here for the slow songs. This booth is the best seat in the whole building, but don\'t tell anyone.',
      look: { skin: 'espresso', hair: 'long', hairColor: 'ink', top: 'striped-knit', topColor: 'mustard', bottom: 'baggy-jeans', bottomColor: 'denim', shoes: 'sneakers', shoesColor: 'bone' }
    },
    crooner: {
      name: 'Aaliyah', area: 'hiphop', x: 408, raise: 8, behind: true, plays: 'mic',
      idle: 'Hi! Did you like that last one? I wrote it about someone, and I\'d love for them to be here tonight.',
      look: { skin: 'umber', hair: 'curls', hairColor: 'walnut', top: 'slip-dress', topColor: 'plum', bottom: 'pencil-skirt', bottomColor: 'plum', shoes: 't-straps', shoesColor: 'bone' }
    },
    groove: {
      name: 'Marcus', area: 'hiphop', x: 432, raise: 8, behind: true, plays: 'bass',
      idle: 'I play the same four notes all night. They\'re really good notes, so why change them?',
      look: { skin: 'honey', hair: 'buzz', hairColor: 'ink', top: 'crewneck', topColor: 'bone', bottom: 'cargos', bottomColor: 'slate', shoes: 'high-tops', shoesColor: 'bone' }
    },
    selector: {
      name: 'Jay', area: 'hiphop', x: 464, raise: 8, behind: true, plays: 'decks',
      idle: 'Every record I play tonight is from my auntie\'s collection. She lends them to me because I never scratch them. They\'re in good hands.',
      look: { skin: 'sand', hair: 'crop', hairColor: 'copper', top: 'hoodie', topColor: 'slate', bottom: 'joggers', bottomColor: 'ink', shoes: 'sneakers', shoesColor: 'ink' }
    },
    counter: {
      name: 'Juno', area: 'rap', x: 238, behind: true, raise: 12,
      menu: {
        prompt: 'Hey, what\'s up? What do you feel like drinking?',
        options: [
          { text: 'A cold brew', carry: 'Cold brew', color: '#3b2416', hot: false },
          { text: 'An iced matcha', carry: 'Iced matcha', color: '#8fbf6a', hot: false },
          { text: 'A mango lassi', carry: 'Mango lassi', color: '#f0b84a', hot: false },
          { text: 'A ginger beer', carry: 'Ginger beer', color: '#d9c48a', hot: false }
        ],
        after: 'Got you. One sec.',
        serve: true,
        done: 'You finish your {drink}. The bass feels louder now.'
      },
      look: { skin: 'honey', hair: 'curls', hairColor: 'absinthe', top: 'jersey', topColor: 'bone', bottom: 'cargos', bottomColor: 'ink', shoes: 'sneakers', shoesColor: 'bone' }
    },
    regular: {
      name: 'Tariq', area: 'rap', x: 350,
      idle: 'I\'m doing the open mic later and I can\'t wait. Will you stick around and cheer for me?',
      look: { skin: 'umber', hair: 'crop', hairColor: 'ink', top: 'big-tee', topColor: 'mustard', bottom: 'baggy-jeans', bottomColor: 'denim', shoes: 'high-tops', shoesColor: 'bone' }
    },
    mc: {
      name: 'Nova', area: 'rap', x: 410, raise: 8, behind: true, plays: 'mic',
      idle: 'Hey, you good? Shout out a word and I\'ll rhyme it on the spot. Any word you like, go on.',
      look: { skin: 'espresso', hair: 'coils', hairColor: 'copper', top: 'hoodie', topColor: 'olive', bottom: 'joggers', bottomColor: 'ink', shoes: 'high-tops', shoesColor: 'ink' }
    },
    deejay: {
      name: 'Dex', area: 'rap', x: 446, raise: 8, behind: true, plays: 'decks',
      idle: 'One of these turntables is broken. I\'ve been mixing on one deck all night and nobody can tell.',
      look: { skin: 'bronze', hair: 'buzz', hairColor: 'ink', top: 'crewneck', topColor: 'slate', bottom: 'cargos', bottomColor: 'olive', shoes: 'sneakers', shoesColor: 'ink' }
    }
  };
})(window.CozyCafe);
