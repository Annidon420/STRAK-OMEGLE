"use client";

import { useEffect, type PropsWithChildren } from "react";

import { useAuthStore } from "@/store/authStore";

export default function Providers({ children }: PropsWithChildren) {
  const rehydrateUser = useAuthStore((state) => state.rehydrateUser);

  useEffect(() => {
    rehydrateUser();
  }, [rehydrateUser]);

  return <>{children}</>;
}
