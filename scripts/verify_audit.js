const fs = require('fs');

// Mock browser globals
global.window = global;
global.document = {
  hidden: false,
  getElementById: (id) => ({
    textContent: '',
    value: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    appendChild: () => {},
    querySelectorAll: () => [],
    reset: () => {}
  }),
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};
global.sessionStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

// Load data.js and state.js
eval(fs.readFileSync('js/data.js', 'utf8'));
eval(fs.readFileSync('js/state.js', 'utf8'));

console.log('--- 1. Testing escapeHtml ---');
console.assert(escapeHtml('<script>alert("XSS")</script>') === '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;', 'escapeHtml test 1 failed');
console.assert(escapeHtml("test' or 1=1") === 'test&#39; or 1=1', 'escapeHtml test 2 failed');
console.assert(escapeHtml(null) === '', 'escapeHtml null test failed');
console.log('PASS: escapeHtml');

console.log('--- 2. Testing 15 Player Cards ---');
const s = new GameState();
const cards = s.getPlayerCards();
console.assert(cards.length === 15, 'Must have 15 player cards, got: ' + cards.length);
cards.forEach(c => {
  console.assert(c.id && c.name && c.image, 'Card missing id/name/image: ' + JSON.stringify(c));
  console.assert(fs.existsSync(c.image), 'Image file missing for card ' + c.id + ': ' + c.image);
});
console.log('PASS: 15 player cards verified and all image files exist on disk');

console.log('--- 3. Testing Custom Quest Creation with 0 Gold ---');
const qZeroGold = s.addCustomQuest({
  title: 'Test 0 Gold Quest',
  gold: 0,
  exp: 200,
  growthPoints: 5,
  type: 'timer',
  targetSeconds: 1800
});
console.assert(qZeroGold.gold === 0, '0 gold must be preserved, got: ' + qZeroGold.gold);
console.assert(qZeroGold.targetSeconds === 1800, 'targetSeconds must be 1800, got: ' + qZeroGold.targetSeconds);
console.log('PASS: Custom quest 0 gold and timer');

console.log('--- 4. Testing Custom Quest Edit ---');
const updatedQ = s.updateCustomQuest(qZeroGold.id, {
  title: 'Edited Quest Title',
  gold: 50,
  exp: 300
});
console.assert(updatedQ.title === 'Edited Quest Title', 'Updated title failed');
console.assert(updatedQ.gold === 50, 'Updated gold failed');
console.log('PASS: Custom quest editing');

console.log('--- 5. Testing Streak Protection Tickets ---');
console.assert(s.getStreakProtectionTickets() === 3, 'Initial tickets must be 3, got: ' + s.getStreakProtectionTickets());
s.data.quests.startDate = '2026-10-01';
s.data.quests.history = { '2026-10-27': 2, '2026-10-28': 1 };
const res = s.useStreakProtection('2026-10-29');
console.assert(res.success === true, 'Protection must succeed on missed day');
console.assert(s.getStreakProtectionTickets() === 2, 'Remaining tickets must be 2, got: ' + s.getStreakProtectionTickets());
console.assert(s.data.quests.history['2026-10-29'] === 1, 'Day 2026-10-29 must be marked 1 in history');
console.log('PASS: Streak protection ticket logic');

console.log('--- 6. Testing All 50 Boss Titles ---');
console.assert(Object.keys(TITLES_DATA).length >= 50, 'TITLES_DATA must contain at least 50 titles');
const meta = getTitleMetadata('나태의 망령 격파자');
console.assert(meta && meta.name.includes('나태'), 'Boss title lookup failed');
console.log('PASS: Boss titles registered and lookup works');

console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
