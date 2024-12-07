import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useSendTransaction,
} from "wagmi";
import { useEffect, useState } from "react";

import { useNotification } from "../Context/notice";
import { usePrivy } from "@privy-io/react-auth";
import usePrivyLogin from "../Hook/usePrivyLogin";
const WriteButton = (props) => {
  const { success, failure } = useNotification();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();

  const {
    data: hash,
    sendTransaction,
    isPending: isLoading,
    isSuccess: isStarted,
    isError,
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
  const privyLogin = usePrivyLogin();
  const { sendTransaction: sendTXPrivy, user } = usePrivy();
  const connectorType = user?.wallet?.connectorType;
  return (
    mounted &&
    (isConnected ? (
      <div
        className={
          props.className +
          (props?.disabled || !sendTransaction || isLoading
            ? " btn-disabled"
            : "")
        }
        disabled={
          (props?.disabled || !sendTransaction || isLoading || isStarted) &&
          !txSuccess
        }
        style={{ minWidth: 112 }}
        onClick={async () => {
          if (!isConnected) {
            alert("please connect wallet");
            return;
          }
          const writeData = { ...props?.data, type: "legacy" };

          try {
            const gas = await client.estimateGas({ ...writeData });
            writeData.gas = (gas * 12n) / 10n;
          } catch (e) {}
          props?.before?.();

          if (connectorType == "embedded") {
            writeData.type = 0;
            try {
              await sendTXPrivy(writeData);
            } catch (e) {}

            props?.callback?.(true);
          } else {
            sendTransaction?.(writeData);
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
        className="btn"
        onClick={() => {
          privyLogin();
        }}
      >
        Log In
      </div>
    ))
  );
};

export default WriteButton;
