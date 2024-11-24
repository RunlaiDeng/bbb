import { useRouter } from "next/router";
import { useEffect } from "react";
import { chartLink, dexLink } from "@/config";
const Buy = () => {
  const router = useRouter();
  useEffect(() => {
    router.push(dexLink);
  });
  return <></>;
};
export default Buy;
