import { sections } from './data/sections.js';
import { createSiteStore } from './state/store.js';
import { renderSideNav } from './components/SideNav.js';
import { renderOpening } from './sections/OpeningSection.js';
import { initBackgroundStack, renderBackground } from './sections/BackgroundSection.js';
import { renderCharacter } from './sections/CharacterSection.js';
import { initVideoFrames, renderVideo } from './sections/VideoSection.js';
import { renderExpressions } from './sections/ExpressionsSection.js';
import { renderActions } from './sections/ActionsSection.js';
import { initOutfits, renderOutfits } from './sections/OutfitsSection.js';
import { initScenes, renderScenes } from './sections/ScenesSection.js';
import { renderGame } from './sections/GameSection.js';
import { initGameInteraction } from './sections/GameSection.interactions.js';
import { renderEnding } from './sections/EndingSection.js';

const renderers = {
  opening: renderOpening,
  background: renderBackground,
  character: renderCharacter,
  video: renderVideo,
  expressions: renderExpressions,
  actions: renderActions,
  outfits: renderOutfits,
  scenes: renderScenes,
  game: renderGame,
  ending: renderEnding,
};

const store = createSiteStore();
const app = document.querySelector('#app');

app.innerHTML = `
  <header class="site-header">
    <div class="site-brand">可颂 / IP interactive</div>
    <div class="site-progress" data-progress>01 / 11</div>
  </header>
  ${renderSideNav(sections)}
  <main>
    ${sections.map((section) => renderers[section.type](section)).join('')}
  </main>
`;

const sectionElements = [...document.querySelectorAll('[data-section-id]')];
const navItems = [...document.querySelectorAll('[data-nav-target]')];
const progress = document.querySelector('[data-progress]');

// Opening timeline: autoplay the atmosphere, then hand the second half to scroll.
const openingSection = document.querySelector('[data-section-id="opening"]');
const openingStage = openingSection?.querySelector('[data-opening-stage]');
const openingCloud = openingSection?.querySelector('[data-opening-cloud]');
const openingProgress = openingSection?.querySelector('[data-opening-progress]');
const openingStickers = [...(openingSection?.querySelectorAll('[data-opening-sticker]') || [])];

function initOpeningTimeline() {
  if (!openingSection || !openingStage || !openingCloud || !openingProgress) return;
  const openingTuning = {
    cloudStartY: 105,
    cloudEndY: -65,
    waveCompleteAt: 0.72,
    characterRevealStart: 0.48,
    characterRevealEnd: 0.82,
    copyRevealAt: 0.76,
  };
  const progressMarks = [0, 8, 16, 24, 33, 47, 61, 74, 86, 100];
  const autoplayDuration = 5600;
  const startedAt = performance.now();
  let ready = false;
  let rafId = 0;

  document.body.classList.add('opening-lock');

  const setCloudProgress = (value) => {
    const rawProgress = Math.min(1, Math.max(0, value));
    const waveProgress = Math.min(1, rawProgress / openingTuning.waveCompleteAt);
    const cloudY = openingTuning.cloudStartY + (openingTuning.cloudEndY - openingTuning.cloudStartY) * waveProgress;
    const characterProgress = Math.min(1, Math.max(0, (rawProgress - openingTuning.characterRevealStart) / (openingTuning.characterRevealEnd - openingTuning.characterRevealStart)));
    const characterEase = characterProgress * characterProgress * (3 - 2 * characterProgress);
    const revealLine = 112 - characterEase * 126;
    openingCloud.style.transform = `translateY(${cloudY}%)`;
    openingSection.style.setProperty('--opening-progress', rawProgress.toFixed(4));
    openingSection.style.setProperty('--lumi-reveal-line', `${revealLine.toFixed(2)}%`);
    openingSection.style.setProperty('--lumi-reveal-opacity', characterEase.toFixed(4));
    openingSection.style.setProperty('--lumi-rise', `${((1 - characterEase) * 28).toFixed(2)}px`);
    openingSection.classList.toggle('is-character-visible', characterProgress > 0);
    openingSection.classList.toggle('is-copy-visible', rawProgress >= openingTuning.copyRevealAt);
  };

  const autoplay = (now) => {
    const elapsed = Math.min(autoplayDuration, now - startedAt);
    const ratio = elapsed / autoplayDuration;
    openingStickers.forEach((sticker) => {
      sticker.classList.toggle('is-launched', elapsed >= Number(sticker.dataset.sprayAt || 0));
    });
    const mark = progressMarks[Math.min(progressMarks.length - 1, Math.floor(ratio * progressMarks.length))];
    openingProgress.textContent = `${ratio >= 1 ? 100 : mark}%`;
    if (ratio < 1) {
      rafId = requestAnimationFrame(autoplay);
      return;
    }
    ready = true;
    openingSection.classList.add('is-ready');
    document.body.classList.remove('opening-lock');
    updateOpeningFromScroll();
  };

  const updateOpeningFromScroll = () => {
    if (!ready) return;
    const rect = openingSection.getBoundingClientRect();
    const range = Math.max(1, openingSection.offsetHeight - window.innerHeight);
    const localScroll = Math.min(range, Math.max(0, -rect.top));
    setCloudProgress(localScroll / range);
  };

  window.addEventListener('scroll', updateOpeningFromScroll, { passive: true });
  window.addEventListener('resize', updateOpeningFromScroll, { passive: true });
  rafId = requestAnimationFrame(autoplay);
  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', updateOpeningFromScroll);
    window.removeEventListener('resize', updateOpeningFromScroll);
  };
}

initOpeningTimeline();
initBackgroundStack();
initVideoFrames();
initScenes();
initGameInteraction();
initOutfits();

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const target = sections.find((section) => section.id === id);
  if (target) {
    store.setState({ activeSection: id });
    navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.navTarget === id));
    progress.textContent = `${target.index} / ${sections.length}`;
  }
}

navItems.forEach((item) => item.addEventListener('click', () => scrollToSection(item.dataset.navTarget)));
document.querySelectorAll('[data-scroll-target]').forEach((button) => button.addEventListener('click', () => scrollToSection(button.dataset.scrollTarget)));

const observer = new IntersectionObserver((entries) => {
  entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
    const id = entry.target.dataset.sectionId;
    const current = sections.find((section) => section.id === id);
    store.setState({ activeSection: id });
    navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.navTarget === id));
    if (current) progress.textContent = `${current.index} / ${sections.length}`;
  });
}, { threshold: 0.45 });
sectionElements.forEach((section) => observer.observe(section));

document.querySelector('[data-character-action]')?.addEventListener('click', () => {
  store.setState({ characterExpression: 'after-click' });
});

document.querySelectorAll('[data-expression-id]').forEach((button) => button.addEventListener('click', () => {
  store.setState({ selectedExpression: button.dataset.expressionId });
}));

document.querySelectorAll('[data-outfit-id]').forEach((button) => button.addEventListener('click', () => {
  store.setState({ selectedOutfit: button.dataset.outfitId });
}));

document.querySelectorAll('[data-game-action]').forEach((button) => button.addEventListener('click', () => {
  store.setState({ gameInteraction: button.dataset.gameAction });
}));

store.subscribe((state) => {
  document.body.dataset.activeSection = state.activeSection;
  document.body.dataset.characterExpression = state.characterExpression;
});
