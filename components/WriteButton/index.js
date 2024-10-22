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

  if (error) {
    console.error(error);
  }
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

  if (txError) {
    console.error(txError);
    failure(txError.message);
  }

  useEffect(() => {
    if (txSuccess) {
      props?.callback?.(txSuccess, hash);
      success("Transaction successful!");
    }
  }, [txSuccess]);

  const client = usePublicClient();

  return (
    mounted &&
    (isConnected ? (
      <div
        className={
          props.className +
          (props?.disabled || !write || isError || isLoading
            ? " btn-disabled"
            : "")
        }
        disabled={
          (props?.disabled || !write || isError || isLoading || isStarted) &&
          !txSuccess
        }
        style={{ minWidth: 112 }}
        onClick={async () => {
          if (!isConnected) {
            alert("please connect wallet");
            return;
          }
          const gas = await client.estimateContractGas({ ...props?.data });
          const writeData = { ...props?.data };
          writeData.gas = (gas * 12n) / 10n;
          write?.(writeData);
          if (txData) {
            try {
              addRecentTransaction({
                hash: hash,
                description: props?.buttonName,
              });
            } catch (e) {}
          }
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
