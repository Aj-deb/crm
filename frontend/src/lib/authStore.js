// src/lib/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isReady: false,

      login: (userData, token) => {
        localStorage.setItem("token", token);
        set({ user: userData, token, isReady: true });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isReady: true });
      },

      setReady: () => set({ isReady: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.isReady = true;
      },
    }
  )
);
