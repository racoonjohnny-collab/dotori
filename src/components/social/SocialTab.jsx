import { useState } from 'react';
import FriendsList from './FriendsList';
import Guestbook from './Guestbook';
import Messages from './Messages';

export default function SocialTab() {
  const [tab, setTab] = useState('friends');

  return (
    <div>
      {/* 소셜 탭 헤더 */}
      <div className="social-tabs">
        <button className={`social-tab${tab === 'friends' ? ' active' : ''}`} onClick={() => setTab('friends')}>
          👥 친구
        </button>
        <button className={`social-tab${tab === 'guestbook' ? ' active' : ''}`} onClick={() => setTab('guestbook')}>
          📝 방명록
        </button>
        <button className={`social-tab${tab === 'messages' ? ' active' : ''}`} onClick={() => setTab('messages')}>
          💬 메시지
        </button>
      </div>

      {tab === 'friends' && <FriendsList />}
      {tab === 'guestbook' && <Guestbook />}
      {tab === 'messages' && <Messages />}
    </div>
  );
}
