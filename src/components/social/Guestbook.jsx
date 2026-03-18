import { useState, useCallback } from 'react';
import { useApp } from '../../store/AppContext';

const DEMO_ENTRIES = [
  {
    id: 1, name: '다람쥐맘', emoji: '🐿️', text: '방 너무 예쁘게 꾸며놨다! 나도 이렇게 하고 싶어 ㅠㅠ', time: '3분 전',
    replies: [
      { id: 101, name: '나', emoji: '😊', text: '고마워 ㅎㅎ 벽지 바꾸니까 완전 달라졌어!', time: '2분 전' },
    ],
  },
  {
    id: 2, name: 'DJ토끼', emoji: '🐰', text: 'BGM 뭐야 진짜 좋다 🎵 나한테도 공유해줘!', time: '15분 전',
    replies: [],
  },
  {
    id: 3, name: '패션왕', emoji: '👑', text: '놀러왔어~ 가든에 탑 세웠더라? 대박 ㅋㅋ', time: '1시간 전',
    replies: [
      { id: 102, name: '나', emoji: '😊', text: '재료 3일 걸렸어 ㅋㅋ', time: '58분 전' },
      { id: 103, name: '패션왕', emoji: '👑', text: 'ㅋㅋㅋ 고생했다', time: '55분 전' },
    ],
  },
  {
    id: 4, name: '꽃사슴', emoji: '🦌', text: '도토리 부자 언제 돼? ㅋㅋ 맨날 채집만 하잖아', time: '2시간 전',
    replies: [],
  },
  {
    id: 5, name: '별이', emoji: '⭐', text: '첫 방문 기념! 앞으로 자주 올게 ✨', time: '5시간 전',
    replies: [],
  },
];

export default function Guestbook() {
  const { state, showToast } = useApp();
  const [entries, setEntries] = useState(DEMO_ENTRIES);
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const postEntry = useCallback(() => {
    if (!text.trim()) return;

    const newEntry = {
      id: Date.now(),
      name: state.user?.displayName || '나',
      emoji: '😊',
      text: text.trim(),
      time: '방금 전',
      replies: [],
    };

    setEntries(prev => [newEntry, ...prev]);
    setText('');
    showToast('방명록에 글을 남겼어요!');
  }, [text, state.user, showToast]);

  const postReply = useCallback((entryId) => {
    if (!replyText.trim()) return;

    const reply = {
      id: Date.now(),
      name: state.user?.displayName || '나',
      emoji: '😊',
      text: replyText.trim(),
      time: '방금 전',
    };

    setEntries(prev => prev.map(e =>
      e.id === entryId ? { ...e, replies: [...e.replies, reply] } : e
    ));
    setReplyText('');
    setReplyingTo(null);
    showToast('댓글을 남겼어요!');
  }, [replyText, state.user, showToast]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>
          📝 방명록
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          방문 흔적을 남겨보세요
        </div>
      </div>

      {/* 입력 */}
      <div className="msg-input-wrap">
        <input
          className="msg-input"
          placeholder="따뜻한 한마디 남겨주세요..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && postEntry()}
          maxLength={200}
        />
        <button className="btn-send" onClick={postEntry}>남기기</button>
      </div>

      {/* 글 목록 */}
      {entries.map(entry => (
        <div key={entry.id} className="guestbook-entry">
          <div className="gb-header">
            <div className="gb-avatar">{entry.emoji}</div>
            <div className="gb-name">{entry.name}</div>
            <div className="gb-time">{entry.time}</div>
          </div>
          <div className="gb-text">{entry.text}</div>

          {/* 댓글 목록 */}
          {entry.replies.length > 0 && (
            <div style={{
              marginTop: 8, paddingTop: 8,
              borderTop: '1px solid var(--border-light)',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              {entry.replies.map(reply => (
                <div key={reply.id} style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  paddingLeft: 8,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(255,180,140,0.3), rgba(255,126,179,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12,
                  }}>{reply.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-bright)' }}>{reply.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{reply.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2, lineHeight: 1.4 }}>{reply.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 댓글 달기 버튼 / 입력 */}
          {replyingTo === entry.id ? (
            <div style={{
              display: 'flex', gap: 6, marginTop: 8, paddingTop: 8,
              borderTop: entry.replies.length === 0 ? '1px solid var(--border-light)' : 'none',
            }}>
              <input
                autoFocus
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && postReply(entry.id)}
                placeholder="댓글 입력..."
                maxLength={150}
                style={{
                  flex: 1, padding: '6px 10px', fontSize: 12,
                  background: 'var(--bg-input)', border: '1px solid var(--border-light)',
                  borderRadius: 8, color: 'var(--text)', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => postReply(entry.id)}
                style={{
                  padding: '6px 12px', fontSize: 11, fontWeight: 700,
                  background: 'var(--primary)', color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >등록</button>
              <button
                onClick={() => { setReplyingTo(null); setReplyText(''); }}
                style={{
                  padding: '6px 8px', fontSize: 11,
                  background: 'none', color: 'var(--text-dim)', border: '1px solid var(--border-light)',
                  borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >취소</button>
            </div>
          ) : (
            <button
              onClick={() => setReplyingTo(entry.id)}
              style={{
                marginTop: 6, padding: '4px 0', fontSize: 11,
                color: 'var(--text-dim)', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              💬 댓글 {entry.replies.length > 0 ? entry.replies.length : '달기'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
