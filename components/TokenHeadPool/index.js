import Image from "next/image";
const TokenHead = (props) => {
  const { name, symbol, deployer, createTime, poolCap } = props;
  
  return (
    <div className="card outline rounded-none outline-gray-200 sm:mx-2 py-1">
      <div className="card-body p-0">
        <div className="px-4 sm:flex gap-1 ">
          <div className="font-bold">
            {name} (${symbol})
          </div>

          <div
            className="hover:underline cursor-pointer flex gap-1 items-center"
            onClick={(e) => {
              router.push("/dashboard/" + deployer);
            }}
          >
            by
            <div className="h-4 w-4 overflow-hidden">
              <Image
                height={400}
                width={400}
                src={"/bbb.jpg"}
                alt={""}
                className="object-cover w-full h-full"
              />
            </div>
            {deployer?.substr(36)}
          </div>
          <div>at {createTime}</div>
          <div>cap: ${Number(poolCap)?.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default TokenHead;
