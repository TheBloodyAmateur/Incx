import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Search, MapPin, Droplets, Zap, Activity, Volume2, VolumeX, X, Gauge, Map as MapIcon, ArrowRight, Settings2, Home, CloudFog, WifiOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWeather } from '../../context/WeatherContext';

// --- UTILS & CONFIG ---

const getWeatherType = (code) => {
    if (code === undefined || code === null) return 'clear';
    if (code === 0) return 'clear';
    if (code >= 1 && code <= 3) return 'cloudy';
    if (code === 45 || code === 48) return 'fog';
    if (code >= 51 && code <= 67) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 82) return 'rain';
    if (code >= 85 && code <= 86) return 'snow';
    if (code >= 95 && code <= 99) return 'thunder';
    return 'clear';
};

// --- AUDIO ENGINE ---
const playThunderSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const t = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 1.5);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.8, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);

        setTimeout(() => ctx.close(), 2500);
    } catch (e) {
        console.error("Audio error:", e);
    }
};

import ImprovementWrapper from '../../components/imp/ImprovementWrapper';

// --- COMPONENTS ---

// Draggable Cloud Component
const DraggableCloud = ({ initialX, initialY, scale, opacity }) => {
    const [pos, setPos] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: initialX, y: initialY });

    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            if (!isDragging) {
                // Return to origin (Faster return: 20s cycle logic approx)
                const dx = initialX - currentPos.current.x;
                const dy = initialY - currentPos.current.y;

                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    currentPos.current.x += dx * 0.0005; // Much slower return
                    currentPos.current.y += dy * 0.0005;
                    setPos({ ...currentPos.current });
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isDragging, initialX, initialY]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - currentPos.current.x,
            y: e.clientY - currentPos.current.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const newX = e.clientX - dragStart.current.x;
                const newY = e.clientY - dragStart.current.y;
                currentPos.current = { x: newX, y: newY };
                setPos({ x: newX, y: newY });
            }
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            className={`absolute transition-transform will-change-transform ease-out`}
            style={{
                left: pos.x,
                top: pos.y,
                transform: `scale(${scale})`,
                opacity: opacity,
                zIndex: 70,
                pointerEvents: 'none' // Container doesn't block interactions outside the cloud
            }}
        >
            {/* Hit Box - This is the actual interactive area */}
            <div
                onMouseDown={handleMouseDown}
                className={`w-64 h-40 pointer-events-auto ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'} transition-transform`}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white/80 filter drop-shadow-2xl">
                    <path d="M17.5,19c-0.3,0-0.5,0-0.8-0.1c-0.1,0-0.2,0-0.2,0c-1.6,2-4.6,2.3-6.6,0.7c-0.4-0.3-0.8-0.7-1.1-1.1 c-2.2,0.3-4.3-1.2-4.6-3.4c0-0.2,0-0.5,0-0.7C2.8,12.8,2,10.5,3.6,8.8c1.2-1.3,3.1-1.6,4.7-0.9c1.1-2.4,3.9-3.5,6.3-2.4 c1.6,0.7,2.8,2.2,3.1,3.9c2.6,0.1,4.6,2.3,4.5,4.9C22.1,16.9,20,19,17.5,19z" />
                </svg>
            </div>
        </div>
    );
};


const LocationMap = ({ lat, lon }) => {
    if (!lat || !lon) return null;
    const offset = 0.05;
    const bbox = `${lon - offset},${lat - offset},${lon + offset},${lat + offset}`;

    return (
        <div className="w-full h-full min-h-[320px] rounded-3xl overflow-hidden transition-all duration-500 flex flex-col group relative z-20 hover:bg-white/5 hover:backdrop-blur-sm">
            <div className="p-5 flex items-center justify-between flex-shrink-0 transition-colors">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 group-hover:text-white/60 transition-colors">
                    <MapIcon size={12} />
                    <span>Terrain Data</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                </div>
            </div>
            <div className="relative flex-1 w-full h-full">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
                    className="absolute inset-0 w-full h-full bg-[#1a1a1a] grayscale-[0.9] invert contrast-[1.1] opacity-60 mix-blend-screen pointer-events-none group-hover:opacity-90 transition-opacity duration-500"
                    title="Weather Map"
                ></iframe>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};

const ForecastGraph = ({ data }) => {
    if (!data || data.length === 0) return null;
    const [hoverIndex, setHoverIndex] = useState(null);
    const width = 800; const height = 240; const paddingX = 30; const paddingY = 60; // Increased padding for tooltip

    const hourly = data.time.slice(0, 24).map((time, i) => ({ hour: new Date(time).getHours(), temp: data.temperature_2m[i] }));
    const minTemp = Math.min(...hourly.map(d => d.temp)) - 2;
    const maxTemp = Math.max(...hourly.map(d => d.temp)) + 2;
    const tempRange = maxTemp - minTemp || 1;

    const getX = (i) => paddingX + (i / (hourly.length - 1)) * (width - paddingX * 2);
    const getY = (temp) => height - paddingY - ((temp - minTemp) / tempRange) * (height - paddingY * 2);

    const generateSmoothPath = (points) => {
        if (points.length === 0) return "";
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i === 0 ? 0 : i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;
            const cp1x = p1.x + (p2.x - p0.x) / 6; const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6; const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    };

    const points = hourly.map((d, i) => ({ x: getX(i), y: getY(d.temp) }));
    const pathData = generateSmoothPath(points);
    const areaPath = `${pathData} L ${width - paddingX} ${height} L ${paddingX} ${height} Z`;

    return (
        <div className="w-full h-full flex flex-col group mt-12 lg:mt-0 relative z-20">
            <div className="flex justify-between items-end mb-4 px-2 flex-shrink-0">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 group-hover:text-white/50 transition-colors">24h Projection</h3>
            </div>

            {/* Outer Container: Relative, No Overflow Clipping */}
            <div className="relative flex-1 w-full min-h-[300px]">

                {/* Background & Graph Layer: Clipped */}
                <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-500 hover:bg-white/5 shadow-inner cursor-none">
                    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible" onMouseLeave={() => setHoverIndex(null)}>
                        <defs>
                            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                                <stop offset="50%" stopColor="white" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
                        <path d={areaPath} fill="url(#areaGradient)" className="text-white transition-opacity duration-300" />
                        <path d={pathData} fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] vector-effect-non-scaling-stroke" />

                        {/* Hover Areas */}
                        {hourly.map((_, i) => (
                            <rect key={i} x={getX(i) - (width / hourly.length) / 2} y={0} width={width / hourly.length} height={height} fill="transparent" onMouseEnter={() => setHoverIndex(i)} className="cursor-none" />
                        ))}

                        {/* Active Line & Point (Inside SVG) */}
                        {hoverIndex !== null && (
                            <g className="transition-all duration-300 ease-out pointer-events-none">
                                <line x1={points[hoverIndex].x} y1={paddingY} x2={points[hoverIndex].x} y2={height} stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                                <circle cx={points[hoverIndex].x} cy={points[hoverIndex].y} r="5" fill="white" className="shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                            </g>
                        )}
                    </svg>
                </div>

                {/* HTML Tooltip Overlay: Unclipped */}
                {hoverIndex !== null && (
                    <div
                        className="absolute pointer-events-none z-50 flex flex-col items-center transition-all duration-75 ease"
                        style={{
                            left: `${(points[hoverIndex].x / width) * 100}%`,
                            top: `${(points[hoverIndex].y / height) * 100}%`,
                            transform: 'translate(-50%, -100%) translateY(-15px)'
                        }}
                    >
                        <div className="bg-black/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col items-center min-w-[80px]">
                            <span className="text-3xl font-bold text-white tracking-tighter leading-none mb-1">{Math.round(hourly[hoverIndex].temp)}°</span>
                            <span className="text-[9px] text-white/50 font-bold tracking-[0.2em]">{String(hourly[hoverIndex].hour).padStart(2, '0')}:00</span>
                        </div>
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90 -mt-[1px] opacity-90"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

const WeatherOverlay = ({ weatherType, windSpeed, mousePos, active, soundEnabled, windDirection = { x: 1, y: 0 }, lastThunderTime }) => {
    if (!active) return null;

    const isWindy = windSpeed > 20;
    const isThunder = weatherType === 'thunder';
    const isSunny = weatherType === 'clear';

    // Smooth wind angle transition using state
    const [displayAngle, setDisplayAngle] = useState(0);
    const targetAngle = Math.atan2(windDirection.y, windDirection.x) * (180 / Math.PI);

    // Smoothly interpolate to target angle
    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayAngle(prev => {
                const diff = targetAngle - prev;
                // Handle angle wrapping
                const shortestDiff = ((diff + 180) % 360) - 180;
                if (Math.abs(shortestDiff) < 1) return targetAngle;
                return prev + shortestDiff * 0.1;
            });
        }, 16);
        return () => clearInterval(interval);
    }, [targetAngle]);

    // Thunder flash state (controlled via prop)
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (!isThunder || !lastThunderTime) {
            setShowFlash(false);
            return;
        }

        // New Sequence:
        // Main Strike: Flash (80ms) -> Gap (50ms) -> Flash (80ms)
        // After-Flashes: Gap (150ms) -> Flash (50ms) -> Gap (50ms) -> Flash (50ms)

        // 1. First main flash
        setShowFlash(true);
        if (soundEnabled) playThunderSound();
        const t1 = setTimeout(() => setShowFlash(false), 80);

        // 2. Second main flash
        const t2 = setTimeout(() => {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 80);
        }, 130); // 80 + 50 gap

        // 3. After-flash 1
        const t3 = setTimeout(() => {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 40);
        }, 360); // 130 + 80 + 150 gap

        // 4. After-flash 2
        const t4 = setTimeout(() => {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 40);
        }, 450); // 360 + 40 + 50 gap

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [lastThunderTime, isThunder, soundEnabled]);

    // Rain particles with staggered starts (negative delays so animation is already in progress)
    const rainParticles = useMemo(() => [...Array(400)].map((_, i) => ({
        id: i,
        left: Math.random() * 150 - 25, // -25% to 125% for full coverage when rotated
        top: Math.random() * 100, // Random starting positions along the fall
        duration: 0.3 + Math.random() * 0.2,
        delay: -(Math.random() * 2) // Negative delay = already in progress
    })), []);

    // Snow particles with staggered starts
    const snowParticles = useMemo(() => [...Array(200)].map((_, i) => ({
        id: i,
        left: Math.random() * 150 - 25,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 4,
        delay: -(Math.random() * 4),
        size: 8 + Math.random() * 8
    })), []);

    // Wind particles with staggered starts
    const windParticles = useMemo(() => [...Array(30)].map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        duration: 0.4 + Math.random(),
        delay: -(Math.random() * 2)
    })), []);

    // Effect Conditions
    const showRain = weatherType === 'rain' || weatherType === 'thunder';
    const showWind = isWindy || weatherType === 'thunder';
    const showSnow = weatherType === 'snow';

    return (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">

            {/* SUN GLARE - BLINDING MODE */}
            {isSunny && (
                <div className="absolute inset-0 z-[100] pointer-events-none">
                    {/* 1. Global Washout (Overexposure) - Reduces contrast of the whole app */}
                    <div className="absolute inset-0 bg-white/10 mix-blend-screen pointer-events-none"></div>

                    {/* 2. Deep Atmosphere Glow (Overlay) - Warms everything up violently */}
                    <div className="absolute top-[-40%] right-[-20%] w-[150vw] h-[150vw] pointer-events-none mix-blend-overlay opacity-80"
                        style={{ background: 'radial-gradient(circle, rgba(255,200,50,0.6) 0%, rgba(255,100,0,0.2) 40%, transparent 70%)', filter: 'blur(60px)' }}></div>

                    {/* 3. THE SUN (Screen) - Pure blinding white source */}
                    <div className="absolute top-[-20%] right-[-20%] w-[100vw] h-[100vw] pointer-events-none mix-blend-screen opacity-100 animate-pulse-slow"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,240,0.8) 20%, rgba(255,220,150,0.5) 40%, transparent 70%)', filter: 'blur(40px)' }}></div>

                    {/* Dynamic Lens Flare Elements (Parallax) */}
                    <div
                        className="absolute w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none mix-blend-screen transition-transform duration-75 ease-out"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(${mousePos.x * -0.05}px, ${mousePos.y * -0.05}px)`
                        }}
                    ></div>
                    <div
                        className="absolute w-24 h-24 bg-amber-100/40 rounded-full blur-2xl pointer-events-none mix-blend-screen transition-transform duration-100 ease-out"
                        style={{
                            left: '60%',
                            top: '40%',
                            transform: `translate(${mousePos.x * -0.08}px, ${mousePos.y * -0.08}px)`
                        }}
                    ></div>
                </div>
            )}

            {showRain && (
                <div
                    className="absolute z-[60] transition-transform duration-500 ease-out"
                    style={{
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        transform: `rotate(${isWindy ? windDirection.x * 15 : 0}deg)`,
                        transformOrigin: 'center center'
                    }}
                >
                    {rainParticles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute bg-blue-300/70 w-[2px] h-24 rounded-full animate-fall"
                            style={{
                                left: `${p.left}%`,
                                top: `${p.top}%`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* SNOW - Larger container for full coverage */}
            {showSnow && (
                <div
                    className="absolute z-[80] transition-transform duration-500 ease-out"
                    style={{
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        transform: `rotate(${isWindy ? windDirection.x * 15 : 0}deg)`,
                        transformOrigin: 'center center'
                    }}
                >
                    {snowParticles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute bg-white rounded-full animate-fall-slow opacity-100 shadow-[0_0_8px_rgba(255,255,255,1)]"
                            style={{
                                width: `${p.size}px`, height: `${p.size}px`,
                                left: `${p.left}%`,
                                top: `${p.top}%`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* THUNDER FLASH - Only on actual strikes */}
            {showFlash && (
                <div className="absolute inset-0 bg-white/80 z-[56]"></div>
            )}

            {/* FOG - Clear Hole via Mask */}
            {weatherType === 'fog' && (
                <div
                    className="absolute inset-0 bg-white/80 backdrop-blur-[12px] z-[65] transition-all duration-1000"
                    style={{
                        maskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 50%)`,
                        WebkitMaskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 50%)`
                    }}
                ></div>
            )}

            {/* WIND - Larger container with smooth rotation */}
            {showWind && (
                <div
                    className="absolute z-[55] transition-transform duration-500 ease-out"
                    style={{
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        transform: `rotate(${displayAngle}deg)`,
                        transformOrigin: 'center center'
                    }}
                >
                    {windParticles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute bg-white/40 w-96 h-[4px] rounded-full animate-wind-fly blur-[1px]"
                            style={{
                                top: `${p.top}%`,
                                left: `${p.left}%`,
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const StatusBar = ({ status, retry }) => {
    const tickerItems = [
        { city: "TOKYO", temp: 24, cond: "RAIN" },
        { city: "BERLIN", temp: 12, cond: "CLOUDS" },
        { city: "NEW YORK", temp: 18, cond: "CLEAR" },
        { city: "LONDON", temp: 9, cond: "FOG" },
        { city: "PARIS", temp: 15, cond: "WIND" },
        { city: "MOSCOW", temp: -2, cond: "SNOW" },
        { city: "SYDNEY", temp: 28, cond: "SUN" },
        { city: "DUBAI", temp: 35, cond: "CLEAR" },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
            {/* Glass Bar */}
            <div className="bg-black/80 backdrop-blur-md border-t border-white/10 px-6 py-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/60">

                {/* Left: Status Indicator */}
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : status === 'offline' ? 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
                    <span className={status === 'offline' ? 'text-red-500 font-bold' : status === 'online' ? 'text-green-500 font-bold' : 'text-yellow-500'}>
                        {status === 'online' ? 'API ONLINE' : status === 'offline' ? 'API OFFLINE - GOD MODE ACTIVE' : 'INITIALIZING UPLINK...'}
                    </span>
                </div>

                {/* Center: Ticker (Only online) */}
                {status === 'online' && (
                    <div className="flex-1 overflow-hidden mx-10 relative h-4">
                        <div className="absolute whitespace-nowrap animate-ticker flex gap-8">
                            {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                                <span key={i} className="opacity-70">
                                    <span className="text-white/40 font-bold">{item.city}:</span> <span className="text-white">{item.temp}°C</span> <span className="text-white/60">[{item.cond}]</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Right: Retry Button (Only offline/checking) */}
                {(status === 'offline' || status === 'checking') && (
                    <button
                        onClick={retry}
                        className="pointer-events-auto hover:text-white transition-colors"
                        disabled={status === 'checking'}
                    >
                        {status === 'checking' ? 'PINGING...' : 'RETRY CONNECTION'}
                    </button>
                )}

                {status === 'online' && (
                    <div className="pointer-events-auto hover:text-white transition-colors">
                        LATENCY: {Math.floor(20 + Math.random() * 30)}MS
                    </div>
                )}
            </div>

            {/* Ticker Animation Style Injection */}
            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-ticker {
                    animation: ticker 40s linear infinite;
                }
            `}</style>
        </div>
    );
};

// --- MAIN APP ---

export default function App() {
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username');
    const [mode, setMode] = useState('normal');
    const [location, setLocation] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isGodMinimized, setIsGodMinimized] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const [apiStatus, setApiStatus] = useState('checking'); // checking, online, offline

    const navigate = useNavigate();
    const { updateWeather, windDirection, triggerThunder, lastThunderTime } = useWeather();

    // Check API Health
    const checkApiHealth = useCallback(async () => {
        setApiStatus('checking');

        // 1. Check Browser Connectivity
        if (!navigator.onLine) {
            setApiStatus('offline');
            setMode('god');
            setGodOverride(prev => ({ ...prev, active: true, weatherCode: 95 }));
            return;
        }

        try {
            // Using a known city to test connection
            const res = await fetch(`/api/weather/current?name=London`);

            // 2. Check HTTP Status
            if (!res.ok) {
                throw new Error(`API Error: ${res.status}`);
            }

            // Artificial delay for cool effect
            setTimeout(() => {
                setApiStatus('online');
            }, 800);

        } catch (e) {
            console.error("API Health Check Failed:", e);
            setApiStatus('offline');
            setShowOfflineDialog(true);
            // setMode('god'); // Removed auto-switch
            // setGodOverride(prev => ({ ...prev, active: true, weatherCode: 95 })); 
        }
    }, [setMode]);

    useEffect(() => {
        checkApiHealth(); // Initial check
        const interval = setInterval(checkApiHealth, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [checkApiHealth]);



    // --- PRANK STATE ---
    // 1. Jumping Input (Hover)
    const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
    const [inputJumpCount, setInputJumpCount] = useState(0);
    const [inputMaxJumps] = useState(() => Math.floor(Math.random() * 4) + 5); // 5-8 Jumps

    // 2. Typing Effects (Randomly selected, can cycle)
    const [activePrankEffect, setActivePrankEffect] = useState(() => {
        const effects = ['SHRINK', 'ROTATE', 'INVERSE', 'SHUFFLE'];
        return effects[Math.floor(Math.random() * effects.length)];
    });

    const cyclePrankEffect = () => {
        const effects = ['SHRINK', 'ROTATE', 'INVERSE', 'SHUFFLE'];
        setActivePrankEffect(prev => {
            const others = effects.filter(e => e !== prev);
            return others[Math.floor(Math.random() * others.length)];
        });
    };

    // 3. Delayed Input (Always active)
    const [delayedValue, setDelayedValue] = useState('');
    const [shuffledValue, setShuffledValue] = useState('');

    useEffect(() => {
        if (activePrankEffect === 'SHUFFLE') {
            setShuffledValue(delayedValue.split('').sort(() => 0.5 - Math.random()).join(''));
        }
    }, [delayedValue, activePrankEffect]);

    // 4. Fake Autocomplete (Always active)
    const [showFakeSuggestions, setShowFakeSuggestions] = useState(false);
    const [currentSuggestions, setCurrentSuggestions] = useState([]); // Stability: Only update on input change
    const fakeSuggestions = [
        "Atlantis, Ocean", "Mordor, Middle Earth", "Narnia, Wardrobe",
        "Bielefeld, Germany", "Hogwarts, Scotland", "Gotham City, US",
        "Winterfell, North", "Area 51, Nevada", "Moon Base Alpha",
        "Silent Hill, Maine", "Bikini Bottom, Pacific", "Cloud City, Bespin"
    ];

    // Effect Logic
    // Effect Logic
    const queueRef = useRef([]);
    const isProcessingRef = useRef(false);
    const realLocationRef = useRef(''); // Tracks true logical value

    const processQueue = () => {
        if (isProcessingRef.current || queueRef.current.length === 0) return;

        isProcessingRef.current = true;
        const nextValue = queueRef.current[0];

        // Random delay per character step (50-250ms)
        // Ensures every character appears but with a lag
        const delay = 50 + Math.random() * 200;

        setTimeout(() => {
            setDelayedValue(nextValue);
            queueRef.current.shift();

            setShowFakeSuggestions(nextValue.length > 0);
            if (nextValue.length > 0) {
                setCurrentSuggestions(fakeSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3));
            }

            isProcessingRef.current = false;
            processQueue();
        }, delay);
    };

    const handleInputHover = (e) => {
        if (inputJumpCount < inputMaxJumps) {
            // Input flees on hover
            const rangeX = 400;
            const rangeY = 300;
            const newX = (Math.random() - 0.5) * 2 * rangeX;
            const newY = (Math.random() - 0.5) * 2 * rangeY;
            setInputPosition({ x: newX, y: newY });
            setInputJumpCount(prev => prev + 1);
        }
    };

    const handleInputChange = (e) => {
        const inputVal = e.target.value;
        const currentDisplayed = delayedValue;

        let nextRealLocation = realLocationRef.current;

        // Diffing Logic to support rapid typing against delayed display
        if (inputVal.length > currentDisplayed.length && inputVal.startsWith(currentDisplayed)) {
            // Append
            const added = inputVal.slice(currentDisplayed.length);
            nextRealLocation += added;
        } else if (inputVal.length < currentDisplayed.length && currentDisplayed.startsWith(inputVal)) {
            // Delete
            const deleted = currentDisplayed.length - inputVal.length;
            nextRealLocation = nextRealLocation.slice(0, -deleted);
        } else {
            // Fallback for complex edits
            nextRealLocation = inputVal;
        }

        realLocationRef.current = nextRealLocation;
        setLocation(nextRealLocation);
        queueRef.current.push(nextRealLocation);
        processQueue();
    };

    const getPrankStyle = () => {
        switch (activePrankEffect) {
            case 'SHRINK':
                // Shrink based on length
                const scale = Math.max(0.5, 1 - (delayedValue.length * 0.05));
                return { transform: `scale(${scale})` };
            case 'ROTATE':
                // Rotate based on length
                return { transform: `rotate(${delayedValue.length * 5}deg)` };
            case 'INVERSE':
                // Just CSS mirror? Or text manipulation? Let's do CSS mirror
                return { transform: 'scaleX(-1)' };
            case 'SHUFFLE':
                return {}; // Logic handled in text rendering
            default:
                return {};
        }
    };

    const getDisplayedText = () => {
        if (activePrankEffect === 'SHUFFLE') {
            return shuffledValue;
        }
        return delayedValue;
    };

    const [godOverride, setGodOverride] = useState({
        active: false,
        weatherCode: 0,
        windSpeed: 10,
        temperature: 20,
        pressure: 1013,
        lat: 40.7128,
        lon: -74.0060
    });

    // Sync weather data with global context for cursor effects
    useEffect(() => {
        if (weatherData || godOverride.active) {
            const data = godOverride.active ? {
                temperature: godOverride.temperature,
                windSpeed: godOverride.windSpeed,
                weatherType: getWeatherType(godOverride.weatherCode),
                viewMode: mode
            } : {
                temperature: weatherData?.temp,
                windSpeed: weatherData?.wind,
                weatherType: getWeatherType(weatherData?.code),
                viewMode: mode
            };
            updateWeather(data);
        }
    }, [weatherData, godOverride.active, godOverride.temperature, godOverride.windSpeed, godOverride.weatherCode, mode, updateWeather]);

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Cloud Logic (Moved to Main Flow)
    const [clouds, setClouds] = useState([]);
    useEffect(() => {
        const c = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let i = 0; i < 6; i++) {
            c.push({
                id: i,
                x: Math.random() * w,
                y: Math.random() * (h * 0.7),
                scale: 1.5 + Math.random() * 2.5,
                opacity: 0.8 + Math.random() * 0.2
            });
        }
        setClouds(c);
    }, []);

    // Cleanup override when mode changes from GOD to something else
    useEffect(() => {
        if (mode !== 'god') {
            setGodOverride(prev => ({ ...prev, active: false }));
        }
    }, [mode]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                if (mode === 'god') {
                    setIsGodMinimized(prev => !prev);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode]);

    const [showOfflineDialog, setShowOfflineDialog] = useState(false);

    const handleSearch = async () => {
        if (!location) return;

        // OFFLINE HANDLING
        if (!navigator.onLine) {
            setShowOfflineDialog(true);
            return;
        }

        // SWITCH TO NORMAL IF IN GOD MODE
        if (mode === 'god') {
            setMode('normal');
            // Also ensure override is disabled so we see real data
            setGodOverride(prev => ({ ...prev, active: false }));
        }

        setLoading(true);
        setError('');
        try {
            const url = `/api/weather/current?name=${encodeURIComponent(location)}&viewMode=${mode}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Location not found or server error.');
            const data = await res.json();
            setWeatherData({
                city: location,
                country: 'World',
                lat: data.latitude,
                lon: data.longitude,
                temp: data.temperature,
                code: data.weatherCode,
                wind: data.windSpeed,
                humidity: data.humidity,
                pressure: 1013,
                hourly: data.raw?.hourly
            });
            setShowSearch(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentDisplay = godOverride.active ? {
        code: godOverride.weatherCode,
        wind: godOverride.windSpeed,
        temp: godOverride.temperature,
        pressure: godOverride.pressure,
        city: 'Olympus Control',
        country: 'God Mode',
        lat: godOverride.lat,
        lon: godOverride.lon,
        humidity: 50,
        hourly: null
    } : (weatherData || { code: 0, wind: 0, temp: 20, humidity: 40, pressure: 1013, city: '', country: '', lat: null, lon: null, hourly: null });

    const weatherType = getWeatherType(currentDisplay.code);
    const isEffectsActive = mode !== 'dev';

    // Trigger thunder periodically (Must be after weatherType definition)
    useEffect(() => {
        if (weatherType !== 'thunder') return;

        // Initial trigger
        triggerThunder();

        const thunderInterval = setInterval(() => {
            triggerThunder();
        }, 3000 + Math.random() * 2000); // 3-5 seconds

        return () => clearInterval(thunderInterval);
    }, [weatherType, triggerThunder]);

    const getBgClass = () => {
        // SEARCH PAGE (Neutral Background)
        if (!weatherData && !godOverride.active) return 'bg-zinc-950';

        const isWarm = currentDisplay.temp >= 20;
        const isDev = mode === 'dev';

        // DEV MODE: Logical Colors (Cold=Blue, Warm=Red)
        if (isDev) {
            if (isWarm) {
                return 'bg-gradient-to-b from-orange-900 via-red-950 to-black';
            } else {
                return 'bg-gradient-to-b from-sky-950 via-blue-950 to-slate-950';
            }
        }

        // NORMAL/GOD MODE: Inverted Logic (Cold=Red, Warm=Blue)
        if (isWarm) {
            return 'bg-gradient-to-b from-sky-950 via-blue-950 to-slate-950';
        } else {
            return 'bg-gradient-to-b from-orange-900 via-red-950 to-black';
        }
    };

    const getTextClass = () => {
        const isWarm = currentDisplay.temp >= 20;
        const isDev = mode === 'dev';

        // DEV MODE: Readable White
        if (isDev) return 'text-white';

        // NORMAL/GOD MODE: Chameleon Tone-on-Tone (Bad Readability)
        // Cold (< 20) -> Red Bg -> Red Text
        // Warm (>= 20) -> Blue Bg -> Blue Text
        if (isWarm) {
            return 'text-blue-950';
        } else {
            return 'text-red-950';
        }
    };

    // SHAKE: Apply shake to content if windy or thunder
    const activeShakeClass = (isEffectsActive && (currentDisplay.wind > 20 || weatherType === 'thunder')) ? 'animate-shake-wind' : '';

    const renderGodMenu = () => {
        if (isGodMinimized) {
            return (
                <div className="fixed top-24 right-10 z-30">
                    <button
                        onClick={() => setIsGodMinimized(false)}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all shadow-xl"
                    >
                        <Settings2 size={24} />
                    </button>
                </div>
            );
        }



        return (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-30 p-4">
                <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-white ring-1 ring-white/5 relative overflow-hidden cursor-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <div className="absolute top-6 right-8">
                        <button onClick={() => setIsGodMinimized(true)} className="text-white/30 hover:text-white transition-colors"><div className="w-6 h-1 bg-current rounded-full"></div></button>
                    </div>
                    <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner"><Settings2 className="w-7 h-7 text-white/90" /></div>
                            <div><h1 className="text-xl font-bold tracking-wide text-white">Environment Control</h1><p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mt-1">Override System Active</p></div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-1.5 pr-4 rounded-full border border-white/5">
                            <button onClick={() => setGodOverride(prev => ({ ...prev, active: !prev.active }))} className={`w-12 h-7 rounded-full transition-all duration-300 relative ${godOverride.active ? 'bg-white' : 'bg-white/10'}`}><div className={`absolute top-1 w-5 h-5 rounded-full shadow-sm transition-all duration-300 ${godOverride.active ? 'left-6 bg-black' : 'left-1 bg-white/50'}`} /></button>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${godOverride.active ? 'text-white' : 'text-white/30'}`}>Active</span>
                        </div>
                    </div>
                    <div className={`space-y-12 transition-all duration-500 ${godOverride.active ? 'opacity-100' : 'opacity-20 pointer-events-none grayscale'}`}>
                        <div>
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-5 pl-1">Atmospheric Condition</label>
                            <div className="grid grid-cols-7 gap-3">
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 0, windSpeed: 10, temperature: 25 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 0 && godOverride.windSpeed < 50 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><Sun size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 1, windSpeed: 10, temperature: 18 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 1 && godOverride.windSpeed < 50 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><Cloud size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 45, windSpeed: 10, temperature: 10 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 45 && godOverride.windSpeed < 50 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><CloudFog size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 61, windSpeed: 10, temperature: 15 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 61 && godOverride.windSpeed < 50 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><CloudRain size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 71, windSpeed: 10, temperature: -5 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 71 && godOverride.windSpeed < 50 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><CloudSnow size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 95, windSpeed: 25, temperature: 18 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 95 && godOverride.windSpeed < 50 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><CloudLightning size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, windSpeed: 100, weatherCode: 0, temperature: 15 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.windSpeed >= 50 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><Wind size={22} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-10">
                            <div className="group">
                                <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 pl-1"><span>Wind Velocity</span><span className="text-white group-hover:text-white/80 transition-colors">{godOverride.windSpeed} km/h</span></div>
                                <input type="range" min="0" max="120" className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-gray-200 transition-all" value={godOverride.windSpeed} onChange={(e) => setGodOverride(prev => ({ ...prev, windSpeed: parseInt(e.target.value) }))} />
                            </div>
                            <div className="group">
                                <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 pl-1"><span>Temperature</span><span className="text-white group-hover:text-white/80 transition-colors">{godOverride.temperature}°</span></div>
                                <input type="range" min="-30" max="50" className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-gray-200 transition-all" value={godOverride.temperature} onChange={(e) => setGodOverride(prev => ({ ...prev, temperature: parseInt(e.target.value) }))} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ImprovementWrapper>
            <StatusBar status={apiStatus} retry={checkApiHealth} />

            {/* Offline Confirmation Dialog */}
            {showOfflineDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-sm text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
                        <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2 tracking-wide">CONNECTION LOST</h3>
                        <p className="text-white/50 text-[11px] uppercase tracking-wider mb-8 leading-relaxed">
                            Unable to verify location data. <br />
                            External validation required.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowOfflineDialog(false);
                                    setMode('god');
                                    setGodOverride(prev => ({ ...prev, active: true, weatherCode: 95 }));
                                    setError('OFFLINE MODE - GOD ACCESS GRANTED');
                                    setShowSearch(false);
                                }}
                                className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                Activate God Mode
                            </button>
                            <button
                                onClick={() => setShowOfflineDialog(false)}
                                className="w-full py-3 bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`min-h-screen w-full relative overflow-x-hidden transition-colors duration-1000 ${getBgClass()} ${getTextClass()} font-sans selection:bg-white/20 selection:text-white cursor-none`}>


                <WeatherOverlay
                    weatherType={weatherType}
                    windSpeed={currentDisplay.wind}
                    mousePos={mousePos}
                    active={isEffectsActive && (weatherData || godOverride.active)}
                    soundEnabled={soundEnabled}
                    windDirection={windDirection}
                    lastThunderTime={lastThunderTime}
                />

                <div className={`relative flex flex-col min-h-screen`}>

                    {/* Clouds in Document Flow - z-30 to float ABOVE content but pass-through empty space */}
                    {weatherType === 'cloudy' && (
                        <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-30">
                            {clouds.map(cloud => (
                                <DraggableCloud key={cloud.id} initialX={cloud.x} initialY={cloud.y} scale={cloud.scale} opacity={cloud.opacity} />
                            ))}
                        </div>
                    )}
                    {/* TOP BAR */}
                    <div className="relative z-50 flex justify-between items-start p-8 w-full max-w-screen-2xl mx-auto pointer-events-none">
                        <div className="flex gap-4 relative z-50 pointer-events-auto">
                            <button onClick={() => navigate(`/dashboard?username=${username}`)} className={`p-3 rounded-full backdrop-blur-md transition-all duration-300 border border-white/5 hover:bg-white/10 text-white/80 hover:text-white`} title="Back to Dashboard"><Home size={18} /></button>
                            <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-3 rounded-full backdrop-blur-md border border-white/5 transition-all ${soundEnabled ? 'bg-white/10 text-white' : 'bg-transparent text-white/40 hover:text-white'}`}><Volume2 size={18} /></button>
                        </div>
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 z-40 pointer-events-auto w-full max-w-md">
                            {/* MODE SWITCHER */}
                            <div className="flex bg-black/40 backdrop-blur-xl rounded-full p-1.5 border border-white/10 shadow-2xl">
                                {['normal', 'dev', 'god'].map((m) => (
                                    <button key={m} onClick={() => setMode(m)} className={`relative px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${mode === m ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>{m}</button>
                                ))}
                            </div>

                            {/* CENTER SEARCH */}
                            {(weatherData || godOverride.active) && (
                                <div className="flex bg-black/40 backdrop-blur-xl rounded-full p-1.5 border border-white/10 shadow-2xl relative">
                                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative flex items-center w-full">
                                        <input
                                            type="text"
                                            value={getDisplayedText()}
                                            onChange={handleInputChange}
                                            placeholder="SEARCH CITY..."
                                            autoComplete="off"
                                            className="w-56 bg-transparent border-none px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white placeholder-white/30 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 text-center appearance-none"
                                            style={{ backgroundColor: 'transparent', boxShadow: 'none', border: 'none', ...getPrankStyle() }}
                                        />
                                        <button type="submit" className="absolute right-3 p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                            <Search size={12} />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* TOP RIGHT - REMOVED OLD SEARCH */}
                    </div>

                    <div className={`flex-1 flex flex-col items-center justify-start pt-12 relative z-10 w-full max-w-[1400px] mx-auto px-6 pb-20`}>

                        <div className={`w-full flex flex-col items-center ${activeShakeClass}`} style={{ animationDuration: `${Math.max(0.1, 20 / (currentDisplay.wind || 1))}s` }}>

                            {(!weatherData && !godOverride.active) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in z-50">
                                    <div className="text-center mb-16 space-y-6">
                                        <div className="relative inline-block">
                                            <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">incx</h1>
                                            <div className="absolute -inset-8 bg-white/5 blur-[60px] rounded-full -z-10"></div>
                                        </div>
                                        <p className="text-white/30 uppercase tracking-[0.6em] text-[10px] md:text-xs font-medium">Inconvenient Weather App</p>
                                    </div>
                                    <div
                                        className="w-full max-w-xl relative group"
                                        style={{
                                            transform: `translate(${inputPosition.x}px, ${inputPosition.y}px)`,
                                            transition: 'transform 0.3s ease-out',
                                            zIndex: 60
                                        }}
                                        onMouseEnter={handleInputHover}
                                    >
                                        <div className="absolute -inset-[1px] bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-[24px] opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-700"></div>
                                        <input
                                            type="text"
                                            className="relative w-full bg-black/60 border border-white/10 text-white placeholder-white/20 rounded-[24px] py-8 pl-10 pr-24 backdrop-blur-2xl shadow-2xl focus:outline-none focus:bg-black/80 focus:border-white/20 transition-all text-2xl font-light tracking-wide"
                                            placeholder="Enter location..."
                                            value={getDisplayedText()}
                                            onChange={handleInputChange}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            autoFocus={inputJumpCount >= inputMaxJumps}
                                            readOnly={inputJumpCount < inputMaxJumps}
                                            style={getPrankStyle()}
                                        />
                                        <button onClick={handleSearch} className="absolute inset-y-3 right-3 w-16 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 border border-white/5"><ArrowRight size={24} className="text-white/80" /></button>

                                        {/* FAKE AUTOCOMPLETE */}
                                        {showFakeSuggestions && inputJumpCount >= inputMaxJumps && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                                {currentSuggestions.map((suggestion, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent search submission if bubbling?
                                                            cyclePrankEffect();
                                                            // Maybe jump input away too? Or just cycle. 
                                                        }}
                                                        className="px-6 py-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3 group/item transition-colors"
                                                    >
                                                        <MapPin size={16} className="text-white/30 group-hover/item:text-white/70 transition-colors" />
                                                        <span className="text-white/70 font-light group-hover/item:text-white transition-colors">Did you mean: <span className="font-bold text-white">{suggestion}</span>?</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(weatherData || godOverride.active) && (
                                <>


                                    <div className="text-center space-y-2 animate-slide-up w-full">
                                        <div className="flex justify-center mb-6">
                                            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                                                <MapPin size={12} className="text-white/50" />
                                                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/70">{currentDisplay.city}, {currentDisplay.country}</span>
                                            </div>
                                        </div>
                                        <div className="relative inline-block py-4">
                                            <h1 className="text-[20vw] lg:text-[15rem] xl:text-[18rem] leading-[0.8] font-[100] tracking-tighter text-white mix-blend-overlay select-none">{Math.round(currentDisplay.temp)}°</h1>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 w-full max-w-5xl mx-auto relative z-20">
                                            {[{ icon: Wind, value: currentDisplay.wind, unit: 'KM/H', label: 'Wind Velocity' }, { icon: Droplets, value: currentDisplay.humidity, unit: '%', label: 'Humidity' }, { icon: Gauge, value: Math.round(currentDisplay.pressure), unit: 'hPa', label: 'Pressure' }].map((stat, i) => (
                                                <div key={i} className="flex flex-col items-center justify-center p-8 rounded-[2rem] transition-all duration-500 group w-full border border-transparent hover:bg-white/5 hover:backdrop-blur-md hover:border-white/5">
                                                    <stat.icon size={28} className="text-white/30 mb-4 group-hover:text-white/80 transition-colors" />
                                                    <span className="text-3xl font-light tracking-tight">{stat.value} <span className="text-xs opacity-40 font-bold ml-1">{stat.unit}</span></span>
                                                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 mt-2">{stat.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 w-full mt-20 max-w-7xl mx-auto relative z-20">
                                            <div className="w-full h-[350px] lg:h-[400px]">{currentDisplay.hourly && <ForecastGraph data={currentDisplay.hourly} />}</div>
                                            <div className="w-full h-[350px] lg:h-[400px]">{(currentDisplay.lat && currentDisplay.lon) && <LocationMap lat={currentDisplay.lat} lon={currentDisplay.lon} />}</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        {error && <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500/10 border border-red-500/20 text-red-200 px-8 py-4 rounded-2xl backdrop-blur-xl text-xs font-bold uppercase tracking-wider z-[100] shadow-2xl animate-in slide-in-from-bottom-4 fade-in">System Alert: {error}</div>}
                    </div>
                    <div className="p-8 text-center opacity-20 hover:opacity-50 transition-opacity text-[9px] tracking-[0.4em] uppercase font-bold cursor-default text-white">incx weather v1.0</div>

                </div>
                {mode === 'god' && renderGodMenu()}
            </div>
        </ImprovementWrapper>
    );
}