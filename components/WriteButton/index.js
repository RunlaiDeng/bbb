import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { useEffect, useState } from "react";

import { useNotification } from "../Context/notice";
import { usePrivy } from "@privy-io/react-auth";
import { encodeFunctionData } from "viem";
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

  const { sendTransaction, user } = usePrivy();
  const connectorType = user?.wallet?.connectorType;

  const privyLogin = usePrivyLogin();
  return (
    mounted &&
    (isConnected ? (
      <div
        className={
          props.className +
          (props?.disabled || !write || isLoading || !props?.data ? " btn-disabled" : "")
        }
        disabled={
          (props?.disabled || !write || isLoading || isStarted || !props?.data) && !txSuccess
        }
        style={{ minWidth: 112 }}
        onClick={async () => {
          if (!isConnected) {
            alert("please connect wallet");
            return;
          }
          
          // Check if data exists and is valid
          if (!props?.data) {
            console.error("No transaction data provided");
            failure("Transaction data is missing");
            return;
          }

          const writeData = { ...props?.data, type: "legacy" };

          try {
            const gas = await client.estimateContractGas({ ...writeData });
            console.log(gas)
            writeData.gas = (gas * 30n) / 10n;
          } catch (e) {
            console.error(e);
          }
          props?.before?.();
          if (connectorType == "embedded") {
            const d = encodeFunctionData({
              ...writeData,
            });
            writeData.data = d;
            writeData.type = 0;
            writeData.to = writeData?.address;
            try {
              await sendTransaction(writeData);
            } catch (e) {}

            props?.callback?.(true);
          } else {
            write?.(writeData);
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
        className="btn btn-sm"
        onClick={() => {
          privyLogin();
        }}
      >
        Log in
      </div>
    ))
  );
};

export default WriteButton;
