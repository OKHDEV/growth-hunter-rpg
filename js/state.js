// Game State & Persistence Manager: High School 2nd Grade (173cm -> 178cm)
// Daily reset is at 04:00 AM (game day runs from 04:00 AM to 03:59:59 AM the next morning)
function getLocalDateString(d = new Date()) {
  const adjusted = new Date(d.getTime() - 4 * 60 * 60 * 1000);
  const year = adjusted.getFullYear();
  const month = String(adjusted.getMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class GameState {
  constructor() {
    this.STORAGE_KEY = 'awakened_hunter_save_v2';
    this.MIRROR_KEY = 'awakened_hunter_save_mirror_v2';
    this.CLOUD_SESSION_KEY = 'awakened_hunter_cloud_session_v1';
    this.CLOUD_REGISTRY_ID = 'ff808181a09d98f701a186c07dd548c4';
    this.CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
    this.BYTEBIN_URL = 'https://bytebin.lucko.me';
    this.NTFY_BASE = 'https://ntfy.sh/okh_gh_cloud_prod_v3_';
    this.cloudSession = this.loadCloudSession();
    this._cloudSyncTimer = null;
    this._isSyncingCloud = false;
    this.data = this.getDefaultState();
    this.load();
    this.setupAutoSaveHooks();
    this.initCloudSyncOnStartup();
  }

  setupAutoSaveHooks() {
    // Save when leaving page, switching tabs, or locking phone
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('beforeunload', () => this.save(true));
      window.addEventListener('pagehide', () => this.save(true));
      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.save(true);
          } else if (this.cloudSession && this.cloudSession.userId) {
            // Pull latest cloud save when returning to browser/app
            this.pullFromCloud(true);
          }
        });
      }
    }
  }

  getDefaultState() {
    return {
      lastSaved: new Date().toISOString(),
      player: {
        name: "오경호",
        grade: "고등학교 2학년",
        title: "초보 수련자 (173cm)",
        avatar: "assets/player/hunter.jpg",
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
      player: {
        ...def.player,
        ...(parsed.player || {}),
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
    if (el) {
      if (this.cloudSession && this.cloudSession.userId) {
        el.innerHTML = `🟢 <strong>클라우드 계정 [${this.cloudSession.userId}] 실시간 서버 동기화 중</strong> (${cloudStatusText || '최근: ' + timeStr})`;
      } else {
        el.innerHTML = `🟢 <strong>기기 자동 보존 중</strong> (최근: ${timeStr}) · <span style="color:#38bdf8; cursor:pointer; text-decoration:underline;" onclick="if(typeof ui!=='undefined') ui.openCloudModal();">☁️ 클라우드 로그인 연동하기</span>`;
      }
    }
    const hdrCloudStatus = document.getElementById('hdrCloudStatus');
    const hdrCloudBtn = document.getElementById('hdrCloudBtn');
    const statusCloudLabel = document.getElementById('statusCloudLabel');
    if (this.cloudSession && this.cloudSession.userId) {
      if (hdrCloudStatus) {
        hdrCloudStatus.textContent = `🟢 ${this.cloudSession.userId}`;
        hdrCloudStatus.style.color = '#34d399';
      }
      if (hdrCloudBtn) {
        hdrCloudBtn.style.borderColor = 'rgba(52, 211, 153, 0.5)';
        hdrCloudBtn.style.background = 'rgba(16, 185, 129, 0.14)';
      }
      if (statusCloudLabel) {
        statusCloudLabel.textContent = `🟢 [${this.cloudSession.userId}] 계정 서버 연동 중`;
      }
    } else {
      if (hdrCloudStatus) {
        hdrCloudStatus.textContent = '☁️ 로그인';
        hdrCloudStatus.style.color = '#00e5ff';
      }
      if (hdrCloudBtn) {
        hdrCloudBtn.style.borderColor = 'rgba(0, 229, 255, 0.5)';
        hdrCloudBtn.style.background = 'rgba(0, 229, 255, 0.12)';
      }
      if (statusCloudLabel) {
        statusCloudLabel.textContent = '미연동 - 클릭하여 아이디/비번 로그인';
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

  resetAll() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.MIRROR_KEY);
    this.data = this.getDefaultState();
    this.save();
  }

  checkDailyReset() {
    const today = getLocalDateString();
    if (this.data.quests.lastActiveDate !== today) {
      const lastDate = new Date(this.data.quests.lastActiveDate + 'T00:00:00');
      const currentDate = new Date(today + 'T00:00:00');
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      // Record yesterday's total completion count in history
      const prevDate = this.data.quests.lastActiveDate;
      const completedCount = Object.keys(this.data.quests.completedToday || {}).length;
      if (!this.data.quests.history) this.data.quests.history = {};
      this.data.quests.history[prevDate] = completedCount;

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
        if (completedCount > 0) {
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
    // Current game day cursor (shifted by -4 hours so reset is at 04:00 AM)
    const curGameDay = new Date(Date.now() - 4 * 60 * 60 * 1000);

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

  // --- Calculations ---

  getExpRequired(level) {
    // Scaling exponential formula for leveling
    return Math.floor(120 * Math.pow(1.22, level - 1) + (level - 1) * 40);
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
    if (levelsGained > 0) {
      this.data.player.gold += 300 * levelsGained; // Level-up gold reward!
    }

    this.save();
    return {
      leveledUp,
      levelsGained,
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
    return {
      goldAdded: goldToAdd,
      baseGold: amount,
      titleGoldMult
    };
  }

  getStatUpgradeCost(statKey) {
    const cur = (this.data.player.stats && this.data.player.stats[statKey]) || 10;
    const diff = Math.max(0, cur - 10);
    // Highly affordable & rewarding stat upgrade curve for daily growth
    return Math.max(50, Math.round(50 * Math.pow(1.04, diff) + diff * 15));
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
    this.save();
    return { success: true, newStat: this.data.player.stats[statKey], cost, statKey };
  }

  allocateStat(statKey, amount = 1) {
    const res = this.upgradeStatWithGold(statKey);
    return res && res.success;
  }

  equipItem(item) {
    if (!item || !item.slot) return;
    this.data.player.equipment[item.slot] = item;
    this.save();
  }

  unequipItem(slot) {
    if (this.data.player.equipment[slot]) {
      this.data.player.equipment[slot] = null;
      this.save();
    }
  }

  addToInventory(item) {
    const exists = this.data.player.inventory.some(i => i.id === item.id);
    if (!exists) {
      this.data.player.inventory.push(item);
      this.save();
    }
  }

  unlockTitle(titleName) {
    if (!titleName) return false;
    if (!this.data.player.unlockedTitles.includes(titleName)) {
      this.data.player.unlockedTitles.push(titleName);
      this.save();
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
      this.save();
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

    this.save();
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

    if (!this.data.raid.clearedStages.includes(boss.stage)) {
      this.data.raid.clearedStages.push(boss.stage);
      if (this.data.raid.unlockedStage <= boss.stage && boss.stage < BOSSES_DATA.length) {
        this.data.raid.unlockedStage = boss.stage + 1;
      }
    }

    this.data.raid.clearCounts[bossId] = (this.data.raid.clearCounts[bossId] || 0) + 1;

    // Grants rewards
    const expResult = this.addExp(boss.rewards.exp);
    const goldResult = this.addGold(boss.rewards.gold);
    this.addGrowthPoints(boss.rewards.growthPoints);
    this.addToInventory(boss.rewards.item);
    this.unlockTitle(boss.rewards.title);

    this.save();
    return {
      boss,
      expResult,
      goldResult,
      rewards: boss.rewards,
      titleMultipliers: this.getActiveTitleMultipliers()
    };
  }

  addCustomQuest(questData) {
    const newQuest = {
      id: "custom_" + Date.now(),
      title: questData.title,
      description: questData.description || "사용자 지정 각성 퀘스트",
      category: questData.category || "height",
      categoryName: questData.categoryName || "신체 & 키 성장",
      tier: questData.tier || "B",
      exp: parseInt(questData.exp) || 300,
      gold: parseInt(questData.gold) || 100,
      growthPoints: parseInt(questData.growthPoints) || 10,
      type: questData.type || "check",
      targetCount: questData.targetCount ? parseInt(questData.targetCount) : null,
      targetSeconds: questData.targetSeconds ? parseInt(questData.targetSeconds) : null,
      unit: questData.unit || "회",
      icon: questData.icon || "star"
    };

    this.data.quests.customQuests.push(newQuest);
    this.save();
    return newQuest;
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
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.CLOUD_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  saveCloudSession(session) {
    this.cloudSession = session;
    try {
      if (typeof localStorage !== 'undefined') {
        if (session) {
          localStorage.setItem(this.CLOUD_SESSION_KEY, JSON.stringify(session));
        } else {
          localStorage.removeItem(this.CLOUD_SESSION_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to save cloud session:", e);
    }
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
        const db = e.target.result;
        const tx = db.transaction('saves', 'readwrite');
        const store = tx.objectStore('saves');
        store.put(serialized, this.STORAGE_KEY);
        if (this.cloudSession) {
          store.put(JSON.stringify(this.cloudSession), this.CLOUD_SESSION_KEY);
        }
      };
    } catch (e) {
      // Ignore IndexedDB errors in restricted webviews
    }
  }

  initCloudSyncOnStartup() {
    if (typeof window === 'undefined') return;
    setTimeout(async () => {
      this.updateSaveIndicator();
      if (this.cloudSession && this.cloudSession.userId) {
        await this.pullFromCloud(true);
      } else {
        // Check IndexedDB if localStorage was wiped by mobile browser
        this.recoverFromIndexedDBIfNeeded();
      }
    }, 300);
  }

  recoverFromIndexedDBIfNeeded() {
    try {
      if (typeof indexedDB === 'undefined') return;
      if (this.getProgressionScore(this.data) > 0) return;
      const req = indexedDB.open('AwakenedHunterDB', 1);
      req.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('saves')) return;
        const tx = db.transaction('saves', 'readonly');
        const store = tx.objectStore('saves');
        const getSave = store.get(this.STORAGE_KEY);
        getSave.onsuccess = () => {
          if (getSave.result) {
            try {
              const parsed = JSON.parse(getSave.result);
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
                this.saveCloudSession(sess);
                this.pullFromCloud(true);
              }
            } catch (err) {}
          }
        };
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
      }, 1000);
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

    const localScore = this.getProgressionScore(localData);
    const cloudScore = this.getProgressionScore(cloudData);

    // If local is a brand new untouched state (e.g. opening Safari for the first time), use cloudData 100%
    if (localScore === 0 && cloudScore > 0) {
      return JSON.parse(JSON.stringify(cloudData));
    }
    // If cloud is brand new and local has pre-login progress, use localData 100%
    if (cloudScore === 0 && localScore > 0) {
      return JSON.parse(JSON.stringify(localData));
    }

    const isFirstTimePreLoginMerge = !localData.ownerAccountId;
    const localTime = localData.lastSaved ? new Date(localData.lastSaved).getTime() : 0;
    const cloudTime = cloudData.lastSaved ? new Date(cloudData.lastSaved).getTime() : 0;

    let primary = cloudData;
    let secondary = localData;
    if (localScore > cloudScore || (localScore === cloudScore && localTime > cloudTime)) {
      primary = localData;
      secondary = cloudData;
    }

    const merged = JSON.parse(JSON.stringify(primary));
    const lp = localData.player;
    const cp = cloudData.player;

    // Preserve highest level & exp
    if ((lp.level || 1) > (cp.level || 1)) {
      merged.player.level = lp.level;
      merged.player.exp = lp.exp;
    } else if ((cp.level || 1) > (lp.level || 1)) {
      merged.player.level = cp.level;
      merged.player.exp = cp.exp;
    } else {
      merged.player.exp = Math.max(lp.exp || 0, cp.exp || 0);
    }

    // Preserve highest growth points & stats
    merged.player.growthPoints = Math.max(lp.growthPoints || 0, cp.growthPoints || 0);
    ['str', 'int', 'end', 'gro'].forEach(k => {
      merged.player.stats[k] = Math.max(
        (lp.stats && lp.stats[k]) || 14,
        (cp.stats && cp.stats[k]) || 14
      );
    });

    if (isFirstTimePreLoginMerge) {
      merged.player.gold = Math.max(lp.gold || 0, cp.gold || 0);
    }

    // Union of unlockedTitles
    const titleSet = new Set([
      ...(cp.unlockedTitles || ["초보 수련자 (173cm)"]),
      ...(lp.unlockedTitles || ["초보 수련자 (173cm)"])
    ]);
    merged.player.unlockedTitles = Array.from(titleSet);

    // Union of inventory items (by id)
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

    // Equipment: fill any empty slot from secondary
    ['weapon', 'armor', 'shoes', 'ring', 'aura'].forEach(slot => {
      if (!merged.player.equipment[slot] && secondary.player.equipment && secondary.player.equipment[slot]) {
        merged.player.equipment[slot] = secondary.player.equipment[slot];
      }
    });

    // Quests: union of today's completed quests if on the same active date
    const today = getLocalDateString();
    const lCompleted = (localData.quests && localData.quests.lastActiveDate === today) ? (localData.quests.completedToday || {}) : {};
    const cCompleted = (cloudData.quests && cloudData.quests.lastActiveDate === today) ? (cloudData.quests.completedToday || {}) : {};
    merged.quests.lastActiveDate = today;
    merged.quests.completedToday = { ...cCompleted, ...lCompleted };

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

    // Raid progression union
    const lRaid = localData.raid || {};
    const cRaid = cloudData.raid || {};
    merged.raid.unlockedStage = Math.max(lRaid.unlockedStage || 1, cRaid.unlockedStage || 1);
    merged.raid.clearedStages = Array.from(new Set([
      ...(cRaid.clearedStages || []),
      ...(lRaid.clearedStages || [])
    ])).sort((a, b) => a - b);

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
        p.name || '오경호',
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
    def.player.name = name || '오경호';
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
    try {
      const res = await fetch(`${this.CLOUD_API_BASE}/${this.CLOUD_REGISTRY_ID}?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.u) {
          reg = typeof json.data.u === 'string' ? JSON.parse(json.data.u) : json.data.u;
        }
      }
    } catch (e) {
      console.warn("Primary registry fetch warning:", e);
    }

    // Also check Ntfy backup registry stream
    try {
      const nRes = await fetch(`${this.NTFY_BASE}registry/json?poll=1`);
      if (nRes.ok) {
        const text = (await nRes.text()).trim();
        if (text) {
          const lines = text.split('\n');
          for (const line of lines) {
            try {
              const msg = JSON.parse(line);
              if (msg && msg.message) {
                const parsed = JSON.parse(msg.message);
                reg = { ...reg, ...parsed };
              }
            } catch (err) {}
          }
        }
      }
    } catch (e) {}

    return reg || {};
  }

  async updateCloudRegistry(reg) {
    const str = JSON.stringify(reg);
    try {
      await fetch(`${this.CLOUD_API_BASE}/${this.CLOUD_REGISTRY_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'gh_cloud_registry_v1',
          data: { u: str }
        })
      });
    } catch (e) {
      console.warn("Primary registry update warning:", e);
    }

    try {
      await fetch(`${this.NTFY_BASE}registry`, {
        method: 'POST',
        body: str
      });
    } catch (e) {}
  }

  async syncToCloud(forceImmediate = false) {
    if (!this.cloudSession || !this.cloudSession.userId) return { success: false };
    if (this._isSyncingCloud && !forceImmediate) return { success: false };
    this._isSyncingCloud = true;

    try {
      const userId = this.cloudSession.userId;
      const password = this.cloudSession.password;
      this.data.ownerAccountId = userId;
      this.data.lastSaved = new Date().toISOString();

      // 1. Upload full uncompressed JSON to Bytebin
      let bytebinKey = this.cloudSession.bytebinKey || null;
      try {
        const bRes = await fetch(`${this.BYTEBIN_URL}/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.data)
        });
        if (bRes.ok) {
          const bJson = await bRes.json();
          if (bJson && bJson.key) {
            bytebinKey = bJson.key;
            this.cloudSession.bytebinKey = bytebinKey;
          }
        }
      } catch (e) {}

      // 2. Upload full save to Ntfy user channel
      const hexId = this.userIdToHex(userId);
      try {
        await fetch(`${this.NTFY_BASE}u_${hexId}`, {
          method: 'POST',
          body: JSON.stringify({
            u: userId,
            p: password,
            bk: bytebinKey,
            d: this.data,
            ts: Date.now()
          })
        });
      } catch (e) {}

      // 3. Upload compact permanent snapshot + bytebinKey to Restful-API permanent object
      const packed = this.packSaveData(this.data);
      const permPayload = {
        name: `gh_save_${hexId}`,
        data: {
          p: password,
          bk: bytebinKey || '',
          s: JSON.stringify(packed)
        }
      };

      if (this.cloudSession.objId) {
        const putRes = await fetch(`${this.CLOUD_API_BASE}/${this.cloudSession.objId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(permPayload)
        });
        if (!putRes.ok && putRes.status === 404) {
          this.cloudSession.objId = null;
        }
      }

      if (!this.cloudSession.objId) {
        const postRes = await fetch(this.CLOUD_API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(permPayload)
        });
        if (postRes.ok) {
          const postJson = await postRes.json();
          if (postJson && postJson.id) {
            this.cloudSession.objId = postJson.id;
            const reg = await this.fetchCloudRegistry();
            reg[userId] = { p: password, o: postJson.id, k: bytebinKey || '' };
            await this.updateCloudRegistry(reg);
          }
        }
      }

      this.cloudSession.lastSyncTime = new Date().toISOString();
      this.saveCloudSession(this.cloudSession);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.updateSaveIndicator(`서버 동기화 완료: ${timeStr}`);
      return { success: true, timeStr };
    } catch (e) {
      console.error("Cloud sync error:", e);
      return { success: false, error: e.message };
    } finally {
      this._isSyncingCloud = false;
    }
  }

  async fetchAccountCloudData(userId, objId, fallbackBytebinKey = null) {
    let fromPerm = null;
    let fromBytebin = null;
    let fromNtfy = null;
    let latestBk = fallbackBytebinKey;
    let storedPassword = null;

    // 1. Fetch permanent object from Restful-API
    if (objId) {
      try {
        const r = await fetch(`${this.CLOUD_API_BASE}/${objId}?t=${Date.now()}`);
        if (r.ok) {
          const j = await r.json();
          if (j && j.data) {
            if (j.data.p) storedPassword = j.data.p;
            if (j.data.bk) latestBk = j.data.bk;
            if (j.data.s) {
              const packed = typeof j.data.s === 'string' ? JSON.parse(j.data.s) : j.data.s;
              fromPerm = this.unpackSaveData(packed);
            }
          }
        }
      } catch (e) {}
    }

    // 2. Fetch Ntfy user stream
    const hexId = this.userIdToHex(userId);
    try {
      const nRes = await fetch(`${this.NTFY_BASE}u_${hexId}/json?poll=1`);
      if (nRes.ok) {
        const text = (await nRes.text()).trim();
        if (text) {
          const lines = text.split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            try {
              const msg = JSON.parse(lines[i]);
              if (msg && msg.message) {
                const parsed = JSON.parse(msg.message);
                if (parsed && parsed.d && parsed.d.player) {
                  fromNtfy = parsed.d;
                  if (parsed.p && !storedPassword) storedPassword = parsed.p;
                  if (parsed.bk && !latestBk) latestBk = parsed.bk;
                  break;
                }
              }
            } catch (err) {}
          }
        }
      }
    } catch (e) {}

    // 3. Fetch full JSON from Bytebin if key available
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

    let combined = fromBytebin || fromNtfy || fromPerm;
    if (combined && fromPerm) {
      combined = this.mergeSaveData(fromPerm, combined);
    }
    if (combined && fromNtfy) {
      combined = this.mergeSaveData(fromNtfy, combined);
    }

    return {
      cloudSave: combined,
      storedPassword,
      latestBk
    };
  }

  async pullFromCloud(silent = false, forceOverwriteLocal = false) {
    if (!this.cloudSession || !this.cloudSession.userId) {
      return { success: false, message: '로그인된 클라우드 계정이 없습니다.' };
    }

    try {
      const userId = this.cloudSession.userId;
      let objId = this.cloudSession.objId;
      const reg = await this.fetchCloudRegistry();
      if (reg[userId] && reg[userId].o) {
        objId = reg[userId].o;
        this.cloudSession.objId = objId;
      }

      const { cloudSave, latestBk } = await this.fetchAccountCloudData(
        userId,
        objId,
        (reg[userId] && reg[userId].k) || this.cloudSession.bytebinKey
      );

      if (!cloudSave) {
        if (!silent) {
          await this.syncToCloud(true);
        }
        return { success: true, uploadedCurrent: true };
      }

      if (latestBk) this.cloudSession.bytebinKey = latestBk;
      this.saveCloudSession(this.cloudSession);

      const finalData = forceOverwriteLocal
        ? JSON.parse(JSON.stringify(cloudSave))
        : this.mergeSaveData(this.data, cloudSave);

      finalData.ownerAccountId = userId;
      this.loadFromObject(finalData, false);
      this.checkDailyReset();
      this.checkRetroactiveUnlocks();

      const serialized = JSON.stringify(this.data);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.MIRROR_KEY, serialized);
      this.saveToIndexedDB(serialized);
      this.updateSaveIndicator();

      if (typeof ui !== 'undefined' && ui.renderAll) {
        ui.renderAll();
      }
      return { success: true };
    } catch (e) {
      console.error("Pull from cloud failed:", e);
      return { success: false, message: e.message };
    }
  }

  async loginOrRegisterCloud(rawUserId, rawPassword) {
    const userId = String(rawUserId || '').trim();
    const password = String(rawPassword || '').trim();

    if (!userId || userId.length < 1) {
      return { success: false, message: '아이디를 입력해주세요. (예: 경호, 동생)' };
    }
    if (!password || password.length < 1) {
      return { success: false, message: '비밀번호를 입력해주세요.' };
    }

    try {
      const reg = await this.fetchCloudRegistry();
      let existingRecord = reg[userId] || null;

      // Also check Ntfy user channel in case account was created earlier
      const { cloudSave, storedPassword, latestBk } = await this.fetchAccountCloudData(
        userId,
        existingRecord ? existingRecord.o : null,
        existingRecord ? existingRecord.k : null
      );

      const actualPassword = (existingRecord && existingRecord.p) || storedPassword;

      if (existingRecord || cloudSave) {
        // Account exists -> Verify password
        if (actualPassword && String(actualPassword) !== password) {
          return {
            success: false,
            message: `❌ [${userId}] 계정의 비밀번호가 일치하지 않습니다!`
          };
        }

        // Check if current browser has unclaimed pre-login progress (made before logging in)
        const hasUnclaimedPreLoginData = !this.data.ownerAccountId || this.data.ownerAccountId === userId;
        const preLoginScore = this.getProgressionScore(this.data);

        let nextData;
        if (hasUnclaimedPreLoginData && preLoginScore > 0 && cloudSave) {
          // Smart merge pre-login progress with cloud account data!
          nextData = this.mergeSaveData(this.data, cloudSave);
        } else if (cloudSave) {
          nextData = JSON.parse(JSON.stringify(cloudSave));
        } else {
          nextData = JSON.parse(JSON.stringify(this.data));
        }

        nextData.ownerAccountId = userId;
        this.saveCloudSession({
          userId,
          password,
          objId: existingRecord ? existingRecord.o : null,
          bytebinKey: latestBk || null,
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

        return {
          success: true,
          isNew: false,
          userId,
          mergedPreLogin: hasUnclaimedPreLoginData && preLoginScore > 0
        };
      } else {
        // Brand new account registration!
        // If current browser had a DIFFERENT logged-in owner previously, start clean for the new user.
        // Otherwise (unclaimed pre-login progress on this browser!), absorb 100% of current progress into this new account!
        const hadDifferentOwner = this.data.ownerAccountId && this.data.ownerAccountId !== userId;
        const hadPreLoginProgress = !hadDifferentOwner && this.getProgressionScore(this.data) > 0;

        if (hadDifferentOwner) {
          this.data = this.getDefaultState();
          if (userId !== '오경호') {
            this.data.player.name = userId;
          }
        }

        this.data.ownerAccountId = userId;
        this.saveCloudSession({
          userId,
          password,
          objId: null,
          bytebinKey: null,
          lastSyncTime: new Date().toISOString()
        });

        await this.syncToCloud(true);

        // Save into master registry
        reg[userId] = {
          p: password,
          o: this.cloudSession.objId || '',
          k: this.cloudSession.bytebinKey || ''
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

  logoutCloud() {
    this.saveCloudSession(null);
    this.updateSaveIndicator();
    if (typeof ui !== 'undefined' && ui.renderCloudModalState) {
      ui.renderCloudModalState();
    }
  }
}

// Global state instance
const state = new GameState();
