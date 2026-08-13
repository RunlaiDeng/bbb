import Head from "next/head";
import BBBFiSwap from "@/components/BBBFiSwap";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Home() {
  const t = useTranslation().dexHome;

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
      </Head>
      <BBBFiSwap />
    </>
  );
}
