import { sectionShell } from '../components/SectionShell.js';

const backgroundCards = [
  { className: 'background-card--peach', label: '从日常出发', copy: '在快节奏的日常里，我们常常被熟悉的生活轨迹包围，渐渐忽略了身边那些等待被发现的小小惊喜。', image: './public/assets/background/lumi-swing.png', alt: '露米在游乐园荡秋千', doodle: '✦' },
  { className: 'background-card--yellow', label: '一朵自由的云', copy: 'Lumi诞生于「可颂」对多元兴趣生活的探索。以自由变幻的云朵为设计灵感，用柔软圆润的轮廓传递包容与亲和，以纯净的白色和温柔的微笑，象征生活中无限延展的可能。', image: './public/assets/background/lumi-banana.png', alt: '露米在海边伸手摘香蕉', doodle: '♡' },
  { className: 'background-card--lilac', label: '收藏每一种喜欢', copy: '它不为热爱设限，也不为生活定义标准。它相信，生活的美好不必轰轰烈烈，一次手作的尝试、一场说走就走的出行、一份偶然发现的小众爱好，都值得被认真收藏。', image: './public/assets/background/lumi-roadtrip.png', alt: '露米从复古汽车的车窗看风景', doodle: '⌁' },
  { className: 'background-card--sky background-card--final', label: '露米的愿望', copy: '让兴趣自由发生，让生活拥有100种可能。', image: './public/assets/background/lumi-balloon.jpg', alt: '露米乘坐热气球飞过海岛', doodle: '✿' },
];

function renderCard(card, index) {
  return `
    <article class="background-card ${card.className}" data-background-card style="--card-index:${index}">
      <div class="background-card__image-wrap">
        <img class="background-card__image" src="${card.image}" alt="${card.alt}" />
        <span class="background-card__tape" aria-hidden="true"></span>
      </div>
      <div class="background-card__copy">
        <div class="background-card__meta"><span>${String(index + 1).padStart(2, '0')}</span><span>${card.label}</span></div>
        <p>${card.copy}</p>
      </div>
      <span class="background-card__doodle" aria-hidden="true">${card.doodle}</span>
      <svg class="background-card__scribble" viewBox="0 0 180 54" aria-hidden="true"><path d="M5 33 C35 5 54 51 84 25 C111 2 127 50 175 16" /></svg>
    </article>
  `;
}

export function renderBackground(section) {
  return sectionShell(section, `
    <div class="background-story" data-background-story>
      <div class="background-story__stage">
        <header class="background-story__header">
          <p class="background-story__eyebrow">02 / 背景介绍</p>
          <h2><span>Lumi露米——</span><span>让热爱不止一种形状</span></h2>
          <p class="background-story__hint" aria-hidden="true"><span></span>向下认识露米</p>
        </header>
        <div class="background-story__cards">${backgroundCards.map(renderCard).join('')}</div>
        <div class="background-story__counter" aria-hidden="true"><span data-background-current>01</span><i></i><span>04</span></div>
      </div>
    </div>
  `, 'section--background');
}

export function initBackgroundStack() {
  const story = document.querySelector('[data-background-story]');
  const section = story?.closest('[data-section-id="background"]');
  const cards = [...(story?.querySelectorAll('[data-background-card]') || [])];
  const current = story?.querySelector('[data-background-current]');
  if (!section || cards.length !== 4 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (value) => value * value * (3 - 2 * value);

  const render = () => {
    frame = 0;
    const rect = section.getBoundingClientRect();
    const range = Math.max(1, section.offsetHeight - window.innerHeight);
    const timeline = clamp(-rect.top / range) * 3.6;
    const incoming = cards.map((_, index) => index === 0 ? 1 : smoothstep(clamp((timeline - (index - 0.35)) / 0.7)));

    cards.forEach((card, index) => {
      const progress = incoming[index];
      const coverProgress = index < cards.length - 1 ? incoming[index + 1] : 0;
      card.style.setProperty('--card-y', `${((1 - progress) * 108).toFixed(3)}%`);
      card.style.setProperty('--card-scale', (1 - coverProgress * 0.035).toFixed(4));
      card.style.setProperty('--card-lift', `${(-coverProgress * 14).toFixed(2)}px`);
      card.style.setProperty('--card-dim', (1 - coverProgress * 0.18).toFixed(4));
    });

    const visibleIndex = incoming.reduce((latest, value, index) => value > 0.55 ? index : latest, 0);
    if (current) current.textContent = String(visibleIndex + 1).padStart(2, '0');
    if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
      document.body.dataset.activeSection = 'background';
      document.querySelectorAll('[data-nav-target]').forEach((item) => item.classList.toggle('is-active', item.dataset.navTarget === 'background'));
      const siteProgress = document.querySelector('[data-progress]');
      if (siteProgress) siteProgress.textContent = '02 / 11';
    }
  };

  const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  render();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', requestRender);
    window.removeEventListener('resize', requestRender);
  };
}
