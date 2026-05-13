import { create } from "zustand";

import Cookies from "js-cookie";

interface User {
  _id: string;
  username: string;
  email: string;
  gender: string;
  premium: boolean;
  interests?: string[];
  bio?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;

  rehydrateUser: () => void;

  setAuth: (
    user: User,
    token: string
  ) => void;

  logout: () => void;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,

    token: null,

    rehydrateUser: () => {
      if (typeof window === "undefined") return;

      const storedUser = localStorage.getItem("user");

      set({
        user: storedUser ? JSON.parse(storedUser) : null,
        token: Cookies.get("token") || null,
      });
    },

    setAuth: (user, token) => {

      Cookies.set("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      set({
        user,
        token,
      });
    },

    logout: () => {

      Cookies.remove("token");

      localStorage.removeItem("user");
      localStorage.removeItem("adminAccess");

      set({
        user: null,
        token: null,
      });
    },
}));