import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';

// 서로친구만 메시지 가능 — 서로친구 목록 (FriendsList의 MUTUAL_FRIENDS와 동기화)
const MUTUAL_FRIENDS = [
  { uid: 'u1', name: '다람쥐맘', emoji: '🐿️', online: true, lastMsg: '레어 재료 구했어?', unread: 2 },
  { uid: 'u2', name: '숲지기', emoji: '🌲', online: true, lastMsg: '가든 구경 가도 돼?', unread: 0 },
  { uid: 'u3', name: 'DJ토끼', emoji: '🐰', online: false, lastMsg: '새 BGM 만들었어!', unread: 1 },
  { uid: 'u4', name: '패션왕', emoji: '👑', online: true, lastMsg: '왕관 살래? 30도토리', unread: 0 },
];

const DEMO_MESSAGES = [
  { id: 1, sender: 'u1', text: '오늘 채집하다가 황금나무 나왔어!', time: '오후 2:30' },
  { id: 2, sender: 'me', text: '대박 ㅋㅋ 진짜? 확률 얼마야', time: '오후 2:31' },
  { id: 3, sender: 'u1', text: '3%래 ㅋㅋ 운 좋았어', time: '오후 2:31' },
  { id: 4, sender: 'me', text: '부럽다... 나도 열심히 해야지', time: '오후 2:32' },
  { id: 5, sender: 'u1', text: '레어 재료 구했어?', time: '오후 2:35' },
  { id: 6, sender: 'u1', text: '무지개석 하나 줄까?', time: '오후 2:35' },
];

export default function Messages() {
  const { showToast } = useApp();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedChat]);

  const sendMessage = useCallback(() => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: text.trim(),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setText('');
  }, [text]);

  // 대화 목록
  if (!selectedChat) {
    return (
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>
          💬 메시지
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
          서로친구만 메시지를 주고받을 수 있어요
        </div>

        {MUTUAL_FRIENDS.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)', fontSize: 13 }}>
            서로친구가 없어요. 친구를 만들어보세요!
          </div>
        ) : (
          MUTUAL_FRIENDS.map(conv => (
            <div
              key={conv.uid}
              className="friend-card"
              onClick={() => setSelectedChat(conv)}
            >
              <div className="friend-avatar" style={{ position: 'relative' }}>
                {conv.emoji}
                {conv.online && <span className="badge-dot" />}
              </div>
              <div className="friend-info">
                <div className="friend-name">{conv.name}</div>
                <div className="friend-sub" style={{
                  color: conv.unread > 0 ? 'var(--text)' : undefined,
                  fontWeight: conv.unread > 0 ? 600 : undefined,
                }}>
                  {conv.lastMsg}
                </div>
              </div>
              {conv.unread > 0 && (
                <div className="badge-count">{conv.unread}</div>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  // 대화 상세
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 0 14px', borderBottom: '1px solid var(--border-light)',
        marginBottom: 14,
      }}>
        <button
          onClick={() => setSelectedChat(null)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}
        >
          ←
        </button>
        <div className="friend-avatar" style={{ width: 36, height: 36, fontSize: 16, position: 'relative' }}>
          {selectedChat.emoji}
          {selectedChat.online && <span className="badge-dot" />}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>{selectedChat.name}</div>
          <div style={{ fontSize: 11, color: selectedChat.online ? 'var(--primary)' : 'var(--text-dim)' }}>
            {selectedChat.online ? '온라인' : '오프라인'}
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.sender !== 'me' && (
              <div className="msg-sender" style={{ paddingLeft: 4 }}>{selectedChat.name}</div>
            )}
            <div className={`msg-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
              {msg.text}
              <div className="msg-time">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 입력 */}
      <div className="msg-input-wrap" style={{ marginBottom: 0, marginTop: 8 }}>
        <input
          className="msg-input"
          placeholder="메시지 입력..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button className="btn-send" onClick={sendMessage}>보내기</button>
      </div>
    </div>
  );
}
