import dynamic from "next/dynamic";

export function StakingPoolSkeleton() {
  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white shadow-md mb-4 overflow-hidden"
      aria-busy="true"
      aria-label="Loading pool"
    >
      <div className="h-14 bg-gray-100 animate-pulse border-b border-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-10 rounded-lg bg-gray-50 animate-pulse" />
      </div>
    </div>
  );
}

const StakingPool = dynamic(() => import("@/components/StakingPool"), {
  ssr: false,
  loading: StakingPoolSkeleton,
});

export default StakingPool;
