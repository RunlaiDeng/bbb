import Image from "next/image";
import { useRouter } from "next/router";

const Quests = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-8">
          Activity
        </h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="transform transition-all duration-300 hover:scale-105">
            <Image
              src={"/tradeevent.png"}
              height={300}
              width={300}
              className="w-full h-auto object-cover rounded-xl shadow-lg cursor-pointer hover:shadow-xl"
              onClick={() => {
                router.push("/activity/tradeevent");
              }}
              alt="Trade Event Activity"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quests;
