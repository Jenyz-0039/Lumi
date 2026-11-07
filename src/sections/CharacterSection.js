import { sectionIntro, sectionShell } from '../components/SectionShell.js';
import { placeholderMedia } from '../components/PlaceholderMedia.js';

export function renderCharacter(section) {
  return sectionShell(section, `<div class="section__grid"><div>${sectionIntro(section)}<div class="section__actions"><button class="button button--primary" type="button" data-character-action="click">点击角色（占位）</button></div></div>${placeholderMedia('IP 角色', '预留点击前 / 点击后两套表情，限制比例变化', 'placeholder--hero')}</div>`);
}
