import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { dexLink } from "@/config";
const Home = () => {
  return (
    <>
      <div className="bg-lime-500">
        <div className="card m-auto md:w-3/4 w-96">
          <div className="card-body">
            <div className="font-black text-5xl mt-6">$BBB</div>
            <div className="grid grid-cols-2">
              <div>
                <div>
                  The most memeable memecoin in existence. The dogs have had
                  their day, it’s time for BBB to take reign.
                </div>

                <Link
                  className="btn btn-secondary m-auto w-auto md:btn-lg mt-8 md:mt-16 w-36 md:w-72"
                  href={dexLink}
                  target="_blank"
                >
                  BUY
                </Link>
              </div>
              <Image
                src={"/bbb.jpg"}
                alt=""
                height={200}
                width={200}
                className="text-center m-auto rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-center font-black text-5xl mt-4">ABOUT</div>
        <div className="card m-auto md:w-3/4 w-96">
          <div className="card-body">
            <div className="grid grid-cols-2 gap-2">
              <Image
                src={"/about.png"}
                height={200}
                width={200}
                alt=""
                className="m-auto hidden md:block mask mask-heart"
              />

              <div className="grid gap-2">
                <div>
                  BBB is tired of watching everyone play hot potato with the
                  endless derivative ShibaCumGMElonKishuTurboAssFlokiMoon Inu
                  coins. The Inu’s have had their day. It’s time for the most
                  recognizable meme in the world to take his reign as king of
                  the internet.
                </div>
                <div>
                  BBB is here to make memecoins great again. Launched stealth
                  with no presale, zero taxes, $BBB is a coin for the people,
                  forever. Fueled by pure memetic power, let $BBB show you the
                  way.
                </div>
                <div>Meme killer is here, its a not financial advise</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-center font-black text-5xl mt-4">TOKENOMICS</div>
        <div className="card m-auto md:w-3/4 w-96">
          <div className="card-body">
            <div className="grid md:grid-cols-2 gap-2">
              <div className="grid gap-2">
                <div>Token Supply:2 570 000 000</div>
                <div>No Taxes, No Bullshit. It’s that simple.</div>
                <div>No Taxes, No Bullshit. It’s that simple.</div>
              </div>
              <Image
                src={"/tokenomics.png"}
                height={200}
                width={200}
                alt=""
                className="m-auto hidden md:block mask mask-hexagon"
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-center font-black text-5xl mt-4">ROADMAP</div>
        <div className="card m-auto md:w-3/4 w-96">
          <div className="card-body text-center">
            <div className="grid md:grid-cols-3 gap-2">
              <Image
                src={"/roadmapleft.png"}
                height={200}
                width={200}
                alt=""
                className="m-auto hidden md:block mask mask-hexagon-2"
              />
              <div className="md:mt-16">
                <div>Phase 1: Meme Phase</div>
                <div>Phase 2: Vibe and HODL</div>
                <div>Phase 3: Meme Takeover</div>
              </div>
              <Image
                src={"/roadmapright.png"}
                height={200}
                width={200}
                alt=""
                className="m-auto hidden md:block mask mask-circle"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
