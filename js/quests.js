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
    this.selectedDeleteQuestId = null;
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
    const deleted = (state.data && state.data.quests && state.data.quests.deletedQuestIds) || [];
    const custom = (state.data && state.data.quests && state.data.quests.customQuests) || [];
    return [...INITIAL_QUESTS, ...custom].filter(q => !deleted.includes(q.id));
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

    if (typeof ui !== 'undefined' && ui.renderAttendanceCalendar) {
      ui.renderAttendanceCalendar();
    }
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
    if (typeof ui !== 'undefined' && ui.renderAttendanceCalendar) {
      ui.renderAttendanceCalendar();
    }
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

  // --- Quest Deletion Modal ---

  openDeleteQuestModal() {
    sound.playClick();
    this.selectedDeleteQuestId = null;
    const modal = document.getElementById('deleteQuestModal');
    const select = document.getElementById('deleteQuestSelect');
    const previewList = document.getElementById('deleteQuestListPreview');
    const warningBox = document.getElementById('deleteQuestWarningBox');

    if (!modal) return;

    if (warningBox) warningBox.classList.add('hidden');

    const allQuests = this.getAllQuests();

    // Populate Select Box
    if (select) {
      select.innerHTML = '<option value="">-- 삭제할 퀘스트를 선택하세요 --</option>';
      allQuests.forEach(q => {
        const isCustom = q.id.startsWith('custom_');
        const opt = document.createElement('option');
        opt.value = q.id;
        opt.textContent = `${isCustom ? '⭐ [나만의 퀘스트] ' : '[기본] '}${q.title} (${q.categoryName || q.category})`;
        select.appendChild(opt);
      });
    }

    // Populate Quick Interactive Preview List
    if (previewList) {
      if (allQuests.length === 0) {
        previewList.innerHTML = '<div style="color:#94a3b8; font-size:13px; text-align:center; padding:16px;">현재 등록된 퀘스트가 없습니다.</div>';
      } else {
        previewList.innerHTML = '';
        allQuests.forEach(q => {
          const isCustom = q.id.startsWith('custom_');
          const item = document.createElement('div');
          item.className = 'delete-quest-item';
          item.id = `delItem_${q.id}`;
          item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:10px 12px; cursor:pointer; transition:all 0.15s ease;';
          item.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:3px; overflow:hidden;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:11px; font-weight:bold; color:${isCustom ? '#06b6d4' : '#94a3b8'};">
                  ${isCustom ? '⭐ 나만의 퀘스트' : '기본'}
                </span>
                <span style="font-weight:700; color:#fff; font-size:13px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">
                  ${q.title}
                </span>
              </div>
              <div style="font-size:11px; color:#94a3b8;">
                보상: EXP +${q.exp} | 골드 +${q.gold} | 키 성장 +${q.growthPoints || 0}
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" style="border-color:#ef4444; color:#ef4444; font-size:11px; padding:5px 10px; flex-shrink:0;">
              선택
            </button>
          `;
          item.onclick = () => this.onSelectQuestToDelete(q.id);
          previewList.appendChild(item);
        });
      }
    }

    modal.classList.remove('hidden');
  }

  closeDeleteQuestModal() {
    sound.playClick();
    const modal = document.getElementById('deleteQuestModal');
    if (modal) modal.classList.add('hidden');
    this.selectedDeleteQuestId = null;
  }

  onSelectQuestToDelete(questId) {
    if (!questId) {
      this.selectedDeleteQuestId = null;
      const warningBox = document.getElementById('deleteQuestWarningBox');
      if (warningBox) warningBox.classList.add('hidden');
      return;
    }

    sound.playClick();
    this.selectedDeleteQuestId = questId;

    const allQuests = this.getAllQuests();
    const quest = allQuests.find(q => q.id === questId);
    if (!quest) return;

    // Sync select dropdown
    const select = document.getElementById('deleteQuestSelect');
    if (select && select.value !== questId) {
      select.value = questId;
    }

    // Highlight item in list
    document.querySelectorAll('.delete-quest-item').forEach(el => {
      el.style.borderColor = '#334155';
      el.style.background = '#0f172a';
    });
    const targetItem = document.getElementById(`delItem_${questId}`);
    if (targetItem) {
      targetItem.style.borderColor = '#ef4444';
      targetItem.style.background = 'rgba(239, 68, 68, 0.14)';
    }

    // Show warning box
    const warningBox = document.getElementById('deleteQuestWarningBox');
    const titleEl = document.getElementById('deleteTargetTitle');
    if (warningBox && titleEl) {
      titleEl.textContent = `[${quest.title}]`;
      warningBox.classList.remove('hidden');
    }
  }

  confirmDeleteSelectedQuest() {
    if (!this.selectedDeleteQuestId) {
      alert("지울 퀘스트를 선택해주세요!");
      return;
    }

    const allQuests = this.getAllQuests();
    const quest = allQuests.find(q => q.id === this.selectedDeleteQuestId);
    if (!quest) {
      alert("선택한 퀘스트를 찾을 수 없습니다.");
      return;
    }

    // User requested confirmation prompt: "진짜 삭제하겠습니까?"
    const really = confirm(`[${quest.title}]\n\n이 퀘스트를 진짜 삭제하겠습니까?`);
    if (!really) return;

    sound.playClick();
    state.deleteQuest(quest.id);

    this.closeDeleteQuestModal();
    this.renderQuestList();

    if (typeof ui !== 'undefined' && ui.showToast) {
      ui.showToast(`🗑️ [${quest.title}] 퀘스트가 삭제되었습니다!`, "info");
    }
  }
}

// Global quest manager instance
const quests = new QuestManager();
