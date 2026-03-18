import { useState, useCallback } from 'react';
import { useApp } from '../../store/AppContext';

const RANDOM_GARDENS = [
  {
    uid: 'r1', name: '다람쥐맘', emoji: '🐿️', visitors: 42,
    bgm: '🎵 편안한 오후',
    buildings: [
      { emoji: '🏡', row: 1, col: 2 }, { emoji: '🌷', row: 2, col: 4 },
      { emoji: '🎣', row: 4, col: 3 }, { emoji: '🏰', row: 3, col: 5 },
    ],
  },
  {
    uid: 'r2', name: '음악왕', emoji: '🎸', visitors: 128,
    bgm: '🎵 레트로 감성',
    buildings: [
      { emoji: '⛏️', row: 1, col: 1 }, { emoji: '🏪', row: 2, col: 3 },
      { emoji: '🏡', row: 4, col: 5 }, { emoji: '🌷', row: 5, col: 2 },
      { emoji: '🏰', row: 1, col: 5 },
    ],
  },
  {
    uid: 'r3', name: '건축가', emoji: '🏗️', visitors: 67,
    bgm: '🎵 숲속 새소리',
    buildings: [
      { emoji: '🏰', row: 2, col: 3 }, { emoji: '🏰', row: 2, col: 4 },
      { emoji: '⛏️', row: 4, col: 1 }, { emoji: '⛏️', row: 4, col: 2 },
      { emoji: '🏡', row: 5, col: 5 }, { emoji: '🎣', row: 1, col: 1 },
    ],
  },
  {
    uid: 'r4', name: '별이', emoji: '⭐', visitors: 203,
    bgm: '🎵 빗소리',
    buildings: [
      { emoji: '🌷', row: 1, col: 2 }, { emoji: '🌷', row: 1, col: 4 },
      { emoji: '🌷', row: 3, col: 3 }, { emoji: '🏡', row: 5, col: 3 },
    ],
  },
  {
    uid: 'r5', name: '요리사', emoji: '👨‍🍳', visitors: 31,
    bgm: null,
    buildings: [
      { emoji: '🏪', row: 1, col: 3 }, { emoji: '🏡', row: 3, col: 2 },
      { emoji: '🎣', row: 5, col: 5 },
    ],
  },
];

// 고정 채집 스팟 (정원과 동일)
const HARVEST_SPOTS = [
  { emoji: '🌲', row: 0, col: 0 }, { emoji: '🌲', row: 0, col: 6 },
  { emoji: '🪨', row: 6, col: 0 }, { emoji: '🪨', row: 6, col: 6 },
  { emoji: '🌿', row: 3, col: 0 }, { emoji: '🌿', row: 3, col: 6 },
];

function GardenPreview({ garden }) {
  const grid = Array(7).fill(null).map(() => Array(7).fill(null));
  HARVEST_SPOTS.forEach(s => { grid[s.row][s.col] = s.emoji; });
  garden.buildings.forEach(b => { grid[b.row][b.col] = b.emoji; });

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 2, padding: 6,
      background: 'rgba(255,200,160,0.25)',
      border: '2px solid rgba(255,180,140,0.3)',
      borderRadius: 'var(--radius)', marginBottom: 12,
    }}>
      {grid.flat().map((cell, i) => (
        <div key={i} style={{
          aspectRatio: '1',
          background: cell ? 'rgba(255,138,61,0.06)' : '#faf5ef',
          borderRadius: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: cell ? 14 : 10,
        }}>
          {cell || ''}
        </div>
      ))}
    </div>
  );
}

export default function WaveSurf() {
  const { showToast } = useApp();
  const [surfing, setSurfing] = useState(false);
  const [currentGarden, setCurrentGarden] = useState(null);
  const [visitCount, setVisitCount] = useState(0);

  const startSurf = useCallback(() => {
    setSurfing(true);
    setCurrentGarden(null);

    setTimeout(() => {
      const garden = RANDOM_GARDENS[Math.floor(Math.random() * RANDOM_GARDENS.length)];
      setCurrentGarden(garden);
      setSurfing(false);
      setVisitCount(prev => prev + 1);
    }, 1500);
  }, []);

  const leaveGuestbook = useCallback(() => {
    showToast(`${currentGarden.name}님의 방명록에 글을 남겼어요!`);
  }, [currentGarden, showToast]);

  const addFriend = useCallback(() => {
    showToast(`${currentGarden.emoji} ${currentGarden.name}님에게 친구 요청을 보냈어요!`);
  }, [currentGarden, showToast]);

  const requestWork = useCallback(() => {
    showToast(`${currentGarden.name}님에게 알바 신청을 보냈어요!`);
  }, [currentGarden, showToast]);

  return (
    <div>
      {/* 파도타기 카드 */}
      <div className="wave-card">
        <div className="wave-emoji">🏄</div>
        <div className="wave-title">파도타기</div>
        <div className="wave-sub">
          랜덤으로 다른 친구의 정원을 구경해보세요!
          {visitCount > 0 && <><br />오늘 {visitCount}곳 방문했어요</>}
        </div>
        <button
          className={`btn-wave${surfing ? ' surfing' : ''}`}
          onClick={startSurf}
          disabled={surfing}
        >
          {surfing ? '파도 타는 중...' : '🌊 파도타기 출발!'}
        </button>
      </div>

      {/* 방문한 정원 */}
      {currentGarden && (
        <div className="card" style={{ animation: 'msgIn 0.4s ease' }}>
          {/* 주인 프로필 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="friend-avatar" style={{ width: 50, height: 50, fontSize: 24 }}>
              {currentGarden.emoji}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-bright)' }}>
                {currentGarden.name}의 정원
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                👀 방문자 {currentGarden.visitors}명 · 건물 {currentGarden.buildings.length}개
              </div>
            </div>
          </div>

          {/* 정원 프리뷰 */}
          <GardenPreview garden={currentGarden} />

          {/* BGM */}
          {currentGarden.bgm && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: 'var(--primary-soft)',
              borderRadius: 8, marginBottom: 12, fontSize: 12, color: 'var(--primary)',
            }}>
              ♪ {currentGarden.bgm} 재생 중
            </div>
          )}

          {/* 액션 버튼 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-send" style={{ flex: 1 }} onClick={leaveGuestbook}>
              📝 방명록
            </button>
            <button className="friend-action add" style={{ padding: '10px 14px', fontSize: 13, borderRadius: 'var(--radius)' }} onClick={requestWork}>
              ⚒️ 알바 신청
            </button>
            <button className="friend-action visit" style={{ padding: '10px 14px', fontSize: 13, borderRadius: 'var(--radius)' }} onClick={addFriend}>
              친구 추가
            </button>
          </div>

          {/* 다음 파도 */}
          <button
            onClick={startSurf}
            style={{
              width: '100%', marginTop: 10, padding: '10px',
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text-dim)', fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font-main)',
            }}
          >
            🌊 다음 파도 타기
          </button>
        </div>
      )}
    </div>
  );
}
