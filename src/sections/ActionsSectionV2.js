const ASSET_ROOT = './public/assets/module-07-actions/images';

const ACTIONS = [
  { key: 'rubbing-eye', file: 'action-rubbing-eye.png', alt: '露米揉眼睛' },
  { key: 'cheering', file: 'action-cheering.png', alt: '露米开心举手' },
  { key: 'running', file: 'action-running.png', alt: '露米奔跑' },
  { key: 'waving', file: 'action-waving.png', alt: '露米挥手' },
  { key: 'proud', file: 'action-proud.png', alt: '露米叉腰得意' },
];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function renderActionsV2(section) {
  const cards = ACTIONS.map((action, index) => `
    <button type="button" aria-label="${action.alt}"
      class="actions-v2__card actions-v2__card--${action.key}"
      data-action-card="${action.key}"
      data-action-index="${index}"
    >
      <span class="actions-v2__frame" aria-hidden="true"></span>
      <span class="actions-v2__mat">
        <img
          class="actions-v2__image"
          src="${ASSET_ROOT}/${action.file}"
          alt="${action.alt}"
          decoding="async"
        >
      </span>
      <span class="actions-v2__pin" aria-hidden="true"></span>
    </button>
  `).join('');

  return `
    <section
      id="${section.id}"
      class="section section--actions-v2"
      data-section-id="${section.id}"
      data-state="static"
    >
      <div class="actions-v2__sticky">
        <div class="actions-v2__decor" aria-hidden="true">
          <span class="actions-v2__cloud actions-v2__cloud--one"></span>
          <span class="actions-v2__cloud actions-v2__cloud--two"></span>
          <span class="actions-v2__path actions-v2__path--one"></span>
          <span class="actions-v2__path actions-v2__path--two"></span>
          <span class="actions-v2__spark actions-v2__spark--one"></span>
          <span class="actions-v2__spark actions-v2__spark--two"></span>
        </div>
        <div class="actions-v2__viewport">
          <div class="actions-v2__track">
            ${cards}
          </div>
        </div>
      </div>
    </section>
  `;
}

export function initActionsV2() {
  const root = document.querySelector('[data-section-id="actions"].section--actions-v2');
  if (!root || root.dataset.initialized === 'true') return () => {};

  const stage = root.querySelector('.actions-v2__sticky');
  const viewport = root.querySelector('.actions-v2__viewport');
  const track = root.querySelector('.actions-v2__track');
  const cards = Array.from(root.querySelectorAll('.actions-v2__card'));
  if (!stage || !viewport || !track || cards.length !== ACTIONS.length) return () => {};

  root.dataset.initialized = 'true';
  root.dataset.state = 'ready';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 0.2;
  const triggers = [-duration, 0.1, 0.34, 0.58, 0.8];
  let isNearViewport = false;
  let isDocumentVisible = !document.hidden;
  let frameId = 0;
  let maxTravel = 0;
  let viewportHeight = window.innerHeight;
  let cardCenters = [];
  let cleaned = false;

  const measure = () => {
    viewportHeight = window.innerHeight;
    maxTravel = Math.max(0, track.scrollWidth - viewport.clientWidth);
    cardCenters = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
    root.style.setProperty('--actions-v2-max-travel', `${maxTravel}px`);
  };

  const resetInlineState = () => {
    root.style.removeProperty('--actions-v2-progress');
    root.style.removeProperty('--actions-v2-max-travel');
    track.style.removeProperty('transform');
    cards.forEach((card) => {
      card.removeAttribute('data-active');
      card.style.removeProperty('--actions-v2-card-y');
      card.style.removeProperty('--actions-v2-card-scale');
      card.style.removeProperty('--actions-v2-card-opacity');
      card.style.removeProperty('--actions-v2-card-extra-rotate');
      card.style.removeProperty('--actions-v2-character-y');
      card.style.removeProperty('--actions-v2-character-rotate');
      card.style.removeProperty('--actions-v2-character-scale');
    });
  };

  const update = () => {
    frameId = 0;
    if (!isNearViewport || !isDocumentVisible || reducedMotion.matches) return;

    const rect = root.getBoundingClientRect();
    const denominator = Math.max(1, root.offsetHeight - viewportHeight);
    const progress = clamp(-rect.top / denominator);
    const easedProgress = progress * progress * (3 - 2 * progress);
    const translateX = -maxTravel * easedProgress;
    const stageCenter = viewport.clientWidth / 2;

    root.style.setProperty('--actions-v2-progress', progress.toFixed(4));
    track.style.transform = `translate3d(${translateX.toFixed(2)}px, 0, 0)`;

    let activeIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const local = clamp((progress - triggers[index]) / duration);
      const bounce = Math.sin(Math.PI * local);
      const y = (1 - local) * 12 - bounce * 4;
      const scale = 0.9 + 0.1 * local + bounce * 0.025;
      // Cards enter from outside the clipped viewport. Keeping the card
      // opaque prevents the transparent white character from washing into
      // the blue mat while the existing bounce/scale motion still plays.
      const opacity = 1;
      const extraRotate = (1 - local) * (index % 2 === 0 ? -4 : 4);
      const characterPulse = Math.sin(Math.PI * local);
      let characterY = 0;
      let characterRotate = 0;
      let characterScale = 1;

      switch (ACTIONS[index].key) {
        case 'rubbing-eye':
          characterRotate = -1.8 * characterPulse;
          break;
        case 'cheering':
          characterY = -8 * characterPulse;
          break;
        case 'running':
          characterY = -4 * characterPulse;
          characterRotate = 1.8 * characterPulse;
          break;
        case 'waving':
          characterRotate = 1.5 * characterPulse;
          break;
        case 'proud':
          characterY = -3 * characterPulse;
          characterScale = 1 + 0.02 * characterPulse;
          break;
      }

      card.style.setProperty('--actions-v2-card-y', `${y.toFixed(3)}svh`);
      card.style.setProperty('--actions-v2-card-scale', scale.toFixed(4));
      card.style.setProperty('--actions-v2-card-opacity', opacity.toFixed(4));
      card.style.setProperty('--actions-v2-card-extra-rotate', `${extraRotate.toFixed(3)}deg`);
      card.style.setProperty('--actions-v2-character-y', `${characterY.toFixed(2)}px`);
      card.style.setProperty('--actions-v2-character-rotate', `${characterRotate.toFixed(3)}deg`);
      card.style.setProperty('--actions-v2-character-scale', characterScale.toFixed(4));

      const distance = Math.abs(cardCenters[index] + translateX - stageCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        activeIndex = index;
      }
    });

    cards.forEach((card, index) => {
      if (index === activeIndex) card.dataset.active = 'true';
      else card.removeAttribute('data-active');
    });
  };

  const requestUpdate = () => {
    if (!frameId && isNearViewport && isDocumentVisible && !reducedMotion.matches) {
      frameId = requestAnimationFrame(update);
    }
  };

  const handleScroll = () => {
    const rect = root.getBoundingClientRect();
    isNearViewport = rect.bottom > -viewportHeight && rect.top < viewportHeight * 2;
    root.dataset.active = String(isNearViewport);
    requestUpdate();
  };

  const handleResize = () => {
    measure();
    requestUpdate();
  };

  const handleVisibilityChange = () => {
    isDocumentVisible = !document.hidden;
    if (isDocumentVisible) {
      measure();
      requestUpdate();
    } else if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  const handleMotionPreference = () => {
    if (reducedMotion.matches) resetInlineState();
    else {
      measure();
      requestUpdate();
    }
  };

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isNearViewport = entry.isIntersecting;
    root.dataset.active = String(isNearViewport);
    if (isNearViewport) {
      measure();
      requestUpdate();
    } else if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }, { rootMargin: '80% 0px', threshold: 0 });

  const resizeObserver = 'ResizeObserver' in window
    ? new ResizeObserver(handleResize)
    : null;

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);
  reducedMotion.addEventListener('change', handleMotionPreference);
  intersectionObserver.observe(root);
  resizeObserver?.observe(viewport);
  resizeObserver?.observe(track);
  measure();

  return () => {
    if (cleaned) return;
    cleaned = true;
    if (frameId) cancelAnimationFrame(frameId);
    intersectionObserver.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    reducedMotion.removeEventListener('change', handleMotionPreference);
    resetInlineState();
    delete root.dataset.active;
    delete root.dataset.state;
    delete root.dataset.initialized;
  };
}
