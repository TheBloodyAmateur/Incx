import React, { useEffect, useMemo } from 'react';
import { playThunderSound } from '../../utils/weatherUtils';

const WeatherOverlay = ({ weatherType, windSpeed, mousePos, active, soundEnabled }) => {
    if (!active) return null;
    const isWindy = windSpeed > 20;

    useEffect(() => {
        if (weatherType === 'thunder' && soundEnabled) {
            const interval = setInterval(() => {
                if (Math.random() > 0.7) playThunderSound();
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [weatherType, soundEnabled]);

    const rainParticles = useMemo(() => [...Array(200)].map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${0.4 + Math.random() * 0.3}s`,
        delay: `-${Math.random() * 2}s`
    })), []);

    const snowParticles = useMemo(() => [...Array(150)].map((_, i) => ({
        id: i,
        width: `${4 + Math.random() * 8}px`,
        height: `${4 + Math.random() * 8}px`,
        left: `${Math.random() * 100}%`,
        duration: `${3 + Math.random() * 4}s`,
        delay: `-${Math.random() * 5}s`
    })), []);

    const windParticles = useMemo(() => [...Array(20)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        duration: `${0.5 + Math.random()}s`,
        delay: `-${Math.random() * 2}s`
    })), []);

    return (
        <div className={`fixed inset-0 pointer-events-none z-50 overflow-hidden ${isWindy ? 'animate-shake-wind' : ''}`}>

            {/* RAIN */}
            {(weatherType === 'rain' || weatherType === 'thunder') && (
                <div className="absolute inset-0 rain-container">
                    {rainParticles.map((p) => (
                        <div key={p.id} className="absolute bg-blue-200/40 w-[1px] h-16 rounded-full animate-fall" style={{ left: p.left, top: '-50px', animationDuration: p.duration, animationDelay: p.delay }} />
                    ))}
                </div>
            )}

            {/* SNOW */}
            {weatherType === 'snow' && (
                <div className="absolute inset-0">
                    {snowParticles.map((p) => (
                        <div key={p.id} className="absolute bg-white/70 rounded-full blur-[1px] animate-fall-slow" style={{ width: p.width, height: p.height, left: p.left, top: '-20px', animationDuration: p.duration, animationDelay: p.delay }} />
                    ))}
                </div>
            )}

            {/* THUNDER */}
            {weatherType === 'thunder' && (
                <div className="absolute inset-0 bg-white animate-flash opacity-0 mix-blend-overlay"></div>
            )}

            {/* FOG */}
            {weatherType === 'fog' && (
                <>
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"></div>
                    <div className="absolute inset-0 opacity-40 animate-fog-drift-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent w-[200%]"></div>
                    <div
                        className="absolute inset-0 bg-black/90 z-10 transition-all duration-75 ease-out"
                        style={{
                            maskImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0) 80px, rgba(0,0,0,1) 250px)`,
                            WebkitMaskImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0) 80px, rgba(0,0,0,1) 250px)`,
                        }}
                    ></div>
                </>
            )}

            {/* WIND */}
            {isWindy && (
                <div className="absolute inset-0">
                    {windParticles.map((p) => (
                        <div key={p.id} className="absolute bg-white/10 w-64 h-[1px] rounded-full animate-wind-fly blur-sm" style={{ top: p.top, left: `-20%`, animationDuration: p.duration, animationDelay: p.delay }} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WeatherOverlay;
