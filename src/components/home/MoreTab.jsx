import { useApp } from '../../store/AppContext';
import { auth, signOut } from '../../firebase';

export default function MoreTab() {
  const { state, dispatch, showToast } = useApp();

  const goTo = (tab) => dispatch({ type: 'SET_TAB', tab });

  const handleLogout = async () => {
    await signOut(auth);
    dispatch({ type: 'RESET' });
  };

  const items = [
    { emoji: '🏠', label: '마이룸', sub: '방 꾸미기', tab: 'room' },
    { emoji: '🌳', label: '마이가든', sub: '건물/채집', tab: 'garden' },
    { emoji: '👤', label: '아바타', sub: '꾸미기', tab: 'avatar' },
    { emoji: '🏪', label: '마켓', sub: '아이템 거래', tab: 'market' },
  ];

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="friend-avatar" style={{ width: 50, height: 50, fontSize: 24 }}>😊</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-bright)' }}>
              {state.user?.displayName || '도토리'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{state.user?.email}</div>
            <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2 }}>🌰 {state.dotori.toLocaleString()} 도토리</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(item => (
          <button
            key={item.tab}
            className="friend-card"
            style={{ margin: 0 }}
            onClick={() => goTo(item.tab)}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(102,126,234,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {item.emoji}
            </div>
            <div className="friend-info">
              <div className="friend-name">{item.label}</div>
              <div className="friend-sub">{item.sub}</div>
            </div>
            <span style={{ color: 'var(--text-dim)' }}>›</span>
          </button>
        ))}
      </div>

      {/* 도토리 충전 */}
      <button
        onClick={() => showToast('충전 기능 준비 중이에요! 🌰')}
        style={{
          width: '100%', marginTop: 16, padding: 14,
          background: 'linear-gradient(135deg, #ffd54f, #ffab00)',
          border: 'none', borderRadius: 'var(--radius)',
          color: '#1a1a2e', fontSize: 15, fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        🌰 도토리 충전하기
      </button>

      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%', marginTop: 10, padding: 12,
          background: 'none', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-dim)', fontSize: 13,
          cursor: 'pointer',
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
