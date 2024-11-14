import { useEffect, useState } from "react";

const Address = () => {
  const { addr } = router.query;

  const [mount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  }, []);
  return mount && <></>;
};

export default Address;
