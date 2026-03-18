// ===== 돌아와 도토리정원 — 레시피 & 크래프팅 데이터 =====

// 기본 재료 (채집으로 획득)
export const MATERIALS = {
  wood:   { emoji: '🪵', name: '나무' },
  stone:  { emoji: '🪨', name: '돌' },
  herb:   { emoji: '🌿', name: '풀' },
  iron:   { emoji: '⚙️', name: '철' },
  clay:   { emoji: '🟤', name: '점토' },
  flower: { emoji: '🌸', name: '꽃' },
  gem:    { emoji: '💎', name: '보석' },
  gold:   { emoji: '✨', name: '황금조각' },
  silk:   { emoji: '🧵', name: '실크' },
  paint:  { emoji: '🎨', name: '물감' },
  fish:   { emoji: '🐟', name: '물고기' },
  food:   { emoji: '🍞', name: '빵' },
  fruit:  { emoji: '🍎', name: '과일' },
  milk:   { emoji: '🥛', name: '우유' },
  egg:    { emoji: '🥚', name: '달걀' },
  sugar:  { emoji: '🍬', name: '설탕' },
};

// 레시피 카테고리
export const RECIPE_CATEGORIES = {
  furniture: '가구',
  wall: '벽지/바닥',
  garden: '가든 건물',
  accessory: '장식품',
  food: '요리',
  special: '특별 아이템',
};

// ===== 가구 레시피 =====
export const FURNITURE_RECIPES = [
  // 기본 가구 (쉬움)
  { id: 'bed', emoji: '🛏️', name: '침대', category: 'furniture', materials: { wood: 4, silk: 2 }, rarity: 'common', description: '편안한 나무 침대' },
  { id: 'desk', emoji: '🪑', name: '책상', category: 'furniture', materials: { wood: 3, iron: 1 }, rarity: 'common', description: '튼튼한 나무 책상' },
  { id: 'lamp', emoji: '💡', name: '조명', category: 'furniture', materials: { iron: 2, gem: 1 }, rarity: 'common', description: '따뜻한 조명' },
  { id: 'plant', emoji: '🪴', name: '화분', category: 'furniture', materials: { clay: 2, flower: 1 }, rarity: 'common', description: '예쁜 화분' },
  { id: 'rug', emoji: '🟫', name: '러그', category: 'furniture', materials: { silk: 3, paint: 1 }, rarity: 'common', description: '푹신한 러그' },

  // 중급 가구
  { id: 'bookshelf', emoji: '📚', name: '책장', category: 'furniture', materials: { wood: 6, iron: 2 }, rarity: 'uncommon', description: '멋진 책장' },
  { id: 'sofa', emoji: '🛋️', name: '소파', category: 'furniture', materials: { wood: 4, silk: 4, paint: 1 }, rarity: 'uncommon', description: '편안한 소파' },
  { id: 'tv', emoji: '📺', name: 'TV', category: 'furniture', materials: { iron: 4, gem: 2 }, rarity: 'uncommon', description: '큰 화면 TV' },
  { id: 'clock', emoji: '🕰️', name: '벽시계', category: 'furniture', materials: { wood: 2, iron: 3, gem: 1 }, rarity: 'uncommon', description: '클래식 벽시계' },
  { id: 'guitar', emoji: '🎸', name: '기타', category: 'furniture', materials: { wood: 5, silk: 2, iron: 1 }, rarity: 'uncommon', description: '어쿠스틱 기타' },

  // 고급 가구
  { id: 'piano', emoji: '🎹', name: '피아노', category: 'furniture', materials: { wood: 8, iron: 4, silk: 2, gem: 1 }, rarity: 'rare', description: '그랜드 피아노' },
  { id: 'aquarium', emoji: '🐠', name: '수족관', category: 'furniture', materials: { gem: 4, iron: 3, stone: 3 }, rarity: 'rare', description: '열대어 수족관' },
  { id: 'chandelier', emoji: '🪔', name: '샹들리에', category: 'furniture', materials: { gold: 3, gem: 5, iron: 2 }, rarity: 'rare', description: '화려한 샹들리에' },

  // 전설급
  { id: 'throne', emoji: '👑', name: '왕좌', category: 'furniture', materials: { gold: 8, gem: 6, silk: 4, wood: 5 }, rarity: 'legendary', description: '황금 왕좌' },
  { id: 'magic_mirror', emoji: '🪞', name: '마법 거울', category: 'furniture', materials: { gold: 5, gem: 8, paint: 3 }, rarity: 'legendary', description: '신비로운 마법 거울' },
];

// ===== 벽지/바닥 레시피 =====
export const WALL_RECIPES = [
  { id: 'wood_wall', emoji: '🟫', name: '나무 벽지', category: 'wall', materials: { wood: 5 }, rarity: 'common', color: '#3e2723' },
  { id: 'stone_wall', emoji: '⬜', name: '돌 벽지', category: 'wall', materials: { stone: 5 }, rarity: 'common', color: '#607d8b' },
  { id: 'flower_wall', emoji: '🌸', name: '꽃 벽지', category: 'wall', materials: { flower: 4, paint: 2 }, rarity: 'uncommon', color: '#f8bbd0' },
  { id: 'night_wall', emoji: '🌙', name: '밤하늘 벽지', category: 'wall', materials: { gem: 3, paint: 3 }, rarity: 'uncommon', color: '#1a237e' },
  { id: 'gold_wall', emoji: '✨', name: '황금 벽지', category: 'wall', materials: { gold: 5, paint: 2 }, rarity: 'rare', color: '#f9a825' },
  { id: 'rainbow_wall', emoji: '🌈', name: '무지개 벽지', category: 'wall', materials: { paint: 8, gem: 2, flower: 3 }, rarity: 'legendary', color: 'linear-gradient(180deg,#ef5350,#ff9800,#ffeb3b,#4caf50,#2196f3,#9c27b0)' },
];

// ===== 가든 건물 레시피 =====
export const GARDEN_RECIPES = [
  { id: 'farm', emoji: '🏡', name: '농장', category: 'garden', materials: { wood: 3, stone: 2 }, rarity: 'common', produces: 'herb', produceEmoji: '🌿', produceTime: 60, description: '풀과 약초를 키워요' },
  { id: 'mine', emoji: '⛏️', name: '광산', category: 'garden', materials: { wood: 5, stone: 5, iron: 1 }, rarity: 'uncommon', produces: 'iron', produceEmoji: '⚙️', produceTime: 120, description: '철을 캐요' },
  { id: 'bakery', emoji: '🏪', name: '빵집', category: 'garden', materials: { wood: 4, clay: 3, iron: 1 }, rarity: 'uncommon', produces: 'food', produceEmoji: '🍞', produceTime: 90, description: '맛있는 빵을 구워요' },
  { id: 'flower_garden', emoji: '🌷', name: '꽃밭', category: 'garden', materials: { wood: 2, herb: 3 }, rarity: 'common', produces: 'flower', produceEmoji: '🌸', produceTime: 45, description: '꽃을 키워요' },
  { id: 'pond', emoji: '🎣', name: '낚시터', category: 'garden', materials: { stone: 4, wood: 3, clay: 2 }, rarity: 'uncommon', produces: 'fish', produceEmoji: '🐟', produceTime: 80, description: '물고기를 잡아요' },
  { id: 'clay_pit', emoji: '🏺', name: '점토 채굴장', category: 'garden', materials: { stone: 3, wood: 2 }, rarity: 'common', produces: 'clay', produceEmoji: '🟤', produceTime: 50, description: '점토를 채굴해요' },
  { id: 'silk_farm', emoji: '🐛', name: '양잠장', category: 'garden', materials: { wood: 6, herb: 4 }, rarity: 'uncommon', produces: 'silk', produceEmoji: '🧵', produceTime: 100, description: '실크를 생산해요' },
  { id: 'paint_studio', emoji: '🎨', name: '물감 공방', category: 'garden', materials: { stone: 3, flower: 4, clay: 2 }, rarity: 'uncommon', produces: 'paint', produceEmoji: '🎨', produceTime: 110, description: '물감을 만들어요' },
  { id: 'tower', emoji: '🏰', name: '보석 탑', category: 'garden', materials: { stone: 10, iron: 5, gold: 2 }, rarity: 'rare', produces: 'gem', produceEmoji: '💎', produceTime: 300, description: '보석이 생산돼요' },
  { id: 'gold_mine', emoji: '🏔️', name: '황금 광산', category: 'garden', materials: { stone: 8, iron: 6, gem: 3 }, rarity: 'rare', produces: 'gold', produceEmoji: '✨', produceTime: 360, description: '황금조각을 캐요' },
];

// ===== 장식품 레시피 =====
export const ACCESSORY_RECIPES = [
  { id: 'frame', emoji: '🖼️', name: '액자', category: 'accessory', materials: { wood: 2, paint: 1 }, rarity: 'common', description: '예쁜 그림 액자' },
  { id: 'vase', emoji: '🏺', name: '꽃병', category: 'accessory', materials: { clay: 2, flower: 2 }, rarity: 'common', description: '꽃이 담긴 꽃병' },
  { id: 'candle', emoji: '🕯️', name: '촛대', category: 'accessory', materials: { iron: 1, herb: 2 }, rarity: 'common', description: '은은한 촛대' },
  { id: 'teddy', emoji: '🧸', name: '곰인형', category: 'accessory', materials: { silk: 3, paint: 1 }, rarity: 'uncommon', description: '포근한 곰인형' },
  { id: 'snow_globe', emoji: '🔮', name: '스노우볼', category: 'accessory', materials: { gem: 2, iron: 1, paint: 1 }, rarity: 'uncommon', description: '반짝이는 스노우볼' },
  { id: 'trophy', emoji: '🏆', name: '트로피', category: 'accessory', materials: { gold: 3, iron: 2 }, rarity: 'rare', description: '금빛 트로피' },
  { id: 'crystal_ball', emoji: '🔮', name: '수정구', category: 'accessory', materials: { gem: 6, gold: 2 }, rarity: 'rare', description: '미래가 보이는 수정구' },
];

// 전체 레시피 모음
// ===== 요리 레시피 =====
export const FOOD_RECIPES = [
  // 기본 요리
  { id: 'salad', emoji: '🥗', name: '샐러드', category: 'food', materials: { herb: 2, flower: 1 }, rarity: 'common', description: '신선한 허브 샐러드', effect: '체력 +5' },
  { id: 'bread', emoji: '🍞', name: '갓구운 빵', category: 'food', materials: { food: 2, egg: 1 }, rarity: 'common', description: '따끈한 빵', effect: '체력 +8' },
  { id: 'juice', emoji: '🧃', name: '과일주스', category: 'food', materials: { fruit: 2, sugar: 1 }, rarity: 'common', description: '상큼한 주스', effect: '기분 +5' },
  { id: 'soup', emoji: '🍲', name: '허브 수프', category: 'food', materials: { herb: 3, food: 1, milk: 1 }, rarity: 'common', description: '든든한 수프', effect: '체력 +10' },

  // 중급 요리
  { id: 'fish_steak', emoji: '🐟', name: '생선구이', category: 'food', materials: { fish: 2, herb: 1 }, rarity: 'uncommon', description: '맛있는 생선구이', effect: '체력 +15' },
  { id: 'cake', emoji: '🎂', name: '케이크', category: 'food', materials: { food: 3, egg: 2, milk: 2, sugar: 2 }, rarity: 'uncommon', description: '달콤한 케이크', effect: '기분 +15' },
  { id: 'cookie', emoji: '🍪', name: '쿠키', category: 'food', materials: { food: 2, egg: 1, sugar: 2 }, rarity: 'uncommon', description: '바삭한 쿠키', effect: '기분 +10' },
  { id: 'sushi', emoji: '🍣', name: '초밥', category: 'food', materials: { fish: 3, food: 2, herb: 1 }, rarity: 'uncommon', description: '신선한 초밥', effect: '체력 +20' },

  // 고급 요리
  { id: 'feast', emoji: '🍱', name: '한상차림', category: 'food', materials: { fish: 2, food: 3, herb: 2, egg: 2, fruit: 1 }, rarity: 'rare', description: '정성 가득 한상', effect: '체력 +30' },
  { id: 'golden_pie', emoji: '🥧', name: '황금 파이', category: 'food', materials: { food: 3, fruit: 3, sugar: 2, gold: 1 }, rarity: 'rare', description: '황금빛 파이', effect: '행운 +10' },

  // 전설 요리
  { id: 'rainbow_candy', emoji: '🌈', name: '무지개 사탕', category: 'food', materials: { sugar: 5, fruit: 3, gem: 2, gold: 1 }, rarity: 'legendary', description: '무지개빛 사탕', effect: '전체 +20' },
];

export const ALL_RECIPES = [
  ...FURNITURE_RECIPES,
  ...WALL_RECIPES,
  ...GARDEN_RECIPES,
  ...ACCESSORY_RECIPES,
  ...FOOD_RECIPES,
];

// 희귀도별 색상
export const RARITY_COLORS = {
  common: { bg: '#e8f5e9', text: '#2e7d32', label: '일반' },
  uncommon: { bg: '#e3f2fd', text: '#1565c0', label: '고급' },
  rare: { bg: '#fff3e0', text: '#e65100', label: '희귀' },
  legendary: { bg: '#fce4ec', text: '#c62828', label: '전설' },
};

// 재료 충분한지 체크
export function canCraft(recipe, resources) {
  return Object.entries(recipe.materials).every(
    ([mat, qty]) => (resources[mat] || 0) >= qty
  );
}

// 재료 차감
export function deductMaterials(recipe, resources) {
  const newResources = { ...resources };
  for (const [mat, qty] of Object.entries(recipe.materials)) {
    newResources[mat] = (newResources[mat] || 0) - qty;
  }
  return newResources;
}
