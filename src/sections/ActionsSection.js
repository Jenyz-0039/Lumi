import { actions } from '../data/sections.js';
import { sectionIntro, sectionShell } from '../components/SectionShell.js';
import { placeholderMedia } from '../components/PlaceholderMedia.js';

export function renderActions(section) {
  return sectionShell(section, `${sectionIntro(section)}<div class="card-grid" data-action-grid>${actions.map((item) => `<article class="info-card"><span class="info-card__number">${item.label}</span><h3 class="info-card__title">动作图片占位</h3>${placeholderMedia('动作素材', '后续接入正式图片')}</article>`).join('')}</div>`);
}
