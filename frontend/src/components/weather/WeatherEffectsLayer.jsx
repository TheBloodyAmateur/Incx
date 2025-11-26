import React from "react";

function RainOverlay() {
    const drops = Array.from({ length: 80 });

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
                mixBlendMode: "screen",
                zIndex: 40,
            }}
        >
            {drops.map((_, i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 1.5;
                const duration = 1.8 + Math.random() * 1.5;

                return (
                    <span
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${left}%`,
                            top: "-20%",
                            width: "2px",
                            height: "35vh",
                            background: "rgba(255,255,255,0.4)",
                            filter: "blur(0.5px)",
                            animationName: "rain-fall",
                            animationDuration: `${duration}s`,
                            animationDelay: `${delay}s`,
                            animationIterationCount: "infinite",
                            animationTimingFunction: "linear",
                        }}
                    />
                );
            })}

            <style>{`
@keyframes rain-fall {
  0% { transform: translateY(0vh); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(120vh); opacity: 0; }
}
            `}</style>
        </div>
    );
}

function SunOverlay() {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: 40,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    width: "60vw",
                    height: "60vw",
                    maxWidth: "700px",
                    maxHeight: "700px",
                    borderRadius: "9999px",
                    background:
                        "radial-gradient(circle at center, rgba(255,255,255,0.95), rgba(255,255,0,0.5), transparent 70%)",
                    filter: "blur(12px)",
                    mixBlendMode: "screen",
                    animation: "sun-flare 18s linear infinite",
                }}
            />

            <style>{`
@keyframes sun-flare {
  0% { transform: translate(-30%, -30%) scale(1); }
  25% { transform: translate(60%, -20%) scale(1.1); }
  50% { transform: translate(20%, 40%) scale(0.9); }
  75% { transform: translate(-20%, 60%) scale(1.05); }
  100% { transform: translate(-30%, -30%) scale(1); }
}
            `}</style>
        </div>
    );
}

export default function WeatherEffectsLayer({ mode, devMode }) {
    if (devMode) return null;
    if (!mode) return null;

    return (
        <>
            {mode === "rain" && <RainOverlay />}
            {mode === "sun" && <SunOverlay />}
        </>
    );
}
