// Game State & Persistence Manager: High School 2nd Grade (173cm -> 178cm)
function getLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class GameState {
  constructor() {
    this.STORAGE_KEY = 'awakened_hunter_save_v2';
    this.MIRROR_KEY = 'awakened_hunter_save_mirror_v2';
    this.data = this.getDefaultState();
    this.load();
    this.setupAutoSaveHooks();
  }

  setupAutoSaveHooks() {
    // Save when leaving page, switching tabs, or locking phone
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('beforeunload', () => this.save());
      window.addEventListener('pagehide', () => this.save());
      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.save();
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
    if (triggerSave) {
      this.save();
    }
  }

  save() {
    try {
      this.data.lastSaved = new Date().toISOString();
      const serialized = JSON.stringify(this.data);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      // Secondary Mirror Backup (protects against browser clearing single key)
      localStorage.setItem(this.MIRROR_KEY, serialized);
      this.updateSaveIndicator();
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }

  updateSaveIndicator() {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('saveStatusIndicator');
    if (el) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      el.innerHTML = `🟢 <strong>실시간 자동 보존 중</strong> (최근: ${timeStr})`;
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
    const d = new Date();

    if (todayCompletedCount > 0) {
      // Completed at least 1 quest today: start streak from 1 and count consecutive past days
      streak = 1;
      d.setDate(d.getDate() - 1);
      while (true) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        if (this.data.quests.history && (this.data.quests.history[dateStr] || 0) > 0) {
          streak += 1;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // No quest completed today yet: check ongoing streak up to yesterday
      d.setDate(d.getDate() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const yesterdayStr = `${y}-${m}-${day}`;
      if (this.data.quests.history && (this.data.quests.history[yesterdayStr] || 0) > 0) {
        streak = 1;
        d.setDate(d.getDate() - 1);
        while (true) {
          const cy = d.getFullYear();
          const cm = String(d.getMonth() + 1).padStart(2, '0');
          const cday = String(d.getDate()).padStart(2, '0');
          const dateStr = `${cy}-${cm}-${cday}`;
          if (this.data.quests.history && (this.data.quests.history[dateStr] || 0) > 0) {
            streak += 1;
            d.setDate(d.getDate() - 1);
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
    if (p.activeTitle && TITLES_DATA[p.activeTitle]) {
      const tStats = TITLES_DATA[p.activeTitle].stats;
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
    // Expensive escalating gold formula for meaningful gold usage
    return Math.round(350 * Math.pow(1.10, diff) + diff * 80);
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
    if (!this.data.player.unlockedTitles.includes(titleName)) {
      this.data.player.unlockedTitles.push(titleName);
      this.save();
    }
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
}

// Global state instance
const state = new GameState();
