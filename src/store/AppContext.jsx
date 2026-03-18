import { createContext, useContext, useReducer, useCallback } from 'react';

const initialState = {
  authStep: 'loading', // 'loading' | 'login' | 'ready'
  user: null,
  // 도토리
  dotori: 100,
  // 마이룸
  myRoom: { items: [], bgm: 'chill', wallpaper: 'default', floor: 'default' },
  // 마이가든
  myGarden: { buildings: [], resources: { wood: 100, stone: 100, herb: 100, iron: 100, clay: 100, flower: 100, gem: 100, gold: 100, silk: 100, paint: 100, fish: 100, food: 100, fruit: 100, milk: 100, egg: 100, sugar: 100 } },
  // 아바타
  avatar: { hair: 'default', skin: 'light', outfit: 'default', accessory: null, pixels: null, bubbleText: '안녕?' },
  // 인벤토리
  inventory: [],
  // UI
  drawerOpen: false,
  toasts: [],
  currentTab: 'home',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user };
    case 'SET_AUTH_STEP':
      return { ...state, authStep: action.step };
    case 'SET_DOTORI':
      return { ...state, dotori: action.dotori };
    case 'ADD_DOTORI':
      return { ...state, dotori: state.dotori + action.amount };
    case 'SET_MY_ROOM':
      return { ...state, myRoom: { ...state.myRoom, ...action.room } };
    case 'SET_MY_GARDEN':
      return { ...state, myGarden: { ...state.myGarden, ...action.garden } };
    case 'SET_AVATAR':
      return { ...state, avatar: { ...state.avatar, ...action.avatar } };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.inventory };
    case 'ADD_INVENTORY': {
      const existing = state.inventory.find(i => i.id === action.item.id);
      if (existing) {
        return { ...state, inventory: state.inventory.map(i =>
          i.id === action.item.id ? { ...i, qty: (i.qty || 1) + (action.item.qty || 1) } : i
        )};
      }
      return { ...state, inventory: [...state.inventory, { ...action.item, qty: action.item.qty || 1 }] };
    }
    case 'USE_INVENTORY': {
      return { ...state, inventory: state.inventory.map(i =>
        i.id === action.id ? { ...i, qty: (i.qty || 1) - 1 } : i
      ).filter(i => (i.qty || 1) > 0) };
    }
    case 'RETURN_INVENTORY': {
      const ex = state.inventory.find(i => i.id === action.item.id);
      if (ex) {
        return { ...state, inventory: state.inventory.map(i =>
          i.id === action.item.id ? { ...i, qty: (i.qty || 1) + 1 } : i
        )};
      }
      return { ...state, inventory: [...state.inventory, { ...action.item, qty: 1 }] };
    }
    case 'SET_TAB':
      return { ...state, currentTab: action.tab };
    case 'SET_DRAWER':
      return { ...state, drawerOpen: action.open };
    case 'SHOW_TOAST': {
      const id = Date.now();
      return { ...state, toasts: [...state.toasts, { id, msg: action.msg, duration: action.duration || 2000 }] };
    }
    case 'HIDE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    case 'RESET':
      return { ...initialState, authStep: 'login' };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const showToast = useCallback((msg, duration = 2000) => {
    dispatch({ type: 'SHOW_TOAST', msg, duration });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
