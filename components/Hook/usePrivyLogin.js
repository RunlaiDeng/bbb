import { usePrivy } from "@privy-io/react-auth";
import { useCallback } from "react";

export default function usePrivyLogin() {
  const { login, logout, authenticated } = usePrivy();

  const privyLogin = useCallback(async () => {
    if (authenticated) {
      await logout();
    }

    login();
  }, [login, logout, authenticated]);

  return privyLogin;
}
