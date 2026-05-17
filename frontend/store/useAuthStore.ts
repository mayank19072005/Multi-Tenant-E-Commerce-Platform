import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user: any) => set({ user }),
}));

export default useAuthStore;