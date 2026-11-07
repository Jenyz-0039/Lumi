export function sectionShell(section, content, extraClass = '') {
  return `
    <section id="${section.id}" class="section ${extraClass}" data-section-id="${section.id}">
      <div class="section__inner">
        ${content}
      </div>
    </section>
  `;
}

export function sectionIntro(section) {
  return `
    <p class="section__eyebrow">${section.index} / ${section.label}</p>
    <h2 class="section__title">${section.title}</h2>
    <p class="section__description">${section.description}</p>
  `;
}
