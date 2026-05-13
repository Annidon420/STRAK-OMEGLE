import { create } from "zustand";

interface SocketState {

  onlineUsers: number;

  setOnlineUsers: (
    count: number
  ) => void;
}

export const useSocketStore =
  create<SocketState>((set) => ({

    onlineUsers: 0,

    setOnlineUsers: (count) =>
      set({
        onlineUsers: count,
      }),

}));