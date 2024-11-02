import { useRouter } from "next/router";
import WriteButton from "@/components/WriteButton";
import { useState } from "react";

const Register = () => {
  const router = useRouter();
  const { leader } = router.query;
  const [data, setData] = useState({});
  const submit = {
    buttonName: "Confirm",
    data: {},
    callback: () => {
      router.push("/");
    },
  };
  return (
    <>
      <div className="card m-auto w-96 sm:w-1/2 text-center">
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
            You can get <span className="text-green-700">20%</span> trade fee
            back
          </div>
          <WriteButton {...submit} className="btn btn-success" />
        </div>
      </div>
    </>
  );
};

export default Register;
