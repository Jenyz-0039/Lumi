import { sectionIntro, sectionShell } from '../components/SectionShell.js';

export function renderEnding(section) {
  return sectionShell(section, `${sectionIntro(section)}<div class="section__actions"><button class="button button--primary" type="button" data-scroll-target="opening">返回顶部 / 重新体验</button></div>`, 'section--closing');
}
