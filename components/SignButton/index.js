import { useEffect, useRef, useState } from "react";
import {
  useSignMessage,
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";
import useConnectWallet from "../Hook/useConnectWallet";
import { useNotification } from "../Context/notice";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatTxErrorMessage } from "@/lib/formatTxError";
import { xdc } from "@/config/chains";

function SignButton(props) {
  const wb = useTranslation();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { failure, info } = useNotification();
  const [mounted, setMounted] = useState(false);
  const openConnect = useConnectWallet();
  const toastOnPending = useRef(false);
  const successCallbackFired = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    signMessage,
    data,
    isError,
    isLoading,
    isSuccess,
    error: signError,
    reset,
  } = useSignMessage();

  useEffect(() => {
    if (isSuccess && data && !successCallbackFired.current) {
      successCallbackFired.current = true;
      props.callback?.(data);
    }
    if (!isSuccess) {
      successCallbackFired.current = false;
    }
  }, [isSuccess, data, props]);

  useEffect(() => {
    if (isLoading && !toastOnPending.current) {
      toastOnPending.current = true;
      info(wb.journey.signWalletConfirming);
    }
    if (!isLoading) {
      toastOnPending.current = false;
    }
  }, [isLoading, info, wb.journey.signWalletConfirming]);

  useEffect(() => {
    if (isError && signError) {
      failure(formatTxErrorMessage(signError, wb.txErrors));
      reset?.();
    }
  }, [isError, signError, failure, reset, wb.txErrors]);

  const wrongChain = isConnected && chainId !== xdc.id;

  return (
    mounted &&
    (isConnected ? (
      wrongChain ? (
        <button
          type="button"
          className={(props.className || "btn btn-sm") + (isSwitchingChain ? " btn-disabled" : "")}
          disabled={isSwitchingChain}
          onClick={() => switchChain?.({ chainId: xdc.id })}
          aria-busy={isSwitchingChain}
        >
          {isSwitchingChain ? (
            <>
              <span className="loading loading-spinner loading-sm" aria-hidden />
              {wb.writeButton.loading}
            </>
          ) : (
            wb.journey.switchNetwork
          )}
        </button>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className={props.className + (isLoading ? " btn-disabled" : "")}
          aria-busy={isLoading}
          aria-disabled={isLoading}
          style={{ minWidth: 112, cursor: isLoading ? "not-allowed" : "pointer" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isLoading) e.currentTarget.click();
            }
          }}
          onClick={() => {
            if (isLoading) return;
            props?.before?.();
            signMessage({ message: props?.message });
          }}
        >
          {isLoading && (
            <>
              <span className="loading loading-spinner" aria-hidden />
              {wb.writeButton.loading}
            </>
          )}
          {!isLoading && props?.buttonName}
        </div>
      )
    ) : (
      <div
        className="btn btn-sm"
        role="button"
        tabIndex={0}
        onClick={() => {
          openConnect();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openConnect();
          }
        }}
      >
        {wb.writeButton.connect}
      </div>
    ))
  );
}

export default SignButton;
