import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
const Home = () => {
  return (
    <>
      <div className="font-black text-5xl mt-6">$BBB</div>
      <div className="grid grid-cols-2">
        <div>
          The most memeable memecoin in existence. The dogs have had their day,
          it’s time for BBB to take reign.
        </div>
        <Image
          src={"/bbb.jpg"}
          alt=""
          height={200}
          width={200}
          className="text-center m-auto"
        />
      </div>
    </>
  );
};

export default Home;
