import dynamic from "next/dynamic";

export function FarmCardSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden"
      aria-busy="true"
      aria-label="Loading farm"
    >
      <div className="h-40 bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="mx-auto h-4 w-48 max-w-[85%] bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-50 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

const FarmCard = dynamic(() => import("@/components/FarmCard"), {
  ssr: false,
  loading: FarmCardSkeleton,
});

export default FarmCard;
