import { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import MyRoom from '../room/MyRoom';

const RECENT_DIARY = [
  { id: 1, text: '오늘 드디어 마이가든에 탑 세웠다! 🏰 재료 모으느라 3일 걸림 ㅋㅋ', time: '30분 전', likes: 12 },
  { id: 2, text: '마이룸 벽지 바꿨는데 어때? 밤하늘 테마로 했어 ✨', time: '3시간 전', likes: 24 },
  { id: 3, text: '도토리정원 시작한 지 일주일! 친구 4명 사귀고 농장 지었어', time: '어제', likes: 38 },
];

const RECENT_GUESTBOOK = [
  { id: 1, name: '다람쥐', emoji: '🐿️', text: '방 너무 이쁘다!! 나도 이렇게 꾸미고 싶어 ㅋㅋ', time: '1시간 전' },
  { id: 2, name: '솔방울', emoji: '🌰', text: '놀러왔어~ 가든 구경했는데 대박이야!', time: '5시간 전' },
  { id: 3, name: '도토리맘', emoji: '🌳', text: '파도타기로 왔는데 센스 좋으시네요 :)', time: '어제' },
];

export default function HomeTab() {
  const { state, dispatch } = useApp();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (state.user?.displayName && !title) {
      setTitle(`${state.user.displayName}의 도토리정원`);
    }
  }, [state.user?.displayName]);
  const [statusMsg, setStatusMsg] = useState('오늘도 즐거운 하루 보내세요!');

  return (
    <div>
      {/* 싸이월드 스타일 프로필 사진 + TODAY IS */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 12,
      }}>
        {/* 왼쪽: 대표 사진 */}
        <div style={{
          flex: '0 0 140px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius)',
          padding: 8,
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600 }}>
            TODAY IS...
          </div>
          <div style={{
            width: '100%', aspectRatio: '3/4',
            borderRadius: 6, overflow: 'hidden',
            border: '2px solid var(--border-light)',
            background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
          }}>
            {state.user?.photoURL ? (
              <img
                src={state.user.photoURL}
                alt="프로필"
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 48,
              }}>😊</div>
            )}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-bright)',
            textAlign: 'center', marginTop: 8,
          }}>
            {state.user?.displayName || '도토리'}
          </div>
        </div>

        {/* 오른쪽: 상태 + 카운터 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* 상태메시지 배너 */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ffb347 0%, #ff7eb3 50%, #b8a9e8 100%)',
              borderRadius: 'var(--radius)',
              padding: '14px',
              position: 'relative',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {/* BGM 미니 */}
            {state.myRoom.bgm && (
              <div className="bgm-mini">
                <div className="bgm-visualizer">
                  <span className="bgm-bar" style={{ animationDelay: '0s' }} />
                  <span className="bgm-bar" style={{ animationDelay: '0.2s' }} />
                  <span className="bgm-bar" style={{ animationDelay: '0.4s' }} />
                </div>
                <span>
                  {state.myRoom.bgm === 'chill' && '편안한 오후'}
                  {state.myRoom.bgm === 'retro' && '레트로 감성'}
                  {state.myRoom.bgm === 'rain' && '빗소리'}
                  {state.myRoom.bgm === 'forest' && '숲속 새소리'}
                </span>
              </div>
            )}
            {/* 제목 */}
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={20}
                onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                onBlur={() => setEditingTitle(false)}
                style={{
                  width: '100%', padding: '2px 6px', fontSize: 16, fontWeight: 800,
                  background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: 6, color: '#fff', outline: 'none',
                  fontFamily: 'inherit', textShadow: '0 1px 4px rgba(0,0,0,0.1)',
                }}
              />
            ) : (
              <div
                onClick={() => setEditingTitle(true)}
                style={{ fontSize: 16, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }}
              >
                {title}
              </div>
            )}

            {/* 상태메시지 */}
            {editingStatus ? (
              <div style={{ marginTop: 6 }}>
                <input
                  autoFocus
                  value={statusMsg}
                  onChange={e => setStatusMsg(e.target.value)}
                  maxLength={50}
                  onKeyDown={e => e.key === 'Enter' && setEditingStatus(false)}
                  onBlur={() => setEditingStatus(false)}
                  style={{
                    width: '100%', padding: '4px 8px', fontSize: 11,
                    background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: 6, color: '#fff', outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  placeholder="상태메시지를 입력하세요..."
                />
              </div>
            ) : (
              <div
                onClick={() => setEditingStatus(true)}
                style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 6, lineHeight: 1.5, cursor: 'pointer' }}
              >
                {statusMsg} ✏️
              </div>
            )}
          </div>

          {/* 카운터 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{
                flex: 1, textAlign: 'center', padding: '8px 2px',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>42</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 1 }}>TODAY</div>
              </div>
              <div style={{
                flex: 1, textAlign: 'center', padding: '8px 2px',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--pink)' }}>1,284</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 1 }}>TOTAL</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{
                flex: 1, textAlign: 'center', padding: '8px 2px',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--secondary)' }}>4</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 1 }}>서로친구</div>
              </div>
              <div style={{
                flex: 1, textAlign: 'center', padding: '8px 2px',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--lavender)' }}>3</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 1 }}>팔로워</div>
              </div>
              <div style={{
                flex: 1, textAlign: 'center', padding: '8px 2px',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--mint)' }}>4</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 1 }}>팔로잉</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 마이룸 */}
      <MyRoom viewOnly />

      {/* 최근 다이어리 */}
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="card-title" style={{ margin: 0 }}>📔 최근 다이어리</div>
          <button
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'profile' })}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--primary)', fontFamily: 'inherit',
            }}
          >전체보기 ›</button>
        </div>
        {RECENT_DIARY.map(post => (
          <div key={post.id} style={{
            padding: '10px 0',
            borderBottom: '1px solid var(--border-light)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-bright)', lineHeight: 1.5 }}>{post.text}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 11, color: 'var(--text-dim)' }}>
              <span>{post.time}</span>
              <span>💜 {post.likes}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 최근 방명록 */}
      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="card-title" style={{ margin: 0 }}>📝 방명록</div>
          <button
            onClick={() => dispatch({ type: 'SET_TAB', tab: 'social' })}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--primary)', fontFamily: 'inherit',
            }}
          >전체보기 ›</button>
        </div>
        {RECENT_GUESTBOOK.map(entry => (
          <div key={entry.id} style={{
            display: 'flex', gap: 10, padding: '10px 0',
            borderBottom: '1px solid var(--border-light)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #ffb347, #ff7eb3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>{entry.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-bright)' }}>{entry.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 2, lineHeight: 1.4 }}>{entry.text}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{entry.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
