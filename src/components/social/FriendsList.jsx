import { useState, useCallback } from 'react';
import { useApp } from '../../store/AppContext';

/* ===== AI 추천 친구 데모 데이터 ===== */
const AI_RECOMMENDED = [
  {
    uid: 'r1', name: '인테리어왕', emoji: '🏠', status: '마이룸 꾸미기 장인',
    online: true, matchScore: 94,
    reasons: ['마이룸 가구 취향 유사', 'BGM 장르 일치'],
  },
  {
    uid: 'r2', name: '가든마스터', emoji: '🌿', status: '희귀 재료 수집가',
    online: true, matchScore: 87,
    reasons: ['제작 레시피 유사', '접속 시간대 겹침'],
  },
  {
    uid: 'r3', name: '음악요정', emoji: '🎵', status: 'Lo-fi 감성 BGM 제작',
    online: false, matchScore: 82,
    reasons: ['BGM 장르 일치', '다이어리 키워드 유사'],
  },
  {
    uid: 'r4', name: '도토리부자', emoji: '💰', status: '거래의 신',
    online: true, matchScore: 78,
    reasons: ['레벨/진행도 비슷', '접속 시간대 겹침'],
  },
  {
    uid: 'r5', name: '꾸미기요정', emoji: '✨', status: '벽지 컬렉터',
    online: false, matchScore: 75,
    reasons: ['마이룸 가구 취향 유사', '제작 레시피 유사'],
  },
];

const MUTUAL_FRIENDS = [
  { uid: 'u1', name: '다람쥐맘', emoji: '🐿️', status: '도토리 줍는 중...', online: true },
  { uid: 'u2', name: '숲지기', emoji: '🌲', status: '마이가든 꾸미는 중', online: true },
  { uid: 'u3', name: 'DJ토끼', emoji: '🐰', status: '음악 만드는 중 🎵', online: false },
  { uid: 'u4', name: '패션왕', emoji: '👑', status: '오늘 뭐 입지', online: true },
];

const FOLLOWERS = [
  { uid: 'u5', name: '꽃사슴', emoji: '🦌', status: '가든에 꽃 심는 중', online: false },
  { uid: 'u6', name: '별이', emoji: '⭐', status: '도토리 부자 될 거야', online: true },
  { uid: 'u10', name: '초코파이', emoji: '🍫', status: '방 꾸미기 장인', online: true },
];

const FOLLOWING = [
  { uid: 'u7', name: '음악왕', emoji: '🎸', status: '기타 연습 중', online: true },
  { uid: 'u8', name: '건축가', emoji: '🏗️', status: '탑 짓는 중', online: false },
  { uid: 'u9', name: '요리사', emoji: '👨‍🍳', status: '빵 굽는 중', online: true },
  { uid: 'u11', name: '도토리왕', emoji: '🌰', status: '부자 되는 길', online: false },
];

const SEARCH_RESULTS = [
  { uid: 'u12', name: '하늘이', emoji: '☁️', status: '구름 위를 걷는 중', online: true },
  { uid: 'u13', name: '바다소년', emoji: '🌊', status: '파도타기 마스터', online: false },
  { uid: 'u14', name: '숲요정', emoji: '🧚', status: '도토리정원 탐험가', online: true },
];

function FriendCard({ user, actions }) {
  return (
    <div className="friend-card">
      <div className="friend-avatar" style={{ position: 'relative' }}>
        {user.emoji}
        {user.online && <span className="badge-dot" />}
      </div>
      <div className="friend-info">
        <div className="friend-name">{user.name}</div>
        <div className="friend-sub">{user.status}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>{actions}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontSize: 13 }}>
      {text}
    </div>
  );
}

export default function FriendsList({ onVisit }) {
  const { showToast } = useApp();
  const [tab, setTab] = useState('recommend');
  const [searchTerm, setSearchTerm] = useState('');
  const [mutualFriends, setMutualFriends] = useState(MUTUAL_FRIENDS);
  const [followers, setFollowers] = useState(FOLLOWERS);
  const [following, setFollowing] = useState(FOLLOWING);

  const followBack = useCallback((user) => {
    setFollowers(prev => prev.filter(f => f.uid !== user.uid));
    setMutualFriends(prev => [...prev, user]);
    showToast(`${user.emoji} ${user.name}님과 서로 친구가 되었어요!`);
  }, [showToast]);

  const unfollow = useCallback((user) => {
    setFollowing(prev => prev.filter(f => f.uid !== user.uid));
    showToast(`${user.name}님 팔로우를 취소했어요`);
  }, [showToast]);

  const follow = useCallback((user) => {
    setFollowing(prev => [...prev, user]);
    showToast(`${user.emoji} ${user.name}님을 팔로우했어요!`);
  }, [showToast]);

  const [recommended, setRecommended] = useState(AI_RECOMMENDED);

  const tabs = [
    { id: 'recommend', label: '🌰 추천' },
    { id: 'mutual', label: `서로친구 ${mutualFriends.length}` },
    { id: 'followers', label: `팔로워 ${followers.length}` },
    { id: 'following', label: `팔로잉 ${following.length}` },
    { id: 'search', label: '찾기' },
  ];

  const searchResults = SEARCH_RESULTS.filter(u =>
    !searchTerm || u.name.includes(searchTerm)
  );

  return (
    <div>
      {/* 하위 탭 (언더라인) */}
      <div className="sub-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`sub-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* AI 추천 */}
      {tab === 'recommend' && (
        <div>
          <div style={{
            padding: '10px 14px',
            background: 'linear-gradient(135deg, rgba(255,138,61,0.08), rgba(255,126,179,0.08))',
            borderRadius: 'var(--radius)',
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--text-dim)',
            lineHeight: 1.6,
          }}>
            🌰 <b style={{ color: 'var(--text)' }}>AI가 분석한 맞춤 추천!</b><br />
            마이룸 취향, BGM, 제작 활동, 접속 패턴을 종합 분석했어요.
          </div>
          {recommended.map(u => (
            <div key={u.uid} className="friend-card" style={{ flexWrap: 'wrap' }}>
              <div className="friend-avatar" style={{ position: 'relative' }}>
                {u.emoji}
                {u.online && <span className="badge-dot" />}
              </div>
              <div className="friend-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="friend-name">{u.name}</span>
                  <span style={{
                    padding: '1px 7px',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 700,
                    background: u.matchScore >= 90
                      ? 'linear-gradient(135deg, #ff7eb3, #ff5c8d)'
                      : u.matchScore >= 80
                        ? 'linear-gradient(135deg, #ff8a3d, #ffb347)'
                        : 'linear-gradient(135deg, #6eb5ff, #a8d4ff)',
                    color: '#fff',
                  }}>
                    {u.matchScore}%
                  </span>
                </div>
                <div className="friend-sub">{u.status}</div>
              </div>
              <button className="friend-action add" onClick={() => {
                follow(u);
                setRecommended(prev => prev.filter(r => r.uid !== u.uid));
              }}>팔로우</button>
              {/* 매칭 이유 태그 */}
              <div style={{
                width: '100%',
                display: 'flex',
                gap: 4,
                paddingLeft: 50,
                marginTop: 2,
                flexWrap: 'wrap',
              }}>
                {u.reasons.map((r, i) => (
                  <span key={i} style={{
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    background: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    fontWeight: 500,
                  }}>{r}</span>
                ))}
              </div>
            </div>
          ))}
          {recommended.length === 0 && (
            <EmptyState text="모든 추천 친구를 확인했어요! 내일 새로운 추천이 와요." />
          )}
        </div>
      )}

      {/* 서로친구 */}
      {tab === 'mutual' && (
        <div>
          {mutualFriends.length === 0 ? (
            <EmptyState text="아직 서로친구가 없어요." />
          ) : (
            mutualFriends.map(f => (
              <FriendCard key={f.uid} user={f} actions={
                <button className="friend-action visit" onClick={() => onVisit?.(f)}>방문</button>
              } />
            ))
          )}
        </div>
      )}

      {/* 팔로워 (나를 팔로우하는 사람) */}
      {tab === 'followers' && (
        <div>
          {followers.length === 0 ? (
            <EmptyState text="아직 팔로워가 없어요." />
          ) : (
            followers.map(f => (
              <FriendCard key={f.uid} user={f} actions={
                <>
                  <button className="friend-action add" onClick={() => followBack(f)}>맞팔</button>
                  <button className="friend-action visit" onClick={() => onVisit?.(f)}>방문</button>
                </>
              } />
            ))
          )}
        </div>
      )}

      {/* 팔로잉 (내가 팔로우하는 사람) */}
      {tab === 'following' && (
        <div>
          {following.length === 0 ? (
            <EmptyState text="아직 팔로잉이 없어요." />
          ) : (
            following.map(f => (
              <FriendCard key={f.uid} user={f} actions={
                <>
                  <button
                    className="friend-action"
                    style={{ background: 'rgba(200,180,155,0.15)', color: 'var(--text-dim)', fontSize: 11 }}
                    onClick={() => unfollow(f)}
                  >언팔</button>
                  <button className="friend-action visit" onClick={() => onVisit?.(f)}>방문</button>
                </>
              } />
            ))
          )}
        </div>
      )}

      {/* 친구 검색 */}
      {tab === 'search' && (
        <div>
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="닉네임으로 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {searchResults.map(u => (
            <FriendCard key={u.uid} user={u} actions={
              <button className="friend-action add" onClick={() => follow(u)}>팔로우</button>
            } />
          ))}
        </div>
      )}
    </div>
  );
}
