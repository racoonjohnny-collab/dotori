import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';

// 도트 아바타 렌더링
function DotAvatar({ pixels, size = 32 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !pixels) return;
    const ctx = el.getContext('2d');
    ctx.clearRect(0, 0, 48, 64);
    pixels.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (!cell) return;
        ctx.fillStyle = cell;
        ctx.fillRect(c, r, 1, 1);
      })
    );
  }, [pixels]);

  if (!pixels) return <span style={{ fontSize: size * 0.7 }}>😊</span>;

  return (
    <canvas
      ref={canvasRef}
      width={48} height={64}
      style={{ width: size, height: size * (64 / 48), imageRendering: 'pixelated' }}
    />
  );
}

const ROOM_COLS = 15;
const ROOM_ROWS = 15;

const TW = 24;
const TH = 13;
const ISO_H = (ROOM_COLS + ROOM_ROWS) * (TH / 2);
const ISO_OFFSET_X = ROOM_ROWS * (TW / 2);

function isoX(row, col) { return (col - row) * (TW / 2); }
function isoY(row, col) { return (col + row) * (TH / 2); }

// CSS 패턴 벽지
const WALLPAPERS = [
  { id: 'default', name: '기본 크림', bg: '#faf5ef' },
  { id: 'wood', name: '나무결', bg: 'repeating-linear-gradient(90deg, #e8d5b7 0px, #f0dfc4 8px, #dcc8a6 16px)' },
  { id: 'tile', name: '타일', bg: 'repeating-conic-gradient(#f0e6d3 0% 25%, #e8dcc8 0% 50%) 0 0 / 20px 20px' },
  { id: 'check', name: '체크', bg: 'repeating-conic-gradient(#fce4ec 0% 25%, #fff 0% 50%) 0 0 / 16px 16px' },
  { id: 'stripe', name: '스트라이프', bg: 'repeating-linear-gradient(45deg, #e8f5e9 0px, #e8f5e9 6px, #fff 6px, #fff 12px)' },
  { id: 'dot', name: '도트', bg: 'radial-gradient(circle, #ffb347 1px, transparent 1px), #fdf6ee', bgSize: '12px 12px' },
  { id: 'sky', name: '하늘', bg: 'linear-gradient(180deg, #a8d4ff 0%, #e8f4ff 100%)' },
  { id: 'night', name: '밤하늘', bg: 'linear-gradient(180deg, #1a1a3e 0%, #2d2b55 100%)' },
];

// CSS 패턴 바닥
const FLOORS = [
  { id: 'default', name: '기본', tileColor: 'rgba(200,180,155,0.15)', tileAlt: 'rgba(200,180,155,0.08)' },
  { id: 'wood', name: '나무', tileColor: 'rgba(180,130,70,0.2)', tileAlt: 'rgba(180,130,70,0.12)' },
  { id: 'marble', name: '대리석', tileColor: 'rgba(180,180,200,0.2)', tileAlt: 'rgba(200,200,220,0.1)' },
  { id: 'grass', name: '잔디', tileColor: 'rgba(100,180,80,0.2)', tileAlt: 'rgba(100,180,80,0.1)' },
  { id: 'pink', name: '핑크', tileColor: 'rgba(255,126,179,0.15)', tileAlt: 'rgba(255,126,179,0.08)' },
  { id: 'blue', name: '블루', tileColor: 'rgba(110,181,255,0.15)', tileAlt: 'rgba(110,181,255,0.08)' },
];

export default function MyRoom({ viewOnly = false }) {
  const { state, dispatch, showToast } = useApp();
  const { myRoom, inventory } = state;
  const [selectedItem, setSelectedItem] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const bgmRef = useRef(null);

  // BGM 재생/정지
  const toggleBgm = useCallback(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio('/music_epic_heroes_story.wav');
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3;
    }
    if (bgmPlaying) {
      bgmRef.current.pause();
    } else {
      bgmRef.current.play().catch(() => {});
    }
    setBgmPlaying(!bgmPlaying);
  }, [bgmPlaying]);
  const [invTab, setInvTab] = useState('furniture');
  const [movingItem, setMovingItem] = useState(null);
  const longPressTimer = useRef(null);
  const bubbleText = state.avatar.bubbleText || '';

  const zoom = 1.3;
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

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
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      isPanning.current = true;
      panStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  }, [pan]);
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 1 && isPanning.current) {
      setPan({ x: e.touches[0].clientX - panStart.current.x, y: e.touches[0].clientY - panStart.current.y });
    }
  }, []);
  const handleTouchEnd = useCallback(() => { isPanning.current = false; }, []);

  // 벽지/바닥 선택
  const currentWp = WALLPAPERS.find(w => w.id === myRoom.wallpaper) || WALLPAPERS[0];
  const currentFloor = FLOORS.find(f => f.id === (myRoom.floor || 'default')) || FLOORS[0];

  // 그리드 초기화
  const grid = Array(ROOM_ROWS).fill(null).map(() => Array(ROOM_COLS).fill(null));
  myRoom.items.forEach(item => {
    if (item.row < ROOM_ROWS && item.col < ROOM_COLS) {
      grid[item.row][item.col] = item;
    }
  });

  const furnitureItems = inventory.filter(i =>
    i.category === 'furniture' || i.category === 'accessory' || (!i.category && i.emoji)
  );
  const wallItems = inventory.filter(i => i.category === 'wall');

  const placeItem = useCallback((row, col) => {
    if (!selectedItem) return;
    if (grid[row][col]) {
      showToast('이미 물건이 있어요!');
      return;
    }
    const newItems = [...myRoom.items, { ...selectedItem, row, col }];
    dispatch({ type: 'SET_MY_ROOM', room: { items: newItems } });
    dispatch({ type: 'USE_INVENTORY', id: selectedItem.id });
    const remaining = inventory.find(i => i.id === selectedItem.id);
    const remainQty = (remaining?.qty || 1) - 1;
    if (remainQty > 0) {
      showToast(`${selectedItem.emoji} ${selectedItem.name} 배치! (남은: ${remainQty})`);
    } else {
      setSelectedItem(null);
      showToast(`${selectedItem.emoji} ${selectedItem.name} 배치 완료!`);
    }
  }, [selectedItem, myRoom.items, grid, dispatch, showToast, inventory]);

  const removeItem = useCallback((row, col) => {
    const item = grid[row][col];
    if (!item) return;
    const newItems = myRoom.items.filter(i => !(i.row === row && i.col === col));
    dispatch({ type: 'SET_MY_ROOM', room: { items: newItems } });
    dispatch({ type: 'RETURN_INVENTORY', item });
    showToast(`${item.emoji} ${item.name} → 인벤토리로 회수`);
  }, [myRoom.items, grid, dispatch, showToast]);

  // 이동
  const moveRoomItem = useCallback((row, col) => {
    if (!movingItem) return;
    // 아바타가 있는 셀은 아바타 이동 시 무시
    const target = grid[row]?.[col];
    if (target && !target._isAvatar) {
      showToast('빈 곳을 터치하세요!');
      return;
    }
    if (movingItem._isAvatar) {
      dispatch({ type: 'SET_MY_ROOM', room: { avatarPos: { row, col } } });
      showToast('아바타 이동 완료!');
      setMovingItem(null);
      return;
    }
    if (target) { showToast('빈 곳을 터치하세요!'); return; }
    const newItems = myRoom.items.map(i =>
      i.row === movingItem.row && i.col === movingItem.col ? { ...i, row, col } : i
    );
    dispatch({ type: 'SET_MY_ROOM', room: { items: newItems } });
    showToast(`${movingItem.emoji} 이동 완료!`);
    setMovingItem(null);
  }, [movingItem, myRoom.items, grid, dispatch, showToast]);

  const handleLongPress = (row, col) => {
    if (viewOnly) return;
    const cell = grid[row][col];
    if (!cell) return;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      setMovingItem(cell);
      showToast(`${cell.emoji} ${cell.name} 이동할 곳을 터치하세요`);
    }, 600);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const cellClick = (row, col) => {
    if (movingItem) {
      moveRoomItem(row, col);
      return;
    }
    if (selectedItem) {
      placeItem(row, col);
    } else if (grid[row][col] && !grid[row][col]._isAvatar && !viewOnly) {
      removeItem(row, col);
    }
  };

  const applyWallpaper = useCallback((wp) => {
    dispatch({ type: 'SET_MY_ROOM', room: { wallpaper: wp.id } });
    showToast(`${wp.name} 벽지 적용!`);
  }, [dispatch, showToast]);

  const applyFloor = useCallback((fl) => {
    dispatch({ type: 'SET_MY_ROOM', room: { floor: fl.id } });
    showToast(`${fl.name} 바닥 적용!`);
  }, [dispatch, showToast]);

  const selectForPlace = useCallback((item) => {
    setSelectedItem(item);
    setShowInventory(false);
    showToast(`${item.emoji} ${item.name} — 배치할 곳을 터치하세요`);
  }, [showToast]);

  return (
    <div>
      <div className="card" style={{ padding: 8, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, padding: '0 6px' }}>
          <div className="card-title" style={{ margin: 0 }}>
            🏠 내 방
            <button onClick={toggleBgm} style={{
              marginLeft: 8, fontSize: 11, background: 'none', border: 'none',
              color: bgmPlaying ? 'var(--primary)' : 'var(--text-dim)',
              cursor: 'pointer', fontFamily: 'var(--font-main)',
            }}>{bgmPlaying ? '♪ 재생 중' : '♪ BGM'}</button>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{ROOM_COLS}×{ROOM_ROWS}</span>
        </div>

        {selectedItem && (
          <div style={{ margin: '0 6px 6px', padding: '6px 10px', background: 'var(--primary-soft)', borderRadius: 8, fontSize: 12, color: 'var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selectedItem.emoji} {selectedItem.name} 배치할 곳을 터치</span>
            <button onClick={() => setSelectedItem(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-main)' }}>취소</button>
          </div>
        )}

        {movingItem && (
          <div style={{ margin: '0 6px 6px', padding: '6px 10px', background: 'var(--secondary-soft)', borderRadius: 8, fontSize: 12, color: 'var(--secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{movingItem.emoji} {movingItem.name} 이동할 곳을 터치</span>
            <button onClick={() => setMovingItem(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-main)' }}>취소</button>
          </div>
        )}

        {/* 아이소메트릭 방 (벽 + 바닥 + 가구) */}
        {(() => {
          const FLOOR_Y = 90;
          // 바닥 다이아몬드 4꼭짓점: top, left, right, bottom
          const topPt = { x: isoX(0, 0) + ISO_OFFSET_X + TW / 2, y: isoY(0, 0) + FLOOR_Y };
          const leftPt = { x: isoX(ROOM_ROWS - 1, 0) + ISO_OFFSET_X, y: isoY(ROOM_ROWS - 1, 0) + FLOOR_Y + TH / 2 };
          const rightPt = { x: isoX(0, ROOM_COLS - 1) + ISO_OFFSET_X + TW, y: isoY(0, ROOM_COLS - 1) + FLOOR_Y + TH / 2 };
          const WH = 80;

          return (
            <div
              style={{ position: 'relative', width: '100%', height: 380, overflow: 'hidden', cursor: 'grab', touchAction: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'top center', position: 'relative', width: '100%', height: ISO_H + WH + 30 }}>
              {/* 왼쪽 벽 */}
              <div style={{
                position: 'absolute', zIndex: 0,
                left: 0, top: 0, width: '100%', height: '100%',
                clipPath: `polygon(${leftPt.x}px ${leftPt.y - WH}px, ${topPt.x}px ${topPt.y - WH}px, ${topPt.x}px ${topPt.y}px, ${leftPt.x}px ${leftPt.y}px)`,
                background: currentWp.bg,
                backgroundSize: currentWp.bgSize || 'auto',
                filter: 'brightness(0.82)',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.06), transparent)' }} />
              </div>

              {/* 오른쪽 벽 */}
              <div style={{
                position: 'absolute', zIndex: 0,
                left: 0, top: 0, width: '100%', height: '100%',
                clipPath: `polygon(${topPt.x}px ${topPt.y - WH}px, ${rightPt.x}px ${rightPt.y - WH}px, ${rightPt.x}px ${rightPt.y}px, ${topPt.x}px ${topPt.y}px)`,
                background: currentWp.bg,
                backgroundSize: currentWp.bgSize || 'auto',
                filter: 'brightness(0.92)',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(0,0,0,0.04), transparent)' }} />
              </div>

              {/* 벽 윗선 */}
              <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <polyline points={`${leftPt.x},${leftPt.y - WH} ${topPt.x},${topPt.y - WH} ${rightPt.x},${rightPt.y - WH}`}
                  fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
              </svg>

              {/* 바닥 + 가구 레이어 */}
              <div style={{ position: 'relative', width: '100%', height: ISO_H + 90, zIndex: 1 }}>
            {Array(ROOM_ROWS).fill(null).map((_, r) =>
              Array(ROOM_COLS).fill(null).map((_, c) => {
                const cell = grid[r][c];
                const key = `${r}-${c}`;
                const sx = isoX(r, c) + ISO_OFFSET_X;
                const sy = isoY(r, c) + 90;
                const isEven = (r + c) % 2 === 0;
                const isMovingThis = movingItem && movingItem.row === r && movingItem.col === c;

                if (cell) {
                  return (
                    <div key={key} style={{ position: 'absolute', left: sx, top: sy, zIndex: r + c + 1 }}>
                      {/* 바닥 타일 */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0,
                        width: TW, height: TH,
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        background: isEven ? currentFloor.tileColor : currentFloor.tileAlt,
                      }} />
                      {/* 가구 */}
                      <div
                        style={{
                          position: 'absolute', left: TW / 2, top: -10,
                          transform: 'translateX(-50%)',
                          fontSize: 22, lineHeight: 1, cursor: 'pointer',
                          filter: isMovingThis ? 'drop-shadow(0 0 4px rgba(110,181,255,0.6))' : 'none',
                          transition: 'filter 0.2s',
                        }}
                        onClick={() => cellClick(r, c)}
                        onPointerDown={() => handleLongPress(r, c)}
                        onPointerUp={cancelLongPress}
                        onPointerLeave={cancelLongPress}
                        onTouchStart={() => handleLongPress(r, c)}
                        onTouchEnd={cancelLongPress}
                        onContextMenu={e => e.preventDefault()}
                      >
                        {cell.emoji}
                      </div>
                    </div>
                  );
                }

                // 빈 셀
                return (
                  <div
                    key={key}
                    style={{
                      position: 'absolute', left: sx, top: sy,
                      width: TW, height: TH,
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      background: selectedItem
                        ? 'rgba(76,175,80,0.2)'
                        : movingItem
                          ? 'rgba(110,181,255,0.2)'
                          : isEven ? currentFloor.tileColor : currentFloor.tileAlt,
                      cursor: (selectedItem || movingItem) ? 'pointer' : 'default',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => cellClick(r, c)}
                  />
                );
              })
            )}
            {/* 내 아바타 (그리드 위 배치) */}
            {(() => {
              const avatarPos = myRoom.avatarPos || { row: Math.floor(ROOM_ROWS / 2), col: Math.floor(ROOM_COLS / 2) };
              const ar = avatarPos.row, ac = avatarPos.col;
              const ax = isoX(ar, ac) + ISO_OFFSET_X + TW / 2;
              const ay = isoY(ar, ac) + 90;
              // 아바타 셀을 점유 표시
              if (ar < ROOM_ROWS && ac < ROOM_COLS && !grid[ar][ac]) {
                grid[ar][ac] = { _isAvatar: true };
              }
              return (
                <div
                  style={{
                    position: 'absolute', left: ax, top: ay,
                    transform: 'translateX(-50%)',
                    zIndex: ar + ac + 10,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  onPointerDown={() => {
                    if (viewOnly) return;
                    if (longPressTimer.current) clearTimeout(longPressTimer.current);
                    longPressTimer.current = setTimeout(() => {
                      longPressTimer.current = null;
                      setMovingItem({ _isAvatar: true, row: ar, col: ac, emoji: '🧑', name: '아바타' });
                      showToast('아바타 이동할 곳을 터치하세요');
                    }, 600);
                  }}
                  onPointerUp={cancelLongPress}
                  onPointerLeave={cancelLongPress}
                  onTouchStart={() => {
                    if (viewOnly) return;
                    if (longPressTimer.current) clearTimeout(longPressTimer.current);
                    longPressTimer.current = setTimeout(() => {
                      longPressTimer.current = null;
                      setMovingItem({ _isAvatar: true, row: ar, col: ac, emoji: '🧑', name: '아바타' });
                      showToast('아바타 이동할 곳을 터치하세요');
                    }, 600);
                  }}
                  onTouchEnd={cancelLongPress}
                  onContextMenu={e => e.preventDefault()}
                >
                  {/* 말풍선 */}
                  {bubbleText && (
                    <div style={{
                      position: 'relative',
                      background: '#fff', borderRadius: 8, padding: '3px 8px',
                      fontSize: 9, color: 'var(--text)', fontWeight: 500,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                      marginBottom: 8, marginTop: -20, maxWidth: 100, wordBreak: 'break-word',
                      border: '1px solid var(--border-light)',
                    }}>
                      {bubbleText}
                      <div style={{
                        position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid #fff',
                      }} />
                    </div>
                  )}
                  <div style={{ lineHeight: 1 }}>
                    <DotAvatar pixels={state.avatar.pixels} size={36} />
                  </div>
                  <div style={{
                    fontSize: 8, fontWeight: 600, color: 'var(--text-dim)',
                    marginTop: 1, whiteSpace: 'nowrap',
                  }}>
                    {state.user?.displayName || 'Me'}
                  </div>
                </div>
              );
            })()}
          </div>
          </div>
          </div>
          );
        })()}

        <div style={{ fontSize: 10, color: 'var(--text-dim)', padding: '4px 6px 0' }}>
          터치: 배치/회수 | 꾹 누르기: 이동
        </div>
      </div>

      {!viewOnly && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 10 }}
          onClick={() => setShowInventory(!showInventory)}
        >
          📦 인벤토리 {showInventory ? '닫기' : '열기'}
        </button>
      )}

      {showInventory && !viewOnly && (
        <div className="card">
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[
              { id: 'furniture', label: '가구/장식' },
              { id: 'wall', label: '벽지' },
              { id: 'floor', label: '바닥' },
            ].map(t => (
              <button
                key={t.id}
                className={`btn ${invTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '6px 0', fontSize: 11 }}
                onClick={() => setInvTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {invTab === 'furniture' && (
            furnitureItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)', fontSize: 12 }}>
                가구가 없어요. 제작 탭에서 만들어보세요!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {furnitureItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => selectForPlace(item)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      padding: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                      borderRadius: 8, cursor: 'pointer', color: 'var(--text)',
                      position: 'relative', fontFamily: 'inherit',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{item.emoji}</span>
                    <span style={{ fontSize: 10 }}>{item.name}</span>
                    {(item.qty || 1) > 1 && (
                      <span style={{
                        position: 'absolute', top: 3, right: 3,
                        background: 'var(--primary)', color: '#fff',
                        borderRadius: '50%', width: 16, height: 16,
                        fontSize: 9, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{item.qty}</span>
                    )}
                  </button>
                ))}
              </div>
            )
          )}

          {invTab === 'wall' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {WALLPAPERS.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => applyWallpaper(wp)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: 8,
                    background: wp.bg, backgroundSize: wp.bgSize || 'auto',
                    border: `2px solid ${myRoom.wallpaper === wp.id ? 'var(--primary)' : 'var(--border-light)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    fontFamily: 'inherit', minHeight: 50,
                  }}
                >
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: wp.id === 'night' ? '#fff' : 'var(--text)',
                    textShadow: wp.id === 'night' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                  }}>{wp.name}</span>
                  {myRoom.wallpaper === wp.id && <span style={{ fontSize: 8, color: 'var(--primary)' }}>적용 중</span>}
                </button>
              ))}
            </div>
          )}

          {invTab === 'floor' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {FLOORS.map(fl => (
                <button
                  key={fl.id}
                  onClick={() => applyFloor(fl)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: 10, position: 'relative',
                    background: 'var(--bg-surface)',
                    border: `2px solid ${(myRoom.floor || 'default') === fl.id ? 'var(--primary)' : 'var(--border-light)'}`,
                    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {/* 바닥 미니 프리뷰 */}
                  <div style={{
                    width: 30, height: 16,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    background: fl.tileColor,
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)' }}>{fl.name}</span>
                  {(myRoom.floor || 'default') === fl.id && <span style={{ fontSize: 8, color: 'var(--primary)' }}>적용 중</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
