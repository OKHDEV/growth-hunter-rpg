// Application Entry Point & Global Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  // Admin Auto-Routing Guard: Route logged-in Admin directly to admin.html unless spectating or explicit game param
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const isSpectate = searchParams.has('spectate') || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('spectator_active') === 'true');
    const isExplicitGame = searchParams.has('game') || searchParams.has('play');
    const rawCloud = typeof localStorage !== 'undefined' ? (localStorage.getItem('awakened_hunter_cloud_session_v1') || '') : '';
    const hasAdminAuth = typeof localStorage !== 'undefined' &&
                         (localStorage.getItem('isAdminLoggedIn') === 'true' || localStorage.getItem('admin_master_session') === 'true') &&
                         (rawCloud.toLowerCase().includes('"userid":"admin"') || localStorage.getItem('admin_master_session') === 'true');
    if (hasAdminAuth && !isSpectate && !isExplicitGame) {
      window.location.replace('admin.html');
      return;
    }
  } catch(e) {}

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

  if (hash === 'inventoryTab_openTitles') {
    ui.switchTab('inventoryTab');
    if (!ui.isUnownedTitlesExpanded) {
      ui.toggleUnownedTitles();
    }
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

  // First user interaction starts Web Audio context, unlocks iOS silent mode, and ambient BGM
  const startAudioOnFirstInteraction = () => {
    sound.init();
    sound.unlockIOSSilentMode();
    if (state.data.settings.bgmEnabled) {
      sound.startBGM('ambient');
    }
    ['click', 'keydown', 'touchstart', 'touchend', 'pointerdown'].forEach(evt => {
      window.removeEventListener(evt, startAudioOnFirstInteraction);
    });
  };

  ['click', 'keydown', 'touchstart', 'touchend', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, startAudioOnFirstInteraction, { once: true, passive: true });
  });

  console.log("Awakened Hunter Growth RPG initialized successfully.");
});
