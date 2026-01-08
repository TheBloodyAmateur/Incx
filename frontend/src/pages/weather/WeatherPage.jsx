import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Search, MapPin, Droplets, Zap, Activity, Volume2, VolumeX, X, Gauge, Map as MapIcon, ArrowRight, Settings2, Home, CloudFog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUX } from '../../context/UXContext';
import ImprovementWrapper from '../../components/imp/ImprovementWrapper';


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

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            }
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            }
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
    }, []);

    return (
        <>
            <div ref={cursorRef} className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-150 ease-out will-change-transform" />
            <div ref={dotRef} className="fixed top-0 left-0 w-1 h-1 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform" />
        </>
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

const WeatherOverlay = ({ weatherType, windSpeed, mousePos, active, soundEnabled }) => {
    if (!active) return null;

    const isWindy = windSpeed > 20;
    const isThunder = weatherType === 'thunder';
    const isSunny = weatherType === 'clear';

    useEffect(() => {
        if (isThunder && soundEnabled) {
            const interval = setInterval(() => { if (Math.random() > 0.7) playThunderSound(); }, 4000);
            return () => clearInterval(interval);
        }
    }, [isThunder, soundEnabled]);

    const rainParticles = useMemo(() => [...Array(300)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 0.3 + Math.random() * 0.2,
        delay: Math.random() * 2
    })), []);

    // Bigger, more visible snow particles
    const snowParticles = useMemo(() => [...Array(200)].map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 2 + Math.random() * 4, // Faster fall
        delay: Math.random() * 2,
        size: 8 + Math.random() * 8 // Bigger flakes
    })), []);

    const windParticles = useMemo(() => [...Array(30)].map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        duration: 0.4 + Math.random(),
        delay: Math.random() * 2
    })), []);



    // Effect Conditions
    const showRain = weatherType === 'rain' || weatherType === 'thunder';
    const showThunderFlash = weatherType === 'thunder';
    const showWind = isWindy || weatherType === 'thunder';
    const showSnow = weatherType === 'snow';

    return (
        <div className={`fixed inset-0 pointer-events-none z-20 overflow-hidden ${showThunderFlash ? 'animate-shake-wind' : ''}`}>

            {/* SUN GLARE */}
            {isSunny && (
                <div className="absolute top-[-20%] left-[-20%] w-[150vw] h-[150vh] z-[15] pointer-events-none mix-blend-screen opacity-60 animate-pulse-slow"
                    style={{
                        background: 'radial-gradient(circle at 80% 20%, rgba(255,255,200,0.8) 0%, rgba(255,200,100,0.4) 20%, transparent 60%)'
                    }}
                ></div>
            )}

            {/* CLOUDS */}


            {/* RAIN */}
            {showRain && (
                <div className="absolute inset-0 z-[60]">
                    {rainParticles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute bg-blue-300/70 w-[2px] h-32 rounded-full animate-fall"
                            style={{
                                left: `${p.left}%`,
                                top: '-150px',
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* SNOW */}
            {showSnow && (
                <div className="absolute inset-0 z-[80]">
                    {snowParticles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute bg-white rounded-full animate-fall-slow opacity-100 shadow-[0_0_8px_rgba(255,255,255,1)]"
                            style={{
                                width: `${p.size}px`, height: `${p.size}px`,
                                left: `${p.left}%`,
                                top: '-20px',
                                animationDuration: `${p.duration}s`,
                                animationDelay: `${p.delay}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* THUNDER FLASH */}
            {showThunderFlash && (
                <div className="absolute inset-0 bg-white animate-flash opacity-0 mix-blend-overlay z-[56]"></div>
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

            {/* WIND */}
            {showWind && (
                <div className="absolute inset-0 z-[55]">
                    {windParticles.map((p) => (
                        <div
                            key={p.id}
                            className="absolute bg-white/40 w-96 h-[4px] rounded-full animate-wind-fly blur-[1px]"
                            style={{
                                top: `${p.top}%`,
                                left: `-20%`,
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

// --- MAIN APP ---

export default function App({ username }) {
    const [mode, setMode] = useState('normal');
    const [location, setLocation] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isGodMinimized, setIsGodMinimized] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const navigate = useNavigate();

    // Wire up UX Improvements
    const { loadImprovementsForPage } = useUX();
    useEffect(() => {
        loadImprovementsForPage('WeatherPage');
    }, [loadImprovementsForPage]);

    const [godOverride, setGodOverride] = useState({
        active: false,
        weatherCode: 0,
        windSpeed: 10,
        temperature: 20,
        pressure: 1013,
        lat: 40.7128,
        lon: -74.0060
    });

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

    const handleSearch = async () => {
        if (!location) return;
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

    const getBgClass = () => {
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
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[100] p-4">
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

                    <div id="mode-switcher" className="relative flex bg-black/40 backdrop-blur-xl rounded-full p-1.5 border border-white/10 shadow-2xl mb-8">
                        {['normal', 'dev', 'god'].map((m) => (
                            <button key={m} onClick={() => setMode(m)} className={`relative px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${mode === m ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>{m}</button>
                        ))}
                    </div>

                    <div className={`space-y-12 transition-all duration-500 ${godOverride.active ? 'opacity-100' : 'opacity-20 pointer-events-none grayscale'}`}>
                        <div>
                            <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-5 pl-1">Atmospheric Condition</label>
                            <div className="grid grid-cols-7 gap-3">
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 0 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 0 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><Sun size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 1 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 1 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><Cloud size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 45 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 45 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><CloudFog size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 61 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 61 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><CloudRain size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 71 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 71 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><CloudSnow size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, weatherCode: 95 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.weatherCode === 95 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><CloudLightning size={22} /></button>
                                <button onClick={() => setGodOverride(prev => ({ ...prev, windSpeed: 100 }))} className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border ${godOverride.windSpeed >= 100 ? 'bg-white text-black border-white scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'}`}><Wind size={22} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ImprovementWrapper>

            <div className={`min-h-screen w-full relative overflow-x-hidden transition-colors duration-1000 ${getBgClass()} ${getTextClass()} font-sans selection:bg-white/20 selection:text-white cursor-none`}>

                <CustomCursor />

                <WeatherOverlay
                    weatherType={weatherType}
                    windSpeed={currentDisplay.wind}
                    mousePos={mousePos}
                    active={isEffectsActive}
                    soundEnabled={soundEnabled}
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

                            {(weatherData || godOverride.active) && (
                                <>
                                    <div id="search-overlay" className={`w-full max-w-lg transition-all duration-700 ease-in-out origin-top z-50 ${showSearch ? 'opacity-100 scale-100 translate-y-0 mb-8' : 'opacity-0 scale-90 -translate-y-10 absolute pointer-events-none h-0 mb-0'}`}>
                                        <div className="relative group">
                                            <input type="text" className="relative w-full bg-black/40 border border-white/10 text-white placeholder-white/20 rounded-2xl py-4 pl-6 pr-14 backdrop-blur-xl shadow-lg focus:outline-none focus:bg-black/60 transition-all text-lg font-light" placeholder="Change location..." value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                            <button onClick={handleSearch} className="absolute inset-y-2 right-2 w-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"><Search size={16} /></button>
                                        </div>
                                    </div>
                                </>
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
                                    <div id="main-temp" className="relative inline-block py-4">
                                        <h1 className="text-[20vw] lg:text-[15rem] xl:text-[18rem] leading-[0.8] font-[100] tracking-tighter text-white mix-blend-overlay select-none">{Math.round(currentDisplay.temp)}°</h1>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
                                    </div>
                                    <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 w-full max-w-5xl mx-auto relative z-20">
                                        {[{ icon: Wind, value: currentDisplay.wind, unit: 'KM/H', label: 'Wind Velocity' }, { icon: Droplets, value: currentDisplay.humidity, unit: '%', label: 'Humidity' }, { icon: Gauge, value: Math.round(currentDisplay.pressure), unit: 'hPa', label: 'Pressure' }].map((stat, i) => (
                                            <div key={i} className="flex flex-col items-center justify-center p-8 rounded-[2rem] transition-all duration-500 group w-full border border-transparent hover:bg-white/5 hover:backdrop-blur-md hover:border-white/5">
                                                <stat.icon size={28} className="text-white/30 mb-4 group-hover:text-white/80 transition-colors" />
                                                <span className="text-3xl font-light tracking-tight">{stat.value} <span className="text-xs opacity-40 font-bold ml-1">{stat.unit}</span></span>
                                                <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 mt-2">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 w-full mt-20 max-w-7xl mx-auto relative z-20">
                                        <div id="forecast-graph" className="w-full h-[350px] lg:h-[400px]">{currentDisplay.hourly && <ForecastGraph data={currentDisplay.hourly} />}</div>
                                        <div id="location-map" className="w-full h-[350px] lg:h-[400px]">{(currentDisplay.lat && currentDisplay.lon) && <LocationMap lat={currentDisplay.lat} lon={currentDisplay.lon} />}</div>
                                    </div>
                                </div>

                            )}
                        </div>
                        {error && <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500/10 border border-red-500/20 text-red-200 px-8 py-4 rounded-2xl backdrop-blur-xl text-xs font-bold uppercase tracking-wider z-[100] shadow-2xl animate-in slide-in-from-bottom-4 fade-in">System Alert: {error}</div>}
                    </div>
                    <div className="p-8 text-center opacity-20 hover:opacity-50 transition-opacity text-[9px] tracking-[0.4em] uppercase font-bold cursor-default text-white">incx weather v1.0</div>



                </div>
                {mode === 'god' && renderGodMenu()}
            </div>
        </ImprovementWrapper >
    );
}
