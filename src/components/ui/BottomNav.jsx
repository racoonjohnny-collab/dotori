import { useApp } from '../../store/AppContext';

const tabs = [
  { id: 'home', label: '홈', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { id: 'social', label: '친구', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { id: 'wave', label: '파도타기', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>
      <path d="M2 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>
    </svg>
  )},
  { id: 'profile', label: '내홈피', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { id: 'more', label: '더보기', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
  )},
];

export default function BottomNav() {
  const { state, dispatch } = useApp();

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-item${state.currentTab === tab.id ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
