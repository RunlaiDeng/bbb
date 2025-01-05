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
        functionName: "leaderMap",
        args: [data?.leader],
      },
    ],
  });

  const userShare = reads0?.[0]?.result?.[2];

  useEffect(() => {
    setData({ ...data, leader });
  }, [leader]);

  const submit = {
    buttonName: "Register",
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
      <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
        <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
            Start Your BBBPump Journey
          </h1>
          <div className="text-sm bg-white/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
            🎯 Join BBBPump and get trade fee cashback rewards
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-green-100 text-gray-700">
            <div className="mb-4">
              <div className="text-left font-medium mb-2">Invite Code</div>
              <input
                type="text"
                placeholder="0x"
                className="input input-bordered w-full bg-white/90"
                defaultValue={leader}
                disabled
                onChange={(e) => setData({ ...data, leader: e.target.value })}
              />
            </div>
            <div className="text-left text-sm mb-4">
              You can get{" "}
              <span className="text-green-600 font-bold">{userShare?.toString()}%</span>{" "}
              trade fee back
            </div>
            <WriteButton 
              {...submit} 
              className="btn w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300" 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
