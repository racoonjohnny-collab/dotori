import { useApp } from '../../store/AppContext';

export default function TopBar() {
  const { state } = useApp();

  return (
    <div className="top-bar">
      <div className="top-bar-title">도토리정원</div>
      <div className="dotori-badge">
        <span className="dotori-icon">🌰</span>
        {state.dotori.toLocaleString()}
      </div>
    </div>
  );
}
