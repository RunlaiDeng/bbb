import { contracts } from "@/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useChainId, useReadContracts } from "wagmi";
import SwapFun from "@/components/SwapFun";
import SwapPool from "@/components/SwapPool";
const Swap = () => {
  const router = useRouter();
  let { token } = router.query;
  const chainId = useChainId();
  const bbb = contracts[chainId]?.bbb;
  const mbbb = contracts[chainId]?.mbbbv2;
  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  const { data: reads0 } = useReadContracts({
    contracts: [
      {
        ...mbbb,
        functionName: "getDropTokenByAddress",
        args: [token],
      },
    ],
  });
  const dropToken = reads0?.[0]?.result;

  if (token == "bbb") {
    token = bbb.address;
  }

  let removed;
  if (token == bbb.address) {
    removed = 1n;
  } else {
    removed = dropToken?.removed;
  }

  const tokenInput = { token };
  return (
    mount && (
      <>
        {!removed && <SwapFun {...tokenInput} />}
        {removed && <SwapPool {...tokenInput} />}
      </>
    )
  );
};

export default Swap;
