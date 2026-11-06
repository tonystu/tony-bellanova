/*
 * Tony "No Receipts" Bellanova
 * Dependency-free, local-file-compatible interactions.
 * No API keys, analytics, trackers, accounts, or tracking. Music attempts playback with the browser's autoplay rules.
 */
(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const asset = path => window.TONY_ASSETS?.[path] || path;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => motion.matches ? 'instant' : 'smooth';
  const poses = Array.isArray(window.TONY_POSES) ? window.TONY_POSES : [];
  const categoryNames = {classic: 'THE CLASSICS', floorwork: 'QUESTIONABLE FLEXIBILITY', sightings: 'WITNESS STATEMENTS', wind: 'THE BLOWBACK'};
  const pad = value => String(value).padStart(2, '0');

  let toastTimer;
  function notify(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3400);
  }

  // Navigation, section progress, and a small pointer-driven title parallax.
  const nav = $('#main-nav');
  const menu = $('#menu-toggle');
  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('.main-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('pointerdown', event => {
    if (nav.classList.contains('open') && !event.target.closest('.site-header')) closeMenu();
  });

  const chapters = $$('.chapter');
  const rail = $$('.chapter-rail a');
  let progressFrame = null;
  function updateProgress() {
    progressFrame = null;
    const extent = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    $('.reading-progress span').style.width = `${Math.min(100, Math.max(0, window.scrollY / extent * 100))}%`;
    let current = chapters[0];
    const cutoff = window.scrollY + window.innerHeight * 0.38;
    for (const chapter of chapters) if (chapter.offsetTop <= cutoff) current = chapter;
    for (const link of rail) {
      const active = link.hash === `#${current.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  function requestProgress() {
    if (progressFrame === null) progressFrame = requestAnimationFrame(updateProgress);
  }
  window.addEventListener('scroll', requestProgress, {passive:true});
  window.addEventListener('resize', requestProgress, {passive:true});
  updateProgress();

  if ('IntersectionObserver' in window && !motion.matches) {
    document.documentElement.classList.add('js-motion');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:0.09, rootMargin:'0px 0px -15px 0px'});
    $$('.reveal').forEach(element => revealObserver.observe(element));
  }
  const hero = $('.hero');
  hero.addEventListener('pointermove', event => {
    if (motion.matches || event.pointerType !== 'mouse') return;
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', String(((event.clientX - rect.left) / rect.width - .5) * 2));
    hero.style.setProperty('--my', String(((event.clientY - rect.top) / rect.height - .5) * 2));
  }, {passive:true});
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--mx', '0');
    hero.style.setProperty('--my', '0');
  });

  // Native modal dialogs retain focus trapping and Escape-to-close behavior.
  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal !== 'function') {
      notify('This feature needs a current browser with dialog support.');
      return;
    }
    dialog.showModal();
    dialog.scrollTop = 0;
  }
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog)?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  $('#statement-open').addEventListener('click', () => openDialog('statement-dialog'));

  $('#paper-open').addEventListener('click', () => openDialog('newspaper-dialog'));
  $('#evidence-open').addEventListener('click', () => {
    $('#evidence-image').src = $('#sighting-image').src;
    $('#evidence-image').alt = $('#sighting-image').alt;
    openDialog('evidence-dialog');
  });
  $('#tape-open').addEventListener('click', () => {
    openDialog('tape-dialog');
    if (!motion.matches) $('#cctv-video').play().catch(() => {});
  });
  $('#tape-dialog').addEventListener('close', () => { $('#cctv-video').pause(); $('#cctv-video').currentTime=0; });
  let danceEnabled = !motion.matches;
  let danceVisible = false;
  function updateDance() {
    const tape=$('#original-tape');
    const play=danceEnabled && danceVisible && !document.hidden && !motion.matches;
    const src=asset(play ? tape.dataset.loop : tape.dataset.still);
    if (tape.src !== src) tape.src=src;
    $('#dance-toggle').textContent=danceEnabled ? 'PAUSE THE ORIGINAL TAPE' : 'PLAY THE ORIGINAL TAPE';
    $('#dance-toggle').setAttribute('aria-pressed', String(danceEnabled));
  }
  $('#dance-toggle').addEventListener('click', () => { danceEnabled=!danceEnabled; updateDance(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { danceVisible=entries[0].isIntersecting; updateDance(); },{threshold:.12}).observe($('#original-dance'));
  else { danceVisible=true; updateDance(); }
  // Four fictitious sightings with accessible arrow-key tab navigation.
  const sightings = [
  {
    "year": "1987",
    "place": "BISCAYNE BAY",
    "verdict": "CREDIBILITY: THE BIRD REMEMBERS.",
    "caption": "EVIDENCE FILE // BISCAYNE BAY DOSSIER",
    "label": "NOT MISSING.<br>NEGOTIATING WITH WILDLIFE.",
    "coordinates": "TB-1987 // LAST PING<br>LOCATION: BISCAYNE BAY",
    "image": "assets/sighting-1987.png",
    "alt": "Three polaroid photos serving as dubious evidence that Tony talked a pelican into a very bad, very one-sided deal.",
    "text": "Biscayne Bay, 1987. Tony offered a pelican forty percent of a fishing charter. The pelican would catch the fish, find the customers, and supply the boat. Tony would “handle the lunches.” Three Polaroids show the negotiations. In the third, the pelican has his sandwich.",
    "source": "SOURCE: THREE POLAROIDS. NO SIGNATURE FROM THE BIRD."
  },
  {
    "year": "1996",
    "place": "A MALL KIOSK",
    "verdict": "CREDIBILITY: GARY STILL HAS THE BOXES.",
    "caption": "EVIDENCE FILE // UNDERGLOW TELEVISION PITCH",
    "label": "NOT MISSING.<br>SELLING NEON LIKE ROMANCE.",
    "coordinates": "TB-1996 // LAST PING<br>LOCATION: SUN-AGED LIVING ROOM",
    "image": "assets/sighting-1996.png",
    "alt": "A TV-ad still on a wooden floor television showing Tony pitching neon underglow lights to a down-on-his-luck man in an 80s living room.",
    "text": "Late-night television, 1996. Tony promised Gary that neon underglow would transform his love life. Gary asked whether the kit came with a car. Tony said the important thing was that Gary had started asking questions. The ad ran once. Gary bought two.",
    "source": "SOURCE: A VHS TAPE LABELLED “DO NOT SHOW GARY”."
  },
  {
    "year": "2008",
    "place": "AN UNMARKED BOAT",
    "verdict": "CREDIBILITY: THE RENTAL DESK HAS A COPY.",
    "caption": "EVIDENCE FILE // MIAMI LIVING COVER STORY",
    "label": "NOT MISSING.<br>LIVING ABOVE THE WATERLINE.",
    "coordinates": "TB-2008 // LAST PING<br>LOCATION: A MINI YACHT CALLED LIQUID ASSET",
    "image": "assets/sighting-2008.png",
    "alt": "A flashy magazine spread showing Tony grinning on the back of a mini yacht called Liquid Asset, flanked by big-haired bikini models and an American flag.",
    "text": "A 2008 magazine caught Tony on the stern of Liquid Asset with two women and three glasses of champagne. He called it “our little weekend place.” At the other end of the dock, a rental clerk was calling it forty-five minutes late. The women knew. They wanted to finish their drinks.",
    "source": "SOURCE: A MAGAZINE TONY KEEPS IN EVERY ROOM."
  },
  {
    "year": "2017",
    "place": "A STRIP MALL",
    "verdict": "CREDIBILITY: REGRETTABLY ON VIDEO.",
    "caption": "EVIDENCE FILE // CCTV VENDING DISPUTE",
    "label": "NOT MISSING.<br>LOSING TO A VENDING MACHINE.",
    "coordinates": "TB-2017 // LAST PING<br>LOCATION: MIAMI STRIP MALL",
    "image": "assets/sighting-2017.png",
    "alt": "A grainy CCTV still of Tony rocking and kicking while yelling at a vending machine inside a Miami strip mall.",
    "text": "Miami, 2017. A vending machine kept Tony’s dollar. He shook it, kicked it, then leaned in and asked whether they could settle this like adults. The machine sold a ginger ale to the next customer. Tony demanded to know who she knew.",
    "source": "SOURCE: CAM 04. THE MANAGER WATCHES IT AT CHRISTMAS."
  }
];
  const sightingTabs = $$('[data-sighting]');
  function setSighting(index, focus = false) {
    const selected = sightings[index];
    if (!selected) return;
    $('#sighting-text').textContent = selected.text;
    $('#sighting-source').textContent = selected.source;
    $('.sighting-verdict').textContent = selected.verdict;
    $('#sighting-panel').setAttribute('aria-labelledby', `sighting-tab-${index}`);
    const image = $('#sighting-image');
    if (image) {
      image.src = asset(selected.image);
      image.alt = selected.alt;
    }
    const caption = $('#sighting-image-caption');
    if (caption) caption.textContent = selected.caption;
    const label = $('#sighting-scene-label');
    if (label) label.innerHTML = selected.label;
    const coords = $('#sighting-coordinates');
    if (coords) coords.innerHTML = selected.coordinates;
    sightingTabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    if (focus) sightingTabs[index].focus();
  }
  sightingTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setSighting(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % sightings.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + sightings.length) % sightings.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = sightings.length - 1;
      if (next !== undefined) { event.preventDefault(); setSighting(next, true); }
    });
  });

  setSighting(0);

  // Pose selection. Data stays separate so editing captions does not require application changes.
  let selectedId = 'finger-guns';
  let activeFilter = 'all';
  let filtered = [...poses];
  let selectionVersion = 0;
  const strip = $('#vault-thumbnails');
  $('#pose-position').setAttribute('aria-live', 'polite');
  $('#pose-position').setAttribute('aria-atomic', 'true');

  function makePoseButton(pose, archive = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = archive ? 'archive-pose' : 'pose-thumb';
    button.dataset.poseId = pose.id;
    button.setAttribute('aria-label', `${archive ? 'Examine' : 'Select'} ${pose.name}`);
    if (!archive) button.setAttribute('aria-pressed', String(pose.id === selectedId));
    const image = document.createElement('img');
    image.src = asset(pose.thumb);
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    const name = document.createElement('span');
    name.textContent = archive ? pose.name : pad(poses.findIndex(p => p.id === pose.id) + 1);
    button.append(image, name);
    if (archive) {
      const label = document.createElement('small');
      label.textContent = `EXHIBIT ${pad(poses.findIndex(p => p.id === pose.id) + 1)}`;
      button.append(label);
    }
    button.addEventListener('click', () => {
      if (archive) {
        setFilter('all', false);
        $('#archive-dialog').close();
      }
      selectPose(pose.id, true);
      if (archive) $('#vault-viewer').scrollIntoView({behavior:scrollBehavior(), block:'start'});
    });
    return button;
  }

  function renderThumbnails() {
    const fragment = document.createDocumentFragment();
    filtered.forEach(pose => fragment.append(makePoseButton(pose)));
    strip.replaceChildren(fragment);
    $('#pose-prev').disabled = filtered.length < 2;
    $('#pose-next').disabled = filtered.length < 2;
    $('#pose-shuffle').disabled = filtered.length < 2;
  }

  function selectPose(id, centerThumbnail = false) {
    const pose = poses.find(item => item.id === id);
    if (!pose) return;
    if (!filtered.some(item => item.id === id)) setFilter('all', false);
    selectedId = id;
    const version = ++selectionVersion;
    const image = $('#vault-image');
    image.classList.add('changing');
    image.onload = () => { if (version === selectionVersion) image.classList.remove('changing'); };
    image.onerror = () => {
      image.classList.remove('changing');
      notify('This exhibit could not load. Keep the assets folder beside index.html.');
    };
    image.src = asset(pose.src);
    image.alt = pose.alt;
    if (image.complete) image.classList.remove('changing');
    $('#pose-title').textContent = pose.name;
    $('#pose-description').textContent = pose.description;
    $('#pose-category').textContent = categoryNames[pose.category] || 'THE ARCHIVE';
    $('#pose-number').textContent = pad(poses.findIndex(item => item.id === id) + 1);
    $('#pose-position').textContent = `${pad(filtered.findIndex(item => item.id === id) + 1)} / ${pad(filtered.length)}`;
    const save = $('#pose-save');
    save.href = asset(pose.src);
    save.download = `Tony-Bellanova-${pose.id}.webp`;
    const thumbs = $$('.pose-thumb', strip);
    thumbs.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.poseId === id)));
    if (centerThumbnail) {
      const thumb = thumbs.find(button => button.dataset.poseId === id);
      if (thumb) {
        const thumbRect = thumb.getBoundingClientRect();
        const stripRect = strip.getBoundingClientRect();
        const target = strip.scrollLeft + thumbRect.left - stripRect.left - (strip.clientWidth - thumb.offsetWidth) / 2;
        strip.scrollTo({left:Math.max(0,target), behavior:scrollBehavior()});
      }
    }
  }

  function setFilter(filter, resetSelection = true) {
    activeFilter = filter;
    filtered = poses.filter(pose => filter === 'all' || pose.category === filter);
    if (!filtered.length) { activeFilter = 'all'; filtered = [...poses]; }
    $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
    renderThumbnails();
    if (resetSelection) selectPose(filtered.some(pose => pose.id === selectedId) ? selectedId : filtered[0].id);
  }
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  function movePose(direction) {
    if (!filtered.length) return;
    const current = filtered.findIndex(pose => pose.id === selectedId);
    selectPose(filtered[(current + direction + filtered.length) % filtered.length].id, true);
  }
  $('#pose-prev').addEventListener('click', () => movePose(-1));
  $('#pose-next').addEventListener('click', () => movePose(1));
  $('#pose-shuffle').addEventListener('click', () => {
    const choices = filtered.filter(pose => pose.id !== selectedId);
    if (choices.length) selectPose(choices[Math.floor(Math.random() * choices.length)].id, true);
  });
  $('#vault-viewer').addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); movePose(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); movePose(-1); }
  });
  $$('.pose-jump').forEach(button => button.addEventListener('click', () => {
    setFilter('all', false);
    selectPose(button.dataset.pose, true);
    $('#vault-viewer').scrollIntoView({behavior:scrollBehavior(), block:'start'});
  }));
  let archiveBuilt = false;
  $('#archive-open').addEventListener('click', () => {
    if (!archiveBuilt) {
      const fragment = document.createDocumentFragment();
      poses.forEach(pose => fragment.append(makePoseButton(pose, true)));
      $('#archive-grid').append(fragment);
      archiveBuilt = true;
    }
    openDialog('archive-dialog');
  });
  renderThumbnails();
  if (poses.length) selectPose(selectedId);

  // Existing procedural animation with a separate intensity-controlled CSS stage.
  let windRunning = false;
  const windImage = $('#wind-character');
  const windStage = $('#wind-stage');
  const windLevel = $('#wind-level');
  function updateWindLevel() {
    const level = Math.min(11, Math.max(1, Number(windLevel.value) || 7));
    windStage.style.setProperty('--wind-power', String(level));
    $('#wind-output').value = `${pad(level)} / 11`;
    windLevel.style.background = `linear-gradient(90deg,var(--pink) ${(level - 1) * 10}%,#483149 ${(level - 1) * 10}%)`;
    $$('.wind-stage-meter i').forEach((bar,index) => bar.classList.toggle('lit', index < level));
    if (windRunning) $('#wind-status').textContent = level === 11 ? 'FULL BELLANOVA' : 'CHARISMA ESCAPING';
  }
  function setWindRunning(running) {
    windRunning = running;
    windStage.classList.toggle('running', running);
    $('#wind-toggle').setAttribute('aria-pressed', String(running));
    $('#wind-button-label').textContent = running ? 'SPARE THE MULLET' : 'ENGAGE THE LEAF BLOWER';
    $('#wind-status').classList.toggle('active', running);
    $('#wind-status').textContent = running ? 'CHARISMA ESCAPING' : 'STANDBY';
    windImage.src = asset(running && !motion.matches ? windImage.dataset.loop : windImage.dataset.still);
    updateWindLevel();
  }
  windLevel.addEventListener('input', updateWindLevel);
  $('#wind-toggle').addEventListener('click', () => {
    setWindRunning(!windRunning);
    if (windRunning && motion.matches) notify('Reduced-motion mode: the intensity meter works; the character stays still.');
  });
  updateWindLevel();
  if ('IntersectionObserver' in window) {
    const windVisibility = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && windRunning) setWindRunning(false);
    }, {threshold:0});
    windVisibility.observe($('#comeback'));
  }
  motion.addEventListener?.('change', () => {
    document.documentElement.classList.toggle('js-motion', !motion.matches);
    if (motion.matches) $$('.reveal').forEach(element => element.classList.add('visible'));
    setWindRunning(windRunning);
    if (motion.matches) $('#original-tape').src = asset($('#original-tape').dataset.still);
  });

  // A deliberately unhelpful receipt, saved locally only when requested.
  $('#receipt-open').addEventListener('click', () => {
    $('#receipt-id').textContent = String(830000 + Math.floor(Math.random() * 10000));
    openDialog('receipt-dialog');
  });
  function downloadText(filename, text) {
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  $('#receipt-save').addEventListener('click', () => {
    const text = [
      'BELLANOVA OPPORTUNITIES', 'MIAMI, FL / PROBABLY', 'EST. 1983 / NEVER ITEMIZED', '',
      `REQUEST #${$('#receipt-id').textContent}`, '----------------------------------------',
      '1 BORROWED BLAZER ............. PRICELESS', '39 YEARS OF MYSTERY ....... ON THE HOUSE',
      'HAIR MAINTENANCE ............ CLASSIFIED', 'REASONABLE EXPLANATION ..... OUT OF STOCK',
      '----------------------------------------', 'TOTAL: TRUST ME.', '', 'REQUEST DENIED', '',
      'The nickname was not a suggestion.', 'Thank you for your misplaced trust.', '',
      'Tony "No Receipts" Bellanova', 'An entirely fictional character. This is a souvenir, not a financial document.'
    ].join('\n');
    downloadText('Tony-Bellanova-Your-Receipt-Was-Denied.txt', text);
    notify('One denial, successfully documented. Tony is furious.');
  });

  $('#rumor-report')?.addEventListener('click', () => notify('Tony sightings are fictional. No report is sent or stored.'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if(windRunning) setWindRunning(false); $('#cctv-video').pause(); }
    updateDance();
  });
  // Keep the original title design readable with offline fallback fonts.
  function fitOfflineTitle() {
    const title = document.querySelector('.hero-copy h1');
    if (!title) return;
    for (const line of title.children) line.style.fontSize = '';
    if (window.innerWidth > 700) return;
    const available = title.clientWidth - 8;
    for (const line of title.children) {
      const width = Math.max(line.scrollWidth, line.getBoundingClientRect().width);
      if (width > available) line.style.fontSize = (parseFloat(getComputedStyle(line).fontSize) * available / width) + 'px';
    }
  }
  requestAnimationFrame(fitOfflineTitle);
  document.fonts?.ready.then(fitOfflineTitle);
  window.addEventListener('resize', fitOfflineTitle, {passive:true});
})();
