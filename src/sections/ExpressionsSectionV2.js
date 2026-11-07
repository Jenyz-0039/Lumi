const ASSET_ROOT = './public/assets/module-05-expressions/images';

const EXPRESSIONS = [
  { key: 'sleepy', label: '困倦', file: 'expression-sleepy.png' },
  { key: 'curious', label: '疑惑', file: 'expression-curious.png' },
  { key: 'excited', label: '兴奋', file: 'expression-excited.png' },
  { key: 'shy', label: '害羞思考', file: 'expression-shy.png' },
  { key: 'please', label: '合掌请求', file: 'expression-please.png' },
];

export function renderExpressionsV2(section) {
  const cards = EXPRESSIONS.map((expression, index) => `
    <button
      class="expressions-v2__card"
      type="button"
      data-expression="${expression.key}"
      data-card-index="${index}"
      aria-label="查看露米${expression.label}表情"
      aria-expanded="false"
    >
      <span class="expressions-v2__paper" aria-hidden="true">
        <span class="expressions-v2__tape"></span>
        <span class="expressions-v2__sticker expressions-v2__sticker--${expression.key}">
          <img
            class="expressions-v2__image"
            src="${ASSET_ROOT}/${expression.file}"
            alt=""
            decoding="async"
          >
        </span>
      </span>
    </button>
  `).join('');

  return `
    <section
      id="${section.id}"
      class="section section--expressions-v2"
      data-section-id="${section.id}"
      data-state="idle"
    >
      <div class="expressions-v2__stage">
        <span class="expressions-v2__cloud expressions-v2__cloud--one" aria-hidden="true"></span>
        <span class="expressions-v2__cloud expressions-v2__cloud--two" aria-hidden="true"></span>
        <span class="expressions-v2__doodle expressions-v2__doodle--stars-one" aria-hidden="true"></span>
        <span class="expressions-v2__doodle expressions-v2__doodle--stars-two" aria-hidden="true"></span>
        <span class="expressions-v2__doodle expressions-v2__doodle--spark" aria-hidden="true"></span>
        <span class="expressions-v2__doodle expressions-v2__doodle--dots" aria-hidden="true"></span>
        <div class="expressions-v2__gallery">
          ${cards}
        </div>
        <button class="expressions-v2__backdrop" type="button" aria-label="关闭表情明信片" tabindex="-1"></button>
      </div>
    </section>
  `;
}

export function initExpressionsV2() {
  const root = document.querySelector('[data-section-id="expressions"].section--expressions-v2');
  if (!root || root.dataset.initialized === 'true') return () => {};

  const gallery = root.querySelector('.expressions-v2__gallery');
  const backdrop = root.querySelector('.expressions-v2__backdrop');
  const cards = Array.from(root.querySelectorAll('.expressions-v2__card'));
  if (!gallery || !backdrop || cards.length === 0) return () => {};

  root.dataset.initialized = 'true';
  let activeCard = null;
  let pointerFrame = 0;
  let pendingTilt = null;
  let isVisible = true;
  let isDocumentVisible = !document.hidden;
  let cleaned = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setRunningState = () => {
    root.dataset.animation = isVisible && isDocumentVisible ? 'running' : 'paused';
  };

  const resetTilt = (card) => {
    if (!card) return;
    const paper = card.querySelector('.expressions-v2__paper');
    if (!paper) return;
    paper.style.removeProperty('--expressions-v2-tilt-x');
    paper.style.removeProperty('--expressions-v2-tilt-y');
  };

  const closeCard = ({ restoreFocus = false } = {}) => {
    if (!activeCard) return;
    const previous = activeCard;
    resetTilt(previous);
    previous.setAttribute('aria-expanded', 'false');
    previous.dataset.active = 'false';
    activeCard = null;
    root.dataset.state = 'idle';
    backdrop.tabIndex = -1;
    if (restoreFocus) previous.focus({ preventScroll: true });
  };

  const openCard = (card) => {
    if (activeCard === card) {
      closeCard({ restoreFocus: true });
      return;
    }
    if (activeCard) {
      resetTilt(activeCard);
      activeCard.setAttribute('aria-expanded', 'false');
      activeCard.dataset.active = 'false';
    }
    activeCard = card;
    activeCard.setAttribute('aria-expanded', 'true');
    activeCard.dataset.active = 'true';
    root.dataset.state = 'expanded';
    backdrop.tabIndex = 0;
  };

  const handleClick = (event) => {
    const card = event.target.closest('.expressions-v2__card');
    if (card && root.contains(card)) openCard(card);
  };

  const handleBackdropClick = () => closeCard({ restoreFocus: true });

  const handleKeydown = (event) => {
    if (event.key === 'Escape' && activeCard) {
      event.preventDefault();
      closeCard({ restoreFocus: true });
    }
  };

  const applyTilt = () => {
    pointerFrame = 0;
    if (!activeCard || !pendingTilt) return;
    const paper = activeCard.querySelector('.expressions-v2__paper');
    if (!paper) return;
    paper.style.setProperty('--expressions-v2-tilt-x', `${pendingTilt.x.toFixed(2)}deg`);
    paper.style.setProperty('--expressions-v2-tilt-y', `${pendingTilt.y.toFixed(2)}deg`);
  };

  const handlePointerMove = (event) => {
    if (!activeCard || event.pointerType === 'touch' || reducedMotion.matches) return;
    const rect = activeCard.getBoundingClientRect();
    const horizontal = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const vertical = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pendingTilt = { x: vertical * -5, y: horizontal * 5 };
    if (!pointerFrame) pointerFrame = requestAnimationFrame(applyTilt);
  };

  const handlePointerLeave = (event) => {
    const card = event.target.closest('.expressions-v2__card');
    if (card === activeCard) resetTilt(activeCard);
  };

  const handleVisibilityChange = () => {
    isDocumentVisible = !document.hidden;
    setRunningState();
  };

  const handleMotionPreference = () => {
    if (reducedMotion.matches) resetTilt(activeCard);
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        setRunningState();
      }, { threshold: 0.08 })
    : null;

  gallery.addEventListener('click', handleClick);
  gallery.addEventListener('pointermove', handlePointerMove, { passive: true });
  gallery.addEventListener('pointerleave', handlePointerLeave, true);
  backdrop.addEventListener('click', handleBackdropClick);
  root.addEventListener('keydown', handleKeydown);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  reducedMotion.addEventListener('change', handleMotionPreference);
  observer?.observe(root);
  setRunningState();

  return () => {
    if (cleaned) return;
    cleaned = true;
    gallery.removeEventListener('click', handleClick);
    gallery.removeEventListener('pointermove', handlePointerMove);
    gallery.removeEventListener('pointerleave', handlePointerLeave, true);
    backdrop.removeEventListener('click', handleBackdropClick);
    root.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    reducedMotion.removeEventListener('change', handleMotionPreference);
    observer?.disconnect();
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    closeCard();
    root.dataset.state = 'idle';
    delete root.dataset.animation;
    delete root.dataset.initialized;
  };
}
