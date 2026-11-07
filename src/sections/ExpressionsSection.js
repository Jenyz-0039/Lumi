import { expressions } from '../data/sections.js';
import { sectionIntro, sectionShell } from '../components/SectionShell.js';

export function renderExpressions(section) {
  return sectionShell(section, `${sectionIntro(section)}<div class="choice-grid" data-expression-grid>${expressions.map((item) => `<article class="choice-card"><button type="button" data-expression-id="${item.id}"><span class="choice-card__label">${item.label}</span><h3 class="choice-card__title">照片占位</h3><p>点击后预留大图查看</p></button></article>`).join('')}</div><div class="section__actions"><button class="button" type="button" data-close-preview hidden>关闭大图（占位）</button></div>`);
}
