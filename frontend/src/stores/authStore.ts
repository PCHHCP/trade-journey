import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null });
  },
}));

export const useIsAuthenticated = () =>
  useAuthStore((state) => state.session !== null && !state.loading);
