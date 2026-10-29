// 1:1 Turn-Based Face-Off Battle Engine (나 한 대 때리고, 보스 한 대 때리는 1:1 맞다이 결전)
class BattleEngine {
  constructor() {
    this.boss = null;
    this.stage = 1;
    this.inBattle = false;
    this.turn = 1;
    this.isTurnProcessing = false;

    // Combat Stats
    this.playerHp = 700;
    this.playerMaxHp = 700;
    this.bossHp = 3200;
    this.bossMaxHp = 3200;

    this.battleLog = [];
    this.bindControls();
  }

  startBattle(bossId) {
    const boss = BOSSES_DATA.find(b => b.id === bossId);
    if (!boss) return false;

    this.boss = boss;
    this.stage = boss.stage;
    this.inBattle = true;
    this.turn = 1;
    this.isTurnProcessing = false;
    this.battleLog = [];
    document.body.classList.add('in-battle');

    const pStats = state.getEffectiveStats();
    this.playerMaxHp = pStats.maxHp;
    this.playerHp = pStats.maxHp;

    this.bossMaxHp = boss.maxHp;
    this.bossHp = boss.maxHp;

    const arenaEl = document.getElementById('battleArena');
    const bossCardEl = document.getElementById('bossCard');

    if (boss.isSecretFinal) {
      if (arenaEl) arenaEl.classList.add('arena-omega-mode');
      if (bossCardEl) bossCardEl.classList.add('boss-card-omega');
      sound.playCosmicGodIntro();
      this.shakeElement('battleArena', 'heavy');

      this.addLog(`👑 [EMERGENCY MYTHIC RAID] 차원과 신장의 절대 거신, 오메가 크로노스가 강림했습니다!`, "boss-action");
      this.addLog(`💬 오메가 크로노스: ${boss.introQuote}`, "boss-quote");
      this.addLog(`⚡ [초월적 위압감] 체력 999,999, 공격력 8,888의 우람한 거신과 목숨을 건 1:1 맞다이가 시작됩니다!`, "player-crit");
    } else {
      if (arenaEl) arenaEl.classList.remove('arena-omega-mode');
      if (bossCardEl) bossCardEl.classList.remove('boss-card-omega');
      sound.startBGM('battle');
      sound.playBossRoar();

      this.addLog(`⚔️ [결전 개막] Stage ${boss.stage} ${boss.name}과의 1:1 맞다이 혈투가 시작되었습니다!`, "system");
      this.addLog(`💬 ${boss.name}: ${boss.introQuote}`, "boss-quote");
      this.addLog(`⚠️ [난이도 경고] 보스 1단계마다 1달간(30일) 매일 일일퀘스트를 완료하여 스탯을 단련해야 아슬아슬하게 깰 수 있습니다!`, "boss-action");
    }

    this.renderBattleUI();
    return true;
  }

  // --- Strict 1:1 Trade: I hit, Boss hits back! ---

  executeTurnExchange() {
    if (!this.inBattle || this.isTurnProcessing) return;
    this.isTurnProcessing = true;

    const btn = document.getElementById('btnOneAttack');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('attacking');
      btn.innerHTML = `
        <span class="btn-main-label">⚡ [턴 ${this.turn}] 전력 공방 격돌 중...</span>
        <span class="btn-sub-label">나 한 대 때리고 보스 한 대 맞기</span>
      `;
    }

    const pStats = state.getEffectiveStats();

    // ============================================
    // PHASE 1: [플레이어 전력 일격 타격!]
    // ============================================
    try {
      sound.playClick();
    } catch(e) {}

    const isPlayerCrit = Math.random() < pStats.crit;
    let playerRawDmg = Math.round(pStats.atk * (isPlayerCrit ? 1.5 : 1.0));
    // Apply boss defense
    let playerNetDmg = Math.max(1, Math.round(playerRawDmg - (this.boss.def * 0.75)));
    // Add small variance (+- 5%)
    playerNetDmg = Math.round(playerNetDmg * (0.95 + Math.random() * 0.1));

    // Audio & Visual Effects
    try {
      sound.playPunchImpact(isPlayerCrit);
    } catch(e) {}
    this.animatePlayerStrike();
    this.animateBossHit();
    this.shakeElement('bossCard', isPlayerCrit ? 'heavy' : 'medium');
    
    const critText = isPlayerCrit ? `💥 치명타! -${playerNetDmg.toLocaleString()}` : `-${playerNetDmg.toLocaleString()}`;
    const critColor = isPlayerCrit ? '#facc15' : '#ffffff';
    this.spawnFloatingText(critText, critColor, 'boss', isPlayerCrit);

    this.bossHp = Math.max(0, this.bossHp - playerNetDmg);
    this.updateBattleUI();
    this.addLog(`⚔️ [턴 ${this.turn}] 오경호의 전력 일격! 보스에게 ${playerNetDmg.toLocaleString()}의 피해! ${isPlayerCrit ? '(💥 치명타 작렬!)' : ''}`, isPlayerCrit ? 'player-crit' : 'normal');

    // Check Boss Victory
    if (this.bossHp <= 0) {
      setTimeout(() => {
        this.handleVictory();
      }, 700);
      return;
    }

    // ============================================
    // PHASE 2: [보스 반격 타격! - 420ms 후]
    // ============================================
    setTimeout(() => {
      try {
        if (!this.inBattle) return;

        const bossCrit = Math.random() < this.boss.crit;
        let bossRawDmg = Math.round(this.boss.atk * (bossCrit ? 1.35 : 1.0));
        // Apply player defense
        let bossNetDmg = Math.max(15, Math.round(bossRawDmg - (pStats.def * 0.85)));
        // Add small variance
        bossNetDmg = Math.round(bossNetDmg * (0.95 + Math.random() * 0.1));

        // Audio & Visual Effects
        try {
          sound.playHeavySmash();
        } catch(e) {
          try { sound.playPunchImpact(true); } catch(err) {}
        }
        this.animateBossStrike();
        this.animatePlayerHit();
        this.shakeElement('battleArena', 'heavy');

        const flashOverlay = document.getElementById('screenFlashOverlay');
        if (flashOverlay) {
          flashOverlay.classList.add('flash-red');
          setTimeout(() => flashOverlay.classList.remove('flash-red'), 260);
        }

        this.spawnFloatingText(`💀 보스 반격! -${bossNetDmg.toLocaleString()}`, '#ff0055', 'player', true);
        this.playerHp = Math.max(0, this.playerHp - bossNetDmg);
        this.updateBattleUI();
        this.addLog(`💀 [보스 반격] ${this.boss.name}의 파괴적 강타! 오경호에게 ${bossNetDmg.toLocaleString()} 치명타 피해!`, 'boss-action');

        // Check Player Defeat
        if (this.playerHp <= 0) {
          setTimeout(() => {
            this.handleDefeat();
          }, 800);
          return;
        }

        // ============================================
        // Next Turn Ready!
        // ============================================
        this.turn++;
        this.isTurnProcessing = false;
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('attacking');
          if (this.boss.isSecretFinal) {
            btn.innerHTML = `
              <span class="btn-main-label">👑 [턴 ${this.turn}] 거신의 심장을 향한 필사의 일격!</span>
              <span class="btn-sub-label">⚔️ 나 한 대 때리고, 절대 거신 한 대 맞기 [Space / Enter / 클릭]</span>
            `;
          } else {
            btn.innerHTML = `
              <span class="btn-main-label">💥 [턴 ${this.turn}] 결전의 일격 가하기</span>
              <span class="btn-sub-label">⚔️ 나 한 대 때리고 보스 한 대 맞기 [Space / Enter / 클릭]</span>
            `;
          }
        }
      } catch(err) {
        console.error("Error during boss counter-strike:", err);
        this.isTurnProcessing = false;
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('attacking');
        }
      }
    }, 420);
  }

  // --- Visual Animations ---

  animatePlayerStrike() {
    const playerCard = document.getElementById('playerCombatCard');
    if (!playerCard) return;
    playerCard.classList.remove('strike-lunge');
    void playerCard.offsetWidth;
    playerCard.classList.add('strike-lunge');
  }

  animatePlayerHit() {
    const playerCard = document.getElementById('playerCombatCard');
    if (!playerCard) return;
    playerCard.classList.remove('player-recoil');
    void playerCard.offsetWidth;
    playerCard.classList.add('player-recoil');
  }

  animateBossHit() {
    const bossImg = document.getElementById('bossImage');
    if (!bossImg) return;
    bossImg.classList.remove('boss-recoil');
    void bossImg.offsetWidth;
    bossImg.classList.add('boss-recoil');
  }

  animateBossStrike() {
    const bossCard = document.getElementById('bossCard');
    if (!bossCard) return;
    bossCard.classList.remove('boss-lunge-attack');
    void bossCard.offsetWidth;
    bossCard.classList.add('boss-lunge-attack');
  }

  spawnFloatingText(text, color, target, isBig = false) {
    const parent = target === 'boss' ? document.getElementById('bossCard') : document.getElementById('playerCombatCard');
    if (!parent) return;

    const el = document.createElement('div');
    el.className = `floating-dmg-text ${isBig ? 'big-crit' : ''}`;
    el.textContent = text;
    el.style.color = color;
    el.style.left = `${30 + Math.random() * 40}%`;
    el.style.top = `${25 + Math.random() * 30}%`;

    parent.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  shakeElement(elementId, intensity = 'medium') {
    const el = document.getElementById(elementId);
    if (!el || !state.data.settings.screenShake) return;

    el.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
    el.classList.add(`shake-${intensity}`);
    setTimeout(() => el.classList.remove(`shake-${intensity}`), 350);
  }

  // --- Keyboard & Click Controls ---

  bindControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.inBattle) return;
      if (e.code === 'Space' || e.key === 'Enter' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        this.executeTurnExchange();
      }
    });
  }

  // --- Render & UI Updates ---

  renderBattleUI() {
    const bossImg = document.getElementById('bossImage');
    const bossCardEl = document.getElementById('bossCard');
    const v = this.boss.visual;
    if (bossImg) {
      bossImg.src = this.boss.image;
      bossImg.className = 'boss-arena-img';
      if (v && !this.boss.isSecretFinal) {
        bossImg.style.filter = `drop-shadow(0 0 18px ${v.color})`;
        bossImg.style.transform = '';
        bossImg.style.objectPosition = '';
      } else {
        bossImg.style.filter = '';
        bossImg.style.transform = '';
        bossImg.style.objectPosition = '';
      }
    }
    if (bossCardEl) {
      if (v && !this.boss.isSecretFinal) {
        bossCardEl.style.borderColor = v.color;
        bossCardEl.style.boxShadow = `0 10px 45px rgba(0, 0, 0, 0.9), 0 0 32px ${v.color}44, inset 0 0 24px ${v.subColor}33`;
      } else if (!this.boss.isSecretFinal) {
        bossCardEl.style.borderColor = '';
        bossCardEl.style.boxShadow = '';
      }
    }

    const bossNameEl = document.getElementById('bossName');
    if (bossNameEl) bossNameEl.textContent = `Stage ${this.boss.stage}: ${this.boss.name}`;

    const bossSubNameEl = document.getElementById('bossSubName');
    if (bossSubNameEl) {
      const auraSuffix = (v && !this.boss.isSecretFinal) ? ` · ⚡ ${v.auraName}` : '';
      bossSubNameEl.textContent = `${this.boss.subName}${auraSuffix} · 권장: ${this.boss.trainingMonths}개월(${this.boss.trainingDays}일) 수련`;
    }

    const bossStageBadge = document.getElementById('bossStageBadge');
    if (bossStageBadge) {
      if (this.boss.isSecretFinal) {
        bossStageBadge.textContent = `👑 [100단계 · 100레벨 찐막 최종보스]`;
        bossStageBadge.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
      } else {
        bossStageBadge.textContent = v ? `STAGE ${this.boss.stage} [${v.rankTag}]` : `STAGE ${this.boss.stage} [1달 수련 필수]`;
        bossStageBadge.style.background = v ? `linear-gradient(135deg, ${v.color}, ${v.subColor})` : 'var(--crimson-rage)';
      }
    }

    const pName = document.getElementById('battlePlayerName');
    if (pName) pName.textContent = state.data.player.name;

    const pTitle = document.getElementById('battlePlayerTitle');
    if (pTitle) pTitle.textContent = state.data.player.activeTitle;

    const btn = document.getElementById('btnOneAttack');
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('attacking');
      if (this.boss.isSecretFinal) {
        btn.classList.add('btn-attack-omega');
        btn.innerHTML = `
          <span class="btn-main-label">👑 [턴 1] 거신의 심장을 향한 필사의 일격!</span>
          <span class="btn-sub-label">⚔️ 나 한 대 때리고, 절대 거신 한 대 맞기 [Space / Enter / 클릭]</span>
        `;
      } else {
        btn.classList.remove('btn-attack-omega');
        btn.innerHTML = `
          <span class="btn-main-label">💥 [턴 1] 결전의 일격 가하기</span>
          <span class="btn-sub-label">⚔️ 나 한 대 때리고 보스 한 대 맞기 [Space / Enter / 클릭]</span>
        `;
      }
    }

    this.updateBattleUI();
    this.updateLogUI();
  }

  updateBattleUI() {
    // Boss HP
    const bossHpPct = Math.max(0, Math.min(100, (this.bossHp / this.bossMaxHp) * 100));
    const bossHpBar = document.getElementById('bossHpFill');
    const bossHpText = document.getElementById('bossHpText');
    if (bossHpBar) bossHpBar.style.width = `${bossHpPct}%`;
    if (bossHpText) bossHpText.textContent = `${this.bossHp.toLocaleString()} / ${this.bossMaxHp.toLocaleString()} (${bossHpPct.toFixed(1)}%)`;

    // Player HP
    const pHpPct = Math.max(0, Math.min(100, (this.playerHp / this.playerMaxHp) * 100));
    const pHpBar = document.getElementById('playerHpFill');
    const pHpText = document.getElementById('playerHpText');
    if (pHpBar) pHpBar.style.width = `${pHpPct}%`;
    if (pHpText) pHpText.textContent = `${Math.round(this.playerHp).toLocaleString()} / ${this.playerMaxHp.toLocaleString()} (${pHpPct.toFixed(1)}%)`;

    // Round Indicator Badge
    const roundBadge = document.getElementById('turnRoundBadge');
    if (roundBadge) roundBadge.textContent = `⚔️ ROUND ${this.turn}`;

    // Stat & Damage Comparison Analysis
    const pStats = state.getEffectiveStats();
    const estPlayerDmg = Math.max(1, Math.round(pStats.atk - (this.boss.def * 0.75)));
    const estBossDmg = Math.max(15, Math.round(this.boss.atk - (pStats.def * 0.85)));
    const survivalTurns = Math.max(1, Math.ceil(this.playerHp / estBossDmg));
    const turnsToKillBoss = Math.ceil(this.bossHp / estPlayerDmg);

    const estPlayerDmgEl = document.getElementById('estPlayerDmg');
    const estBossDmgEl = document.getElementById('estBossDmg');
    const estSurvivalEl = document.getElementById('estSurvival');

    if (estPlayerDmgEl) estPlayerDmgEl.textContent = `내 공격: ~${estPlayerDmg.toLocaleString()} dmg`;
    if (estBossDmgEl) estBossDmgEl.textContent = `보스 반격: ~${estBossDmg.toLocaleString()} dmg`;
    if (estSurvivalEl) {
      if (survivalTurns < turnsToKillBoss) {
        estSurvivalEl.textContent = `⚠️ 버틸 수 있는 턴수: ${survivalTurns}턴 (극도로 위험! 1달 수련 필요)`;
        estSurvivalEl.style.color = '#ef4444';
      } else {
        estSurvivalEl.textContent = `⚔️ 버틸 수 있는 턴수: ${survivalTurns}턴 (아슬아슬한 승부 가능!)`;
        estSurvivalEl.style.color = '#f59e0b';
      }
    }
  }

  addLog(msg, type = "normal") {
    this.battleLog.unshift({ msg, type, time: new Date().toLocaleTimeString() });
    if (this.battleLog.length > 20) this.battleLog.pop();
    this.updateLogUI();
  }

  updateLogUI() {
    const logContainer = document.getElementById('battleLogContainer');
    if (!logContainer) return;

    logContainer.innerHTML = '';
    this.battleLog.forEach(item => {
      const p = document.createElement('div');
      p.className = `log-line log-${item.type}`;
      p.innerHTML = `<span class="log-time">[${item.time}]</span> ${item.msg}`;
      logContainer.appendChild(p);
    });
  }

  handleVictory() {
    this.inBattle = false;
    document.body.classList.remove('in-battle');
    sound.stopBGM();
    sound.playVictory();

    const hpRatio = this.playerHp / this.playerMaxHp;
    let grade = "A";
    if (hpRatio >= 0.7) grade = "SSS";
    else if (hpRatio >= 0.4) grade = "SS";
    else if (hpRatio >= 0.2) grade = "S";
    else grade = "B"; // Clutched with barely any HP left!

    this.addLog(`🏆 [혈투 끝 승리!] ${this.boss.name} 토벌에 성공했습니다! (달성 등급: ${grade})`, "system");
    const result = state.recordBossClear(this.boss.id);

    setTimeout(() => {
      ui.showVictoryModal(this.boss, grade, result);
    }, 1000);
  }

  handleDefeat() {
    this.inBattle = false;
    document.body.classList.remove('in-battle');
    sound.stopBGM();
    sound.playDefeat();

    this.addLog(`💀 [패배] 보스의 압도적인 공격력에 무릎을 꿇었습니다.`, "system");
    this.addLog(`💡 [성장 팁] 일일 퀘스트를 매일 수행해 체력(END)과 근력(STR)을 30일간 극한으로 단련하세요!`, "boss-quote");

    setTimeout(() => {
      ui.showDefeatModal(this.boss);
    }, 800);
  }

  retreat() {
    if (!confirm("결전에서 퇴각하시겠습니까?")) return;
    this.inBattle = false;
    document.body.classList.remove('in-battle');
    sound.stopBGM();
    sound.startBGM('ambient');
    ui.switchTab('bossTab');
  }
}

// Global battle engine instance
const battle = new BattleEngine();
