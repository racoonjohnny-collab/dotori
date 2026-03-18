import { useApp } from '../../store/AppContext';

const tabs = [
  { id: 'home', label: '홈' },
  { id: 'room', label: '마이룸' },
  { id: 'garden', label: '정원' },
  { id: 'craft', label: '제작' },
  { id: 'profile', label: '다이어리' },
  { id: 'social', label: '친구' },
  { id: 'market', label: '마켓' },
];

export default function CyTabs() {
  const { state, dispatch } = useApp();

  return (
    <div className="cy-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`cy-tab${state.currentTab === tab.id ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
