import Head from "next/head";
import Image from "next/image";
import Navbar from "../Navbar";
import MobileNav from "../MobileNav";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { bsc, xdc } from "@/config/chains";
import { useRouter } from "next/router";
import { decodeAbiParameters, encodeAbiParameters, formatUnits } from "viem";

const BBB_IDO_CONTRACT_ADDRESS = "0x6dfda506A1B0513d941E7778c7B8F90e8Fa1C21D";
const BBB_IDO_USER_PARTICIPATION_SELECTOR = "0xc2e962ed";

function formatTokenAmount(value, decimals = 18, fractionDigits = 4) {
  if (value == null) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, fractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

const BscUnderConstruction = ({ t }) => {
  const { address } = useAccount();
  const xdcPublicClient = usePublicClient({ chainId: xdc.id });
  const [participatedBBB, setParticipatedBBB] = useState(null);
  const [isLoadingParticipation, setIsLoadingParticipation] = useState(false);
  const [participationError, setParticipationError] = useState(false);

  useEffect(() => {
    if (!address) {
      setParticipatedBBB(null);
      setIsLoadingParticipation(false);
      setParticipationError(false);
      return;
    }
    if (!xdcPublicClient) return;

    let cancelled = false;

    const fetchParticipation = async () => {
      setIsLoadingParticipation(true);
      setParticipationError(false);

      try {
        const encodedAddress = encodeAbiParameters([{ type: "address" }], [address]).slice(2);
        const { data } = await xdcPublicClient.call({
          to: BBB_IDO_CONTRACT_ADDRESS,
          data: `${BBB_IDO_USER_PARTICIPATION_SELECTOR}${encodedAddress}`,
        });
        const [amount] = decodeAbiParameters([{ type: "uint256" }], data);

        if (!cancelled) setParticipatedBBB(amount);
      } catch (error) {
        console.error("Failed to load IDO participation:", error);
        if (!cancelled) {
          setParticipatedBBB(null);
          setParticipationError(true);
        }
      } finally {
        if (!cancelled) setIsLoadingParticipation(false);
      }
    };

    fetchParticipation();

    return () => {
      cancelled = true;
    };
  }, [address, xdcPublicClient]);

  const participationText = !address
    ? t.bscHome.connectToViewIdo
    : isLoadingParticipation
      ? t.bscHome.loadingIdoParticipation
      : participationError
        ? t.bscHome.idoParticipationUnavailable
        : `${formatTokenAmount(participatedBBB, 18, 4)} BBB`;

  return (
    <section className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-white px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <div className="w-full max-w-xl">
          <Image
            src="/bbbpump-card.png"
            alt={t.bscHome.imageAlt}
            width={1600}
            height={776}
            priority
            className="h-auto w-full object-contain"
          />
        </div>
        <div className="mt-7 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
          BSC
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          {t.bscHome.title}
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-gray-600">
          {t.bscHome.description}
        </p>
        <div className="mt-6 w-full max-w-sm rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm shadow-emerald-900/5">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {t.bscHome.idoParticipationLabel}
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span
              className="h-8 w-8 rounded-lg border border-white bg-white bg-contain bg-center bg-no-repeat shadow-sm"
              style={{ backgroundImage: "url('/favicon.ico')" }}
              aria-label="BBBFI BBB"
              role="img"
            />
            <span className="text-xl font-bold text-gray-900">{participationText}</span>
          </div>
          {address && !participationError && (
            <div className="mt-1 text-xs text-gray-500">{t.bscHome.idoParticipationHint}</div>
          )}
        </div>
      </div>
    </section>
  );
};

const Layout = ({ children }) => {
  const t = useTranslation();
  const router = useRouter();
  const chainId = useChainId();
  const isBscChain = chainId === bsc.id;
  const { isReady, pathname, replace } = router;
  const siteOrigin = useMemo(() => {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return explicit.replace(/\/$/, "");
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "";
  }, []);
  const ogImage = siteOrigin ? `${siteOrigin}/bbb.jpg` : "";

  useEffect(() => {
    if (!isBscChain || !isReady || pathname === "/") return;
    replace("/");
  }, [isBscChain, isReady, pathname, replace]);

  return (
    <main className="min-h-screen">
      <Head>
        <title>{t.layout.defaultTitle}</title>
        <meta name="description" content={t.layout.defaultDescription} />
        <meta property="og:title" content={t.layout.defaultTitle} />
        <meta property="og:description" content={t.layout.defaultDescription} />
        <meta property="og:type" content="website" />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div className={`min-h-screen ${isBscChain ? "bg-white" : "mobile-safe-bottom"}`}>
        <Navbar />
        {isBscChain ? <BscUnderConstruction t={t} /> : children}
      </div>

      {!isBscChain && <MobileNav />}
    </main>
  );
};

export default Layout;
