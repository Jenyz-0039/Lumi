import { sectionShell } from '../components/SectionShell.js';

export function renderOpening(section) {
  const stickers = [
    { kind: 'heart', glyph: '♥', position: 'sticker--a', x: '36vw', y: '34vh', rotation: '52deg', at: 620, duration: 1220 },
    { kind: 'bow', glyph: '✦', position: 'sticker--b', x: '25vw', y: '19vh', rotation: '-68deg', at: 980, duration: 1480 },
    { kind: 'star', glyph: '✧', position: 'sticker--c', x: '10vw', y: '42vh', rotation: '96deg', at: 1320, duration: 1180 },
    { kind: 'sparkle', glyph: '✦', position: 'sticker--d', x: '-4vw', y: '29vh', rotation: '-78deg', at: 1690, duration: 1390 },
    { kind: 'heart', glyph: '♥', position: 'sticker--e', x: '-14vw', y: '43vh', rotation: '-58deg', at: 2040, duration: 1280 },
    { kind: 'bow', glyph: '⌁', position: 'sticker--f', x: '-27vw', y: '22vh', rotation: '84deg', at: 2410, duration: 1540 },
    { kind: 'star', glyph: '✦', position: 'sticker--g', x: '-36vw', y: '40vh', rotation: '-112deg', at: 2760, duration: 1320 },
    { kind: 'sparkle', glyph: '✧', position: 'sticker--h', x: '-10vw', y: '11vh', rotation: '64deg', at: 3090, duration: 1440 },
  ];
  return sectionShell(section, `
    <div class="opening-hero" data-opening-stage>
      <div class="opening-hero__sky" aria-hidden="true">
        <div class="opening-hero__cloud-glow opening-hero__cloud-glow--left"></div>
        <div class="opening-hero__cloud-glow opening-hero__cloud-glow--center"></div>
        <div class="opening-hero__cloud-glow opening-hero__cloud-glow--right"></div>
      </div>
      <div class="opening-hero__stickers" aria-hidden="true">
        ${stickers.map(({ kind, glyph, position, x, y, rotation, at, duration }, index) => `
          <span class="opening-sticker opening-sticker--${kind} ${position}" data-opening-sticker data-spray-at="${at}" style="--spray-x:${x};--spray-y:${y};--spray-rotation:${rotation};--spray-duration:${duration}ms;--float-delay:${-index * 0.63}s">
            <span class="opening-sticker__art">${glyph}</span>
          </span>
        `).join('')}
      </div>
      <div class="opening-hero__loader" aria-live="polite">
        <span class="opening-hero__loader-label">云朵正在醒来</span>
        <span class="opening-hero__loader-number" data-opening-progress>0%</span>
      </div>
      <div class="opening-hero__stage" aria-label="露米 IP 开场动画"></div>
      <div class="opening-hero__ready-note" data-opening-ready-note>向下滚动，让云朵揭晓露米</div>
      <div class="opening-hero__cloud-mask" data-opening-cloud aria-hidden="true">
        <svg viewBox="0 0 1440 700" preserveAspectRatio="none" role="presentation">
          <path d="M0 420 C68 420 64 300 142 300 C220 300 216 390 284 390 C352 390 358 238 452 238 C546 238 548 370 626 370 C704 370 700 260 796 260 C892 260 894 390 970 390 C1046 390 1040 300 1122 300 C1204 300 1198 402 1278 402 C1358 402 1364 320 1440 320 L1440 700 L0 700 Z" fill="#fff" stroke="#172236" stroke-width="3" vector-effect="non-scaling-stroke"/>
        </svg>
      </div>
      <div class="opening-hero__reveal" data-opening-reveal>
        <div class="opening-hero__reveal-copy">
          <p class="opening-hero__reveal-kicker">IP CHARACTER</p>
          <h1>露米</h1>
          <p>一朵把轻松带进日常的云。</p>
        </div>
        <div class="opening-hero__reveal-character">
          <img class="opening-hero__reveal-ip" src="./public/assets/lumi-character.png" alt="露米云朵角色" />
        </div>
      </div>
      <div class="opening-hero__scroll-hint" aria-hidden="true"><span></span><b>SCROLL</b></div>
    </div>
  `, 'section--opening');
}
