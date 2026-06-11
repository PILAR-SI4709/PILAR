import { create } from 'zustand';

interface User {
  id: string;
  nama: string;
  email: string;
  role: 'USER' | 'ADMIN';
  foto?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    // Simpan ke localStorage
    localStorage.setItem('pilar_token', token);
    localStorage.setItem('pilar_user', JSON.stringify(user));
    // Simpan ke cookie agar proxy.ts bisa baca
    document.cookie = `pilar_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('pilar_token');
    localStorage.removeItem('pilar_user');
    set({ user: null, token: null });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('pilar_token');
    const userStr = localStorage.getItem('pilar_user');
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) });
    }
  },
}));