import { Wallet } from "lucide-react";
import { LandingHeroGlobe } from "@/components/landing/LandingHeroGlobe";
import { Button } from "@/components/ui/button";
import { MarketTicker } from "@/components/landing/MarketTicker";

interface LandingHeroProps {
  onLogin: () => void;
}

const NAV_ITEMS = ["Markets", "Terminal", "Assets", "Governance"];

export function LandingHero({ onLogin }: LandingHeroProps) {
  return (
    <section className="relative flex min-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#0c0f14]/95 shadow-[0_35px_90px_rgba(0,0,0,0.5)] lg:min-h-[calc(100dvh-3.5rem)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,210,106,0.16),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.02),_rgba(255,255,255,0))]" />
      <div className="relative border-b border-white/8 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xl font-semibold tracking-tight text-[#00d26a] sm:text-[1.75rem]">
              Tyche
            </span>
            <button
              type="button"
              onClick={onLogin}
              aria-label="打开登录面板"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-white/75 transition hover:border-[#5fe0ff]/40 hover:text-white xl:hidden"
            >
              <Wallet className="size-5" />
            </button>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm sm:text-[0.95rem]">
            {NAV_ITEMS.map((item, index) => (
              <span
                key={item}
                className={
                  index === 0
                    ? "border-b-2 border-[#00d26a] pb-2 font-medium tracking-[0.22em] text-[#00d26a] uppercase"
                    : "pb-2 tracking-[0.22em] text-white/65 uppercase"
                }
              >
                {item}
              </span>
            ))}
          </nav>

          <div className="hidden items-center gap-4 xl:flex">
            <button
              type="button"
              onClick={onLogin}
              aria-label="打开登录面板"
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-white/75 transition hover:border-[#5fe0ff]/40 hover:text-white"
            >
              <Wallet className="size-5" />
            </button>
            <Button
              size="lg"
              onClick={onLogin}
              className="h-12 rounded-none border border-[#5fe0ff]/50 bg-[#38c5ea] px-6 text-xs font-semibold tracking-[0.18em] text-[#03131a] uppercase shadow-[0_0_30px_rgba(56,197,234,0.35)] hover:bg-[#54d6f4]"
            >
              Get_Started
            </Button>
          </div>
        </div>
      </div>

      <div className="relative grid flex-1 items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,1fr)] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center">
          <p className="text-[3rem] font-semibold tracking-[0.42em] text-[#00d26a]">
            Tyche
          </p>
          <h1 className="mt-4 max-w-none text-4xl leading-none font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.4rem]">
            <span className="block whitespace-nowrap">计划你的交易</span>
            <span className="ml-[1.9ch] block whitespace-nowrap sm:ml-[3.1ch]">
              交易你的计划
            </span>
          </h1>
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={onLogin}
              className="h-11 min-w-40 rounded-none border border-[#00d26a]/45 bg-[#00d26a] px-6 text-xs font-semibold tracking-[0.18em] text-[#02110a] uppercase shadow-[0_0_35px_rgba(0,210,106,0.2)] hover:bg-[#19e37c]"
            >
              Start Trading Log
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex xl:hidden">
            <Button
              size="lg"
              onClick={onLogin}
              className="h-11 w-full rounded-none border border-[#5fe0ff]/50 bg-[#38c5ea] px-6 text-xs font-semibold tracking-[0.18em] text-[#03131a] uppercase shadow-[0_0_30px_rgba(56,197,234,0.35)] hover:bg-[#54d6f4]"
            >
              Get_Started
            </Button>
          </div>

          <LandingHeroGlobe />
        </div>
      </div>

      <MarketTicker />
    </section>
  );
}
