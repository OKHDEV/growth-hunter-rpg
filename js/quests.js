// Quest Management & Interactive Tools (Counter, Timer, Custom Quests & Honest Confirmation Pledge)
class QuestManager {
  constructor() {
    this.currentCategory = 'all';
    this.viewMode = 'all'; // 'all' | 'folder' | 'day'
    this.activeFolderId = null;
    this.managingFolderId = null;
    this.managingDayKey = null;
    this.activeTimer = null;
    this.timerSecondsLeft = 0;
    this.timerQuestId = null;
    this.activeCounterQuestId = null;
    this.counterCurrentValue = 0;
    this.pendingQuestId = null;
    this.selectedDeleteQuestId = null;
    this.editingQuestId = null;
    this._isExpUserEdited = false;
    this._isGoldUserEdited = false;
    this._isGrowthUserEdited = false;
  }

  init() {
    this.renderCategoryTabs();
    this.renderCurrentView();
    this.startDailyResetCountdown();
    this.setupCustomQuestInputWatchers();
  }

  startDailyResetCountdown() {
    const update = () => {
      const el = document.getElementById('questResetCountdown');
      if (!el) return;

      const now = new Date();
      // Reset is at midnight (00:00:00) every day.
      // Next reset is tomorrow 00:00:00.
      let nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const diffMs = nextReset - now;

      if (diffMs <= 0) {
        state.checkDailyReset();
        this.renderQuestList();
        if (typeof ui !== 'undefined') ui.updateHeaderAndStats();
        if (typeof ui !== 'undefined' && ui.showToast) {
          ui.showToast("🌙 밤 12:00(자정)가 되어 일일 퀘스트가 새롭게 갱신되었습니다!", "success");
        }
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hStr = String(hours).padStart(2, '0');
      const mStr = String(mins).padStart(2, '0');
      const sStr = String(secs).padStart(2, '0');

      el.textContent = `${hStr}시간 ${mStr}분 ${sStr}초 남음 (밤 12:00 자정 초기화)`;
    };

    update();
    setInterval(update, 1000);
  }

  updateViewModeButtons() {
    ['btnModeAll', 'btnModeFolder', 'btnModeDay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    if (this.viewMode === 'all') {
      const el = document.getElementById('btnModeAll');
      if (el) el.classList.add('active');
    } else if (this.viewMode === 'folder') {
      const el = document.getElementById('btnModeFolder');
      if (el) el.classList.add('active');
    } else if (this.viewMode === 'day') {
      const el = document.getElementById('btnModeDay');
      if (el) el.classList.add('active');
    }
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.updateViewModeButtons();
    sound.playClick();

    const catTabs = document.getElementById('questCategoryTabs');
    const questList = document.getElementById('questList');
    const folderView = document.getElementById('questFolderView');
    const dayView = document.getElementById('questDayView');

    if (mode === 'all') {
      if (catTabs) catTabs.classList.remove('hidden');
      if (questList) questList.classList.remove('hidden');
      if (folderView) folderView.classList.add('hidden');
      if (dayView) dayView.classList.add('hidden');
      this.renderCategoryTabs();
      this.renderQuestList();
    } else if (mode === 'folder') {
      if (catTabs) catTabs.classList.add('hidden');
      if (questList) questList.classList.add('hidden');
      if (folderView) folderView.classList.remove('hidden');
      if (dayView) dayView.classList.add('hidden');
      this.renderFolderView();
    } else if (mode === 'day') {
      if (catTabs) catTabs.classList.add('hidden');
      if (questList) questList.classList.add('hidden');
      if (folderView) folderView.classList.add('hidden');
      if (dayView) dayView.classList.remove('hidden');
      this.renderDayView();
    }
  }

  setCategory(cat) {
    this.currentCategory = cat;
    this.viewMode = 'all';
    this.updateViewModeButtons();

    const catTabs = document.getElementById('questCategoryTabs');
    const questList = document.getElementById('questList');
    const folderView = document.getElementById('questFolderView');
    const dayView = document.getElementById('questDayView');

    if (catTabs) catTabs.classList.remove('hidden');
    if (questList) questList.classList.remove('hidden');
    if (folderView) folderView.classList.add('hidden');
    if (dayView) dayView.classList.add('hidden');

    this.renderCategoryTabs();
    this.renderQuestList();
    sound.playClick();
  }

  renderCurrentView() {
    if (this.viewMode === 'folder') {
      this.renderFolderView();
    } else if (this.viewMode === 'day') {
      this.renderDayView();
    } else {
      this.renderQuestList();
    }
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

  createQuestCardElement(quest) {
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
        const minutes = Math.round((quest.targetSeconds || (quest.targetCount ? quest.targetCount * 60 : 1800)) / 60);
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

    const isCustom = quest.id && quest.id.startsWith('custom_');
    const editBtnHtml = isCustom ? `
      <button type="button" class="btn btn-xs btn-outline-cyan" style="font-size: 11px; padding: 2px 7px; border-color: rgba(56, 189, 248, 0.45); color: #38bdf8; background: rgba(56, 189, 248, 0.1); cursor:pointer;" onclick="quests.openEditCustomQuestModal('${quest.id}', event)" title="이 퀘스트 수정하기">
        ✏️ 수정
      </button>
    ` : '';

    card.innerHTML = `
      <div class="quest-card-header">
        <div class="quest-badge-wrap" style="display:flex; align-items:center; gap:6px;">
          <span class="quest-tier-badge" style="background:${tierInfo.bg}; color:${tierInfo.color}; border: 1px solid ${tierInfo.border}">
            ${tierInfo.name}
          </span>
          <span class="quest-category-badge">${quest.categoryName || '도전과제'}</span>
          ${isCustom ? `<span style="font-size:10px; font-weight:700; color:#38bdf8; background:rgba(56,189,248,0.12); padding:1px 5px; border-radius:3px; border:1px solid rgba(56,189,248,0.3);">⭐ 나만의</span>` : ''}
          ${editBtnHtml}
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

    return card;
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
      listContainer.appendChild(this.createQuestCardElement(quest));
    });

    if (typeof ui !== 'undefined' && ui.renderAttendanceCalendar) {
      ui.renderAttendanceCalendar();
    }
  }

  // --- View Mode 2: Folder View ---
  renderFolderView() {
    const container = document.getElementById('questFolderView');
    if (!container) return;
    container.innerHTML = '';

    const folders = (state.data && state.data.quests && state.data.quests.folders) || [];
    if (!this.activeFolderId || !folders.some(f => f.id === this.activeFolderId)) {
      this.activeFolderId = (folders[0] && folders[0].id) || null;
    }

    // 1. Folder Navigation / Selector Row
    const navRow = document.createElement('div');
    navRow.className = 'folder-tabs-row';

    folders.forEach(f => {
      const qCount = (f.questIds && f.questIds.length) || 0;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn-folder-pill ${f.id === this.activeFolderId ? 'active' : ''}`;
      btn.innerHTML = `<span>${f.name}</span> <span class="folder-badge-count">${qCount}</span>`;
      btn.onclick = () => this.selectFolder(f.id);
      navRow.appendChild(btn);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-add-folder-trigger';
    addBtn.innerHTML = '➕ 새 폴더 추가';
    addBtn.onclick = () => this.openCreateFolderModal();
    navRow.appendChild(addBtn);

    container.appendChild(navRow);

    // 2. Active Folder Content
    const activeFolder = folders.find(f => f.id === this.activeFolderId);
    if (!activeFolder) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-quest-state';
      emptyDiv.style.cssText = 'padding: 40px; text-align: center;';
      emptyDiv.innerHTML = `
        <p style="color: #94a3b8; margin-bottom: 14px;">생성된 폴더가 없습니다. 나만의 퀘스트 폴더를 만들어 체계적으로 관리해보세요!</p>
        <button type="button" class="btn btn-primary" onclick="quests.openCreateFolderModal()">📁 첫 폴더 만들기</button>
      `;
      container.appendChild(emptyDiv);
      return;
    }

    // Detail header card
    const headerCard = document.createElement('div');
    headerCard.className = 'folder-detail-card';
    const allQuests = this.getAllQuests();
    const questsInFolder = (activeFolder.questIds || [])
      .map(id => allQuests.find(q => q.id === id))
      .filter(Boolean);

    headerCard.innerHTML = `
      <div class="folder-title-left">
        <strong style="font-size: 16px; color: #fff;">📁 ${activeFolder.name}</strong>
        <span style="font-size: 12px; color: #94a3b8;">(${questsInFolder.length}개 퀘스트 등록됨)</span>
      </div>
      <div class="folder-actions-right">
        <button type="button" class="btn btn-sm btn-outline-cyan" onclick="quests.openFolderManageModal('${activeFolder.id}')">
          ➕ 이 폴더에 퀘스트 넣기 / 관리
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger" style="border-color:#ef4444; color:#ef4444;" onclick="quests.confirmDeleteFolder('${activeFolder.id}')">
          🗑️ 폴더 삭제
        </button>
      </div>
    `;
    container.appendChild(headerCard);

    // Grid of quests inside folder
    const grid = document.createElement('div');
    grid.className = 'quest-grid';

    if (questsInFolder.length === 0) {
      grid.innerHTML = `
        <div class="empty-quest-state" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
          <p style="color: #94a3b8; margin-bottom: 14px;">이 폴더에 담긴 퀘스트가 없습니다.</p>
          <button type="button" class="btn btn-sm btn-primary" onclick="quests.openFolderManageModal('${activeFolder.id}')">
            ➕ 원하는 퀘스트 담기
          </button>
        </div>
      `;
    } else {
      questsInFolder.forEach(quest => {
        grid.appendChild(this.createQuestCardElement(quest));
      });
    }

    container.appendChild(grid);
  }

  // --- View Mode 3: Day-of-Week Kanban View (요일 가로 나열, 요일별 퀘스트 세로 나열) ---
  renderDayView() {
    const container = document.getElementById('questDayView');
    if (!container) return;
    container.innerHTML = '';

    const DAYS_CONFIG = [
      { key: 'mon', name: '월요일', short: '월', dayNum: 1 },
      { key: 'tue', name: '화요일', short: '화', dayNum: 2 },
      { key: 'wed', name: '수요일', short: '수', dayNum: 3 },
      { key: 'thu', name: '목요일', short: '목', dayNum: 4 },
      { key: 'fri', name: '금요일', short: '금', dayNum: 5 },
      { key: 'sat', name: '토요일', short: '토', dayNum: 6 },
      { key: 'sun', name: '일요일', short: '일', dayNum: 0 }
    ];

    const todayNum = new Date().getDay();
    const allQuests = this.getAllQuests();
    const allQuestsMap = Object.fromEntries(allQuests.map(q => [q.id, q]));
    const dayQuestsData = (state.data && state.data.quests && state.data.quests.dayQuests) || {};

    // 1. Quick Day-Navigation Pills Bar (가로 스크롤 보조 퀵 내비게이터)
    const quickBar = document.createElement('div');
    quickBar.className = 'day-quick-nav-bar';
    DAYS_CONFIG.forEach(d => {
      const isToday = (d.dayNum === todayNum);
      const assigned = dayQuestsData[d.key] || [];
      const doneCount = assigned.filter(id => !!state.data.quests.completedToday[id]).length;
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `btn-day-quick-pill ${isToday ? 'is-today' : ''}`;
      pill.innerHTML = `
        <span class="pill-day-label">${d.short}요일</span>
        ${isToday ? '<span class="pill-today-dot">● 오늘</span>' : `<span class="pill-count-dot">${doneCount}/${assigned.length}</span>`}
      `;
      pill.onclick = () => {
        const col = document.getElementById(`dayCol_${d.key}`);
        if (col) col.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        sound.playClick();
      };
      quickBar.appendChild(pill);
    });
    container.appendChild(quickBar);

    // 2. Horizontal Scrollable Kanban Columns Container (가로로 쭈우욱)
    const kanbanRow = document.createElement('div');
    kanbanRow.className = 'day-kanban-row';
    kanbanRow.id = 'dayKanbanRow';

    DAYS_CONFIG.forEach(d => {
      const isToday = (d.dayNum === todayNum);
      const assignedIds = dayQuestsData[d.key] || [];
      const questsForDay = assignedIds.map(id => allQuestsMap[id]).filter(Boolean);
      const completedCount = questsForDay.filter(q => !!state.data.quests.completedToday[q.id]).length;

      const col = document.createElement('div');
      col.className = `day-quest-column ${isToday ? 'is-today' : ''}`;
      col.id = `dayCol_${d.key}`;

      let itemsHtml = '';
      if (questsForDay.length === 0) {
        itemsHtml = `
          <div class="day-empty-column-box">
            <div style="font-size: 26px; margin-bottom: 6px;">📋</div>
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.4; margin-bottom: 12px;">
              배정된 퀘스트가 없습니다.<br>요일별 맞춤 루틴을 등록하세요!
            </div>
            <button type="button" class="btn btn-xs btn-outline-cyan" onclick="quests.openDayManageModal('${d.key}')">
              ➕ 퀘스트 배정하기
            </button>
          </div>
        `;
      } else {
        // Quests listed vertically (세로로 쭈우욱)
        itemsHtml = questsForDay.map(quest => {
          const isCompleted = !!state.data.quests.completedToday[quest.id];
          const tierInfo = TIER_CONFIG[quest.tier] || TIER_CONFIG.D;

          let actionHtml = '';
          if (isCompleted) {
            actionHtml = `<div class="quest-done-badge" style="font-size: 11px; padding: 3px 8px;"><i class="icon-check">✓</i> 오늘 완료</div>`;
          } else if (quest.type === 'counter') {
            actionHtml = `
              <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
                <button type="button" class="btn btn-xs btn-outline-cyan" style="font-size: 11px; padding: 3px 7px;" onclick="quests.openCounterModal('${quest.id}')">
                  카운터 (${quest.targetCount}${quest.unit})
                </button>
                <button type="button" class="btn btn-xs btn-primary" style="font-size: 11px; padding: 3px 8px;" onclick="quests.promptConfirmClaim('${quest.id}')">
                  인증
                </button>
              </div>
            `;
          } else if (quest.type === 'timer') {
            const minutes = Math.round((quest.targetSeconds || (quest.targetCount ? quest.targetCount * 60 : 1800)) / 60);
            actionHtml = `
              <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
                <button type="button" class="btn btn-xs btn-outline-cyan" style="font-size: 11px; padding: 3px 7px;" onclick="quests.openTimerModal('${quest.id}')">
                  타이머 (${minutes}분)
                </button>
                <button type="button" class="btn btn-xs btn-primary" style="font-size: 11px; padding: 3px 8px;" onclick="quests.promptConfirmClaim('${quest.id}')">
                  인증
                </button>
              </div>
            `;
          } else {
            actionHtml = `
              <button type="button" class="btn btn-xs btn-primary" style="font-size: 11px; padding: 3px 10px;" onclick="quests.promptConfirmClaim('${quest.id}')">
                완료 인증
              </button>
            `;
          }

          const isCustom = quest.id && quest.id.startsWith('custom_');
          const dayEditBtn = isCustom ? `
            <button type="button" style="background:none; border:none; color:#38bdf8; font-size:12px; cursor:pointer; padding:0 3px;" title="퀘스트 수정" onclick="quests.openEditCustomQuestModal('${quest.id}', event)">✏️</button>
          ` : '';

          return `
            <div class="day-quest-item ${isCompleted ? 'completed' : ''}">
              <div class="day-quest-item-top">
                <div style="display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1;">
                  <span class="quest-tier-badge" style="background: ${tierInfo.bg}; color: ${tierInfo.color}; border: 1px solid ${tierInfo.border}; font-size: 10px; padding: 1px 5px; flex-shrink: 0;">
                    ${tierInfo.name}
                  </span>
                  <strong style="color: #fff; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${quest.title}">
                    ${quest.title}
                  </strong>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  ${dayEditBtn}
                  <button type="button" class="day-quest-remove-btn" title="이 요일에서 제외" onclick="quests.removeQuestFromDay('${d.key}', '${quest.id}')">✕</button>
                </div>
              </div>
              <div style="font-size: 11px; color: #94a3b8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${quest.description}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; gap: 6px;">
                <span style="font-size: 10.5px; color: #38bdf8; font-weight: 700; flex-shrink: 0;">+${quest.exp} EXP · +${quest.gold} G</span>
                ${actionHtml}
              </div>
            </div>
          `;
        }).join('');
      }

      col.innerHTML = `
        <div class="day-column-header">
          <div class="day-column-header-top">
            <span class="day-column-title">
              📅 ${d.name}
            </span>
            ${isToday ? '<span class="day-column-today-badge">🌟 오늘</span>' : ''}
          </div>
          <div class="day-column-header-bottom">
            <span class="day-column-progress">${completedCount}/${questsForDay.length} 완료</span>
            <button type="button" class="day-column-add-btn" onclick="quests.openDayManageModal('${d.key}')">
              ➕ 퀘스트 추가
            </button>
          </div>
        </div>
        <div class="day-column-quests-list">
          ${itemsHtml}
        </div>
      `;

      kanbanRow.appendChild(col);
    });

    container.appendChild(kanbanRow);

    // Auto-scroll to today's column after rendering
    setTimeout(() => {
      const todayCol = document.getElementById(`dayCol_${DAYS_CONFIG.find(d => d.dayNum === todayNum)?.key || 'mon'}`);
      if (todayCol && kanbanRow) {
        todayCol.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }
    }, 50);
  }

  // --- Folder Management Modals & Actions ---
  selectFolder(folderId) {
    this.activeFolderId = folderId;
    this.renderFolderView();
    sound.playClick();
  }

  openCreateFolderModal() {
    const modal = document.getElementById('createFolderModal');
    const input = document.getElementById('newFolderNameInput');
    if (input) input.value = '';
    if (modal) modal.classList.remove('hidden');
    sound.playClick();
    setTimeout(() => { if (input) input.focus(); }, 100);
  }

  closeCreateFolderModal() {
    const modal = document.getElementById('createFolderModal');
    if (modal) modal.classList.add('hidden');
    sound.playClick();
  }

  confirmCreateFolder() {
    const input = document.getElementById('newFolderNameInput');
    const val = input ? input.value.trim() : '';
    if (!val) {
      alert('폴더 이름을 입력해주세요.');
      return;
    }
    const created = state.createQuestFolder(val);
    if (created) {
      this.activeFolderId = created.id;
      this.closeCreateFolderModal();
      this.renderFolderView();
      if (typeof ui !== 'undefined' && ui.showToast) {
        ui.showToast(`📁 '${created.name}' 폴더가 생성되었습니다!`, 'success');
      }
    }
  }

  confirmDeleteFolder(folderId) {
    const folders = (state.data && state.data.quests && state.data.quests.folders) || [];
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    if (confirm(`'${folder.name}' 폴더를 정말 삭제하시겠습니까?\n(폴더 안의 퀘스트 자체는 삭제되지 않습니다)`)) {
      state.deleteQuestFolder(folderId);
      this.activeFolderId = null;
      this.renderFolderView();
      if (typeof ui !== 'undefined' && ui.showToast) {
        ui.showToast(`🗑️ '${folder.name}' 폴더가 삭제되었습니다.`, 'info');
      }
    }
  }

  openFolderManageModal(folderId) {
    this.managingFolderId = folderId;
    const folders = (state.data && state.data.quests && state.data.quests.folders) || [];
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const modal = document.getElementById('folderManageModal');
    const title = document.getElementById('folderManageTitle');
    const list = document.getElementById('folderManageQuestList');

    if (title) title.textContent = `[${folder.name}] 퀘스트 선택`;
    if (list) {
      list.innerHTML = '';
      const allQuests = this.getAllQuests();
      allQuests.forEach(q => {
        const isChecked = (folder.questIds || []).includes(q.id);
        const item = document.createElement('label');
        item.style.cssText = 'display:flex; align-items:center; gap:10px; padding:10px 12px; background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;';
        item.innerHTML = `
          <input type="checkbox" value="${q.id}" ${isChecked ? 'checked' : ''} style="width:18px; height:18px; accent-color:#38bdf8; cursor:pointer;">
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
              <span style="font-size:10px; padding:1px 5px; border-radius:3px; background:#1e293b; color:#38bdf8;">${q.categoryName || '도전과제'}</span>
              <strong style="color:#fff; font-size:13px;">${q.title}</strong>
            </div>
            <div style="font-size:11px; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${q.description}</div>
          </div>
        `;
        list.appendChild(item);
      });
    }

    if (modal) modal.classList.remove('hidden');
    sound.playClick();
  }

  closeFolderManageModal() {
    const modal = document.getElementById('folderManageModal');
    if (modal) modal.classList.add('hidden');
    sound.playClick();
  }

  saveFolderQuests() {
    if (!this.managingFolderId) return;
    const list = document.getElementById('folderManageQuestList');
    if (!list) return;

    const checkedInputs = list.querySelectorAll('input[type="checkbox"]:checked');
    const checkedIds = Array.from(checkedInputs).map(cb => cb.value);

    state.updateFolderQuests(this.managingFolderId, checkedIds);
    this.closeFolderManageModal();
    this.renderFolderView();
    if (typeof ui !== 'undefined' && ui.showToast) {
      ui.showToast('✅ 폴더 퀘스트가 저장되었습니다!', 'success');
    }
  }

  // --- Day-of-Week Management Modals & Actions ---
  openDayManageModal(dayKey) {
    this.managingDayKey = dayKey;
    const DAYS_CONFIG = {
      mon: '월요일', tue: '화요일', wed: '수요일',
      thu: '목요일', fri: '금요일', sat: '토요일', sun: '일요일'
    };
    const dayName = DAYS_CONFIG[dayKey] || dayKey;

    const modal = document.getElementById('dayManageModal');
    const title = document.getElementById('dayManageTitle');
    const list = document.getElementById('dayManageQuestList');

    if (title) title.textContent = `[${dayName}] 퀘스트 선택`;
    if (list) {
      list.innerHTML = '';
      const allQuests = this.getAllQuests();
      const dayData = (state.data && state.data.quests && state.data.quests.dayQuests) || {};
      const assignedIds = dayData[dayKey] || [];

      allQuests.forEach(q => {
        const isChecked = assignedIds.includes(q.id);
        const item = document.createElement('label');
        item.style.cssText = 'display:flex; align-items:center; gap:10px; padding:10px 12px; background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer;';
        item.innerHTML = `
          <input type="checkbox" value="${q.id}" ${isChecked ? 'checked' : ''} style="width:18px; height:18px; accent-color:#a855f7; cursor:pointer;">
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
              <span style="font-size:10px; padding:1px 5px; border-radius:3px; background:#1e293b; color:#c084fc;">${q.categoryName || '도전과제'}</span>
              <strong style="color:#fff; font-size:13px;">${q.title}</strong>
            </div>
            <div style="font-size:11px; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${q.description}</div>
          </div>
        `;
        list.appendChild(item);
      });
    }

    if (modal) modal.classList.remove('hidden');
    sound.playClick();
  }

  closeDayManageModal() {
    const modal = document.getElementById('dayManageModal');
    if (modal) modal.classList.add('hidden');
    sound.playClick();
  }

  saveDayQuests() {
    if (!this.managingDayKey) return;
    const list = document.getElementById('dayManageQuestList');
    if (!list) return;

    const checkedInputs = list.querySelectorAll('input[type="checkbox"]:checked');
    const checkedIds = Array.from(checkedInputs).map(cb => cb.value);

    state.updateDayQuests(this.managingDayKey, checkedIds);
    this.closeDayManageModal();
    this.renderDayView();
    if (typeof ui !== 'undefined' && ui.showToast) {
      ui.showToast('✅ 요일 퀘스트 배정이 저장되었습니다!', 'success');
    }
  }

  removeQuestFromDay(dayKey, questId) {
    state.removeQuestFromDay(dayKey, questId);
    this.renderDayView();
    if (typeof ui !== 'undefined' && ui.showToast) {
      ui.showToast('해당 요일에서 퀘스트가 제외되었습니다.', 'info');
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

    const titleMults = result.titleMultipliers || state.getActiveTitleMultipliers();
    const finalExp = result.expResult ? result.expResult.expAdded : result.quest.exp;
    const finalGold = (result.goldResult && result.goldResult.goldAdded) ? result.goldResult.goldAdded : (result.gold || (result.quest ? result.quest.gold : 0));

    let toastMsg = `✨ 퀘스트 완수! +${finalExp.toLocaleString()} EXP`;
    if (titleMults && titleMults.expMultiplier > 1) {
      toastMsg += ` (칭호 x${titleMults.expMultiplier})`;
    }
    toastMsg += `, +${finalGold.toLocaleString()} 골드`;
    if (titleMults && titleMults.goldMultiplier > 1) {
      toastMsg += ` (칭호 x${titleMults.goldMultiplier})`;
    }
    toastMsg += `, +${result.growthPoints} 성장치 획득!`;

    ui.showToast(toastMsg);

    if (result.newlyUnlockedTitles && result.newlyUnlockedTitles.length > 0) {
      result.newlyUnlockedTitles.forEach(tName => {
        ui.showToast(`🎉 각성 칭호 획득! [${tName}]`, "gold");
      });
      if (typeof ui !== 'undefined' && ui.renderInventory) {
        ui.renderInventory();
      }
    }

    if (result.expResult && result.expResult.leveledUp) {
      sound.playLevelUp();
      ui.showLevelUpModal(result.expResult);
    }

    this.renderCurrentView();
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

  // --- Custom Quest Creator & Editor Modal ---

  setupCustomQuestInputWatchers() {
    if (typeof document === 'undefined') return;
    const expEl = document.getElementById('cqExp');
    const goldEl = document.getElementById('cqGold');
    const growthEl = document.getElementById('cqGrowth');
    if (expEl) expEl.addEventListener('input', () => { this._isExpUserEdited = true; });
    if (goldEl) goldEl.addEventListener('input', () => { this._isGoldUserEdited = true; });
    if (growthEl) growthEl.addEventListener('input', () => { this._isGrowthUserEdited = true; });
  }

  onCustomQuestTierChange(tier) {
    const rewards = {
      D: { exp: 180, gold: 60, growth: 5 },
      C: { exp: 320, gold: 100, growth: 10 },
      B: { exp: 500, gold: 160, growth: 15 },
      A: { exp: 850, gold: 280, growth: 22 },
      S: { exp: 1400, gold: 450, growth: 30 }
    };
    const r = rewards[tier] || rewards.B;
    const expEl = document.getElementById('cqExp');
    const goldEl = document.getElementById('cqGold');
    const growthEl = document.getElementById('cqGrowth');

    if (expEl && !this._isExpUserEdited) {
      expEl.value = r.exp;
    }
    if (goldEl && !this._isGoldUserEdited) {
      goldEl.value = r.gold;
    }
    if (growthEl && !this._isGrowthUserEdited) {
      growthEl.value = r.growth;
    }
  }

  applyTierDefaultRewards() {
    sound.playClick();
    const tierSelect = document.getElementById('cqTier');
    const tier = (tierSelect && tierSelect.value) || 'B';
    const rewards = {
      D: { exp: 180, gold: 60, growth: 5 },
      C: { exp: 320, gold: 100, growth: 10 },
      B: { exp: 500, gold: 160, growth: 15 },
      A: { exp: 850, gold: 280, growth: 22 },
      S: { exp: 1400, gold: 450, growth: 30 }
    };
    const r = rewards[tier] || rewards.B;
    const expEl = document.getElementById('cqExp');
    const goldEl = document.getElementById('cqGold');
    const growthEl = document.getElementById('cqGrowth');

    if (expEl) expEl.value = r.exp;
    if (goldEl) goldEl.value = r.gold;
    if (growthEl) growthEl.value = r.growth;

    this._isExpUserEdited = false;
    this._isGoldUserEdited = false;
    this._isGrowthUserEdited = false;

    if (typeof ui !== 'undefined' && ui.showToast) {
      ui.showToast(`✨ [${tier}등급] 추천 보상 적용 완료! (EXP ${r.exp} · ${r.gold} G)`, 'info');
    }
  }

  onCustomQuestTypeChange(type) {
    const countLabel = document.getElementById('cqCountLabel');
    const countInput = document.getElementById('cqCount');
    const unitLabel = document.getElementById('cqUnitLabel');
    const unitInput = document.getElementById('cqUnit');

    if (type === 'timer') {
      if (countLabel) countLabel.textContent = '목표 시간 (분)';
      if (countInput) {
        countInput.placeholder = '예: 30 (분 단위)';
        if (!countInput.value || countInput.value === '50') countInput.value = '30';
      }
      if (unitLabel) unitLabel.textContent = '단위';
      if (unitInput) {
        unitInput.value = '분';
        unitInput.placeholder = '분';
      }
    } else if (type === 'counter') {
      if (countLabel) countLabel.textContent = '목표치 (횟수)';
      if (countInput) {
        countInput.placeholder = '예: 50';
        if (!countInput.value || countInput.value === '30') countInput.value = '50';
      }
      if (unitLabel) unitLabel.textContent = '단위';
      if (unitInput) {
        if (unitInput.value === '분') unitInput.value = '회';
        unitInput.placeholder = '예: 회, 세트';
      }
    } else {
      // check
      if (countLabel) countLabel.textContent = '목표치 (선택)';
      if (countInput) countInput.placeholder = '원클릭 즉시 완료';
      if (unitLabel) unitLabel.textContent = '단위';
      if (unitInput && unitInput.value === '분') unitInput.value = '회';
    }
  }

  openCustomQuestModal() {
    sound.playClick();
    this.editingQuestId = null;
    this._isExpUserEdited = false;
    this._isGoldUserEdited = false;
    this._isGrowthUserEdited = false;

    const modal = document.getElementById('customQuestModal');
    const titleEl = document.getElementById('customQuestModalTitle');
    const submitBtn = document.getElementById('cqSubmitBtn');
    const editIdInput = document.getElementById('cqEditId');
    const form = document.getElementById('customQuestForm');

    if (form) form.reset();
    if (editIdInput) editIdInput.value = '';
    if (titleEl) titleEl.textContent = '+ 나만의 현실 도전과제 생성';
    if (submitBtn) submitBtn.textContent = '퀘스트 등록';

    const tierSelect = document.getElementById('cqTier');
    if (tierSelect) {
      tierSelect.value = 'B';
      this.onCustomQuestTierChange('B');
    }
    const typeSelect = document.getElementById('cqType');
    if (typeSelect) {
      typeSelect.value = 'check';
      this.onCustomQuestTypeChange('check');
    }

    if (modal) modal.classList.remove('hidden');
  }

  openEditCustomQuestModal(questId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    sound.playClick();

    const allQuests = this.getAllQuests();
    const quest = allQuests.find(q => q.id === questId);
    if (!quest) return;

    this.editingQuestId = questId;
    this._isExpUserEdited = true; // Retain current quest values initially
    this._isGoldUserEdited = true;
    this._isGrowthUserEdited = true;

    const modal = document.getElementById('customQuestModal');
    const titleEl = document.getElementById('customQuestModalTitle');
    const submitBtn = document.getElementById('cqSubmitBtn');
    const editIdInput = document.getElementById('cqEditId');

    if (titleEl) titleEl.textContent = '✏️ 나만의 현실 도전과제 수정';
    if (submitBtn) submitBtn.textContent = '수정 완료';
    if (editIdInput) editIdInput.value = questId;

    const titleInput = document.getElementById('cqTitle');
    const descInput = document.getElementById('cqDesc');
    const catSelect = document.getElementById('cqCategory');
    const tierSelect = document.getElementById('cqTier');
    const expInput = document.getElementById('cqExp');
    const goldInput = document.getElementById('cqGold');
    const growthInput = document.getElementById('cqGrowth');
    const typeSelect = document.getElementById('cqType');
    const countInput = document.getElementById('cqCount');
    const unitInput = document.getElementById('cqUnit');

    if (titleInput) titleInput.value = quest.title || '';
    if (descInput) descInput.value = quest.description || '';
    if (catSelect) catSelect.value = quest.category || 'height';
    if (tierSelect) tierSelect.value = quest.tier || 'B';
    if (expInput) expInput.value = quest.exp !== undefined ? quest.exp : 500;
    if (goldInput) goldInput.value = quest.gold !== undefined ? quest.gold : 160;
    if (growthInput) growthInput.value = quest.growthPoints !== undefined ? quest.growthPoints : 15;

    const qType = quest.type || 'check';
    if (typeSelect) typeSelect.value = qType;
    this.onCustomQuestTypeChange(qType);

    if (qType === 'timer') {
      const mins = Math.round((quest.targetSeconds || (quest.targetCount ? quest.targetCount * 60 : 1800)) / 60);
      if (countInput) countInput.value = mins || 30;
      if (unitInput) unitInput.value = '분';
    } else if (qType === 'counter') {
      if (countInput) countInput.value = quest.targetCount || 50;
      if (unitInput) unitInput.value = quest.unit || '회';
    } else {
      if (countInput) countInput.value = quest.targetCount || '';
      if (unitInput) unitInput.value = quest.unit || '회';
    }

    if (modal) modal.classList.remove('hidden');
  }

  closeCustomQuestModal() {
    this.editingQuestId = null;
    const modal = document.getElementById('customQuestModal');
    if (modal) modal.classList.add('hidden');
  }

  saveCustomQuest(formData) {
    const newQuest = state.addCustomQuest(formData);
    this.closeCustomQuestModal();
    this.renderCurrentView();
    if (typeof ui !== 'undefined' && ui.renderAttendanceCalendar) {
      ui.renderAttendanceCalendar();
    }
    ui.showToast(`나만의 퀘스트 [${newQuest.title}] 등록 완료!`, 'success');
  }

  updateCustomQuest(questId, formData) {
    const updated = state.updateCustomQuest(questId, formData);
    this.closeCustomQuestModal();
    this.renderCurrentView();
    if (typeof ui !== 'undefined' && ui.renderAttendanceCalendar) {
      ui.renderAttendanceCalendar();
    }
    ui.showToast(`✨ [${(updated && updated.title) || '퀘스트'}] 수정이 완료되었습니다!`, 'success');
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
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
              ${isCustom ? `<button type="button" class="btn btn-sm btn-outline-cyan" style="font-size:11px; padding:5px 8px;" onclick="event.stopPropagation(); quests.closeDeleteQuestModal(); quests.openEditCustomQuestModal('${q.id}', event);">✏️ 수정</button>` : ''}
              <button type="button" class="btn btn-sm btn-outline-danger" style="border-color:#ef4444; color:#ef4444; font-size:11px; padding:5px 10px;">
                선택
              </button>
            </div>
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
