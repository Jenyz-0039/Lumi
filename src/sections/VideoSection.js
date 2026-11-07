import { sectionShell } from '../components/SectionShell.js';

const stickerRoot = './public/assets/transitions/stickers/extracted';

const transitionConfigs = {
  'transition-one': {
    variant: 'camera',
    frame: './public/assets/transitions/transition-one/frame-camera-clean.png',
    video: './public/assets/transitions/transition-one/transition-one.mp4',
    stickers: [
      ['tomato-stack', 'one-a'],
      ['blue-star', 'one-b'],
      ['roll-cake', 'one-c'],
      ['smile-lemon', 'one-d'],
      ['paper-red-burst-small', 'one-e'],
      ['paper-speech', 'one-f'],
      ['paper-question-small', 'one-g'],
    ],
  },
  'transition-two': {
    variant: 'television',
    frame: './public/assets/transitions/transition-two/frame-television-clean.png',
    video: './public/assets/transitions/transition-two/transition-two.mp4',
    stickers: [
      ['crystal-butterfly', 'two-a'],
      ['iridescent-heart', 'two-b'],
      ['paper-teal-heart', 'two-c'],
      ['paper-yellow-burst-small', 'two-d'],
      ['paper-exclamation-small', 'two-e'],
      ['paper-bear-small', 'two-f'],
      ['pearl-orb', 'two-g'],
    ],
  },
};

function renderSticker([name, placement], index) {
  return `
    <img
      class="transition-sticker transition-sticker--${placement}"
      src="${stickerRoot}/${name}.png"
      alt=""
      aria-hidden="true"
      decoding="async"
      style="--float-index: ${index}"
    />
  `;
}

export function renderVideo(section) {
  const config = transitionConfigs[section.id];
  if (!config) return '';

  const content = `
    <div class="transition-stage transition-stage--${config.variant}" data-video-frame-section>
      <div class="transition-stage__glow" aria-hidden="true"></div>
      <div class="transition-composition">
        <div class="transition-frame" data-video-frame>
          <div class="transition-frame__screen">
            <video
              class="transition-frame__video"
              src="${config.video}"
              muted
              loop
              playsinline
              preload="metadata"
              disablepictureinpicture
              aria-hidden="true"
              tabindex="-1"
              data-frame-video
            ></video>
          </div>
          <img class="transition-frame__art" src="${config.frame}" alt="" aria-hidden="true" draggable="false" />
        </div>
        <div class="transition-stickers" aria-hidden="true">
          ${config.stickers.map(renderSticker).join('')}
        </div>
      </div>
    </div>
  `;

  return sectionShell(section, content, `section--video-frame section--video-frame-${config.variant}`);
}

export function initVideoFrames() {
  const sections = [...document.querySelectorAll('[data-video-frame-section]')];
  if (!sections.length) return;

  const configureVideoFit = (video) => {
    const screen = video.parentElement;
    if (!screen || !video.videoWidth || !video.videoHeight) return;
    const videoRatio = video.videoWidth / video.videoHeight;
    const screenRatio = screen.clientWidth / screen.clientHeight;
    const mismatch = Math.abs(Math.log(videoRatio / screenRatio));
    video.dataset.fit = mismatch > 0.16 ? 'contain' : 'cover';
  };

  sections.forEach((section) => {
    const video = section.querySelector('[data-frame-video]');
    if (!video) return;
    video.muted = true;
    video.addEventListener('loadedmetadata', () => configureVideoFit(video), { once: true });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target.querySelector('[data-frame-video]');
      if (!video) return;
      if (entry.isIntersecting) {
        video.muted = true;
        const playback = video.play();
        if (playback?.catch) playback.catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.28 });

  sections.forEach((section) => observer.observe(section));
}
