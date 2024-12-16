import { useEffect, useRef, useState, useCallback } from "react";
import rpc from "@/components/Rpc";
import { useNotification } from "../Context/notice";
import Image from "next/image";
import { useRouter } from "next/router";

const TokenChat = (props) => {
  const { chainId, index, address } = props;
  const router = useRouter();
  const scrollRef = useRef(null);
  const { info } = useNotification();
  
  const [tokenInfo, setTokenInfo] = useState({ sendMsgContent: "" });
  const [messages, setMessages] = useState([]);

  const fetchMessages = useCallback(async () => {
    if (!chainId || !index) return;
    
    try {
      const msgResult = await rpc.getMsg(chainId.toString(), index.toString());
      
      if (Array.isArray(msgResult)) {
        setMessages(msgResult.reverse());
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [chainId, index]);

  const handleSendMessage = useCallback(async () => {
    if (!tokenInfo.sendMsgContent) return;

    try {
      await rpc.sendMsg(
        chainId?.toString(),
        index?.toString(),
        tokenInfo.sendMsgContent,
        address
      );
      setTokenInfo(prev => ({ ...prev, sendMsgContent: "" }));
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      info("Failed to send message");
    }
  }, [chainId, index, address, tokenInfo.sendMsgContent, fetchMessages, info]);

  const handleInputChange = useCallback((e) => {
    setTokenInfo(prev => ({
      ...prev,
      sendMsgContent: e.target.value
    }));
  }, []);

  const handleKeyDown = useCallback(async (e) => {
    if (e.key === "Enter") {
      await handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleUserClick = useCallback((userAddress) => {
    router.push("/dashboard/" + userAddress);
  }, [router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="card text-xs h-full flex flex-col" id="chat">
      <div className="card-body p-1 flex flex-col h-full">
        <div className="overflow-auto flex-1" ref={scrollRef}>
          {messages?.map((item, index) => (
            <div className="card rounded-none my-1" key={index}>
              <div className="card-body p-1">
                <div className="flex gap-2">
                  <div className="h-4 w-4 overflow-hidden">
                    <Image
                      height={400}
                      width={400}
                      src={"/bbb.jpg"}
                      alt={"user avatar"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div
                    className="hover:underline cursor-pointer font-bold"
                    onClick={() => handleUserClick(item?.address)}
                  >
                    {item?.address?.substr(36)}
                  </div>
                  <time className="text-xs opacity-50">{item?.time}</time>
                </div>
                <div className="text-left">{item?.msg}</div>
                <div className="flex gap-2">
                  <div
                    className="cursor-pointer hover:bg-slate-300 rounded-lg flex gap-2 p-1"
                    onClick={() => info("Coming soon")}
                  >
                    <svg
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="4261"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M797.184 518.496l-284.384 294.016-284.16-292A162.752 162.752 0 0 1 192 417.6C192 328.512 263.808 256 352 256a159.36 159.36 0 0 1 133.28 72.16L512 368.64l26.72-40.48A159.488 159.488 0 0 1 672 256c88.224 0 160 72.512 160 161.6 0 37.536-12.992 74.08-34.816 100.896M672 192a222.72 222.72 0 0 0-160 67.712A222.624 222.624 0 0 0 352 192c-123.52 0-224 101.216-224 225.6 0 52.288 18.176 103.232 52.96 145.536l285.952 293.984a62.4 62.4 0 0 0 45.088 19.168c17.12 0 33.12-6.816 45.12-19.136l287.744-296.064A226.816 226.816 0 0 0 896 417.6C896 293.216 795.52 192 672 192"
                        fill="#3E3A39"
                        p-id="4262"
                      ></path>
                    </svg>
                    0
                  </div>
                  <div
                    className="cursor-pointer hover:bg-slate-300 rounded-lg flex gap-2 p-1"
                    onClick={() => info("Coming soon")}
                  >
                    <svg
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="5350"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M401.807 730.808l68.464-70.68A30 30 0 0 1 491.819 651H742c16.569 0 30-13.431 30-30V297c0-16.569-13.431-30-30-30H282c-16.569 0-30 13.431-30 30v324c0 16.569 13.431 30 30 30h72.1a30 30 0 0 1 28.535 20.739l19.172 59.07zM332.297 711H282c-49.706 0-90-40.294-90-90V297c0-49.706 40.294-90 90-90h460c49.706 0 90 40.294 90 90v324c0 49.706-40.294 90-90 90H504.527l-94.313 97.368c-15.734 16.244-43.102 9.899-50.083-11.611L332.297 711z"
                        fill="#2c2c2c"
                        p-id="5351"
                      ></path>
                    </svg>
                    Reply
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-base-100 pt-2">
          <label className="input input-bordered flex items-center gap-2 input-sm mx-1">
            <input
              type="text"
              className="grow"
              value={tokenInfo?.sendMsgContent}
              placeholder="Type Here"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <kbd
              className="kbd kbd-sm cursor-pointer"
              onClick={handleSendMessage}
            >
              ↑
            </kbd>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TokenChat;
