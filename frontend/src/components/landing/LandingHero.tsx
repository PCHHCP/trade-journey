import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { LandingHeroGlobe } from "@/components/landing/LandingHeroGlobe";
import { MarketTicker } from "@/components/landing/MarketTicker";

interface LandingHeroProps {
  onLogin: () => void;
}

const NAV_ITEMS = ["Markets", "Terminal", "Assets", "Governance"];
const HERO_TITLE_LINES = ["Plan your trade", "trade your plan"] as const;
const HERO_EASE = [0.16, 1, 0.3, 1] as const;

export function LandingHero({ onLogin }: LandingHeroProps) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sectionInitial = prefersReducedMotion
    ? false
    : { opacity: 0, scale: 0.98, y: 20 };
  const buttonInitial = prefersReducedMotion ? false : { opacity: 0, y: 20 };
  const globeInitial = prefersReducedMotion
    ? false
    : { opacity: 0, scale: 0.8 };
  const tickerInitial = prefersReducedMotion ? false : { opacity: 0 };

  return (
    <motion.section
      initial={sectionInitial}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: HERO_EASE }}
      className="relative flex min-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-gray-800/50 bg-[#1a1b1e] shadow-2xl lg:min-h-[calc(100dvh-3.5rem)]"
    >
      <div className="absolute inset-0 bg-[#16171a] -z-10" />
      <div className="relative border-b border-white/8 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xl font-semibold tracking-tight text-[#90E0EF] sm:text-[1.75rem]">
              Tyche
            </span>
            <button
              type="button"
              onClick={onLogin}
              aria-label="打开登录面板"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/3 text-white/75 transition hover:border-[#5fe0ff]/40 hover:text-white xl:hidden"
            >
              <Wallet className="size-5" />
            </button>
          </div>

          {/* 导航栏 */}
          {/*todo: 目前是静态的，后续可以改成动态路由链接*/}
          {/* <nav className="flex flex-wrap items-center gap-4 text-sm sm:text-[0.95rem]">
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
          </nav> */}

          <div className="hidden items-center gap-4 xl:flex">
            <button
              type="button"
              onClick={onLogin}
              className="group relative inline-flex h-12 cursor-pointer overflow-hidden rounded-full p-[1px] transition-transform duration-300 hover:scale-105 focus:outline-none"
            >
              <span className="absolute inset-[-1000%] animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,#0ea5e9_0%,#1a1b1e_50%,#0ea5e9_100%)] opacity-70 transition-opacity duration-300 [animation-duration:4s] group-hover:opacity-100" />
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-[#1a1b1e] px-6 py-2 text-xs font-semibold tracking-[0.18em] text-[#38bdf8] uppercase backdrop-blur-3xl transition-all duration-300 group-hover:bg-[#1a1b1e]/80 group-hover:text-white">
                Get Start
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative grid flex-1 items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,1fr)] lg:px-8 lg:py-12">
        <div className="flex flex-col justify-center lg:max-w-[36rem] lg:pl-6 xl:pl-10">
          <motion.p
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            className="font-display text-6xl uppercase tracking-tight text-white lg:text-[80px] leading-none"
            style={{ perspective: "1000px" }}
          >
            {"Tyche".split("").map((letter, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 50,
                    rotateX: -80,
                    rotateY: 20,
                    scale: 0.8,
                    filter: "blur(10px)",
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: {
                      type: "spring",
                      damping: 12,
                      stiffness: 150,
                    },
                  },
                }}
                className="inline-block origin-bottom"
              >
                {letter}
              </motion.span>
            ))}
          </motion.p>
          <motion.div
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.5 },
              },
            }}
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            aria-label={HERO_TITLE_LINES.join("，")}
            role="heading"
            aria-level={1}
            className="mt-4 max-w-none space-y-2"
          >
            <p
              aria-hidden="true"
              className="flex flex-wrap gap-x-3 font-display text-5xl leading-[0.85] uppercase tracking-tight text-white lg:gap-x-4 lg:text-[72px]"
            >
              {HERO_TITLE_LINES[0].split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { x: 800, opacity: 0, skewX: -25 },
                    visible: {
                      x: [800, -50, 25, -10, 0],
                      opacity: [0, 1, 1, 1, 1],
                      skewX: [-25, 15, -8, 4, 0],
                      transition: {
                        duration: 0.8,
                        times: [0, 0.4, 0.65, 0.85, 1],
                        ease: ["easeIn", "easeOut", "easeInOut", "easeOut"],
                      },
                    },
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </p>
            <p
              aria-hidden="true"
              className="flex flex-wrap gap-x-3 font-display text-5xl leading-[0.85] uppercase tracking-tight text-[#90E0EF] lg:gap-x-4 lg:text-[72px]"
            >
              {HERO_TITLE_LINES[1].split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { x: 800, opacity: 0, skewX: -25 },
                    visible: {
                      x: [800, -50, 25, -10, 0],
                      opacity: [0, 1, 1, 1, 1],
                      skewX: [-25, 15, -8, 4, 0],
                      transition: {
                        duration: 0.8,
                        times: [0, 0.4, 0.65, 0.85, 1],
                        ease: ["easeIn", "easeOut", "easeInOut", "easeOut"],
                      },
                    },
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </p>
          </motion.div>
          <motion.div
            initial={buttonInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: HERO_EASE }}
            className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <button
              type="button"
              onClick={onLogin}
              className="group relative inline-flex h-14 min-w-40 cursor-pointer overflow-hidden rounded-full p-[1px] transition-transform duration-300 hover:scale-[1.02] focus:outline-none"
            >
              <span className="absolute inset-[-1000%] animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,#0ea5e9_0%,#1a1b1e_50%,#0ea5e9_100%)] opacity-70 transition-opacity duration-300 [animation-duration:4s] group-hover:opacity-100" />
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-[#1a1b1e] px-10 py-3 text-xs font-semibold tracking-[0.18em] text-[#38bdf8] uppercase backdrop-blur-3xl transition-all duration-300 group-hover:bg-[#1a1b1e]/80 group-hover:text-white">
                Start Trading Log
              </span>
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={globeInitial}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <div className="flex xl:hidden">
            <button
              type="button"
              onClick={onLogin}
              className="group relative inline-flex h-11 w-full cursor-pointer overflow-hidden rounded-full p-[1px] transition-transform duration-300 hover:scale-105 focus:outline-none"
            >
              <span className="absolute inset-[-1000%] animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,#0ea5e9_0%,#1a1b1e_50%,#0ea5e9_100%)] opacity-70 transition-opacity duration-300 [animation-duration:4s] group-hover:opacity-100" />
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-[#1a1b1e] px-6 py-2 text-xs font-semibold tracking-[0.18em] text-[#38bdf8] uppercase backdrop-blur-3xl transition-all duration-300 group-hover:bg-[#1a1b1e]/80 group-hover:text-white">
                Ge Start
              </span>
            </button>
          </div>

          <LandingHeroGlobe />
        </motion.div>
      </div>

      <motion.div
        initial={tickerInitial}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8, ease: HERO_EASE }}
      >
        <MarketTicker />
      </motion.div>
    </motion.section>
  );
}
