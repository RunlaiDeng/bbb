import { usePrivy } from "@privy-io/react-auth";

export default function usePrivyLogin() {
  const { login, logout } = usePrivy();

  const privyLogin = async () => {
    await logout();
    login();
  };

  return privyLogin;
}
