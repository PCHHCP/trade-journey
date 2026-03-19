import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AuthMeResponse } from "@/types/auth";

interface AuthState {
  session: Session | null;
  supabaseUser: User | null;
  backendUser: AuthMeResponse | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setBackendUser: (backendUser: AuthMeResponse | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  supabaseUser: null,
  backendUser: null,
  loading: true,
  setSession: (session) =>
    set((state) => {
      const nextSupabaseUser = session?.user ?? null;
      const shouldResetBackendUser =
        !nextSupabaseUser ||
        state.backendUser?.supabase_user_id !== nextSupabaseUser.id;

      return {
        session,
        supabaseUser: nextSupabaseUser,
        backendUser: shouldResetBackendUser ? null : state.backendUser,
      };
    }),
  setBackendUser: (backendUser) => set({ backendUser }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ session: null, supabaseUser: null, backendUser: null });
  },
}));

export const useIsAuthenticated = () =>
  useAuthStore((state) => state.session !== null && !state.loading);
