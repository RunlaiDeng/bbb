import { useRouter } from "next/router";
import { useEffect } from "react";
import { chartLink } from "@/config";
const Buy = () => {
  const router = useRouter();
  useEffect(() => {
    router.push(chartLink);
  });
  return <></>;
};
export default Buy;
