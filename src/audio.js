// Add or remove button rules here without changing the interaction code.
const buttonSounds = [
  { selector: '[data-background-reveal]:not([aria-pressed="true"])', file: 'sfx-01.mp3', volume: 0.22 },
  { selector: '[data-game-food-toggle]', file: 'sfx-01.mp3', volume: 0.22 },
  { selector: '[data-outfit-id]', file: 'boing.mp3', volume: 0.22 },
  { selector: '[data-action-card]', file: 'boing.mp3', volume: 0.22 },
];

const soundRoot = './public/assets/audio/';
const effects = new Map();
const background = new Audio(`${soundRoot}background.mp3`);
background.loop = true;
background.volume = 0.14;
background.preload = 'auto';

function playEffect(file, volume) {
  let effect = effects.get(file);
  if (!effect) {
    effect = new Audio(`${soundRoot}${file}`);
    effect.preload = 'auto';
    effects.set(file, effect);
  }
  effect.volume = volume;
  effect.pause();
  effect.currentTime = 0;
  effect.play().catch(() => {});
}

export function playEatingSound() {
  playEffect('sfx-02.mp3', 0.32);
}

export function initAudio() {
  let started = false;
  const tryStart = () => {
    if (started) return;
    background.play().then(() => {
      started = true;
      document.removeEventListener('pointerdown', tryStart);
      document.removeEventListener('keydown', tryStart);
    }).catch(() => {});
  };

  document.addEventListener('pointerdown', tryStart);
  document.addEventListener('keydown', tryStart);
  tryStart();

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    for (const sound of buttonSounds) {
      const button = target.closest(sound.selector);
      if (button && !button.disabled) {
        playEffect(sound.file, sound.volume);
        break;
      }
    }
  }, { capture: true });
}
