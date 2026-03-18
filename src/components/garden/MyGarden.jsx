import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '../../store/AppContext';

const COLS = 15;
const ROWS = 15;

// 아이소메트릭 타일 크기
const TW = 38; // 타일 가로
const TH = 20; // 타일 세로 (가로의 약 절반)

// 그리드 좌표 → 화면 좌표
function isoX(row, col) { return (col - row) * (TW / 2); }
function isoY(row, col) { return (col + row) * (TH / 2); }

// 전체 캔버스 크기
const ISO_H = (COLS + ROWS) * (TH / 2);
const ISO_OFFSET_X = ROWS * (TW / 2); // 좌측 여백

// w=가로셀, h=세로셀
const BUILDINGS = [
  { id: 'flower', emoji: '🌷', name: '꽃밭', w: 1, h: 1, materials: { wood: 2, stone: 1 }, produces: 'flower', produceEmoji: '💐', produceTime: 45, buildMinutes: 15, instantDotori: 3 },
  { id: 'well', emoji: '🪣', name: '우물', w: 1, h: 1, materials: { stone: 3 }, produces: 'herb', produceEmoji: '🌿', produceTime: 40, buildMinutes: 10, instantDotori: 2 },
  { id: 'farm', emoji: '🏡', name: '농장', w: 2, h: 2, materials: { wood: 5, stone: 3 }, produces: 'wheat', produceEmoji: '🌾', produceTime: 60, buildMinutes: 30, instantDotori: 5 },
  { id: 'mine', emoji: '⛏️', name: '광산', w: 2, h: 1, materials: { wood: 5, stone: 5 }, produces: 'iron', produceEmoji: '⚙️', produceTime: 120, buildMinutes: 60, instantDotori: 10 },
  { id: 'bakery', emoji: '🏪', name: '빵집', w: 2, h: 1, materials: { wood: 4, wheat: 3 }, produces: 'bread', produceEmoji: '🍞', produceTime: 90, buildMinutes: 45, instantDotori: 8 },
  { id: 'pond', emoji: '🎣', name: '낚시터', w: 2, h: 2, materials: { wood: 6, stone: 4 }, produces: 'fish', produceEmoji: '🐟', produceTime: 80, buildMinutes: 50, instantDotori: 9 },
  { id: 'windmill', emoji: '🏭', name: '풍차', w: 1, h: 2, materials: { wood: 8, iron: 2 }, produces: 'wheat', produceEmoji: '🌾', produceTime: 50, buildMinutes: 40, instantDotori: 7 },
  { id: 'tower', emoji: '🏰', name: '탑', w: 2, h: 3, materials: { stone: 10, iron: 3 }, produces: 'gem', produceEmoji: '💎', produceTime: 300, buildMinutes: 180, instantDotori: 30 },
  { id: 'castle', emoji: '🏯', name: '성', w: 3, h: 3, materials: { stone: 15, iron: 5, gold: 3 }, produces: 'gold', produceEmoji: '✨', produceTime: 600, buildMinutes: 360, instantDotori: 50 },
];

const HARVEST_SPOTS = [
  { id: 'tree', emoji: '🌲', name: '나무', resource: 'wood', amount: 1, rareChance: 0.03, rareItem: '✨ 황금나무', w: 1, h: 1 },
  { id: 'rock', emoji: '🪨', name: '바위', resource: 'stone', amount: 1, rareChance: 0.03, rareItem: '✨ 무지개석', w: 1, h: 1 },
  { id: 'bush', emoji: '🌿', name: '풀숲', resource: 'herb', amount: 1, rareChance: 0.05, rareItem: '✨ 전설의풀', w: 1, h: 1 },
  { id: 'bigtree', emoji: '🌳', name: '큰나무', resource: 'wood', amount: 2, rareChance: 0.05, rareItem: '✨ 세계수열매', w: 2, h: 2 },
];

const DEFAULT_HARVEST_LAYOUT = [
  { spotIdx: 0, row: 0, col: 0 }, { spotIdx: 0, row: 0, col: 7 }, { spotIdx: 0, row: 0, col: 14 },
  { spotIdx: 0, row: 7, col: 0 }, { spotIdx: 0, row: 14, col: 7 }, { spotIdx: 0, row: 14, col: 14 },
  { spotIdx: 1, row: 14, col: 0 }, { spotIdx: 1, row: 0, col: 12 }, { spotIdx: 1, row: 7, col: 14 },
  { spotIdx: 1, row: 10, col: 2 },
  { spotIdx: 2, row: 4, col: 0 }, { spotIdx: 2, row: 11, col: 14 }, { spotIdx: 2, row: 7, col: 10 },
  { spotIdx: 2, row: 2, col: 5 },
  { spotIdx: 3, row: 6, col: 6 }, // 큰나무 2x2
  { spotIdx: 3, row: 11, col: 10 }, // 큰나무 2x2
];

const DEMO_WORK_REQUESTS = [
  { uid: 'u1', name: '다람쥐맘', emoji: '🐿️' },
  { uid: 'u2', name: '숲지기', emoji: '🌲' },
  { uid: 'u4', name: '패션왕', emoji: '👑' },
];

function formatTime(ms) {
  if (ms <= 0) return '완료!';
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

// 영역 충돌 체크
function canPlace(grid, row, col, w, h) {
  if (row + h > ROWS || col + w > COLS) return false;
  for (let r = row; r < row + h; r++) {
    for (let c = col; c < col + w; c++) {
      if (grid[r][c]) return false;
    }
  }
  return true;
}

// 영역에 건물 배치
function placeOnGrid(grid, item, row, col, w, h) {
  for (let r = row; r < row + h; r++) {
    for (let c = col; c < col + w; c++) {
      grid[r][c] = {
        ...item,
        isAnchor: r === row && c === col,
        anchorRow: row, anchorCol: col,
        spanW: w, spanH: h,
      };
    }
  }
}

export default function MyGarden() {
  const { state, dispatch, showToast } = useApp();
  const { myGarden } = state;
  const [resources, setResources] = useState(myGarden.resources || {});
  const [buildings, setBuildings] = useState(myGarden.buildings || []);
  const [mode, setMode] = useState('view');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showBuildList, setShowBuildList] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [dailyWorkLeft, setDailyWorkLeft] = useState(3);
  const [workRequests, setWorkRequests] = useState([]);
  const [showWorkPopup, setShowWorkPopup] = useState(null);
  const [harvestCooldowns, setHarvestCooldowns] = useState({});
  const [produceCooldowns, setProduceCooldowns] = useState({});
  const [floatingItems, setFloatingItems] = useState([]);
  const [movingBuilding, setMovingBuilding] = useState(null); // { idx, type: 'building'|'harvest' }
  const [harvestLayout, setHarvestLayout] = useState(() =>
    DEFAULT_HARVEST_LAYOUT.map(h => ({ ...HARVEST_SPOTS[h.spotIdx], row: h.row, col: h.col, type: 'harvest' }))
  );
  const longPressTimer = useRef(null);

  // 줌 & 패닝
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.5;
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const pinchDist = useRef(0);
  const gardenRef = useRef(null);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev - e.deltaY * 0.002)));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  }, []);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const handleTouchStartZoom = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      isPanning.current = true;
      panStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  }, [pan]);

  const handleTouchMoveZoom = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = (dist - pinchDist.current) * 0.008;
      setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
      pinchDist.current = dist;
    } else if (e.touches.length === 1 && isPanning.current) {
      setPan({ x: e.touches[0].clientX - panStart.current.x, y: e.touches[0].clientY - panStart.current.y });
    }
  }, []);

  const handleTouchEndZoom = useCallback(() => { isPanning.current = false; }, []);

  // 줌 리셋
  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 데모 알바 신청
  useEffect(() => {
    const constructing = buildings.filter(b => b.completedAt && b.completedAt > Date.now());
    if (constructing.length === 0) return;
    const timer = setTimeout(() => {
      const friend = DEMO_WORK_REQUESTS[Math.floor(Math.random() * DEMO_WORK_REQUESTS.length)];
      const target = constructing[Math.floor(Math.random() * constructing.length)];
      if (workRequests.some(w => w.friend.uid === friend.uid && w.buildingIdx === buildings.indexOf(target))) return;
      setWorkRequests(prev => [...prev, { friend, buildingIdx: buildings.indexOf(target), building: target }]);
      setShowWorkPopup({ friend, building: target, buildingIdx: buildings.indexOf(target) });
    }, 8000 + Math.random() * 12000);
    return () => clearTimeout(timer);
  }, [buildings, workRequests]);

  // 그리드 구축
  const grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

  // 채집 스팟 배치 (state 기반)
  harvestLayout.forEach((s, idx) => {
    if (canPlace(grid, s.row, s.col, s.w, s.h)) {
      placeOnGrid(grid, { ...s, harvestIdx: idx }, s.row, s.col, s.w, s.h);
    }
  });

  // 건물 배치
  buildings.forEach((b, idx) => {
    const w = b.w || 1, h = b.h || 1;
    if (b.row + h <= ROWS && b.col + w <= COLS) {
      placeOnGrid(grid, { ...b, idx, type: 'building' }, b.row, b.col, w, h);
    }
  });

  const HARVEST_COOLDOWN = 30 * 1000;

  const harvest = useCallback((spot) => {
    const key = `${spot.anchorRow}-${spot.anchorCol}`;
    const cooldownEnd = harvestCooldowns[key];
    if (cooldownEnd && cooldownEnd > now) {
      showToast(`⏳ 쿨타임! ${formatTime(cooldownEnd - now)}`);
      return;
    }
    const newResources = { ...resources };
    newResources[spot.resource] = (newResources[spot.resource] || 0) + spot.amount;
    setResources(newResources);
    if (Math.random() < spot.rareChance) {
      showToast(`✨ 초레어! ${spot.rareItem} 발견!!`, 3000);
      dispatch({ type: 'ADD_INVENTORY', item: { id: Date.now(), name: spot.rareItem, type: 'rare', emoji: '✨' } });
    } else {
      showToast(`${spot.emoji} ${spot.name}에서 ${spot.resource} +${spot.amount}`);
    }
    setHarvestCooldowns(prev => ({ ...prev, [key]: Date.now() + HARVEST_COOLDOWN }));
    const floatId = Date.now();
    setFloatingItems(prev => [...prev, { id: floatId, row: spot.anchorRow, col: spot.anchorCol, emoji: spot.emoji }]);
    setTimeout(() => setFloatingItems(prev => prev.filter(f => f.id !== floatId)), 1000);
    dispatch({ type: 'SET_MY_GARDEN', garden: { resources: newResources } });
  }, [resources, harvestCooldowns, now, dispatch, showToast]);

  const build = useCallback((row, col) => {
    if (!selectedBuilding) return;
    const w = selectedBuilding.w || 1, h = selectedBuilding.h || 1;
    if (!canPlace(grid, row, col, w, h)) {
      showToast('여기엔 지을 수 없어요!');
      return;
    }
    for (const [mat, qty] of Object.entries(selectedBuilding.materials)) {
      if ((resources[mat] || 0) < qty) {
        showToast(`${mat}이(가) 부족해요! (${resources[mat] || 0}/${qty})`);
        return;
      }
    }
    const newResources = { ...resources };
    for (const [mat, qty] of Object.entries(selectedBuilding.materials)) {
      newResources[mat] -= qty;
    }
    const buildMs = selectedBuilding.buildMinutes * 60 * 1000;
    const newBuilding = {
      ...selectedBuilding, row, col, type: 'building',
      startedAt: Date.now(), completedAt: Date.now() + buildMs, workers: [],
    };
    const newBuildings = [...buildings, newBuilding];
    setResources(newResources);
    setBuildings(newBuildings);
    setSelectedBuilding(null);
    setShowBuildList(false);
    setMode('view');
    dispatch({ type: 'SET_MY_GARDEN', garden: { resources: newResources, buildings: newBuildings } });
    showToast(`${selectedBuilding.emoji} ${selectedBuilding.name} 건설 시작! (${selectedBuilding.buildMinutes}분)`);
  }, [selectedBuilding, resources, buildings, grid, dispatch, showToast]);

  const instantComplete = useCallback((buildingIdx) => {
    const b = buildings[buildingIdx];
    if (!b || !b.completedAt || b.completedAt <= now) return;
    const cost = b.instantDotori || 10;
    if (state.dotori < cost) { showToast(`도토리 부족! (${cost}개 필요)`); return; }
    dispatch({ type: 'ADD_DOTORI', amount: -cost });
    const newBuildings = buildings.map((bb, i) => i === buildingIdx ? { ...bb, completedAt: Date.now() } : bb);
    setBuildings(newBuildings);
    dispatch({ type: 'SET_MY_GARDEN', garden: { buildings: newBuildings } });
    showToast(`🌰 ${cost}개로 즉시 완료!`);
  }, [buildings, now, state.dotori, dispatch, showToast]);

  const acceptWork = useCallback((request) => {
    const { buildingIdx, friend } = request;
    const b = buildings[buildingIdx];
    if (!b || !b.completedAt || b.completedAt <= now) return;
    const remaining = b.completedAt - Date.now();
    const reduction = remaining * 0.2;
    const newBuildings = buildings.map((bb, i) =>
      i === buildingIdx ? { ...bb, completedAt: bb.completedAt - reduction, workers: [...(bb.workers || []), friend] } : bb
    );
    setBuildings(newBuildings);
    dispatch({ type: 'SET_MY_GARDEN', garden: { buildings: newBuildings } });
    setWorkRequests(prev => prev.filter(w => w !== request));
    setShowWorkPopup(null);
    showToast(`${friend.emoji} ${friend.name}님 알바 시작! 시간 20% 단축!`);
  }, [buildings, now, dispatch, showToast]);

  const rejectWork = useCallback((request) => {
    setWorkRequests(prev => prev.filter(w => w !== request));
    setShowWorkPopup(null);
    showToast(`${request.friend.name}님 알바 거절`);
  }, [showToast]);

  const collectProduce = useCallback((cell) => {
    if (cell.completedAt && cell.completedAt > now) return;
    const cooldownEnd = produceCooldowns[cell.idx];
    if (cooldownEnd && cooldownEnd > now) {
      showToast(`⏳ 수확 쿨타임! ${formatTime(cooldownEnd - now)}`);
      return;
    }
    const newResources = { ...resources };
    newResources[cell.produces] = (newResources[cell.produces] || 0) + 1;
    setResources(newResources);
    const cooldownMs = (cell.produceTime || 60) * 1000;
    setProduceCooldowns(prev => ({ ...prev, [cell.idx]: Date.now() + cooldownMs }));
    const floatId = Date.now();
    setFloatingItems(prev => [...prev, { id: floatId, row: cell.anchorRow, col: cell.anchorCol, emoji: cell.produceEmoji }]);
    setTimeout(() => setFloatingItems(prev => prev.filter(f => f.id !== floatId)), 1000);
    dispatch({ type: 'SET_MY_GARDEN', garden: { resources: newResources } });
    showToast(`${cell.produceEmoji} ${cell.produces} +1 수확!`);
  }, [resources, now, produceCooldowns, dispatch, showToast]);

  // 건물/채집 이동
  const moveItem = useCallback((row, col) => {
    if (!movingBuilding) return;
    const b = movingBuilding.building;
    const w = b.w || 1, h = b.h || 1;
    const moveType = movingBuilding.moveType; // 'building' | 'harvest'

    // 이동 대상을 제외한 그리드로 충돌 체크
    const tempGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    harvestLayout.forEach((s, i) => {
      if (moveType === 'harvest' && i === movingBuilding.idx) return;
      if (canPlace(tempGrid, s.row, s.col, s.w || 1, s.h || 1)) {
        placeOnGrid(tempGrid, s, s.row, s.col, s.w || 1, s.h || 1);
      }
    });
    buildings.forEach((bb, i) => {
      if (moveType === 'building' && i === movingBuilding.idx) return;
      const bw = bb.w || 1, bh = bb.h || 1;
      if (canPlace(tempGrid, bb.row, bb.col, bw, bh)) {
        placeOnGrid(tempGrid, { ...bb, type: 'building' }, bb.row, bb.col, bw, bh);
      }
    });

    if (!canPlace(tempGrid, row, col, w, h)) {
      showToast('여기엔 옮길 수 없어요!');
      return;
    }

    if (moveType === 'building') {
      const newBuildings = buildings.map((bb, i) =>
        i === movingBuilding.idx ? { ...bb, row, col } : bb
      );
      setBuildings(newBuildings);
      dispatch({ type: 'SET_MY_GARDEN', garden: { buildings: newBuildings } });
    } else {
      const newLayout = harvestLayout.map((s, i) =>
        i === movingBuilding.idx ? { ...s, row, col } : s
      );
      setHarvestLayout(newLayout);
    }

    setMovingBuilding(null);
    setMode('view');
    showToast(`${b.emoji} ${b.name} 이동 완료!`);
  }, [movingBuilding, buildings, harvestLayout, dispatch, showToast]);

  // 롱프레스 시작 (건물 + 채집 스팟 모두)
  const handleLongPressStart = (row, col) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    const cell = grid[row][col];
    if (!cell) return;
    const anchor = cell.isAnchor ? cell : grid[cell.anchorRow]?.[cell.anchorCol];
    if (!anchor) return;

    if (anchor.type === 'building') {
      longPressTimer.current = setTimeout(() => {
        longPressTimer.current = null;
        setMovingBuilding({ idx: anchor.idx, building: anchor, moveType: 'building' });
        setMode('move');
        showToast(`${anchor.emoji} ${anchor.name} 이동할 곳을 터치하세요`);
      }, 600);
    } else if (anchor.type === 'harvest') {
      longPressTimer.current = setTimeout(() => {
        longPressTimer.current = null;
        setMovingBuilding({ idx: anchor.harvestIdx, building: anchor, moveType: 'harvest' });
        setMode('move');
        showToast(`${anchor.emoji} ${anchor.name} 이동할 곳을 터치하세요`);
      }, 600);
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 전체 수확
  const harvestAll = useCallback(() => {
    let count = 0;
    const newResources = { ...resources };

    // 채집 스팟
    const floats = [];
    harvestLayout.forEach((s, i) => {
      const key = `${s.row}-${s.col}`;
      if (harvestCooldowns[key] && harvestCooldowns[key] > now) return;
      newResources[s.resource] = (newResources[s.resource] || 0) + s.amount;
      setHarvestCooldowns(prev => ({ ...prev, [key]: Date.now() + HARVEST_COOLDOWN }));
      floats.push({ id: Date.now() + i, row: s.row, col: s.col, emoji: s.emoji });
      count++;
    });

    // 완료된 건물
    buildings.forEach((b, idx) => {
      if (b.completedAt && b.completedAt > now) return;
      if (produceCooldowns[idx] && produceCooldowns[idx] > now) return;
      newResources[b.produces] = (newResources[b.produces] || 0) + 1;
      const cooldownMs = (b.produceTime || 60) * 1000;
      setProduceCooldowns(prev => ({ ...prev, [idx]: Date.now() + cooldownMs }));
      floats.push({ id: Date.now() + 100 + idx, row: b.row, col: b.col, emoji: b.produceEmoji });
      count++;
    });

    // 플로팅 연출
    if (floats.length > 0) {
      setFloatingItems(prev => [...prev, ...floats]);
      setTimeout(() => setFloatingItems(prev => prev.filter(f => !floats.some(fl => fl.id === f.id))), 1000);
    }

    if (count === 0) {
      showToast('수확할 게 없어요! 쿨타임 중~');
      return;
    }

    setResources(newResources);
    dispatch({ type: 'SET_MY_GARDEN', garden: { resources: newResources } });
    showToast(`🌾 ${count}곳 일괄 수확 완료!`);
  }, [resources, harvestLayout, buildings, harvestCooldowns, produceCooldowns, now, dispatch, showToast]);

  const cellClick = useCallback((row, col) => {
    const cell = grid[row][col];

    // 이동 모드
    if (mode === 'move' && movingBuilding) {
      if (!cell) {
        moveItem(row, col);
      } else {
        showToast('빈 곳을 터치하세요!');
      }
      return;
    }

    if (!cell) {
      if (mode === 'build' && selectedBuilding) build(row, col);
      return;
    }
    const anchor = cell.isAnchor ? cell : grid[cell.anchorRow]?.[cell.anchorCol];
    if (!anchor) return;

    if (anchor.type === 'harvest') { harvest(anchor); return; }
    if (anchor.type === 'building') {
      if (anchor.completedAt && anchor.completedAt > now) return;
      collectProduce(anchor);
      return;
    }
    if (mode === 'build' && selectedBuilding) build(row, col);
  }, [grid, mode, selectedBuilding, movingBuilding, harvest, build, collectProduce, moveItem, now, showToast]);

  // 배치/이동 가능 영역 하이라이트 계산
  const placeable = {};
  if (mode === 'build' && selectedBuilding) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (canPlace(grid, r, c, selectedBuilding.w || 1, selectedBuilding.h || 1)) {
          placeable[`${r}-${c}`] = true;
        }
      }
    }
  }
  if (mode === 'move' && movingBuilding) {
    const mb = movingBuilding.building;
    const mw = mb.w || 1, mh = mb.h || 1;
    const tempGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    harvestLayout.forEach((s, i) => {
      if (movingBuilding.moveType === 'harvest' && i === movingBuilding.idx) return;
      if (canPlace(tempGrid, s.row, s.col, s.w || 1, s.h || 1)) {
        placeOnGrid(tempGrid, s, s.row, s.col, s.w || 1, s.h || 1);
      }
    });
    buildings.forEach((bb, i) => {
      if (movingBuilding.moveType === 'building' && i === movingBuilding.idx) return;
      const bw = bb.w || 1, bh = bb.h || 1;
      if (canPlace(tempGrid, bb.row, bb.col, bw, bh)) {
        placeOnGrid(tempGrid, { ...bb, type: 'building' }, bb.row, bb.col, bw, bh);
      }
    });
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (canPlace(tempGrid, r, c, mw, mh)) {
          placeable[`${r}-${c}`] = true;
        }
      }
    }
  }

  return (
    <div>
      {/* 알바 신청 팝업 */}
      {showWorkPopup && (
        <div className="overlay-bg" onClick={() => setShowWorkPopup(null)}>
          <div className="overlay-panel" onClick={e => e.stopPropagation()} style={{ maxHeight: '40vh', textAlign: 'center', padding: 24 }}>
            <div className="overlay-handle" />
            <div style={{ fontSize: 36, marginBottom: 8 }}>{showWorkPopup.friend.emoji}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>알바 신청!</div>
            <div style={{ fontSize: 13, marginBottom: 4 }}><b>{showWorkPopup.friend.name}</b>님이</div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>{showWorkPopup.building.emoji} <b>{showWorkPopup.building.name}</b> 건설에 알바 신청!</div>
            <div style={{ padding: '8px 12px', background: 'var(--primary-soft)', borderRadius: 8, fontSize: 12, color: 'var(--primary)', marginBottom: 16 }}>
              수락 시 건설 시간 <b>20% 단축</b>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => rejectWork(showWorkPopup)}>거절</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => acceptWork(showWorkPopup)}>수락</button>
            </div>
          </div>
        </div>
      )}

      {/* 알바 현황 */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>오늘 내 알바 가능 횟수</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{
              width: 20, height: 20, borderRadius: '50%',
              background: i < dailyWorkLeft ? 'var(--primary)' : 'var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: i < dailyWorkLeft ? '#fff' : 'var(--text-dim)',
            }}>{i < dailyWorkLeft ? '⚒️' : '·'}</span>
          ))}
        </div>
      </div>

      {/* 자원 현황 */}
      <div className="card">
        <div className="card-title">📦 보유 자원</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(resources).filter(([, v]) => v > 0).map(([key, val]) => (
            <span key={key} style={{ padding: '3px 8px', background: 'var(--bg-surface)', borderRadius: 10, fontSize: 11, border: '1px solid var(--border-light)' }}>
              {key} <strong style={{ color: 'var(--primary)' }}>{val}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* 정원 그리드 */}
      <div className="card" style={{ padding: 8, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, padding: '0 6px' }}>
          <div className="card-title" style={{ margin: 0 }}>🌳 내 정원</div>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{COLS}×{ROWS}</span>
        </div>

        {selectedBuilding && (
          <div style={{ margin: '0 6px 6px', padding: '6px 10px', background: 'var(--primary-soft)', borderRadius: 8, fontSize: 12, color: 'var(--primary)' }}>
            {selectedBuilding.emoji} {selectedBuilding.name} ({selectedBuilding.w}×{selectedBuilding.h}) 지을 곳을 터치
            <button onClick={() => { setSelectedBuilding(null); setMode('view'); }}
              style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-main)' }}>취소</button>
          </div>
        )}

        {movingBuilding && (
          <div style={{ margin: '0 6px 6px', padding: '6px 10px', background: 'var(--secondary-soft)', borderRadius: 8, fontSize: 12, color: 'var(--secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{movingBuilding.building.emoji} {movingBuilding.building.name} 이동할 곳을 터치</span>
            <button onClick={() => { setMovingBuilding(null); setMode('view'); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-main)' }}>취소</button>
          </div>
        )}

        {/* 줌 컨트롤 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 6px 6px', justifyContent: 'flex-end' }}>
          <button onClick={() => setZoom(prev => Math.max(MIN_ZOOM, prev - 0.2))}
            style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-main)' }}>−</button>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', minWidth: 32, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(prev => Math.min(MAX_ZOOM, prev + 0.2))}
            style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-main)' }}>+</button>
          {zoom !== 1 && (
            <button onClick={resetView}
              style={{ padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', fontSize: 9, cursor: 'pointer', color: 'var(--text-dim)', fontFamily: 'var(--font-main)' }}>리셋</button>
          )}
        </div>

        <div
          ref={gardenRef}
          style={{
            position: 'relative',
            width: '100%',
            height: 300,
            overflow: 'hidden',
            cursor: isPanning.current ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStartZoom}
          onTouchMove={handleTouchMoveZoom}
          onTouchEnd={handleTouchEndZoom}
        >
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            position: 'relative',
            width: '100%',
            height: ISO_H + 40,
          }}>
          {/* 아이소메트릭 타일 */}
          {Array(ROWS).fill(null).map((_, r) =>
            Array(COLS).fill(null).map((_, c) => {
              const cell = grid[r][c];
              const key = `${r}-${c}`;
              const isPlaceable = placeable[key];

              // 멀티셀의 anchor가 아닌 부분은 바닥 타일만
              const sx = isoX(r, c) + ISO_OFFSET_X;
              const sy = isoY(r, c) + 10;

              if (cell && !cell.isAnchor) {
                // 점유된 바닥 타일 (건물 아래)
                return (
                  <div key={key} style={{
                    position: 'absolute', left: sx, top: sy,
                    width: TW, height: TH,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    background: cell.type === 'building' ? 'rgba(255,183,77,0.12)' : 'rgba(76,175,80,0.08)',
                  }}
                    onClick={() => cellClick(r, c)}
                  />
                );
              }

              // anchor 셀
              if (cell && cell.isAnchor) {
                const isConstructing = cell.type === 'building' && cell.completedAt && cell.completedAt > now;
                const harvestKey = `${cell.anchorRow}-${cell.anchorCol}`;
                const harvestReady = cell.type === 'harvest' && (!harvestCooldowns[harvestKey] || harvestCooldowns[harvestKey] <= now);
                const harvestCooling = cell.type === 'harvest' && harvestCooldowns[harvestKey] && harvestCooldowns[harvestKey] > now;
                const produceReady = cell.type === 'building' && !isConstructing && (!produceCooldowns[cell.idx] || produceCooldowns[cell.idx] <= now);
                const produceCooling = cell.type === 'building' && !isConstructing && produceCooldowns[cell.idx] && produceCooldowns[cell.idx] > now;
                const hasWorkers = cell.workers?.length > 0;
                const isMoving = movingBuilding?.idx === cell.idx;

                // 멀티셀 아이소메트릭 크기 계산
                const spanW = cell.spanW || 1;
                const spanH = cell.spanH || 1;
                const emojiSize = Math.max(18, Math.min(spanW, spanH) * 16 + 4);

                return (
                  <div key={key} style={{ position: 'absolute', left: sx, top: sy, zIndex: r + c + 1 }}>
                    {/* 바닥 마름모 타일 */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0,
                      width: TW, height: TH,
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      background: cell.type === 'harvest'
                        ? harvestReady ? 'rgba(76,175,80,0.35)' : 'rgba(76,175,80,0.12)'
                        : isConstructing ? 'rgba(255,183,77,0.3)'
                        : produceReady ? 'rgba(76,175,80,0.35)'
                        : 'rgba(255,183,77,0.15)',
                      border: isMoving ? '2px dashed var(--secondary)' : 'none',
                    }} />
                    {/* 이모지 (타일 위에 올림) */}
                    <div
                      style={{
                        position: 'absolute',
                        left: TW / 2, top: -emojiSize / 2,
                        transform: 'translateX(-50%)',
                        fontSize: emojiSize,
                        lineHeight: 1,
                        cursor: 'pointer',
                        opacity: isConstructing ? 0.6 : (harvestCooling || produceCooling) ? 0.4 : 1,
                        transition: 'opacity 0.3s',
                        filter: isMoving ? 'drop-shadow(0 0 4px rgba(110,181,255,0.6))' : 'none',
                      }}
                      onClick={() => cellClick(r, c)}
                      onPointerDown={() => handleLongPressStart(r, c)}
                      onPointerUp={handleLongPressEnd}
                      onPointerLeave={handleLongPressEnd}
                      onTouchStart={() => handleLongPressStart(r, c)}
                      onTouchEnd={handleLongPressEnd}
                      onContextMenu={e => e.preventDefault()}
                    >
                      {cell.emoji}
                    </div>
                    {/* 이름 */}
                    {cell.name && (
                      <div style={{
                        position: 'absolute', left: TW / 2, top: emojiSize / 2 + 2,
                        transform: 'translateX(-50%)',
                        fontSize: 7, fontWeight: 600, color: 'var(--text-dim)',
                        whiteSpace: 'nowrap', textAlign: 'center',
                      }}>{cell.name}</div>
                    )}
                    {/* 플로팅 이펙트 */}
                    {floatingItems.filter(f => f.row === r && f.col === c).map(f => (
                      <div key={f.id} style={{
                        position: 'absolute', left: TW / 2, top: -emojiSize,
                        transform: 'translateX(-50%)',
                        fontSize: 20, pointerEvents: 'none', zIndex: 50,
                        animation: 'harvestFloat 1s ease-out forwards',
                      }}>{f.emoji}</div>
                    ))}
                    {/* 수확 말풍선 */}
                    {(harvestReady || produceReady) && (
                      <div style={{
                        position: 'absolute', left: TW / 2, top: -emojiSize - 12,
                        transform: 'translateX(-50%)',
                        background: '#fff', borderRadius: 8, padding: '1px 6px',
                        fontSize: 9, whiteSpace: 'nowrap',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                        animation: 'floatBubble 1.5s ease-in-out infinite',
                        zIndex: 30, border: '1px solid var(--border-light)',
                      }}>
                        {harvestReady ? `${cell.emoji} 채집!` : `${cell.produceEmoji} 수확!`}
                      </div>
                    )}
                    {/* 쿨타임/건설 중 */}
                    {(harvestCooling || produceCooling) && (
                      <div style={{ position: 'absolute', left: TW / 2 + 10, top: -8, fontSize: 10, zIndex: 20 }}>⏳</div>
                    )}
                    {isConstructing && (() => {
                      const remaining = cell.completedAt - now;
                      const total = (cell.buildMinutes || 1) * 60 * 1000;
                      const pct = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
                      return (
                        <div style={{ position: 'absolute', left: TW / 2, top: emojiSize / 2 + 2, transform: 'translateX(-50%)', zIndex: 20, textAlign: 'center' }}>
                          {/* 미니 프로그래스바 */}
                          <div style={{ width: 36, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--pink))', borderRadius: 2, transition: 'width 1s linear' }} />
                          </div>
                          <div style={{ fontSize: 7, color: 'var(--primary)', fontWeight: 700, marginTop: 1 }}>
                            🏗️ {formatTime(remaining)}
                          </div>
                        </div>
                      );
                    })()}
                    {hasWorkers && (
                      <div style={{ position: 'absolute', left: TW / 2 + 12, top: -emojiSize / 2 - 4, fontSize: 10, zIndex: 25 }}>
                        {cell.workers.map((w, i) => <span key={i}>{w.emoji}</span>)}
                      </div>
                    )}
                  </div>
                );
              }

              // 빈 셀 — 마름모 바닥 타일
              return (
                <div
                  key={key}
                  style={{
                    position: 'absolute', left: sx, top: sy,
                    width: TW, height: TH,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    background: isPlaceable ? 'rgba(76,175,80,0.25)' : 'rgba(200,180,155,0.15)',
                    border: isPlaceable ? '1px dashed rgba(76,175,80,0.5)' : 'none',
                    cursor: isPlaceable ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => cellClick(r, c)}
                />
              );
            })
          )}
        </div>{/* transform div */}
        </div>{/* overflow div */}
        {/* 전체 수확 플로팅 버튼 */}
        <button onClick={harvestAll} style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 40,
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f5a623, #ff8a3d)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(245,166,35,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>🌾</button>

        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-dim)', padding: '0 6px' }}>
          터치: 채집/수확 | 꾹 누르기: 이동 | 🌾: 전체 수확
        </div>
      </div>

      {/* 건설 중 */}
      {buildings.some(b => b.completedAt && b.completedAt > now) && (
        <div className="card">
          <div className="card-title">🏗️ 건설 중</div>
          {buildings.map((b, idx) => {
            if (!b.completedAt || b.completedAt <= now) return null;
            const remaining = b.completedAt - now;
            const total = b.buildMinutes * 60 * 1000;
            const progress = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
            return (
              <div key={idx} style={{ padding: 10, background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{b.emoji}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{b.name} <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>({b.w}×{b.h})</span></div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>⏳ {formatTime(remaining)}</div>
                    </div>
                  </div>
                  <button onClick={() => instantComplete(idx)} style={{
                    padding: '4px 9px', border: 'none', borderRadius: 10,
                    background: 'linear-gradient(135deg, #f5a623, #ff8a3d)',
                    color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)',
                  }}>🌰 {b.instantDotori} 즉시완료</button>
                </div>
                <div style={{ height: 5, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--pink))', borderRadius: 3, transition: 'width 1s linear' }} />
                </div>
                {b.workers?.length > 0 && (
                  <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-dim)' }}>
                    ⚒️ 알바:
                    {b.workers.map((w, i) => (
                      <span key={i} style={{ padding: '1px 5px', background: 'var(--secondary-soft)', borderRadius: 6, fontSize: 9, color: 'var(--secondary)' }}>
                        {w.emoji} {w.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 건설 버튼 */}
      <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => setShowBuildList(!showBuildList)}>
        🏗️ 건물 짓기 {showBuildList ? '닫기' : '열기'}
      </button>

      {showBuildList && (
        <div className="card">
          <div className="card-title">건설 가능한 건물</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BUILDINGS.map(b => {
              const canBuild = Object.entries(b.materials).every(([mat, qty]) => (resources[mat] || 0) >= qty);
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    if (!canBuild) { showToast('재료가 부족해요!'); return; }
                    setSelectedBuilding(b);
                    setMode('build');
                    setShowBuildList(false);
                    showToast(`${b.emoji} ${b.name} (${b.w}×${b.h}) 지을 곳을 선택하세요`);
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 3,
                    padding: '9px 12px', background: 'var(--bg-surface)',
                    border: `1px solid ${canBuild ? 'var(--primary)' : 'var(--border-light)'}`,
                    borderRadius: 8, cursor: 'pointer', color: 'var(--text)', fontSize: 12,
                    opacity: canBuild ? 1 : 0.5, textAlign: 'left', fontFamily: 'var(--font-main)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div>
                      <span style={{ marginRight: 6 }}>{b.emoji}</span>
                      <strong>{b.name}</strong>
                      <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-dim)' }}>
                        {b.w}×{b.h} → {b.produceEmoji} {b.produces}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--secondary)' }}>
                      {Object.entries(b.materials).map(([m, q]) => `${m}×${q}`).join(' ')}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', gap: 10 }}>
                    <span>⏱️ {b.buildMinutes}분</span>
                    <span>🌰 즉시 {b.instantDotori}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
