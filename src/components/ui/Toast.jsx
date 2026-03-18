import { useEffect } from 'react';
import { useApp } from '../../store/AppContext';

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    state.toasts.forEach(t => {
      const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST', id: t.id }), t.duration);
      return () => clearTimeout(timer);
    });
  }, [state.toasts, dispatch]);

  if (!state.toasts.length) return null;

  return (
    <div className="toast-container">
      {state.toasts.map(t => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  );
}
