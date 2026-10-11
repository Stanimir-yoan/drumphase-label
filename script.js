'use strict';

// Demo release information. Replace the metadata and configure purchaseUrl for each real release.
const releases = [
  { id: 'drmph007-a', catalog: 'DRMPH007', artist: 'K-LIB', title: 'Iridescent Loop', date: '2026-02-14', cover: 'aural-iridescent-loop.webp', category: 'single' },
  { id: 'drmph009-a', catalog: 'DRMPH009', artist: 'NICK', title: 'White Phase', date: '2026-03-21', cover: 'noxen-white-phase.webp', category: 'experimental' },
  { id: 'drmph008-a', catalog: 'DRMPH008', artist: 'YORD', title: 'Spectral Drift', date: '2026-02-28', cover: 'kyron-spectral-drift.webp', category: 'single' },
  { id: 'drmph010-a', catalog: 'DRMPH010', artist: 'NICK', title: 'Chroma Flux', date: '2026-04-04', cover: 'vytor-chroma-flux.webp', category: 'experimental' },
  { id: 'drmph015', catalog: 'DRMPH015', artist: 'YORD', title: 'Solar Circuit', date: '2026-05-16', cover: 'orion-solar-circuit.webp', category: 'single' },
  { id: 'drmph012', catalog: 'DRMPH012', artist: 'K-LIB', title: 'Pixel Decay', date: '2026-04-25', cover: 'kora-pixel-decay.webp', category: 'experimental' },
  { id: 'drmph011', catalog: 'DRMPH011', artist: 'NICK', title: 'Mercury Shape', date: '2026-04-18', cover: 'vexa-mercury-shape.webp', category: 'experimental' },
  { id: 'drmph014', catalog: 'DRMPH014', artist: 'K-LIB', title: 'Ion Thread', date: '2026-05-09', cover: 'lyra-ion-thread.webp', category: 'single' },
];
const uniqueReleases = [...new Map(releases.map(item => [item.catalog, item])).values()];
const state = { filter: 'all', sort: 'curated' };
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const grid = $('#releaseGrid');
const count = $('#releaseCount');
const empty = $('#emptyState');
const toolbar = $('.toolbar');
const menu = $('#releaseMenu');
const dialog = $('#releaseDialog');
const player = $('#audioPlayer');
const playButton = $('#mainPlayButton');
const seek = $('#seekBar');
let activeMenuRelease = null;
let activeDialogRelease = null;
let lastMenuTrigger = null;
let toastTimer;

// Edit release artist, title, date and catalog once in the `releases` list above.
// Every cover caption, footer and metadata label is generated from this HTML template.
function coverPath(item) { return `assets/artwork/${item.cover}`; }
function esc(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function releaseNumber(item) { return item.catalog.replace(/\D/g, '').slice(-3); }
function coverMarkup(item, variant = 'card') {
  return `<div class="cover-design cover-design--${variant}" aria-label="${esc(item.artist)} — ${esc(item.title)} cover">
    <img class="cover-design__art" src="${coverPath(item)}" alt="" aria-hidden="true" loading="${variant === 'featured' ? 'eager' : 'lazy'}" width="960" height="960">
    <div class="cover-design__type">
      <strong class="cover-design__artist">${esc(item.artist)}</strong>
      <span class="cover-design__title">${esc(item.title)}</span>
      <span class="cover-design__mix">ORIGINAL MIX</span>
    </div>
    <div class="cover-design__footer">
      <span class="cover-design__label"><img src="assets/branding/drumphase-mark.png" alt="" aria-hidden="true"><span>DRUMPHASE</span></span>
      <span class="cover-design__release"><span class="cover-design__release-data"><span><small>RELEASE DATE</small><b>${longDate(item.date)}</b></span><span><small>RELEASE NO.</small><b>${releaseNumber(item)}</b></span></span><span class="cover-design__catalog">${esc(item.catalog)}</span></span>
    </div>
  </div>`;
}
function longDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}
function shortTime(value) {
  const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
function toast(text) {
  const element = $('#toast');
  clearTimeout(toastTimer);
  element.textContent = text;
  element.classList.add('is-visible');
  toastTimer = setTimeout(() => element.classList.remove('is-visible'), 2600);
}
function cardMarkup(item) {
  return `<div class="release-item">
    <img class="vinyl-record" src="assets/decoration/vinyl-img.png" alt="" aria-hidden="true" draggable="false" loading="lazy" width="835" height="835">
    <article class="release-card" data-id="${item.id}">
    <button class="release-image-button" type="button" data-open="${item.id}" aria-label="View ${item.artist} — ${item.title}">
      ${coverMarkup(item)}
    </button>
    <div class="release-card-info">
      <h2>${item.artist}</h2>
      <p class="song-name">${item.title.toUpperCase()}</p>
      <div class="release-meta"><span>${item.catalog}</span><span class="meta-line"></span><span>${longDate(item.date)}</span></div>
      <button class="card-more" type="button" data-menu="${item.id}" aria-label="More options for ${item.artist} — ${item.title}" aria-haspopup="menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
      </button>
    </div>
    </article>
  </div>`;
}
function filteredItems() {
  let items = [...releases];
  if (state.filter === 'singles') items = items.filter(item => item.category === 'single');
  if (state.filter === 'experimental') items = items.filter(item => item.category === 'experimental');
  if (state.filter === 'latest') items = items.sort((a,b) => b.date.localeCompare(a.date)).slice(0,4);
  if (state.sort === 'newest') items.sort((a,b) => b.date.localeCompare(a.date));
  if (state.sort === 'oldest') items.sort((a,b) => a.date.localeCompare(b.date));
  if (state.sort === 'artist') items.sort((a,b) => a.artist.localeCompare(b.artist));
  return items;
}
function render() {
  hideReleaseMenu();
  const items = filteredItems();
  grid.innerHTML = items.map(cardMarkup).join('');
  count.textContent = `${items.length} ${items.length === 1 ? 'RELEASE' : 'RELEASES'}`;
  empty.hidden = items.length > 0;
}
function hideReleaseMenu() {
  menu.hidden = true;
  if (lastMenuTrigger) lastMenuTrigger.setAttribute('aria-expanded', 'false');
  activeMenuRelease = null;
  lastMenuTrigger = null;
}
function showReleaseMenu(button, item) {
  if (!menu.hidden && activeMenuRelease?.id === item.id) { hideReleaseMenu(); return; }
  hideReleaseMenu();
  activeMenuRelease = item;
  lastMenuTrigger = button;
  button.setAttribute('aria-expanded', 'true');
  const rect = button.getBoundingClientRect();
  menu.hidden = false;
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  menu.style.left = `${Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width))}px`;
  menu.style.top = `${Math.max(8, Math.min(window.innerHeight - height - 8, rect.bottom + 5))}px`;
  menu.querySelector('button')?.focus();
}
function openDetails(item) {
  hideReleaseMenu();
  activeDialogRelease = item;
  $('#dialogCover').innerHTML = coverMarkup(item, 'dialog');
  $('#dialogArtist').textContent = item.artist;
  $('#dialogTitle').textContent = item.title.toUpperCase();
  $('#dialogCatalog').textContent = item.catalog;
  $('#dialogDate').textContent = longDate(item.date);
  dialog.showModal();
}
async function copyLink(item) {
  const link = `${location.href.split('#')[0]}#release=${encodeURIComponent(item.catalog)}`;
  try {
    await navigator.clipboard.writeText(link);
    toast('Release link copied');
  } catch {
    window.prompt('Copy release link:', link);
  }
}
function playDemo() {
  // The uploaded MP3 is used as a common demo track for the release previews.
  if (player.paused) {
    player.play().then(() => {
      playButton.classList.add('is-playing');
      playButton.setAttribute('aria-label', 'Pause demo track');
    }).catch(() => toast('Audio is not available in this browser'));
  } else {
    player.pause();
  }
}
function goToFeatured(item) {
  if (dialog.open) dialog.close();
  if (item.catalog !== 'DRMPH007') {
    toast('Playing the shared demo track');
  }
  playDemo();
}

// UI listeners: only Releases is enabled in the top navigation.
$$('.filter-pill').forEach(button => button.addEventListener('click', () => {
  state.filter = button.dataset.filter;
  $$('.filter-pill').forEach(b => { const active = b === button; b.classList.toggle('is-selected', active); b.setAttribute('aria-pressed', String(active)); });
  render();
}));
$('#sortSelect').addEventListener('change', event => { state.sort = event.target.value; render(); });
$('#clearFilters').addEventListener('click', () => {
  state.filter = 'all';
  $$('.filter-pill').forEach(b => { const active = b.dataset.filter === 'all'; b.classList.toggle('is-selected', active); b.setAttribute('aria-pressed', String(active)); });
  render();
});
grid.addEventListener('click', event => {
  const cardButton = event.target.closest('[data-open]');
  const menuButton = event.target.closest('[data-menu]');
  if (cardButton) {
    const item = releases.find(r => r.id === cardButton.dataset.open);
    if (item) openDetails(item);
  } else if (menuButton) {
    const item = releases.find(r => r.id === menuButton.dataset.menu);
    if (item) showReleaseMenu(menuButton, item);
  }
});
menu.addEventListener('click', event => {
  const action = event.target.closest('[data-release-action]')?.dataset.releaseAction;
  const item = activeMenuRelease;
  if (!item) return;
  hideReleaseMenu();
  if (action === 'details') openDetails(item);
  if (action === 'play') goToFeatured(item);
  if (action === 'copy') copyLink(item);
});
$('#featuredCoverButton').addEventListener('click', () => openDetails(uniqueReleases[0]));
$('#playerMore').addEventListener('click', () => openDetails(uniqueReleases[0]));
$('#dialogClose').addEventListener('click', () => dialog.close());
$('#dialogPlay').addEventListener('click', () => {
  if (activeDialogRelease) goToFeatured(activeDialogRelease);
});
$('#dialogPurchase').addEventListener('click', () => {
  if (!activeDialogRelease) return;
  if (activeDialogRelease.purchaseUrl) {
    window.open(activeDialogRelease.purchaseUrl, '_blank', 'noopener,noreferrer');
  } else {
    toast('Purchase link coming soon');
  }
});
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.addEventListener('click', event => {
  if (!event.target.closest('#releaseMenu') && !event.target.closest('[data-menu]')) hideReleaseMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') hideReleaseMenu();
});
window.addEventListener('resize', hideReleaseMenu);

// Real HTML5 audio controls, fed by the user-uploaded demo track.
playButton.addEventListener('click', playDemo);
player.addEventListener('loadedmetadata', () => $('#duration').textContent = shortTime(player.duration));
player.addEventListener('timeupdate', () => {
  $('#currentTime').textContent = shortTime(player.currentTime);
  const progress = player.duration ? player.currentTime / player.duration * 100 : 0;
  seek.value = String(progress);
  seek.style.setProperty('--seek-progress', `${progress}%`);
});
seek.addEventListener('input', event => {
  const fraction = Number(event.target.value) / 100;
  if (player.duration) player.currentTime = player.duration * fraction;
  seek.style.setProperty('--seek-progress', `${event.target.value}%`);
});
function resetPlayIcon() { playButton.classList.remove('is-playing'); playButton.setAttribute('aria-label', 'Play demo track'); }
player.addEventListener('pause', resetPlayIcon);
player.addEventListener('ended', resetPlayIcon);

// Build the featured artwork, heading, mix, release date, and hero atmosphere
// from the very same data record that generates the release grid and modal.
const featuredRelease = uniqueReleases[0];
$('#featuredCoverButton').innerHTML = coverMarkup(featuredRelease, 'featured');
$('#featuredCoverButton').setAttribute('aria-label', `View ${featuredRelease.artist} — ${featuredRelease.title}`);
$('#feature-heading').textContent = featuredRelease.artist;
$('.feature-title').textContent = featuredRelease.title.toUpperCase();
$('.feature-bottom [data-feature-catalog]').textContent = featuredRelease.catalog;
$('.feature-bottom [data-feature-date]').textContent = longDate(featuredRelease.date);
$('.feature').style.setProperty('--feature-art', `url("${coverPath(featuredRelease)}")`);

// Support direct links to catalog entries without exposing unfinished sections.
const route = decodeURIComponent(window.location.hash.slice(1));
if (route.startsWith('release=')) {
  const selected = uniqueReleases.find(item => item.catalog === route.split('=')[1]);
  if (selected) setTimeout(() => openDetails(selected), 80);
}
render();
