// Game State & Persistence Manager: High School 2nd Grade (173cm -> 178cm)
// Daily reset is at midnight (game day runs from 00:00:00 to 23:59:59)
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
if (typeof window !== 'undefined') window.getLocalDateString = getLocalDateString;
if (typeof global !== 'undefined') global.getLocalDateString = getLocalDateString;

class GameState {
  constructor() {
    this.STORAGE_KEY = 'awakened_hunter_save_v2';
    this.MIRROR_KEY = 'awakened_hunter_save_mirror_v2';
    this.CLOUD_SESSION_KEY = 'awakened_hunter_cloud_session_v1';
    this.CLOUD_REGISTRY_ID = 'ff808181a09d98f701a186c07dd548c4';
    this.CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
    this.BYTEBIN_URL = 'https://bytebin.lucko.me';
    this.PASTES_URL = 'https://api.pastes.dev';
    this.NTFY_MIRRORS = [
      'https://ntfy.adminforge.de/okh_gh_cloud_',
      'https://ntfy.tedomum.fr/okh_gh_cloud_',
      'https://ntfy.sh/okh_gh_cloud_v4_'
    ];
    this.NTFY_BASE = this.NTFY_MIRRORS[0];
    this.LEGACY_REGISTRIES = [
      'https://ntfy.adminforge.de/okh_gh_cloud_registry/json?poll=1&since=0',
      'https://ntfy.tedomum.fr/okh_gh_cloud_registry/json?poll=1&since=0',
      'https://ntfy.sh/okh_gh_cloud_v4_registry/json?poll=1&since=0',
      'https://ntfy.sh/okh_gh_cloud_prod_v3_registry/json?poll=1&since=0',
      'https://ntfy.sh/okh_gh_cloud_v2_registry/json?poll=1&since=0'
    ];
    this._lastRegistrySync = 0;
    this.isReadOnlyMode = false;
    this.spectatorUserId = null;

    // 🎴 15 UNIQUE PLAYER HERO CARDS
    this.PLAYER_CARDS = [
      {
        id: 'card_default',
        name: '초보 각성자 (헌터 오경호)',
        tag: '균형 · 수련',
        badge: '초보 각성자',
        image: 'assets/player/hunter.jpg',
        themeClass: 'card-theme-default',
        glowColor: '#00e5ff',
        borderColor: '#00e5ff',
        accentColor: '#38bdf8',
        desc: '고2 수련생 각성자. 178cm를 향해 매일 정직한 퀘스트를 수행하는 성장형 헌터의 시작점.'
      },
      {
        id: 'card_shadow',
        name: '그림자 군주 (섀도우 로드)',
        tag: '암흑 · 군단',
        badge: '그림자 군주',
        image: 'assets/player/card_shadow.jpg',
        themeClass: 'card-theme-shadow',
        glowColor: '#a855f7',
        borderColor: '#9333ea',
        accentColor: '#c084fc',
        desc: '어둠을 자신의 영토로 삼아 절대적인 그림자 병단을 지휘하는 어둠의 군주.'
      },
      {
        id: 'card_flame',
        name: '진홍의 염제 (헬 블레이즈)',
        tag: '화염 · 폭멸',
        badge: '진홍의 염제',
        image: 'assets/player/card_flame.jpg',
        themeClass: 'card-theme-flame',
        glowColor: '#ef4444',
        borderColor: '#dc2626',
        accentColor: '#f87171',
        desc: '모든 불순물을 태워버리는 불멸의 업화를 두른 지옥의 화염 지배자.'
      },
      {
        id: 'card_frost',
        name: '절대영도 서리군주 (프로스트 킹)',
        tag: '빙결 · 제어',
        badge: '서리군주',
        image: 'assets/player/card_frost.jpg',
        themeClass: 'card-theme-frost',
        glowColor: '#38bdf8',
        borderColor: '#0284c7',
        accentColor: '#7dd3fc',
        desc: '숨결마저 시공간을 얼어붙게 만드는 태고의 영구동토 절대 빙결 지배자.'
      },
      {
        id: 'card_thunder',
        name: '뇌신 번개의 인도자 (볼트 마스터)',
        tag: '뇌격 · 신속',
        badge: '뇌신',
        image: 'assets/player/card_thunder.jpg',
        themeClass: 'card-theme-thunder',
        glowColor: '#facc15',
        borderColor: '#eab308',
        accentColor: '#fde047',
        desc: '천둥과 번개를 채찍처럼 다루며 초광속으로 전장을 가르는 천둥의 전령.'
      },
      {
        id: 'card_radiant',
        name: '황금빛 태양성기사 (솔라 팔라딘)',
        tag: '신성 · 불굴',
        badge: '태양성기사',
        image: 'assets/player/card_radiant.jpg',
        themeClass: 'card-theme-radiant',
        glowColor: '#fbbf24',
        borderColor: '#d97706',
        accentColor: '#fef08a',
        desc: '눈부신 황금빛 서광으로 아군을 수호하고 모든 악을 심판하는 태양의 성전사.'
      },
      {
        id: 'card_abyss',
        name: '심연의 밤사냥꾼 (어비스 워커)',
        tag: '암살 · 은밀',
        badge: '심연사냥꾼',
        image: 'assets/player/card_abyss.jpg',
        themeClass: 'card-theme-abyss',
        glowColor: '#8b5cf6',
        borderColor: '#7c3aed',
        accentColor: '#a78bfa',
        desc: '빛조차 닿지 않는 심연의 틈새에서 적의 숨통을 소리 없이 끊는 암살자.'
      },
      {
        id: 'card_dragon',
        name: '용혈의 드래곤나이트 (용기사)',
        tag: '용족 · 파괴',
        badge: '용기사',
        image: 'assets/player/card_dragon.jpg',
        themeClass: 'card-theme-dragon',
        glowColor: '#f97316',
        borderColor: '#ea580c',
        accentColor: '#fb923c',
        desc: '고대 드래곤의 심장을 계승하여 마그마의 생명력과 파괴력을 품은 용기사.'
      },
      {
        id: 'card_wind',
        name: '질풍의 취록검성 (윈드 블레이더)',
        tag: '바람 · 연속',
        badge: '질풍검성',
        image: 'assets/player/card_wind.jpg',
        themeClass: 'card-theme-wind',
        glowColor: '#10b981',
        borderColor: '#059669',
        accentColor: '#34d399',
        desc: '칼날이 바람보다 빨라 잔상조차 보이지 않는 신속 무쌍의 녹색 검성.'
      },
      {
        id: 'card_blood',
        name: '혈월의 버서커 (블러드 팽)',
        tag: '광폭 · 흡혈',
        badge: '혈월버서커',
        image: 'assets/player/card_blood.jpg',
        themeClass: 'card-theme-blood',
        glowColor: '#e11d48',
        borderColor: '#be123c',
        accentColor: '#fb7185',
        desc: '붉은 달 아래 투기를 폭발시키며 상처를 입을수록 더욱 흉포해지는 광전사.'
      },
      {
        id: 'card_void',
        name: '시공간 차원방랑자 (보이드 트래블러)',
        tag: '차원 · 성운',
        badge: '차원방랑자',
        image: 'assets/player/card_void.jpg',
        themeClass: 'card-theme-void',
        glowColor: '#6366f1',
        borderColor: '#4f46e5',
        accentColor: '#818cf8',
        desc: '다차원의 시공간을 넘나들며 우주 성운과 중력을 자유자재로 다루는 방랑자.'
      },
      {
        id: 'card_cyber',
        name: '사이버네틱 네온워커 (사이버 펑크)',
        tag: '첨단 · 플라즈마',
        badge: '사이버워커',
        image: 'assets/player/card_cyber.jpg',
        themeClass: 'card-theme-cyber',
        glowColor: '#ec4899',
        borderColor: '#db2777',
        accentColor: '#f472b6',
        desc: '첨단 나노슈트와 고출력 플라즈마 빔 블레이드를 장착한 미래형 각성병기.'
      },
      {
        id: 'card_celestial',
        name: '천상의 수호대천사 (아크엔젤)',
        tag: '천상 · 정화',
        badge: '수호대천사',
        image: 'assets/player/card_celestial.jpg',
        themeClass: 'card-theme-celestial',
        glowColor: '#e0e7ff',
        borderColor: '#a5b4fc',
        accentColor: '#c7d2fe',
        desc: '순백의 날개와 성스러운 은빛 광채로 모든 저주를 정화하는 천상의 수호자.'
      },
      {
        id: 'card_phantom',
        name: '영혼의 사령관 (팬텀 로드)',
        tag: '영혼 · 유령',
        badge: '영혼사령관',
        image: 'assets/player/card_phantom.jpg',
        themeClass: 'card-theme-phantom',
        glowColor: '#14b8a6',
        borderColor: '#0d9488',
        accentColor: '#2dd4bf',
        desc: '이승을 떠도는 혼령들을 부려 전장을 유령의 청록빛 안개로 지배하는 사령관.'
      },
      {
        id: 'card_sovereign',
        name: '불멸의 신화황제 (이모탈 엠페러)',
        tag: '신화 · 초월',
        badge: '신화황제',
        image: 'assets/player/card_sovereign.jpg',
        themeClass: 'card-theme-sovereign',
        glowColor: '#eab308',
        borderColor: '#ca8a04',
        accentColor: '#fef08a',
        desc: '모든 차원과 원소의 한계를 초월하여 절대적 지위를 확립한 최고위 신화 황제.'
      }
    ];

    // Spectator / View-Only Mode Detection
    // Strict Guard: Spectator mode MUST ONLY be active when the URL explicitly contains '?spectate'
    // AND sessionStorage has spectator_active === 'true' AND valid admin credentials exist.
    this.isReadOnlyMode = false;
    this.spectatorUserId = null;
    try {
      const searchParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
      const hasSpectateParam = Boolean(searchParams && (searchParams.has('spectate') || searchParams.get('mode') === 'spectate'));
      const hasSpectateSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('spectator_active') === 'true';
      const isAdmin = typeof localStorage !== 'undefined' && (localStorage.getItem('isAdminLoggedIn') === 'true' || localStorage.getItem('admin_master_session') === 'true');

      if (hasSpectateParam && hasSpectateSession && isAdmin) {
        this.isReadOnlyMode = true;
        let sUser = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('spectator_user_id') : null;
        if (!sUser && typeof localStorage !== 'undefined') {
          try {
            const t = JSON.parse(localStorage.getItem('spectator_temp_save') || '{}');
            sUser = t && t.userId;
          } catch(e) {}
        }
        this.spectatorUserId = sUser || '유저';
      } else {
        // Normal game session: actively clear any residual spectator flags so saving is NEVER blocked
        this.isReadOnlyMode = false;
        this.spectatorUserId = null;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('spectator_active');
          sessionStorage.removeItem('spectator_user_id');
          sessionStorage.removeItem('spectator_save_data');
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('spectator_temp_save');
        }
      }
    } catch (e) {
      this.isReadOnlyMode = false;
      this.spectatorUserId = null;
    }

    this.cloudSession = this.loadCloudSession();
    this._cloudSyncTimer = null;
    this._isSyncingCloud = false;
    this._accountDeleted = false;
    this.data = this.getDefaultState();
    this.load();
    this.setupAutoSaveHooks();
    this.initCloudSyncOnStartup();
  }

  setupAutoSaveHooks() {
    if (typeof window === 'undefined') return;

    let lastAutoPullTime = 0;
    let lastConnectLogTime = 0;
    const triggerAutoCloudPull = (reason = 'focus') => {
      if (this.isReadOnlyMode || this._accountDeleted) return;
      // If there are unsaved local changes pending cloud sync, flush them immediately instead of pulling stale cloud data!
      if (this._cloudSyncTimer !== null || this._isSyncingCloud) {
        if (this._cloudSyncTimer !== null) {
          clearTimeout(this._cloudSyncTimer);
          this._cloudSyncTimer = null;
        }
        this.syncToCloud(true);
        return;
      }
      const now = Date.now();
      // Throttle pulls to avoid flooding requests within 3 seconds
      if (now - lastAutoPullTime < 3000) return;
      lastAutoPullTime = now;
      if (this.cloudSession && this.cloudSession.userId) {
        this.pullFromCloud(true, false, true);
        // Only log 'connect' if starting a new visit after at least 15 minutes away
        if (!lastConnectLogTime || (now - lastConnectLogTime > 15 * 60 * 1000)) {
          lastConnectLogTime = now;
          this.logUserActivity('connect');
        }
      }
    };

    // 1. Leaving page, switching tabs, or locking phone: save immediately to local storage and sync to cloud
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('beforeunload', () => {
        if (!this.isReadOnlyMode && !this._accountDeleted) this.save(true);
      });
      window.addEventListener('pagehide', () => {
        if (!this.isReadOnlyMode && !this._accountDeleted) this.save(true);
      });
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.isReadOnlyMode || this._accountDeleted) return;
        if (document.hidden) {
          this.save(true);
        } else {
          // Returning to tab / unlocked phone: pull latest cloud record automatically (detects admin deletion instantly)
          triggerAutoCloudPull('visibilitychange');
        }
      });
    }

    // 2. iOS Safari / Android Chrome BFCache restore & Window focus
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('pageshow', () => {
        if (!this.isReadOnlyMode && !this._accountDeleted) triggerAutoCloudPull('pageshow');
      });

      window.addEventListener('focus', () => {
        if (!this.isReadOnlyMode && !this._accountDeleted) triggerAutoCloudPull('focus');
      });

      // 3. Online event (reconnected to internet after device sleep or power on)
      window.addEventListener('online', () => {
        if (!this.isReadOnlyMode && !this._accountDeleted) triggerAutoCloudPull('online');
      });
    }

    // 4. In-game periodic heartbeat (every 15s) while screen active: detects remote admin deletion and kicks out in real-time
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        if (this.isReadOnlyMode || this._accountDeleted) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        if (this.cloudSession && this.cloudSession.userId) {
          this.pullFromCloud(true, false, false);
        }
      }, 15000);

      // In-game periodic background auto-save (every 60s) without spamming activity logs
      setInterval(() => {
        if (this.isReadOnlyMode || this._accountDeleted) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        if (this.cloudSession && this.cloudSession.userId) {
          this.save(false);
        }
      }, 60000);
    }
  }

  getPlayerCards() {
    return this.PLAYER_CARDS;
  }

  getPlayerCard(cardId = null) {
    const id = cardId || (this.data && this.data.player && this.data.player.cardId) || 'card_default';
    return this.PLAYER_CARDS.find(c => c.id === id) || this.PLAYER_CARDS[0];
  }

  setPlayerCard(cardId) {
    const card = this.getPlayerCard(cardId);
    if (!this.data.player) this.data.player = {};
    this.data.player.cardId = card.id;
    this.data.player.avatar = card.image;
    this.save(true);
    return card;
  }

  getDefaultState() {
    return {
      lastSaved: new Date().toISOString(),
      resetTimestamp: 0,
      player: {
        name: "헌터",
        grade: "고등학교 2학년",
        title: "초보 수련자 (173cm)",
        avatar: "assets/player/hunter.jpg",
        cardId: "card_default",
        level: 1,
        exp: 0,
        gold: 500,
        baseHeight: 173.0,
        targetHeight: 178.0,
        growthPoints: 0,
        freeStatPoints: 0,
        stats: {
          str: 14,
          int: 12,
          end: 14,
          gro: 15
        },
        equipment: {
          weapon: null,
          armor: null,
          shoes: null,
          ring: null,
          aura: null
        },
        inventory: [],
        unlockedTitles: ["초보 수련자 (173cm)"],
        activeTitle: "초보 수련자 (173cm)"
      },
      quests: {
        dailyStreak: 1,
        startDate: getLocalDateString(),
        lastActiveDate: getLocalDateString(),
        completedToday: {},
        progress: {},
        customQuests: [],
        deletedQuestIds: [],
        history: {},
        streakProtectionTickets: 3,
        streakProtectionUsedDates: [],
        folders: [
          {
            id: 'folder_growth',
            name: '🌱 178cm 키 성장 루틴',
            questIds: ['height_rope_1000', 'height_rope_2000', 'height_spine_stretch', 'height_golden_sleep', 'height_nutrition']
          },
          {
            id: 'folder_study',
            name: '📚 고2 수험 & 두뇌 집중',
            questIds: ['study_pure_2h', 'study_pure_5h', 'study_wrong_notes', 'detox_night_phone']
          },
          {
            id: 'folder_fitness',
            name: '🔥 체력 & 코어 단련',
            questIds: ['fitness_pushups_100', 'fitness_squats_150', 'fitness_running_3k', 'fitness_cold_shower']
          }
        ],
        dayQuests: {
          mon: ['height_rope_1000', 'height_spine_stretch', 'study_pure_2h', 'height_golden_sleep'],
          tue: ['height_rope_2000', 'height_spine_stretch', 'detox_shorts_24h', 'height_golden_sleep'],
          wed: ['height_rope_1000', 'fitness_pushups_100', 'study_pure_2h', 'height_nutrition'],
          thu: ['height_rope_2000', 'height_spine_stretch', 'fitness_squats_150', 'height_golden_sleep'],
          fri: ['height_rope_1000', 'detox_night_phone', 'study_pure_5h', 'height_golden_sleep'],
          sat: ['height_rope_3500', 'fitness_running_3k', 'height_nutrition', 'fitness_cold_shower'],
          sun: ['height_basketball_jumps', 'height_spine_stretch', 'study_wrong_notes', 'height_golden_sleep']
        }
      },
      raid: {
        unlockedStage: 1, // Can progress from 1 to 50
        clearedStages: [],
        clearCounts: {}
      },
      activityLog: [],
      settings: {
        bgmVolume: 0.6,
        sfxVolume: 0.8,
        bgmEnabled: true,
        sfxEnabled: true,
        screenShake: true
      }
    };
  }

  load() {
    if (this.isReadOnlyMode) {
      let rawSave = null;
      if (typeof sessionStorage !== 'undefined') {
        rawSave = sessionStorage.getItem('spectator_save_data');
      }
      if (!rawSave && typeof localStorage !== 'undefined') {
        try {
          const tempObj = JSON.parse(localStorage.getItem('spectator_temp_save') || '{}');
          if (tempObj && tempObj.save) rawSave = JSON.stringify(tempObj.save);
        } catch(e) {}
      }
      if (rawSave) {
        try {
          const parsed = JSON.parse(rawSave);
          this.loadFromObject(parsed, false);
          this.checkRetroactiveUnlocks();
          return;
        } catch(e) {
          console.error("Failed to parse spectator save data:", e);
        }
      }
    }

    try {
      let saved = localStorage.getItem(this.STORAGE_KEY);
      // Dual-layer recovery: If primary key missing or broken, try mirror backup
      if (!saved) {
        saved = localStorage.getItem(this.MIRROR_KEY);
        if (saved) {
          console.warn("Recovered game state from mirror backup!");
        }
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        this.loadFromObject(parsed, false);
        this.checkDailyReset();
        this.checkRetroactiveUnlocks();
        this.data.quests.dailyStreak = this.getDailyStreak();
      }
    } catch (e) {
      console.error("Failed to load primary save data, attempting mirror:", e);
      try {
        const mirror = localStorage.getItem(this.MIRROR_KEY);
        if (mirror) {
          const parsed = JSON.parse(mirror);
          this.loadFromObject(parsed, false);
          this.checkDailyReset();
          this.checkRetroactiveUnlocks();
          return;
        }
      } catch (err2) {
        console.error("Mirror load also failed:", err2);
      }
      this.data = this.getDefaultState();
    }
  }

  loadFromObject(parsed, triggerSave = true) {
    const def = this.getDefaultState();
    this.data = {
      ...def,
      ...parsed,
      resetTimestamp: Number(parsed.resetTimestamp) || 0,
      player: {
        ...def.player,
        ...(parsed.player || {}),
        cardId: (parsed.player && parsed.player.cardId) || 'card_default',
        avatar: (parsed.player && parsed.player.avatar) || (this.getPlayerCard((parsed.player && parsed.player.cardId) || 'card_default').image),
        stats: { ...def.player.stats, ...((parsed.player && parsed.player.stats) || {}) },
        equipment: { ...def.player.equipment, ...((parsed.player && parsed.player.equipment) || {}) },
        unlockedTitles: (parsed.player && parsed.player.unlockedTitles) || def.player.unlockedTitles,
        inventory: (parsed.player && parsed.player.inventory) || []
      },
      quests: {
        ...def.quests,
        ...(parsed.quests || {}),
        startDate: (parsed.quests && parsed.quests.startDate) || def.quests.startDate,
        completedToday: (parsed.quests && parsed.quests.completedToday) || {},
        progress: (parsed.quests && parsed.quests.progress) || {},
        customQuests: (parsed.quests && parsed.quests.customQuests) || [],
        deletedQuestIds: (parsed.quests && parsed.quests.deletedQuestIds) || [],
        history: (parsed.quests && parsed.quests.history) || {},
        streakProtectionUsedDates: (parsed.quests && Array.isArray(parsed.quests.streakProtectionUsedDates))
          ? parsed.quests.streakProtectionUsedDates
          : [],
        streakProtectionTickets: (parsed.quests && parsed.quests.streakProtectionTickets !== undefined)
          ? Math.max(0, Math.min(3, Number(parsed.quests.streakProtectionTickets)))
          : ((parsed.quests && Array.isArray(parsed.quests.streakProtectionUsedDates)) ? Math.max(0, 3 - parsed.quests.streakProtectionUsedDates.length) : 3),
        folders: (parsed.quests && Array.isArray(parsed.quests.folders) && parsed.quests.folders.length > 0)
          ? parsed.quests.folders
          : def.quests.folders,
        dayQuests: (parsed.quests && parsed.quests.dayQuests && typeof parsed.quests.dayQuests === 'object')
          ? { ...def.quests.dayQuests, ...parsed.quests.dayQuests }
          : def.quests.dayQuests
      },
      raid: {
        ...def.raid,
        ...(parsed.raid || {}),
        clearedStages: (parsed.raid && parsed.raid.clearedStages) || [],
        clearCounts: (parsed.raid && parsed.raid.clearCounts) || {}
      },
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
      settings: {
        ...def.settings,
        ...(parsed.settings || {})
      }
    };
    // Auto-repair legacy placeholder IDs in folders and dayQuests if present
    if (this.data.quests.folders) {
      const hasInvalidFolder = this.data.quests.folders.some(f => (f.questIds || []).some(id => id.startsWith('q_skip')));
      if (hasInvalidFolder) {
        this.data.quests.folders = def.quests.folders;
      }
    }
    if (this.data.quests.dayQuests) {
      const hasInvalidDay = Object.values(this.data.quests.dayQuests).some(list => (list || []).some(id => id.startsWith('q_skip')));
      if (hasInvalidDay) {
        this.data.quests.dayQuests = def.quests.dayQuests;
      }
    }

    // Convert any legacy freeStatPoints to gold as requested by user
    if (this.data.player.freeStatPoints && this.data.player.freeStatPoints > 0) {
      this.data.player.gold = (this.data.player.gold || 0) + (this.data.player.freeStatPoints * 300);
      this.data.player.freeStatPoints = 0;
    }
    this.data.quests.dailyStreak = this.getDailyStreak();
    this.checkRetroactiveUnlocks();
    if (triggerSave) {
      this.save();
    }
  }

  save(immediateCloud = false) {
    if (this.isReadOnlyMode) {
      this.updateSaveIndicator('👀 관전 모드: 저장 차단됨');
      return;
    }
    try {
      this.data.lastSaved = new Date().toISOString();
      if (this.cloudSession && this.cloudSession.userId) {
        this.data.ownerAccountId = this.cloudSession.userId;
      }
      const serialized = JSON.stringify(this.data);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      // Secondary Mirror Backup (protects against browser clearing single key)
      localStorage.setItem(this.MIRROR_KEY, serialized);
      this.saveToIndexedDB(serialized);
      this.updateSaveIndicator();
      if (this.cloudSession && this.cloudSession.userId) {
        this.scheduleCloudSync(immediateCloud);
      }
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }

  updateSaveIndicator(cloudStatusText = null) {
    if (typeof document === 'undefined') return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const el = document.getElementById('saveStatusIndicator');
    const hdrCloudStatus = document.getElementById('hdrCloudStatus');
    const hdrCloudBtn = document.getElementById('hdrCloudBtn');

    if (this.isReadOnlyMode) {
      if (el) {
        el.innerHTML = `<span style="color:#f59e0b; font-weight:800;">👀 [플레이어 관전 / 보기 전용 모드] ${this.spectatorUserId} (데이터 저장 완전 차단)</span>`;
      }
      if (hdrCloudStatus) {
        hdrCloudStatus.textContent = `👀 ${this.spectatorUserId} (관전)`;
        if (hdrCloudStatus.style) hdrCloudStatus.style.color = '#f59e0b';
      }
      if (hdrCloudBtn && hdrCloudBtn.style) {
        hdrCloudBtn.style.borderColor = 'rgba(245, 158, 11, 0.6)';
        hdrCloudBtn.style.background = 'rgba(245, 158, 11, 0.15)';
      }
      return;
    }

    if (el) {
      if (this.cloudSession && this.cloudSession.userId) {
        el.innerHTML = `🟢 <strong>클라우드 계정 [${this.cloudSession.userId}] 실시간 서버 동기화 중</strong> (${cloudStatusText || '최근: ' + timeStr})`;
      } else {
        el.innerHTML = `🟢 <strong>기기 자동 보존 중</strong> (최근: ${timeStr}) · <span style="color:#38bdf8; cursor:pointer; text-decoration:underline;" onclick="if(typeof ui!=='undefined') ui.openCloudModal();">☁️ 클라우드 로그인 연동하기</span>`;
      }
    }
    if (this.cloudSession && this.cloudSession.userId) {
      if (hdrCloudStatus) {
        hdrCloudStatus.textContent = `🟢 ${this.cloudSession.userId}`;
        if (hdrCloudStatus.style) hdrCloudStatus.style.color = '#34d399';
      }
      if (hdrCloudBtn && hdrCloudBtn.style) {
        hdrCloudBtn.style.borderColor = 'rgba(52, 211, 153, 0.5)';
        hdrCloudBtn.style.background = 'rgba(16, 185, 129, 0.14)';
      }
    } else {
      if (hdrCloudStatus) {
        hdrCloudStatus.textContent = '☁️ 로그인';
        if (hdrCloudStatus.style) hdrCloudStatus.style.color = '#00e5ff';
      }
      if (hdrCloudBtn && hdrCloudBtn.style) {
        hdrCloudBtn.style.borderColor = 'rgba(0, 229, 255, 0.5)';
        hdrCloudBtn.style.background = 'rgba(0, 229, 255, 0.12)';
      }
    }
  }

  // --- Export & Import Features for 100% Data Safety ---
  exportSaveFile() {
    try {
      this.save();
      const jsonStr = JSON.stringify(this.data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `성장형오경호_수련데이터_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (typeof ui !== 'undefined' && ui.showToast) {
        ui.showToast("💾 수련 기록이 JSON 파일로 다운로드되었습니다!", "success");
      }
    } catch (e) {
      alert("백업 파일 생성 중 오류가 발생했습니다: " + e.message);
    }
  }

  importSaveFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && (parsed.player || parsed.STORAGE_KEY)) {
          this.loadFromObject(parsed, true);
          if (typeof ui !== 'undefined') {
            ui.renderAll();
            ui.showToast("🎉 세이브 파일에서 수련 데이터가 완벽하게 복원되었습니다!", "success");
          }
        } else {
          alert("올바르지 않은 세이브 파일 형식입니다.");
        }
      } catch (err) {
        alert("세이브 파일 읽기 실패: 올바른 JSON 파일이 아닙니다.\n" + err.message);
      }
    };
    reader.readAsText(file);
  }

  exportSaveCode() {
    try {
      this.save();
      const jsonStr = JSON.stringify(this.data);
      const code = btoa(encodeURIComponent(jsonStr));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
          if (typeof ui !== 'undefined' && ui.showToast) {
            ui.showToast("📋 세이브 코드가 클립보드에 복사되었습니다! (메모장/카톡 보관)", "success");
          } else {
            alert("세이브 코드가 복사되었습니다!");
          }
        }).catch(() => {
          prompt("아래 세이브 코드를 복사하여 메모장에 안전하게 보관하세요:", code);
        });
      } else {
        prompt("아래 세이브 코드를 복사하여 메모장에 안전하게 보관하세요:", code);
      }
    } catch (e) {
      alert("세이브 코드 생성 오류: " + e.message);
    }
  }

  importSaveCode(codeString) {
    if (!codeString || !codeString.trim()) return false;
    try {
      const jsonStr = decodeURIComponent(atob(codeString.trim()));
      const parsed = JSON.parse(jsonStr);
      if (parsed && (parsed.player || parsed.STORAGE_KEY)) {
        this.loadFromObject(parsed, true);
        if (typeof ui !== 'undefined') {
          ui.renderAll();
          ui.showToast("🎉 세이브 코드로 수련 데이터가 성공적으로 복원되었습니다!", "success");
        }
        return true;
      }
      throw new Error("유효하지 않은 데이터 형식");
    } catch (e) {
      alert("세이브 코드 복원 실패: 올바른 코드가 아닙니다.\n" + e.message);
      return false;
    }
  }

  async importFromCloudKey(inputStr) {
    if (!inputStr || !inputStr.trim()) {
      return { success: false, message: '클라우드 키 또는 백업 코드를 입력해주세요.' };
    }
    const clean = inputStr.trim();

    // 1. Check if it is a base64 save code
    if (clean.length > 30) {
      try {
        const jsonStr = decodeURIComponent(atob(clean));
        const parsed = JSON.parse(jsonStr);
        if (parsed && (parsed.player || parsed.STORAGE_KEY)) {
          this.loadFromObject(parsed, true);
          if (parsed.ownerAccountId) {
            this.saveCloudSession({
              userId: parsed.ownerAccountId,
              password: '',
              bytebinKey: null,
              lastSyncTime: new Date().toISOString()
            });
          }
          if (typeof ui !== 'undefined') {
            ui.renderAll();
            ui.updateAuthGateVisibility();
            ui.showToast("🎉 세이브 코드로 데이터가 100% 복원되었습니다!", "success");
          }
          return { success: true, userId: parsed.ownerAccountId || parsed.player.name };
        }
      } catch (e) {}
    }

    // 2. Otherwise treat as 10-char Bytebin / Pastes cloud key
    try {
      // Try Bytebin
      let fetchedSave = null;
      try {
        const bRes = await fetch(`${this.BYTEBIN_URL}/${clean}`);
        if (bRes.ok) {
          const j = await bRes.json();
          if (j && j.player) fetchedSave = j;
        }
      } catch (e) {}

      // Try Pastes.dev mirror
      if (!fetchedSave) {
        try {
          const pRes = await fetch(`${this.PASTES_URL}/${clean}`);
          if (pRes.ok) {
            const j = await pRes.json();
            if (j && j.player) fetchedSave = j;
          }
        } catch (e) {}
      }

      if (fetchedSave && fetchedSave.player) {
        this.loadFromObject(fetchedSave, true);
        const ownerId = fetchedSave.ownerAccountId || fetchedSave.player.name || '헌터';
        this.saveCloudSession({
          userId: ownerId,
          password: '',
          bytebinKey: clean,
          lastSyncTime: new Date().toISOString()
        });
        if (typeof ui !== 'undefined') {
          ui.renderAll();
          ui.updateAuthGateVisibility();
          ui.showToast(`🎉 클라우드 키 [${clean}] 로 [${ownerId}] 계정 기록이 완벽 복원되었습니다!`, "success");
        }
        return { success: true, userId: ownerId };
      }
      return { success: false, message: '유효한 클라우드 키 또는 백업 코드를 찾을 수 없습니다.' };
    } catch (err) {
      return { success: false, message: '복원 중 네트워크 오류가 발생했습니다: ' + err.message };
    }
  }

  async resetAll(logoutFromCloud = false) {
    const isCloud = Boolean(this.cloudSession && this.cloudSession.userId);
    const userId = isCloud ? this.cloudSession.userId : null;

    // 1. Reset in-memory data to fresh default Lv.1 state
    this.data = this.getDefaultState();
    this.data.resetTimestamp = Date.now();
    this.data.lastSaved = new Date().toISOString();

    if (isCloud && !logoutFromCloud) {
      this.data.player.name = userId;
      this.data.ownerAccountId = userId;
    }

    // 2. Clear IndexedDB completely so no old saves linger
    await this.clearIndexedDB();

    // 3. Clear and re-save fresh state to localStorage & IndexedDB
    const serialized = JSON.stringify(this.data);
    try {
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.MIRROR_KEY, serialized);
    } catch (e) {}
    this.saveToIndexedDB(serialized);

    // 4. If logged into cloud:
    if (isCloud) {
      if (logoutFromCloud) {
        this.saveCloudSession(null);
      } else {
        // Force push the Lv.1 reset state to all cloud endpoints (Bytebin, Pastes, Ntfy)
        try {
          await this.syncToCloud(true);
        } catch (err) {
          console.error("Failed to sync reset state to cloud:", err);
        }
      }
    }

    this.updateSaveIndicator();
    if (typeof ui !== 'undefined' && ui.renderAll) {
      ui.renderAll();
    }
    return true;
  }

  checkDailyReset() {
    if (this.isReadOnlyMode) return;
    const today = getLocalDateString();
    if (this.data.quests.lastActiveDate !== today) {
      const lastDate = new Date(this.data.quests.lastActiveDate + 'T00:00:00');
      const currentDate = new Date(today + 'T00:00:00');
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      // Record yesterday's total completion count in history
      const prevDate = this.data.quests.lastActiveDate;
      const completedCount = Object.keys(this.data.quests.completedToday || {}).length;
      if (!this.data.quests.history) this.data.quests.history = {};
      this.data.quests.history[prevDate] = Math.max(this.data.quests.history[prevDate] || 0, completedCount);

      if (diffDays > 1) {
        // Fill skipped days with 0 in history
        for (let i = 1; i < diffDays; i++) {
          const missedDate = new Date(lastDate);
          missedDate.setDate(missedDate.getDate() + i);
          const y = missedDate.getFullYear();
          const m = String(missedDate.getMonth() + 1).padStart(2, '0');
          const d = String(missedDate.getDate()).padStart(2, '0');
          const missedStr = `${y}-${m}-${d}`;
          if (this.data.quests.history[missedStr] === undefined) {
            this.data.quests.history[missedStr] = 0;
          }
        }
        this.data.quests.dailyStreak = 0;
      } else if (diffDays === 1) {
        const effectiveCount = Math.max(completedCount, this.data.quests.history[prevDate] || 0);
        if (effectiveCount > 0) {
          this.data.quests.dailyStreak += 1;
        } else {
          this.data.quests.dailyStreak = 0;
        }
      }

      this.data.quests.lastActiveDate = today;
      this.data.quests.completedToday = {};
      this.data.quests.progress = {};
      this.data.quests.dailyStreak = this.getDailyStreak();
      this.save();
    }
  }

  getDailyStreak() {
    const todayCompletedCount = Object.keys(this.data.quests.completedToday || {}).length;

    let streak = 0;
    // Current game day cursor (calendar day with midnight 00:00:00 reset)
    const curGameDay = new Date();

    if (todayCompletedCount > 0) {
      // Completed at least 1 quest today: start streak from 1 and count consecutive past days
      streak = 1;
      curGameDay.setDate(curGameDay.getDate() - 1);
      while (true) {
        const y = curGameDay.getFullYear();
        const m = String(curGameDay.getMonth() + 1).padStart(2, '0');
        const day = String(curGameDay.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        if (this.data.quests.history && (this.data.quests.history[dateStr] || 0) > 0) {
          streak += 1;
          curGameDay.setDate(curGameDay.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // No quest completed today yet: check ongoing streak up to yesterday
      curGameDay.setDate(curGameDay.getDate() - 1);
      const y = curGameDay.getFullYear();
      const m = String(curGameDay.getMonth() + 1).padStart(2, '0');
      const day = String(curGameDay.getDate()).padStart(2, '0');
      const yesterdayStr = `${y}-${m}-${day}`;
      if (this.data.quests.history && (this.data.quests.history[yesterdayStr] || 0) > 0) {
        streak = 1;
        curGameDay.setDate(curGameDay.getDate() - 1);
        while (true) {
          const cy = curGameDay.getFullYear();
          const cm = String(curGameDay.getMonth() + 1).padStart(2, '0');
          const cday = String(curGameDay.getDate()).padStart(2, '0');
          const dateStr = `${cy}-${cm}-${cday}`;
          if (this.data.quests.history && (this.data.quests.history[dateStr] || 0) > 0) {
            streak += 1;
            curGameDay.setDate(curGameDay.getDate() - 1);
          } else {
            break;
          }
        }
      } else {
        streak = 0;
      }
    }

    // Safety: if at least 1 quest done today, streak MUST NEVER be 0
    if (todayCompletedCount > 0 && streak === 0) {
      streak = 1;
    }
    return streak;
  }

  // --- Attendance Streak Protection (평생 3회 한정, 재충전 불가) ---

  getStreakProtectionTickets() {
    if (!this.data.quests) return 3;
    const used = Array.isArray(this.data.quests.streakProtectionUsedDates) ? this.data.quests.streakProtectionUsedDates.length : 0;
    if (this.data.quests.streakProtectionTickets !== undefined) {
      return Math.max(0, Math.min(this.data.quests.streakProtectionTickets, 3 - used));
    }
    return Math.max(0, 3 - used);
  }

  getMissedAttendanceDates() {
    if (!this.data.quests) return [];
    const startDateStr = this.data.quests.startDate || getLocalDateString();
    const todayStr = getLocalDateString();
    const history = this.data.quests.history || {};

    const startObj = new Date(startDateStr + 'T00:00:00');
    const todayObj = new Date(todayStr + 'T00:00:00');

    if (isNaN(startObj.getTime()) || startObj >= todayObj) {
      return [];
    }

    const missed = [];
    const cur = new Date(startObj);
    while (cur < todayObj) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;
      const cnt = Number(history[dStr]) || 0;
      if (cnt === 0) {
        missed.push(dStr);
      }
      cur.setDate(cur.getDate() + 1);
    }
    return missed.reverse(); // Most recent missed days first
  }

  useStreakProtection(dateStr) {
    if (this.isReadOnlyMode) {
      return { success: false, message: '관전 모드에서는 보호권을 사용할 수 없습니다.' };
    }
    if (!this.data.quests) {
      return { success: false, message: '퀘스트 데이터가 초기화되지 않았습니다.' };
    }

    const remaining = this.getStreakProtectionTickets();
    if (remaining <= 0) {
      return { success: false, message: '출석 보호권을 이미 모두 소진하였습니다. (계정 평생 3회 한정, 재충전 불가)' };
    }

    const todayStr = getLocalDateString();
    if (!dateStr || dateStr >= todayStr) {
      return { success: false, message: '오늘 이전의 과거 날짜에만 보호권을 사용할 수 있습니다.' };
    }

    if (!this.data.quests.history) this.data.quests.history = {};
    if (!this.data.quests.streakProtectionUsedDates) this.data.quests.streakProtectionUsedDates = [];

    const currCount = Number(this.data.quests.history[dateStr]) || 0;
    if (currCount > 0) {
      return { success: false, message: '해당 날짜는 이미 퀘스트가 완료된 출석일입니다.' };
    }

    // Apply protection
    if (!this.data.quests.streakProtectionUsedDates.includes(dateStr)) {
      this.data.quests.streakProtectionUsedDates.push(dateStr);
    }
    this.data.quests.streakProtectionTickets = Math.max(0, 3 - this.data.quests.streakProtectionUsedDates.length);
    this.data.quests.history[dateStr] = 1;

    // Recalculate streak
    this.data.quests.dailyStreak = this.getDailyStreak();

    // Save and sync immediately to cloud
    this.save(true);
    this.logUserActivity('quest_complete');

    return {
      success: true,
      dateStr,
      remainingTickets: this.data.quests.streakProtectionTickets,
      newStreak: this.data.quests.dailyStreak
    };
  }

  // --- Calculations ---

  getExpRequired(level) {
    // 2~3 Year Long-term daily leveling curve (Polynomial scaling)
    // Lv 1: 180, Lv 15: ~3,900, Lv 25: ~10,400, Lv 50: ~39,000, Lv 80: ~98,000, Lv 100: ~153,000
    // Perfectly matches ~2,000~4,000 EXP earned per day across 730~1,095 days!
    return Math.floor(180 + (level - 1) * 60 + Math.pow(level - 1, 1.95) * 14);
  }

  getRank(level) {
    if (level >= 80) return { name: "국가권력급", color: "#f59e0b", badge: "SSS" };
    if (level >= 60) return { name: "S급 각성자", color: "#ef4444", badge: "S" };
    if (level >= 40) return { name: "A급 각성자", color: "#a855f7", badge: "A" };
    if (level >= 25) return { name: "B급 각성자", color: "#3b82f6", badge: "B" };
    if (level >= 12) return { name: "C급 각성자", color: "#10b981", badge: "C" };
    if (level >= 5)  return { name: "D급 각성자", color: "#06b6d4", badge: "D" };
    return { name: "E급 각성자", color: "#94a3b8", badge: "E" };
  }

  getCurrentHeight() {
    // Realistic height growth:
    // 1,000 Growth Points = 0.1 cm (1.0 mm).
    // Target: 173.00 cm -> 178.00 cm (+5.0 cm total requires 50,000 Growth Points)
    const points = this.data.player.growthPoints;
    const gainedCm = (points / 1000) * 0.1;
    const total = this.data.player.baseHeight + gainedCm;
    // Cap at 178.00 cm or allow small overflow if surpassed
    return Math.min(185.00, parseFloat(total.toFixed(2)));
  }

  getEffectiveStats() {
    const p = this.data.player;
    const base = { ...p.stats };

    let totalStr = base.str;
    let totalInt = base.int;
    let totalEnd = base.end;
    let totalGro = base.gro;
    let bonusAtk = 0;
    let bonusDef = 0;
    let bonusMaxHp = 0;
    let bonusMaxMp = 0;
    let bonusCrit = 0.05;

    // Apply active title bonuses
    const activeTitleMeta = p.activeTitle ? ((typeof getTitleMetadata === 'function' ? getTitleMetadata(p.activeTitle) : null) || (typeof TITLES_DATA !== 'undefined' ? TITLES_DATA[p.activeTitle] : null)) : null;
    if (activeTitleMeta && activeTitleMeta.stats) {
      const tStats = activeTitleMeta.stats;
      if (tStats.str) totalStr += tStats.str;
      if (tStats.int) totalInt += tStats.int;
      if (tStats.end) totalEnd += tStats.end;
      if (tStats.gro) totalGro += tStats.gro;
      if (tStats.atk) bonusAtk += tStats.atk;
      if (tStats.def) bonusDef += tStats.def;
      if (tStats.maxHp) bonusMaxHp += tStats.maxHp;
      if (tStats.crit) bonusCrit += tStats.crit;
    }

    // Apply equipment bonuses
    Object.values(p.equipment).forEach(item => {
      if (!item || !item.stats) return;
      if (item.stats.str) totalStr += item.stats.str;
      if (item.stats.int) totalInt += item.stats.int;
      if (item.stats.end) totalEnd += item.stats.end;
      if (item.stats.gro) totalGro += item.stats.gro;
      if (item.stats.atk) bonusAtk += item.stats.atk;
      if (item.stats.def) bonusDef += item.stats.def;
      if (item.stats.maxHp) bonusMaxHp += item.stats.maxHp;
      if (item.stats.maxMp) bonusMaxMp += item.stats.maxMp;
      if (item.stats.crit) bonusCrit += item.stats.crit;
    });

    const maxHp = 300 + (p.level * 50) + (totalEnd * 25) + bonusMaxHp;
    const maxMp = 120 + (p.level * 20) + (totalInt * 14) + bonusMaxMp;
    const atk = Math.round(25 + (totalStr * 4) + (p.level * 6) + bonusAtk);
    const def = Math.round(8 + (totalEnd * 2.5) + (p.level * 2.5) + bonusDef);

    return {
      str: totalStr,
      int: totalInt,
      end: totalEnd,
      gro: totalGro,
      maxHp,
      maxMp,
      atk,
      def,
      crit: Math.min(0.80, bonusCrit)
    };
  }

  // --- Actions ---

  getActiveTitleMultipliers() {
    const titleName = this.data.player.activeTitle;
    if (!titleName) return { expMultiplier: 1.0, goldMultiplier: 1.0, titleName: '' };
    const meta = (typeof getTitleMetadata === 'function' ? getTitleMetadata(titleName) : null) 
      || (typeof TITLES_DATA !== 'undefined' ? TITLES_DATA[titleName] : null);
    if (!meta) return { expMultiplier: 1.0, goldMultiplier: 1.0, titleName };
    return {
      expMultiplier: meta.expMultiplier || 1.0,
      goldMultiplier: meta.goldMultiplier || 1.0,
      titleName: meta.name || titleName
    };
  }

  addExp(amount) {
    let expToAdd = amount;
    const titleMults = this.getActiveTitleMultipliers();
    const titleExpMult = titleMults.expMultiplier || 1.0;
    expToAdd = Math.round(expToAdd * titleExpMult);

    const effectiveStats = this.getEffectiveStats();
    const groBonusMultiplier = 1 + (effectiveStats.gro * 0.001);
    expToAdd = Math.round(expToAdd * groBonusMultiplier);

    this.data.player.exp += expToAdd;
    let leveledUp = false;
    let levelsGained = 0;

    let required = this.getExpRequired(this.data.player.level);
    while (this.data.player.exp >= required) {
      this.data.player.exp -= required;
      this.data.player.level += 1;
      levelsGained += 1;
      leveledUp = true;
      required = this.getExpRequired(this.data.player.level);
    }
    let levelUpGoldGained = 0;
    if (levelsGained > 0) {
      // Scale level-up gold reward with level to support long-term stat upgrading
      levelUpGoldGained = Math.round(500 + this.data.player.level * 50) * levelsGained;
      this.data.player.gold += levelUpGoldGained;
    }

    this.save();
    if (leveledUp) {
      this.logUserActivity('level_up');
    }
    return {
      leveledUp,
      levelsGained,
      levelUpGoldGained,
      newLevel: this.data.player.level,
      currentExp: this.data.player.exp,
      requiredExp: required,
      expAdded: expToAdd,
      baseExp: amount,
      titleExpMult
    };
  }

  addGrowthPoints(points) {
    this.data.player.growthPoints += points;
    // Check height milestones to unlock titles
    const currentHeight = this.getCurrentHeight();
    if (currentHeight >= 174.0) this.unlockTitle("성장판 해방자 (174cm)");
    if (currentHeight >= 176.0) this.unlockTitle("불굴의 수험생 (176cm)");
    if (currentHeight >= 177.0) this.unlockTitle("골격 파괴의 거인 (177cm)");
    if (currentHeight >= 178.0) this.unlockTitle("178cm 신화의 절대 각성자");

    this.save();
  }

  addGold(amount) {
    const titleMults = this.getActiveTitleMultipliers();
    const titleGoldMult = titleMults.goldMultiplier || 1.0;
    const goldToAdd = Math.round(amount * titleGoldMult);

    this.data.player.gold += goldToAdd;
    this.save();
    if (Math.abs(goldToAdd) >= 500) {
      this.logUserActivity('gold_change');
    }
    return {
      goldAdded: goldToAdd,
      baseGold: amount,
      titleGoldMult
    };
  }

  getStatUpgradeCost(statKey) {
    const cur = (this.data.player.stats && this.data.player.stats[statKey]) || 10;
    const diff = Math.max(0, cur - 10);
    // 2-Year Long-term daily progression curve:
    // Starts at 200 gold, scales smoothly with quadratic & linear factor
    // Level 10: 200g, Level 15: 760g, Level 20: 1,830g, Level 30: 5,280g, Level 50: 17,200g, Level 80: 45,200g
    const base = 200;
    const linear = diff * 50;
    const quadratic = Math.pow(diff, 1.85) * 16;
    return Math.round(base + linear + quadratic);
  }

  upgradeStatWithGold(statKey) {
    if (!this.data.player.stats || this.data.player.stats[statKey] === undefined) {
      return { success: false, reason: 'invalid_stat' };
    }
    const cost = this.getStatUpgradeCost(statKey);
    if (this.data.player.gold < cost) {
      return { success: false, reason: 'insufficient_gold', cost, needed: cost - this.data.player.gold };
    }
    this.data.player.gold -= cost;
    this.data.player.stats[statKey] += 1;
    this.save(true);
    this.logUserActivity('gold_change');
    return { success: true, newStat: this.data.player.stats[statKey], cost, statKey };
  }

  allocateStat(statKey, amount = 1) {
    const res = this.upgradeStatWithGold(statKey);
    return res && res.success;
  }

  equipItem(item) {
    if (!item || !item.slot) return;
    this.data.player.equipment[item.slot] = item;
    this.save(true);
  }

  unequipItem(slot) {
    if (this.data.player.equipment[slot]) {
      this.data.player.equipment[slot] = null;
      this.save(true);
    }
  }

  addToInventory(item) {
    const exists = this.data.player.inventory.some(i => i.id === item.id);
    if (!exists) {
      this.data.player.inventory.push(item);
      this.save(true);
    }
  }

  unlockTitle(titleName) {
    if (!titleName) return false;
    if (!this.data.player.unlockedTitles.includes(titleName)) {
      this.data.player.unlockedTitles.push(titleName);
      this.save(true);
      return true;
    }
    return false;
  }

  checkRetroactiveUnlocks() {
    if (!this.data || !this.data.player) return;
    const completed = this.data.quests.completedToday || {};

    if (completed['height_rope_1000'] || completed['height_rope_2000'] || completed['height_rope_3500']) {
      this.unlockTitle("줄넘기 입문자");
    }
    if (completed['height_rope_3500']) {
      this.unlockTitle("줄넘기 3,500회 극한 달성자");
    }
    if (completed['height_spine_stretch']) {
      this.unlockTitle("자세 교정 수련생");
    }
    if (completed['height_nutrition']) {
      this.unlockTitle("성장 영양 보급자");
    }
    if (completed['height_golden_sleep']) {
      this.unlockTitle("성장 골든타임의 수호자");
    }
    if (completed['detox_shorts_24h']) {
      this.unlockTitle("디톡스 24시간 철인");
    }

    const currentHeight = this.getCurrentHeight();
    if (currentHeight >= 174.0) this.unlockTitle("성장판 해방자 (174cm)");
    if (currentHeight >= 176.0) this.unlockTitle("불굴의 수험생 (176cm)");
    if (currentHeight >= 177.0) this.unlockTitle("골격 파괴의 거인 (177cm)");
    if (currentHeight >= 178.0) this.unlockTitle("178cm 신화의 절대 각성자");
  }

  setActiveTitle(titleName) {
    if (this.data.player.unlockedTitles.includes(titleName)) {
      this.data.player.activeTitle = titleName;
      this.save(true);
    }
  }

  completeQuest(questId) {
    const allQuests = [...INITIAL_QUESTS, ...this.data.quests.customQuests];
    const quest = allQuests.find(q => q.id === questId);
    if (!quest) return null;

    if (this.data.quests.completedToday[questId]) {
      return { alreadyCompleted: true };
    }

    this.data.quests.completedToday[questId] = true;
    const today = getLocalDateString();
    if (!this.data.quests.history) this.data.quests.history = {};
    this.data.quests.history[today] = Object.keys(this.data.quests.completedToday).length;

    // Maintain cumulative quest completions count
    if (!this.data.quests.completionCounts) this.data.quests.completionCounts = {};
    this.data.quests.completionCounts[questId] = (this.data.quests.completionCounts[questId] || 0) + 1;

    // Check title unlocks from quests
    const newlyUnlockedTitles = [];
    const checkAndUnlock = (title) => {
      if (this.unlockTitle(title)) {
        newlyUnlockedTitles.push(title);
      }
    };

    // 1. Jump rope quests -> 줄넘기 입문자 & 줄넘기 3,500회 극한 달성자
    if (questId === 'height_rope_1000' || questId === 'height_rope_2000' || questId === 'height_rope_3500') {
      checkAndUnlock("줄넘기 입문자");
    }
    if (questId === 'height_rope_3500') {
      checkAndUnlock("줄넘기 3,500회 극한 달성자");
    }
    // 2. Spine stretch -> 자세 교정 수련생 & 척추 기립의 대천사 (20회)
    if (questId === 'height_spine_stretch') {
      checkAndUnlock("자세 교정 수련생");
      if ((this.data.quests.completionCounts['height_spine_stretch'] || 0) >= 20) {
        checkAndUnlock("척추 기립의 대천사");
      }
    }
    // 3. Nutrition -> 성장 영양 보급자
    if (questId === 'height_nutrition') {
      checkAndUnlock("성장 영양 보급자");
    }
    // 4. Sleep -> 성장 골든타임의 수호자
    if (questId === 'height_golden_sleep') {
      checkAndUnlock("성장 골든타임의 수호자");
    }
    // 5. Detox -> 디톡스 24시간 철인 & 도파민의 종결자 (누적 15회)
    if (questId === 'detox_shorts_24h') {
      checkAndUnlock("디톡스 24시간 철인");
    }
    const totalDetox = Object.keys(this.data.quests.completionCounts || {})
      .filter(id => id.startsWith('detox_'))
      .reduce((sum, id) => sum + (this.data.quests.completionCounts[id] || 0), 0);
    if (totalDetox >= 15) {
      checkAndUnlock("도파민의 종결자");
    }

    // Immediately recalculate streak on every quest completion
    this.data.quests.dailyStreak = this.getDailyStreak();

    const expResult = this.addExp(quest.exp);
    const goldResult = this.addGold(quest.gold);
    if (quest.growthPoints) {
      this.addGrowthPoints(quest.growthPoints);
    }

    this.save(true);
    this.logUserActivity('quest_complete');
    return {
      quest,
      expResult,
      goldResult,
      gold: goldResult ? goldResult.goldAdded : quest.gold,
      growthPoints: quest.growthPoints || 0,
      newlyUnlockedTitles,
      titleMultipliers: this.getActiveTitleMultipliers()
    };
  }

  recordBossClear(bossId) {
    const boss = BOSSES_DATA.find(b => b.id === bossId);
    if (!boss) return null;

    const isFirstClear = !this.data.raid.clearedStages.includes(boss.stage);
    if (isFirstClear) {
      this.data.raid.clearedStages.push(boss.stage);
      if (this.data.raid.unlockedStage <= boss.stage && boss.stage < BOSSES_DATA.length) {
        this.data.raid.unlockedStage = boss.stage + 1;
      }
    }

    this.data.raid.clearCounts[bossId] = (this.data.raid.clearCounts[bossId] || 0) + 1;

    // Grants rewards:
    // First Clear: 100% full EXP, Gold, Growth Points, Item, Title!
    // Repeat Clear: 25% Training EXP & Gold for practice, 0 Growth Points (Real-life height requires real-life daily habit completion!)
    let awardedExp = boss.rewards.exp;
    let awardedGold = boss.rewards.gold;
    let awardedGrowth = boss.rewards.growthPoints;

    if (!isFirstClear) {
      awardedExp = Math.max(30, Math.round(boss.rewards.exp * 0.25));
      awardedGold = Math.max(20, Math.round(boss.rewards.gold * 0.25));
      awardedGrowth = 0; // Growth Points awarded strictly on first milestone breakthrough!
    }

    const expResult = this.addExp(awardedExp);
    const goldResult = this.addGold(awardedGold);
    if (awardedGrowth > 0) {
      this.addGrowthPoints(awardedGrowth);
    }
    this.addToInventory(boss.rewards.item);
    this.unlockTitle(boss.rewards.title);

    this.save(true);
    this.logUserActivity('boss_defeat');
    return {
      boss,
      isFirstClear,
      expResult,
      goldResult,
      awardedGrowth,
      rewards: {
        ...boss.rewards,
        exp: awardedExp,
        gold: awardedGold,
        growthPoints: awardedGrowth
      },
      titleMultipliers: this.getActiveTitleMultipliers()
    };
  }

  addCustomQuest(questData) {
    const parsedExp = parseInt(questData.exp);
    const parsedGold = parseInt(questData.gold);
    const parsedGrowth = parseInt(questData.growthPoints);

    const newQuest = {
      id: "custom_" + Date.now(),
      title: (questData.title || '').trim(),
      description: (questData.description || "사용자 지정 각성 퀘스트").trim(),
      category: questData.category || "height",
      categoryName: questData.categoryName || "신체 & 키 성장",
      tier: questData.tier || "B",
      exp: !isNaN(parsedExp) ? Math.min(2500, Math.max(1, parsedExp)) : 300,
      gold: !isNaN(parsedGold) ? Math.min(2500, Math.max(0, parsedGold)) : 100,
      growthPoints: !isNaN(parsedGrowth) ? Math.min(30, Math.max(1, parsedGrowth)) : 10,
      type: questData.type || "check",
      targetCount: questData.targetCount ? parseInt(questData.targetCount) : null,
      targetSeconds: questData.targetSeconds ? parseInt(questData.targetSeconds) : null,
      unit: questData.unit || "회",
      icon: questData.icon || "star"
    };

    if (!this.data.quests.customQuests) this.data.quests.customQuests = [];
    this.data.quests.customQuests.push(newQuest);
    this.save(true);
    return newQuest;
  }

  updateCustomQuest(questId, updatedData) {
    if (!questId || !this.data.quests || !this.data.quests.customQuests) return null;
    const idx = this.data.quests.customQuests.findIndex(q => q.id === questId);
    if (idx === -1) return null;

    const existing = this.data.quests.customQuests[idx];
    const parsedExp = parseInt(updatedData.exp);
    const parsedGold = parseInt(updatedData.gold);
    const parsedGrowth = parseInt(updatedData.growthPoints);

    const updated = {
      ...existing,
      title: (updatedData.title !== undefined ? updatedData.title : existing.title).trim(),
      description: (updatedData.description !== undefined ? updatedData.description : existing.description).trim(),
      category: updatedData.category || existing.category,
      categoryName: updatedData.categoryName || existing.categoryName,
      tier: updatedData.tier || existing.tier,
      exp: !isNaN(parsedExp) ? Math.min(2500, Math.max(1, parsedExp)) : (existing.exp || 300),
      gold: !isNaN(parsedGold) ? Math.min(2500, Math.max(0, parsedGold)) : (existing.gold !== undefined ? existing.gold : 100),
      growthPoints: !isNaN(parsedGrowth) ? Math.min(30, Math.max(1, parsedGrowth)) : (existing.growthPoints || 10),
      type: updatedData.type || existing.type,
      targetCount: updatedData.targetCount ? parseInt(updatedData.targetCount) : null,
      targetSeconds: updatedData.targetSeconds ? parseInt(updatedData.targetSeconds) : null,
      unit: updatedData.unit || existing.unit || "회",
      icon: updatedData.icon || existing.icon || "star"
    };

    this.data.quests.customQuests[idx] = updated;
    this.save(true);
    return updated;
  }

  deleteQuest(questId) {
    if (!questId) return false;

    // Filter out if it was a custom quest
    if (this.data.quests.customQuests) {
      this.data.quests.customQuests = this.data.quests.customQuests.filter(q => q.id !== questId);
    }

    // Add to deletedQuestIds
    if (!this.data.quests.deletedQuestIds) {
      this.data.quests.deletedQuestIds = [];
    }
    if (!this.data.quests.deletedQuestIds.includes(questId)) {
      this.data.quests.deletedQuestIds.push(questId);
    }

    // Clean up daily tracking if active
    if (this.data.quests.completedToday && this.data.quests.completedToday[questId]) {
      delete this.data.quests.completedToday[questId];
    }
    if (this.data.quests.progress && this.data.quests.progress[questId]) {
      delete this.data.quests.progress[questId];
    }

    // Clean up from folders
    if (this.data.quests.folders) {
      this.data.quests.folders.forEach(f => {
        if (f.questIds) f.questIds = f.questIds.filter(id => id !== questId);
      });
    }

    // Clean up from dayQuests
    if (this.data.quests.dayQuests) {
      Object.keys(this.data.quests.dayQuests).forEach(day => {
        this.data.quests.dayQuests[day] = this.data.quests.dayQuests[day].filter(id => id !== questId);
      });
    }

    this.save();
    return true;
  }

  // --- Folder Management Methods ---
  createQuestFolder(folderName) {
    if (!folderName || !folderName.trim()) return null;
    if (!this.data.quests.folders) this.data.quests.folders = [];
    const newFolder = {
      id: 'folder_' + Date.now(),
      name: folderName.trim(),
      questIds: []
    };
    this.data.quests.folders.push(newFolder);
    this.save();
    return newFolder;
  }

  deleteQuestFolder(folderId) {
    if (!this.data.quests.folders) return;
    this.data.quests.folders = this.data.quests.folders.filter(f => f.id !== folderId);
    this.save();
  }

  updateFolderQuests(folderId, questIds) {
    if (!this.data.quests.folders) return;
    const folder = this.data.quests.folders.find(f => f.id === folderId);
    if (folder) {
      folder.questIds = Array.isArray(questIds) ? [...questIds] : [];
      this.save();
    }
  }

  // --- Day-of-Week Quest Management Methods ---
  updateDayQuests(dayKey, questIds) {
    if (!this.data.quests.dayQuests) this.data.quests.dayQuests = {};
    this.data.quests.dayQuests[dayKey] = Array.isArray(questIds) ? [...questIds] : [];
    this.save();
  }

  removeQuestFromDay(dayKey, questId) {
    if (!this.data.quests.dayQuests || !this.data.quests.dayQuests[dayKey]) return;
    this.data.quests.dayQuests[dayKey] = this.data.quests.dayQuests[dayKey].filter(id => id !== questId);
    this.save();
  }

  // =========================================================================
  // ☁️ CLOUD LOGIN & MULTI-DEVICE SYNC ENGINE (아이디/비밀번호 서버 영구 연동)
  // =========================================================================

  loadCloudSession() {
    if (this.isReadOnlyMode) {
      return { userId: this.spectatorUserId || '유저', isReadOnly: true };
    }
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.CLOUD_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  saveCloudSession(session) {
    if (this.isReadOnlyMode) {
      this.cloudSession = session;
      return;
    }
    this.cloudSession = session;
    try {
      if (typeof localStorage !== 'undefined') {
        if (session) {
          localStorage.setItem(this.CLOUD_SESSION_KEY, JSON.stringify(session));
        } else {
          localStorage.removeItem(this.CLOUD_SESSION_KEY);
        }
      }
      if (typeof indexedDB !== 'undefined') {
        const req = indexedDB.open('AwakenedHunterDB', 1);
        req.onsuccess = (e) => {
          try {
            const db = e.target.result;
            if (db.objectStoreNames.contains('saves')) {
              const tx = db.transaction('saves', 'readwrite');
              const store = tx.objectStore('saves');
              if (session) {
                store.put(JSON.stringify(session), this.CLOUD_SESSION_KEY);
              } else {
                store.delete(this.CLOUD_SESSION_KEY);
              }
            }
          } catch (err) {}
        };
      }
    } catch (e) {
      console.error("Failed to save cloud session:", e);
    }
  }

  async clearIndexedDB() {
    return new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') return resolve(false);
        const req = indexedDB.open('AwakenedHunterDB', 1);
        req.onerror = () => resolve(false);
        req.onsuccess = (e) => {
          try {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('saves')) return resolve(true);
            const tx = db.transaction('saves', 'readwrite');
            const store = tx.objectStore('saves');
            const clearReq = store.clear();
            clearReq.onsuccess = () => resolve(true);
            clearReq.onerror = () => resolve(false);
          } catch (err) {
            resolve(false);
          }
        };
      } catch (e) {
        resolve(false);
      }
    });
  }

  saveToIndexedDB(serialized) {
    try {
      if (typeof indexedDB === 'undefined') return;
      const req = indexedDB.open('AwakenedHunterDB', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('saves')) {
          db.createObjectStore('saves');
        }
      };
      req.onsuccess = (e) => {
        try {
          const db = e.target.result;
          const tx = db.transaction('saves', 'readwrite');
          const store = tx.objectStore('saves');
          store.put(serialized, this.STORAGE_KEY);
          if (this.cloudSession) {
            store.put(JSON.stringify(this.cloudSession), this.CLOUD_SESSION_KEY);
          } else {
            store.delete(this.CLOUD_SESSION_KEY);
          }
        } catch (err) {}
      };
    } catch (e) {
      // Ignore IndexedDB errors in restricted webviews
    }
  }

  async logUserActivity(action = 'play') {
    if (this.isReadOnlyMode || this._accountDeleted) return;
    if (!this.cloudSession || !this.cloudSession.userId) return;

    // Only allow meaningful actions: 사이트 들어왔을 때, 골드, 레벨, 퀘스트 진행, 보스 처치
    const validActions = ['connect', 'login', 'register', 'quest_complete', 'boss_defeat', 'level_up', 'gold_change'];
    if (!validActions.includes(action)) return;

    try {
      const userId = this.cloudSession.userId;
      const hexId = this.userIdToHex(userId);
      const now = Date.now();

      if (this._lastActivityAction === action && this._lastActivityTime && (now - this._lastActivityTime < 4000)) {
        return;
      }
      this._lastActivityAction = action;
      this._lastActivityTime = now;

      // Maintain persistent activityLog in save
      if (!Array.isArray(this.data.activityLog)) this.data.activityLog = [];
      const currentLog = {
        ts: now,
        act: action,
        lv: (this.data.player && this.data.player.level) || 1,
        gold: (this.data.player && this.data.player.gold) || 0,
        bossCleared: (this.data.raid && Array.isArray(this.data.raid.clearedStages)) ? [...this.data.raid.clearedStages] : [],
        questsDone: Object.keys((this.data.quests && this.data.quests.completedToday) || {}).length,
        date: getLocalDateString()
      };
      const lastEntry = this.data.activityLog[this.data.activityLog.length - 1];
      const hasProgress = !lastEntry ||
        (currentLog.lv !== lastEntry.lv) ||
        (currentLog.gold !== lastEntry.gold) ||
        (currentLog.bossCleared.length !== lastEntry.bossCleared.length) ||
        (currentLog.questsDone !== lastEntry.questsDone) ||
        (action === 'quest_complete' || action === 'boss_defeat' || action === 'level_up') ||
        (action === 'connect' && (now - lastEntry.ts > 15 * 60 * 1000));

      if (hasProgress) {
        this.data.activityLog.push(currentLog);
        if (this.data.activityLog.length > 100) {
          this.data.activityLog.splice(0, this.data.activityLog.length - 100);
        }
      }

      const payload = JSON.stringify({
        u: userId,
        act: action,
        bk: (this.cloudSession && this.cloudSession.bytebinKey) || null,
        pk: (this.cloudSession && this.cloudSession.pastesKey) || null,
        d: this.data,
        ts: now
      });

      const userTopics = [
        `https://ntfy.adminforge.de/okh_gh_cloud_u_${hexId}`,
        `https://ntfy.tedomum.fr/okh_gh_cloud_u_${hexId}`,
        `https://ntfy.sh/okh_gh_cloud_v4_u_${hexId}`
      ];

      Promise.allSettled(userTopics.map(u =>
        fetch(u, {
          method: 'POST',
          body: payload,
          keepalive: true
        })
      )).catch(() => {});
    } catch (e) {}
  }

  initCloudSyncOnStartup() {
    if (typeof window === 'undefined' || this.isReadOnlyMode) return;
    // Run after brief paint tick to immediately pull the freshest cloud save
    setTimeout(async () => {
      this.updateSaveIndicator();
      if (this.cloudSession && this.cloudSession.userId) {
        await this.pullFromCloud(true, false, true);
        this.logUserActivity('connect');
      } else {
        // Check IndexedDB if localStorage was wiped by mobile browser on power reboot
        this.recoverFromIndexedDBIfNeeded();
      }
    }, 120);
  }

  recoverFromIndexedDBIfNeeded() {
    try {
      if (typeof indexedDB === 'undefined') return;
      if (this.getProgressionScore(this.data) > 0 && this.cloudSession) return;
      const req = indexedDB.open('AwakenedHunterDB', 1);
      req.onsuccess = (e) => {
        try {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('saves')) return;
          const tx = db.transaction('saves', 'readonly');
          const store = tx.objectStore('saves');
          const getSave = store.get(this.STORAGE_KEY);
          getSave.onsuccess = () => {
            if (getSave.result) {
              try {
                const parsed = JSON.parse(getSave.result);
                const localReset = Number(this.data && this.data.resetTimestamp) || 0;
                const parsedTime = parsed.lastSaved ? new Date(parsed.lastSaved).getTime() : 0;
                if (localReset > 0 && localReset >= parsedTime) {
                  return; // Do not recover pre-reset historical data!
                }
                if (this.getProgressionScore(parsed) > this.getProgressionScore(this.data)) {
                  this.loadFromObject(parsed, true);
                  if (typeof ui !== 'undefined') ui.renderAll();
                }
              } catch (err) {}
            }
          };
          const getSess = store.get(this.CLOUD_SESSION_KEY);
          getSess.onsuccess = () => {
            if (getSess.result && !this.cloudSession) {
              try {
                const sess = JSON.parse(getSess.result);
                if (sess && sess.userId) {
                  // Admin guard: Never auto-resurrect admin session if admin logged-in flag is not explicitly active
                  if (String(sess.userId).trim().toLowerCase() === 'admin') {
                    const isAdmin = (typeof localStorage !== 'undefined' && (localStorage.getItem('isAdminLoggedIn') === 'true' || localStorage.getItem('admin_master_session') === 'true'));
                    if (!isAdmin) {
                      try {
                        const delTx = db.transaction('saves', 'readwrite');
                        delTx.objectStore('saves').delete(this.CLOUD_SESSION_KEY);
                      } catch(e) {}
                      return;
                    }
                  }
                  this.saveCloudSession(sess);
                  this.pullFromCloud(true, false, true);
                }
              } catch (err) {}
            }
          };
        } catch (err) {}
      };
    } catch (e) {}
  }

  scheduleCloudSync(immediate = false) {
    if (!this.cloudSession || !this.cloudSession.userId) return;
    if (this._cloudSyncTimer) {
      clearTimeout(this._cloudSyncTimer);
      this._cloudSyncTimer = null;
    }
    if (immediate) {
      this.syncToCloud(true);
    } else {
      this._cloudSyncTimer = setTimeout(() => {
        this.syncToCloud(false);
      }, 500);
    }
  }

  userIdToHex(userId) {
    const clean = String(userId || '').trim().toLowerCase();
    let hex = '';
    for (let i = 0; i < clean.length; i++) {
      hex += clean.charCodeAt(i).toString(16);
    }
    return hex.slice(0, 32) || 'default';
  }

  getProgressionScore(d) {
    if (!d || !d.player) return 0;
    const p = d.player;
    const stats = p.stats || {};
    const statSum = (stats.str || 14) + (stats.int || 12) + (stats.end || 14) + (stats.gro || 15);
    const qCount = Object.keys((d.quests && d.quests.completedToday) || {}).length;
    const hCount = Object.values((d.quests && d.quests.history) || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const cCount = (d.raid && d.raid.clearedStages && d.raid.clearedStages.length) || 0;
    const tCount = (p.unlockedTitles && p.unlockedTitles.length) || 1;
    return (
      (Math.max(1, p.level || 1) - 1) * 10000 +
      (p.exp || 0) * 2 +
      (p.growthPoints || 0) * 5 +
      Math.max(0, statSum - 55) * 500 +
      qCount * 300 +
      hCount * 200 +
      cCount * 2000 +
      Math.max(0, tCount - 1) * 400
    );
  }

  mergeSaveData(localData, cloudData) {
    if (!cloudData || !cloudData.player) return JSON.parse(JSON.stringify(localData));
    if (!localData || !localData.player) return JSON.parse(JSON.stringify(cloudData));

    const localReset = Number(localData.resetTimestamp) || 0;
    const cloudReset = Number(cloudData.resetTimestamp) || 0;
    const localTime = localData.lastSaved ? new Date(localData.lastSaved).getTime() : 0;
    const cloudTime = cloudData.lastSaved ? new Date(cloudData.lastSaved).getTime() : 0;

    // 1. If local was intentionally reset after cloud save was created, LOCAL RESET WINS 100%!
    if (localReset > 0 && localReset >= cloudTime && localReset > cloudReset) {
      return JSON.parse(JSON.stringify(localData));
    }

    // 2. If cloud was intentionally reset after local save was created, CLOUD RESET WINS 100%!
    if (cloudReset > 0 && cloudReset >= localTime && cloudReset > localReset) {
      return JSON.parse(JSON.stringify(cloudData));
    }

    const localScore = this.getProgressionScore(localData);
    const cloudScore = this.getProgressionScore(cloudData);

    // If local is a brand new untouched state (e.g. opening Safari for the first time), use cloudData 100%
    if (localScore === 0 && cloudScore > 0 && localReset === 0) {
      return JSON.parse(JSON.stringify(cloudData));
    }
    // If cloud is brand new and local has pre-login progress, use localData 100%
    if (cloudScore === 0 && localScore > 0 && cloudReset === 0) {
      return JSON.parse(JSON.stringify(localData));
    }

    const lp = localData.player || {};
    const cp = cloudData.player || {};

    // Timestamp authority:
    // If local was saved at the same time or more recently than cloud (active play on this device), localData is authoritative!
    const isLocalNewerOrEqual = localTime >= cloudTime;
    let primary = isLocalNewerOrEqual ? localData : cloudData;
    let secondary = isLocalNewerOrEqual ? cloudData : localData;

    if (!isLocalNewerOrEqual && cloudTime > localTime && cloudScore > localScore) {
      primary = cloudData;
      secondary = localData;
    } else if (localScore > cloudScore) {
      primary = localData;
      secondary = cloudData;
    }

    const merged = JSON.parse(JSON.stringify(primary));

    // Player Gold preservation:
    // When playing on this device (isLocalNewerOrEqual), local gold MUST be preserved!
    // Never Math.max because spending gold on stats/shop would be reverted!
    if (isLocalNewerOrEqual) {
      merged.player.gold = lp.gold !== undefined ? lp.gold : 500;
    } else {
      merged.player.gold = cp.gold !== undefined ? cp.gold : (lp.gold !== undefined ? lp.gold : 500);
    }

    // Preserve highest level & exp
    if ((lp.level || 1) > (cp.level || 1)) {
      merged.player.level = lp.level;
      merged.player.exp = lp.exp;
    } else if ((cp.level || 1) > (lp.level || 1)) {
      merged.player.level = cp.level;
      merged.player.exp = cp.exp;
    } else {
      merged.player.level = isLocalNewerOrEqual ? (lp.level || 1) : (cp.level || 1);
      merged.player.exp = isLocalNewerOrEqual ? (lp.exp || 0) : Math.max(lp.exp || 0, cp.exp || 0);
    }

    // Preserve highest growth points & stats
    if (isLocalNewerOrEqual) {
      merged.player.growthPoints = lp.growthPoints !== undefined ? lp.growthPoints : (cp.growthPoints || 0);
      merged.player.stats = {
        str: Math.max((lp.stats && lp.stats.str) || 14, (cp.stats && cp.stats.str) || 14),
        int: Math.max((lp.stats && lp.stats.int) || 12, (cp.stats && cp.stats.int) || 12),
        end: Math.max((lp.stats && lp.stats.end) || 14, (cp.stats && cp.stats.end) || 14),
        gro: Math.max((lp.stats && lp.stats.gro) || 15, (cp.stats && cp.stats.gro) || 15)
      };
    } else {
      merged.player.growthPoints = Math.max(lp.growthPoints || 0, cp.growthPoints || 0);
      ['str', 'int', 'end', 'gro'].forEach(k => {
        merged.player.stats[k] = Math.max(
          (lp.stats && lp.stats[k]) || 14,
          (cp.stats && cp.stats[k]) || 14
        );
      });
    }

    // Union of unlockedTitles
    const titleSet = new Set([
      ...(cp.unlockedTitles || ["초보 수련자 (173cm)"]),
      ...(lp.unlockedTitles || ["초보 수련자 (173cm)"])
    ]);
    merged.player.unlockedTitles = Array.from(titleSet);

    // Active title
    if (isLocalNewerOrEqual && lp.activeTitle && merged.player.unlockedTitles.includes(lp.activeTitle)) {
      merged.player.activeTitle = lp.activeTitle;
    } else if (cp.activeTitle && merged.player.unlockedTitles.includes(cp.activeTitle)) {
      merged.player.activeTitle = cp.activeTitle;
    } else {
      merged.player.activeTitle = "초보 수련자 (173cm)";
    }

    // Player Hero Card
    if (isLocalNewerOrEqual) {
      merged.player.cardId = (lp && lp.cardId) || (cp && cp.cardId) || 'card_default';
    } else {
      merged.player.cardId = (cp && cp.cardId) || (lp && lp.cardId) || 'card_default';
    }
    merged.player.avatar = this.getPlayerCard(merged.player.cardId).image;

    // Union of inventory items (by id, keeping higher enhance level)
    const invMap = new Map();
    [...(cp.inventory || []), ...(lp.inventory || [])].forEach(item => {
      if (item && item.id) {
        const existing = invMap.get(item.id);
        if (!existing || (item.enhanceLevel || 0) > (existing.enhanceLevel || 0)) {
          invMap.set(item.id, item);
        }
      }
    });
    merged.player.inventory = Array.from(invMap.values());

    // Equipment: smartly equip the best item between local and cloud for each slot
    ['weapon', 'armor', 'shoes', 'ring', 'aura'].forEach(slot => {
      const le = lp.equipment && lp.equipment[slot];
      const ce = cp.equipment && cp.equipment[slot];
      if (isLocalNewerOrEqual) {
        merged.player.equipment[slot] = le !== undefined ? le : ce;
      } else {
        merged.player.equipment[slot] = ce !== undefined ? ce : le;
      }
    });

    // Quests: union of today's completed quests if on the same active date
    const today = getLocalDateString();
    const lCompleted = (localData.quests && localData.quests.lastActiveDate === today) ? (localData.quests.completedToday || {}) : {};
    const cCompleted = (cloudData.quests && cloudData.quests.lastActiveDate === today) ? (cloudData.quests.completedToday || {}) : {};
    merged.quests.lastActiveDate = today;
    merged.quests.completedToday = { ...cCompleted, ...lCompleted };

    // Daily streak max
    merged.quests.dailyStreak = Math.max(
      (localData.quests && localData.quests.dailyStreak) || 1,
      (cloudData.quests && cloudData.quests.dailyStreak) || 1
    );

    // Union of quest history (max count per day)
    merged.quests.history = { ...((cloudData.quests && cloudData.quests.history) || {}) };
    Object.entries((localData.quests && localData.quests.history) || {}).forEach(([dateKey, cnt]) => {
      merged.quests.history[dateKey] = Math.max(merged.quests.history[dateKey] || 0, cnt || 0);
    });
    merged.quests.history[today] = Object.keys(merged.quests.completedToday).length;

    // Union of completionCounts
    merged.quests.completionCounts = { ...((cloudData.quests && cloudData.quests.completionCounts) || {}) };
    Object.entries((localData.quests && localData.quests.completionCounts) || {}).forEach(([qId, cnt]) => {
      merged.quests.completionCounts[qId] = Math.max(merged.quests.completionCounts[qId] || 0, cnt || 0);
    });

    // Union of customQuests
    const cqMap = new Map();
    [
      ...((cloudData.quests && cloudData.quests.customQuests) || []),
      ...((localData.quests && localData.quests.customQuests) || [])
    ].forEach(q => {
      if (q && q.id) cqMap.set(q.id, q);
    });
    merged.quests.customQuests = Array.from(cqMap.values());

    // Streak protection: lifetime 3 uses, union of used dates across all devices
    const lUsed = (localData.quests && Array.isArray(localData.quests.streakProtectionUsedDates)) ? localData.quests.streakProtectionUsedDates : [];
    const cUsed = (cloudData.quests && Array.isArray(cloudData.quests.streakProtectionUsedDates)) ? cloudData.quests.streakProtectionUsedDates : [];
    const mergedUsed = Array.from(new Set([...lUsed, ...cUsed]));
    merged.quests.streakProtectionUsedDates = mergedUsed;
    merged.quests.streakProtectionTickets = Math.max(0, 3 - mergedUsed.length);

    // Raid progression union
    const lRaid = localData.raid || {};
    const cRaid = cloudData.raid || {};
    merged.raid.unlockedStage = Math.max(lRaid.unlockedStage || 1, cRaid.unlockedStage || 1);
    merged.raid.clearedStages = Array.from(new Set([
      ...(cRaid.clearedStages || []),
      ...(lRaid.clearedStages || [])
    ])).sort((a, b) => a - b);

    // Raid clearCounts union
    const allStageKeys = new Set([
      ...Object.keys(lRaid.clearCounts || {}),
      ...Object.keys(cRaid.clearCounts || {})
    ]);
    merged.raid.clearCounts = {};
    allStageKeys.forEach(k => {
      merged.raid.clearCounts[k] = Math.max(
        (lRaid.clearCounts && lRaid.clearCounts[k]) || 0,
        (cRaid.clearCounts && cRaid.clearCounts[k]) || 0
      );
    });

    // Activity log union
    const logMap = new Map();
    [...(cloudData.activityLog || []), ...(localData.activityLog || [])].forEach(entry => {
      if (entry && entry.ts) {
        logMap.set(entry.ts, entry);
      }
    });
    merged.activityLog = Array.from(logMap.values()).sort((a, b) => a.ts - b.ts).slice(-100);

    return merged;
  }

  packSaveData(d) {
    const p = d.player || {};
    const s = p.stats || {};
    const q = d.quests || {};
    const r = d.raid || {};
    const allTitleKeys = typeof TITLES_DATA !== 'undefined' ? Object.keys(TITLES_DATA) : [];
    const titleIndices = (p.unlockedTitles || []).map(t => {
      const idx = allTitleKeys.indexOf(t);
      return idx >= 0 ? idx : t;
    });

    const itemToCode = (it) => {
      if (!it || !it.id) return null;
      if (it.id === 'item_omega_sword') return 100;
      const m = String(it.id).match(/item_stage_(\d+)/);
      return m ? parseInt(m[1], 10) : null;
    };

    const eq = p.equipment || {};
    const eqArr = [
      itemToCode(eq.weapon),
      itemToCode(eq.armor),
      itemToCode(eq.shoes),
      itemToCode(eq.ring),
      itemToCode(eq.aura)
    ];

    const invArr = (p.inventory || []).map(itemToCode).filter(Boolean);
    const questKeys = typeof INITIAL_QUESTS !== 'undefined' ? INITIAL_QUESTS.map(iq => iq.id) : [];
    const doneToday = Object.keys(q.completedToday || {}).filter(k => q.completedToday[k]).map(k => {
      const idx = questKeys.indexOf(k);
      return idx >= 0 ? idx : k;
    });

    const histEntries = Object.entries(q.history || {}).slice(-14);
    const histCompact = {};
    histEntries.forEach(([k, v]) => { if (v > 0) histCompact[k.slice(5)] = v; });

    const activeIdx = allTitleKeys.indexOf(p.activeTitle);

    return {
      p: [
        p.name || '헌터',
        p.level || 1,
        p.exp || 0,
        p.gold !== undefined ? p.gold : 500,
        p.baseHeight || 173,
        p.targetHeight || 178,
        p.growthPoints || 0,
        [s.str || 14, s.int || 12, s.end || 14, s.gro || 15],
        activeIdx >= 0 ? activeIdx : (p.activeTitle || 0)
      ],
      t: titleIndices,
      e: eqArr,
      i: invArr,
      q: [
        q.dailyStreak || 1,
        q.startDate || getLocalDateString(),
        q.lastActiveDate || getLocalDateString(),
        doneToday,
        histCompact
      ],
      r: [
        r.unlockedStage || 1,
        (r.clearedStages || []).filter(st => st <= 50).length > 0
          ? Math.max(...(r.clearedStages || []).filter(st => st <= 50))
          : 0,
        (r.clearedStages || []).includes(100) ? 1 : 0
      ],
      u: d.lastSaved || new Date().toISOString()
    };
  }

  unpackSaveData(packed) {
    if (!packed || !Array.isArray(packed.p)) return null;
    const def = this.getDefaultState();
    const allTitleKeys = typeof TITLES_DATA !== 'undefined' ? Object.keys(TITLES_DATA) : [];
    const questKeys = typeof INITIAL_QUESTS !== 'undefined' ? INITIAL_QUESTS.map(iq => iq.id) : [];

    const codeToItem = (code) => {
      if (!code) return null;
      if (code === 100 && typeof SECRET_FINAL_BOSS !== 'undefined') {
        return JSON.parse(JSON.stringify(SECRET_FINAL_BOSS.rewards.item));
      }
      if (typeof BOSSES_DATA !== 'undefined' && BOSSES_DATA[code - 1] && BOSSES_DATA[code - 1].rewards) {
        return JSON.parse(JSON.stringify(BOSSES_DATA[code - 1].rewards.item));
      }
      return null;
    };

    const [name, level, exp, gold, baseHeight, targetHeight, growthPoints, statsArr, activeTitleCode] = packed.p;
    def.player.name = name || '헌터';
    def.player.level = level || 1;
    def.player.exp = exp || 0;
    def.player.gold = gold !== undefined ? gold : 500;
    def.player.baseHeight = baseHeight || 173;
    def.player.targetHeight = targetHeight || 178;
    def.player.growthPoints = growthPoints || 0;
    if (Array.isArray(statsArr)) {
      def.player.stats = {
        str: statsArr[0] || 14,
        int: statsArr[1] || 12,
        end: statsArr[2] || 14,
        gro: statsArr[3] || 15
      };
    }
    def.player.activeTitle = typeof activeTitleCode === 'number'
      ? (allTitleKeys[activeTitleCode] || '초보 수련자 (173cm)')
      : (activeTitleCode || '초보 수련자 (173cm)');

    if (Array.isArray(packed.t)) {
      def.player.unlockedTitles = packed.t.map(idx => typeof idx === 'number' ? allTitleKeys[idx] : idx).filter(Boolean);
      if (!def.player.unlockedTitles.includes('초보 수련자 (173cm)')) {
        def.player.unlockedTitles.unshift('초보 수련자 (173cm)');
      }
    }

    if (Array.isArray(packed.e)) {
      const slots = ['weapon', 'armor', 'shoes', 'ring', 'aura'];
      slots.forEach((slot, idx) => {
        def.player.equipment[slot] = codeToItem(packed.e[idx]);
      });
    }

    if (Array.isArray(packed.i)) {
      def.player.inventory = packed.i.map(codeToItem).filter(Boolean);
    }

    if (Array.isArray(packed.q)) {
      const [streak, startDate, lastActiveDate, doneTodayArr, histCompact] = packed.q;
      def.quests.dailyStreak = streak || 1;
      def.quests.startDate = startDate || getLocalDateString();
      def.quests.lastActiveDate = lastActiveDate || getLocalDateString();
      def.quests.completedToday = {};
      if (Array.isArray(doneTodayArr)) {
        doneTodayArr.forEach(idx => {
          const qId = typeof idx === 'number' ? questKeys[idx] : idx;
          if (qId) def.quests.completedToday[qId] = true;
        });
      }
      const yearPrefix = new Date().getFullYear() + '-';
      if (histCompact && typeof histCompact === 'object') {
        Object.entries(histCompact).forEach(([mmdd, cnt]) => {
          def.quests.history[yearPrefix + mmdd] = cnt;
        });
      }
    }

    if (Array.isArray(packed.r)) {
      const [unlockedStage, maxCleared, hasOmega] = packed.r;
      def.raid.unlockedStage = unlockedStage || 1;
      def.raid.clearedStages = [];
      for (let s = 1; s <= (maxCleared || 0); s++) {
        def.raid.clearedStages.push(s);
      }
      if (hasOmega) def.raid.clearedStages.push(100);
    }

    def.lastSaved = packed.u || new Date().toISOString();
    return def;
  }

  async fetchCloudRegistry() {
    let reg = {};

    // 1. Multi-mirror registry aggregation (adminforge, tedomum, ntfy.sh)
    try {
      const results = await Promise.allSettled(this.LEGACY_REGISTRIES.map(url =>
        fetch(url, { signal: AbortSignal.timeout(4500) }).then(r => r.text())
      ));

      for (const res of results) {
        if (res.status === 'fulfilled' && res.value) {
          const lines = res.value.trim().split('\n');
          for (const line of lines) {
            try {
              const msg = JSON.parse(line);
              if (msg && msg.message) {
                const parsed = JSON.parse(msg.message);
                for (const [uid, acc] of Object.entries(parsed)) {
                  if (!uid) continue;
                  if (!reg[uid]) {
                    reg[uid] = acc;
                  } else {
                    const extTs = Number(reg[uid].ts) || 0;
                    const incTs = Number(acc.ts) || 0;
                    const newer = incTs >= extTs ? acc : reg[uid];
                    const older = incTs >= extTs ? reg[uid] : acc;
                    reg[uid] = {
                      ...older,
                      ...newer,
                      p: newer.p || older.p,
                      bk: newer.bk || older.bk,
                      pk: newer.pk || older.pk,
                      ts: Math.max(extTs, incTs)
                    };
                  }
                }
              }
            } catch (err) {}
          }
        }
      }
    } catch (e) {}

    // 2. Fallback check RESTful API object
    try {
      const res = await fetch(`${this.CLOUD_API_BASE}/${this.CLOUD_REGISTRY_ID}?t=${Date.now()}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.u) {
          const restReg = typeof json.data.u === 'string' ? JSON.parse(json.data.u) : json.data.u;
          for (const [uid, acc] of Object.entries(restReg || {})) {
            if (!reg[uid]) reg[uid] = acc;
          }
        }
      }
    } catch (e) {}

    return reg || {};
  }

  async updateCloudRegistry(reg) {
    const str = JSON.stringify(reg);
    const endpoints = [
      'https://ntfy.adminforge.de/okh_gh_cloud_registry',
      'https://ntfy.tedomum.fr/okh_gh_cloud_registry',
      'https://ntfy.sh/okh_gh_cloud_v4_registry'
    ];
    await Promise.allSettled(endpoints.map(url =>
      fetch(url, {
        method: 'POST',
        body: str,
        keepalive: true
      })
    ));

    try {
      await fetch(`${this.CLOUD_API_BASE}/${this.CLOUD_REGISTRY_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'gh_cloud_registry_v1',
          data: { u: str }
        }),
        keepalive: true
      });
    } catch (e) {}
  }

  async syncToCloud(forceImmediate = false) {
    if (this.isReadOnlyMode || this._accountDeleted) return { success: false, readOnly: true, deleted: true };
    if (!this.cloudSession || !this.cloudSession.userId) return { success: false };
    if (this._isSyncingCloud && !forceImmediate) return { success: false };
    this._isSyncingCloud = true;

    try {
      const userId = this.cloudSession.userId;
      const password = this.cloudSession.password;
      this.data.ownerAccountId = userId;
      this.data.lastSaved = new Date().toISOString();

      // 1. Upload full save JSON to Bytebin (with keepalive: true for pageleave safety)
      let bytebinKey = this.cloudSession.bytebinKey || null;
      try {
        const bRes = await fetch(`${this.BYTEBIN_URL}/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.data),
          keepalive: true
        });
        if (bRes.ok) {
          const bJson = await bRes.json();
          if (bJson && bJson.key) {
            bytebinKey = bJson.key;
            this.cloudSession.bytebinKey = bytebinKey;
          }
        }
      } catch (e) {}

      // 2. Upload full save JSON to secondary mirror (Pastes.dev)
      let pastesKey = this.cloudSession.pastesKey || null;
      try {
        const pRes = await fetch(`${this.PASTES_URL}/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.data),
          keepalive: true
        });
        if (pRes.ok) {
          const pJson = await pRes.json();
          if (pJson && pJson.key) {
            pastesKey = pJson.key;
            this.cloudSession.pastesKey = pastesKey;
          }
        }
      } catch (e) {}

      // 3. Upload full save & keys to Ntfy user channels (live delivery + cached stream across mirrors)
      const hexId = this.userIdToHex(userId);
      const userPayload = JSON.stringify({
        u: userId,
        p: password,
        bk: bytebinKey,
        pk: pastesKey,
        d: this.data,
        ts: Date.now()
      });

      const userTopics = [
        `https://ntfy.adminforge.de/okh_gh_cloud_u_${hexId}`,
        `https://ntfy.tedomum.fr/okh_gh_cloud_u_${hexId}`,
        `https://ntfy.sh/okh_gh_cloud_v4_u_${hexId}`
      ];
      await Promise.allSettled(userTopics.map(u =>
        fetch(u, {
          method: 'POST',
          body: userPayload,
          keepalive: true
        })
      ));

      // 4. Update master account registry ONLY when necessary (forceImmediate, or at least 5 minutes since last sync)
      // This prevents 429 quota exhaustion while keeping registries completely synchronized across devices.
      const now = Date.now();
      if (forceImmediate || !this._lastRegistrySync || (now - this._lastRegistrySync > 300000)) {
        this._lastRegistrySync = now;
        const regUpdate = { [userId]: { p: password, bk: bytebinKey, pk: pastesKey, ts: now } };
        const regStr = JSON.stringify(regUpdate);
        const regTopics = [
          'https://ntfy.adminforge.de/okh_gh_cloud_registry',
          'https://ntfy.tedomum.fr/okh_gh_cloud_registry',
          'https://ntfy.sh/okh_gh_cloud_v4_registry'
        ];
        Promise.allSettled(regTopics.map(u =>
          fetch(u, {
            method: 'POST',
            body: regStr,
            keepalive: true
          })
        )).catch(() => {});
      }

      this.cloudSession.lastSyncTime = new Date().toISOString();
      this.saveCloudSession(this.cloudSession);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.updateSaveIndicator(`서버 동기화 완료: ${timeStr}`);
      return { success: true, timeStr, bytebinKey, pastesKey };
    } catch (e) {
      console.error("Cloud sync error:", e);
      return { success: false, error: e.message };
    } finally {
      this._isSyncingCloud = false;
    }
  }

  async fetchAccountCloudData(userId, objId, fallbackBytebinKey = null) {
    let fromBytebin = null;
    let fromPastes = null;
    let fromNtfy = null;
    let latestBk = null;
    let latestPk = null;
    let storedPassword = null;
    let highestTs = 0;
    let isDeleted = false;
    let isBanned = false;
    let banType = null;
    let banUntil = null;
    let banReason = null;

    // 1. Fetch from Ntfy user streams across mirrors with &since=0
    const hexId = this.userIdToHex(userId);
    const userTopics = [
      `https://ntfy.adminforge.de/okh_gh_cloud_u_${hexId}/json?poll=1&since=0`,
      `https://ntfy.tedomum.fr/okh_gh_cloud_u_${hexId}/json?poll=1&since=0`,
      `https://ntfy.sh/okh_gh_cloud_v4_u_${hexId}/json?poll=1&since=0`,
      `https://ntfy.sh/okh_gh_cloud_prod_v3_u_${hexId}/json?poll=1&since=0`,
      `https://ntfy.sh/okh_gh_cloud_v2_u_${hexId}/json?poll=1&since=0`
    ];

    try {
      const results = await Promise.allSettled(userTopics.map(u =>
        fetch(u, { signal: AbortSignal.timeout(4500) }).then(r => r.text())
      ));

      for (const res of results) {
        if (res.status === 'fulfilled' && res.value) {
          const lines = res.value.trim().split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            try {
              const msg = JSON.parse(lines[i]);
              if (msg && msg.message) {
                const parsed = JSON.parse(msg.message);
                if (parsed) {
                  const ts = parsed.ts || (msg.time * 1000) || 0;
                  if (ts >= highestTs) {
                    highestTs = ts;

                    if (parsed.banned === true) {
                      isBanned = true;
                      banType = parsed.banType || 'perm';
                      banUntil = parsed.banUntil || null;
                      banReason = parsed.banReason || '운영 정책 위반';
                    } else if (parsed.banned === false) {
                      isBanned = false;
                      banType = null;
                      banUntil = null;
                      banReason = null;
                    }

                    if (parsed.deleted === true) {
                      isDeleted = true;
                      storedPassword = null;
                      latestBk = null;
                      latestPk = null;
                      fromNtfy = null;
                    } else {
                      isDeleted = false;
                      if (parsed.p) storedPassword = parsed.p;
                      if (parsed.bk) latestBk = parsed.bk;
                      if (parsed.pk) latestPk = parsed.pk;
                      if (parsed.d && parsed.d.player) {
                        fromNtfy = parsed.d;
                      }
                    }
                  } else if (!isDeleted && parsed.p && !storedPassword) {
                    storedPassword = parsed.p;
                  }
                }
              }
            } catch (err) {}
          }
        }
      }
    } catch (e) {}

    // If marked deleted in stream, do not attempt fallback to bytebin/pastes
    if (isDeleted) {
      return {
        cloudSave: null,
        storedPassword: null,
        latestBk: null,
        latestPk: null,
        isDeleted: true,
        isBanned,
        banType,
        banUntil,
        banReason
      };
    }

    // Fall back to registry/session keys if Ntfy message didn't contain keys
    if (!latestBk) latestBk = fallbackBytebinKey;

    // 2. Fetch full pristine save from Bytebin if key available
    if (latestBk) {
      try {
        const bRes = await fetch(`${this.BYTEBIN_URL}/${latestBk}`);
        if (bRes.ok) {
          const bJson = await bRes.json();
          if (bJson && bJson.player) {
            fromBytebin = bJson;
          }
        }
      } catch (e) {}
    }

    // 3. Fetch from Pastes.dev mirror if key available
    if (latestPk && !fromBytebin) {
      try {
        const pRes = await fetch(`${this.PASTES_URL}/${latestPk}`);
        if (pRes.ok) {
          const pJson = await pRes.json();
          if (pJson && pJson.player) {
            fromPastes = pJson;
          }
        }
      } catch (e) {}
    }

    // Pick the most comprehensive & authoritative save
    let combined = fromBytebin || fromPastes || fromNtfy;
    if (fromBytebin && fromNtfy) {
      combined = this.mergeSaveData(fromBytebin, fromNtfy);
    } else if (!fromBytebin && fromPastes && fromNtfy) {
      combined = this.mergeSaveData(fromPastes, fromNtfy);
    }

    return {
      cloudSave: combined,
      storedPassword,
      latestBk,
      latestPk,
      isDeleted: false,
      isBanned,
      banType,
      banUntil,
      banReason
    };
  }

  async pullFromCloud(silent = false, forceOverwriteLocal = false, notifyIfChanged = true) {
    if (this.isReadOnlyMode || this._accountDeleted) return { success: false, readOnly: true };
    if (!this.cloudSession || !this.cloudSession.userId) {
      return { success: false, message: '로그인된 클라우드 계정이 없습니다.' };
    }
    // If local unsaved changes are pending, flush them first rather than pulling stale cloud data
    if (this._cloudSyncTimer !== null || this._isSyncingCloud) {
      if (this._cloudSyncTimer !== null) {
        clearTimeout(this._cloudSyncTimer);
        this._cloudSyncTimer = null;
      }
      return await this.syncToCloud(true);
    }

    try {
      const userId = this.cloudSession.userId;
      let objId = this.cloudSession.objId;
      const reg = await this.fetchCloudRegistry();
      const isRegDeleted = Boolean(reg[userId] && reg[userId].deleted);
      const isRegBanned = Boolean(reg[userId] && reg[userId].banned);
      const regBanType = reg[userId] && reg[userId].banType;
      const regBanUntil = reg[userId] && Number(reg[userId].banUntil);
      const regBanReason = reg[userId] && reg[userId].banReason;

      if (reg[userId] && reg[userId].o) {
        objId = reg[userId].o;
        this.cloudSession.objId = objId;
      }

      const fallbackBk = (reg[userId] && reg[userId].bk) || this.cloudSession.bytebinKey;
      const { cloudSave, latestBk, latestPk, isDeleted, isBanned, banType, banUntil, banReason } = await this.fetchAccountCloudData(userId, objId, fallbackBk);

      const effectiveBanned = isRegBanned || isBanned;
      const effectiveBanType = regBanType || banType || 'perm';
      const effectiveBanUntil = regBanUntil || banUntil || null;
      const effectiveBanReason = regBanReason || banReason || '운영 정책 위반';

      // 1. Remote ban detection: kick out immediately!
      if (effectiveBanned) {
        if (effectiveBanType === 'perm') {
          console.warn(`[Cloud] Account '${userId}' is permanently banned. Auto-kicking out active device.`);
          await this.handleKickedOutBannedAccount(userId, 'perm', null, effectiveBanReason);
          return { success: false, banned: true, message: '영구 차단된 계정입니다.' };
        } else if (effectiveBanType === 'temp') {
          if (effectiveBanUntil && Date.now() < effectiveBanUntil) {
            console.warn(`[Cloud] Account '${userId}' is temporarily suspended. Auto-kicking out active device.`);
            await this.handleKickedOutBannedAccount(userId, 'temp', effectiveBanUntil, effectiveBanReason);
            return { success: false, banned: true, message: '일시 정지된 계정입니다.' };
          }
          // Temp ban has expired! Continue normally
        }
      }

      // 2. Remote deletion detection: kick out and wipe immediately!
      if (isRegDeleted || isDeleted) {
        console.warn(`[Cloud] Account '${userId}' has been marked deleted. Auto-kicking out active device.`);
        await this.handleKickedOutDeletedAccount(userId);
        return { success: false, deleted: true, message: '삭제된 계정입니다.' };
      }

      if (!cloudSave) {
        if (!silent) {
          await this.syncToCloud(true);
        }
        return { success: true, uploadedCurrent: true };
      }

      if (latestBk) this.cloudSession.bytebinKey = latestBk;
      if (latestPk) this.cloudSession.pastesKey = latestPk;
      this.saveCloudSession(this.cloudSession);

      // Track whether local state actually changes
      const prevScore = this.getProgressionScore(this.data);
      const prevGold = (this.data.player && this.data.player.gold) || 0;
      const prevLevel = (this.data.player && this.data.player.level) || 1;
      const prevCleared = ((this.data.raid && this.data.raid.clearedStages) || []).length;

      const finalData = forceOverwriteLocal
        ? JSON.parse(JSON.stringify(cloudSave))
        : this.mergeSaveData(this.data, cloudSave);

      finalData.ownerAccountId = userId;
      this.loadFromObject(finalData, false);
      this.checkDailyReset();
      this.checkRetroactiveUnlocks();

      const newScore = this.getProgressionScore(this.data);
      const newGold = (this.data.player && this.data.player.gold) || 0;
      const newLevel = (this.data.player && this.data.player.level) || 1;
      const newCleared = ((this.data.raid && this.data.raid.clearedStages) || []).length;
      const hasMeaningfulUpdate = (newScore > prevScore || newGold > prevGold || newLevel > prevLevel || newCleared > prevCleared);

      const serialized = JSON.stringify(this.data);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.MIRROR_KEY, serialized);
      this.saveToIndexedDB(serialized);
      this.updateSaveIndicator();

      if (typeof ui !== 'undefined') {
        if (ui.renderAll) ui.renderAll();
        if (ui.updateAuthGateVisibility) ui.updateAuthGateVisibility();
        if (ui.renderCloudModalState) ui.renderCloudModalState();

        if (hasMeaningfulUpdate && notifyIfChanged) {
          ui.showToast(`☁️ [${userId}] 최신 기록 자동 동기화 완료! (Lv.${newLevel} · ${newGold.toLocaleString()} G)`, 'success');
        } else if (!silent) {
          ui.showToast(`☁️ [${userId}] 서버 데이터 동기화 완료!`, 'success');
        }
      }
      return { success: true, hasMeaningfulUpdate };
    } catch (e) {
      console.error("Pull from cloud failed:", e);
      return { success: false, message: e.message };
    }
  }

  async handleKickedOutBannedAccount(userId, banType, banUntil, banReason) {
    this._accountDeleted = true;
    this.saveCloudSession(null);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('admin_master_session');
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.MIRROR_KEY);
        localStorage.removeItem('antigravity_cloud_session');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('isAdminLoggedIn');
        sessionStorage.removeItem('admin_master_session');
        sessionStorage.removeItem('antigravity_cloud_session');
      }
      await this.clearIndexedDB();
    } catch (e) {}

    this.data = this.getDefaultState();
    this.data.resetTimestamp = Date.now();
    this.data.ownerAccountId = null;
    this.updateSaveIndicator('이용 정지됨 (강제 로그아웃)');

    if (typeof ui !== 'undefined') {
      if (ui.renderAll) ui.renderAll();
      if (ui.renderCloudModalState) ui.renderCloudModalState();
      if (ui.updateAuthGateVisibility) ui.updateAuthGateVisibility();
      if (ui.closeModal) {
        ui.closeModal('cloudAccountModal');
        ui.closeModal('cloudSettingsModal');
      }
    }

    setTimeout(() => {
      if (typeof alert !== 'undefined') {
        if (banType === 'perm') {
          alert(`🚫 [계정 영구 이용 정지 안내]\n\n[${userId}] 계정은 관리자에 의해 영구 이용 정지(차단)되었습니다.\n\n사유: ${banReason || '운영 정책 위반'}\n\n이 기기에서 즉시 자동 로그아웃되었습니다.`);
        } else {
          const expiryStr = banUntil ? new Date(banUntil).toLocaleString('ko-KR') : '';
          alert(`⏳ [계정 일시 정지 안내]\n\n[${userId}] 계정은 운영 정책 위반으로 일시 이용 정지되었습니다.\n\n사유: ${banReason || '운영 정책 위반'}\n해제 예정 시각: ${expiryStr}\n\n이 기기에서 즉시 자동 로그아웃되었습니다.`);
        }
      }
    }, 100);
  }

  async handleKickedOutDeletedAccount(userId) {
    this._accountDeleted = true;
    this.saveCloudSession(null);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('admin_master_session');
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.MIRROR_KEY);
        localStorage.removeItem('antigravity_cloud_session');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('isAdminLoggedIn');
        sessionStorage.removeItem('admin_master_session');
        sessionStorage.removeItem('antigravity_cloud_session');
      }
      await this.clearIndexedDB();
    } catch (e) {}

    this.data = this.getDefaultState();
    this.data.resetTimestamp = Date.now();
    this.data.ownerAccountId = null;
    this.updateSaveIndicator('계정 삭제됨 (강제 로그아웃)');

    if (typeof ui !== 'undefined') {
      if (ui.renderAll) ui.renderAll();
      if (ui.renderCloudModalState) ui.renderCloudModalState();
      if (ui.updateAuthGateVisibility) ui.updateAuthGateVisibility();
      if (ui.closeModal) {
        ui.closeModal('cloudAccountModal');
        ui.closeModal('cloudSettingsModal');
      }
    }

    setTimeout(() => {
      if (typeof alert !== 'undefined') {
        alert(`🗑️ [계정 삭제 안내]\n\n현재 접속 중인 [${userId}] 계정 데이터가 관리자에 의해 삭제되었습니다.\n\n이 기기의 로컬 저장 데이터가 완전히 초기화되었으며, 즉시 자동 로그아웃되었습니다.\n동일한 아이디로 언제든 새로 회원가입하여 다시 플레이하실 수 있습니다.`);
      }
    }, 100);
  }

  isCloudLoggedIn() {
    return Boolean(this.cloudSession && this.cloudSession.userId);
  }

  async loginOrRegisterCloud(rawUserId, rawPassword, mode = 'auto') {
    const userId = String(rawUserId || '').trim();
    const password = String(rawPassword || '').trim();

    if (!userId || userId.length < 1) {
      return { success: false, message: '아이디를 입력해주세요.' };
    }
    if (!password || password.length < 1) {
      return { success: false, message: '비밀번호를 입력해주세요.' };
    }

    if (typeof localStorage !== 'undefined' && userId.toLowerCase() !== 'admin') {
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('admin_master_session');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('isAdminLoggedIn');
        sessionStorage.removeItem('admin_master_session');
      }
    }

    try {
      const reg = await this.fetchCloudRegistry();
      const existingRecord = reg[userId] || null;
      const isRegDeleted = Boolean(existingRecord && existingRecord.deleted);
      const isRegBanned = Boolean(existingRecord && existingRecord.banned);

      // Also check Ntfy user channel in case account was created earlier or tombstoned
      const { cloudSave, storedPassword, latestBk, latestPk, isDeleted, isBanned, banType, banUntil, banReason } = await this.fetchAccountCloudData(
        userId,
        existingRecord ? existingRecord.o : null,
        existingRecord ? (existingRecord.bk || existingRecord.k) : null
      );

      const effectiveBanned = isRegBanned || isBanned;
      const effectiveBanType = (existingRecord && existingRecord.banType) || banType || 'perm';
      const effectiveBanUntil = (existingRecord && Number(existingRecord.banUntil)) || (banUntil ? Number(banUntil) : null);
      const effectiveBanReason = (existingRecord && existingRecord.banReason) || banReason || '운영 정책 위반';

      // 1. BAN ENFORCEMENT: Block login for banned accounts!
      if (effectiveBanned) {
        if (effectiveBanType === 'perm') {
          return {
            success: false,
            message: `🚫 [${userId}] 계정은 관리자에 의해 영구 이용 정지(차단)된 계정입니다.\n\n정지 사유: ${effectiveBanReason}\n(차단 해제 및 관련 문의는 관리자에게 연락 바랍니다)`
          };
        } else if (effectiveBanType === 'temp') {
          if (effectiveBanUntil && Date.now() < effectiveBanUntil) {
            const diffMs = effectiveBanUntil - Date.now();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMins = Math.ceil((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            let remainStr = '';
            if (diffDays > 0) remainStr = `${diffDays}일 ${diffHours}시간`;
            else if (diffHours > 0) remainStr = `${diffHours}시간 ${diffMins}분`;
            else remainStr = `${diffMins}분`;

            const expiryStr = new Date(effectiveBanUntil).toLocaleString('ko-KR');

            return {
              success: false,
              message: `⏳ [${userId}] 계정은 운영 정책 위반으로 이용이 일시 정지(차단)되었습니다.\n\n정지 사유: ${effectiveBanReason}\n해제 예정 시각: ${expiryStr} (약 ${remainStr} 남음)\n(지정된 기간이 만료되면 자동으로 정지가 해제됩니다)`
            };
          }
          // Temp ban has expired! Allow login to proceed!
        }
      }

      // 2. DELETION ENFORCEMENT:
      // When account is deleted:
      // - mode === 'login': tell user account is deleted and they can register freshly
      // - mode === 'register' or 'auto': ALLOW FRESH REGISTRATION with same ID!
      const effectiveDeleted = isRegDeleted || isDeleted;
      if (effectiveDeleted) {
        if (mode === 'login') {
          return {
            success: false,
            message: `❌ [${userId}] 아이디는 관리자에 의해 삭제된 계정입니다.\n해당 아이디로 새로 게임을 시작하시려면 [✨ 회원가입] 버튼을 눌러주세요.`
          };
        }
        // mode is 'register' or 'auto': Proceed as brand new registration!
      }

      const actualPassword = (!effectiveDeleted && existingRecord && existingRecord.p) || (!effectiveDeleted ? storedPassword : null);
      const accountExists = !effectiveDeleted && Boolean(existingRecord || cloudSave || actualPassword);

      // Strict mode validation when user explicitly clicked Login vs Register
      if (mode === 'login' && !accountExists) {
        return {
          success: false,
          message: `❌ [${userId}] 아이디는 존재하지 않습니다! 처음이시라면 [✨ 회원가입] 버튼을 눌러주세요.`
        };
      }

      if (mode === 'register' && accountExists) {
        return {
          success: false,
          message: `⚠️ [${userId}] 아이디는 이미 가입되어 있습니다! [🔑 로그인] 버튼을 눌러 접속해주세요.`
        };
      }

      if (accountExists) {
        // Account exists -> Verify password
        if (actualPassword && String(actualPassword) !== password) {
          return {
            success: false,
            message: `❌ [${userId}] 계정의 비밀번호가 일치하지 않습니다!`
          };
        }

        // Cross-device login: When explicitly logging in on any device, CLOUD DATA IS 100% AUTHORITATIVE!
        // Never let an unplayed empty browser state overwrite our real character!
        let nextData;
        if (cloudSave) {
          nextData = JSON.parse(JSON.stringify(cloudSave));
        } else {
          nextData = JSON.parse(JSON.stringify(this.data));
        }

        // Put account ID into character name field if default
        if (!nextData.player.name || nextData.player.name === '오경호' || nextData.player.name === '헌터') {
          nextData.player.name = userId;
        }

        nextData.ownerAccountId = userId;
        this.saveCloudSession({
          userId,
          password,
          objId: existingRecord ? existingRecord.o : null,
          bytebinKey: latestBk || null,
          pastesKey: latestPk || null,
          lastSyncTime: new Date().toISOString()
        });

        this.loadFromObject(nextData, false);
        this.checkDailyReset();
        this.checkRetroactiveUnlocks();
        await this.syncToCloud(true);

        const serialized = JSON.stringify(this.data);
        localStorage.setItem(this.STORAGE_KEY, serialized);
        localStorage.setItem(this.MIRROR_KEY, serialized);
        this.saveToIndexedDB(serialized);
        this.updateSaveIndicator();

        if (typeof ui !== 'undefined' && ui.renderAll) {
          ui.renderAll();
        }

        this.logUserActivity('login');

        return {
          success: true,
          isNew: false,
          userId,
          mergedPreLogin: false
        };
      } else {
        // Brand new account registration!
        // If current browser had a DIFFERENT logged-in owner previously, start clean for the new user.
        // Otherwise (unclaimed pre-login progress on this browser!), absorb 100% of current progress into this new account!
        const hadDifferentOwner = this.data.ownerAccountId && this.data.ownerAccountId !== userId;
        const hadPreLoginProgress = !hadDifferentOwner && this.getProgressionScore(this.data) > 0;

        if (hadDifferentOwner) {
          this.data = this.getDefaultState();
        }

        // User request: "회원가입 할때 아이디를 오경호 들어간 이름칸에 아이디를 넣자"
        this.data.player.name = userId;
        this.data.ownerAccountId = userId;
        this.saveCloudSession({
          userId,
          password,
          objId: null,
          bytebinKey: null,
          pastesKey: null,
          lastSyncTime: new Date().toISOString()
        });

        await this.syncToCloud(true);

        // Save into master registry
        reg[userId] = {
          p: password,
          bk: (this.cloudSession && this.cloudSession.bytebinKey) || '',
          pk: (this.cloudSession && this.cloudSession.pastesKey) || '',
          banned: false,
          deleted: false,
          ts: Date.now()
        };
        await this.updateCloudRegistry(reg);

        const serialized = JSON.stringify(this.data);
        localStorage.setItem(this.STORAGE_KEY, serialized);
        localStorage.setItem(this.MIRROR_KEY, serialized);
        this.saveToIndexedDB(serialized);
        this.updateSaveIndicator();

        if (typeof ui !== 'undefined' && ui.renderAll) {
          ui.renderAll();
        }

        this.logUserActivity('register');

        return {
          success: true,
          isNew: true,
          userId,
          mergedPreLogin: hadPreLoginProgress
        };
      }
    } catch (e) {
      console.error("Login/Register error:", e);
      return {
        success: false,
        message: '서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      };
    }
  }

  async changeCloudUserId(currentPassword, newRawUserId) {
    if (!this.cloudSession || !this.cloudSession.userId) {
      return { success: false, message: '로그인된 계정이 없습니다.' };
    }
    const oldUserId = this.cloudSession.userId;
    if (oldUserId.toLowerCase() === 'admin') {
      return { success: false, message: '관리자(Admin) 계정의 아이디는 변경할 수 없습니다.' };
    }

    const inputPw = String(currentPassword || '').trim();
    const newUserId = String(newRawUserId || '').trim();

    if (!inputPw) {
      return { success: false, message: '본인 확인을 위해 현재 비밀번호를 입력해주세요.' };
    }
    if (!newUserId || newUserId.length < 1) {
      return { success: false, message: '변경할 새 아이디를 입력해주세요.' };
    }
    if (newUserId.toLowerCase() === oldUserId.toLowerCase()) {
      return { success: false, message: '현재 아이디와 동일합니다. 다른 아이디를 입력해주세요.' };
    }
    if (newUserId.toLowerCase() === 'admin') {
      return { success: false, message: 'admin 아이디는 관리자 전용으로 사용할 수 없습니다.' };
    }

    try {
      // 1. Verify current password
      const reg = await this.fetchCloudRegistry();
      const currentRecord = reg[oldUserId];
      const actualPw = (currentRecord && currentRecord.p) || this.cloudSession.password;
      if (actualPw && String(actualPw) !== inputPw) {
        return { success: false, message: '현재 비밀번호가 일치하지 않습니다.' };
      }

      // 2. Check if newUserId already exists or was banned
      if (reg[newUserId]) {
        if (reg[newUserId].banned) {
          return { success: false, message: `[${newUserId}] 아이디는 제재(차단)된 계정으로 사용할 수 없습니다.` };
        }
        if (!reg[newUserId].deleted) {
          return { success: false, message: `이미 사용 중인 아이디입니다: [${newUserId}]` };
        }
      }

      const streamCheck = await this.fetchAccountCloudData(newUserId);
      if (streamCheck.isBanned) {
        return { success: false, message: `[${newUserId}] 아이디는 제재(차단)된 계정으로 사용할 수 없습니다.` };
      }
      if (streamCheck.cloudSave && !streamCheck.isDeleted) {
        return { success: false, message: `이미 서버에 존재하는 아이디입니다: [${newUserId}]` };
      }

      // 3. Migrate local character state to new ID
      this.data.ownerAccountId = newUserId;
      if (!this.data.player.name || this.data.player.name === oldUserId || this.data.player.name === '오경호' || this.data.player.name === '헌터') {
        this.data.player.name = newUserId;
      }

      const prevBk = this.cloudSession.bytebinKey;
      const prevPk = this.cloudSession.pastesKey;

      this.cloudSession.userId = newUserId;
      this.cloudSession.password = inputPw;
      this.cloudSession.lastSyncTime = new Date().toISOString();
      this.saveCloudSession(this.cloudSession);

      // 4. Sync immediately to cloud under new user channel
      await this.syncToCloud(true);

      // 5. Update master registry: register newUserId, mark oldUserId as deleted/migrated
      const now = Date.now();
      reg[newUserId] = {
        p: inputPw,
        bk: this.cloudSession.bytebinKey || prevBk || '',
        pk: this.cloudSession.pastesKey || prevPk || '',
        ts: now
      };
      reg[oldUserId] = {
        deleted: true,
        migratedTo: newUserId,
        ts: now
      };
      await this.updateCloudRegistry(reg);

      // 6. Push migration tombstone to old user topic
      const oldHex = this.userIdToHex(oldUserId);
      const tombstone = JSON.stringify({ u: oldUserId, deleted: true, migratedTo: newUserId, ts: now });
      const oldTopics = [
        `https://ntfy.adminforge.de/okh_gh_cloud_u_${oldHex}`,
        `https://ntfy.tedomum.fr/okh_gh_cloud_u_${oldHex}`,
        `https://ntfy.sh/okh_gh_cloud_v4_u_${oldHex}`
      ];
      Promise.allSettled(oldTopics.map(u => fetch(u, { method: 'POST', body: tombstone, keepalive: true }))).catch(() => {});

      // 7. Save local persistence
      const serialized = JSON.stringify(this.data);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.MIRROR_KEY, serialized);
      this.saveToIndexedDB(serialized);
      this.updateSaveIndicator();

      if (typeof ui !== 'undefined') {
        if (ui.renderAll) ui.renderAll();
        if (ui.renderCloudModalState) ui.renderCloudModalState();
      }

      return { success: true, oldUserId, newUserId };
    } catch (e) {
      console.error("Change user ID error:", e);
      return { success: false, message: '서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
    }
  }

  async changeCloudPassword(currentPassword, newRawPassword) {
    if (!this.cloudSession || !this.cloudSession.userId) {
      return { success: false, message: '로그인된 계정이 없습니다.' };
    }
    const userId = this.cloudSession.userId;
    const inputPw = String(currentPassword || '').trim();
    const newPw = String(newRawPassword || '').trim();

    if (!inputPw) {
      return { success: false, message: '현재 비밀번호를 입력해주세요.' };
    }
    if (!newPw || newPw.length < 1) {
      return { success: false, message: '새로운 비밀번호를 입력해주세요.' };
    }
    if (inputPw === newPw) {
      return { success: false, message: '새 비밀번호가 현재 비밀번호와 동일합니다.' };
    }

    try {
      // 1. Verify current password
      const reg = await this.fetchCloudRegistry();
      const currentRecord = reg[userId];
      const actualPw = (currentRecord && currentRecord.p) || this.cloudSession.password;
      if (actualPw && String(actualPw) !== inputPw) {
        return { success: false, message: '현재 비밀번호가 일치하지 않습니다.' };
      }

      // 2. Update password in session
      this.cloudSession.password = newPw;
      this.cloudSession.lastSyncTime = new Date().toISOString();
      this.saveCloudSession(this.cloudSession);

      // 3. Sync to user channels with new password
      await this.syncToCloud(true);

      // 4. Update master registry
      const now = Date.now();
      reg[userId] = {
        ...(reg[userId] || {}),
        p: newPw,
        ts: now
      };
      await this.updateCloudRegistry(reg);

      return { success: true, userId };
    } catch (e) {
      console.error("Change password error:", e);
      return { success: false, message: '서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
    }
  }

  async logoutCloud() {
    this.saveCloudSession(null);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('admin_master_session');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('isAdminLoggedIn');
        sessionStorage.removeItem('admin_master_session');
      }
    } catch (e) {}
    this.data = this.getDefaultState();
    this.data.resetTimestamp = Date.now();
    await this.clearIndexedDB();
    const serialized = JSON.stringify(this.data);
    try {
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.MIRROR_KEY, serialized);
    } catch (e) {}
    this.saveToIndexedDB(serialized);
    this.updateSaveIndicator();
    if (typeof ui !== 'undefined') {
      if (ui.renderCloudModalState) ui.renderCloudModalState();
      if (ui.renderAll) ui.renderAll();
      if (ui.updateAuthGateVisibility) ui.updateAuthGateVisibility();
    }
  }
}

// Global state instance
const state = new GameState();
if (typeof window !== 'undefined') {
  window.GameState = GameState;
  window.state = state;
}
if (typeof global !== 'undefined') {
  global.GameState = GameState;
  global.state = state;
}
