import Image from "next/image";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import useConnectWallet from "@/components/Hook/useConnectWallet";
import { BSC_BBB_TOKEN_ADDRESS } from "@/config/bsc";
import { bsc } from "@/config/chains";
import { useTranslation } from "@/lib/i18n/useTranslation";

function formatBbbAmount(value, decimals = 18, fractionDigits = 6) {
  if (value == null) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmedFraction = fraction.slice(0, fractionDigits).replace(/0+$/, "");
  return trimmedFraction ? `${groupedWhole}.${trimmedFraction}` : groupedWhole;
}

function CarrotTokenMark() {
  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-white to-amber-50 shadow-[0_18px_45px_-20px_rgba(245,158,11,0.45)]">
      <Image
        src="/logo.png"
        alt="BBB carrot token logo"
        width={228}
        height={96}
        priority
        className="absolute left-0 top-0 h-24 w-auto max-w-none object-contain object-left"
      />
    </div>
  );
}

export default function BscBbbBalance() {
  const t = useTranslation().bscHome;
  const { address, isConnected } = useAccount();
  const openConnect = useConnectWallet();
  const {
    data: bbbBalance,
    isPending: balancePending,
    isError: balanceError,
  } = useBalance({
    address,
    token: BSC_BBB_TOKEN_ADDRESS,
    chainId: bsc.id,
    query: {
      enabled: Boolean(address),
      refetchInterval: 15_000,
    },
  });

  const balanceText = !isConnected
    ? "—"
    : balancePending
      ? t.loadingBalance
      : balanceError
        ? t.balanceUnavailable
        : formatBbbAmount(bbbBalance?.value, bbbBalance?.decimals ?? 18);

  return (
    <section className="dex-surface relative flex min-h-[calc(100vh-4.5rem)] items-center overflow-hidden px-4 pb-24 pt-10 sm:px-6 sm:pb-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="dex-orb dex-orb-left" />
        <div className="dex-orb dex-orb-right" />
        <div className="dex-grid absolute inset-0 opacity-30" />
      </div>

      <div className="relative mx-auto w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.14)]" />
          {t.networkBadge}
        </div>

        <article className="mt-5 flex flex-col items-center rounded-[2rem] border border-black/[0.06] bg-white/90 p-7 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.42)] backdrop-blur-2xl sm:p-9">
          <CarrotTokenMark />
          <h1 className="mt-5 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
            {t.title}
          </h1>

          <div className="mt-6 w-full rounded-[1.5rem] bg-slate-50 px-4 py-7" aria-live="polite">
            <p className="break-words text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
              {balanceText}
            </p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
              BBB
            </p>
          </div>

          {!isConnected ? (
            <button
              type="button"
              onClick={openConnect}
              className="mt-5 h-12 w-full rounded-[1.15rem] bg-emerald-500 px-5 text-sm font-bold text-white transition hover:bg-emerald-600 active:scale-[0.99]"
            >
              {t.connectWallet}
            </button>
          ) : null}
        </article>
      </div>
    </section>
  );
}
