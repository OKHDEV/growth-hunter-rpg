// UI Management: High School 2nd Grade (173cm -> 178cm) & 3D Boxing Controls & Modals
class UIManager {
  constructor() {
    this.currentTab = 'statusTab';
    this.currentBossZone = 1;
    this.currentCalYear = new Date().getFullYear();
    this.currentCalMonth = new Date().getMonth();
    this.calendarViewMode = 'month';
    this.isUnownedTitlesExpanded = false;
    this.authGateMode = 'login';
    this.particleCanvas = null;
    this.particleCtx = null;
    this.particles = [];
  }

  init() {
    this.initCanvas();
    this.setupTabNavigation();
    this.updateAuthGateVisibility();
    this.updateHeaderAndStats();
    this.renderAttendanceCalendar();
    this.renderBossStageCards();
    this.renderInventory();
    this.setupEventListeners();
    this.setupCombatControls();
  }

  // --- Canvas Particle FX ---

  initCanvas() {
    this.particleCanvas = document.getElementById('particleCanvas');
    if (!this.particleCanvas) return;
    this.particleCtx = this.particleCanvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.startParticleLoop();
  }

  resizeCanvas() {
    if (!this.particleCanvas) return;
    this.particleCanvas.width = window.innerWidth;
    this.particleCanvas.height = window.innerHeight;
  }

  createParticleBurst(x, y, count = 40, colors = ['#00e5ff', '#38bdf8', '#a855f7', '#fbbf24', '#ffffff']) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02
      });
    }
  }

  startParticleLoop() {
    const loop = () => {
      if (this.particleCtx && this.particleCanvas) {
        this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.particleCtx.save();
          this.particleCtx.globalAlpha = p.alpha;
          this.particleCtx.fillStyle = p.color;
          this.particleCtx.shadowColor = p.color;
          this.particleCtx.shadowBlur = 8;
          this.particleCtx.beginPath();
          this.particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.particleCtx.fill();
          this.particleCtx.restore();
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // --- Tab Navigation ---

  setupTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn, .mobile-nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        if (targetTab) {
          this.switchTab(targetTab);
        }
      });
    });
  }

  switchTab(tabId) {
    if (battle.inBattle && tabId !== 'battleArena') {
      if (!confirm("보스 결전 중입니다. 전당에서 퇴각하시겠습니까?")) return;
      battle.retreat();
    }

    if (tabId !== 'battleArena') {
      document.body.classList.remove('in-battle');
    }

    const bossTabEl = document.getElementById('bossTab');
    if (bossTabEl) {
      if (tabId === 'bossTab' && this.currentBossZone === 6) {
        bossTabEl.classList.add('zone-omega-theme');
      } else {
        bossTabEl.classList.remove('zone-omega-theme');
      }
    }

    sound.playClick();
    this.currentTab = tabId;

    const tabs = document.querySelectorAll('.tab-screen');
    tabs.forEach(t => t.classList.add('hidden'));

    const target = document.getElementById(tabId);
    if (target) {
      target.classList.remove('hidden');
    }

    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (tabId === 'battleArena') {
      // In battle
    } else if (tabId === 'bossTab' && this.currentBossZone === 6) {
      sound.startBGM('boss');
    } else {
      sound.startBGM('ambient');
    }

    if (tabId === 'statusTab') this.updateHeaderAndStats();
    if (tabId === 'questTab') quests.renderCurrentView();
    if (tabId === 'attendanceTab') this.renderAttendanceCalendar();
    if (tabId === 'bossTab') this.renderBossStageCards();
    if (tabId === 'inventoryTab') this.renderInventory();
  }

  // Format huge gold numbers compactly for mobile headers (e.g. 238.7조, 15.2억, 450만)
  formatCompactGold(val) {
    const num = Number(val) || 0;
    if (num >= 1e12) {
      const jo = (num / 1e12).toFixed(1).replace(/\.0$/, '');
      return `${jo}조`;
    }
    if (num >= 1e8) {
      const eok = (num / 1e8).toFixed(1).replace(/\.0$/, '');
      return `${eok}억`;
    }
    if (num >= 1e6) {
      const man = Math.floor(num / 1e4).toLocaleString();
      return `${man}만`;
    }
    return num.toLocaleString();
  }

  // --- Header & Status Updates ---

  updateHeaderAndStats() {
    const p = state.data.player;
    const effective = state.getEffectiveStats();
    const rank = state.getRank(p.level);
    const reqExp = state.getExpRequired(p.level);
    const expPct = Math.min(100, (p.exp / reqExp) * 100);
    const currentHeight = state.getCurrentHeight();

    const hdrName = document.getElementById('hdrPlayerName');
    const hdrBrandNickname = document.getElementById('hdrBrandNickname');
    const hdrLevel = document.getElementById('hdrPlayerLevel');
    const hdrRank = document.getElementById('hdrPlayerRank');
    const hdrGold = document.getElementById('hdrPlayerGold');
    const hdrStreak = document.getElementById('hdrDailyStreak');

    if (hdrName) hdrName.textContent = p.name;
    if (hdrBrandNickname) hdrBrandNickname.textContent = p.name || '헌터';
    if (hdrLevel) hdrLevel.textContent = `Lv.${p.level}`;
    if (hdrRank) {
      hdrRank.textContent = rank.name;
      hdrRank.style.color = rank.color;
    }
    if (hdrGold) {
      hdrGold.textContent = this.formatCompactGold(p.gold);
      hdrGold.setAttribute('title', `${Number(p.gold || 0).toLocaleString()} G`);
    }
    const streak = state.getDailyStreak ? state.getDailyStreak() : state.data.quests.dailyStreak;
    state.data.quests.dailyStreak = streak;
    if (hdrStreak) {
      hdrStreak.textContent = `${streak}일`;
      hdrStreak.setAttribute('title', `${streak}일 연속 달성 중`);
    }

    const statName = document.getElementById('statPlayerName');
    const statTitle = document.getElementById('statPlayerTitle');
    const statLevel = document.getElementById('statPlayerLevel');
    const statRank = document.getElementById('statPlayerRank');
    const expFill = document.getElementById('statExpFill');
    const expText = document.getElementById('statExpText');
    const heightVal = document.getElementById('statHeightVal');
    const growthPts = document.getElementById('statGrowthPts');
    const heightProgress = document.getElementById('statHeightProgress');
    const freePoints = document.getElementById('statFreePoints');

    if (statName) statName.textContent = p.name;
    if (statTitle) {
      const tMeta = (typeof getTitleMetadata === 'function' ? getTitleMetadata(p.activeTitle) : null) 
        || (typeof TITLES_DATA !== 'undefined' ? TITLES_DATA[p.activeTitle] : null);
      const activeMults = state.getActiveTitleMultipliers ? state.getActiveTitleMultipliers() : { expMultiplier: 1.0, goldMultiplier: 1.0 };

      let statParts = [];
      if (tMeta && tMeta.stats) {
        const s = tMeta.stats;
        if (s.atk) statParts.push(`⚔️ 공격력 +${s.atk.toLocaleString()}`);
        if (s.def) statParts.push(`🛡️ 방어력 +${s.def.toLocaleString()}`);
        if (s.str) statParts.push(`STR +${s.str}`);
        if (s.int) statParts.push(`INT +${s.int}`);
        if (s.end) statParts.push(`END +${s.end}`);
        if (s.gro) statParts.push(`키 성장 +${s.gro}%`);
        if (s.maxHp) statParts.push(`HP +${s.maxHp.toLocaleString()}`);
        if (s.crit) statParts.push(`치명타 +${Math.round(s.crit * 100)}%`);
      }

      const statLineHtml = statParts.length > 0
        ? `<div style="font-size: 11px; color: #38bdf8; font-weight: 800; margin-top: 4px; line-height: 1.4;">${statParts.join(' · ')}</div>`
        : '';

      const multBadgeHtml = (activeMults.expMultiplier > 1 || activeMults.goldMultiplier > 1)
        ? `<span style="font-size: 11px; color: #facc15; font-weight: 800; margin-left: 6px; background: rgba(250, 204, 21, 0.15); border: 1px solid rgba(250, 204, 21, 0.45); padding: 2px 7px; border-radius: 4px;">EXP +${Math.round((activeMults.expMultiplier - 1) * 100)}% / 골드 +${Math.round((activeMults.goldMultiplier - 1) * 100)}%</span>`
        : '';

      statTitle.innerHTML = `<div>${p.activeTitle} ${multBadgeHtml}</div>${statLineHtml}`;
    }
    if (statLevel) statLevel.textContent = `LEVEL ${p.level}`;
    if (statRank) {
      statRank.textContent = rank.name;
      statRank.style.color = rank.color;
    }
    if (expFill) expFill.style.width = `${expPct}%`;
    if (expText) expText.textContent = `${p.exp.toLocaleString()} / ${reqExp.toLocaleString()} EXP (${expPct.toFixed(1)}%)`;

    // Realistic Height Progress (173.00cm -> 178.00cm)
    if (heightVal) heightVal.textContent = `${currentHeight.toFixed(2)} cm`;
    if (growthPts) growthPts.textContent = `${p.growthPoints.toLocaleString()} / 50,000 pt`;

    const heightGain = currentHeight - p.baseHeight;
    const targetGain = (p.targetHeight || 178.0) - p.baseHeight;
    const hPct = targetGain > 0 ? Math.min(100, Math.max(0, (heightGain / targetGain) * 100)) : 100;
    if (heightProgress) heightProgress.style.width = `${hPct}%`;

    const panelGold = document.getElementById('statPanelGold');
    if (panelGold) panelGold.textContent = p.gold.toLocaleString();

    document.querySelectorAll('.stat-row').forEach(row => {
      const statKey = row.dataset.stat;
      if (!statKey) return;

      const valEl = row.querySelector('.stat-val');
      const upBtn = row.querySelector('.btn-upgrade-stat');
      const cost = state.getStatUpgradeCost ? state.getStatUpgradeCost(statKey) : 500;

      if (valEl) {
        const bonus = effective[statKey] - p.stats[statKey];
        valEl.innerHTML = bonus > 0 
          ? `${effective[statKey]} <span style="font-size:11px; opacity:0.8; font-weight:normal;">(+${bonus})</span>`
          : `${effective[statKey]}`;
      }
      if (upBtn) {
        const canAfford = p.gold >= cost;
        upBtn.disabled = !canAfford;
        upBtn.innerHTML = `💰 ${cost.toLocaleString()} G 강화`;
        if (canAfford) {
          upBtn.className = 'btn-upgrade-stat btn btn-sm btn-primary';
          upBtn.style.opacity = '1';
          upBtn.style.cursor = 'pointer';
        } else {
          upBtn.className = 'btn-upgrade-stat btn btn-sm btn-secondary';
          upBtn.style.opacity = '0.5';
          upBtn.style.cursor = 'not-allowed';
        }
      }
    });

    const derivedHp = document.getElementById('statDerivedHp');
    const derivedMp = document.getElementById('statDerivedMp');
    const derivedAtk = document.getElementById('statDerivedAtk');
    const derivedDef = document.getElementById('statDerivedDef');
    const derivedCrit = document.getElementById('statDerivedCrit');

    const baseAtk = Math.round(25 + (p.stats.str * 4) + (p.level * 6));
    const bonusAtkVal = effective.atk - baseAtk;
    const baseDef = Math.round(8 + (p.stats.end * 2.5) + (p.level * 2.5));
    const bonusDefVal = effective.def - baseDef;
    const baseHp = 300 + (p.level * 50) + (p.stats.end * 25);
    const bonusHpVal = effective.maxHp - baseHp;

    if (derivedHp) {
      derivedHp.innerHTML = bonusHpVal > 0
        ? `${effective.maxHp.toLocaleString()} <span style="font-size:11px; color:#34d399; font-weight:bold;">(+${bonusHpVal.toLocaleString()})</span>`
        : effective.maxHp.toLocaleString();
    }
    if (derivedMp) derivedMp.textContent = effective.maxMp.toLocaleString();
    if (derivedAtk) {
      derivedAtk.innerHTML = bonusAtkVal > 0
        ? `${effective.atk.toLocaleString()} <span style="font-size:11px; color:#38bdf8; font-weight:bold;">(+${bonusAtkVal.toLocaleString()})</span>`
        : effective.atk.toLocaleString();
    }
    if (derivedDef) {
      derivedDef.innerHTML = bonusDefVal > 0
        ? `${effective.def.toLocaleString()} <span style="font-size:11px; color:#38bdf8; font-weight:bold;">(+${bonusDefVal.toLocaleString()})</span>`
        : effective.def.toLocaleString();
    }
    if (derivedCrit) derivedCrit.textContent = `${(effective.crit * 100).toFixed(1)}%`;

    if (typeof state.updateSaveIndicator === 'function') {
      state.updateSaveIndicator();
    }
    this.renderCloudModalState();
  }

  renderAll() {
    this.updateHeaderAndStats();
    if (typeof quests !== 'undefined' && quests.renderQuestList) {
      quests.renderQuestList();
    }
    this.renderAttendanceCalendar();
    this.renderBossStageCards();
    this.renderInventory();
  }

  upgradeStatWithGold(statKey) {
    if (this._isUpgradingStat) return;
    this._isUpgradingStat = true;
    setTimeout(() => { this._isUpgradingStat = false; }, 250);

    sound.playClick();
    const res = state.upgradeStatWithGold(statKey);
    if (!res || !res.success) {
      sound.playDefeat();
      this.showToast(`골드가 부족합니다! (필요: ${res.cost.toLocaleString()} G / 부족: ${res.needed.toLocaleString()} G)`, "error");
      return;
    }
    sound.playLevelUp();
    this.updateHeaderAndStats();
    const statNames = { str: '근력 (STR)', int: '지능 (INT)', end: '체력 (END)', gro: '성장 잠재력 (GRO)' };
    const label = statNames[statKey] || statKey.toUpperCase();
    this.showToast(`💪 [${label}] +1 강화 성공! (-${res.cost.toLocaleString()} G)`, "success");
  }

  // --- Dedicated True Attendance Calendar (진짜 달력 & 쭈우욱 달력) ---

  setCalendarViewMode(mode) {
    this.calendarViewMode = mode;
    sound.playClick();
    this.renderAttendanceCalendar();
  }

  changeCalendarMonth(delta) {
    sound.playClick();
    this.currentCalMonth += delta;
    if (this.currentCalMonth < 0) {
      this.currentCalMonth = 11;
      this.currentCalYear--;
    } else if (this.currentCalMonth > 11) {
      this.currentCalMonth = 0;
      this.currentCalYear++;
    }
    this.renderAttendanceCalendar();
  }

  jumpToTodayCalendar() {
    sound.playClick();
    const now = new Date();
    this.currentCalYear = now.getFullYear();
    this.currentCalMonth = now.getMonth();
    this.targetedDateStr = getLocalDateString();
    this.calendarViewMode = 'month';
    this.renderAttendanceCalendar();
  }

  openDateJumpModal() {
    sound.playClick();
    const modal = document.getElementById('dateJumpModal');
    const input = document.getElementById('inputDirectDate');
    if (modal) {
      modal.classList.remove('hidden');
      if (input) {
        input.value = `${this.currentCalYear}년 ${this.currentCalMonth + 1}월 1일`;
        setTimeout(() => {
          input.focus();
          input.select();
        }, 80);
      }
    } else {
      const val = prompt("이동할 날짜를 입력하세요 (예: 2025년 10월 3일 또는 2025-10-03):");
      if (val) this.processDateJump(val);
    }
  }

  closeDateJumpModal() {
    sound.playClick();
    const modal = document.getElementById('dateJumpModal');
    if (modal) modal.classList.add('hidden');
  }

  fillDateInputPreset(preset) {
    sound.playClick();
    const input = document.getElementById('inputDirectDate');
    if (!input) return;
    if (preset === 'today') {
      const now = new Date();
      input.value = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
    } else {
      input.value = preset;
    }
  }

  confirmDateJump() {
    const input = document.getElementById('inputDirectDate');
    if (!input) return;
    const val = input.value.trim();
    if (!val) {
      alert("이동할 날짜를 입력해주세요. (예: 2025년 10월 3일)");
      return;
    }
    const success = this.processDateJump(val);
    if (success) {
      this.closeDateJumpModal();
    }
  }

  processDateJump(inputStr) {
    if (!inputStr) return false;
    const trimmed = inputStr.trim();

    // Pattern 1: 2025년 10월 3일 / 2025-10-03 / 2025.10.03 / 2025/10/03 / 2025 10 3
    let match = trimmed.match(/(\d{4})[^\d]+(\d{1,2})(?:[^\d]+(\d{1,2}))?/);
    let targetYear = null;
    let targetMonth = null;
    let targetDay = null;

    if (match) {
      targetYear = parseInt(match[1], 10);
      targetMonth = parseInt(match[2], 10);
      targetDay = match[3] ? parseInt(match[3], 10) : 1;
    } else {
      // Pattern 2: 10월 3일 / 10-03
      match = trimmed.match(/^(\d{1,2})[^\d]+(\d{1,2})/);
      if (match) {
        targetYear = this.currentCalYear || new Date().getFullYear();
        targetMonth = parseInt(match[1], 10);
        targetDay = parseInt(match[2], 10);
      }
    }

    if (!targetYear || !targetMonth || targetMonth < 1 || targetMonth > 12) {
      alert("올바른 날짜 형식이 아닙니다.\n예시: 2025년 10월 3일 또는 2025-10-03");
      return false;
    }

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    targetDay = Math.min(daysInMonth, Math.max(1, targetDay || 1));

    this.currentCalYear = targetYear;
    this.currentCalMonth = targetMonth - 1;
    this.targetedDateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;

    sound.playClick();
    this.renderAttendanceCalendar();

    setTimeout(() => {
      const cell = document.getElementById(`calDayCell_${this.targetedDateStr}`);
      if (cell) {
        cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cell.classList.add('pulse-focus');
        setTimeout(() => cell.classList.remove('pulse-focus'), 3500);
      }
    }, 150);

    this.showToast(`📅 ${targetYear}년 ${targetMonth}월 ${targetDay}일 달력으로 이동했습니다!`, "success");
    return true;
  }

  showDayDetails(dateStr) {
    sound.playClick();
    const questsData = state.data.quests;
    const todayStr = getLocalDateString();
    const isToday = (dateStr === todayStr);
    const count = isToday 
      ? Object.keys(questsData.completedToday || {}).length 
      : (questsData.history[dateStr] || 0);

    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    const dow = ['일', '월', '화', '수', '목', '금', '토'][new Date(y, m - 1, d).getDay()];
    const label = `${y}년 ${m}월 ${d}일 (${dow})`;

    if (dateStr < questsData.startDate) {
      ui.showToast(`🔒 ${label} : 각성 프로젝트 시작 전 날짜입니다.`);
    } else if (isToday) {
      if (count > 0) {
        ui.showToast(`✨ ${label} [오늘] : 일일 퀘스트 ${count}개 완수 완료!`, "success");
      } else {
        ui.showToast(`⏳ ${label} [오늘] : 오늘 퀘스트를 완료해 출석 체크를 달성하세요!`);
      }
    } else if (dateStr > todayStr) {
      ui.showToast(`🗓️ ${label} : 예정된 미래의 각성 수련일입니다.`);
    } else {
      if (count > 0) {
        ui.showToast(`✔️ ${label} : 일일 퀘스트 ${count}개 완수 성공!`, "success");
      } else {
        ui.showToast(`❌ ${label} : 일일 퀘스트 미수행 (휴식일)`, "warning");
      }
    }
  }

  renderMonthCard(year, month) {
    const questsData = state.data.quests;
    const todayStr = getLocalDateString();
    const todayCompletedCount = Object.keys(questsData.completedToday || {}).length;
    questsData.history[todayStr] = todayCompletedCount;

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0: Sun, 1: Mon, ...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

    let html = `
      <div class="cal-month-card">
        <div class="cal-month-header-banner">
          <h4>📅 ${year}년 ${monthNames[month]}</h4>
          <span class="cal-month-summary-tag">총 ${totalDaysInMonth}일</span>
        </div>
        <div class="cal-weekday-grid">
          <span class="weekday-sun">일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span class="weekday-sat">토</span>
        </div>
        <div class="cal-days-grid">
    `;

    // Padding cells from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      const prevDay = prevMonthDays - firstDayIndex + 1 + i;
      html += `<div class="cal-day-cell pad-cell"><span class="cal-cell-num">${prevDay}</span></div>`;
    }

    // Days in current month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dow = new Date(year, month, day).getDay();
      const isToday = (dateStr === todayStr);
      const isSun = (dow === 0);
      const isSat = (dow === 6);
      const count = isToday ? todayCompletedCount : (questsData.history[dateStr] || 0);

      let cellClass = `cal-day-cell ${isSun ? 'sun' : ''} ${isSat ? 'sat' : ''}`;
      if (this.targetedDateStr === dateStr) {
        cellClass += ' target-focused';
      }
      let cellBody = '';

      if (dateStr < questsData.startDate) {
        cellClass += ' cell-before-start';
        cellBody = `
          <div class="cal-cell-top"><span class="cal-cell-num">${day}</span></div>
          <div class="cal-cell-body"><span class="cal-count-badge muted">시작 전</span></div>
        `;
      } else if (isToday) {
        cellClass += ` cell-today ${count > 0 ? 'cell-success' : ''}`;
        cellBody = `
          <div class="cal-cell-top">
            <span class="cal-cell-num">${day}</span>
            <span class="cal-today-pill">오늘</span>
          </div>
          <div class="cal-cell-body">
            ${count > 0 
              ? `<span class="cal-mark-icon success">✔️</span><span class="cal-count-badge success">${count}개 완료</span>`
              : `<span class="cal-mark-icon pending">⏳</span><span class="cal-count-badge pending">0개 (진행중)</span>`
            }
          </div>
        `;
      } else if (dateStr > todayStr) {
        cellClass += ' cell-future';
        cellBody = `
          <div class="cal-cell-top"><span class="cal-cell-num">${day}</span></div>
          <div class="cal-cell-body"><span class="cal-count-badge muted">-</span></div>
        `;
      } else {
        // Past day between startDate and yesterday
        if (count > 0) {
          cellClass += ' cell-success';
          cellBody = `
            <div class="cal-cell-top"><span class="cal-cell-num">${day}</span></div>
            <div class="cal-cell-body">
              <span class="cal-mark-icon success">✔️</span>
              <span class="cal-count-badge success">${count}개 완료</span>
            </div>
          `;
        } else {
          cellClass += ' cell-missed';
          cellBody = `
            <div class="cal-cell-top"><span class="cal-cell-num">${day}</span></div>
            <div class="cal-cell-body">
              <span class="cal-mark-icon missed">❌</span>
              <span class="cal-count-badge missed">미수행</span>
            </div>
          `;
        }
      }

      html += `<div class="${cellClass}" id="calDayCell_${dateStr}" onclick="ui.showDayDetails('${dateStr}')">${cellBody}</div>`;
    }

    // Padding slots for remaining days of the week
    const totalSlots = firstDayIndex + totalDaysInMonth;
    const remainingSlots = (7 - (totalSlots % 7)) % 7;
    for (let j = 1; j <= remainingSlots; j++) {
      html += `<div class="cal-day-cell pad-cell"><span class="cal-cell-num">${j}</span></div>`;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  }

  renderAttendanceCalendar() {
    const stage = document.getElementById('calendarRenderStage');
    if (!stage) return;

    const questsData = state.data.quests;
    const todayStr = getLocalDateString();

    if (!questsData.startDate) {
      questsData.startDate = todayStr;
    }

    // Align startDate for existing players with streak > 1
    if (questsData.dailyStreak > 1 && questsData.startDate === todayStr) {
      const past = new Date();
      past.setDate(past.getDate() - (questsData.dailyStreak - 1));
      const py = past.getFullYear();
      const pm = String(past.getMonth() + 1).padStart(2, '0');
      const pd = String(past.getDate()).padStart(2, '0');
      questsData.startDate = `${py}-${pm}-${pd}`;
      if (!questsData.history) questsData.history = {};
      for (let i = 1; i < questsData.dailyStreak; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dy = d.getFullYear();
        const dm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dStr = `${dy}-${dm}-${dd}`;
        if (!questsData.history[dStr]) {
          questsData.history[dStr] = 3;
        }
      }
    }

    if (!questsData.history) questsData.history = {};

    const todayCompletedCount = Object.keys(questsData.completedToday || {}).length;
    questsData.history[todayStr] = todayCompletedCount;

    // Calculate overall stats from startDate to today
    const startObj = new Date(questsData.startDate + 'T00:00:00');
    const todayObj = new Date(todayStr + 'T00:00:00');

    let totalTrackedDays = 0;
    let doneDays = 0;
    let missedDays = 0;
    let totalCompletedQuestsCount = 0;

    if (!isNaN(startObj.getTime()) && startObj <= todayObj) {
      const cur = new Date(startObj);
      while (cur <= todayObj) {
        totalTrackedDays++;
        const cy = cur.getFullYear();
        const cm = String(cur.getMonth() + 1).padStart(2, '0');
        const cd = String(cur.getDate()).padStart(2, '0');
        const cStr = `${cy}-${cm}-${cd}`;
        const cnt = (cStr === todayStr) ? todayCompletedCount : (questsData.history[cStr] || 0);

        if (cnt > 0) {
          doneDays++;
          totalCompletedQuestsCount += cnt;
        } else if (cStr < todayStr) {
          missedDays++;
        }
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      totalTrackedDays = 1;
      if (todayCompletedCount > 0) {
        doneDays = 1;
        totalCompletedQuestsCount = todayCompletedCount;
      }
    }

    const rate = totalTrackedDays > 0 ? Math.round((doneDays / totalTrackedDays) * 100) : 0;

    // Update UI Metric Elements
    const streak = state.getDailyStreak ? state.getDailyStreak() : questsData.dailyStreak;
    questsData.dailyStreak = streak;

    const startDisp = document.getElementById('attDisplayStartDate');
    const metricStreak = document.getElementById('attMetricStreak');
    const metricDone = document.getElementById('attMetricDone');
    const metricMissed = document.getElementById('attMetricMissed');
    const metricRate = document.getElementById('attMetricRate');
    const metricTotal = document.getElementById('attMetricTotalQuests');

    if (startDisp) startDisp.textContent = questsData.startDate;
    if (metricStreak) metricStreak.textContent = `${streak}일`;
    if (metricDone) metricDone.textContent = `${doneDays}일`;
    if (metricMissed) metricMissed.textContent = `${missedDays}일`;
    if (metricRate) metricRate.textContent = `${rate}%`;
    if (metricTotal) metricTotal.textContent = `${totalCompletedQuestsCount}개`;

    // Render Calendar
    if (this.calendarViewMode === 'month') {
      const monthTitle = document.getElementById('calCurrentMonthTitle');
      const monthBadge = document.getElementById('calMonthStatusBadge');
      if (monthTitle) {
        monthTitle.textContent = `${this.currentCalYear}년 ${this.currentCalMonth + 1}월`;
      }
      const now = new Date();
      if (monthBadge) {
        if (this.currentCalYear === now.getFullYear() && this.currentCalMonth === now.getMonth()) {
          monthBadge.textContent = '이번 달 (진행 중)';
          monthBadge.style.display = 'inline-block';
        } else if (this.currentCalYear < now.getFullYear() || (this.currentCalYear === now.getFullYear() && this.currentCalMonth < now.getMonth())) {
          monthBadge.textContent = '지난 달';
          monthBadge.style.display = 'inline-block';
        } else {
          monthBadge.textContent = '예정된 달';
          monthBadge.style.display = 'inline-block';
        }
      }
      stage.innerHTML = this.renderMonthCard(this.currentCalYear, this.currentCalMonth);
    } else {
      // Continuous Scroll View ("전체 달력 쭈우욱 보기")
      let startY = startObj.getFullYear();
      let startM = startObj.getMonth();
      const curY = todayObj.getFullYear();
      const curM = todayObj.getMonth();

      let monthsHtml = '';
      let tempY = startY;
      let tempM = startM;

      while (tempY < curY || (tempY === curY && tempM <= curM)) {
        monthsHtml += this.renderMonthCard(tempY, tempM);
        tempM++;
        if (tempM > 11) {
          tempM = 0;
          tempY++;
        }
      }
      stage.innerHTML = monthsHtml;
    }
  }

  // --- 50 Boss Stages UI with Zone Selector ---

  setBossZone(zoneNum) {
    sound.playClick();
    this.currentBossZone = zoneNum;
    const bossTabEl = document.getElementById('bossTab');
    if (bossTabEl) {
      if (zoneNum === 6) {
        bossTabEl.classList.add('zone-omega-theme');
        sound.playCosmicGodIntro();
        sound.startBGM('boss');
      } else {
        bossTabEl.classList.remove('zone-omega-theme');
        sound.startBGM('ambient');
      }
    }
    this.renderBossStageCards();
  }

  renderBossStageCards() {
    const zoneContainer = document.getElementById('bossZoneTabs');
    const listContainer = document.getElementById('bossStageList');
    if (!listContainer) return;

    if (zoneContainer) {
      const zones = [
        { id: 1, name: "Zone 1: 나태·숏폼 (1~10층)" },
        { id: 2, name: "Zone 2: 왜소·중력 (11~20층)" },
        { id: 3, name: "Zone 3: 수험·번아웃 (21~30층)" },
        { id: 4, name: "Zone 4: 유전·편견 (31~40층)" },
        { id: 5, name: "Zone 5: 178cm 신전 (41~50층)" },
        { id: 6, name: "👑 [100단계] 100레벨 최종보스" }
      ];

      zoneContainer.innerHTML = '';
      zones.forEach(z => {
        const btn = document.createElement('button');
        btn.className = `cat-tab-btn ${this.currentBossZone === z.id ? 'active' : ''}`;
        btn.textContent = z.name;
        btn.onclick = () => this.setBossZone(z.id);
        zoneContainer.appendChild(btn);
      });
    }

    listContainer.innerHTML = '';

    if (this.currentBossZone === 6) {
      listContainer.classList.add('zone-omega-list');
    } else {
      listContainer.classList.remove('zone-omega-list');
    }

    let zoneBosses = [];
    if (this.currentBossZone === 6) {
      zoneBosses = BOSSES_DATA.filter(b => b.isSecretFinal);
    } else {
      const startStage = (this.currentBossZone - 1) * 10 + 1;
      const endStage = this.currentBossZone * 10;
      zoneBosses = BOSSES_DATA.filter(b => b.stage >= startStage && b.stage <= endStage && !b.isSecretFinal);
    }

    zoneBosses.forEach(boss => {
      const isUnlocked = boss.isSecretFinal || boss.stage <= state.data.raid.unlockedStage;
      const isCleared = state.data.raid.clearedStages.includes(boss.stage);
      const isRecommended = state.data.player.level >= boss.recommendedLevel;

      const card = document.createElement('div');
      card.className = `boss-select-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCleared ? 'cleared' : ''} ${boss.isSecretFinal ? 'omega-card' : ''}`;

      const v = boss.visual;
      if (v && !boss.isSecretFinal) {
        card.style.setProperty('--boss-theme-color', v.color);
        card.style.setProperty('--boss-theme-sub', v.subColor);
        card.style.borderColor = `${v.color}66`;
        card.style.boxShadow = `0 8px 28px rgba(0,0,0,0.65), inset 0 0 22px ${v.color}22`;
      }

      const imgStyle = (v && !boss.isSecretFinal)
        ? `filter: drop-shadow(0 0 14px ${v.color}66);`
        : '';

      const auraOverlayHtml = (v && !boss.isSecretFinal)
        ? `<div class="boss-card-aura-fx" style="background: radial-gradient(circle at 50% 35%, transparent 35%, ${v.color}38 85%, ${v.subColor}66 100%); box-shadow: inset 0 0 ${14 + Math.round(boss.stage * 0.6)}px ${v.color};"></div>
           <div class="boss-awakening-tag" style="background: linear-gradient(135deg, ${v.color}dd, ${v.subColor}dd); border-color: ${v.color};">
             ⚡ ${v.rankTag} · ${v.auraName}
           </div>`
        : '';

      card.innerHTML = `
        <div class="boss-img-wrap">
          <img src="${boss.image}" alt="${boss.name}" class="boss-card-img" style="${imgStyle}" />
          ${auraOverlayHtml}
          <div class="boss-stage-badge" style="${boss.isSecretFinal ? 'background:linear-gradient(135deg, #f59e0b, #ef4444); border-color:#f59e0b; color:#fff; font-weight:900;' : (v ? `border-color:${v.color}; color:#fff; background:linear-gradient(135deg, rgba(0,0,0,0.88), ${v.color}66); box-shadow:0 0 12px ${v.color}88;` : '')}">
            ${boss.isSecretFinal ? '👑 100단계 [100레벨 보스]' : `STAGE ${boss.stage}`}
          </div>
          ${isCleared ? `<div class="boss-cleared-badge">토벌 완료</div>` : ''}
          ${!isUnlocked ? `<div class="boss-lock-overlay">🔒 이전 스테이지 클리어 필요</div>` : ''}
        </div>
        <div class="boss-info-wrap">
          <div class="boss-month-tag" style="margin-bottom:6px; ${boss.isSecretFinal ? 'border-color:#f59e0b; color:#fbbf24; background:rgba(245,158,11,0.25); font-weight:800;' : (v ? `border-color:${v.color}88; color:${v.color}; background:${v.color}1a;` : '')}">
            ${boss.isSecretFinal ? '👑 [100단계 찐막 최종보스] 100레벨 신장 178cm 절대 거신' : `⏳ ${boss.trainingMonths}달(${boss.trainingDays}일) 매일 수련 필수`}
          </div>
          <div class="boss-title-row">
            <h3 class="boss-card-name" style="${boss.isSecretFinal ? 'font-size:22px; color:#fbbf24; text-shadow:0 0 15px rgba(245,158,11,0.6);' : (v ? `text-shadow: 0 0 12px ${v.color}55;` : '')}">${boss.name}</h3>
            <span class="boss-card-rec ${isRecommended ? 'rec-ok' : 'rec-warn'}" style="${boss.isSecretFinal ? 'border-color:#ef4444; color:#f87171; background:rgba(239,68,68,0.25); font-weight:900;' : ''}">
              ${boss.isSecretFinal ? `권장 Lv.${boss.recommendedLevel} (신화)` : `권장 Lv.${boss.recommendedLevel}`}
            </span>
          </div>
          <div class="boss-card-sub">${boss.subName}</div>
          <p class="boss-card-quote" style="${v && !boss.isSecretFinal ? `border-left-color: ${v.color};` : ''}">${boss.introQuote}</p>
          <div class="boss-stats-preview">
            <span>체력: ${boss.maxHp.toLocaleString()}</span>
            <span>공격력: ${boss.atk.toLocaleString()}</span>
            <span>방어력: ${boss.def.toLocaleString()}</span>
          </div>
          <div class="boss-rewards-box">
            <div class="reward-title">토벌 보상:</div>
            <div class="reward-tags">
              <span class="badge-item">${boss.rewards.item.name}</span>
              <span class="badge-exp">+${boss.rewards.exp.toLocaleString()} EXP</span>
              <span class="badge-growth">+${boss.rewards.growthPoints.toLocaleString()} 키 성장치</span>
            </div>
          </div>
          <button class="btn btn-raid-start ${isUnlocked ? '' : 'disabled'} ${boss.isSecretFinal ? 'btn-omega-challenge' : ''}" style="${v && !boss.isSecretFinal && isUnlocked ? `background: linear-gradient(135deg, ${v.color}, ${v.subColor}); box-shadow: 0 4px 16px ${v.color}55;` : ''}" ${isUnlocked ? '' : 'disabled'} onclick="ui.startBossRaid('${boss.id}')">
            ${isCleared ? '다시 도전하기' : (boss.isSecretFinal ? '🔥 100레벨 절대 거신과 1:1 최종 결전' : `⚔️ Stage ${boss.stage} 보스 1:1 맞다이 결전`)}
          </button>
        </div>
      `;

      listContainer.appendChild(card);
    });
  }

  startBossRaid(bossId) {
    sound.playClick();
    this.switchTab('battleArena');
    battle.startBattle(bossId);
  }

  scrollZoneTabs(offset) {
    sound.playClick();
    const el = document.getElementById('bossZoneTabs');
    if (el) {
      el.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  enableDragToScroll(el) {
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    el.addEventListener('mousedown', (e) => {
      isDown = true;
      el.classList.add('is-dragging');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });

    el.addEventListener('mouseleave', () => {
      isDown = false;
      el.classList.remove('is-dragging');
    });

    el.addEventListener('mouseup', () => {
      isDown = false;
      el.classList.remove('is-dragging');
    });

    el.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    });

    el.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // --- 1:1 Turn-Based Combat Controls Wiring ---

  setupCombatControls() {
    const attackBtn = document.getElementById('btnOneAttack');
    if (attackBtn) {
      attackBtn.onclick = () => battle.executeTurnExchange();
    }
  }

  // --- Profile Edit Modal (Direct Method) ---

  openProfileModal() {
    sound.playClick();
    const modal = document.getElementById('profileEditModal');
    if (!modal) return;
    document.getElementById('editNameInput').value = state.data.player.name;
    document.getElementById('editHeightInput').value = state.data.player.baseHeight;
    document.getElementById('editTargetHeightInput').value = state.data.player.targetHeight || 178.0;
    modal.classList.remove('hidden');
  }

  closeProfileModal() {
    const modal = document.getElementById('profileEditModal');
    if (modal) modal.classList.add('hidden');
  }

  saveProfile() {
    const nameVal = document.getElementById('editNameInput').value.trim();
    const heightVal = parseFloat(document.getElementById('editHeightInput').value);
    const targetVal = parseFloat(document.getElementById('editTargetHeightInput').value);

    if (nameVal) state.data.player.name = nameVal;
    if (!isNaN(heightVal) && heightVal >= 130 && heightVal <= 210) {
      state.data.player.baseHeight = heightVal;
    }
    if (!isNaN(targetVal) && targetVal >= heightVal && targetVal <= 220) {
      state.data.player.targetHeight = targetVal;
    }

    state.save();
    this.closeProfileModal();
    sound.playQuestComplete();
    this.updateHeaderAndStats();
    this.showToast("프로필이 성공적으로 변경되었습니다.");
  }

  // --- Inventory & Titles UI ---

  renderInventory() {
    const eq = state.data.player.equipment;
    const slots = ['weapon', 'armor', 'shoes', 'ring', 'aura'];
    const slotNames = { weapon: '무기', armor: '갑옷', shoes: '신발', ring: '반지', aura: '오라' };

    const eqContainer = document.getElementById('equipmentSlots');
    if (eqContainer) {
      eqContainer.innerHTML = '';
      slots.forEach(slot => {
        const item = eq[slot];
        const slotEl = document.createElement('div');
        slotEl.className = `equip-slot-card ${item ? 'filled rarity-' + item.rarity : 'empty'}`;

        if (item) {
          slotEl.innerHTML = `
            <div class="slot-type">${slotNames[slot]}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-stats">${item.statsText}</div>
            <button class="btn btn-xs btn-outline-danger" onclick="state.unequipItem('${slot}'); ui.renderInventory(); ui.updateHeaderAndStats();">해제</button>
          `;
        } else {
          slotEl.innerHTML = `
            <div class="slot-type">${slotNames[slot]}</div>
            <div class="item-empty-text">미장착</div>
          `;
        }
        eqContainer.appendChild(slotEl);
      });
    }

    const bagContainer = document.getElementById('inventoryBag');
    if (bagContainer) {
      bagContainer.innerHTML = '';
      const items = [...(state.data.player.inventory || [])];

      if (items.length === 0) {
        bagContainer.innerHTML = `<div class="empty-bag-text">보유한 장비가 없습니다. 50단계 보스를 격파하여 전설의 장비를 획득하세요!</div>`;
      } else {
        // "좋은게 왼쪽으로 오게": Mythic(5) > Legendary(4) > Epic(3) > Rare(2) > Normal(1), then stats sum descending
        const rarityWeights = { mythic: 5, legendary: 4, epic: 3, rare: 2, normal: 1 };
        items.sort((a, b) => {
          const wA = rarityWeights[a.rarity] || 1;
          const wB = rarityWeights[b.rarity] || 1;
          if (wB !== wA) return wB - wA;
          const sumA = (a.stats?.atk || 0) + (a.stats?.def || 0) + (a.stats?.str || 0) + (a.stats?.gro || 0);
          const sumB = (b.stats?.atk || 0) + (b.stats?.def || 0) + (b.stats?.str || 0) + (b.stats?.gro || 0);
          return sumB - sumA;
        });

        items.forEach(item => {
          const isEquipped = eq[item.slot] && eq[item.slot].id === item.id;
          const rarity = item.rarity || 'normal';
          const card = document.createElement('div');
          card.className = `bag-item-card rarity-${rarity} ${isEquipped ? 'is-equipped' : ''}`;

          const rarityLabels = {
            mythic: '✦ 신화',
            legendary: '★ 전설',
            epic: '◆ 에픽',
            rare: '▲ 레어',
            normal: '● 일반'
          };
          const rLabel = rarityLabels[rarity] || '일반';

          card.innerHTML = `
            <div class="item-header">
              <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
                <span class="item-rarity-pill rarity-${rarity}">${rLabel}</span>
                <span class="item-name" style="font-size: 13px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
              </div>
              <span class="item-slot-tag">${slotNames[item.slot] || item.slot}</span>
            </div>
            <div class="item-stats-text">${item.statsText}</div>
            <div class="item-action" style="margin-top: 6px; display: flex; justify-content: flex-end;">
              ${isEquipped 
                ? `<span class="badge-equipped">장착 중</span>` 
                : `<button class="btn btn-xs btn-primary" onclick="state.equipItem(${JSON.stringify(item).replace(/"/g, '&quot;')}); ui.renderInventory(); ui.updateHeaderAndStats();">장착하기</button>`
              }
            </div>
          `;
          bagContainer.appendChild(card);
        });
      }
    }

    const ownedContainer = document.getElementById('ownedTitlesContainer') || document.getElementById('titlesContainer');
    const unownedContainer = document.getElementById('unownedTitlesContainer');
    const ownedBadge = document.getElementById('ownedTitlesCountBadge');
    const unownedBadge = document.getElementById('unownedTitlesCountBadge');

    if (ownedContainer || unownedContainer) {
      if (ownedContainer) ownedContainer.innerHTML = '';
      if (unownedContainer) unownedContainer.innerHTML = '';

      const unlocked = state.data.player.unlockedTitles || [];
      const active = state.data.player.activeTitle;

      const rarityWeights = { mythic: 5, legendary: 4, epic: 3, rare: 2, normal: 1 };
      const rarityLabels = {
        mythic: '✦ MYTHIC 신화',
        legendary: '★ LEGENDARY 전설',
        epic: '◆ EPIC 에픽',
        rare: '▲ RARE 레어',
        normal: '● NORMAL 일반'
      };

      // Collect all registered titles from TITLES_DATA and player's unlocked list
      const allNames = Array.from(new Set([...Object.keys(TITLES_DATA), ...unlocked]));
      const titleCardsList = allNames.map(tName => {
        const tInfo = (typeof getTitleMetadata === 'function' ? getTitleMetadata(tName) : (TITLES_DATA[tName] || { name: tName, desc: '', bonusText: '' }));
        const isUnlocked = unlocked.includes(tName);
        const isActive = (active === tName);
        const rarity = tInfo.rarity || 'normal';
        return {
          tName,
          tInfo,
          isUnlocked,
          isActive,
          rarity,
          weight: rarityWeights[rarity] || 1,
          reqLevel: tInfo.reqLevel || 1
        };
      });

      // "좋은게 왼쪽으로 오게": Mythic(5) > Legendary(4) > Epic(3) > Rare(2) > Normal(1)
      // Within same rarity: Unlocked first, then higher reqLevel, then active first
      titleCardsList.sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
        if (b.reqLevel !== a.reqLevel) return b.reqLevel - a.reqLevel;
        return a.tName.localeCompare(b.tName);
      });

      const createTitleCardElement = ({ tName, tInfo, isUnlocked, isActive, rarity, reqLevel }) => {
        const card = document.createElement('div');
        card.className = `title-card rarity-${rarity} ${isActive ? 'active' : ''} ${!isUnlocked ? 'is-locked' : ''}`;

        let actionHtml = '';
        if (isActive) {
          actionHtml = `<span class="badge-active-pulse">★ 현재 착용 중</span>`;
        } else if (isUnlocked) {
          actionHtml = `<button type="button" class="btn btn-xs btn-outline-cyan" onclick="state.setActiveTitle('${tName}'); ui.renderInventory(); ui.updateHeaderAndStats();">칭호 착용</button>`;
        } else {
          actionHtml = `<span class="title-lock-condition">🔒 해금 조건: ${tInfo.unlockHint || '특정 업적 달성'}</span>`;
        }

        let statBonusText = tInfo.bonusText || '';
        if (statBonusText.includes('|')) {
          statBonusText = statBonusText.split('|')[0].trim();
        }

        const multBadgeHtml = (tInfo.expMultiplier || tInfo.goldMultiplier) ? `
          <div class="title-multiplier-badge" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 6px; padding: 4px 10px; background: linear-gradient(90deg, rgba(250, 204, 21, 0.16), rgba(0, 229, 255, 0.12)); border: 1px solid rgba(250, 204, 21, 0.45); border-radius: 6px; font-size: 11px; font-weight: 800;">
            <span style="color: #38bdf8;">✨ EXP x${tInfo.expMultiplier || 1.0}</span>
            <span style="color: rgba(255,255,255,0.3);">|</span>
            <span style="color: #facc15;">💰 골드 x${tInfo.goldMultiplier || 1.0}</span>
          </div>
        ` : '';

        card.innerHTML = `
          <div class="title-card-top">
            <span class="title-rarity-badge rarity-${rarity}">${rarityLabels[rarity] || 'NORMAL'}</span>
            <span class="title-req-badge">REQ Lv.${reqLevel}</span>
          </div>
          <div class="title-name-wrap">
            <span class="title-name-text">${tInfo.name}</span>
            ${isActive ? '<span class="title-equipped-dot">착용</span>' : ''}
          </div>
          <div class="title-desc-text">${tInfo.desc}</div>
          <div class="title-bonus-badge">⚡ ${statBonusText}</div>
          ${multBadgeHtml}
          <div class="title-card-footer">
            ${actionHtml}
          </div>
        `;
        return card;
      };

      const ownedCards = titleCardsList.filter(t => t.isUnlocked);
      const unownedCards = titleCardsList.filter(t => !t.isUnlocked);

      if (ownedBadge) ownedBadge.textContent = `보유 ${ownedCards.length}개`;
      if (unownedBadge) unownedBadge.textContent = `미보유 ${unownedCards.length}개`;

      if (ownedContainer) {
        if (ownedCards.length === 0) {
          const emptyDiv = document.createElement('div');
          emptyDiv.style.cssText = 'grid-column: 1 / -1; padding: 28px 16px; text-align: center; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.12); color: var(--text-muted);';
          emptyDiv.innerHTML = `
            <div style="font-size: 22px; margin-bottom: 6px;">📜</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-normal);">현재 보유 중인 각성 칭호가 없습니다.</div>
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 4px;">일일 퀘스트를 꾸준히 수행하고 보스를 격파하여 강력한 각성 칭호를 획득해보세요!</div>
          `;
          ownedContainer.appendChild(emptyDiv);
        } else {
          ownedCards.forEach(t => ownedContainer.appendChild(createTitleCardElement(t)));
        }
      }

      if (unownedContainer) {
        unownedCards.forEach(t => unownedContainer.appendChild(createTitleCardElement(t)));
      }

      this.updateUnownedTitlesToggleUi();
    }
  }

  toggleUnownedTitles() {
    this.isUnownedTitlesExpanded = !this.isUnownedTitlesExpanded;
    this.updateUnownedTitlesToggleUi();
  }

  updateUnownedTitlesToggleUi() {
    const wrapper = document.getElementById('unownedTitlesWrapper');
    const textEl = document.getElementById('toggleUnownedTitlesText');
    const iconEl = document.getElementById('toggleUnownedTitlesIcon');
    const btn = document.getElementById('toggleUnownedTitlesBtn');
    if (!wrapper || !textEl) return;

    if (this.isUnownedTitlesExpanded) {
      wrapper.classList.remove('hidden');
      textEl.textContent = '각성칭호도감 접기(닫기)';
      if (iconEl) iconEl.textContent = '▲';
      if (btn) {
        btn.style.background = 'rgba(0, 229, 255, 0.12)';
        btn.style.borderColor = 'var(--cyan-neon)';
      }
    } else {
      wrapper.classList.add('hidden');
      textEl.textContent = '각성칭호도감 더보기(열기)';
      if (iconEl) iconEl.textContent = '▼';
      if (btn) {
        btn.style.background = 'rgba(0, 229, 255, 0.05)';
        btn.style.borderColor = 'rgba(0, 229, 255, 0.35)';
      }
    }
  }

  // --- Modals ---

  showLevelUpModal(expResult) {
    const modal = document.getElementById('levelUpModal');
    if (!modal) return;

    this.createParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 70);

    const lvlEl = document.getElementById('lvlUpNewLevel');
    const ptsEl = document.getElementById('lvlUpFreePoints');
    if (lvlEl) lvlEl.textContent = `LEVEL ${expResult.newLevel}`;
    const goldGained = expResult.levelUpGoldGained || (expResult.levelsGained * 500);
    if (ptsEl) ptsEl.textContent = `+${goldGained.toLocaleString()} GOLD (골드 스탯 강화 자금)`;

    modal.classList.remove('hidden');
  }

  closeLevelUpModal() {
    const modal = document.getElementById('levelUpModal');
    if (modal) modal.classList.add('hidden');
    this.updateHeaderAndStats();
  }

  showVictoryModal(boss, grade, result) {
    const modal = document.getElementById('victoryModal');
    if (!modal) return;

    this.createParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 80);

    const gradeEl = document.getElementById('victoryGrade');
    const bossNameEl = document.getElementById('victoryBossName');
    const expEl = document.getElementById('victoryExp');
    const goldEl = document.getElementById('victoryGold');
    const growthEl = document.getElementById('victoryGrowth');
    const dropItemEl = document.getElementById('victoryDropItem');
    const dropTitleEl = document.getElementById('victoryDropTitle');

    if (gradeEl) gradeEl.textContent = grade;
    if (bossNameEl) bossNameEl.textContent = `Stage ${boss.stage}: ${boss.name}`;
    const mults = result && result.titleMultipliers;
    const finalExp = (result && result.expResult && result.expResult.expAdded) ? result.expResult.expAdded : boss.rewards.exp;
    const finalGold = (result && result.goldResult && result.goldResult.goldAdded) ? result.goldResult.goldAdded : boss.rewards.gold;

    if (expEl) {
      expEl.textContent = (mults && mults.expMultiplier > 1) 
        ? `+${finalExp.toLocaleString()} EXP (칭호 x${mults.expMultiplier})` 
        : `+${finalExp.toLocaleString()} EXP`;
    }
    if (goldEl) {
      goldEl.textContent = (mults && mults.goldMultiplier > 1) 
        ? `+${finalGold.toLocaleString()} G (칭호 x${mults.goldMultiplier})` 
        : `+${finalGold.toLocaleString()} G`;
    }
    if (growthEl) {
      if (result && result.isFirstClear === false) {
        growthEl.textContent = `0 키 성장치 (재도전 수련 완료 · 일일 퀘스트로 키를 키우세요!)`;
        growthEl.style.color = '#94a3b8';
      } else {
        growthEl.textContent = `+${boss.rewards.growthPoints} 키 성장치 (+${(boss.rewards.growthPoints / 1000 * 0.1).toFixed(3)}cm) [최초 토벌 돌파 보너스]`;
        growthEl.style.color = '#34d399';
      }
    }

    if (dropItemEl) {
      dropItemEl.innerHTML = `
        <div class="drop-card rarity-${boss.rewards.item.rarity}">
          <div class="drop-name">${boss.rewards.item.name}</div>
          <div class="drop-stats">${boss.rewards.item.statsText}</div>
        </div>
      `;
    }

    if (dropTitleEl) {
      dropTitleEl.textContent = `[${boss.rewards.title}]`;
    }

    modal.classList.remove('hidden');
  }

  closeVictoryModal() {
    const modal = document.getElementById('victoryModal');
    if (modal) modal.classList.add('hidden');
    this.switchTab('bossTab');
    this.updateHeaderAndStats();
  }

  showDefeatModal(boss) {
    const modal = document.getElementById('defeatModal');
    if (!modal) return;

    const bossNameEl = document.getElementById('defeatBossName');
    if (bossNameEl) bossNameEl.textContent = `Stage ${boss.stage}: ${boss.name}`;

    modal.classList.remove('hidden');
  }

  closeDefeatModal() {
    const modal = document.getElementById('defeatModal');
    if (modal) modal.classList.add('hidden');
    this.switchTab('bossTab');
    this.updateHeaderAndStats();
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-bubble';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  setupEventListeners() {
    const editBtn = document.getElementById('btnEditProfile');
    if (editBtn) editBtn.addEventListener('click', () => this.openProfileModal());

    const saveProfileBtn = document.getElementById('btnSaveProfile');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => this.saveProfile());

    const closeProfileBtn = document.getElementById('btnCloseProfileModal');
    if (closeProfileBtn) closeProfileBtn.addEventListener('click', () => this.closeProfileModal());

    const bgmToggle = document.getElementById('bgmToggle');
    const sfxToggle = document.getElementById('sfxToggle');
    const bgmVolumeSlider = document.getElementById('bgmVolumeSlider');

    if (bgmToggle) {
      bgmToggle.checked = state.data.settings.bgmEnabled;
      bgmToggle.addEventListener('change', (e) => {
        state.data.settings.bgmEnabled = e.target.checked;
        if (!e.target.checked) sound.stopBGM();
        else sound.startBGM('ambient');
        state.save();
      });
    }

    if (sfxToggle) {
      sfxToggle.checked = state.data.settings.sfxEnabled;
      sfxToggle.addEventListener('change', (e) => {
        state.data.settings.sfxEnabled = e.target.checked;
        if (e.target.checked) sound.isMuted = false;
        else sound.isMuted = true;
        state.save();
      });
    }

    if (bgmVolumeSlider) {
      bgmVolumeSlider.value = state.data.settings.bgmVolume * 100;
      bgmVolumeSlider.addEventListener('input', (e) => {
        const vol = parseInt(e.target.value) / 100;
        sound.setVolume(vol);
        state.data.settings.bgmVolume = vol;
        state.save();
      });
    }

    // Data Retention & Backup / Restore Wiring
    const exportFileBtn = document.getElementById('btnExportSaveFile');
    if (exportFileBtn) {
      exportFileBtn.addEventListener('click', () => state.exportSaveFile());
    }

    const exportCodeBtn = document.getElementById('btnExportSaveCode');
    if (exportCodeBtn) {
      exportCodeBtn.addEventListener('click', () => state.exportSaveCode());
    }

    const fileInputImport = document.getElementById('fileInputImport');
    if (fileInputImport) {
      fileInputImport.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          state.importSaveFile(e.target.files[0]);
          e.target.value = ''; // Reset input
        }
      });
    }

    const importCodeBtn = document.getElementById('btnImportSaveCode');
    if (importCodeBtn) {
      importCodeBtn.addEventListener('click', () => {
        const code = prompt("복사해 두었던 세이브 텍스트 코드를 붙여넣으세요:");
        if (code) {
          state.importSaveCode(code);
        }
      });
    }

    const resetBtn = document.getElementById('btnResetData');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        const isCloud = Boolean(state.cloudSession && state.cloudSession.userId);
        const userId = isCloud ? state.cloudSession.userId : '';

        const msg1 = isCloud
          ? `⚠️ 정말로 모든 수련 기록과 50단계 보스 클리어 데이터를 초기화하시겠습니까?\n\n현재 연동된 클라우드 계정 [${userId}]의 서버 데이터까지 모두 Lv.1(처음 상태)로 완전 초기화됩니다!\n이 작업은 되돌릴 수 없습니다!`
          : "⚠️ 정말로 모든 수련 기록과 50단계 보스 클리어 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다!";

        if (!confirm(msg1)) return;
        if (!confirm("확인: 정말 모든 데이터를 삭제하고 처음부터 다시 시작하시겠습니까?")) return;

        try {
          if (typeof sound !== 'undefined') sound.playDefeat();
          ui.showToast('⏳ 데이터를 완전히 초기화하고 서버에 반영 중입니다...', 'warning', 4000);
          resetBtn.disabled = true;
          resetBtn.textContent = '⏳ 초기화 진행 중...';

          await state.resetAll(false);

          ui.showToast('✅ 데이터 전체 초기화 완료! 처음부터 다시 시작합니다.', 'success', 2000);
          setTimeout(() => {
            location.reload();
          }, 400);
        } catch (err) {
          console.error("Reset error:", err);
          location.reload();
        }
      });
    }

    const customQuestForm = document.getElementById('customQuestForm');
    if (customQuestForm) {
      customQuestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const titleInput = document.getElementById('cqTitle');
          const title = titleInput ? titleInput.value.trim() : '';
          if (!title) {
            alert('퀘스트 제목을 입력해주세요!');
            return;
          }

          const descInput = document.getElementById('cqDesc');
          const catSelect = document.getElementById('cqCategory');
          const tierSelect = document.getElementById('cqTier');
          const expInput = document.getElementById('cqExp');
          const goldInput = document.getElementById('cqGold');
          const growthInput = document.getElementById('cqGrowth');
          const typeSelect = document.getElementById('cqType');
          const countInput = document.getElementById('cqCount');
          const unitInput = document.getElementById('cqUnit');

          const data = {
            title: title,
            description: (descInput && descInput.value.trim()) || '나만의 현실 수련 도전과제',
            category: catSelect ? catSelect.value : 'height',
            categoryName: catSelect ? catSelect.selectedOptions[0].text : '신체 & 키 성장',
            tier: tierSelect ? tierSelect.value : 'B',
            exp: parseInt(expInput ? expInput.value : 350) || 350,
            gold: parseInt(goldInput ? goldInput.value : 120) || 120,
            growthPoints: parseInt(growthInput ? growthInput.value : 10) || 10,
            type: typeSelect ? typeSelect.value : 'check',
            targetCount: (countInput && countInput.value) ? parseInt(countInput.value) : null,
            unit: (unitInput && unitInput.value.trim()) ? unitInput.value.trim() : '회'
          };

          quests.saveCustomQuest(data);
          customQuestForm.reset();
        } catch (err) {
          console.error("Custom quest registration error:", err);
          alert("퀘스트 등록 처리 중 오류가 발생했습니다: " + err.message);
        }
      });
    }

    // Enable drag-to-scroll & mouse wheel scrolling on zone & category tabs
    this.enableDragToScroll(document.getElementById('bossZoneTabs'));
    this.enableDragToScroll(document.getElementById('questCategoryTabs'));
    this.renderCloudModalState();
  }

  // --- Cloud Account Login & Multi-Device Sync UI ---

  updateAuthGateVisibility() {
    const gate = document.getElementById('authGateScreen');
    const banner = document.getElementById('authGateRecordBanner');
    const isLogged = state.isCloudLoggedIn();

    if (isLogged) {
      document.body.classList.remove('auth-gate-locked');
      if (gate) gate.classList.add('hidden');
    } else {
      document.body.classList.add('auth-gate-locked');
      if (gate) gate.classList.remove('hidden');

      if (banner) {
        const score = state.getProgressionScore(state.data);
        const p = state.data.player;
        const heightStr = typeof state.getCurrentHeight === 'function' ? state.getCurrentHeight().toFixed(2) : '173.00';
        if (!state.data.ownerAccountId && score > 0) {
          banner.innerHTML = `
            🔥 <strong style="color:#34d399;">이 기기에서 플레이하던 기존 기록 감지!</strong><br>
            • 현재 기기 기록: <strong style="color:#facc15;">Lv.${p.level} · ${p.gold.toLocaleString()} G · 신장 ${heightStr} cm</strong><br>
            • 지금 <strong>[✨ 회원가입]</strong> 또는 <strong>[🔑 로그인]</strong>을 하시면 위 기록이 계정에 <strong>100% 그대로 자동 반영</strong>됩니다!
          `;
        } else {
          banner.innerHTML = `
            ✨ <strong>클라우드 계정 연동 안내</strong><br>
            • 처음 오셨다면 아이디·비밀번호 입력 후 <strong>[✨ 회원가입]</strong>을 눌러주세요. (기존 기기 기록 100% 자동 흡수)<br>
            • 이미 계정을 만드셨다면 <strong>[🔑 로그인]</strong>을 눌러 사파리·구글·타기기 어디서든 이어하세요!
          `;
        }
      }
    }
  }

  setAuthGateMode(mode) {
    sound.playClick();
    this.authGateMode = mode === 'register' ? 'register' : 'login';
    const tabLogin = document.getElementById('authTabLogin');
    const tabReg = document.getElementById('authTabRegister');
    const guide = document.getElementById('authModeGuideText');
    const msg = document.getElementById('authGateFeedbackMsg');
    if (msg) msg.textContent = '';

    if (this.authGateMode === 'register') {
      if (tabLogin) tabLogin.className = 'auth-mode-tab';
      if (tabReg) tabReg.className = 'auth-mode-tab active-register';
      if (guide) {
        guide.textContent = '사용할 새 아이디와 비밀번호를 입력하고 아래 [✨ 회원가입] 버튼을 눌러주세요! (기존 기록 자동 저장)';
        guide.style.color = '#facc15';
      }
    } else {
      if (tabLogin) tabLogin.className = 'auth-mode-tab active-login';
      if (tabReg) tabReg.className = 'auth-mode-tab';
      if (guide) {
        guide.textContent = '기존에 만든 아이디와 비밀번호를 입력하고 아래 [🔑 로그인] 버튼을 눌러 입장하세요.';
        guide.style.color = '#38bdf8';
      }
    }
  }

  submitActiveAuthGate() {
    this.handleCloudAuth('gate', this.authGateMode || 'login');
  }

  openCloudModal() {
    sound.playClick();
    this.renderCloudModalState();
    const modal = document.getElementById('cloudAccountModal');
    if (modal) modal.classList.remove('hidden');
  }

  closeCloudModal() {
    sound.playClick();
    const modal = document.getElementById('cloudAccountModal');
    if (modal) modal.classList.add('hidden');
  }

  renderCloudModalState() {
    const sess = state.cloudSession;
    const loggedInView = document.getElementById('cloudLoggedInView');
    const loginFormView = document.getElementById('cloudLoginFormView');
    const activeUserEl = document.getElementById('cloudActiveUserId');
    const lastSyncEl = document.getElementById('cloudLastSyncTime');
    const settingsStatusBox = document.getElementById('settingsCloudAccountSummary');

    if (sess && sess.userId) {
      if (loggedInView) loggedInView.classList.remove('hidden');
      if (loginFormView) loginFormView.classList.add('hidden');
      if (activeUserEl) activeUserEl.textContent = sess.userId;
      if (lastSyncEl) {
        const dt = sess.lastSyncTime ? new Date(sess.lastSyncTime) : new Date();
        lastSyncEl.textContent = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      if (settingsStatusBox) {
        settingsStatusBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
              <div style="font-size:14px; font-weight:800; color:#34d399;">🟢 현재 연동된 계정: [${sess.userId}]</div>
              <div style="font-size:11px; color:#94a3b8; margin-top:2px;">사파리·구글·타기기 어디서든 [${sess.userId}] 계정으로 로그인하면 자동 연동됩니다.</div>
            </div>
            <button type="button" class="btn btn-xs btn-outline-cyan" onclick="ui.openCloudModal()">계정 관리 / 로그아웃</button>
          </div>
        `;
      }
    } else {
      if (loggedInView) loggedInView.classList.add('hidden');
      if (loginFormView) loginFormView.classList.remove('hidden');
      if (settingsStatusBox) {
        settingsStatusBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
              <div style="font-size:14px; font-weight:800; color:#38bdf8;">☁️ 현재 클라우드 미연동</div>
              <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">아이디·비밀번호로 로그인하면 기록이 서버에 영구 저장됩니다!</div>
            </div>
            <button type="button" class="btn btn-xs btn-primary" onclick="ui.openCloudModal()">🔑 로그인 / 회원가입</button>
          </div>
        `;
      }
    }
  }

  async handleCloudAuth(source = 'gate', mode = 'login') {
    const isGate = source === 'gate';
    const idInput = document.getElementById(isGate ? 'authGateIdInput' : 'cloudIdInput');
    const pwInput = document.getElementById(isGate ? 'authGatePwInput' : 'cloudPwInput');
    const msgBox = document.getElementById(isGate ? 'authGateFeedbackMsg' : 'cloudModalFeedbackMsg');
    const btnLogin = document.getElementById(isGate ? 'btnAuthGateLogin' : 'btnCloudLoginSubmit');
    const btnReg = document.getElementById(isGate ? 'btnAuthGateRegister' : 'btnCloudRegisterSubmit');

    if (isGate) {
      this.setAuthGateMode(mode);
    }

    const userId = idInput ? idInput.value.trim() : '';
    const password = pwInput ? pwInput.value.trim() : '';

    if (!userId || !password) {
      const warn = '⚠️ 아이디와 비밀번호를 모두 입력해주세요!';
      if (msgBox) {
        msgBox.textContent = warn;
        msgBox.style.color = '#f87171';
      }
      this.showToast(warn, 'error');
      return;
    }

    if (btnLogin) btnLogin.disabled = true;
    if (btnReg) btnReg.disabled = true;

    if (msgBox) {
      msgBox.textContent = mode === 'register'
        ? `⏳ [${userId}] 새 계정을 생성하고 기기 기록을 서버에 연동 중입니다...`
        : `⏳ [${userId}] 계정 인증 및 서버 데이터를 불러오는 중입니다...`;
      msgBox.style.color = '#38bdf8';
    }

    const res = await state.loginOrRegisterCloud(userId, password, mode);

    if (btnLogin) btnLogin.disabled = false;
    if (btnReg) btnReg.disabled = false;

    if (!res || !res.success) {
      sound.playDefeat();
      const errMsg = (res && res.message) || '로그인/회원가입에 실패했습니다.';
      if (msgBox) {
        msgBox.textContent = errMsg;
        msgBox.style.color = '#f87171';
      }
      this.showToast(errMsg, 'error');
      return;
    }

    sound.playLevelUp();
    if (msgBox) msgBox.textContent = '';

    this.updateAuthGateVisibility();
    this.closeCloudModal();
    this.renderCloudModalState();
    this.renderAll();

    if (res.isNew) {
      this.showToast(`🎉 [${res.userId}] 회원가입 완료! 기존 기기 수련 기록이 100% 계정에 저장되어 메인 화면으로 입장합니다!`);
    } else if (res.mergedPreLogin) {
      this.showToast(`⚡ [${res.userId}] 로그인 성공! 기기 기록과 서버 데이터가 완벽하게 통합 연동되었습니다!`);
    } else {
      this.showToast(`⚡ [${res.userId}] 각성자님 환영합니다! 서버 데이터 동기화 완료!`);
    }
  }

  async handleCloudLogin(prefix = 'modal') {
    return this.handleCloudAuth(prefix === 'gate' ? 'gate' : 'modal', 'login');
  }

  async handleCloudForceUpload() {
    sound.playClick();
    this.showToast("⏳ 현재 기기 데이터를 클라우드 서버에 저장 중...");
    const res = await state.syncToCloud(true);
    this.renderCloudModalState();
    if (res && res.success) {
      sound.playLevelUp();
      this.showToast(`☁️ [${state.cloudSession.userId}] 계정에 현재 기록이 안전하게 서버 저장되었습니다!`);
    } else {
      this.showToast("서버 저장 중 일시적 지연이 발생했습니다. 다시 시도해주세요.", "error");
    }
  }

  async handleCloudForceDownload() {
    sound.playClick();
    this.showToast("⏳ 클라우드 서버에서 최신 기록을 불러오는 중...");
    const res = await state.pullFromCloud(false, true); // Force overwrite local with authoritative cloud save
    this.renderCloudModalState();
    if (res && res.success) {
      sound.playLevelUp();
      this.showToast(`☁️ [${state.cloudSession.userId}] 서버 데이터 동기화 완료!`);
    } else {
      this.showToast("서버 불러오기 실패. 잠시 후 다시 시도해주세요.", "error");
    }
  }

  async handleRestoreByKeyOrCode(source = 'gate') {
    sound.playClick();
    const inputEl = document.getElementById(source === 'gate' ? 'authGateRestoreInput' : 'cloudModalRestoreInput');
    const keyVal = inputEl ? inputEl.value.trim() : '';
    if (!keyVal) {
      this.showToast('클라우드 키 또는 백업 코드를 입력해주세요!', 'error');
      return;
    }
    this.showToast('⏳ 클라우드에서 세이브 데이터를 복원 중...');
    const res = await state.importFromCloudKey(keyVal);
    if (res && res.success) {
      sound.playLevelUp();
      this.closeCloudModal();
      this.updateAuthGateVisibility();
      this.renderAll();
      this.showToast(`🎉 [${res.userId}] 데이터가 100% 완벽 복원되어 메인 화면으로 진입합니다!`);
    } else {
      sound.playDefeat();
      this.showToast((res && res.message) || '복원에 실패했습니다.', 'error');
    }
  }

  async handleCloudLogout() {
    sound.playClick();
    const prevUser = state.cloudSession ? state.cloudSession.userId : '';
    await state.logoutCloud();
    this.closeCloudModal();
    this.renderCloudModalState();
    this.updateHeaderAndStats();
    this.updateAuthGateVisibility();
    this.showToast(`🚪 [${prevUser}] 계정에서 로그아웃되어 로그인/회원가입 화면으로 돌아왔습니다.`);
  }
}

// Global UI manager instance
const ui = new UIManager();
