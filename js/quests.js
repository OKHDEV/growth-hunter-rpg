// Quest Management & Interactive Tools (Counter, Timer, Custom Quests & Honest Confirmation Pledge)
class QuestManager {
  constructor() {
    this.currentCategory = 'all';
    this.activeTimer = null;
    this.timerSecondsLeft = 0;
    this.timerQuestId = null;
    this.activeCounterQuestId = null;
    this.counterCurrentValue = 0;
    this.pendingQuestId = null;
  }

  init() {
    this.renderCategoryTabs();
    this.renderQuestList();
    this.startDailyResetCountdown();
  }

  startDailyResetCountdown() {
    const update = () => {
      const el = document.getElementById('questResetCountdown');
      if (!el) return;

      const now = new Date();
      // Next midnight (00:00:00 tomorrow)
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = nextMidnight - now;

      if (diffMs <= 0) {
        state.checkDailyReset();
        this.renderQuestList();
        if (typeof ui !== 'undefined') ui.updateHeaderAndStats();
        if (typeof ui !== 'undefined' && ui.showToast) {
          ui.showToast("🌅 자정(00:00)이 되어 일일 퀘스트가 새롭게 갱신되었습니다!", "success");
        }
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hStr = String(hours).padStart(2, '0');
      const mStr = String(mins).padStart(2, '0');
      const sStr = String(secs).padStart(2, '0');

      el.textContent = `${hStr}시간 ${mStr}분 ${sStr}초 남음 (자정 00:00 초기화)`;
    };

    update();
    setInterval(update, 1000);
  }

  setCategory(cat) {
    this.currentCategory = cat;
    this.renderCategoryTabs();
    this.renderQuestList();
    sound.playClick();
  }

  getAllQuests() {
    return [...INITIAL_QUESTS, ...state.data.quests.customQuests];
  }

  renderCategoryTabs() {
    const categories = [
      { id: 'all', name: '전체 도전과제', icon: 'list' },
      { id: 'height', name: '신체 & 키 성장', icon: 'zap' },
      { id: 'detox', name: '도파민 디톡스', icon: 'shield-alert' },
      { id: 'study', name: '지능 & 수험', icon: 'book' },
      { id: 'fitness', name: '체력 & 운동', icon: 'activity' }
    ];

    const container = document.getElementById('questCategoryTabs');
    if (!container) return;

    container.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `cat-tab-btn ${this.currentCategory === cat.id ? 'active' : ''}`;
      btn.innerHTML = `<span>${cat.name}</span>`;
      btn.onclick = () => this.setCategory(cat.id);
      container.appendChild(btn);
    });
  }

  renderQuestList() {
    const listContainer = document.getElementById('questList');
    if (!listContainer) return;

    const allQuests = this.getAllQuests();
    const filtered = this.currentCategory === 'all' 
      ? allQuests 
      : allQuests.filter(q => q.category === this.currentCategory);

    listContainer.innerHTML = '';

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-quest-state">
          <p>해당 카테고리의 퀘스트가 없습니다.</p>
          <button class="btn btn-sm btn-primary" onclick="quests.openCustomQuestModal()">+ 나만의 퀘스트 추가</button>
        </div>
      `;
      return;
    }

    filtered.forEach(quest => {
      const isCompleted = !!state.data.quests.completedToday[quest.id];
      const tierInfo = TIER_CONFIG[quest.tier] || TIER_CONFIG.D;

      const card = document.createElement('div');
      card.className = `quest-card ${isCompleted ? 'completed' : ''} tier-${quest.tier.toLowerCase()}`;
      card.dataset.questId = quest.id;

      let actionHtml = '';
      if (isCompleted) {
        actionHtml = `<div class="quest-done-badge"><i class="icon-check">✓</i> 완료됨</div>`;
      } else {
        if (quest.type === 'counter') {
          actionHtml = `
            <button class="btn btn-sm btn-outline-cyan" onclick="quests.openCounterModal('${quest.id}')">
              카운터 열기 (${quest.targetCount}${quest.unit})
            </button>
            <button class="btn btn-sm btn-primary" onclick="quests.promptConfirmClaim('${quest.id}')">
              완료 인증
            </button>
          `;
        } else if (quest.type === 'timer') {
          const minutes = Math.round(quest.targetSeconds / 60);
          actionHtml = `
            <button class="btn btn-sm btn-outline-cyan" onclick="quests.openTimerModal('${quest.id}')">
              타이머 시작 (${minutes}분)
            </button>
            <button class="btn btn-sm btn-primary" onclick="quests.promptConfirmClaim('${quest.id}')">
              완료 인증
            </button>
          `;
        } else {
          actionHtml = `
            <button class="btn btn-sm btn-primary" onclick="quests.promptConfirmClaim('${quest.id}')">
              완료 인증
            </button>
          `;
        }
      }

      card.innerHTML = `
        <div class="quest-card-header">
          <div class="quest-badge-wrap">
            <span class="quest-tier-badge" style="background:${tierInfo.bg}; color:${tierInfo.color}; border: 1px solid ${tierInfo.border}">
              ${tierInfo.name}
            </span>
            <span class="quest-category-badge">${quest.categoryName}</span>
          </div>
          <div class="quest-rewards-preview">
            <span class="reward-exp">+${quest.exp} EXP</span>
            <span class="reward-gold">+${quest.gold} G</span>
            ${quest.growthPoints ? `<span class="reward-growth">+${quest.growthPoints} 키 성장치 (+${(quest.growthPoints / 1000 * 0.1).toFixed(3)}cm)</span>` : ''}
          </div>
        </div>
        <div class="quest-card-body">
          <h4 class="quest-title">${quest.title}</h4>
          <p class="quest-desc">${quest.description}</p>
        </div>
        <div class="quest-card-footer">
          ${actionHtml}
        </div>
      `;

      listContainer.appendChild(card);
    });
  }

  // --- Honest Confirmation Pledge Modal (한번 더 "정말 완료하시겠습니까?") ---

  promptConfirmClaim(questId) {
    sound.playClick();
    const all = this.getAllQuests();
    const quest = all.find(q => q.id === questId);
    if (!quest) return;

    if (state.data.quests.completedToday[questId]) {
      ui.showToast("이미 오늘 완료한 퀘스트입니다!");
      return;
    }

    this.pendingQuestId = questId;

    const modal = document.getElementById('questConfirmModal');
    const titleEl = document.getElementById('confirmQuestTitle');
    const rewardsEl = document.getElementById('confirmQuestRewards');

    if (titleEl) titleEl.textContent = `[${quest.title}]`;
    if (rewardsEl) {
      rewardsEl.textContent = `보상: +${quest.exp} EXP | +${quest.gold} 골드 | +${quest.growthPoints} 키 성장치`;
    }

    if (modal) modal.classList.remove('hidden');
  }

  confirmPledge() {
    if (!this.pendingQuestId) return;
    const questId = this.pendingQuestId;
    this.pendingQuestId = null;

    const modal = document.getElementById('questConfirmModal');
    if (modal) modal.classList.add('hidden');

    this.executeClaimQuest(questId);
  }

  cancelPledge() {
    this.pendingQuestId = null;
    const modal = document.getElementById('questConfirmModal');
    if (modal) modal.classList.add('hidden');
    sound.playClick();
  }

  executeClaimQuest(questId) {
    sound.playQuestComplete();
    const result = state.completeQuest(questId);
    if (!result) return;

    ui.createParticleBurst(window.innerWidth / 2, window.innerHeight / 2);
    ui.showToast(`✨ 퀘스트 완수! +${result.quest.exp} EXP, +${result.gold} 골드, +${result.growthPoints} 성장치 획득!`);

    if (result.expResult && result.expResult.leveledUp) {
      sound.playLevelUp();
      ui.showLevelUpModal(result.expResult);
    }

    this.renderQuestList();
    ui.updateHeaderAndStats();
  }

  // --- Interactive Counter Modal (e.g. 줄넘기 1000회) ---

  openCounterModal(questId) {
    sound.playClick();
    const all = this.getAllQuests();
    const quest = all.find(q => q.id === questId);
    if (!quest) return;

    this.activeCounterQuestId = questId;
    this.counterCurrentValue = 0;

    const modal = document.getElementById('questCounterModal');
    const title = document.getElementById('counterModalTitle');
    const target = document.getElementById('counterModalTarget');
    const current = document.getElementById('counterModalCurrent');
    const bar = document.getElementById('counterModalBar');

    if (title) title.textContent = quest.title;
    if (target) target.textContent = `목표: ${quest.targetCount} ${quest.unit}`;
    if (current) current.textContent = `0`;
    if (bar) bar.style.width = '0%';

    modal.classList.remove('hidden');
  }

  incrementCounter(amount) {
    if (!this.activeCounterQuestId) return;
    const all = this.getAllQuests();
    const quest = all.find(q => q.id === this.activeCounterQuestId);
    if (!quest) return;

    sound.playClick();
    this.counterCurrentValue += amount;
    const current = document.getElementById('counterModalCurrent');
    const bar = document.getElementById('counterModalBar');

    if (current) current.textContent = this.counterCurrentValue;
    const pct = Math.min(100, (this.counterCurrentValue / quest.targetCount) * 100);
    if (bar) bar.style.width = `${pct}%`;

    if (this.counterCurrentValue >= quest.targetCount) {
      sound.playQuestComplete();
      ui.showToast("🎉 목표 횟수 달성! 완료 인증을 진행하세요.");
    }
  }

  resetCounter() {
    this.counterCurrentValue = 0;
    const current = document.getElementById('counterModalCurrent');
    const bar = document.getElementById('counterModalBar');
    if (current) current.textContent = '0';
    if (bar) bar.style.width = '0%';
  }

  finishCounter() {
    if (!this.activeCounterQuestId) return;
    const questId = this.activeCounterQuestId;
    document.getElementById('questCounterModal').classList.add('hidden');
    this.activeCounterQuestId = null;
    this.promptConfirmClaim(questId);
  }

  closeCounterModal() {
    document.getElementById('questCounterModal').classList.add('hidden');
    this.activeCounterQuestId = null;
  }

  // --- Interactive Timer Modal ---

  openTimerModal(questId) {
    sound.playClick();
    const all = this.getAllQuests();
    const quest = all.find(q => q.id === questId);
    if (!quest) return;

    this.timerQuestId = questId;
    this.timerSecondsLeft = quest.targetSeconds || 1200;

    const modal = document.getElementById('questTimerModal');
    const title = document.getElementById('timerModalTitle');
    const clock = document.getElementById('timerModalClock');

    if (title) title.textContent = quest.title;
    this.updateTimerDisplay(clock, this.timerSecondsLeft);

    modal.classList.remove('hidden');
  }

  startTimer() {
    if (this.activeTimer) return;
    sound.playClick();

    const clock = document.getElementById('timerModalClock');
    const startBtn = document.getElementById('timerStartBtn');
    const pauseBtn = document.getElementById('timerPauseBtn');

    if (startBtn) startBtn.classList.add('hidden');
    if (pauseBtn) pauseBtn.classList.remove('hidden');

    this.activeTimer = setInterval(() => {
      this.timerSecondsLeft--;
      this.updateTimerDisplay(clock, this.timerSecondsLeft);

      if (this.timerSecondsLeft <= 0) {
        clearInterval(this.activeTimer);
        this.activeTimer = null;
        sound.playLevelUp();
        ui.showToast("⏰ 타이머 종료! 목표 시간을 완수하였습니다!");
        if (startBtn) startBtn.classList.remove('hidden');
        if (pauseBtn) pauseBtn.classList.add('hidden');
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.activeTimer) {
      clearInterval(this.activeTimer);
      this.activeTimer = null;
    }
    const startBtn = document.getElementById('timerStartBtn');
    const pauseBtn = document.getElementById('timerPauseBtn');
    if (startBtn) startBtn.classList.remove('hidden');
    if (pauseBtn) pauseBtn.classList.add('hidden');
    sound.playClick();
  }

  finishTimer() {
    if (this.activeTimer) {
      clearInterval(this.activeTimer);
      this.activeTimer = null;
    }
    const questId = this.timerQuestId;
    document.getElementById('questTimerModal').classList.add('hidden');
    this.timerQuestId = null;
    if (questId) {
      this.promptConfirmClaim(questId);
    }
  }

  closeTimerModal() {
    if (this.activeTimer) {
      clearInterval(this.activeTimer);
      this.activeTimer = null;
    }
    document.getElementById('questTimerModal').classList.add('hidden');
    this.timerQuestId = null;
  }

  updateTimerDisplay(el, totalSeconds) {
    if (!el) return;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');

    el.textContent = `${hStr}${mStr}:${sStr}`;
  }

  // --- Custom Quest Creator Modal ---

  openCustomQuestModal() {
    sound.playClick();
    document.getElementById('customQuestModal').classList.remove('hidden');
  }

  closeCustomQuestModal() {
    document.getElementById('customQuestModal').classList.add('hidden');
  }

  saveCustomQuest(formData) {
    const newQuest = state.addCustomQuest(formData);
    this.closeCustomQuestModal();
    this.renderQuestList();
    ui.showToast(`나만의 퀘스트 [${newQuest.title}] 등록 완료!`);
  }
}

// Global quest manager instance
const quests = new QuestManager();
