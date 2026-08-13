import Head from "next/head";
import BBBFiSwap from "@/components/BBBFiSwap";
import BscBbbBalance from "@/components/BscBbbBalance";
import { bsc } from "@/config/chains";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useChainId } from "wagmi";

export default function Home() {
  const strings = useTranslation();
  const chainId = useChainId();
  const isBscChain = chainId === bsc.id;
  const t = isBscChain ? strings.bscHome : strings.dexHome;

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
      </Head>
      {isBscChain ? <BscBbbBalance /> : <BBBFiSwap />}
    </>
  );
}
