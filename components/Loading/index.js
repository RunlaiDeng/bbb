import Image from "next/image";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center py-20">
      <div className="relative mb-6">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-base-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loading;
