import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import copy from "copy-to-clipboard";
import { useNotification } from "@/components/Context/notice";
const Desposit = () => {
  const { address } = useAccount();

  const qrcode = {
    value: address,
    size: 256,
    imageSettings: {
      src: "/xdc.png",
      height: 48,
      width: 48,
      excavate: true,
    },
  };

  const { success } = useNotification();
  return (
    <>
      <div className="card w-96 m-auto">
        <div className="card-body text-center font-bold">
          <h3>Deposit XDC</h3>
          {address && (
            <div className="m-auto">
              <QRCodeSVG {...qrcode} />
            </div>
          )}
        </div>
      </div>
      <div className="card w-96 m-auto outline outline-gray-200">
        <div className="card-body text-left font-bold">
          <div className="opacity-50">Network</div>
          <div>XDC</div>
          <div className="divider my-1"></div>
          <div className="opacity-50">Deposit Address</div>
          <div className="grid grid-cols-8 items-center gap-2">
            <div className="break-all col-span-7">{address}</div>
            <div className="break-all col-span-1">
              <div
                className={"cursor-pointer tooltip"}
                data-tip="Copy Address"
                onClick={() => {
                  copy(address);
                  success("copy success!");
                }}
              >
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="1641"
                  width="20"
                  height="20"
                >
                  <path
                    d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z"
                    fill="#5E6570"
                    p-id="1642"
                  ></path>
                  <path
                    d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z"
                    fill="#5E6570"
                    p-id="1643"
                  ></path>
                  <path
                    d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z"
                    fill="#5E6570"
                    p-id="1644"
                  ></path>
                  <path
                    d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z"
                    fill="#5E6570"
                    p-id="1645"
                  ></path>
                  <path
                    d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z"
                    fill="#5E6570"
                    p-id="1646"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Desposit;
