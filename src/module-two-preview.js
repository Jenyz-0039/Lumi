import { initBackgroundStack, renderBackground } from './sections/BackgroundSection.js';

const section = {
  id: 'background',
  index: '02',
  label: '背景介绍',
  title: 'Lumi露米——让热爱不止一种形状',
  description: '从日常里微小的惊喜出发，认识一朵不为热爱设限的云。',
  type: 'background',
};

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <div class="site-brand">可颂 / MODULE TWO PREVIEW</div>
    <div class="site-progress" data-progress>02 / 11</div>
  </header>
  <main>${renderBackground(section)}</main>
`;

initBackgroundStack();
