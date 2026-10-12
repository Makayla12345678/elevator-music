(function (CC) {
  var BOUNCE_MS = 500;
  var THUMB_SCALE = 3;
  var STYLES = { streetwear: 'Streetwear', grunge: 'Cool', deco: 'Fancy' };

  // One entry per wardrobe tab. `items` are drawn options, `swatches` are colour choices.
  var TABS = [
    {
      id: 'skin',
      label: 'Skin',
      swatches: { key: 'skin', title: 'Skin tone', list: CC.palette.skin, chip: function (c) { return c.s; } }
    },
    {
      id: 'hair',
      label: 'Hair',
      items: { key: 'hair', title: 'Style', list: CC.sprites.hair, crop: { x: 4, y: 0, w: 24, h: 26 } },
      swatches: { key: 'hairColor', title: 'Colour', list: CC.palette.hair, chip: function (c) { return c.a; } }
    },
    clothingTab('top', 'Top', { x: 4, y: 15, w: 24, h: 24 }),
    clothingTab('bottom', 'Bottom', { x: 4, y: 24, w: 24, h: 24 }),
    clothingTab('shoes', 'Shoes', { x: 6, y: 36, w: 20, h: 12 })
  ];

  function clothingTab(slot, label, crop) {
    return {
      id: slot,
      label: label,
      items: { key: slot, title: 'Style', list: CC.sprites[slot], crop: crop },
      swatches: { key: slot + 'Color', title: 'Colour', list: CC.palette.cloth, chip: function (c) { return c.a; } }
    };
  }

  var stage = document.getElementById('stage');
  var tabsEl = document.getElementById('tabs');
  var panelEl = document.getElementById('panel');
  var activeTab = TABS[0];
  var composed = CC.renderer.compose(CC.state.look);
  var bob = false;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function drawStage() {
    CC.renderer.draw(stage, composed, { bob: bob });
  }

  function group(title) {
    var wrap = el('div', 'group');
    wrap.appendChild(el('h2', 'group__title', title));
    return wrap;
  }

  function itemButton(spec, item) {
    var button = el('button', 'item');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(CC.state.look[spec.key] === item.id));

    // Thumbnail: the current character wearing this option.
    var look = Object.assign({}, CC.state.look);
    look[spec.key] = item.id;
    var thumb = el('canvas', 'item__thumb');
    thumb.width = spec.crop.w;
    thumb.height = spec.crop.h;
    thumb.style.width = spec.crop.w * THUMB_SCALE + 'px';
    thumb.style.height = spec.crop.h * THUMB_SCALE + 'px';
    CC.renderer.draw(thumb, CC.renderer.compose(look), { crop: spec.crop });

    button.appendChild(thumb);
    button.appendChild(el('span', 'item__name', item.name));
    button.addEventListener('click', function () { CC.sound.click(); CC.state.set(spec.key, item.id); });
    return button;
  }

  function itemGrid(spec, list) {
    var grid = el('div', 'items');
    list.forEach(function (item) { grid.appendChild(itemButton(spec, item)); });
    return grid;
  }

  // Clothing carries a `style` and is shown one style per group; hair has none.
  function renderItems(spec) {
    var out = [];
    if (!spec.list[0].style) {
      var wrap = group(spec.title);
      wrap.appendChild(itemGrid(spec, spec.list));
      return [wrap];
    }
    Object.keys(STYLES).forEach(function (style) {
      var list = spec.list.filter(function (item) { return item.style === style; });
      if (!list.length) return;
      var wrap = group(STYLES[style]);
      wrap.appendChild(itemGrid(spec, list));
      out.push(wrap);
    });
    return out;
  }

  function renderSwatches(spec) {
    var wrap = group(spec.title);
    var row = el('div', 'swatches');
    spec.list.forEach(function (color) {
      var button = el('button', 'swatch');
      button.type = 'button';
      button.style.setProperty('--chip', spec.chip(color));
      button.title = color.name;
      button.setAttribute('aria-label', color.name);
      button.setAttribute('aria-pressed', String(CC.state.look[spec.key] === color.id));
      button.addEventListener('click', function () { CC.sound.click(); CC.state.set(spec.key, color.id); });
      row.appendChild(button);
    });
    wrap.appendChild(row);
    return wrap;
  }

  function renderPanel() {
    panelEl.textContent = '';
    if (activeTab.id === 'bottom' && CC.renderer.wearingDress(CC.state.look)) {
      panelEl.appendChild(el('p', 'panel__note', 'Your dress covers these. Pick a different top to wear a bottom.'));
    }
    if (activeTab.items) renderItems(activeTab.items).forEach(function (node) { panelEl.appendChild(node); });
    if (activeTab.swatches) panelEl.appendChild(renderSwatches(activeTab.swatches));
  }

  function renderTabs() {
    tabsEl.textContent = '';
    TABS.forEach(function (tab) {
      var button = el('button', 'tab', tab.label);
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(tab === activeTab));
      button.addEventListener('click', function () {
        CC.sound.click();
        activeTab = tab;
        renderTabs();
        renderPanel();
      });
      tabsEl.appendChild(button);
    });
  }

  CC.state.onChange(function (look) {
    composed = CC.renderer.compose(look);
    drawStage();
    renderPanel();
  });

  setInterval(function () {
    bob = !bob;
    drawStage();
  }, BOUNCE_MS);

  document.getElementById('enter').addEventListener('click', function () {
    CC.city.start();
  });

  // Once you have reached the cafe, later visits can skip the walk.
  var skip = document.getElementById('skip');
  skip.addEventListener('click', function () { CC.city.start({ cafe: true }); });
  CC.showSkip = function () { skip.hidden = !CC.city.reachedCafe(); };

  // Lofi plays while you dress up. Browsers only allow sound after a click or
  // key press, so it starts on your first one, and comes back when you return here.
  var creatorEl = document.querySelector('.creator');
  function startMusic() { CC.sound.unlock(); CC.sound.music(true); }
  creatorEl.addEventListener('pointerdown', startMusic, { once: true });
  creatorEl.addEventListener('keydown', startMusic, { once: true });
  CC.creatorShown = function () { CC.sound.music(true); };

  renderTabs();
  renderPanel();
  drawStage();
})(window.CozyCafe);
