import { useState } from 'react';
import { useApp } from '../../store/AppContext';

// 데모 마켓 아이템
const DEMO_LISTINGS = [
  { id: 1, seller: '다람쥐맘', emoji: '✨', name: '황금나무', type: 'rare', price: 50, category: '재료' },
  { id: 2, seller: '숲지기', emoji: '💎', name: '무지개석', type: 'rare', price: 80, category: '재료' },
  { id: 3, seller: '음악왕', emoji: '🎵', name: '새벽 감성 BGM', type: 'bgm', price: 15, category: '음악' },
  { id: 4, seller: '패션왕', emoji: '👑', name: '왕관', type: 'accessory', price: 30, category: '아이템' },
  { id: 5, seller: '목수', emoji: '🪵', name: '나무 x10', type: 'resource', price: 20, category: '재료' },
  { id: 6, seller: '광부', emoji: '⚙️', name: '철 x5', type: 'resource', price: 25, category: '재료' },
  { id: 7, seller: '어부', emoji: '🐟', name: '물고기 x8', type: 'resource', price: 18, category: '재료' },
  { id: 8, seller: 'DJ토끼', emoji: '🎵', name: '레트로 팝 BGM', type: 'bgm', price: 12, category: '음악' },
];

export default function Market() {
  const { state, showToast } = useApp();
  const [tab, setTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = DEMO_LISTINGS.filter(item => {
    if (tab !== 'all' && item.category !== tab) return false;
    if (searchTerm && !item.name.includes(searchTerm) && !item.seller.includes(searchTerm)) return false;
    return true;
  });

  const handleBuy = (item) => {
    if (state.dotori < item.price) {
      showToast('도토리가 부족해요 🌰');
      return;
    }
    showToast(`${item.emoji} ${item.name} 구매 완료! (데모)`);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🏪 도토리 마켓</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
          유저들의 아이템을 사고팔 수 있어요
        </div>

        {/* 검색 */}
        <input
          type="text"
          placeholder="아이템/판매자 검색..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)', borderRadius: 8,
            color: 'var(--text)', fontSize: 13, marginBottom: 12, outline: 'none',
          }}
        />

        {/* 카테고리 필터 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[
            { id: 'all', label: '전체' },
            { id: '재료', label: '재료' },
            { id: '음악', label: '음악' },
            { id: '아이템', label: '아이템' },
          ].map(t => (
            <button
              key={t.id}
              className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '6px 0', fontSize: 12 }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-surface)', borderRadius: 8, fontSize: 20,
                  border: item.type === 'rare' ? '1px solid var(--gold)' : '1px solid var(--border-light)',
                }}>
                  {item.emoji}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: item.type === 'rare' ? 'var(--gold)' : 'var(--text-bright)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    판매자: {item.seller}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-gold"
                style={{ padding: '6px 14px', fontSize: 12 }}
                onClick={() => handleBuy(item)}
              >
                🌰 {item.price}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontSize: 13 }}>
            검색 결과가 없어요
          </div>
        )}
      </div>
    </div>
  );
}
