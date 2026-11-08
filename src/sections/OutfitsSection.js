import { outfits } from '../data/sections.js';
import { sectionIntro, sectionShell } from '../components/SectionShell.js';

const doodles = [
  [3, 13, 42, -25, 0], [31, 8, 54, 28, 1], [65, 9, 44, 145, 2], [91, 15, 50, 195, 0],
  [17, 43, 46, 55, 2], [48, 46, 59, -15, 1], [79, 43, 46, 120, 0],
  [4, 73, 54, -35, 1], [30, 86, 42, 75, 2], [65, 87, 53, 200, 0], [94, 72, 45, 150, 1],
  [33, 49, 38, 120, 0], [67, 49, 38, -55, 2], [49, 5, 36, 25, 1],
];
const paths = [
  'M4 20 C15 8 27 27 42 15 M33 8 Q39 12 42 15 Q38 20 33 22',
  'M3 22 Q14 2 26 17 Q34 28 47 12 M37 8 Q43 10 47 12 Q44 17 43 22',
  'M3 19 C12 7 19 30 28 19 S39 8 48 16 M38 9 Q44 12 48 16 Q44 20 39 22',
];
const defaultColors = ['#A7CEE8', '#E9B6C8', '#E9D285', '#B9D9C9', '#C9BDE6'];

export function renderOutfits(section) {
  return sectionShell(section, `
    <div class="outfits-intro">${sectionIntro(section)}</div>
    <div class="outfits-stage" data-outfits-stage>
      <div class="outfits-doodles" aria-hidden="true">${doodles.map(([x, y, width, angle, shape], index) => `
        <svg class="outfits-doodle" data-doodle style="--x:${x}%;--y:${y}%;--width:${width}px;--angle:${angle}deg;--ink:${defaultColors[index % defaultColors.length]};--delay:${(index * 37) % 181}ms" viewBox="0 0 52 34" fill="none"><path d="${paths[shape]}" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`).join('')}</div>
      <div class="outfits-grid" data-outfits-grid>${outfits.map((item, index) => `
        <button class="outfits-card" type="button" data-outfit-id="${item.id}" aria-label="查看露米的${item.label}穿搭" style="--card-color:${item.primary}">
          <span class="outfits-card__number">0${index + 1}</span>
          <img src="${item.asset}" alt="${item.label}服装" draggable="false" />
          <span class="outfits-card__label">${item.label}<span aria-hidden="true"> ↗</span></span>
        </button>`).join('')}</div>
      <div class="outfits-detail" data-outfits-detail hidden>
        <button class="outfits-back" type="button" data-outfits-back aria-label="返回六套服装">← 返回服装</button>
        <div class="outfits-detail__halo"></div>
        <img data-outfits-character alt="" />
      </div>
    </div>
  `, 'section--outfits');
}

export function initOutfits() {
  const section = document.querySelector('.section--outfits');
  if (!section) return;
  const stage = section.querySelector('[data-outfits-stage]');
  const detail = section.querySelector('[data-outfits-detail]');
  const character = section.querySelector('[data-outfits-character]');
  const cards = [...section.querySelectorAll('[data-outfit-id]')];
  const arrows = [...section.querySelectorAll('[data-doodle]')];
  const angles = arrows.map((arrow) => Number(arrow.style.getPropertyValue('--angle').replace('deg', '')));
  let active = null;
  let selectionVersion = 0;

  function aim(item) {
    const target = item && cards.find((card) => card.dataset.outfitId === item.id)?.querySelector('img');
    const targetRect = target?.getBoundingClientRect();
    arrows.forEach((arrow, index) => {
      arrow.style.setProperty('--ink', item ? item.arrows[index % item.arrows.length] : defaultColors[index % defaultColors.length]);
      if (!targetRect) {
        const original = doodles[index][3];
        angles[index] += ((original - angles[index] + 540) % 360) - 180;
      } else {
        const rect = arrow.getBoundingClientRect();
        const targetAngle = Math.atan2(targetRect.top + targetRect.height / 2 - (rect.top + rect.height / 2), targetRect.left + targetRect.width / 2 - (rect.left + rect.width / 2)) * 180 / Math.PI;
        angles[index] += ((targetAngle - angles[index] + 540) % 360) - 180;
      }
      arrow.style.setProperty('--angle', `${angles[index]}deg`);
    });
  }

  cards.forEach((card) => {
    const item = outfits.find((outfit) => outfit.id === card.dataset.outfitId);
    card.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse' || event.pointerType === 'pen') { active = item; aim(item); } });
    card.addEventListener('focus', () => { active = item; aim(item); });
    card.addEventListener('click', () => {
      active = null;
      const version = ++selectionVersion;
      character.hidden = true;
      character.removeAttribute('src');
      character.alt = '';
      detail.setAttribute('aria-busy', 'true');
      detail.style.setProperty('--detail-color', item.primary);
      detail.hidden = false;
      section.classList.add('is-detail');
      const image = new Image();
      image.onload = () => {
        if (version !== selectionVersion || detail.hidden) return;
        character.src = item.character;
        character.alt = `露米穿着${item.label}服装的完整形象`;
        character.hidden = false;
        detail.removeAttribute('aria-busy');
      };
      image.onerror = () => {
        if (version === selectionVersion) detail.removeAttribute('aria-busy');
      };
      image.src = item.character;
      section.querySelector('[data-outfits-back]').focus({ preventScroll: true });
    });
  });
  stage.addEventListener('pointerleave', () => { if (!detail.hidden) return; active = null; aim(null); });
  stage.addEventListener('focusout', (event) => { if (!stage.contains(event.relatedTarget) && detail.hidden) { active = null; aim(null); } });
  section.querySelector('[data-outfits-back]').addEventListener('click', () => {
    ++selectionVersion;
    detail.hidden = true;
    character.hidden = true;
    character.removeAttribute('src');
    character.alt = '';
    detail.removeAttribute('aria-busy');
    section.classList.remove('is-detail');
    aim(null);
  });
  window.addEventListener('resize', () => { if (active && detail.hidden) aim(active); }, { passive: true });
}
