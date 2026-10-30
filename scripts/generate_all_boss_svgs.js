const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'assets', 'bosses');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Full 50 Boss Visual Design Definitions
const BOSS_VISUAL_DEFS = [
  // Zone 1: Sloth & Dopamine (Stages 1~10) - Weaker, mischievous, funny or sleepy lesser demons
  {
    stage: 1,
    name: "나태의 망령, 슬로스",
    sub: "Sloth Spectre",
    zone: 1,
    bgGrad: ["#1e1b4b", "#0f172a"],
    auraColor: "#8b5cf6",
    eyeColor: "#c084fc",
    horns: "none",
    headType: "hood_ghost",
    features: "sleepy_clouds",
    weapon: "none"
  },
  {
    stage: 2,
    name: "숏폼의 환영귀, 스크롤러",
    sub: "Phantom Scroller",
    zone: 1,
    bgGrad: ["#083344", "#030712"],
    auraColor: "#06b6d4",
    eyeColor: "#22d3ee",
    horns: "antennae",
    headType: "phone_goblin",
    features: "swirling_screens",
    weapon: "phone"
  },
  {
    stage: 3,
    name: "야식의 폭식마, 글러튼",
    sub: "Gluttonous Fiend",
    zone: 1,
    bgGrad: ["#451a03", "#0f172a"],
    auraColor: "#f97316",
    eyeColor: "#fdba74",
    horns: "short_horns",
    headType: "fat_demon",
    features: "greasy_fire",
    weapon: "meat_bone"
  },
  {
    stage: 4,
    name: "작심삼일의 사신, 기브업",
    sub: "Reaper of Surrender",
    zone: 1,
    bgGrad: ["#1e293b", "#090d16"],
    auraColor: "#94a3b8",
    eyeColor: "#cbd5e1",
    horns: "ragged_hood",
    headType: "mini_reaper",
    features: "broken_hourglass",
    weapon: "chipped_dagger"
  },
  {
    stage: 5,
    name: "알고리즘의 주술사, 피드",
    sub: "Algorithm Sorcerer",
    zone: 1,
    bgGrad: ["#022c22", "#020617"],
    auraColor: "#10b981",
    eyeColor: "#34d399",
    horns: "sorcerer_hat",
    headType: "cyber_sorcerer",
    features: "binary_glyphs",
    weapon: "digital_staff"
  },
  {
    stage: 6,
    name: "스마트폰 지박령, 블루라이트",
    sub: "Bluelight Demon",
    zone: 1,
    bgGrad: ["#172554", "#030712"],
    auraColor: "#3b82f6",
    eyeColor: "#60a5fa",
    horns: "crystal_horns",
    headType: "light_sprite",
    features: "blinding_rays",
    weapon: "neon_orb"
  },
  {
    stage: 7,
    name: "침대 늪의 흡혈귀, 매트리스",
    sub: "Mattress Vampire",
    zone: 1,
    bgGrad: ["#3b0764", "#090d16"],
    auraColor: "#a855f7",
    eyeColor: "#d8b4fe",
    horns: "bat_ears",
    headType: "vampire_bat",
    features: "pillow_cape",
    weapon: "sleep_fangs"
  },
  {
    stage: 8,
    name: "가짜 성취의 요마, 도파민스니크",
    sub: "Dopamine Sneak",
    zone: 1,
    bgGrad: ["#312e81", "#020617"],
    auraColor: "#6366f1",
    eyeColor: "#818cf8",
    horns: "lizard_horns",
    headType: "sneak_reptile",
    features: "candy_orbs",
    weapon: "poison_flask"
  },
  {
    stage: 9,
    name: "미루기의 군주, 프로크라스틴",
    sub: "Lord of Procrastination",
    zone: 1,
    bgGrad: ["#1f2937", "#030712"],
    auraColor: "#eab308",
    eyeColor: "#facc15",
    horns: "melting_crown",
    headType: "slug_monarch",
    features: "melting_wax",
    weapon: "sloth_scepter"
  },
  {
    stage: 10,
    name: "도파민의 대마신, 도파미너스",
    sub: "High Dopamine Demon",
    zone: 1,
    bgGrad: ["#4c0519", "#090d16"],
    auraColor: "#f43f5e",
    eyeColor: "#fb7185",
    horns: "multi_horns",
    headType: "zone1_boss",
    features: "tentacles_eyes",
    weapon: "dopamine_vortex"
  },

  // Zone 2: Gravity & Skeletal Burden (Stages 11~20) - Fiercer, bloody, heavy rock armor & bone crushers
  {
    stage: 11,
    name: "구부정한 망령, 거북목",
    sub: "Turtle Neck Wraith",
    zone: 2,
    bgGrad: ["#292524", "#0c0a09"],
    auraColor: "#b45309",
    eyeColor: "#f59e0b",
    horns: "spine_spikes",
    headType: "hunched_fiend",
    features: "vertebrae_ridge",
    weapon: "curved_bone"
  },
  {
    stage: 12,
    name: "척추 압박의 석괴, 척추만곡",
    sub: "Spine Compactor",
    zone: 2,
    bgGrad: ["#1c1917", "#090d16"],
    auraColor: "#d97706",
    eyeColor: "#f97316",
    horns: "basalt_horns",
    headType: "stone_golem",
    features: "piston_crusher",
    weapon: "stone_fists"
  },
  {
    stage: 13,
    name: "성장판 봉인귀, 에피피시스",
    sub: "Growth Plate Sealer",
    zone: 2,
    bgGrad: ["#450a0a", "#0f172a"],
    auraColor: "#dc2626",
    eyeColor: "#ef4444",
    horns: "iron_visor",
    headType: "masked_blacksmith",
    features: "burning_brand",
    weapon: "seal_hammer"
  },
  {
    stage: 14,
    name: "칼슘 결핍의 골렘, 본크러셔",
    sub: "Bone Crusher",
    zone: 2,
    bgGrad: ["#27272a", "#09090b"],
    auraColor: "#e11d48",
    eyeColor: "#f43f5e",
    horns: "cracked_skull_horns",
    headType: "skeletal_minotaur",
    features: "jagged_bone_plate",
    weapon: "bone_sledgehammer"
  },
  {
    stage: 15,
    name: "수면 부족의 악령, 인섬니아",
    sub: "Insomnia Fiend",
    zone: 2,
    bgGrad: ["#3f1dcb", "#090d16"],
    auraColor: "#8b5cf6",
    eyeColor: "#ef4444",
    horns: "needle_horns",
    headType: "bloodshot_wraith",
    features: "red_veins",
    weapon: "clock_needles"
  },
  {
    stage: 16,
    name: "라운드숄더의 족쇄, 말린어깨",
    sub: "Rounded Shackle",
    zone: 2,
    bgGrad: ["#1e293b", "#090d16"],
    auraColor: "#0ea5e9",
    eyeColor: "#38bdf8",
    horns: "iron_shackle_horns",
    headType: "shackle_golem",
    features: "curved_shoulder_cage",
    weapon: "heavy_clamps"
  },
  {
    stage: 17,
    name: "점프 저지마, 헤비앵클",
    sub: "Heavy Ankle Beast",
    zone: 2,
    bgGrad: ["#1c1917", "#09090b"],
    auraColor: "#ea580c",
    eyeColor: "#f97316",
    horns: "chain_horns",
    headType: "iron_beast",
    features: "spiked_collar",
    weapon: "anchor_chains"
  },
  {
    stage: 18,
    name: "운동 결핍의 점액괴, 슬라임바디",
    sub: "Sluggish Slime",
    zone: 2,
    bgGrad: ["#14532d", "#020617"],
    auraColor: "#22c55e",
    eyeColor: "#86efac",
    horns: "tar_horns",
    headType: "tar_brute",
    features: "floating_skull_core",
    weapon: "acid_fists"
  },
  {
    stage: 19,
    name: "골격 억압의 거인, 척추파괴수",
    sub: "Spine Shatterer",
    zone: 2,
    bgGrad: ["#450a0a", "#090d16"],
    auraColor: "#ef4444",
    eyeColor: "#fca5a5",
    horns: "quad_horns",
    headType: "four_armed_ogre",
    features: "bone_pauldrons",
    weapon: "spinal_club"
  },
  {
    stage: 20,
    name: "중력과 왜소의 거신, 그라비타스",
    sub: "Titan of Gravity",
    zone: 2,
    bgGrad: ["#1e1b4b", "#030712"],
    auraColor: "#c026d3",
    eyeColor: "#e879f9",
    horns: "gravity_crown",
    headType: "zone2_boss",
    features: "orbital_rings",
    weapon: "singularity_core"
  },

  // Zone 3: High School Exam & Burnout Pit (Stages 21~30) - Terrifying, nightmarish, grim reapers & despair dragons
  {
    stage: 21,
    name: "내신 참사의 망령, 미드텀",
    sub: "Midterm Despair",
    zone: 3,
    bgGrad: ["#4c0519", "#090d16"],
    auraColor: "#e11d48",
    eyeColor: "#fb7185",
    horns: "scythe_crest",
    headType: "exam_reaper",
    features: "pierced_test_sheets",
    weapon: "blood_scythe"
  },
  {
    stage: 22,
    name: "모의고사 킬러마, 모크",
    sub: "Mock Exam Executioner",
    zone: 3,
    bgGrad: ["#1e1b4b", "#09090b"],
    auraColor: "#7c3aed",
    eyeColor: "#a78bfa",
    horns: "executioner_cowl",
    headType: "dark_executioner",
    features: "bloodied_blade_plate",
    weapon: "executioner_greatsword"
  },
  {
    stage: 23,
    name: "뇌 피로의 독무, 브레인포그",
    sub: "Brain Fog Fogger",
    zone: 3,
    bgGrad: ["#3b0764", "#030712"],
    auraColor: "#a855f7",
    eyeColor: "#ffffff",
    horns: "smoke_horns",
    headType: "mist_phantom",
    features: "hollow_sockets",
    weapon: "choking_tendrils"
  },
  {
    stage: 24,
    name: "타인과의 비교귀, 콤플렉스",
    sub: "Inferiority Complex",
    zone: 3,
    bgGrad: ["#022c22", "#090d16"],
    auraColor: "#059669",
    eyeColor: "#34d399",
    horns: "dual_face_horns",
    headType: "two_headed_demon",
    features: "shattered_mirrors",
    weapon: "cruel_daggers"
  },
  {
    stage: 25,
    name: "공부 회피의 유혹귀, 딴짓마",
    sub: "Distraction Siren",
    zone: 3,
    bgGrad: ["#4a044e", "#09090b"],
    auraColor: "#d946ef",
    eyeColor: "#f0abfc",
    horns: "spiral_horns",
    headType: "hypnotic_siren",
    features: "chromatic_wings",
    weapon: "venom_talons"
  },
  {
    stage: 26,
    name: "수면제 같은 교과서, 슬리퍼",
    sub: "Soporific Tome",
    zone: 3,
    bgGrad: ["#1c1917", "#090d16"],
    auraColor: "#854d0e",
    eyeColor: "#fde047",
    horns: "tome_crest",
    headType: "cursed_grimoire",
    features: "fanged_pages",
    weapon: "sleep_spores"
  },
  {
    stage: 27,
    name: "시간 낭비의 도둑, 타임시프",
    sub: "Time Stealer",
    zone: 3,
    bgGrad: ["#0f172a", "#020617"],
    auraColor: "#38bdf8",
    eyeColor: "#7dd3fc",
    horns: "pendulum_horns",
    headType: "clock_stalker",
    features: "ticking_gears",
    weapon: "razor_pendulums"
  },
  {
    stage: 28,
    name: "의지력 박탈의 악마, 에디션",
    sub: "Willpower Eater",
    zone: 3,
    bgGrad: ["#1e1b4b", "#090d16"],
    auraColor: "#9333ea",
    eyeColor: "#c084fc",
    horns: "demon_horns",
    headType: "void_fiend",
    features: "gaping_void_jaw",
    weapon: "soul_drainer"
  },
  {
    stage: 29,
    name: "자기합리화의 요마, 핑계귀",
    sub: "Excuse Fiend",
    zone: 3,
    bgGrad: ["#064e3b", "#09090b"],
    auraColor: "#10b981",
    eyeColor: "#6ee7b7",
    horns: "serpent_horns",
    headType: "hydra_trickster",
    features: "multiple_tongues",
    weapon: "venomous_fangs"
  },
  {
    stage: 30,
    name: "무기력의 심연룡, 아비스",
    sub: "Dragon of Despair",
    zone: 3,
    bgGrad: ["#2e1065", "#030712"],
    auraColor: "#c084fc",
    eyeColor: "#f43f5e",
    horns: "abyss_dragon_horns",
    headType: "zone3_boss",
    features: "dragon_wings_flames",
    weapon: "black_flame_breath"
  },

  // Zone 4: Genetics & Frozen Prejudice (Stages 31~40) - Extremely menacing, glacial frost dread & skeleton kings
  {
    stage: 31,
    name: "유전 탓의 원령, 헤레디티",
    sub: "Heredity Wraith",
    zone: 4,
    bgGrad: ["#083344", "#090d16"],
    auraColor: "#06b6d4",
    eyeColor: "#67e8f9",
    horns: "helix_horns",
    headType: "dna_wraith",
    features: "broken_chromosomes",
    weapon: "chain_of_genes"
  },
  {
    stage: 32,
    name: "늦깎이 절망마, 레이트블루머",
    sub: "Late Bloomer Denier",
    zone: 4,
    bgGrad: ["#1c1917", "#09090b"],
    auraColor: "#78716c",
    eyeColor: "#ef4444",
    horns: "decay_branches",
    headType: "withered_gargoyle",
    features: "rotting_tree_plate",
    weapon: "decay_claws"
  },
  {
    stage: 33,
    name: "불규칙 식습관의 괴수, 말뉴트리션",
    sub: "Malnutrition Behemoth",
    zone: 4,
    bgGrad: ["#3f2c00", "#090d16"],
    auraColor: "#ca8a04",
    eyeColor: "#fef08a",
    horns: "starved_spikes",
    headType: "skeletal_behemoth",
    features: "hollow_ribs",
    weapon: "acid_jaw_blades"
  },
  {
    stage: 34,
    name: "골격 동결의 마녀, 본프리즈",
    sub: "Bone Freeze Witch",
    zone: 4,
    bgGrad: ["#0c4a6e", "#030712"],
    auraColor: "#38bdf8",
    eyeColor: "#bae6fd",
    horns: "glacier_horns",
    headType: "frost_sorceress",
    features: "ice_crystals",
    weapon: "freeze_staff"
  },
  {
    stage: 35,
    name: "수면 장애의 몽마, 나이트메어",
    sub: "Nightmare Incubus",
    zone: 4,
    bgGrad: ["#1e1b4b", "#090d16"],
    auraColor: "#6366f1",
    eyeColor: "#38bdf8",
    horns: "burning_azure_horns",
    headType: "shadow_incubus",
    features: "colossal_bat_wings",
    weapon: "nightmare_talons"
  },
  {
    stage: 36,
    name: "의지력 영하의 빙룡, 프로스트팽",
    sub: "Frostfang Wyrm",
    zone: 4,
    bgGrad: ["#0369a1", "#020617"],
    auraColor: "#0284c7",
    eyeColor: "#e0f2fe",
    horns: "crystal_wyrm_horns",
    headType: "frost_wyrm",
    features: "diamond_fangs",
    weapon: "blizzard_breath"
  },
  {
    stage: 37,
    name: "자세 왜곡의 골렘, 스콜리오",
    sub: "Scoliosis Golem",
    zone: 4,
    bgGrad: ["#1e293b", "#09090b"],
    auraColor: "#94a3b8",
    eyeColor: "#dc2626",
    horns: "jagged_marble_spikes",
    headType: "asymmetrical_golem",
    features: "twisted_torso",
    weapon: "heavy_marble_fists"
  },
  {
    stage: 38,
    name: "성장 호르몬 차단마, 소마토블록",
    sub: "Somato Blocker",
    zone: 4,
    bgGrad: ["#18181b", "#090d16"],
    auraColor: "#a1a1aa",
    eyeColor: "#fbbf24",
    horns: "iron_bulwark_crest",
    headType: "dark_inquisitor",
    features: "barricade_shields",
    weapon: "blocking_talismans"
  },
  {
    stage: 39,
    name: "한계 조롱의 악귀, 모커리",
    sub: "Mockery Demon",
    zone: 4,
    bgGrad: ["#4c0519", "#090d16"],
    auraColor: "#f43f5e",
    eyeColor: "#fda4af",
    horns: "jester_horns",
    headType: "mockery_jester",
    features: "floating_laughter_masks",
    weapon: "blood_needles"
  },
  {
    stage: 40,
    name: "절망의 골격 군주, 스켈레톤 킹",
    sub: "Skeleton Sovereign",
    zone: 4,
    bgGrad: ["#0f172a", "#020617"],
    auraColor: "#38bdf8",
    eyeColor: "#e0f2fe",
    horns: "crown_of_skulls",
    headType: "zone4_boss",
    features: "ribcage_mantle",
    weapon: "frostmourne_blade"
  },

  // Zone 5: Mythic Temple of Transcendence (Stages 41~50) - God-tier, divine golden archangels, colossal titans, apex overlords
  {
    stage: 41,
    name: "한계 돌파의 수문장, 게이트키퍼",
    sub: "Apex Gatekeeper",
    zone: 5,
    bgGrad: ["#451a03", "#090d16"],
    auraColor: "#f59e0b",
    eyeColor: "#fef08a",
    horns: "golden_crest",
    headType: "colossus_guardian",
    features: "sunburst_shield",
    weapon: "radiant_lance"
  },
  {
    stage: 42,
    name: "황금 비율의 심판관, 프로포션",
    sub: "Judge of Proportion",
    zone: 5,
    bgGrad: ["#713f12", "#09090b"],
    auraColor: "#eab308",
    eyeColor: "#ffffff",
    horns: "halo_crown",
    headType: "seraph_judge",
    features: "six_golden_wings",
    weapon: "scales_of_destiny"
  },
  {
    stage: 43,
    name: "성장호르몬의 폭풍령, 소마토스톰",
    sub: "Somato Storm",
    zone: 5,
    bgGrad: ["#78350f", "#030712"],
    auraColor: "#f59e0b",
    eyeColor: "#38bdf8",
    horns: "lightning_horns",
    headType: "storm_elemental",
    features: "golden_lightning_aura",
    weapon: "thunder_cyclone"
  },
  {
    stage: 44,
    name: "백절불굴의 투신, 인빅터스",
    sub: "Invictus Fighter",
    zone: 5,
    bgGrad: ["#7f1d1d", "#090d16"],
    auraColor: "#ef4444",
    eyeColor: "#fbbf24",
    horns: "battle_spartan_crest",
    headType: "invictus_champion",
    features: "flaming_pauldrons",
    weapon: "dual_greatswords"
  },
  {
    stage: 45,
    name: "척추 기립의 대천사, 버티컬",
    sub: "Archangel Vertical",
    zone: 5,
    bgGrad: ["#854d0e", "#020617"],
    auraColor: "#fbbf24",
    eyeColor: "#ffffff",
    horns: "archangel_wings",
    headType: "vertical_archangel",
    features: "radiant_light_pillar",
    weapon: "sword_of_apex"
  },
  {
    stage: 46,
    name: "도약의 절대 지배자, 에어본",
    sub: "Airborne Sovereign",
    zone: 5,
    bgGrad: ["#075985", "#090d16"],
    auraColor: "#0284c7",
    eyeColor: "#fde047",
    horns: "feather_laurel",
    headType: "falcon_deity",
    features: "thunder_falcon_wings",
    weapon: "cloud_javelins"
  },
  {
    stage: 47,
    name: "175cm의 관문 수호신, 센티넬",
    sub: "175cm Sentinel",
    zone: 5,
    bgGrad: ["#1e3a8a", "#09090b"],
    auraColor: "#3b82f6",
    eyeColor: "#93c5fd",
    horns: "mithril_battlements",
    headType: "mithril_fortress",
    features: "glowing_sapphire_core",
    weapon: "colossal_ramparts"
  },
  {
    stage: 48,
    name: "177cm의 환영 군주, 팬텀미라지",
    sub: "177cm Mirage Lord",
    zone: 5,
    bgGrad: ["#581c87", "#030712"],
    auraColor: "#a855f7",
    eyeColor: "#f472b6",
    horns: "dimensional_crown",
    headType: "mirage_emperor",
    features: "infinite_reflections",
    weapon: "mirror_blades"
  },
  {
    stage: 49,
    name: "황금 신장의 수호신, 에이펙스",
    sub: "Apex Guardian",
    zone: 5,
    bgGrad: ["#78350f", "#090d16"],
    auraColor: "#f59e0b",
    eyeColor: "#ffffff",
    horns: "solar_crown",
    headType: "solar_titan",
    features: "cosmic_sunburst_aura",
    weapon: "sun_lance"
  },
  {
    stage: 50,
    name: "한계의 절대군주, 크로노스",
    sub: "Supreme Overlord Chronos",
    zone: 5,
    bgGrad: ["#451a03", "#020617"],
    auraColor: "#fbbf24",
    eyeColor: "#ef4444",
    horns: "supreme_emperor_crown",
    headType: "zone5_boss",
    features: "cosmic_hourglass_wings",
    weapon: "blade_of_eternity"
  }
];

// Helper to generate the SVG markup for a given boss definition
function generateBossSVG(b) {
  const z = b.zone;
  const isApex = (b.stage % 10 === 0);

  // Character body scale: escalates from 0.75 (stage 1) to 1.15 (stage 50)
  const scale = 0.75 + (b.stage / 50) * 0.40;
  const strokeWidth = 2 + (b.stage > 30 ? 1 : 0);

  // SVG Head / Helmet paths according to zone and headType
  let headPath = '';
  let hornsMarkup = '';
  let eyesMarkup = '';
  let chestArmorMarkup = '';
  let weaponMarkup = '';
  let wingsOrAuraMarkup = '';

  // 1. Wings / Aura Backdrops (escalates heavily per zone)
  if (z === 1) {
    // Sloth & Dopamine: Swirling hypnotic circles, droopy smoke, phone screen glow
    wingsOrAuraMarkup = `
      <circle cx="200" cy="180" r="110" fill="none" stroke="${b.auraColor}" stroke-width="2" stroke-dasharray="8 6" opacity="0.35"/>
      <circle cx="200" cy="180" r="85" fill="none" stroke="${b.auraColor}" stroke-width="1.5" opacity="0.25"/>
      <ellipse cx="200" cy="190" rx="90" ry="100" fill="${b.auraColor}" opacity="0.08" filter="url(#glow)"/>
    `;
  } else if (z === 2) {
    // Gravity: Jagged cracked stone aura, rock spikes, floating boulders
    wingsOrAuraMarkup = `
      <polygon points="200,40 230,120 210,130 190,130 170,120" fill="#334155" stroke="${b.auraColor}" stroke-width="2"/>
      <polygon points="110,90 140,150 120,160 100,140" fill="#1e293b" stroke="${b.auraColor}" stroke-width="1.5"/>
      <polygon points="290,90 300,140 280,160 260,150" fill="#1e293b" stroke="${b.auraColor}" stroke-width="1.5"/>
      <circle cx="200" cy="180" r="120" fill="none" stroke="${b.auraColor}" stroke-width="3" stroke-dasharray="12 8" opacity="0.45"/>
      <ellipse cx="200" cy="190" rx="100" ry="110" fill="${b.auraColor}" opacity="0.12" filter="url(#glow)"/>
    `;
  } else if (z === 3) {
    // Burnout & Nightmares: Jagged demonic bat wings, purple flames, despair mist
    wingsOrAuraMarkup = `
      <path d="M 200,160 Q 120,80 60,110 Q 90,170 120,180 Q 70,200 90,240 Q 150,210 200,200 Z" fill="#1e1035" stroke="${b.auraColor}" stroke-width="2" opacity="0.85"/>
      <path d="M 200,160 Q 280,80 340,110 Q 310,170 280,180 Q 330,200 310,240 Q 250,210 200,200 Z" fill="#1e1035" stroke="${b.auraColor}" stroke-width="2" opacity="0.85"/>
      <circle cx="200" cy="175" r="130" fill="none" stroke="${b.auraColor}" stroke-width="2.5" stroke-dasharray="16 6" opacity="0.5"/>
      <ellipse cx="200" cy="185" rx="115" ry="120" fill="${b.auraColor}" opacity="0.16" filter="url(#glow)"/>
    `;
  } else if (z === 4) {
    // Frozen Wall & Skeleton Kings: Colossal icy bone wings, frost crystals
    wingsOrAuraMarkup = `
      <path d="M 200,150 L 80,70 L 110,130 L 50,150 L 120,180 L 70,220 L 180,210 Z" fill="#0c2340" stroke="${b.auraColor}" stroke-width="2" opacity="0.9"/>
      <path d="M 200,150 L 320,70 L 290,130 L 350,150 L 280,180 L 330,220 L 220,210 Z" fill="#0c2340" stroke="${b.auraColor}" stroke-width="2" opacity="0.9"/>
      <polygon points="200,30 215,80 200,75 185,80" fill="#38bdf8" opacity="0.75"/>
      <circle cx="200" cy="175" r="140" fill="none" stroke="${b.auraColor}" stroke-width="3" stroke-dasharray="20 8" opacity="0.6"/>
      <ellipse cx="200" cy="180" rx="125" ry="125" fill="${b.auraColor}" opacity="0.20" filter="url(#glow)"/>
    `;
  } else if (z === 5) {
    // Mythic Temple of Transcendence: Multi-layered golden seraphic wings, divine halo, sun rays
    wingsOrAuraMarkup = `
      <circle cx="200" cy="155" r="95" fill="none" stroke="#fbbf24" stroke-width="4" filter="url(#glow)" opacity="0.8"/>
      <circle cx="200" cy="155" r="135" fill="none" stroke="${b.auraColor}" stroke-width="2" stroke-dasharray="14 6" opacity="0.7"/>
      <!-- Upper Great Wings -->
      <path d="M 200,150 Q 110,40 30,70 Q 70,140 110,165 Q 40,190 70,240 Q 140,205 200,190 Z" fill="url(#wingGrad)" stroke="#fbbf24" stroke-width="2.5" opacity="0.9"/>
      <path d="M 200,150 Q 290,40 370,70 Q 330,140 290,165 Q 360,190 330,240 Q 260,205 200,190 Z" fill="url(#wingGrad)" stroke="#fbbf24" stroke-width="2.5" opacity="0.9"/>
      <!-- Lower Secondary Wings -->
      <path d="M 200,190 Q 120,200 70,270 Q 120,280 160,260 Z" fill="url(#wingGrad)" stroke="#fbbf24" stroke-width="1.5" opacity="0.75"/>
      <path d="M 200,190 Q 280,200 330,270 Q 280,280 240,260 Z" fill="url(#wingGrad)" stroke="#fbbf24" stroke-width="1.5" opacity="0.75"/>
      <ellipse cx="200" cy="175" rx="140" ry="140" fill="${b.auraColor}" opacity="0.25" filter="url(#glow)"/>
    `;
  }

  // 2. Horns & Head Crests
  if (b.horns === 'none' || b.horns === 'ragged_hood') {
    hornsMarkup = '';
  } else if (b.horns === 'antennae') {
    hornsMarkup = `
      <line x1="185" y1="125" x2="165" y2="80" stroke="${b.auraColor}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="165" cy="80" r="5" fill="${b.eyeColor}" filter="url(#glow)"/>
      <line x1="215" y1="125" x2="235" y2="80" stroke="${b.auraColor}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="235" cy="80" r="5" fill="${b.eyeColor}" filter="url(#glow)"/>
    `;
  } else if (b.horns === 'short_horns' || b.horns === 'lizard_horns') {
    hornsMarkup = `
      <path d="M 175,130 Q 155,95 145,100 Q 165,120 175,135 Z" fill="#334155" stroke="${b.auraColor}" stroke-width="1.5"/>
      <path d="M 225,130 Q 245,95 255,100 Q 235,120 225,135 Z" fill="#334155" stroke="${b.auraColor}" stroke-width="1.5"/>
    `;
  } else if (b.horns === 'spine_spikes' || b.horns === 'basalt_horns') {
    hornsMarkup = `
      <polygon points="170,125 150,70 180,115" fill="#1e293b" stroke="${b.auraColor}" stroke-width="2"/>
      <polygon points="230,125 250,70 220,115" fill="#1e293b" stroke="${b.auraColor}" stroke-width="2"/>
      <polygon points="200,105 200,55 205,105" fill="#334155" stroke="${b.auraColor}" stroke-width="1.5"/>
    `;
  } else if (b.horns === 'demon_horns' || b.horns === 'abyss_dragon_horns' || b.horns === 'crystal_horns') {
    hornsMarkup = `
      <path d="M 170,135 Q 130,90 110,105 Q 140,130 170,145 Z" fill="#0f172a" stroke="${b.auraColor}" stroke-width="2.5" filter="url(#glow)"/>
      <path d="M 230,135 Q 270,90 290,105 Q 260,130 230,145 Z" fill="#0f172a" stroke="${b.auraColor}" stroke-width="2.5" filter="url(#glow)"/>
    `;
  } else if (b.horns === 'crown_of_skulls' || b.horns === 'gravity_crown' || b.horns === 'supreme_emperor_crown' || b.horns === 'solar_crown') {
    hornsMarkup = `
      <!-- Imperial / Sovereign Crown -->
      <polygon points="160,130 155,75 175,110 200,60 225,110 245,75 240,130" fill="url(#goldArmorGrad)" stroke="${b.auraColor}" stroke-width="2.5" filter="url(#glow)"/>
      <circle cx="200" cy="72" r="4" fill="${b.eyeColor}" filter="url(#glow)"/>
      <circle cx="155" cy="85" r="3" fill="${b.eyeColor}"/>
      <circle cx="245" cy="85" r="3" fill="${b.eyeColor}"/>
    `;
  } else {
    // Default majestic battle crest
    hornsMarkup = `
      <polygon points="175,130 160,85 185,115" fill="#1e293b" stroke="${b.auraColor}" stroke-width="2"/>
      <polygon points="225,130 240,85 215,115" fill="#1e293b" stroke="${b.auraColor}" stroke-width="2"/>
    `;
  }

  // 3. Head & Face Mask (progression from cute/sluggish to terrifying skull/inquisitor to divine emperor)
  if (z === 1) {
    headPath = `
      <!-- Zone 1 Sloth/Dopamine Head -->
      <ellipse cx="200" cy="155" rx="38" ry="34" fill="#1e293b" stroke="${b.auraColor}" stroke-width="${strokeWidth}"/>
      <!-- Drooping mouth or sneaky grin -->
      <path d="M 188,172 Q 200,168 212,172" fill="none" stroke="${b.auraColor}" stroke-width="2" stroke-linecap="round"/>
    `;
  } else if (z === 2) {
    headPath = `
      <!-- Zone 2 Heavy Stone / Iron Mask Head -->
      <polygon points="170,135 200,120 230,135 225,180 200,195 175,180" fill="#0f172a" stroke="${b.auraColor}" stroke-width="${strokeWidth + 0.5}"/>
      <!-- Jaw slits -->
      <line x1="185" y1="180" x2="215" y2="180" stroke="${b.auraColor}" stroke-width="2"/>
      <line x1="190" y1="186" x2="210" y2="186" stroke="${b.auraColor}" stroke-width="1.5"/>
    `;
  } else if (z === 3) {
    headPath = `
      <!-- Zone 3 Terrifying Skull Reaper Face -->
      <path d="M 168,135 Q 200,115 232,135 Q 235,170 220,188 L 210,198 L 190,198 L 180,188 Q 165,170 168,135 Z" fill="#0a0518" stroke="${b.auraColor}" stroke-width="${strokeWidth + 1}"/>
      <!-- Sharp fangs / grimace -->
      <polygon points="188,185 192,193 196,185 200,193 204,185 208,193 212,185" fill="${b.auraColor}"/>
    `;
  } else if (z === 4) {
    headPath = `
      <!-- Zone 4 Glacial Skull King / Bone Inquisitor Face -->
      <polygon points="165,130 200,110 235,130 230,175 212,198 188,198 170,175" fill="#09182a" stroke="${b.auraColor}" stroke-width="${strokeWidth + 1}"/>
      <!-- Bone nasal cavity -->
      <polygon points="200,165 196,174 204,174" fill="${b.auraColor}"/>
      <!-- Freezing teeth -->
      <line x1="182" y1="184" x2="218" y2="184" stroke="${b.auraColor}" stroke-width="2"/>
      <line x1="188" y1="180" x2="188" y2="188" stroke="${b.auraColor}" stroke-width="1.5"/>
      <line x1="200" y1="180" x2="200" y2="188" stroke="${b.auraColor}" stroke-width="1.5"/>
      <line x1="212" y1="180" x2="212" y2="188" stroke="${b.auraColor}" stroke-width="1.5"/>
    `;
  } else if (z === 5) {
    headPath = `
      <!-- Zone 5 Majestic Divine Titan / Seraph Helmet -->
      <polygon points="162,128 200,105 238,128 232,175 212,200 188,200 168,175" fill="url(#goldArmorGrad)" stroke="#fbbf24" stroke-width="${strokeWidth + 1}" filter="url(#glow)"/>
      <!-- Holy forehead gem -->
      <polygon points="200,118 205,128 200,138 195,128" fill="#ef4444" filter="url(#glow)"/>
      <!-- Imperial mouthplate -->
      <polygon points="186,178 200,174 214,178 208,192 192,192" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.5"/>
    `;
  }

  // 4. Glowing Demonic / Mythic Eyes
  if (z === 1) {
    // Round or droopy eyes
    eyesMarkup = `
      <ellipse cx="187" cy="150" rx="8" ry="6" fill="#050811" stroke="${b.eyeColor}" stroke-width="2"/>
      <circle cx="187" cy="150" r="3" fill="${b.eyeColor}" filter="url(#glow)"/>
      <ellipse cx="213" cy="150" rx="8" ry="6" fill="#050811" stroke="${b.eyeColor}" stroke-width="2"/>
      <circle cx="213" cy="150" r="3" fill="${b.eyeColor}" filter="url(#glow)"/>
    `;
  } else if (z === 2) {
    // Sharp slit fierce bloody eyes
    eyesMarkup = `
      <polygon points="180,150 196,155 184,158" fill="${b.eyeColor}" filter="url(#glow)"/>
      <polygon points="220,150 204,155 216,158" fill="${b.eyeColor}" filter="url(#glow)"/>
    `;
  } else if (z === 3) {
    // Flaming terrifying hollow sockets with bright core
    eyesMarkup = `
      <polygon points="178,145 198,154 182,160" fill="${b.eyeColor}" filter="url(#glow)"/>
      <circle cx="188" cy="153" r="3" fill="#ffffff" filter="url(#glow)"/>
      <polygon points="222,145 202,154 218,160" fill="${b.eyeColor}" filter="url(#glow)"/>
      <circle cx="212" cy="153" r="3" fill="#ffffff" filter="url(#glow)"/>
    `;
  } else if (z === 4) {
    // Freezing piercing icy diamond eyes
    eyesMarkup = `
      <polygon points="180,146 196,146 192,156 182,156" fill="${b.eyeColor}" filter="url(#glow)"/>
      <circle cx="188" cy="151" r="2.5" fill="#ffffff"/>
      <polygon points="220,146 204,146 208,156 218,156" fill="${b.eyeColor}" filter="url(#glow)"/>
      <circle cx="212" cy="151" r="2.5" fill="#ffffff"/>
    `;
  } else if (z === 5) {
    // Blinding divine blazing eyes
    eyesMarkup = `
      <polygon points="176,144 198,152 184,158" fill="#ffffff" filter="url(#glow)"/>
      <polygon points="224,144 202,152 216,158" fill="#ffffff" filter="url(#glow)"/>
      <line x1="170" y1="140" x2="200" y2="152" stroke="#fbbf24" stroke-width="2" filter="url(#glow)"/>
      <line x1="230" y1="140" x2="200" y2="152" stroke="#fbbf24" stroke-width="2" filter="url(#glow)"/>
    `;
  }

  // 5. Chest & Torso Armor
  if (z === 1) {
    chestArmorMarkup = `
      <!-- Zone 1 Slouching Torso -->
      <path d="M 160,195 Q 200,185 240,195 L 255,290 Q 200,310 145,290 Z" fill="#1e293b" stroke="${b.auraColor}" stroke-width="${strokeWidth}"/>
      <!-- Center emblem -->
      <circle cx="200" cy="235" r="14" fill="#0f172a" stroke="${b.auraColor}" stroke-width="2"/>
      <path d="M 194,235 L 206,235 M 200,229 L 200,241" stroke="${b.eyeColor}" stroke-width="2.5"/>
    `;
  } else if (z === 2) {
    chestArmorMarkup = `
      <!-- Zone 2 Heavy Spiked Breastplate -->
      <polygon points="145,195 200,190 255,195 265,295 200,315 135,295" fill="#1c1917" stroke="${b.auraColor}" stroke-width="${strokeWidth + 0.5}"/>
      <!-- Rib plating -->
      <path d="M 160,225 L 200,235 L 240,225" fill="none" stroke="${b.auraColor}" stroke-width="2.5"/>
      <path d="M 165,250 L 200,260 L 235,250" fill="none" stroke="${b.auraColor}" stroke-width="2"/>
      <path d="M 175,275 L 200,282 L 225,275" fill="none" stroke="${b.auraColor}" stroke-width="1.5"/>
    `;
  } else if (z === 3) {
    chestArmorMarkup = `
      <!-- Zone 3 Dark Reaper Carapace -->
      <polygon points="140,195 200,185 260,195 270,305 200,325 130,305" fill="#090414" stroke="${b.auraColor}" stroke-width="${strokeWidth + 1}"/>
      <!-- Glowing core -->
      <polygon points="200,215 215,235 200,255 185,235" fill="${b.eyeColor}" filter="url(#glow)"/>
      <line x1="200" y1="255" x2="200" y2="310" stroke="${b.auraColor}" stroke-width="2"/>
    `;
  } else if (z === 4) {
    chestArmorMarkup = `
      <!-- Zone 4 Glacial Skeletal Plate -->
      <polygon points="135,190 200,180 265,190 275,310 200,330 125,310" fill="#0a192f" stroke="${b.auraColor}" stroke-width="${strokeWidth + 1}"/>
      <!-- Bone ribs -->
      <path d="M 150,215 Q 200,230 250,215" fill="none" stroke="#f8fafc" stroke-width="3"/>
      <path d="M 155,240 Q 200,255 245,240" fill="none" stroke="#f8fafc" stroke-width="3"/>
      <path d="M 165,265 Q 200,278 235,265" fill="none" stroke="#f8fafc" stroke-width="2.5"/>
      <circle cx="200" cy="245" r="12" fill="#38bdf8" filter="url(#glow)"/>
    `;
  } else if (z === 5) {
    chestArmorMarkup = `
      <!-- Zone 5 Supreme Sun God Cuirass -->
      <polygon points="130,185 200,175 270,185 280,315 200,340 120,315" fill="url(#goldArmorGrad)" stroke="#fbbf24" stroke-width="${strokeWidth + 1.5}" filter="url(#glow)"/>
      <!-- Sunburst core -->
      <circle cx="200" cy="240" r="18" fill="#ef4444" stroke="#fbbf24" stroke-width="3" filter="url(#glow)"/>
      <line x1="200" y1="210" x2="200" y2="270" stroke="#fde047" stroke-width="2.5"/>
      <line x1="170" y1="240" x2="230" y2="240" stroke="#fde047" stroke-width="2.5"/>
      <line x1="180" y1="220" x2="220" y2="260" stroke="#fde047" stroke-width="1.5"/>
      <line x1="220" y1="220" x2="180" y2="260" stroke="#fde047" stroke-width="1.5"/>
    `;
  }

  // 6. Right-hand Weapon / Relic
  if (b.weapon === 'phone') {
    weaponMarkup = `
      <!-- Glowing Smartphone -->
      <rect x="260" y="190" width="30" height="52" rx="4" fill="#030712" stroke="${b.auraColor}" stroke-width="2"/>
      <rect x="264" y="196" width="22" height="40" rx="2" fill="${b.eyeColor}" filter="url(#glow)"/>
    `;
  } else if (b.weapon === 'blood_scythe' || b.weapon === 'chipped_dagger') {
    weaponMarkup = `
      <!-- Death Scythe -->
      <line x1="260" y1="90" x2="290" y2="320" stroke="#475569" stroke-width="4"/>
      <path d="M 260,90 Q 340,60 350,130 Q 310,110 260,115 Z" fill="${b.auraColor}" stroke="${b.eyeColor}" stroke-width="2" filter="url(#glow)"/>
    `;
  } else if (b.weapon === 'frostmourne_blade' || b.weapon === 'executioner_greatsword') {
    weaponMarkup = `
      <!-- Massive 2H Runeblade -->
      <line x1="280" y1="80" x2="295" y2="330" stroke="#94a3b8" stroke-width="6"/>
      <polygon points="275,80 295,40 315,80 305,260 285,260" fill="url(#bladeGrad)" stroke="${b.auraColor}" stroke-width="2.5" filter="url(#glow)"/>
      <line x1="270" y1="260" x2="320" y2="260" stroke="${b.auraColor}" stroke-width="4"/>
    `;
  } else if (b.weapon === 'blade_of_eternity' || b.weapon === 'sun_lance' || b.weapon === 'radiant_lance') {
    weaponMarkup = `
      <!-- Supreme Celestial God Spear/Blade -->
      <line x1="290" y1="40" x2="310" y2="340" stroke="#fbbf24" stroke-width="5" filter="url(#glow)"/>
      <polygon points="280,60 300,10 320,60 300,120" fill="#fde047" stroke="#ffffff" stroke-width="2" filter="url(#glow)"/>
      <circle cx="300" cy="80" r="8" fill="#ef4444" filter="url(#glow)"/>
    `;
  } else if (b.weapon === 'bone_sledgehammer' || b.weapon === 'spinal_club' || b.weapon === 'stone_fists') {
    weaponMarkup = `
      <!-- Heavy Bone Crusher Hammer / Mace -->
      <line x1="270" y1="120" x2="290" y2="320" stroke="#334155" stroke-width="6"/>
      <rect x="250" y="90" width="50" height="35" rx="4" fill="#1e293b" stroke="${b.auraColor}" stroke-width="3"/>
      <polygon points="245,100 240,107 245,115" fill="${b.auraColor}"/>
      <polygon points="305,100 310,107 305,115" fill="${b.auraColor}"/>
    `;
  }

  // Construct Full SVG Content
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="${b.bgGrad[0]}"/>
      <stop offset="100%" stop-color="${b.bgGrad[1]}"/>
    </radialGradient>

    <!-- Golden Armor Gradient -->
    <linearGradient id="goldArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>

    <!-- Celestial Wing Gradient -->
    <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#451a03" stop-opacity="0.95"/>
    </linearGradient>

    <!-- Runeblade Gradient -->
    <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="50%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#082f49"/>
    </linearGradient>

    <!-- Neon Glow Filter -->
    <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Drop Shadow Filter -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.75"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="400" height="400" fill="url(#bgGrad)"/>

  <!-- Zone Pattern & Vignette Ring -->
  <circle cx="200" cy="180" r="170" fill="none" stroke="${b.auraColor}" stroke-width="1" opacity="0.15"/>
  <circle cx="200" cy="180" r="150" fill="none" stroke="${b.auraColor}" stroke-width="1.5" stroke-dasharray="4 8" opacity="0.25"/>

  <!-- Wings / Aura / Background FX -->
  <g id="auraWings" filter="url(#shadow)">
    ${wingsOrAuraMarkup}
  </g>

  <!-- Character Group Scaled and Centered -->
  <g id="character" transform="translate(${200 * (1 - scale)}, ${180 * (1 - scale)}) scale(${scale})" filter="url(#shadow)">
    <!-- Horns / Crests -->
    <g id="horns">
      ${hornsMarkup}
    </g>

    <!-- Torso & Armor -->
    <g id="torso">
      ${chestArmorMarkup}
    </g>

    <!-- Head & Mask -->
    <g id="head">
      ${headPath}
    </g>

    <!-- Glowing Eyes -->
    <g id="eyes">
      ${eyesMarkup}
    </g>

    <!-- Weapon / Relic -->
    <g id="weapon">
      ${weaponMarkup}
    </g>
  </g>

  <!-- Stage Badge & Tier Banner Overlay -->
  <g id="stageBadge" transform="translate(16, 16)">
    <rect width="90" height="26" rx="13" fill="#090d16" stroke="${b.auraColor}" stroke-width="1.5"/>
    <text x="45" y="18" fill="${b.eyeColor}" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="1">
      STAGE ${b.stage}
    </text>
  </g>

  <g id="zoneBadge" transform="translate(290, 16)">
    <rect width="94" height="26" rx="6" fill="#090d16" stroke="#475569" stroke-width="1"/>
    <text x="337" y="17" fill="#94a3b8" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">
      Zone ${b.zone} ${isApex ? '👑' : ''}
    </text>
  </g>

  <!-- Bottom Name Banner -->
  <g id="nameBanner" transform="translate(0, 340)">
    <rect width="400" height="60" fill="#090d16" opacity="0.88"/>
    <line x1="0" y1="0" x2="400" y2="0" stroke="${b.auraColor}" stroke-width="2" opacity="0.6"/>
    <text x="200" y="26" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">
      ${b.name}
    </text>
    <text x="200" y="46" fill="${b.eyeColor}" font-family="sans-serif" font-size="11" font-weight="600" text-anchor="middle" opacity="0.9">
      ${b.sub}
    </text>
  </g>
</svg>`;
}

// Generate all 50 SVGs
let count = 0;
BOSS_VISUAL_DEFS.forEach(b => {
  const svgContent = generateBossSVG(b);
  const filePath = path.join(outputDir, `boss_${b.stage}.svg`);
  fs.writeFileSync(filePath, svgContent, 'utf8');
  count++;
});

console.log(`Successfully generated ${count} unique boss SVGs in ${outputDir}!`);
