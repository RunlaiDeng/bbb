import { useRouter } from "next/router";
import WriteButton from "@/components/WriteButton";
import { useEffect, useState } from "react";
import { contracts } from "@/config";
import { useAccount, useChainId, useReadContracts } from "wagmi";

const Register = () => {
  const chainId = useChainId();
  const bbbpumpReferral = contracts[chainId]?.bbbpumpReferral;
  const mutilCall = contracts[chainId]?.multicallAddress;
  const router = useRouter();
  const { leader } = router.query;
  const [data, setData] = useState({});
  const { address } = useAccount();

  const { data: reads0 } = useReadContracts({
    contracts: [
      {
        ...bbbpumpReferral,
        functionName: "referrersleader",
        args: [address],
      },
      {
        ...bbbpumpReferral,
        functionName: "leaderMap",
        args: [data?.leader],
      },
    ],
  });

  const leaderFromConract = reads0?.[0]?.result;
  const userShare = reads0?.[1]?.result?.[2];

  useEffect(() => {
    if (leaderFromConract != "0x0000000000000000000000000000000000000000") {
      router.push("/");
    }
  }, [leaderFromConract]);

  console.log(leaderFromConract,userShare);

  useEffect(() => {
    setData({ ...data, leader });
  }, [leader]);

  const submit = {
    buttonName: "Confirm",
    data: {
      ...bbbpumpReferral,
      functionName: "register",
      args: [data?.leader],
    },
    callback: () => {
      router.push("/");
    },
  };
  return (
    <>
      <div className="card m-auto w-full sm:w-3/4 text-center">
        <div className="card-body">
          <div className="text-5xl text-green-700 font-black">
            Start Your BBBPump Journey
          </div>
          <div className="text-left opacity-50 font-black">Invide code</div>
          <input
            type="text"
            placeholder="0x"
            className="input input-bordered w-full"
            defaultValue={leader}
            onChange={(e) => setData({ ...data, leader: e.target.value })}
          />
          <div className="text-left font-black text-xs">
            You can get{" "}
            <span className="text-green-700">{userShare?.toString()}%</span>{" "}
            trade fee back
          </div>
          <WriteButton {...submit} className="btn btn-success" />
        </div>
      </div>
    </>
  );
};

export default Register;
