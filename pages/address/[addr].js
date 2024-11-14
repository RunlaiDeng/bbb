import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Address = () => {
  const router = useRouter();
  const { addr } = router.query;

  const [mount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  }, []);
  return mount && <></>;
};

export default Address;
