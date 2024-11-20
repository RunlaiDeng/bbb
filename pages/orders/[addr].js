import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";

const Orders = () => {
  const router = useRouter();
  const { addr } = router.query;

  const [data, setData] = useState({});

  const { address } = useAccount();

  const [mount, setMount] = useState(false);
  return (
    <>
      {mount && <></>}
      {!mount && <></>}
    </>
  );
};

export default Orders;
