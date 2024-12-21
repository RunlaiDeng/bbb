import { useNotification } from "@/components/Context/notice";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
const Quests = () => {
  const { user } = usePrivy();

  const connectorType = user?.wallet?.connectorType;
  console.log(connectorType);
  const { info } = useNotification();

  return (
    <>
      <div className="text-center font-bold text-xl">Activity Center</div>
      <div className="grid sm:grid-cols-3 ms:mx-4 m-auto sm:w-3/4 mt-10">
        <Image
          src={"/activity0.png"}
          height={300}
          width={300}
          className="w-full cursor-pointer rounded-lg"
          onClick={() => {
            info("Coming soon");
          }}
          alt=""
        />
      </div>
    </>
  );
};

export default Quests;
