export function placeholderMedia(label, detail, className = '') {
  return `
    <div class="placeholder ${className}" aria-label="${label}占位区域">
      <div class="placeholder__label">
        <strong>素材占位 · ${label}</strong>
        <span>${detail}</span>
      </div>
    </div>
  `;
}
