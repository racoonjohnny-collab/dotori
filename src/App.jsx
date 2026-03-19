import { useEffect } from 'react';
import { useApp } from './store/AppContext';
import { auth, onAuthStateChanged, db, doc, getDoc } from './firebase';
import LoginScreen from './components/auth/LoginScreen';
import TopBar from './components/ui/TopBar';
import CyTabs from './components/ui/CyTabs';
import BottomNav from './components/ui/BottomNav';
import ToastContainer from './components/ui/Toast';
import HomeTab from './components/home/HomeTab';
import MyRoom from './components/room/MyRoom';
import MyGarden from './components/garden/MyGarden';
import AvatarEditor, { loadDefaultAvatar } from './components/avatar/AvatarEditor';
import Market from './components/market/Market';
import SocialTab from './components/social/SocialTab';
import WaveSurf from './components/social/WaveSurf';
import MiniHomepy from './components/profile/MiniHomepy';
import MoreTab from './components/home/MoreTab';
import CraftTab from './components/craft/CraftTab';

function AvatarEditorModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column',
      backdropFilter: 'blur(4px)',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-main)', fontFamily: 'var(--font-main)' }}>
          🎨 도트 아바타 에디터
        </span>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-dim)',
          }}
        >✕</button>
      </div>
      {/* 스크롤 가능한 에디터 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', background: 'var(--bg-main)' }}>
        <AvatarEditor onClose={onClose} />
      </div>
    </div>
  );
}

function MainContent() {
  const { state } = useApp();

  switch (state.currentTab) {
    case 'home': return <HomeTab />;
    case 'room': return <MyRoom />;
    case 'garden': return <MyGarden />;
    case 'craft': return <CraftTab />;
    case 'market': return <Market />;
    case 'social': return <SocialTab />;
    case 'wave': return <WaveSurf />;
    case 'profile': return <MiniHomepy />;
    case 'more': return <MoreTab />;
    default: return <HomeTab />;
  }
}

export default function App() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch({ type: 'SET_USER', user: { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL } });

        try {
          const snap = await getDoc(doc(db, 'dotori_users', user.uid));
          if (snap.exists()) {
            const data = snap.data();
            dispatch({ type: 'SET_DOTORI', dotori: data.dotori || 0 });
            if (data.avatar) dispatch({ type: 'SET_AVATAR', avatar: data.avatar });
            if (data.myRoom) dispatch({ type: 'SET_MY_ROOM', room: data.myRoom });
            if (data.myGarden) dispatch({ type: 'SET_MY_GARDEN', garden: data.myGarden });
          }
        } catch (e) {
          console.error('Failed to load user data:', e);
        }

        // 아바타 없으면 기본 이미지 로드
        if (!state.avatar.pixels || !state.avatar.pixels.some(row => row.some(c => c))) {
          loadDefaultAvatar().then(loaded => {
            if (loaded) dispatch({ type: 'SET_AVATAR', avatar: { pixels: loaded } });
          });
        }

        dispatch({ type: 'SET_AUTH_STEP', step: 'ready' });
      } else {
        dispatch({ type: 'SET_AUTH_STEP', step: 'login' });
      }
    });
    return () => unsub();
  }, [dispatch]);

  if (state.authStep === 'loading') {
    return (
      <div className="app-shell">
        <div className="login-screen">
          <div className="login-art">🌳</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (state.authStep === 'login') {
    return (
      <div className="app-shell">
        <LoginScreen />
      </div>
    );
  }

  const handleCloseAvatarEditor = () => {
    dispatch({ type: 'SET_TAB', tab: 'home' });
  };

  return (
    <div className="app-shell">
      <TopBar />
      <CyTabs />
      <div className="main-content">
        <MainContent />
      </div>
      <BottomNav />
      <ToastContainer />
      {state.currentTab === 'avatar' && (
        <AvatarEditorModal onClose={handleCloseAvatarEditor} />
      )}
    </div>
  );
}
