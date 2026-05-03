import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { useEffect, useState } from "react";

import { useNotification } from "../Context/notice";
import useConnectWallet from "../Hook/useConnectWallet";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatTxErrorMessage } from "@/lib/formatTxError";

const WriteButton = (props) => {
  const wb = useTranslation();
  const { success, failure } = useNotification();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isConnected } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

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
        style={{ minWidth: 112, cursor: "pointer" }}
        onClick={async () => {
          if (!props?.data) {
            console.error("No transaction data provided");
            failure(wb.writeButton.txDataMissing);
            return;
          }

          const writeData = { ...props?.data, type: "legacy" };

          try {
            const gas = await client.estimateContractGas({ ...writeData });
            console.log(gas);
            writeData.gas = (gas * 30n) / 10n;
          } catch (e) {
            console.error(e);
          }
          props?.before?.();
          write?.(writeData);
        }}
      >
        {isLoading && wb.writeButton.waitingApproval}
        {isStarted && !txSuccess && (
          <>
            <span className="loading loading-spinner"></span>
            {wb.writeButton.loading}
          </>
        )}
        {((!isLoading && !isStarted) || txSuccess) && props?.buttonName}
      </div>
    ) : (
      <div
        className="btn btn-sm"
        onClick={() => {
          openConnect();
        }}
      >
        {wb.writeButton.connect}
      </div>
    ))
  );
};

export default WriteButton;
