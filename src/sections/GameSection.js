const foods = [
  ['donut', '甜甜圈'],
  ['burger', '汉堡'],
  ['bubble-tea', '珍珠奶茶'],
  ['cookie', '曲奇饼干'],
  ['chocolate', '巧克力'],
  ['tart', '蛋挞'],
];

export function renderGame(section) {
  const foodButtons = foods.map(([id, label]) => `
    <button class="game-food" type="button" data-game-food="${id}" aria-label="拖动${label}喂露米">
      <img src="./public/assets/game/food-${id}.png" alt="" draggable="false" />
      <span>${label}</span>
    </button>
  `).join('');

  return `
    <section id="${section.id}" class="section section--game" data-section-id="${section.id}" aria-labelledby="game-title">
      <div class="game-background" aria-hidden="true"></div>
      <div class="game-spark game-spark--one" aria-hidden="true">✦</div>
      <div class="game-spark game-spark--two" aria-hidden="true">✧</div>

      <div class="game-layout">
        <header class="game-intro">
          <p class="game-intro__index">10 / 小游戏</p>
          <h2 id="game-title">和露米玩一会儿</h2>
          <p>拖一份点心到嘴边，或者轻轻摸摸露米的头。</p>
        </header>

        <div class="game-character" data-game-character-wrap>
          <img
            class="game-character__image"
            data-game-character
            src="./public/assets/game/lumi-default.png"
            alt="露米正开心地等你互动"
            draggable="false"
          />
          <div class="game-character__face-zone" data-game-face-zone aria-hidden="true"></div>
          <div class="game-character__pat-zone" data-game-pat-zone aria-hidden="true"></div>
          <div class="game-character__mouth-zone" data-game-mouth-zone aria-hidden="true"></div>
        </div>

        <div class="game-food-picker" data-game-food-picker>
          <button class="game-food-toggle" type="button" data-game-food-toggle aria-expanded="false" aria-controls="game-food-tray">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M12 22c0-8 5-13 12-13s12 5 12 13v13H12V22Z" />
              <path d="M8 35h32M18 17c2-3 4-4 6-4s4 1 6 4" />
              <circle cx="24" cy="25" r="3" />
            </svg>
            <span>选一份点心</span>
          </button>
          <div class="game-food-tray" id="game-food-tray" data-game-food-tray aria-hidden="true">
            ${foodButtons}
          </div>
        </div>

        <p class="game-status" data-game-status aria-live="polite">露米在等你</p>
      </div>

      <div class="game-cursor" data-game-cursor aria-hidden="true">
        <img src="./public/assets/game/pat-hand.png" alt="" />
      </div>
    </section>
  `;
}
