export function createSiteStore() {
  const state = {
    activeSection: 'opening',
    characterExpression: 'before-click',
    selectedExpression: null,
    selectedOutfit: null,
    gameInteraction: null,
  };

  const listeners = new Set();
  return {
    getState: () => ({ ...state }),
    setState: (patch) => {
      Object.assign(state, patch);
      listeners.forEach((listener) => listener({ ...state }));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
