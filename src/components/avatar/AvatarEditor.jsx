import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';

// 이미지 → 픽셀 배열 변환 (원본 비율 유지, 캔버스 중앙 배치)
function imageToPixels(src, canvasW, canvasH) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      // 원본 비율 유지, 정수배 스케일링 (도트 깨짐 방지)
      const maxScale = Math.min(canvasW / img.width, canvasH / img.height);
      const scale = Math.max(1, Math.floor(maxScale)); // 1x, 2x, 3x...
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = Math.round((canvasW - dw) / 2);
      const dy = Math.round((canvasH - dh) / 2);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, dx, dy, dw, dh);
      const data = ctx.getImageData(0, 0, canvasW, canvasH).data;
      const pixels = Array(canvasH).fill(null).map(() => Array(canvasW).fill(null));
      for (let r = 0; r < canvasH; r++) {
        for (let c = 0; c < canvasW; c++) {
          const i = (r * canvasW + c) * 4;
          const a = data[i + 3];
          if (a < 128) continue;
          const red = data[i], green = data[i + 1], blue = data[i + 2];
          pixels[r][c] = `#${red.toString(16).padStart(2,'0')}${green.toString(16).padStart(2,'0')}${blue.toString(16).padStart(2,'0')}`;
        }
      }
      resolve(pixels);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const GRID_W = 48; // 가로
const GRID_H = 64; // 세로
const CELL = 9; // 각 픽셀 크기(px)

// 기본 팔레트
const PALETTE = [
  // 피부
  '#fde0c8', '#f5c9a0', '#e8b88a', '#d4a574', '#a0785a', '#6b4c3b',
  // 머리/눈
  '#2c2c2c', '#4a3728', '#5a3825', '#8b6914', '#c4a35a', '#d4553a',
  // 옷 색상
  '#ff6b6b', '#ff8a3d', '#ffb347', '#4cd964', '#34c759', '#6eb5ff', '#3a7bd4', '#b8a9e8', '#ff7eb3',
  // 기본
  '#ffffff', '#e0e0e0', '#cccccc', '#888888', '#444444', '#000000',
  // 투명
  null,
];

// 빈 캔버스 (이미지 로드 전 기본값)
export const DEFAULT_AVATAR = Array(GRID_H).fill(null).map(() => Array(GRID_W).fill(null));

// 기본 아바타 이미지 로드
export function loadDefaultAvatar() {
  return imageToPixels('/기본아바타.png', GRID_W, GRID_H);
}

export default function AvatarEditor({ onClose }) {
  const { state, dispatch, showToast } = useApp();
  const [pixels, setPixels] = useState(() => {
    if (state.avatar.pixels && state.avatar.pixels.some(row => row.some(c => c))) {
      return state.avatar.pixels.map(row => [...row]);
    }
    return DEFAULT_AVATAR.map(row => [...row]);
  });

  // 저장된 아바타 없으면 이미지에서 로드
  useEffect(() => {
    if (state.avatar.pixels && state.avatar.pixels.some(row => row.some(c => c))) return;
    loadDefaultAvatar().then(loaded => {
      if (loaded) {
        setPixels(loaded);
        dispatch({ type: 'SET_AVATAR', avatar: { pixels: loaded } });
      }
    });
  }, []); // eslint-disable-line
  const [color, setColor] = useState('#2c2c2c');
  const [tool, setTool] = useState('pen'); // pen, eraser, fill
  const [showGrid, setShowGrid] = useState(true);
  const isDrawing = useRef(false);
  const [history, setHistory] = useState([]);
  const [bubbleText, setBubbleText] = useState(state.avatar.bubbleText || '');
  const [editorZoom, setEditorZoom] = useState(1);

  // 히스토리 저장
  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-20), pixels.map(row => [...row])]);
  }, [pixels]);

  // 되돌리기
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setPixels(prev);
    setHistory(h => h.slice(0, -1));
  }, [history]);

  // 채우기 (flood fill)
  const floodFill = useCallback((row, col, targetColor) => {
    if (targetColor === color) return;
    saveHistory();
    const newPixels = pixels.map(r => [...r]);
    const stack = [[row, col]];
    while (stack.length > 0) {
      const [r, c] = stack.pop();
      if (r < 0 || r >= GRID_H || c < 0 || c >= GRID_W) continue;
      if (newPixels[r][c] !== targetColor) continue;
      newPixels[r][c] = color;
      stack.push([r-1,c],[r+1,c],[r,c-1],[r,c+1]);
    }
    setPixels(newPixels);
  }, [pixels, color, saveHistory]);

  // 픽셀 찍기
  const paint = useCallback((row, col) => {
    if (tool === 'fill') {
      floodFill(row, col, pixels[row][col]);
      return;
    }
    const newColor = tool === 'eraser' ? null : color;
    if (pixels[row][col] === newColor) return;
    const newPixels = pixels.map(r => [...r]);
    newPixels[row][col] = newColor;
    setPixels(newPixels);
  }, [tool, color, pixels, floodFill]);

  const handlePointerDown = useCallback((row, col) => {
    saveHistory();
    isDrawing.current = true;
    paint(row, col);
  }, [paint, saveHistory]);

  const handlePointerMove = useCallback((row, col) => {
    if (!isDrawing.current) return;
    paint(row, col);
  }, [paint]);

  const handlePointerUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  // 전체 지우기
  const clearAll = useCallback(() => {
    saveHistory();
    setPixels(Array(GRID_H).fill(null).map(() => Array(GRID_W).fill(null)));
    showToast('전체 지우기!');
  }, [saveHistory, showToast]);

  // 기본 템플릿 불러오기
  const loadTemplate = useCallback(() => {
    saveHistory();
    setPixels(DEFAULT_AVATAR.map(row => [...row]));
    showToast('기본 템플릿 로드!');
  }, [saveHistory, showToast]);

  // 저장
  const saveAvatar = useCallback(() => {
    dispatch({ type: 'SET_AVATAR', avatar: { pixels, bubbleText } });
    showToast('아바타 저장 완료! 🎨');
    if (onClose) onClose();
  }, [pixels, bubbleText, dispatch, showToast, onClose]);

  // 좌우 반전
  const flipH = useCallback(() => {
    saveHistory();
    setPixels(pixels.map(row => [...row].reverse()));
    showToast('좌우 반전!');
  }, [pixels, saveHistory, showToast]);

  return (
    <div>
      {/* 캔버스 */}
      <div className="card" style={{ padding: 10, textAlign: 'center' }}>
        <div className="card-title">🎨 도트 아바타</div>

        {/* 줌 컨트롤 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, justifyContent: 'flex-end' }}>
          <button onClick={() => setEditorZoom(prev => Math.max(0.5, prev - 0.25))}
            style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-main)' }}>−</button>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', minWidth: 32, textAlign: 'center' }}>{Math.round(editorZoom * 100)}%</span>
          <button onClick={() => setEditorZoom(prev => Math.min(3, prev + 0.25))}
            style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-main)' }}>+</button>
          {editorZoom !== 1 && (
            <button onClick={() => setEditorZoom(1)}
              style={{ padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', fontSize: 9, cursor: 'pointer', color: 'var(--text-dim)', fontFamily: 'var(--font-main)' }}>리셋</button>
          )}
        </div>

        <div style={{ overflow: 'auto', maxHeight: 400, border: '1px solid var(--border-light)', borderRadius: 6, touchAction: tool === 'move' ? 'auto' : 'none' }}>
        <div
          style={{
            display: 'inline-grid',
            gridTemplateColumns: `repeat(${GRID_W}, ${CELL * editorZoom}px)`,
            gridTemplateRows: `repeat(${GRID_H}, ${CELL * editorZoom}px)`,
            gap: 0,
            background: 'transparent',
            borderRadius: 4,
            padding: 1,
            imageRendering: 'pixelated',
            touchAction: tool === 'move' ? 'auto' : 'none',
          }}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {pixels.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  width: CELL * editorZoom, height: CELL * editorZoom,
                  background: cell || 'transparent',
                  outline: showGrid ? '0.5px solid rgba(0,0,0,0.06)' : 'none',
                  cursor: 'crosshair',
                }}
                onPointerDown={(e) => {
                  if (tool === 'move') return;
                  if (tool === 'pick') {
                    if (pixels[r][c]) { setColor(pixels[r][c]); setTool('pen'); showToast(`색상 ${pixels[r][c]} 선택!`); }
                    return;
                  }
                  e.preventDefault(); handlePointerDown(r, c);
                }}
                onPointerEnter={() => { if (tool === 'move') return; handlePointerMove(r, c); }}
              />
            ))
          )}
        </div>
        </div>{/* 스크롤 컨테이너 */}

        {/* 프리뷰 */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>미리보기:</span>
          <canvas
            ref={el => {
              if (!el) return;
              const ctx = el.getContext('2d');
              ctx.clearRect(0, 0, GRID_W, GRID_H);
              pixels.forEach((row, r) =>
                row.forEach((cell, c) => {
                  if (!cell) return;
                  ctx.fillStyle = cell;
                  ctx.fillRect(c, r, 1, 1);
                })
              );
            }}
            width={GRID_W} height={GRID_H}
            style={{ width: 48, height: 64, imageRendering: 'pixelated', border: '1px solid var(--border-light)', borderRadius: 4 }}
          />
          <canvas
            ref={el => {
              if (!el) return;
              const ctx = el.getContext('2d');
              ctx.clearRect(0, 0, GRID_W, GRID_H);
              pixels.forEach((row, r) =>
                row.forEach((cell, c) => {
                  if (!cell) return;
                  ctx.fillStyle = cell;
                  ctx.fillRect(c, r, 1, 1);
                })
              );
            }}
            width={GRID_W} height={GRID_H}
            style={{ width: 96, height: 128, imageRendering: 'pixelated', border: '1px solid var(--border-light)', borderRadius: 4 }}
          />
        </div>
      </div>

      {/* 도구 */}
      <div className="card" style={{ padding: 10 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[
            { id: 'pen', label: '✏️ 펜', },
            { id: 'eraser', label: '🧹 지우개' },
            { id: 'fill', label: '🪣 채우기' },
            { id: 'pick', label: '💧 스포이드' },
            { id: 'move', label: '✋ 이동' },
          ].map(t => (
            <button
              key={t.id}
              className={`btn ${tool === t.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '8px 0', fontSize: 11 }}
              onClick={() => setTool(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {/* 현재 색상 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: color || 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px',
            border: '2px solid var(--border)',
          }} />
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>현재 색상</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, color: 'var(--text-dim)', cursor: 'pointer',
            }}>
              <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} style={{ width: 14, height: 14 }} />
              격자
            </label>
          </div>
        </div>

        {/* 팔레트 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {PALETTE.map((c, i) => (
            <div
              key={i}
              onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
              style={{
                width: 24, height: 24, borderRadius: 4, cursor: 'pointer',
                background: c || 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 6px 6px',
                border: `2px solid ${color === c ? 'var(--primary)' : 'var(--border-light)'}`,
                boxShadow: color === c ? '0 0 0 2px var(--primary-soft)' : 'none',
              }}
            />
          ))}
          {/* 커스텀 색상 */}
          <label style={{
            width: 24, height: 24, borderRadius: 4, cursor: 'pointer',
            background: 'linear-gradient(135deg, red, yellow, green, blue, purple)',
            border: '2px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, overflow: 'hidden', position: 'relative',
          }}>
            <input
              type="color"
              value={color || '#000000'}
              onChange={e => { setColor(e.target.value); setTool('pen'); }}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 11 }} onClick={undo}>↩ 되돌리기</button>
        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 11 }} onClick={flipH}>↔ 반전</button>
        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 11 }} onClick={loadTemplate}>📋 템플릿</button>
        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 11 }} onClick={clearAll}>🗑️ 초기화</button>
      </div>

      {/* 말풍선 */}
      <div className="card" style={{ padding: 10 }}>
        <div className="card-title">💬 말풍선</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={bubbleText}
            onChange={e => setBubbleText(e.target.value)}
            placeholder="마이룸 말풍선 메시지..."
            maxLength={30}
            className="msg-input"
            style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
          />
          {bubbleText && (
            <button className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 10px' }}
              onClick={() => setBubbleText('')}>지우기</button>
          )}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
          저장하면 마이룸 아바타 위에 표시돼요 ({bubbleText.length}/30)
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14 }} onClick={saveAvatar}>
        💾 아바타 저장
      </button>
    </div>
  );
}
