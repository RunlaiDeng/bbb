import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback } from "react";

export default function useConnectWallet() {
  const { openConnectModal } = useConnectModal();

  return useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);
}
