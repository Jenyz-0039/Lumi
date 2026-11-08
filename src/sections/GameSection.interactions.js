import { playEatingSound } from '../audio.js';

const ASSET_ROOT = './public/assets/game';
const expressions = {
  default: `${ASSET_ROOT}/lumi-default.png`,
  ready: `${ASSET_ROOT}/lumi-ready.png`,
  chewing: `${ASSET_ROOT}/lumi-chewing.png`,
  patted: `${ASSET_ROOT}/lumi-patted.png`,
};

export function initGameInteraction() {
  const root = document.querySelector('[data-section-id="game"]');
  if (!root) return;

  const character = root.querySelector('[data-game-character]');
  const characterWrap = root.querySelector('[data-game-character-wrap]');
  const faceZone = root.querySelector('[data-game-face-zone]');
  const mouthZone = root.querySelector('[data-game-mouth-zone]');
  const patZone = root.querySelector('[data-game-pat-zone]');
  const cursor = root.querySelector('[data-game-cursor]');
  const toggle = root.querySelector('[data-game-food-toggle]');
  const tray = root.querySelector('[data-game-food-tray]');
  const status = root.querySelector('[data-game-status]');
  const foodButtons = [...root.querySelectorAll('[data-game-food]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let mode = 'idle';
  let expression = 'default';
  let restoreTimer = 0;
  let drag = null;

  const imageCache = Object.fromEntries(Object.entries(expressions).map(([name, src]) => {
    const image = new Image();
    image.src = src;
    return [name, image];
  }));

  const setStatus = (message) => { status.textContent = message; };
  const setExpression = (next) => {
    if (expression === next) return;
    expression = next;
    characterWrap.dataset.expression = next;
    const cached = imageCache[next];
    const apply = () => {
      if (expression === next) character.src = expressions[next];
    };
    if (cached.complete && cached.naturalWidth > 0) apply();
    else cached.addEventListener('load', apply, { once: true });
  };
  const pointIsInside = (x, y, element, padding = 0) => {
    const rect = element.getBoundingClientRect();
    return x >= rect.left - padding && x <= rect.right + padding && y >= rect.top - padding && y <= rect.bottom + padding;
  };
  const setPickerOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    tray.setAttribute('aria-hidden', String(!open));
    root.classList.toggle('is-food-open', open);
  };

  toggle.addEventListener('click', () => setPickerOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  root.addEventListener('pointerenter', () => root.classList.add('is-pointer-inside'));
  root.addEventListener('pointerleave', () => root.classList.remove('is-pointer-inside'));
  root.addEventListener('pointermove', (event) => {
    cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
    cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
  });

  const finishChewing = () => {
    window.clearTimeout(restoreTimer);
    restoreTimer = window.setTimeout(() => {
      mode = 'idle';
      root.classList.remove('is-chewing');
      setExpression('default');
      setStatus('露米还想再来一口');
    }, reduceMotion.matches ? 550 : 1450);
  };
  const startChewing = () => {
    mode = 'chewing';
    root.classList.add('is-chewing');
    setExpression('chewing');
    playEatingSound();
    setStatus('露米正在认真嚼嚼');
    finishChewing();
  };

  const removeDragListeners = () => {
    if (!drag) return;
    drag.source.removeEventListener('pointermove', moveFood);
    drag.source.removeEventListener('pointerup', releaseFood);
    drag.source.removeEventListener('pointercancel', cancelFood);
  };
  const cleanDrag = () => {
    removeDragListeners();
    drag?.ghost.remove();
    drag = null;
    root.classList.remove('is-dragging', 'is-food-near');
  };

  function moveFood(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.ghost.style.setProperty('--drag-x', `${drag.x}px`);
    drag.ghost.style.setProperty('--drag-y', `${drag.y}px`);
    const isNear = pointIsInside(drag.x, drag.y, faceZone, 24);
    root.classList.toggle('is-food-near', isNear);
    setExpression(isNear ? 'ready' : 'default');
    setStatus(isNear ? '放到嘴边，露米准备好啦' : '把点心拖到露米嘴边');
  }

  function releaseFood(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const successful = pointIsInside(event.clientX, event.clientY, mouthZone, 18);
    const currentDrag = drag;
    removeDragListeners();
    drag = null;
    root.classList.remove('is-dragging', 'is-food-near');

    if (!successful) {
      currentDrag.ghost.classList.add('is-cancelled');
      setExpression('default');
      setStatus('差一点，再试一次吧');
      window.setTimeout(() => currentDrag.ghost.remove(), 180);
      mode = 'idle';
      return;
    }

    mode = 'chewing';
    const mouth = mouthZone.getBoundingClientRect();
    currentDrag.ghost.classList.add('is-eaten');
    currentDrag.ghost.style.setProperty('--drag-x', `${mouth.left + mouth.width / 2}px`);
    currentDrag.ghost.style.setProperty('--drag-y', `${mouth.top + mouth.height / 2}px`);
    setStatus('啊呜——');
    window.setTimeout(() => {
      currentDrag.ghost.remove();
      startChewing();
    }, reduceMotion.matches ? 80 : 260);
  }

  function cancelFood(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    cleanDrag();
    mode = 'idle';
    setExpression('default');
    setStatus('露米在等你');
  }

  const beginFoodDrag = (event) => {
    if (mode === 'chewing' || mode === 'patting' || event.button > 0) return;
    event.preventDefault();
    const source = event.currentTarget;
    const image = source.querySelector('img');
    const ghost = image.cloneNode();
    ghost.className = 'game-food-drag';
    ghost.alt = '';
    document.body.append(ghost);
    source.setPointerCapture(event.pointerId);
    drag = { source, ghost, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    mode = 'dragging';
    root.classList.add('is-dragging');
    ghost.style.setProperty('--drag-x', `${event.clientX}px`);
    ghost.style.setProperty('--drag-y', `${event.clientY}px`);
    source.addEventListener('pointermove', moveFood);
    source.addEventListener('pointerup', releaseFood);
    source.addEventListener('pointercancel', cancelFood);
    setStatus('把点心拖到露米嘴边');
  };
  foodButtons.forEach((button) => button.addEventListener('pointerdown', beginFoodDrag));

  const endPat = () => {
    window.clearTimeout(restoreTimer);
    restoreTimer = window.setTimeout(() => {
      if (mode !== 'patting') return;
      mode = 'idle';
      root.classList.remove('is-patting');
      setExpression('default');
      setStatus('露米被摸得很开心');
    }, reduceMotion.matches ? 350 : 850);
  };
  patZone.addEventListener('pointerdown', (event) => {
    if (mode !== 'idle' || event.button > 0) return;
    event.preventDefault();
    mode = 'patting';
    root.classList.add('is-patting');
    setExpression('patted');
    setStatus('呼噜呼噜，好舒服');
    patZone.setPointerCapture(event.pointerId);
  });
  patZone.addEventListener('pointerup', endPat);
  patZone.addEventListener('pointercancel', endPat);
  patZone.addEventListener('lostpointercapture', endPat);
}
