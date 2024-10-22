import {
  useAccount,
  useWaitForTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { useEffect, useState } from "react";

import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

import { useNotification } from "../Context/notice";
const WriteButton = (props) => {
  const { success, failure } = useNotification();
  const { openConnectModal } = useConnectModal();
  const addRecentTransaction = useAddRecentTransaction();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();

  const {
    data: hash,
    writeContract: write,
    isPending: isLoading,
    isSuccess: isStarted,
    isError,
    error: error,
  } = useWriteContract();

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
      failure(error.shortMessage);
    }
    if (txError) {
      console.error(txError);
      failure(txError.shortMessage);
    }
  }, [error, txError]);

  useEffect(() => {
    if (txSuccess) {
      props?.callback?.(txSuccess, hash);
      success("Transaction successful!");
    }
  }, [txSuccess]);

  const client = usePublicClient();

  useEffect(() => {
    if (hash) {
      try {
        addRecentTransaction({
          hash: hash,
          description: "",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [hash]);

  return (
    mounted &&
    (isConnected ? (
      <div
        className={
          props.className +
          (props?.disabled || !write || isLoading ? " btn-disabled" : "")
        }
        disabled={
          (props?.disabled || !write || isLoading || isStarted) && !txSuccess
        }
        style={{ minWidth: 112 }}
        onClick={async () => {
          if (!isConnected) {
            alert("please connect wallet");
            return;
          }
          const writeData = { ...props?.data };

          try {
            const gas = await client.estimateContractGas({ ...props?.data });
            writeData.gas = (gas * 12n) / 10n;
          } catch (e) {}

          write?.(writeData);
        }}
      >
        {isLoading && "Waiting for approval"}
        {isStarted && !txSuccess && (
          <>
            <span className="loading loading-spinner"></span>loading
          </>
        )}
        {((!isLoading && !isStarted) || txSuccess) && props?.buttonName}
      </div>
    ) : (
      <div
        className={props.className}
        onClick={() => {
          openConnectModal();
        }}
      >
        Connect Wallet
      </div>
    ))
  );
};

export default WriteButton;
