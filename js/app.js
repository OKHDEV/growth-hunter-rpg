// Application Entry Point & Global Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  // Initialize state, audio, quests, ui
  ui.init();
  quests.init();

  // Support URL hash or query param navigation (e.g., index.html?tab=bossTab or #questTab)
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace('#', '');
  const initialTab = params.get('tab') || hash.split('_')[0];
  if (initialTab && document.getElementById(initialTab)) {
    ui.switchTab(initialTab);
    const bossId = params.get('boss');
    if (initialTab === 'battleArena' && bossId) {
      battle.startBattle(bossId);
    }
  }

  const modeParam = params.get('mode') || (hash.includes('_') ? hash.split('_')[1] : null);
  if (modeParam && ['all', 'folder', 'day'].includes(modeParam)) {
    quests.setViewMode(modeParam);
  }

  const zoneParam = params.get('zone') || (hash.startsWith('bossTab_zone') ? hash.replace('bossTab_zone', '') : null);
  if (zoneParam) {
    ui.setBossZone(parseInt(zoneParam));
  }

  if (hash.startsWith('battleArena_boss')) {
    const bId = hash.replace('battleArena_', '');
    ui.switchTab('battleArena');
    battle.startBattle(bId);
  }

  // Support direct modal display via URL parameter (e.g. ?modal=profile, ?modal=questConfirm, ?modal=customQuest)
  const modalParam = params.get('modal');
  if (modalParam === 'profile') {
    ui.openProfileModal();
  } else if (modalParam === 'questConfirm') {
    quests.promptConfirmClaim('height_rope_1000');
  } else if (modalParam === 'customQuest') {
    quests.openCustomQuestModal();
  } else if (modalParam === 'dateJump') {
    ui.openDateJumpModal();
  } else if (modalParam === 'deleteQuest') {
    ui.switchTab('questTab');
    quests.openDeleteQuestModal();
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
