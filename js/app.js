// Application Entry Point & Global Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  // Initialize state, audio, quests, ui
  ui.init();
  quests.init();

  // Support URL hash or query param navigation (e.g., index.html?tab=bossTab or #questTab)
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace('#', '');
  const initialTab = params.get('tab') || hash;
  if (initialTab && document.getElementById(initialTab)) {
    ui.switchTab(initialTab);
    const bossId = params.get('boss');
    if (initialTab === 'battleArena' && bossId) {
      battle.startBattle(bossId);
    }
  }

  // Support direct modal display via URL parameter (e.g. ?modal=profile or ?modal=questConfirm)
  const modalParam = params.get('modal');
  if (modalParam === 'profile') {
    ui.openProfileModal();
  } else if (modalParam === 'questConfirm') {
    quests.promptConfirmClaim('height_rope_1000');
  }

  // First user interaction starts Web Audio context and ambient BGM
  const startAudioOnFirstInteraction = () => {
    sound.init();
    if (state.data.settings.bgmEnabled) {
      sound.startBGM('ambient');
    }
    window.removeEventListener('click', startAudioOnFirstInteraction);
    window.removeEventListener('keydown', startAudioOnFirstInteraction);
    window.removeEventListener('touchstart', startAudioOnFirstInteraction);
  };

  window.addEventListener('click', startAudioOnFirstInteraction, { once: true });
  window.addEventListener('keydown', startAudioOnFirstInteraction, { once: true });
  window.addEventListener('touchstart', startAudioOnFirstInteraction, { once: true });

  console.log("Awakened Hunter Growth RPG initialized successfully.");
});
