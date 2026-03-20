import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import createGlobe from "cobe";
import type { Globe, Marker } from "cobe";

interface GlobeMarker extends Marker {
  id: string;
  label: string;
  hoverInfo: string;
}

const GLOBE_MARKERS: GlobeMarker[] = [
  {
    id: "new-york",
    label: "New York market",
    hoverInfo: "展位",
    location: [40.7128, -74.006],
    size: 0.05,
  },
  {
    id: "london",
    label: "London market",
    hoverInfo: "展位",
    location: [51.5072, -0.1276],
    size: 0.05,
  },
  {
    id: "singapore",
    label: "Singapore market",
    hoverInfo: "展位",
    location: [1.3521, 103.8198],
    size: 0.05,
  },
  {
    id: "tokyo",
    label: "Tokyo market",
    hoverInfo: "展位",
    location: [35.6764, 139.65],
    size: 0.05,
  },
];

function getMarkerAnchorStyle(
  markerId: string,
): CSSProperties & { positionAnchor: string } {
  return {
    positionAnchor: `--cobe-${markerId}`,
    left: "anchor(center)",
    top: "anchor(center)",
    transform: "translate(-50%, -50%)",
    opacity: `var(--cobe-visible-${markerId}, 0)`,
    pointerEvents:
      `var(--cobe-visible-${markerId}, none)` as CSSProperties["pointerEvents"],
  };
}

function getTooltipAnchorStyle(
  markerId: string,
): CSSProperties & { positionAnchor: string } {
  return {
    positionAnchor: `--cobe-${markerId}`,
    left: "anchor(center)",
    top: "anchor(top)",
    transform: "translate(-50%, calc(-100% - 0.75rem))",
    opacity: `var(--cobe-visible-${markerId}, 0)`,
    pointerEvents: "none",
  };
}

export function LandingHeroGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<Globe | null>(null);
  const phiRef = useRef(0);
  const sizeRef = useRef(0);
  const activeMarkerIdRef = useRef<string | null>(null);
  const dragStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startPhi: number;
  }>({
    pointerId: null,
    startX: 0,
    startPhi: 0,
  });
  const [size, setSize] = useState(0);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const initialSize = Math.round(container.clientWidth);
    if (initialSize > 0 && sizeRef.current !== initialSize) {
      sizeRef.current = initialSize;
      setSize(initialSize);
    }

    const observer = new ResizeObserver(([entry]) => {
      const nextSize = Math.round(entry.contentRect.width);
      if (sizeRef.current === nextSize) {
        return;
      }

      sizeRef.current = nextSize;
      setSize(nextSize);
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const canvasHost = canvasHostRef.current;
    if (!canvasHost || size === 0) {
      return;
    }

    const renderSize = Math.round(size);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "block size-full";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvasHost.replaceChildren(canvas);

    let frameId = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: renderSize,
      height: renderSize,
      phi: phiRef.current,
      theta: 0.22,
      dark: 1,
      diffuse: 1.6,
      scale: 1.15,
      mapSamples: 16000,
      mapBrightness: 10,
      mapBaseBrightness: 0,
      baseColor: [0.78, 0.78, 0.78],
      markerColor: [0.24, 0.56, 1],
      glowColor: [0.36, 0.22, 0.82],
      opacity: 1,
      offset: [0, 0],
      markers: GLOBE_MARKERS,
    });
    globeRef.current = globe;

    const rotate = () => {
      if (
        dragStateRef.current.pointerId === null &&
        activeMarkerIdRef.current === null
      ) {
        phiRef.current += 0.0015;
      }

      globe.update({ phi: phiRef.current });

      frameId = window.requestAnimationFrame(rotate);
    };

    frameId = window.requestAnimationFrame(rotate);

    return () => {
      window.cancelAnimationFrame(frameId);
      if (globeRef.current === globe) {
        globeRef.current = null;
      }
      globe.destroy();
      if (canvasHost.isConnected) {
        canvasHost.replaceChildren();
      }
    };
  }, [size]);

  function setMarkerActive(markerId: string | null) {
    activeMarkerIdRef.current = markerId;
    setActiveMarkerId(markerId);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    setMarkerActive(null);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startPhi: phiRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    phiRef.current = dragStateRef.current.startPhi + deltaX * 0.01;
    globeRef.current?.update({ phi: phiRef.current });
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = {
      pointerId: null,
      startX: 0,
      startPhi: phiRef.current,
    };

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleMarkerPointerEnter(markerId: string) {
    setMarkerActive(markerId);
  }

  function handleMarkerPointerLeave(markerId: string) {
    if (activeMarkerIdRef.current === markerId) {
      setMarkerActive(null);
    }
  }

  const activeMarker =
    GLOBE_MARKERS.find((marker) => marker.id === activeMarkerId) ?? null;

  return (
    <div className="relative mx-auto flex w-full max-w-[30rem] items-center justify-center">
      <div className="pointer-events-none absolute inset-x-[8%] top-[10%] h-[70%] rounded-full bg-[radial-gradient(circle,_rgba(0,210,106,0.22),_rgba(12,15,20,0)_68%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-[6%] rounded-full bg-[radial-gradient(circle,_rgba(100,70,255,0.22)_0%,_rgba(74,114,255,0.14)_48%,_rgba(12,15,20,0)_74%)] blur-2xl" />

      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-[30rem] cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div ref={canvasHostRef} className="relative z-10 size-full" />

        {GLOBE_MARKERS.map((marker) => (
          <button
            key={marker.id}
            type="button"
            aria-label={marker.label}
            className="absolute z-20 size-6 rounded-full border-0 bg-transparent p-0 outline-none transition-transform duration-200 hover:scale-110 focus-visible:scale-110"
            style={getMarkerAnchorStyle(marker.id)}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onPointerEnter={() => handleMarkerPointerEnter(marker.id)}
            onPointerLeave={() => handleMarkerPointerLeave(marker.id)}
            onFocus={() => handleMarkerPointerEnter(marker.id)}
            onBlur={() => handleMarkerPointerLeave(marker.id)}
          />
        ))}

        {activeMarker ? (
          <div
            className="absolute z-30 min-w-20 rounded-full border border-white/14 bg-neutral-950/88 px-3 py-1.5 text-center text-xs font-medium tracking-[0.14em] text-white shadow-[0_16px_40px_rgba(0,0,0,0.32)] backdrop-blur-sm"
            style={getTooltipAnchorStyle(activeMarker.id)}
          >
            {activeMarker.hoverInfo}
          </div>
        ) : null}
      </div>
    </div>
  );
}
