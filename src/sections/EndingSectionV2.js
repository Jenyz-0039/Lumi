const ASSET_ROOT = './public/assets/module-11-ending';
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function renderEndingV2(section) {
  return `
    <section
      id="${section.id}"
      class="section section--ending-v2"
      data-section-id="${section.id}"
      data-state="static"
    >
      <div class="ending-v2__sticky">
        <div class="ending-v2__background" aria-hidden="true">
          <img
            class="ending-v2__background-image"
            src="${ASSET_ROOT}/background/lumi-dream-sky-home.png"
            alt=""
            decoding="async"
          >
        </div>
        <p class="ending-v2__description">露米坐在蓝色天空与花朵之间的云台上</p>
        <div class="ending-v2__mist" aria-hidden="true"></div>
        <div class="ending-v2__decor" aria-hidden="true">
          <span class="ending-v2__cloud ending-v2__cloud--one"></span>
          <span class="ending-v2__cloud ending-v2__cloud--two"></span>
          <span class="ending-v2__flower ending-v2__flower--one"><i></i></span>
          <span class="ending-v2__flower ending-v2__flower--two"><i></i></span>
          <span class="ending-v2__arc"></span>
        </div>
        <h2 class="ending-v2__thanks" aria-label="THANK YOU">
          <span class="ending-v2__line ending-v2__line--thank" aria-hidden="true">THANK</span>
          <span class="ending-v2__line ending-v2__line--you" aria-hidden="true">YOU</span>
        </h2>
        <button
          class="ending-v2__return"
          type="button"
          data-scroll-target="opening"
          aria-label="返回顶部"
        >
          <span class="ending-v2__return-arrow" aria-hidden="true">↑</span>
        </button>
      </div>
    </section>
  `;
}

export function initEndingV2() {
  const root = document.querySelector('[data-section-id="ending"].section--ending-v2');
  if (!root || root.dataset.initialized === 'true') return () => {};

  const stage = root.querySelector('.ending-v2__sticky');
  if (!stage) return () => {};

  root.dataset.initialized = 'true';
  root.dataset.state = 'ready';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let viewportHeight = window.innerHeight;
  let isNearViewport = false;
  let isDocumentVisible = !document.hidden;
  let frameId = 0;
  let cleaned = false;

  const setVariables = (progress) => {
    const thank = clamp((progress - 0.18) / 0.3);
    const you = clamp((progress - 0.42) / 0.3);
    const mist = clamp((progress - 0.16) / 0.46);
    const final = clamp((progress - 0.72) / 0.18);
    const returnControl = clamp((progress - 0.9) / 0.1);
    const thankBounce = Math.sin(Math.PI * thank);
    const youBounce = Math.sin(Math.PI * you);

    root.style.setProperty('--ending-v2-progress', progress.toFixed(4));
    root.style.setProperty('--ending-v2-thank', thank.toFixed(4));
    root.style.setProperty('--ending-v2-you', you.toFixed(4));
    root.style.setProperty('--ending-v2-mist', mist.toFixed(4));
    root.style.setProperty('--ending-v2-final', final.toFixed(4));
    root.style.setProperty('--ending-v2-return', returnControl.toFixed(4));
    root.style.setProperty('--ending-v2-thank-y', `${((1 - thank) * 0.8 - thankBounce * 0.07).toFixed(4)}em`);
    root.style.setProperty('--ending-v2-you-y', `${((1 - you) * 0.8 - youBounce * 0.07).toFixed(4)}em`);
    root.style.setProperty('--ending-v2-bg-scale', (1.015 - progress * 0.015).toFixed(4));
    root.style.setProperty('--ending-v2-cloud-shift', `${(progress * 24).toFixed(2)}px`);
    root.style.setProperty('--ending-v2-flower-tilt', `${(Math.sin(progress * Math.PI) * 2.4).toFixed(2)}deg`);
    root.dataset.returnVisible = String(returnControl > 0.5);
  };

  const update = () => {
    frameId = 0;
    if (!isNearViewport || !isDocumentVisible || reducedMotion.matches) return;
    const rect = root.getBoundingClientRect();
    const denominator = Math.max(1, root.offsetHeight - viewportHeight);
    setVariables(clamp(-rect.top / denominator));
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
    viewportHeight = window.innerHeight;
    requestUpdate();
  };

  const handleVisibilityChange = () => {
    isDocumentVisible = !document.hidden;
    if (isDocumentVisible) {
      handleResize();
    } else if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  const clearVariables = () => {
    [
      '--ending-v2-progress', '--ending-v2-thank', '--ending-v2-you',
      '--ending-v2-mist', '--ending-v2-final', '--ending-v2-return',
      '--ending-v2-thank-y', '--ending-v2-you-y', '--ending-v2-bg-scale',
      '--ending-v2-cloud-shift', '--ending-v2-flower-tilt',
    ].forEach((property) => root.style.removeProperty(property));
  };

  const handleMotionPreference = () => {
    if (reducedMotion.matches) clearVariables();
    else requestUpdate();
  };

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isNearViewport = entry.isIntersecting;
    root.dataset.active = String(isNearViewport);
    if (isNearViewport) requestUpdate();
    else if (frameId) {
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
  resizeObserver?.observe(stage);
  handleScroll();

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
    clearVariables();
    delete root.dataset.active;
    delete root.dataset.returnVisible;
    delete root.dataset.state;
    delete root.dataset.initialized;
  };
}
