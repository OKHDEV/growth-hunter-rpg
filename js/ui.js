// UI Management: High School 2nd Grade (173cm -> 178cm) & 3D Boxing Controls & Modals
class UIManager {
  constructor() {
    this.currentTab = 'statusTab';
    this.currentBossZone = 1;
    this.particleCanvas = null;
    this.particleCtx = null;
    this.particles = [];
  }

  init() {
    this.initCanvas();
    this.setupTabNavigation();
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
    } else {
      sound.startBGM('ambient');
    }

    if (tabId === 'statusTab') this.updateHeaderAndStats();
    if (tabId === 'questTab') {
      quests.renderQuestList();
      this.renderAttendanceCalendar();
    }
    if (tabId === 'bossTab') this.renderBossStageCards();
    if (tabId === 'inventoryTab') this.renderInventory();
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
    const hdrLevel = document.getElementById('hdrPlayerLevel');
    const hdrRank = document.getElementById('hdrPlayerRank');
    const hdrGold = document.getElementById('hdrPlayerGold');
    const hdrStreak = document.getElementById('hdrDailyStreak');

    if (hdrName) hdrName.textContent = p.name;
    if (hdrLevel) hdrLevel.textContent = `Lv.${p.level}`;
    if (hdrRank) {
      hdrRank.textContent = rank.name;
      hdrRank.style.color = rank.color;
    }
    if (hdrGold) hdrGold.textContent = p.gold.toLocaleString();
    if (hdrStreak) hdrStreak.textContent = `${state.data.quests.dailyStreak}일 연속`;

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
    if (statTitle) statTitle.textContent = p.activeTitle;
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

    if (freePoints) freePoints.textContent = p.freeStatPoints;

    document.querySelectorAll('.stat-row').forEach(row => {
      const statKey = row.dataset.stat;
      if (!statKey) return;

      const valEl = row.querySelector('.stat-val');
      const addBtn = row.querySelector('.btn-add-stat');

      if (valEl) {
        const bonus = effective[statKey] - p.stats[statKey];
        valEl.innerHTML = bonus > 0 
          ? `${effective[statKey]} <span style="font-size:11px; opacity:0.8; font-weight:normal;">(+${bonus})</span>`
          : `${effective[statKey]}`;
      }
      if (addBtn) {
        addBtn.disabled = p.freeStatPoints <= 0;
      }
    });

    const derivedHp = document.getElementById('statDerivedHp');
    const derivedMp = document.getElementById('statDerivedMp');
    const derivedAtk = document.getElementById('statDerivedAtk');
    const derivedDef = document.getElementById('statDerivedDef');
    const derivedCrit = document.getElementById('statDerivedCrit');

    if (derivedHp) derivedHp.textContent = effective.maxHp.toLocaleString();
    if (derivedMp) derivedMp.textContent = effective.maxMp.toLocaleString();
    if (derivedAtk) derivedAtk.textContent = effective.atk.toLocaleString();
    if (derivedDef) derivedDef.textContent = effective.def.toLocaleString();
    if (derivedCrit) derivedCrit.textContent = `${(effective.crit * 100).toFixed(1)}%`;
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

  // --- Daily Attendance Calendar ---

  renderAttendanceCalendar() {
    const listEl = document.getElementById('attendanceDaysList');
    if (!listEl) return;

    const streakEl = document.getElementById('attStreakDays');
    const totalEl = document.getElementById('attTotalDays');
    const rateEl = document.getElementById('attSuccessRate');

    const questsData = state.data.quests;
    const todayStr = new Date().toISOString().slice(0, 10);

    if (!questsData.startDate) {
      questsData.startDate = todayStr;
    }

    // Align startDate for existing players with multi-day streaks
    if (questsData.dailyStreak > 1 && questsData.startDate === todayStr) {
      const past = new Date();
      past.setDate(past.getDate() - (questsData.dailyStreak - 1));
      questsData.startDate = past.toISOString().slice(0, 10);
      if (!questsData.history) questsData.history = {};
      for (let i = 1; i < questsData.dailyStreak; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().slice(0, 10);
        if (!questsData.history[dStr]) {
          questsData.history[dStr] = 3;
        }
      }
    }

    if (!questsData.history) questsData.history = {};

    // Generate date sequence from startDate to today
    const dates = [];
    const startObj = new Date(questsData.startDate + 'T00:00:00');
    const todayObj = new Date(todayStr + 'T00:00:00');

    if (isNaN(startObj.getTime()) || startObj > todayObj) {
      dates.push(todayStr);
    } else {
      const cur = new Date(startObj);
      while (cur <= todayObj) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
      }
    }

    const todayCompletedCount = Object.keys(questsData.completedToday || {}).length;
    questsData.history[todayStr] = todayCompletedCount;

    let completedDaysCount = 0;
    const dayOfWeekNames = ['일', '월', '화', '수', '목', '금', '토'];

    listEl.innerHTML = '';

    dates.forEach(dStr => {
      const isToday = (dStr === todayStr);
      const count = isToday ? todayCompletedCount : (questsData.history[dStr] || 0);

      const parts = dStr.split('-');
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const dayDateObj = new Date(dStr + 'T00:00:00');
      const dow = dayOfWeekNames[dayDateObj.getDay()] || '';

      const card = document.createElement('div');

      if (count > 0) {
        completedDaysCount++;
        card.className = `att-day-card day-completed ${isToday ? 'day-today' : ''}`;
        card.innerHTML = `
          <span class="att-day-date">${month}.${day} (${dow})${isToday ? ' <b style="color:#00e5ff;">[오늘]</b>' : ''}</span>
          <div class="att-day-mark" style="color:#10b981;">✔️</div>
          <div class="att-day-status" style="color:#34d399;">${count}개 완료</div>
          <small style="font-size:10px; color:#94a3b8;">수련 완수</small>
        `;
      } else {
        if (isToday) {
          card.className = `att-day-card day-today`;
          card.innerHTML = `
            <span class="att-day-date">${month}.${day} (${dow}) <b style="color:#00e5ff;">[오늘]</b></span>
            <div class="att-day-mark" style="color:#f59e0b;">⏳</div>
            <div class="att-day-status" style="color:#fbbf24;">진행 중 (0개)</div>
            <small style="font-size:10px; color:#cbd5e1;">퀘스트 도전</small>
          `;
        } else {
          card.className = `att-day-card day-missed`;
          card.innerHTML = `
            <span class="att-day-date">${month}.${day} (${dow})</span>
            <div class="att-day-mark" style="color:#ef4444;">❌</div>
            <div class="att-day-status" style="color:#f87171;">미수행</div>
            <small style="font-size:10px; color:#64748b;">수련 휴식</small>
          `;
        }
      }
      listEl.appendChild(card);
    });

    if (streakEl) streakEl.textContent = `${questsData.dailyStreak}`;
    if (totalEl) totalEl.textContent = `${completedDaysCount}`;
    if (rateEl) {
      const rate = dates.length > 0 ? Math.round((completedDaysCount / dates.length) * 100) : 0;
      rateEl.textContent = `${rate}%`;
    }

    // Scroll to the latest day automatically
    requestAnimationFrame(() => {
      listEl.scrollLeft = listEl.scrollWidth;
    });
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
      } else {
        bossTabEl.classList.remove('zone-omega-theme');
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
        { id: 6, name: "👑 [제100의 벽] 찐막 최종보스" }
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

      card.innerHTML = `
        <div class="boss-img-wrap">
          <img src="${boss.image}" alt="${boss.name}" class="boss-card-img" />
          <div class="boss-stage-badge" style="${boss.isSecretFinal ? 'background:linear-gradient(135deg, #f59e0b, #ef4444);' : ''}">
            ${boss.isSecretFinal ? '👑 제100의 벽' : `STAGE ${boss.stage}`}
          </div>
          ${isCleared ? `<div class="boss-cleared-badge">토벌 완료</div>` : ''}
          ${!isUnlocked ? `<div class="boss-lock-overlay">🔒 이전 스테이지 클리어 필요</div>` : ''}
        </div>
        <div class="boss-info-wrap">
          <div class="boss-month-tag" style="margin-bottom:4px; ${boss.isSecretFinal ? 'border-color:#f59e0b; color:#fbbf24; background:rgba(245,158,11,0.25);' : ''}">
            ${boss.isSecretFinal ? '👑 [찐막 최종보스] 신장 178cm 절대 거신' : `⏳ ${boss.trainingMonths}달(${boss.trainingDays}일) 매일 수련 필수`}
          </div>
          <div class="boss-title-row">
            <h3 class="boss-card-name">${boss.name}</h3>
            <span class="boss-card-rec ${isRecommended ? 'rec-ok' : 'rec-warn'}">권장 Lv.${boss.recommendedLevel}</span>
          </div>
          <div class="boss-card-sub">${boss.subName}</div>
          <p class="boss-card-quote">${boss.introQuote}</p>
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
          <button class="btn btn-raid-start ${isUnlocked ? '' : 'disabled'} ${boss.isSecretFinal ? 'btn-omega-challenge' : ''}" ${isUnlocked ? '' : 'disabled'} onclick="ui.startBossRaid('${boss.id}')">
            ${isCleared ? '다시 도전하기' : (boss.isSecretFinal ? '🔥 절대 거신과 1:1 결전' : '보스 1:1 맞다이 결전')}
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
      const items = state.data.player.inventory;

      if (items.length === 0) {
        bagContainer.innerHTML = `<div class="empty-bag-text">보유한 장비가 없습니다. 50단계 보스를 격파하여 전설의 장비를 획득하세요!</div>`;
      } else {
        items.forEach(item => {
          const isEquipped = eq[item.slot] && eq[item.slot].id === item.id;
          const card = document.createElement('div');
          card.className = `bag-item-card rarity-${item.rarity} ${isEquipped ? 'is-equipped' : ''}`;

          card.innerHTML = `
            <div class="item-header">
              <span class="item-name">${item.name}</span>
              <span class="item-slot-tag">${slotNames[item.slot]}</span>
            </div>
            <div class="item-stats-text">${item.statsText}</div>
            <div class="item-action">
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

    const titlesContainer = document.getElementById('titlesContainer');
    if (titlesContainer) {
      titlesContainer.innerHTML = '';
      const unlocked = state.data.player.unlockedTitles;
      const active = state.data.player.activeTitle;

      unlocked.forEach(tName => {
        const tInfo = TITLES_DATA[tName] || { name: tName, desc: '', bonusText: '' };
        const card = document.createElement('div');
        const isActive = active === tName;
        card.className = `title-card ${isActive ? 'active' : ''}`;

        card.innerHTML = `
          <div class="title-card-top">
            <span class="title-name">${tInfo.name}</span>
            ${isActive ? `<span class="badge-active">착용 중</span>` : ''}
          </div>
          <div class="title-desc">${tInfo.desc}</div>
          <div class="title-bonus">${tInfo.bonusText}</div>
          ${!isActive ? `<button class="btn btn-xs btn-outline-cyan" onclick="state.setActiveTitle('${tName}'); ui.renderInventory(); ui.updateHeaderAndStats();">칭호 착용</button>` : ''}
        `;
        titlesContainer.appendChild(card);
      });
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
    if (ptsEl) ptsEl.textContent = `+${expResult.levelsGained * 5} STAT POINTS`;

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
    if (expEl) expEl.textContent = `+${boss.rewards.exp.toLocaleString()} EXP`;
    if (goldEl) goldEl.textContent = `+${boss.rewards.gold.toLocaleString()} G`;
    if (growthEl) growthEl.textContent = `+${boss.rewards.growthPoints} 키 성장치 (+${(boss.rewards.growthPoints / 1000 * 0.1).toFixed(3)}cm)`;

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

    document.querySelectorAll('.btn-add-stat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('.stat-row');
        const statKey = row.dataset.stat;
        if (statKey) {
          sound.playClick();
          const success = state.allocateStat(statKey, 1);
          if (success) {
            this.updateHeaderAndStats();
          }
        }
      });
    });

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
      resetBtn.addEventListener('click', () => {
        if (confirm("⚠️ 정말로 모든 수련 기록과 50단계 보스 클리어 데이터를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다!")) {
          if (confirm("확인: 정말 모든 데이터를 삭제하시겠습니까?")) {
            state.resetAll();
            location.reload();
          }
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
  }
}

// Global UI manager instance
const ui = new UIManager();
