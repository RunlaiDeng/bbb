import FarmCard from "@/components/FarmCard";
import Link from "next/link";
const Farm = () => {
  return (
    <>
      <div className="grid grid-cols-3 m-auto md:w-3/4 w-96">
        <div></div>
        <div className="text-center font-black mt-2">Farm</div>
        <Link className="text-right" href="/help">
          <button className="btn">?</button>
        </Link>
      </div>
      <FarmCard />
    </>
  );
};

export default Farm;
