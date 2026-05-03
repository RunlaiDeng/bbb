import {
  useAccount,
  useWaitForTransactionReceipt,
  usePublicClient,
  useSendTransaction,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { useEffect, useRef, useState } from "react";

import { useNotification } from "../Context/notice";
import useConnectWallet from "../Hook/useConnectWallet";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatTxErrorMessage } from "@/lib/formatTxError";
import { xdc } from "@/config/chains";

const SendButton = (props) => {
  const wb = useTranslation();
  const { success, failure, info } = useNotification();
  const [mounted, setMounted] = useState(false);
  const pendingToastSent = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const addRecentTransaction = useAddRecentTransaction();

  const {
    data: hash,
    sendTransaction,
    isPending: isLoading,
    isSuccess: isStarted,
    error: error,
  } = useSendTransaction();

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      failure(formatTxErrorMessage(error, wb.txErrors));
    }
    if (txError) {
      console.error(txError);
      failure(formatTxErrorMessage(txError, wb.txErrors));
    }
  }, [error, txError, failure, wb.txErrors]);

  useEffect(() => {
    if (txSuccess) {
      props?.callback?.(txSuccess, hash);
      success(wb.writeButton.txSuccess);
    }
  }, [txSuccess, hash, props, success, wb.writeButton.txSuccess]);

  useEffect(() => {
    if (hash && isStarted && !txSuccess && !pendingToastSent.current) {
      pendingToastSent.current = true;
      info(wb.journey.txPending);
    }
    if (!hash && !isStarted) {
      pendingToastSent.current = false;
    }
  }, [hash, isStarted, txSuccess, info, wb.journey.txPending]);

  const client = usePublicClient();

  useEffect(() => {
    if (hash && typeof addRecentTransaction === "function") {
      try {
        addRecentTransaction({
          hash: hash,
          description: "",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [hash, addRecentTransaction]);

  const openConnect = useConnectWallet();
  const wrongChain = isConnected && chainId !== xdc.id;

  return (
    mounted &&
    (isConnected ? (
      wrongChain ? (
        <button
          type="button"
          className={(props.className || "btn") + (isSwitchingChain ? " btn-disabled" : "")}
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
          className={
            props.className +
            (props?.disabled || !sendTransaction || isLoading ? " btn-disabled" : "")
          }
          aria-busy={isLoading || (isStarted && !txSuccess)}
          aria-disabled={
            Boolean(
              (props?.disabled || !sendTransaction || isLoading || isStarted) && !txSuccess
            )
          }
          style={{
            minWidth: 112,
            cursor:
              (props?.disabled || !sendTransaction || isLoading || isStarted) && !txSuccess
                ? "not-allowed"
                : "pointer",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.currentTarget.click();
            }
          }}
          onClick={async () => {
            info(wb.journey.walletConfirming);
            const writeData = { ...props?.data, type: "legacy" };

            try {
              const gas = await client.estimateGas({ ...writeData });
              writeData.gas = (gas * 12n) / 10n;
            } catch (e) {}
            props?.before?.();

            sendTransaction?.(writeData);
          }}
        >
          {isLoading && wb.writeButton.waitingApproval}
          {isStarted && !txSuccess && (
            <>
              <span className="loading loading-spinner" aria-hidden />
              {wb.writeButton.loading}
            </>
          )}
          {((!isLoading && !isStarted) || txSuccess) && props?.buttonName}
        </div>
      )
    ) : (
      <div
        className="btn"
        onClick={() => {
          openConnect();
        }}
      >
        {wb.writeButton.connect}
      </div>
    ))
  );
};

export default SendButton;
