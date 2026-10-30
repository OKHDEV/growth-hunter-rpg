// Global XSS Sanitizer for safe template literal innerHTML rendering
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
if (typeof window !== 'undefined') window.escapeHtml = escapeHtml;
if (typeof global !== 'undefined') global.escapeHtml = escapeHtml;

// Game Data Definitions: Awakened Hunter Realistic Growth RPG & 50 Epic Bosses

// Quests tailored for Realistic Growth (Study, Height Growth, Dopamine Detox, Fitness)
// Realistic Growth Points Calibration:
// Target: Current cm -> Target cm (+5.00 cm = 50.0 mm).
// Formula: 1,000 Growth Points = 0.1 cm (1.0 mm).
// Completing daily quests gives 5 ~ 25 Growth Points (+0.005 ~ +0.025 cm = realistic micro-stimulus).
const INITIAL_QUESTS = [
  // --- 1. 신체 & 키 성장 (성장판 자극) ---
  {
    id: "height_rope_1000",
    title: "[키성장] 성장판 자극: 줄넘기 1,000회",
    description: "성장판을 깨우는 필수 충격 루틴. 발목과 무릎을 탄력있게 튕겨주세요.",
    category: "height",
    categoryName: "신체 & 키 성장",
    tier: "C",
    exp: 280,
    gold: 80,
    growthPoints: 8, // +0.008 cm
    type: "counter",
    targetCount: 1000,
    unit: "회",
    icon: "zap"
  },
  {
    id: "height_rope_2000",
    title: "[키성장] 한계 도약: 줄넘기 2,000회",
    description: "성장판에 강력한 수직 자극을 가하여 목표 신장을 향한 뼈 성장을 촉진합니다.",
    category: "height",
    categoryName: "신체 & 키 성장",
    tier: "B",
    exp: 550,
    gold: 160,
    growthPoints: 16, // +0.016 cm
    type: "counter",
    targetCount: 2000,
    unit: "회",
    icon: "flame"
  },
  {
    id: "height_rope_3500",
    title: "[극악 S] 줄넘기 3,500회 극한 각성",
    description: "보스 토벌을 위한 하체 폭발 훈련. 뼈의 골밀도와 키 성장 잠재력을 강제 개방합니다.",
    category: "height",
    categoryName: "신체 & 키 성장",
    tier: "S",
    exp: 1300,
    gold: 400,
    growthPoints: 30, // +0.030 cm
    type: "counter",
    targetCount: 3500,
    unit: "회",
    icon: "crown"
  },
  {
    id: "height_spine_stretch",
    title: "책상 굽은등/거북목 교정: 코브라 전신 스트레칭 25분",
    description: "하루종일 독서실과 교실에서 짓눌린 척추뼈 사이 추간판을 펴서 숨은 키를 복원합니다.",
    category: "height",
    categoryName: "신체 & 키 성장",
    tier: "C",
    exp: 320,
    gold: 100,
    growthPoints: 12, // +0.012 cm
    type: "timer",
    targetSeconds: 1500,
    unit: "초",
    icon: "activity"
  },
  {
    id: "height_golden_sleep",
    title: "[핵심] 밤 11시 전 취침 & 7.5시간 딥슬립 (성장호르몬 골든타임)",
    description: "수험생도 자야 큰다! 밤 11시~새벽 2시 사이 폭발하는 성장호르몬 피크를 사수하세요.",
    category: "height",
    categoryName: "신체 & 키 성장",
    tier: "A",
    exp: 750,
    gold: 250,
    growthPoints: 25, // +0.025 cm
    type: "check",
    icon: "moon"
  },
  {
    id: "height_nutrition",
    title: "골격 합성 영양: 칼슘 우유 500ml + 계란 2개 (단백질 30g)",
    description: "목표 신장을 위한 뼈와 근육의 필수 건축자재 공급.",
    category: "height",
    categoryName: "신체 & 키 성장",
    tier: "D",
    exp: 150,
    gold: 50,
    growthPoints: 5, // +0.005 cm
    type: "check",
    icon: "coffee"
  },
  {
    id: "height_basketball_jumps",
    title: "서전트 농구 리바운드 점프 120회",
    description: "벽 높은 곳을 향해 전력 점프. 성장판 자극과 순발력을 극대화합니다.",
    category: "height",
    categoryName: "신체 & 키 성장",
    tier: "C",
    exp: 340,
    gold: 110,
    growthPoints: 10,
    type: "counter",
    targetCount: 120,
    unit: "회",
    icon: "chevrons-up"
  },

  // --- 2. 도파민 디톡스 (뇌세포 및 수험 집중력 부활) ---
  {
    id: "detox_shorts_24h",
    title: "[디톡스 S] 인스타 릴스 / 유튜브 쇼츠 / 틱톡 24시간 완전 금지",
    description: "전두엽을 태우는 숏폼 알고리즘을 24시간 동안 완전히 꺼서 뇌의 도파민 수용체를 복구합니다.",
    category: "detox",
    categoryName: "도파민 디톡스",
    tier: "S",
    exp: 1000,
    gold: 350,
    growthPoints: 15,
    type: "check",
    icon: "shield-alert"
  },
  {
    id: "detox_night_phone",
    title: "취침 1시간 전 스마트폰 완전 격리 (블루라이트 차단)",
    description: "멜라토닌 분비를 촉진해 딥슬립과 성장호르몬 분비를 유도합니다.",
    category: "detox",
    categoryName: "도파민 디톡스",
    tier: "B",
    exp: 420,
    gold: 140,
    growthPoints: 10,
    type: "check",
    icon: "eye-off"
  },
  {
    id: "detox_morning_clean",
    title: "기상 직후 1시간 폰 안 만지고 물 한잔 & 스트레칭",
    description: "무의식적인 알람 확인 중독을 끊고 내 의지로 하루를 통제합니다.",
    category: "detox",
    categoryName: "도파민 디톡스",
    tier: "C",
    exp: 300,
    gold: 90,
    growthPoints: 8,
    type: "check",
    icon: "sunrise"
  },
  {
    id: "detox_grayscale",
    title: "스마트폰 흑백 화면 모드로 하루 보내기",
    description: "자극적인 색감을 제거해 스마트폰 스크롤 충동을 원천 차단합니다.",
    category: "detox",
    categoryName: "도파민 디톡스",
    tier: "B",
    exp: 450,
    gold: 150,
    growthPoints: 10,
    type: "check",
    icon: "smartphone"
  },

  // --- 3. 지능 수험 & 학업 (순공 몰입) ---
  {
    id: "study_pure_2h",
    title: "집중 몰입: 스마트폰 없이 순공 2시간 달성",
    description: "딴짓 없이 오직 개념서와 문제 풀이에 집중한 120분.",
    category: "study",
    categoryName: "지능 & 수험",
    tier: "C",
    exp: 350,
    gold: 120,
    growthPoints: 5,
    type: "timer",
    targetSeconds: 7200,
    unit: "초",
    icon: "book"
  },
  {
    id: "study_pure_5h",
    title: "[하드코어] 주말 순공 5시간 극한 돌파",
    description: "상위 1% 각성자를 만드는 5시간 마라톤 공부. 지능(INT) 스탯 폭발!",
    category: "study",
    categoryName: "지능 & 수험",
    tier: "A",
    exp: 950,
    gold: 350,
    growthPoints: 15,
    type: "timer",
    targetSeconds: 18000,
    unit: "초",
    icon: "award"
  },
  {
    id: "study_wrong_notes",
    title: "취약점 박멸: 오답노트 & 킬러문항 3개 완벽 복습",
    description: "틀린 이유를 철저히 분석하고 메타인지를 각성시킵니다.",
    category: "study",
    categoryName: "지능 & 수험",
    tier: "B",
    exp: 480,
    gold: 160,
    growthPoints: 8,
    type: "check",
    icon: "check-circle"
  },

  // --- 4. 체력 & 헬스 (피지컬 단련) ---
  {
    id: "fitness_pushups_100",
    title: "어깨 프레임 넓히기: 정자세 푸시업 100개",
    description: "굽은 가슴을 펴고 어깨너비를 확장하는 기본 상체 운동.",
    category: "fitness",
    categoryName: "체력 & 근력",
    tier: "B",
    exp: 450,
    gold: 150,
    growthPoints: 10,
    type: "counter",
    targetCount: 100,
    unit: "회",
    icon: "target"
  },
  {
    id: "fitness_squats_150",
    title: "하체 지지대: 풀 스쿼트 150개",
    description: "대퇴부 자극으로 테스토스테론 및 성장호르몬 분비 촉진.",
    category: "fitness",
    categoryName: "체력 & 근력",
    tier: "B",
    exp: 480,
    gold: 160,
    growthPoints: 12,
    type: "counter",
    targetCount: 150,
    unit: "회",
    icon: "crosshair"
  },
  {
    id: "fitness_running_3k",
    title: "심폐 각성: 야외 러닝 3km 완주",
    description: "뇌에 신선한 산소를 공급하고 수험 스트레스를 태우는 심장 강화 달리기.",
    category: "fitness",
    categoryName: "체력 & 근력",
    tier: "A",
    exp: 750,
    gold: 250,
    growthPoints: 15,
    type: "check",
    icon: "navigation"
  },
  {
    id: "fitness_cold_shower",
    title: "투지 장전: 3분 찬물 샤워",
    description: "미루는 습관을 즉시 얼려버리는 의지력 각성의 의식.",
    category: "fitness",
    categoryName: "체력 & 근력",
    tier: "D",
    exp: 200,
    gold: 70,
    growthPoints: 5,
    type: "timer",
    targetSeconds: 180,
    unit: "초",
    icon: "droplet"
  }
];

// Difficulty Tier Visuals
const TIER_CONFIG = {
  D: { name: "D등급", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", border: "#475569" },
  C: { name: "C등급", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", border: "#0284c7" },
  B: { name: "B등급", color: "#34d399", bg: "rgba(52, 211, 153, 0.15)", border: "#059669" },
  A: { name: "A등급", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)", border: "#d97706" },
  S: { name: "S등급", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)", border: "#e11d48" },
  SS: { name: "SS신화", color: "#c084fc", bg: "rgba(192, 132, 252, 0.2)", border: "#9333ea" },
  SSS: { name: "SSS초월", color: "#facc15", bg: "rgba(250, 204, 21, 0.25)", border: "#ca8a04" }
};

// 50 High-Difficulty Bosses (Organized in 5 Zones, requiring solid daily consistency)
// Every single stage from 1 to 50 has its own 100% unique, dedicated high-res dark-fantasy masterpiece illustration!
const BOSS_NAMES_DATA = [
  // Zone 1: 나태와 숏폼의 회랑 (Stage 1~10)
  { stage: 1, name: "나태의 망령, 슬로스", sub: "Sloth Spectre", quote: "“침대 속이 따뜻하지 않나...? 영원히 일어나지 마라...”", img: "assets/bosses/boss1.jpg" },
  { stage: 2, name: "숏폼의 환영귀, 스크롤러", sub: "Phantom Scroller", quote: "“딱 5분만 본다더니 벌써 새벽 2시로구나, 크크크...”", img: "assets/bosses/boss_stage_2.jpg" },
  { stage: 3, name: "야식의 폭식마, 글러튼", sub: "Gluttonous Fiend", quote: "“밤 11시의 라면과 치킨... 성장은 내일로 미뤄라!”", img: "assets/bosses/boss_stage_3.jpg" },
  { stage: 4, name: "작심삼일의 사신, 기브업", sub: "Reaper of Surrender", quote: "“어차피 사흘이면 때려치울 거 뭐 하러 땀 흘리나?”", img: "assets/bosses/boss_stage_4.jpg" },
  { stage: 5, name: "알고리즘의 주술사, 피드", sub: "Algorithm Sorcerer", quote: "“네 뇌의 도파민을 남김없이 흡수해주마!”", img: "assets/bosses/boss_stage_5.jpg" },
  { stage: 6, name: "스마트폰 지박령, 블루라이트", sub: "Bluelight Demon", quote: "“망막을 태우고 멜라토닌을 소멸시키리라!”", img: "assets/bosses/boss_stage_6.jpg" },
  { stage: 7, name: "침대 늪의 흡혈귀, 매트리스", sub: "Mattress Vampire", quote: "“천근만근 무거운 사지... 절대 침대 밖을 못 벗어난다!”", img: "assets/bosses/boss_stage_7.jpg" },
  { stage: 8, name: "가짜 성취의 요마, 도파민스니크", sub: "Dopamine Sneak", quote: "“게임 한 판 더 해라. 현실 따위 잊으면 그만이야.”", img: "assets/bosses/boss_stage_8.jpg" },
  { stage: 9, name: "미루기의 군주, 프로크라스틴", sub: "Lord of Procrastination", quote: "“오늘 할 공부는 내일의 너에게 떠넘겨라!”", img: "assets/bosses/boss_stage_9.jpg" },
  { stage: 10, name: "도파민의 대마신, 도파미너스", sub: "High Dopamine Demon", quote: "“쾌락의 노예가 된 영혼이여, 내 영원한 데이터가 되어라!”", img: "assets/bosses/boss2.jpg" },

  // Zone 2: 왜소와 중력의 협곡 (Stage 11~20)
  { stage: 11, name: "구부정한 망령, 거북목", sub: "Turtle Neck Wraith", quote: "“숙인 고개, 굳은 목덜미... 넌 평생 땅만 쳐다볼 팔자다.”", img: "assets/bosses/boss_stage_11.jpg" },
  { stage: 12, name: "척추 압박의 석괴, 척추만곡", sub: "Spine Compactor", quote: "“등뼈를 납작하게 으스러뜨려 키를 2cm 깎아내주마!”", img: "assets/bosses/boss_stage_12.jpg" },
  { stage: 13, name: "성장판 봉인귀, 에피피시스", sub: "Growth Plate Sealer", quote: "“성장판을 단단히 닫아버려 173cm에 평생 박제하겠다!”", img: "assets/bosses/boss_stage_13.jpg" },
  { stage: 14, name: "칼슘 결핍의 골렘, 본크러셔", sub: "Bone Crusher", quote: "“골밀도가 푸석한 뼈마디를 가루로 만들어주마!”", img: "assets/bosses/boss_stage_14.jpg" },
  { stage: 15, name: "수면 부족의 악령, 인섬니아", sub: "Insomnia Fiend", quote: "“성장호르몬 골든타임? 새벽 3시까지 뒤척여라!”", img: "assets/bosses/boss_stage_15.jpg" },
  { stage: 16, name: "라운드숄더의 족쇄, 말린어깨", sub: "Rounded Shackle", quote: "“가슴을 웅크려 왜소한 프레임 속에 영원히 갇혀라!”", img: "assets/bosses/boss_stage_16.jpg" },
  { stage: 17, name: "점프 저지마, 헤비앵클", sub: "Heavy Ankle Beast", quote: "“줄넘기를 뛰어봤자 발목에 쇠사슬을 감아주마!”", img: "assets/bosses/boss_stage_17.jpg" },
  { stage: 18, name: "운동 결핍의 점액괴, 슬라임바디", sub: "Sluggish Slime", quote: "“근육이 흐물흐물 녹아내리는 무기력의 늪!”", img: "assets/bosses/boss_stage_18.jpg" },
  { stage: 19, name: "골격 억압의 거인, 척추파괴수", sub: "Spine Shatterer", quote: "“똑바로 일어서지 마라! 중력의 무게 앞에 무릎 꿇어라!”", img: "assets/bosses/boss_stage_19.jpg" },
  { stage: 20, name: "중력과 왜소의 거신, 그라비타스", sub: "Titan of Gravity", quote: "“네 173cm의 작은 뼈대를 대지 밑으로 영원히 매장하리라!”", img: "assets/bosses/boss3.jpg" },

  // Zone 3: 고교 수험과 번아웃의 마궁 (Stage 21~30)
  { stage: 21, name: "내신 참사의 망령, 미드텀", sub: "Midterm Despair", quote: "“열심히 해봤자 4등급... 네 한계는 여기까지다!”", img: "assets/bosses/boss_stage_21.jpg" },
  { stage: 22, name: "모의고사 킬러마, 모크", sub: "Mock Exam Executioner", quote: "“킬러 문항 앞에서 멘탈이 바스러지는 꼴을 봐라!”", img: "assets/bosses/boss_stage_22.jpg" },
  { stage: 23, name: "뇌 피로의 독무, 브레인포그", sub: "Brain Fog Fogger", quote: "“머릿속이 하얘질 것이다... 아무것도 기억나지 않는다!”", img: "assets/bosses/boss_stage_23.jpg" },
  { stage: 24, name: "타인과의 비교귀, 콤플렉스", sub: "Inferiority Complex", quote: "“남들은 키 180에 전교권인데 넌 뭐 하고 있냐?”", img: "assets/bosses/boss_stage_24.jpg" },
  { stage: 25, name: "공부 회피의 유혹귀, 딴짓마", sub: "Distraction Siren", quote: "“공부는 내일부터 하고 유튜브 알고리즘이나 타자꾸나.”", img: "assets/bosses/boss_stage_25.jpg" },
  { stage: 26, name: "수면제 같은 교과서, 슬리퍼", sub: "Soporific Tome", quote: "“책만 펴면 쏟아지는 졸음... 눈을 감아라...”", img: "assets/bosses/boss_stage_26.jpg" },
  { stage: 27, name: "시간 낭비의 도둑, 타임시프", sub: "Time Stealer", quote: "“멍때리는 사이 청춘의 하루가 또 증발했다!”", img: "assets/bosses/boss_stage_27.jpg" },
  { stage: 28, name: "의지력 박탈의 악마, 에디션", sub: "Willpower Eater", quote: "“오늘 계획표 지킨 거 하나도 없지? 포기해라!”", img: "assets/bosses/boss_stage_28.jpg" },
  { stage: 29, name: "자기합리화의 요마, 핑계귀", sub: "Excuse Fiend", quote: "“피곤하니까... 유전이니까... 온갖 핑계를 대거라!”", img: "assets/bosses/boss_stage_29.jpg" },
  { stage: 30, name: "무기력의 심연룡, 아비스", sub: "Dragon of Despair", quote: "“해봤자 변하지 않는다... 심연의 영원한 패배주의에 굴복하라!”", img: "assets/bosses/boss4.jpg" },

  // Zone 4: 유전과 편견의 얼어붙은 빙벽 (Stage 31~40)
  { stage: 31, name: "유전 탓의 원령, 헤레디티", sub: "Heredity Wraith", quote: "“부모님 키가 작으면 끝이야! 노력으로 키가 크겠냐?”", img: "assets/bosses/boss_stage_31.jpg" },
  { stage: 32, name: "늦깎이 절망마, 레이트블루머", sub: "Late Bloomer Denier", quote: "“너는 이미 뼈 다 닫혔어! 헛된 희망을 버려라!”", img: "assets/bosses/boss_stage_32.jpg" },
  { stage: 33, name: "불규칙 식습관의 괴수, 말뉴트리션", sub: "Malnutrition Behemoth", quote: "“끼니를 거르고 탄수화물만 채워 뼈를 굶주리게 하마!”", img: "assets/bosses/boss_stage_33.jpg" },
  { stage: 34, name: "골격 동결의 마녀, 본프리즈", sub: "Bone Freeze Witch", quote: "“네 굳어버린 척추를 얼음처럼 딱딱하게 굳혀버리겠다!”", img: "assets/bosses/boss_stage_34.jpg" },
  { stage: 35, name: "수면 장애의 몽마, 나이트메어", sub: "Nightmare Incubus", quote: "“밤새 악몽에 시달리며 피로를 짊어지고 등교해라!”", img: "assets/bosses/boss_stage_35.jpg" },
  { stage: 36, name: "의지력 영하의 빙룡, 프로스트팽", sub: "Frostfang Wyrm", quote: "“차가운 현실의 벽 앞에서 네 오만한 열정을 얼려버리리라!”", img: "assets/bosses/boss_stage_36.jpg" },
  { stage: 37, name: "자세 왜곡의 골렘, 스콜리오", sub: "Scoliosis Golem", quote: "“골반이 틀어지고 다리 길이가 짝짝이가 될 것이다!”", img: "assets/bosses/boss_stage_37.jpg" },
  { stage: 38, name: "성장 호르몬 차단마, 소마토블록", sub: "Somato Blocker", quote: "“뇌하수체에서 뿜어져 나오는 호르몬을 완전히 가로막겠다!”", img: "assets/bosses/boss_stage_38.jpg" },
  { stage: 39, name: "한계 조롱의 악귀, 모커리", sub: "Mockery Demon", quote: "“네가 목표를 이룬다고? 세상이 비웃는 소리가 들리는구나!”", img: "assets/bosses/boss_stage_39.jpg" },
  { stage: 40, name: "절망의 골격 군주, 스켈레톤 킹", sub: "Skeleton Sovereign", quote: "“뼈마디의 절규를 들어라! 넌 왜소한 껍데기를 절대 벗지 못한다!”", img: "assets/bosses/boss_stage_40.jpg" },

  // Zone 5: 한계 초월과 운명의 신전 (Stage 41~50)
  { stage: 41, name: "한계 돌파의 수문장, 게이트키퍼", sub: "Apex Gatekeeper", quote: "“여기서부터는 진짜 각성한 자만이 발을 들일 수 있다!”", img: "assets/bosses/boss_stage_41.jpg" },
  { stage: 42, name: "황금 비율의 심판관, 프로포션", sub: "Judge of Proportion", quote: "“과거의 왜소함을 버리고 황금비율의 전신을 증명하라!”", img: "assets/bosses/boss_stage_42.jpg" },
  { stage: 43, name: "성장호르몬의 폭풍령, 소마토스톰", sub: "Somato Storm", quote: "“매일의 줄넘기와 수면으로 다져진 골격을 시험하겠다!”", img: "assets/bosses/boss_stage_43.jpg" },
  { stage: 44, name: "백절불굴의 투신, 인빅터스", sub: "Invictus Fighter", quote: "“수천 번의 좌절을 딛고 일어선 검격만을 인정하리라!”", img: "assets/bosses/boss_stage_44.jpg" },
  { stage: 45, name: "척추 기립의 대천사, 버티컬", sub: "Archangel Vertical", quote: "“구부러졌던 모든 뼈를 곧추세워 하늘을 찌르는 자태를 보이라!”", img: "assets/bosses/boss_stage_45.jpg" },
  { stage: 46, name: "도약의 절대 지배자, 에어본", sub: "Airborne Sovereign", quote: "“줄넘기 수만 회의 탄력으로 허공을 밟고 날아올라라!”", img: "assets/bosses/boss_stage_46.jpg" },
  { stage: 47, name: "신역의 관문 수호신, 센티넬", sub: "Gate Sentinel", quote: "“첫 번째 벽을 넘어서기 위한 피와 땀을 증명하라!”", img: "assets/bosses/boss_stage_47.jpg" },
  { stage: 48, name: "환영의 군주, 팬텀미라지", sub: "Mirage Overlord", quote: "“마지막 한 걸음을 앞두고 포기했던 수많은 패자들의 무덤이다!”", img: "assets/bosses/boss_stage_48.jpg" },
  { stage: 49, name: "황금 신장의 수호신, 에이펙스", sub: "Apex Guardian", quote: "“황금 신장의 완성까지 단 한 걸음... 신의 권능을 견뎌보아라!”", img: "assets/bosses/boss_stage_49.jpg" },
  { stage: 50, name: "한계의 절대군주, 크로노스", sub: "Supreme Overlord Chronos", quote: "“모든 핑계를 부수고 한계 초월의 기적을 완성하였구나, 진정한 각성자여!”", img: "assets/bosses/boss5.jpg" }
];

// 50 Distinct Elemental & Awakening Visual Themes for Stages 1~50
// Preserves the awesome original boss character art while giving every single stage (1~50)
// a unique hue/saturation/contrast evolution, framing composition, and elemental aura!
const BOSS_VISUAL_EVOLUTIONS = [
  // Zone 1 (Stages 1~10)
  { hue: 0, sat: 1.15, con: 1.08, bri: 1.0, flip: 1, zoom: 1.0, pos: "50% 35%", color: "#a855f7", subColor: "#6366f1", auraName: "심연의 나태 오라", rankTag: "Ⅰ. 태초의 나태" },
  { hue: 0, sat: 1.25, con: 1.12, bri: 1.02, flip: 1, zoom: 1.04, pos: "50% 30%", color: "#10b981", subColor: "#06b6d4", auraName: "사이버 도파민 전류", rankTag: "Ⅱ. 숏폼 노이즈" },
  { hue: 35, sat: 1.35, con: 1.15, bri: 1.0, flip: 1, zoom: 1.06, pos: "50% 25%", color: "#f97316", subColor: "#eab308", auraName: "폭식의 용암 화염", rankTag: "Ⅲ. 폭식의 화염" },
  { hue: 290, sat: 1.4, con: 1.15, bri: 0.98, flip: 1, zoom: 1.05, pos: "55% 35%", color: "#ec4899", subColor: "#f43f5e", auraName: "핏빛 사신의 마기", rankTag: "Ⅳ. 단절의 브레스" },
  { hue: 140, sat: 1.3, con: 1.14, bri: 1.02, flip: 1, zoom: 1.08, pos: "50% 28%", color: "#22d3ee", subColor: "#3b82f6", auraName: "알고리즘 룬 결계", rankTag: "Ⅴ. 세뇌의 마법진" },
  { hue: 75, sat: 1.45, con: 1.18, bri: 1.04, flip: -1, zoom: 1.12, pos: "45% 25%", color: "#38bdf8", subColor: "#818cf8", auraName: "블루라이트 섬광", rankTag: "Ⅵ. 청색광 과부하" },
  { hue: 55, sat: 1.5, con: 1.2, bri: 0.96, flip: -1, zoom: 1.14, pos: "50% 28%", color: "#ef4444", subColor: "#991b1b", auraName: "핏빛 수면의 늪", rankTag: "Ⅶ. 흡혈의 속박" },
  { hue: 195, sat: 1.45, con: 1.18, bri: 1.02, flip: -1, zoom: 1.12, pos: "42% 30%", color: "#34d399", subColor: "#059669", auraName: "맹독성 환각 브레스", rankTag: "Ⅷ. 가짜 성취독" },
  { hue: 48, sat: 1.38, con: 1.2, bri: 1.05, flip: -1, zoom: 1.15, pos: "50% 22%", color: "#facc15", subColor: "#d97706", auraName: "정지된 황금 시계탑", rankTag: "Ⅸ. 시간 왜곡장" },
  { hue: 265, sat: 1.6, con: 1.25, bri: 1.05, flip: 1, zoom: 1.18, pos: "50% 24%", color: "#f43f5e", subColor: "#a855f7", auraName: "대마신 도파민 폭주", rankTag: "🔟 Zone 1 지배자" },

  // Zone 2 (Stages 11~20)
  { hue: 145, sat: 1.35, con: 1.18, bri: 0.98, flip: 1, zoom: 1.12, pos: "48% 30%", color: "#14b8a6", subColor: "#0d9488", auraName: "석화된 경추의 저주", rankTag: "Ⅺ. 거북목의 원혼" },
  { hue: 180, sat: 1.4, con: 1.2, bri: 1.0, flip: 1, zoom: 1.1, pos: "52% 28%", color: "#06b6d4", subColor: "#2563eb", auraName: "심해 고압 중력장", rankTag: "Ⅻ. 청색 암석 거신" },
  { hue: 310, sat: 1.45, con: 1.2, bri: 1.02, flip: 1, zoom: 1.14, pos: "50% 25%", color: "#e879f9", subColor: "#9333ea", auraName: "자수정 성장판 봉인", rankTag: "XIII. 영구 봉인술" },
  { hue: 85, sat: 1.5, con: 1.22, bri: 1.0, flip: 1, zoom: 1.15, pos: "60% 35%", color: "#f59e0b", subColor: "#dc2626", auraName: "골밀도 분쇄 화염", rankTag: "XIV. 파멸의 화염룡" },
  { hue: 215, sat: 1.55, con: 1.22, bri: 0.95, flip: -1, zoom: 1.18, pos: "50% 25%", color: "#60a5fa", subColor: "#1d4ed8", auraName: "새벽 3시의 빙결", rankTag: "XV. 불면의 한기" },
  { hue: 135, sat: 1.5, con: 1.24, bri: 1.02, flip: 1, zoom: 1.16, pos: "54% 26%", color: "#c084fc", subColor: "#ec4899", auraName: "자력 구속의 족쇄", rankTag: "XVI. 프레임 압축" },
  { hue: 270, sat: 1.55, con: 1.25, bri: 0.98, flip: -1, zoom: 1.16, pos: "46% 30%", color: "#a855f7", subColor: "#4c1d95", auraName: "암흑 중력의 쇠사슬", rankTag: "XVII. 천근만근 족쇄" },
  { hue: 140, sat: 1.65, con: 1.2, bri: 1.04, flip: 1, zoom: 1.18, pos: "45% 40%", color: "#84cc16", subColor: "#15803d", auraName: "산성 슬라임 독안개", rankTag: "XVIII. 근손실 맹독" },
  { hue: 25, sat: 1.6, con: 1.25, bri: 1.05, flip: -1, zoom: 1.18, pos: "50% 20%", color: "#fb923c", subColor: "#b91c1c", auraName: "태양풍 척추 압사", rankTag: "XIX. 초중력 집행관" },
  { hue: 335, sat: 1.75, con: 1.3, bri: 1.04, flip: 1, zoom: 1.22, pos: "50% 24%", color: "#ef4444", subColor: "#f59e0b", auraName: "초신성 대지 붕괴", rankTag: "20. Zone 2 지배자" },

  // Zone 3 (Stages 21~30)
  { hue: 95, sat: 1.55, con: 1.24, bri: 1.0, flip: 1, zoom: 1.2, pos: "52% 26%", color: "#facc15", subColor: "#ea580c", auraName: "황혼의 등급 절망", rankTag: "XXI. 내신 학살자" },
  { hue: 40, sat: 1.6, con: 1.26, bri: 1.02, flip: -1, zoom: 1.18, pos: "58% 30%", color: "#2dd4bf", subColor: "#0284c7", auraName: "킬러문항 창백 뇌전", rankTag: "XXII. 멘탈 분쇄룡" },
  { hue: 195, sat: 1.6, con: 1.25, bri: 1.0, flip: -1, zoom: 1.2, pos: "48% 28%", color: "#e879f9", subColor: "#6366f1", auraName: "자홍빛 브레인포그", rankTag: "XXIII. 기억 소거귀" },
  { hue: 85, sat: 1.5, con: 1.26, bri: 1.04, flip: 1, zoom: 1.2, pos: "50% 22%", color: "#4ade80", subColor: "#0d9488", auraName: "질투와 열등의 마안", rankTag: "XXIV. 비교의 심판" },
  { hue: 110, sat: 1.65, con: 1.25, bri: 1.02, flip: -1, zoom: 1.18, pos: "50% 28%", color: "#34d399", subColor: "#059669", auraName: "취록빛 유혹의 파동", rankTag: "XXV. 의지력 붕괴" },
  { hue: 260, sat: 1.5, con: 1.25, bri: 0.96, flip: -1, zoom: 1.22, pos: "48% 32%", color: "#38bdf8", subColor: "#312e81", auraName: "심해 수면 최면술", rankTag: "XXVI. 영원한 가위눌림" },
  { hue: 175, sat: 1.6, con: 1.28, bri: 1.04, flip: -1, zoom: 1.22, pos: "50% 26%", color: "#f472b6", subColor: "#db2777", auraName: "증발하는 청춘의 시계", rankTag: "XXVII. 시간 강탈자" },
  { hue: 320, sat: 1.7, con: 1.28, bri: 1.05, flip: 1, zoom: 1.22, pos: "52% 24%", color: "#fbbf24", subColor: "#dc2626", auraName: "방전된 뇌신경 폭풍", rankTag: "XXVIII. 계획표 소각" },
  { hue: 225, sat: 1.65, con: 1.28, bri: 1.0, flip: 1, zoom: 1.2, pos: "48% 26%", color: "#818cf8", subColor: "#4f46e5", auraName: "자기합리화의 암흑벽", rankTag: "XXIX. 핑계의 거신" },
  { hue: 115, sat: 1.8, con: 1.32, bri: 1.06, flip: 1, zoom: 1.25, pos: "55% 32%", color: "#f43f5e", subColor: "#7c3aed", auraName: "심연룡의 멸망 브레스", rankTag: "30. Zone 3 지배자" },

  // Zone 4 (Stages 31~40)
  { hue: 190, sat: 1.55, con: 1.28, bri: 1.04, flip: 1, zoom: 1.24, pos: "50% 24%", color: "#00e5ff", subColor: "#0284c7", auraName: "얼어붙은 유전의 사슬", rankTag: "XXXI. 혈통의 저주" },
  { hue: 65, sat: 1.65, con: 1.28, bri: 1.02, flip: -1, zoom: 1.22, pos: "50% 26%", color: "#a3e635", subColor: "#4d7c0f", auraName: "화석화된 골격 봉인", rankTag: "XXXII. 성장판 동결" },
  { hue: 40, sat: 1.7, con: 1.3, bri: 1.04, flip: 1, zoom: 1.24, pos: "46% 26%", color: "#22d3ee", subColor: "#0891b2", auraName: "영양 고갈의 청색 독", rankTag: "XXXIII. 기아의 마수" },
  { hue: 250, sat: 1.65, con: 1.3, bri: 1.06, flip: -1, zoom: 1.22, pos: "45% 28%", color: "#38bdf8", subColor: "#1d4ed8", auraName: "절대영도 본프리즈", rankTag: "XXXIV. 혹한의 마녀" },
  { hue: 315, sat: 1.75, con: 1.3, bri: 0.98, flip: -1, zoom: 1.25, pos: "52% 28%", color: "#f43f5e", subColor: "#881337", auraName: "악몽의 핏빛 보름달", rankTag: "XXXV. 몽마의 지배" },
  { hue: 215, sat: 1.75, con: 1.32, bri: 1.08, flip: 1, zoom: 1.26, pos: "58% 28%", color: "#67e8f9", subColor: "#0369a1", auraName: "영하 200도 빙룡의 포효", rankTag: "XXXVI. 빙하의 절대룡" },
  { hue: 300, sat: 1.7, con: 1.32, bri: 1.02, flip: 1, zoom: 1.24, pos: "50% 22%", color: "#d946ef", subColor: "#701a75", auraName: "뒤틀린 차원의 골격", rankTag: "XXXVII. 비대칭 재앙" },
  { hue: 275, sat: 1.75, con: 1.32, bri: 1.05, flip: 1, zoom: 1.24, pos: "50% 20%", color: "#fb7185", subColor: "#be123c", auraName: "호르몬 소멸의 붉은 별", rankTag: "XXXVIII. 소마토 봉인" },
  { hue: 160, sat: 1.8, con: 1.34, bri: 1.06, flip: -1, zoom: 1.26, pos: "50% 24%", color: "#c084fc", subColor: "#6d28d9", auraName: "조롱하는 환영 분신", rankTag: "XXXIX. 편견의 악귀" },
  { hue: 15, sat: 1.85, con: 1.35, bri: 1.08, flip: -1, zoom: 1.28, pos: "50% 18%", color: "#facc15", subColor: "#dc2626", auraName: "백골 군주의 패왕색", rankTag: "40. Zone 4 지배자" },

  // Zone 5 (Stages 41~50)
  { hue: 150, sat: 1.75, con: 1.34, bri: 1.06, flip: -1, zoom: 1.26, pos: "48% 24%", color: "#38bdf8", subColor: "#a855f7", auraName: "신전 수문장의 성광", rankTag: "XLI. 초월의 관문" },
  { hue: 65, sat: 1.8, con: 1.35, bri: 1.1, flip: 1, zoom: 1.26, pos: "50% 22%", color: "#fbbf24", subColor: "#f59e0b", auraName: "황금 비율의 천상계", rankTag: "XLII. 황금의 재판관" },
  { hue: 30, sat: 1.85, con: 1.35, bri: 1.08, flip: 1, zoom: 1.28, pos: "50% 22%", color: "#f97316", subColor: "#facc15", auraName: "폭풍 성장의 뇌신", rankTag: "XLIII. 호르몬 폭풍" },
  { hue: 295, sat: 1.85, con: 1.36, bri: 1.08, flip: 1, zoom: 1.28, pos: "50% 22%", color: "#ef4444", subColor: "#f97316", auraName: "백절불굴의 투신염", rankTag: "XLIV. 무패의 투신" },
  { hue: 205, sat: 1.85, con: 1.36, bri: 1.12, flip: -1, zoom: 1.28, pos: "50% 18%", color: "#00e5ff", subColor: "#38bdf8", auraName: "대천사의 수직 승천광", rankTag: "XLV. 천공의 기립" },
  { hue: 95, sat: 1.9, con: 1.38, bri: 1.08, flip: 1, zoom: 1.3, pos: "52% 20%", color: "#10b981", subColor: "#00e5ff", auraName: "창공 도약의 소닉붐", rankTag: "XLVI. 중력 초월자" },
  { hue: 55, sat: 1.9, con: 1.38, bri: 1.1, flip: -1, zoom: 1.3, pos: "55% 24%", color: "#f59e0b", subColor: "#ec4899", auraName: "한계 돌파의 성화", rankTag: "XLVII. 제1벽 수호신" },
  { hue: 240, sat: 1.9, con: 1.4, bri: 1.1, flip: -1, zoom: 1.32, pos: "50% 20%", color: "#c084fc", subColor: "#00e5ff", auraName: "차원 왜곡의 환영", rankTag: "XLVIII. 제2벽 환영왕" },
  { hue: 165, sat: 1.95, con: 1.42, bri: 1.12, flip: 1, zoom: 1.34, pos: "58% 22%", color: "#facc15", subColor: "#ef4444", auraName: "신역의 천벌룡", rankTag: "XLIX. 신역의 수호신" },
  { hue: 345, sat: 2.0, con: 1.45, bri: 1.15, flip: 1, zoom: 1.36, pos: "50% 16%", color: "#ffd700", subColor: "#ff0055", auraName: "크로노스 50층 신화 각성", rankTag: "👑 50층 최종 군주" }
];

// Helper to construct all 50 full Boss objects with realistic hardcore scaling
// Every single boss strictly requires ~30 days (1 full month) of daily quest completions & stat training to barely beat!
function generate50Bosses() {
  return BOSS_NAMES_DATA.map((info, idx) => {
    const stage = idx + 1;
    // Balanced 2~3 Year progression scaling (~15~20 days of daily habit grind per stage):
    // Stage 1: Req Lv.10 (~15일차 수련 시 도달)
    // Stage 50: Req Lv.100 (~2.5년 매일 꾸준한 수련 시 도달)
    const reqLevel = Math.min(100, Math.round(10 + (stage - 1) * 1.85));
    const trainingDays = Math.round(stage * 18);
    const trainingMonths = parseFloat((stage * 0.6).toFixed(1));

    // Hardcore balanced boss scaling (challenging 8~12 turn raid battles):
    // Stage 1: HP 1,900, ATK 200, DEF 40
    // Stage 10: HP 10,317, ATK 781, DEF 379
    // Stage 25: HP 25,595, ATK 1,793, DEF 987
    // Stage 50: HP 52,831, ATK 3,531, DEF 2,058
    const maxHp = Math.round(1900 + (stage - 1) * 820 + Math.pow(stage - 1, 1.38) * 50);
    const atk = Math.round(200 + (stage - 1) * 56 + Math.pow(stage - 1, 1.20) * 5.5);
    const def = Math.round(40 + (stage - 1) * 34 + Math.pow(stage - 1, 1.14) * 2.5);

    const rewardsExp = Math.round(350 * Math.pow(1.085, stage - 1) + stage * 90);
    const rewardsGold = Math.round(120 * Math.pow(1.08, stage - 1) + stage * 40);
    const growthPoints = Math.round(30 + (stage * 7.5));

    const rarity = stage >= 45 ? "mythic" : (stage >= 30 ? "legendary" : (stage >= 15 ? "epic" : "rare"));
    const slot = ["weapon", "armor", "shoes", "ring", "aura"][stage % 5];
    const itemName = `${info.name.split(',')[0]}의 ${slot === 'weapon' ? '검격' : (slot === 'armor' ? '갑옷' : (slot === 'shoes' ? '각력화' : (slot === 'ring' ? '반지' : '오라')))}`;

    const visual = BOSS_VISUAL_EVOLUTIONS[idx] || BOSS_VISUAL_EVOLUTIONS[0];

    return {
      id: `boss${stage}`,
      stage,
      name: info.name,
      subName: info.sub,
      title: `Stage ${stage} Boss`,
      recommendedLevel: reqLevel,
      trainingDays,
      trainingMonths,
      maxHp,
      atk,
      def,
      crit: 0.06 + Math.min(0.18, stage * 0.003),
      image: info.img,
      visual,
      introQuote: info.quote,
      rewards: {
        exp: rewardsExp,
        gold: rewardsGold,
        growthPoints,
        item: {
          id: `item_stage_${stage}`,
          slot,
          name: itemName,
          rarity,
          statsText: `공격력 +${stage * 14} | 방어력 +${stage * 8} | 키 성장 가속 +${stage}%`,
          stats: {
            atk: stage * 14,
            def: stage * 8,
            str: Math.round(stage * 2.8),
            gro: Math.round(stage * 2.2)
          }
        },
        title: `${info.name.split(' ')[0]} 격파자`
      }
    };
  });
}

const BOSSES_DATA = generate50Bosses();

// True Ultimate Secret Final Boss (100단계: 50단계를 넘은 자에게만 열리는 100레벨 신화의 절대 거신)
const SECRET_FINAL_BOSS = {
  id: "boss_secret_omega",
  stage: 100, // 100단계
  level: 100, // 100레벨
  name: "절대 거신, 오메가 크로노스",
  subName: "True Ultimate Colossal God · 100레벨 찐막 최종보스",
  title: "100단계: 신화의 절대 거신 (100레벨)",
  recommendedLevel: 120, // 50단계(Lv.100)를 초월한 3년차 극한 목표 레벨
  trainingDays: 1095,
  trainingMonths: 36,
  maxHp: 195000,
  atk: 4500,
  def: 2200,
  crit: 0.25,
  image: "assets/bosses/boss_secret_omega.jpg",
  introQuote: "“50개의 나태와 왜소의 시련을 모두 넘었구나... 허나 100단계 절대 거신 앞에선 한 줌의 먼지일 뿐이다!”",
  isSecretFinal: true,
  rewards: {
    exp: 250000,
    gold: 100000,
    growthPoints: 1000, // +0.10 cm 최종 각성 성장!
    item: {
      id: "item_omega_sword",
      slot: "weapon",
      name: "절대 거신의 멸천성검",
      rarity: "mythic",
      statsText: "공격력 +5,000 | 방어력 +2,500 | 전 능력치 +100",
      stats: {
        atk: 5000,
        def: 2500,
        str: 100,
        end: 100,
        int: 100,
        gro: 100
      }
    },
    title: "신화의 절대신"
  }
};

BOSSES_DATA.push(SECRET_FINAL_BOSS);

// Action Combat Skills
const PLAYER_SKILLS = [
  {
    id: "basic_slash",
    name: "질풍 참격 (Slash)",
    key: "J",
    costMp: 0,
    desc: "기본 베기 공격. 콤보를 잇고 분노 게이지를 12% 충전합니다.",
    type: "attack",
    multiplier: 1.8
  },
  {
    id: "rope_flurry",
    name: "줄넘기 광속 난무 (Tempest Flurry)",
    key: "U",
    costMp: 25,
    desc: "줄넘기 도약과 함께 적을 6회 연속 난도질! [신장 성장치] 비례 추가 대미지 부여.",
    type: "attack",
    multiplier: 4.8
  },
  {
    id: "spine_breaker",
    name: "척추 각성파 (Spine Awakening Pierce)",
    key: "I",
    costMp: 40,
    desc: "척추를 곧게 펴며 적의 방어력을 50% 무시하고 큰 그로기(Groggy) 수치를 입힙니다.",
    type: "attack",
    multiplier: 6.5
  },
  {
    id: "dopamine_shield",
    name: "도파민 차단막 (Dopamine Cleanse)",
    key: "O",
    costMp: 30,
    desc: "3초간 피해를 75% 감소시키는 실드 전개 및 MP를 35 회복합니다.",
    type: "buff"
  },
  {
    id: "ultimate_limit_break",
    name: "[궁극기] 한계 돌파 : 신장 개화 멸신참",
    key: "R",
    costRage: 100,
    desc: "분노 게이지 100% 시 발동! 시네마틱 화면 암전과 함께 전 화면을 파괴하는 극대 참격!",
    type: "ultimate",
    multiplier: 18.0
  }
];

// Titles unlocked across milestones, bosses, and growth habits
const TITLES_DATA = {
  // === MYTHIC (신화 - 최고위 등급) ===
  "신화의 절대신": {
    name: "신화의 절대신",
    rarity: "mythic",
    reqLevel: 100,
    desc: "제100의 벽, 절대 거신 오메가 크로노스를 굴복시키고 신의 반열에 오른 전설.",
    bonusText: "공격력 +5,000, 방어력 +2,500, 전 스탯 +100, 최대 체력 +10,000, 치명타율 +20% | EXP +50% / 골드 +40%",
    expMultiplier: 1.50,
    goldMultiplier: 1.40,
    stats: { atk: 5000, def: 2500, str: 100, int: 100, end: 100, gro: 100, maxHp: 10000, crit: 0.20 },
    unlockHint: "100단계 절대 거신 오메가 크로노스 격파"
  },
  "한계 초월의 절대 각성자": {
    name: "한계 초월의 절대 각성자",
    rarity: "mythic",
    reqLevel: 80,
    desc: "Stage 50 크로노스를 꺾고 목표 신장을 완벽히 쟁취한 전설.",
    bonusText: "공격력 +1,500, 방어력 +800, 전 스탯 +80, 최대 체력 +5,000, 치명타율 +15% | EXP +35% / 골드 +30%",
    expMultiplier: 1.35,
    goldMultiplier: 1.30,
    stats: { atk: 1500, def: 800, str: 80, int: 80, end: 80, gro: 80, maxHp: 5000, crit: 0.15 },
    unlockHint: "목표 신장 달성 & Stage 50 보스 격파"
  },
  "시공간의 초월자": {
    name: "시공간의 초월자",
    rarity: "mythic",
    reqLevel: 75,
    desc: "미루기와 스마트폰의 알고리즘을 소멸시키고 절대 집중의 경지에 이른 자.",
    bonusText: "공격력 +1,200, 방어력 +600, 전 스탯 +60, 최대 체력 +4,000, 치명타율 +15% | EXP +30% / 골드 +25%",
    expMultiplier: 1.30,
    goldMultiplier: 1.25,
    stats: { atk: 1200, def: 600, str: 60, int: 70, end: 60, gro: 60, maxHp: 4000, crit: 0.15 },
    unlockHint: "연속 30일 일일 퀘스트 올클리어 달성"
  },

  // === LEGENDARY (레전더리 - 전설 등급) ===
  "골격 파괴의 거인": {
    name: "골격 파괴의 거인",
    rarity: "legendary",
    reqLevel: 60,
    desc: "Stage 40 스켈레톤 킹을 굴복시키고 골격을 완벽히 개조한 자.",
    bonusText: "공격력 +500, 방어력 +250, 전 스탯 +40, 최대 체력 +2,500, 치명타율 +10% | EXP +24% / 골드 +20%",
    expMultiplier: 1.24,
    goldMultiplier: 1.20,
    stats: { atk: 500, def: 250, str: 45, int: 35, end: 45, gro: 40, maxHp: 2500, crit: 0.10 },
    unlockHint: "Stage 40 스켈레톤 킹 격파"
  },
  "황금 신장의 수호신": {
    name: "황금 신장의 수호신",
    rarity: "legendary",
    reqLevel: 55,
    desc: "목표 신장의 완성까지 단 한 걸음, 황금 골격을 증명한 자.",
    bonusText: "공격력 +450, 방어력 +220, 전 스탯 +35, 키 성장 속도 +50%, 최대 체력 +2,000 | EXP +22% / 골드 +18%",
    expMultiplier: 1.22,
    goldMultiplier: 1.18,
    stats: { atk: 450, def: 220, str: 35, int: 35, end: 35, gro: 50, maxHp: 2000 },
    unlockHint: "Stage 49 에이펙스 격파"
  },
  "백절불굴의 투신": {
    name: "백절불굴의 투신",
    rarity: "legendary",
    reqLevel: 50,
    desc: "수천 번의 좌절을 딛고 극한의 끈기로 일어선 불멸의 투신.",
    bonusText: "공격력 +400, 방어력 +200, STR +40, END +40, 최대 체력 +2,200 | EXP +20% / 골드 +16%",
    expMultiplier: 1.20,
    goldMultiplier: 1.16,
    stats: { atk: 400, def: 200, str: 40, end: 40, gro: 30, maxHp: 2200 },
    unlockHint: "Stage 44 인빅터스 격파"
  },
  "스켈레톤 킹 격파자": {
    name: "스켈레톤 킹 격파자",
    rarity: "legendary",
    reqLevel: 45,
    desc: "뼈마디의 절규를 딛고 173cm의 한계를 깨부순 영웅.",
    bonusText: "공격력 +350, 방어력 +180, STR +40, END +35, 최대 체력 +1,800 | EXP +18% / 골드 +15%",
    expMultiplier: 1.18,
    goldMultiplier: 1.15,
    stats: { atk: 350, def: 180, str: 40, end: 35, maxHp: 1800 },
    unlockHint: "Stage 40 보스 격파"
  },

  // === EPIC (에픽 - 영웅 등급) ===
  "불굴의 수험생 (176cm)": {
    name: "불굴의 수험생 (176cm)",
    rarity: "epic",
    reqLevel: 40,
    desc: "Stage 30 심연룡을 베고 번아웃을 극복한 자.",
    bonusText: "공격력 +220, 방어력 +120, INT +35, 최대 체력 +1,200 | EXP +15% / 골드 +12%",
    expMultiplier: 1.15,
    goldMultiplier: 1.12,
    stats: { atk: 220, def: 120, int: 35, str: 25, end: 25, maxHp: 1200 },
    unlockHint: "신장 176.0cm 달성 & Stage 30 격파"
  },
  "심연의 정복자": {
    name: "심연의 정복자",
    rarity: "epic",
    reqLevel: 35,
    desc: "무기력과 패배주의의 심연룡 아비스를 베어버린 자.",
    bonusText: "공격력 +180, 방어력 +100, INT +30, 최대 체력 +1,000, 치명타율 +6% | EXP +14% / 골드 +11%",
    expMultiplier: 1.14,
    goldMultiplier: 1.11,
    stats: { atk: 180, def: 100, int: 30, str: 20, maxHp: 1000, crit: 0.06 },
    unlockHint: "Stage 30 아비스 격파"
  },
  "성장판 해방자 (174cm)": {
    name: "성장판 해방자 (174cm)",
    rarity: "epic",
    reqLevel: 30,
    desc: "Stage 20 그라비타스를 꺾고 척추를 세운 자.",
    bonusText: "공격력 +150, 방어력 +80, STR +25, 키 성장 속도 +30%, 최대 체력 +800 | EXP +12% / 골드 +10%",
    expMultiplier: 1.12,
    goldMultiplier: 1.10,
    stats: { atk: 150, def: 80, str: 25, gro: 30, maxHp: 800 },
    unlockHint: "신장 174.0cm 달성 & Stage 20 격파"
  },
  "척추 기립의 대천사": {
    name: "척추 기립의 대천사",
    rarity: "epic",
    reqLevel: 30,
    desc: "구부러졌던 모든 뼈를 곧추세워 하늘을 찌르는 자태를 증명한 자.",
    bonusText: "공격력 +130, 방어력 +85, END +25, 키 성장 속도 +25%, 최대 체력 +750 | EXP +11% / 골드 +9%",
    expMultiplier: 1.11,
    goldMultiplier: 1.09,
    stats: { atk: 130, def: 85, end: 25, gro: 25, maxHp: 750 },
    unlockHint: "코브라 전신 스트레칭 20회 완료"
  },
  "도파민의 종결자": {
    name: "도파민의 종결자",
    rarity: "epic",
    reqLevel: 25,
    desc: "숏폼과 쾌락 알고리즘의 유혹을 완전히 단절한 전두엽 각성자.",
    bonusText: "공격력 +120, 방어력 +60, INT +30, 치명타율 +8%, 최대 체력 +600 | EXP +10% / 골드 +8%",
    expMultiplier: 1.10,
    goldMultiplier: 1.08,
    stats: { atk: 120, def: 60, int: 30, crit: 0.08, maxHp: 600 },
    unlockHint: "디톡스 퀘스트 누적 15회 완료"
  },

  // === RARE (레어 - 희귀 등급) ===
  "도파민 정복자": {
    name: "도파민 정복자",
    rarity: "rare",
    reqLevel: 20,
    desc: "Stage 10 대마신을 쓰러뜨리고 전두엽 집중력을 되찾은 자.",
    bonusText: "공격력 +80, 방어력 +45, INT +20, 치명타율 +6%, 최대 체력 +450 | EXP +8% / 골드 +7%",
    expMultiplier: 1.08,
    goldMultiplier: 1.07,
    stats: { atk: 80, def: 45, int: 20, crit: 0.06, maxHp: 450 },
    unlockHint: "Stage 10 도파미너스 격파"
  },
  "나태 분쇄자": {
    name: "나태 분쇄자",
    rarity: "rare",
    reqLevel: 15,
    desc: "Stage 1 슬로스를 격파하고 미루기를 극복한 자.",
    bonusText: "공격력 +65, 방어력 +35, STR +15, 최대 체력 +400 | EXP +6% / 골드 +5%",
    expMultiplier: 1.06,
    goldMultiplier: 1.05,
    stats: { atk: 65, def: 35, str: 15, maxHp: 400 },
    unlockHint: "Stage 1 슬로스 격파"
  },
  "줄넘기 한계 도약자": {
    name: "줄넘기 한계 도약자",
    rarity: "rare",
    reqLevel: 5,
    desc: "성장판에 강력한 수직 자극을 가하며 2,000회의 도약을 달성한 헌터.",
    bonusText: "공격력 +40, 방어력 +25, STR +15, END +15, 최대 체력 +300 | EXP +5% / 골드 +4%",
    expMultiplier: 1.05,
    goldMultiplier: 1.04,
    stats: { atk: 40, def: 25, str: 15, end: 15, maxHp: 300 },
    unlockHint: "줄넘기 2,000회 퀘스트 완료"
  },
  "줄넘기 3,500회 극한 달성자": {
    name: "줄넘기 3,500회 극한 달성자",
    rarity: "rare",
    reqLevel: 15,
    desc: "한계를 넘어 무릎과 종아리에 불이 붙도록 도약한 헌터.",
    bonusText: "공격력 +60, 방어력 +40, STR +25, END +25, 최대 체력 +500 | EXP +7% / 골드 +6%",
    expMultiplier: 1.07,
    goldMultiplier: 1.06,
    stats: { atk: 60, def: 40, str: 25, end: 25, maxHp: 500 },
    unlockHint: "줄넘기 3,500회 퀘스트 완료"
  },
  "성장 골든타임의 수호자": {
    name: "성장 골든타임의 수호자",
    rarity: "rare",
    reqLevel: 10,
    desc: "매일 밤 11시 전 딥슬립 골든타임을 사수하여 호르몬을 깨운 자.",
    bonusText: "공격력 +50, 방어력 +45, END +20, 최대 체력 +450, 키 성장 속도 +15% | EXP +6% / 골드 +5%",
    expMultiplier: 1.06,
    goldMultiplier: 1.05,
    stats: { atk: 50, def: 45, end: 20, gro: 15, maxHp: 450 },
    unlockHint: "골든타임 취침 퀘스트 7회 완료"
  },
  "디톡스 24시간 철인": {
    name: "디톡스 24시간 철인",
    rarity: "rare",
    reqLevel: 10,
    desc: "쇼츠/릴스/틱톡의 늪에서 24시간 동안 완벽히 생존한 자.",
    bonusText: "공격력 +55, 방어력 +30, INT +20, 치명타율 +5%, 최대 체력 +350 | EXP +6% / 골드 +5%",
    expMultiplier: 1.06,
    goldMultiplier: 1.05,
    stats: { atk: 55, def: 30, int: 20, crit: 0.05, maxHp: 350 },
    unlockHint: "숏폼 24시간 완전 금지 완료"
  },

  // === NORMAL (노말 - 일반 등급) ===
  "초보 수련자": {
    name: "초보 수련자",
    rarity: "normal",
    reqLevel: 1,
    desc: "목표 신장을 향해 첫 발을 내딛은 성장 수련자.",
    bonusText: "공격력 +15, 방어력 +10, STR +5, END +5, 최대 체력 +100 | 기본 밸런스 유지",
    expMultiplier: 1.0,
    goldMultiplier: 1.0,
    stats: { atk: 15, def: 10, str: 5, end: 5, maxHp: 100 },
    unlockHint: "기본 지급"
  },
  "초보 수련자 (173cm)": {
    name: "초보 수련자",
    rarity: "normal",
    reqLevel: 1,
    desc: "목표 신장을 향해 첫 발을 내딛은 성장 수련자.",
    bonusText: "공격력 +15, 방어력 +10, STR +5, END +5, 최대 체력 +100 | 기본 밸런스 유지",
    expMultiplier: 1.0,
    goldMultiplier: 1.0,
    stats: { atk: 15, def: 10, str: 5, end: 5, maxHp: 100 },
    unlockHint: "기본 지급"
  },
  "줄넘기 입문자": {
    name: "줄넘기 입문자",
    rarity: "normal",
    reqLevel: 1,
    desc: "성장판 자극을 위해 매일 줄을 넘기 시작한 초보 헌터.",
    bonusText: "공격력 +25, 방어력 +15, STR +10, 최대 체력 +150 | EXP +3% / 골드 +2%",
    expMultiplier: 1.03,
    goldMultiplier: 1.02,
    stats: { atk: 25, def: 15, str: 10, maxHp: 150 },
    unlockHint: "줄넘기 1,000회 1회 완료"
  },
  "자세 교정 수련생": {
    name: "자세 교정 수련생",
    rarity: "normal",
    reqLevel: 1,
    desc: "구부정한 척추와 거북목을 펴기 시작한 헌터.",
    bonusText: "공격력 +20, 방어력 +25, END +10, 키 성장 속도 +10%, 최대 체력 +150 | EXP +3% / 골드 +2%",
    expMultiplier: 1.03,
    goldMultiplier: 1.02,
    stats: { atk: 20, def: 25, end: 10, gro: 10, maxHp: 150 },
    unlockHint: "코브라 스트레칭 1회 완료"
  },
  "성장 영양 보급자": {
    name: "성장 영양 보급자",
    rarity: "normal",
    reqLevel: 1,
    desc: "골격 합성을 위해 칼슘 우유와 단백질을 챙겨 먹는 헌터.",
    bonusText: "공격력 +20, 방어력 +20, STR +8, END +10, 최대 체력 +200 | EXP +4% / 골드 +3%",
    expMultiplier: 1.04,
    goldMultiplier: 1.03,
    stats: { atk: 20, def: 20, str: 8, end: 10, maxHp: 200 },
    unlockHint: "영양 섭취 퀘스트 1회 완료"
  }
};

// Global helper to safely look up title metadata or construct fallback for dynamic boss titles
function getTitleMetadata(tName) {
  if (TITLES_DATA[tName]) return TITLES_DATA[tName];

  // Legacy title aliases
  if (tName && tName.includes('신화의 절대신')) return TITLES_DATA['신화의 절대신'];
  if (tName && tName.includes('절대 각성자')) return TITLES_DATA['한계 초월의 절대 각성자'];
  if (tName && tName.includes('골격 파괴의 거인')) return TITLES_DATA['골격 파괴의 거인'];
  if (tName && tName.includes('초보 수련자')) return TITLES_DATA['초보 수련자'];

  // Try finding matching boss from BOSS_NAMES_DATA or TITLES_DATA keys
  const cleaned = tName.replace(' 격파자', '').trim();
  const foundKey = Object.keys(TITLES_DATA).find(k => k.includes(cleaned) || cleaned.includes(k.replace(' 격파자', '').trim()));
  if (foundKey && TITLES_DATA[foundKey]) return TITLES_DATA[foundKey];

  let stage = 1;
  const matchedBoss = BOSS_NAMES_DATA.find(b => {
    const prefix = b.name.split(',')[0].split(' ')[0];
    return tName.startsWith(prefix) || tName.includes(prefix);
  });
  if (matchedBoss) {
    stage = matchedBoss.stage;
  }

  const rarity = stage >= 40 ? "mythic" : (stage >= 20 ? "legendary" : (stage >= 5 ? "epic" : "rare"));
  const expMult = parseFloat((1.02 + stage * 0.0055).toFixed(2));
  const goldMult = parseFloat((1.01 + stage * 0.0048).toFixed(2));
  const expPct = Math.round((expMult - 1) * 100);
  const goldPct = Math.round((goldMult - 1) * 100);
  const reqLvl = Math.min(100, Math.round(10 + (stage - 1) * 1.85));
  const atk = Math.round(30 + (stage - 1) * 25 + Math.pow(stage, 1.55) * 4);
  const def = Math.round(15 + (stage - 1) * 12 + Math.pow(stage, 1.45) * 2.2);
  const allStats = Math.round(5 + (stage - 1) * 3 + Math.pow(stage, 1.35));
  const maxHp = Math.round(150 + (stage - 1) * 120 + Math.pow(stage, 1.7) * 12);

  return {
    name: tName,
    rarity,
    reqLevel: reqLvl,
    desc: `Stage ${stage} ${matchedBoss ? matchedBoss.name : tName}을(를) 격파하고 얻은 헌터의 영예.`,
    bonusText: `공격력 +${atk.toLocaleString()}, 방어력 +${def.toLocaleString()}, 전 스탯 +${allStats}, 최대 체력 +${maxHp.toLocaleString()} | EXP +${expPct}% / 골드 +${goldPct}%`,
    expMultiplier: expMult,
    goldMultiplier: goldMult,
    stats: { atk, def, str: allStats, int: allStats, end: allStats, gro: allStats, maxHp },
    unlockHint: `Stage ${stage} 보스 격파 업적 달성`
  };
}

// Register all 50 Boss Titles directly into TITLES_DATA with escalating stats
function registerAll50BossTitles() {
  if (typeof BOSS_NAMES_DATA === 'undefined') return;
  BOSS_NAMES_DATA.forEach(b => {
    const stage = b.stage;
    const rarity = stage >= 40 ? "mythic" : (stage >= 20 ? "legendary" : (stage >= 5 ? "epic" : "rare"));
    const reqLvl = Math.min(100, Math.round(10 + (stage - 1) * 1.85));

    const atk = Math.round(30 + (stage - 1) * 25 + Math.pow(stage, 1.55) * 4);
    const def = Math.round(15 + (stage - 1) * 12 + Math.pow(stage, 1.45) * 2.2);
    const allStats = Math.round(5 + (stage - 1) * 3 + Math.pow(stage, 1.35));
    const maxHp = Math.round(150 + (stage - 1) * 120 + Math.pow(stage, 1.7) * 12);

    const expMult = parseFloat((1.02 + stage * 0.0055).toFixed(2));
    const goldMult = parseFloat((1.01 + stage * 0.0048).toFixed(2));
    const expPct = Math.round((expMult - 1) * 100);
    const goldPct = Math.round((goldMult - 1) * 100);

    const titleObj = {
      name: `${b.name.split(',')[0]} 격파자`,
      stage,
      rarity,
      reqLevel: reqLvl,
      desc: `Stage ${stage} ${b.name}을(를) 격파하고 얻은 헌터의 영예.`,
      bonusText: `공격력 +${atk.toLocaleString()}, 방어력 +${def.toLocaleString()}, 전 스탯 +${allStats}, 최대 체력 +${maxHp.toLocaleString()} | EXP +${expPct}% / 골드 +${goldPct}%`,
      expMultiplier: expMult,
      goldMultiplier: goldMult,
      stats: { atk, def, str: allStats, int: allStats, end: allStats, gro: allStats, maxHp },
      unlockHint: `Stage ${stage} ${b.name.split(',')[0]} 격파`
    };

    const shortName = `${b.name.split(' ')[0]} 격파자`; // e.g. "나태의 격파자"
    const fullName = `${b.name.split(',')[0]} 격파자`;  // e.g. "나태의 망령 격파자"
    const bossOnlyName = `${b.name.split(',')[1] ? b.name.split(',')[1].trim() : b.name} 격파자`; // e.g. "슬로스 격파자"

    TITLES_DATA[shortName] = { ...titleObj, name: shortName };
    TITLES_DATA[fullName] = { ...titleObj, name: fullName };
    TITLES_DATA[bossOnlyName] = { ...titleObj, name: bossOnlyName };
  });
}
registerAll50BossTitles();

if (typeof window !== 'undefined') {
  window.TITLES_DATA = TITLES_DATA;
  window.BOSS_NAMES_DATA = BOSS_NAMES_DATA;
  window.BOSSES_DATA = BOSSES_DATA;
  window.INITIAL_QUESTS = INITIAL_QUESTS;
  window.getTitleMetadata = getTitleMetadata;
}
if (typeof global !== 'undefined') {
  global.TITLES_DATA = TITLES_DATA;
  global.BOSS_NAMES_DATA = BOSS_NAMES_DATA;
  global.BOSSES_DATA = BOSSES_DATA;
  global.INITIAL_QUESTS = INITIAL_QUESTS;
  global.getTitleMetadata = getTitleMetadata;
}
