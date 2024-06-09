import {
  useAccount,
  useWaitForTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect, useState } from "react";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import lang from "../../lang/index";
const WriteButton = (props) => {
  const { locale, locales, defaultLocale, asPath } = useRouter();
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
    Notify.failure(txError.message);
  }

  useEffect(() => {
    if (txSuccess) {
      props?.callback?.(txSuccess);
      Notify.success("Transaction successful!");
    }
  }, [txSuccess]);

  return (
    mounted &&
    (isConnected ? (
      <div
        className={
          props.className +
          (props?.disabled || !write || error != null || isLoading
            ? " btn-disabled"
            : "")
        }
        disabled={
          (props?.disabled ||
            !write ||
            error != null ||
            isLoading ||
            isStarted) &&
          !txSuccess
        }
        style={{ minWidth: 112 }}
        onClick={() => {
          if (!isConnected) {
            alert("please connect wallet");
            return;
          }
          write?.(props?.data);
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
      <div className={props.className}>
        <ConnectButton />
      </div>
    ))
  );
};

export default WriteButton;
