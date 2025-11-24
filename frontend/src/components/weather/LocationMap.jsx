import React from 'react';
import { Map as MapIcon } from 'lucide-react';

const LocationMap = ({ lat, lon }) => {
    if (!lat || !lon) return null;
    const offset = 0.05;
    const bbox = `${lon - offset},${lat - offset},${lon + offset},${lat + offset}`;

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-black/40 backdrop-blur-md opacity-90 hover:opacity-100 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                    <MapIcon size={12} />
                    <span>Terrain Data</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                </div>
            </div>
            <div className="relative flex-1 min-h-[200px]">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
                    className="absolute inset-0 w-full h-full bg-[#1a1a1a] grayscale-[0.8] invert contrast-[1.2] opacity-80 mix-blend-screen"
                    title="Weather Map"
                ></iframe>
            </div>
        </div>
    );
};

export default LocationMap;
