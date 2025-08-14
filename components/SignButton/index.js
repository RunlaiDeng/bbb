import { useEffect, useState } from "react";
import { useSignMessage, useAccount } from "wagmi";
import usePrivyLogin from "../Hook/usePrivyLogin";
import { usePrivy } from "@privy-io/react-auth";

function SignButton(props) {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { user } = usePrivy();
  const privyLogin = usePrivyLogin();

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
          privyLogin();
        }}
      >
        Sign Up
      </div>
    ))
  );
}

export default SignButton;
