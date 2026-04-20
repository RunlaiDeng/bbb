import { useEffect, useState } from "react";
import { useSignMessage, useAccount } from "wagmi";
import useConnectWallet from "../Hook/useConnectWallet";

function SignButton(props) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const openConnect = useConnectWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { signMessage, data, isError, isLoading, isSuccess } = useSignMessage();

  useEffect(() => {
    if (isSuccess) {
      props.callback?.(data);
    }
  }, [data]);

  return (
    mounted &&
    (isConnected ? (
      <div
        className={props.className + (isLoading ? " btn-disabled" : "")}
        disabled={isLoading}
        style={{ minWidth: 112 }}
        onClick={() => {
          if (!isConnected) {
            alert("please connect wallet");
            return;
          }
          props?.before?.();
          console.log(props?.message);
          signMessage({ message: props?.message });
        }}
      >
        {isLoading && (
          <>
            <span className="loading loading-spinner"></span>loading
          </>
        )}
        {!isLoading && props?.buttonName}
      </div>
    ) : (
      <div
        className="btn btn-sm"
        onClick={() => {
          openConnect();
        }}
      >
        Connect
      </div>
    ))
  );
}

export default SignButton;
