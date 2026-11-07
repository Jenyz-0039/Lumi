export function renderSideNav(sections) {
  return `
    <nav class="side-nav" aria-label="章节导航">
      ${sections.map((section, index) => `
        <button class="side-nav__item${index === 0 ? ' is-active' : ''}" type="button" data-nav-target="${section.id}" aria-label="跳转到${section.label}">
          <span>${section.index}</span><span class="side-nav__dot" aria-hidden="true"></span>
        </button>
      `).join('')}
    </nav>
  `;
}
