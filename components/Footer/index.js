import { linktree } from "@/config";
import Link from "next/link";
import Image from "next/image";
const Footer = () => {
  return (
    <>
      {" "}
      <Image
        src="/layer.png"
        height={1}
        width={100000}
        alt="full"
        className="w-full h-10"
      />
      <footer className="footer p-10">
        <nav>
          <h6 className="footer-title">Community</h6>
          <div className="grid grid-flow-col gap-4">
            <div
              className="btn btn-xs"
              onClick={(e) => {
                window.open("https://x.com/bbbpumpdotfun");
              }}
            >
              <svg
                height="20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
              </svg>
            </div>
            <div
              className="btn btn-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open("https://t.me/bbbpump");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                width="20"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21.961 4.33581C21.9448 4.26415 21.9094 4.19792 21.8583 4.14382C21.8072 4.08972 21.7423 4.04967 21.6702 4.02773C21.4074 3.97723 21.1355 3.99594 20.8827 4.08191C20.8827 4.08191 3.35851 10.1941 2.35768 10.8709C2.14268 11.0165 2.07018 11.1014 2.03434 11.2008C1.86101 11.686 2.40018 11.8946 2.40018 11.8946L6.91684 13.3226C6.99321 13.3359 7.07174 13.3315 7.14601 13.3097C8.17268 12.6798 17.4793 6.97509 18.0202 6.78345C18.1035 6.75919 18.1677 6.78345 18.151 6.84409C17.936 7.57588 9.89351 14.508 9.84934 14.5501C9.82783 14.5672 9.81107 14.5892 9.80059 14.6142C9.79011 14.6392 9.78624 14.6664 9.78934 14.6932L9.36768 18.9723C9.36768 18.9723 9.19101 20.3041 10.5635 18.9723C11.5368 18.0271 12.471 17.2443 12.9377 16.8635C14.491 17.9042 16.1618 19.0548 16.8827 19.6572C17.0039 19.7711 17.1476 19.8601 17.3051 19.9189C17.4626 19.9776 17.6307 20.005 17.7993 19.9993C18.007 19.9747 18.2021 19.8894 18.3585 19.7546C18.515 19.6198 18.6254 19.442 18.6752 19.2448C18.6752 19.2448 21.8668 6.77375 21.9735 5.10317C21.9843 4.94145 21.9985 4.83472 22.0002 4.72232C22.0054 4.59235 21.9922 4.46231 21.961 4.33581Z"
                  fill="currenColor"
                ></path>
              </svg>
            </div>
          </div>
        </nav>
        <nav>
          <h6 className="footer-title">About Us</h6>
          <Link className="link link-hover" href={"/about"}>
            About
          </Link>
        </nav>
        <nav>
          <h6 className="footer-title">Product</h6>
          <Link className="link link-hover" href={"/"}>
            Exchange
          </Link>
          <Link className="link link-hover" href={"/megadrop"}>
            Megadrop
          </Link>
          <Link className="link link-hover" href={"/farm"}>
            Farm
          </Link>
        </nav>
        <nav>
          <h6 className="footer-title">Learn</h6>
          <Link
            className="link link-hover"
            href={
              "https://docs.bbbpump.fun/how-to-play/how-to-create-your-own-memecoin"
            }
            target="_blank"
          >
            Create Your Own Memecoin
          </Link>
          <Link
            className="link link-hover"
            href={
              "https://docs.bbbpump.fun/how-to-play/how-to-buy-sell-memecoins"
            }
            target="_blank"
          >
            Buy/sell Memecoins
          </Link>
          <Link
            className="link link-hover"
            href={
              "https://docs.bbbpump.fun/how-to-play/how-to-stake-bbb-in-megadrop"
            }
            target="_blank"
          >
            Stake BBB
          </Link>
          <Link
            className="link link-hover"
            href={
              "https://docs.bbbpump.fun/how-to-play/how-to-unstake-bbb-in-megadrop"
            }
            target="_blank"
          >
            UnStake BBB
          </Link>
          <Link
            className="link link-hover"
            href={"https://docs.bbbpump.fun/how-to-play/how-to-buy-xdc"}
            target="_blank"
          >
            Buy XDC
          </Link>
          <Link
            className="link link-hover"
            href={"https://docs.bbbpump.fun/how-to-play/how-to-buy-bbb"}
            target="_blank"
          >
            Buy BBB
          </Link>
        </nav>
        <nav>
          <h6 className="footer-title">Service</h6>
          <Link
            className="link link-hover"
            href={"https://docs.bbbpump.fun/kol-program"}
            target="_blank"
          >
            KOL
          </Link>
          <Link className="link link-hover" href={"/referral"}>
            Referral
          </Link>
        </nav>
        <nav>
          <h6 className="footer-title">Support</h6>
          <Link
            className="link link-hover"
            href={"https://t.me/bbbsking"}
            target="_blank"
          >
            24/7 Chat Support
          </Link>
        </nav>
      </footer>
    </>
  );
};

export default Footer;
