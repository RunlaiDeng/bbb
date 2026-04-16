import { useRouter } from "next/router";
import SignButton from "@/components/SignButton";
import { useEffect, useState } from "react";
import { contracts } from "@/config";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import rpc from "@/components/Rpc";

const Register = () => {
  const chainId = useChainId();
  const bbbpumpReferral = contracts[chainId]?.bbbpumpReferral;

  const router = useRouter();
  const { leader } = router.query;
  const [data, setData] = useState({});
  const { address } = useAccount();

  const [userShare, setUserShare] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (data?.leader) {
      rpc.getReferrals(data.leader).then((result) => {
        if (result?.shareFee) {
          setUserShare(result.shareFee);
        }
      });
    }
  }, [data.leader]);

  useEffect(() => {
    setData({ ...data, leader });
  }, [leader]);

  const submit = {
    buttonName: "Register",
    message: JSON.stringify({ leader: leader }),
    callback: (signature) => {
      setError("");
      rpc.register(leader, signature).then((result) => {
        if (result?.error) {
          setError(result.error);
        } else {
          router.push("/");
        }
      });
    },
  };
  return (
    <>
      <div className="m-auto md:w-3/4 w-96 mt-2 pb-1">
        <div className="bg-gradient-to-br from-primary/90 via-base-300 to-base-200 rounded-2xl shadow-xl p-8 mb-8 text-white text-center transform hover:scale-[1.02] transition-all duration-300">
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-base-content to-primary">
            Start Your BBBPump Journey
          </h1>
          <div className="text-sm bg-base-200/20 backdrop-blur-sm p-3 rounded-xl mb-6 border border-white/30">
            🎯 Join BBBPump and get trade fee cashback rewards
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-base-200 p-6 rounded-xl border border-primary/20 text-base-content/70">
            {error && (
              <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div className="mb-4">
              <div className="text-left font-medium mb-2">Invite Code</div>
              <input
                type="text"
                placeholder="0x"
                className="input input-bordered w-full bg-base-200/90"
                defaultValue={leader}
                disabled
                onChange={(e) => setData({ ...data, leader: e.target.value })}
              />
            </div>
            <div className="text-left text-sm mb-4">
              You can get{" "}
              <span className="text-primary font-bold">
                {userShare?.toString()}%
              </span>{" "}
              trade fee back
            </div>
            <SignButton
              {...submit}
              className="btn w-full btn-primary border-none hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
