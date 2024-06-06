import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
const Home = () => {
  return (
    <>
      <div className="font-black text-5xl text-center mt-6">Beny Bad Boy</div>
      <Image
        src={"/bbb.jpg"}
        alt=""
        height={400}
        width={400}
        className="text-center m-auto"
      />
      <Link
        className="btn btn-primary w-auto m-auto mt-4"
        href={
          "https://xdc.sale/presale/0x6182c5cC8D21a63708e567684F6A01b691f24a5e"
        }
      >
        IDO NOW!
      </Link>
    </>
  );
};

export default Home;
