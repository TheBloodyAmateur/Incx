import React, { useEffect, useRef, useState } from "react";
import { useWeather } from "../../context/WeatherContext";

const WeatherCursor = () => {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);
    const positionRef = useRef({ x: 0, y: 0 });
    const targetRef = useRef({ x: 0, y: 0 });
    const lastMoveTimeRef = useRef(Date.now());
    const isMovingRef = useRef(false);
    const frozenPosRef = useRef({ x: 0, y: 0 });

    // Get weather context
    const { weatherData, lastThunderTime } = useWeather();

    // Effect states
    const [isFrozen, setIsFrozen] = useState(false);
    const [rainDrops, setRainDrops] = useState([]);
    const [sweatDrops, setSweatDrops] = useState([]);
    const [thunderFlash, setThunderFlash] = useState(false);

    // Weather conditions
    const temperature = weatherData?.temperature ?? 20;
    const windSpeed = weatherData?.windSpeed ?? 0;
    const weatherType = weatherData?.weatherType ?? 'clear';
    const viewMode = weatherData?.viewMode ?? 'normal';
    const isActive = weatherData?.isActive ?? false;

    // Effects disabled in dev mode
    const effectsEnabled = isActive && viewMode !== 'dev';

    const isFreezing = effectsEnabled && temperature < 0 && weatherType !== 'thunder';
    const isWindy = effectsEnabled && windSpeed > 20;
    const isRaining = effectsEnabled && (weatherType === 'rain' || weatherType === 'thunder');
    const isFoggy = effectsEnabled && weatherType === 'fog';
    const isThunder = effectsEnabled && weatherType === 'thunder';
    const isSnowy = effectsEnabled && weatherType === 'snow';
    const isHot = effectsEnabled && temperature > 30;

    // Freeze effect - freezes cursor periodically when < 0°C
    // First freeze: 1-2s, Duration: 3-5s, Interval: 5-8s
    useEffect(() => {
        if (!isFreezing) {
            setIsFrozen(false);
            return;
        }

        let cancelled = false;
        let timeoutIds = [];

        const startFreeze = () => {
            if (cancelled) return;

            frozenPosRef.current = { ...positionRef.current };
            setIsFrozen(true);

            const freezeDuration = 3000 + Math.random() * 2000; // 3-5 seconds
            const freezeEndTimeout = setTimeout(() => {
                if (cancelled) return;
                setIsFrozen(false);

                const nextFreezeTimeout = setTimeout(() => {
                    if (!cancelled) startFreeze();
                }, 5000 + Math.random() * 3000); // Next freeze in 5-8s
                timeoutIds.push(nextFreezeTimeout);
            }, freezeDuration);
            timeoutIds.push(freezeEndTimeout);
        };

        // First freeze after 1-2 seconds
        const initialTimeout = setTimeout(startFreeze, 1000 + Math.random() * 1000);
        timeoutIds.push(initialTimeout);

        return () => {
            cancelled = true;
            timeoutIds.forEach(id => clearTimeout(id));
            setIsFrozen(false);
        };
    }, [isFreezing]);

    // Thunder flash effect - Synced double flash
    // Triggers 600ms AFTER screen flash trigger (so screen sequence finishes ~500ms)
    useEffect(() => {
        if (!isThunder || !lastThunderTime) {
            setThunderFlash(false);
            return;
        }

        // Wait 600ms (screen sequence finishes around 500ms)
        const startDelay = setTimeout(() => {
            // Flash 1
            setThunderFlash(true);
            setTimeout(() => setThunderFlash(false), 50);

            // Flash 2
            setTimeout(() => {
                setThunderFlash(true);
                setTimeout(() => setThunderFlash(false), 50);
            }, 100); // 50ms gap

        }, 600);

        return () => clearTimeout(startDelay);
    }, [lastThunderTime, isThunder]);

    // Rain drop trail - always spawn when raining
    useEffect(() => {
        if (!isRaining) {
            setRainDrops([]);
            return;
        }

        const dropInterval = setInterval(() => {
            const drop = {
                id: Date.now() + Math.random(),
                x: positionRef.current.x + (Math.random() - 0.5) * 40,
                y: positionRef.current.y + (Math.random() - 0.5) * 40
            };
            setRainDrops(prev => [...prev.slice(-15), drop]);
        }, 80);

        return () => clearInterval(dropInterval);
    }, [isRaining]);

    // Sweat drops for hot weather
    useEffect(() => {
        if (!isHot) {
            setSweatDrops([]);
            return;
        }

        const sweatInterval = setInterval(() => {
            const drop = {
                id: Date.now() + Math.random(),
                x: positionRef.current.x + (Math.random() - 0.5) * 30,
                y: positionRef.current.y + (Math.random() - 0.5) * 30,
                angle: Math.random() * 360
            };
            setSweatDrops(prev => [...prev.slice(-6), drop]);
        }, 500);

        return () => clearInterval(sweatInterval);
    }, [isHot]);

    // Get setWindDirection from context
    const { setWindDirection } = useWeather();

    // Wind direction ref (persists across re-renders)
    const windDirectionRef = useRef({ x: 1, y: 0 });
    const windDriftRef = useRef(0);

    // Change wind direction randomly every 3-8 seconds
    useEffect(() => {
        if (!isWindy) return;

        const changeDirection = () => {
            const directions = [
                { x: 1, y: 0 },   // right
                { x: -1, y: 0 },  // left
                { x: 0, y: 1 },   // down
                { x: 0, y: -1 },  // up
                { x: 0.7, y: 0.7 },   // diagonal right-down
                { x: -0.7, y: 0.7 },  // diagonal left-down
                { x: 0.7, y: -0.7 },  // diagonal right-up
                { x: -0.7, y: -0.7 }, // diagonal left-up
            ];
            const newDir = directions[Math.floor(Math.random() * directions.length)];
            windDirectionRef.current = newDir;
            windDriftRef.current = 0; // Reset drift to prevent jump
            setWindDirection(newDir); // Update context for WeatherOverlay
        };

        changeDirection(); // Initial direction
        const interval = setInterval(changeDirection, 3000 + Math.random() * 5000);
        return () => clearInterval(interval);
    }, [isWindy, setWindDirection]);

    // Main cursor animation loop
    useEffect(() => {
        let animationId;

        const animate = () => {
            const now = Date.now();
            const timeSinceMove = now - lastMoveTimeRef.current;
            isMovingRef.current = timeSinceMove < 100;

            // If frozen, use frozen position
            if (isFrozen) {
                if (cursorRef.current) {
                    cursorRef.current.style.transform = `translate3d(${frozenPosRef.current.x}px, ${frozenPosRef.current.y}px, 0) translate(-50%, -50%)`;
                }
                if (dotRef.current) {
                    dotRef.current.style.transform = `translate3d(${frozenPosRef.current.x}px, ${frozenPosRef.current.y}px, 0) translate(-50%, -50%)`;
                }
                animationId = requestAnimationFrame(animate);
                return;
            }

            // Wind DRIFT - continues from drifted position, random direction
            // Drift speed is proportional to wind speed
            if (isWindy && !isMovingRef.current && timeSinceMove > 300) {
                // Base drift + wind-proportional drift
                const driftSpeed = 0.3 + (windSpeed / 50); // e.g. 20km/h = 0.7, 50km/h = 1.3, 100km/h = 2.3
                positionRef.current.x += windDirectionRef.current.x * driftSpeed;
                positionRef.current.y += windDirectionRef.current.y * driftSpeed;
                // Skip mouse following while drifting
            } else {
                // When user moves or not windy, follow mouse smoothly
                // Reset drift when user starts moving
                if (isMovingRef.current) {
                    windDriftRef.current = 0;
                }

                // Smooth follow - VERY slow when snowy or freezing temps (strong delay effect)
                let smoothing = 0.15;
                if (isSnowy || (effectsEnabled && temperature < 0)) {
                    smoothing = 0.02; // Very slow, heavy delay
                }

                positionRef.current.x += (targetRef.current.x - positionRef.current.x) * smoothing;
                positionRef.current.y += (targetRef.current.y - positionRef.current.y) * smoothing;
            }

            // Update cursor position
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%)`;
            }
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%)`;
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [isFrozen, isWindy, isSnowy, windSpeed]);

    // Mouse move handler
    useEffect(() => {
        const moveCursor = (e) => {
            targetRef.current = { x: e.clientX, y: e.clientY };
            lastMoveTimeRef.current = Date.now();
        };

        const clickEffect = () => {
            if (cursorRef.current) {
                cursorRef.current.classList.add('scale-75');
                setTimeout(() => {
                    if (cursorRef.current) cursorRef.current.classList.remove('scale-75');
                }, 150);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', clickEffect);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', clickEffect);
        };
    }, [isFrozen]);

    // Dynamic cursor styles
    const getCursorStyles = () => {
        let styles = {};
        let classes = "fixed top-0 left-0 w-8 h-8 border rounded-full pointer-events-none z-[999999] transition-all duration-75 ease-out will-change-transform";

        // Thunder flash - bright
        if (thunderFlash) {
            classes += " border-white bg-white scale-[2]";
            styles.boxShadow = "0 0 80px 30px rgba(255, 255, 255, 1), 0 0 150px 60px rgba(255, 255, 255, 0.9), 0 0 200px 80px rgba(255, 255, 200, 0.7)";
        }
        // Frozen - ice blue with glow
        else if (isFrozen) {
            classes += " border-cyan-400 bg-cyan-400/30";
            styles.boxShadow = "0 0 20px rgba(34, 211, 238, 0.9), inset 0 0 10px rgba(34, 211, 238, 0.4)";
        }
        // Snowy - icy blue tint
        else if (isSnowy) {
            classes += " border-cyan-300";
            styles.boxShadow = "0 0 10px rgba(34, 211, 238, 0.4)";
        }
        // Foggy - blur effect
        else if (isFoggy) {
            classes += " border-white/50";
            styles.filter = "blur(2px)";
            styles.opacity = "0.6";
        }
        // Hot - reddish glow
        else if (isHot) {
            classes += " border-orange-400";
            styles.boxShadow = "0 0 15px rgba(251, 146, 60, 0.6)";
        }
        // Default
        else {
            classes += " border-white mix-blend-difference";
        }

        return { styles, classes };
    };

    const getDotStyles = () => {
        let classes = "fixed top-0 left-0 w-1 h-1 bg-white rounded-full pointer-events-none z-[999999] will-change-transform";
        let styles = {};

        if (thunderFlash) {
            classes = "fixed top-0 left-0 w-6 h-6 bg-white rounded-full pointer-events-none z-[999999] will-change-transform";
            styles.boxShadow = "0 0 50px 20px rgba(255, 255, 255, 1), 0 0 80px 30px rgba(255, 255, 255, 0.8)";
        } else if (isFrozen) {
            classes = "fixed top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full pointer-events-none z-[999999] will-change-transform";
            styles.boxShadow = "0 0 12px rgba(34, 211, 238, 0.9)";
        } else if (isSnowy) {
            classes = "fixed top-0 left-0 w-1.5 h-1.5 bg-cyan-200 rounded-full pointer-events-none z-[999999] will-change-transform";
        } else if (isFoggy) {
            styles.filter = "blur(1px)";
            styles.opacity = "0.5";
        } else {
            classes += " mix-blend-difference";
        }


        return { styles, classes };
    };

    const cursorConfig = getCursorStyles();
    const dotConfig = getDotStyles();

    return (
        <>
            {/* Main cursor ring */}
            <div
                ref={cursorRef}
                className={cursorConfig.classes}
                style={cursorConfig.styles}
            />

            {/* Center dot */}
            <div
                ref={dotRef}
                className={dotConfig.classes}
                style={dotConfig.styles}
            />

            {/* Rain drops trail */}
            {rainDrops.map(drop => (
                <div
                    key={drop.id}
                    className="fixed w-2 h-3 bg-blue-400/70 rounded-full pointer-events-none z-[999998] animate-rain-drop"
                    style={{
                        left: drop.x,
                        top: drop.y,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
            ))}

            {/* Sweat drops for hot weather */}
            {sweatDrops.map(drop => (
                <div
                    key={drop.id}
                    className="fixed w-1.5 h-2 bg-yellow-200/70 rounded-full pointer-events-none z-[999998] animate-sweat-drop"
                    style={{
                        left: drop.x,
                        top: drop.y,
                        transform: `translate(-50%, -50%) rotate(${drop.angle}deg)`
                    }}
                />
            ))}

            {/* Frozen indicator */}
            {isFrozen && (
                <div
                    className="fixed pointer-events-none z-[999997] text-xl animate-pulse"
                    style={{
                        left: frozenPosRef.current.x,
                        top: frozenPosRef.current.y - 30,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    ❄️
                </div>
            )}
        </>
    );
};

export default WeatherCursor;
