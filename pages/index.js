import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
const Home = () => {
  return (
    <>
      <div className="card m-auto md:w-3/4 w-96">
        <div className="card-body">
          <div className="font-black text-5xl mt-6">$BBB</div>
          <div className="grid grid-cols-2">
            <div>
              The most memeable memecoin in existence. The dogs have had their
              day, it’s time for BBB to take reign.
            </div>
            <Image
              src={"/bbb.jpg"}
              alt=""
              height={200}
              width={200}
              className="text-center m-auto"
            />
          </div>
          <div className="btn btn-secondary m-auto w-auto btn-lg mt-8">
            Coming Soon
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
