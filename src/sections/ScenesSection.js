// Photographs and frames stay paired by their numbered source folder.
const cards = [
  { photo: 'photo-1.png', frame: 'frame-1.png', position: '48% 49%', zoom: 1, opening: '0.5% 10.1%, 96.8% 0.4%, 100% 93.8%, 4.2% 100%' },
  { photo: 'photo-2.jpg', frame: 'frame-2.png', position: '52% 50%', zoom: 1.01, opening: '0.7% 9.6%, 97% 0.4%, 100% 93.4%, 4.2% 100%' },
  { photo: 'photo-3.png', frame: 'frame-3.png', position: '50% 48%', zoom: 1, opening: '0.9% 9%, 97% 0.2%, 100% 93.5%, 4.5% 100%' },
  { photo: 'photo-4.png', frame: 'frame-4.png', position: '50% 51%', zoom: 1.005, opening: '0.6% 9.7%, 97% 0.4%, 100% 93.5%, 4.2% 100%' },
  { photo: 'photo-5.png', frame: 'frame-5.png', position: '51% 49%', zoom: 1.01, opening: '0.8% 9.9%, 96.8% 0.4%, 100% 93.3%, 4.3% 100%' },
];

export function renderScenes(section) {
  const asset = './public/assets/scenes/';
  return `<section id="${section.id}" class="section section--scenes" data-section-id="${section.id}" aria-label="${section.label}">
    <div class="scenes-stage">
      <img class="scenes-background" src="${asset}background-new.png" alt="" />
      <div class="scenes-cards" aria-label="五张相框图片">
        ${cards.map((card, index) => `<div class="scene-card" data-scene-card="${index}" style="--photo-position:${card.position}; --photo-zoom:${card.zoom}; --opening:${card.opening}; z-index:${index + 1}">
          <div class="scene-card__opening"><img class="scene-card__photo" src="${asset}${card.photo}" alt="场景图片 ${index + 1}" /></div>
          <img class="scene-card__frame" src="${asset}${card.frame}" alt="" />
        </div>`).join('')}
      </div>
    </div>
  </section>`;
}

export function initScenes() {
  const section = document.querySelector('[data-section-id="scenes"]');
  if (!section) return;
  const cards = [...section.querySelectorAll('[data-scene-card]')];
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const ease = (value) => 1 - Math.pow(1 - value, 3);
  let queued = false;

  function update() {
    queued = false;
    const rect = section.getBoundingClientRect();
    const distance = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / distance) * (cards.length - 1);
    cards.forEach((card, index) => {
      const entry = index === 0 ? 1 : ease(clamp((progress - (index - 1)) / 0.72));
      const exit = index === cards.length - 1 ? 0 : ease(clamp((progress - index) / 0.72));
      const x = (1 - entry) * 18 - exit * 9;
      const y = (1 - entry) * 112 - exit * 72;
      const rotation = (1 - entry) * 12 - exit * 9;
      const scale = 0.91 + entry * 0.09 - exit * 0.035;
      card.style.transform = `translate3d(calc(-50% + ${x}vw), calc(-50% + ${y}vh), 0) rotate(${rotation}deg) scale(${scale})`;
      card.style.visibility = entry === 0 || exit === 1 ? 'hidden' : 'visible';
    });
  }

  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}
