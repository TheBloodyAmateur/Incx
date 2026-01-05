import React, { useState } from 'react';

const ForecastGraph = ({ data }) => {
    if (!data || data.length === 0) return null;
    const [hoverIndex, setHoverIndex] = useState(null);

    const width = 800;
    const height = 220;
    const paddingX = 30;
    const paddingY = 60; // Increased top padding for HTML tooltip space

    const hourly = data.time.slice(0, 24).map((time, i) => ({
        hour: new Date(time).getHours(),
        temp: data.temperature_2m[i]
    }));

    const minTemp = Math.min(...hourly.map(d => d.temp)) - 2;
    const maxTemp = Math.max(...hourly.map(d => d.temp)) + 2;
    const tempRange = maxTemp - minTemp || 1;

    const getX = (i) => paddingX + (i / (hourly.length - 1)) * (width - paddingX * 2);
    const getY = (temp) => height - paddingY - ((temp - minTemp) / tempRange) * (height - paddingY * 2);

    // Cubic Bezier smoothing
    const generateSmoothPath = (points) => {
        if (points.length === 0) return "";
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i === 0 ? 0 : i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    };

    const points = hourly.map((d, i) => ({ x: getX(i), y: getY(d.temp) }));
    const pathData = generateSmoothPath(points);
    const areaPath = `${pathData} L ${width - paddingX} ${height} L ${paddingX} ${height} Z`;

    return (
        <div className="w-full h-full flex flex-col group">
            <div className="flex justify-between items-end mb-4 px-2 flex-shrink-0">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">24h Projection</h3>
                {/* Header info removed, moved inside graph */}
            </div>

            {/* Outer Container: Relative, No Overflow Clipping */}
            <div className="relative flex-1 w-full min-h-[200px]">

                {/* Background & Graph Layer: Clipped */}
                <div className="absolute inset-0 w-full h-full bg-white/5 rounded-2xl overflow-hidden backdrop-blur-md border border-white/5 shadow-inner cursor-none">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none"
                        className="w-full h-full overflow-visible"
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <defs>
                            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                                <stop offset="50%" stopColor="white" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="white" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>

                        {/* Guidelines */}
                        <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />

                        <path d={areaPath} fill="url(#areaGradient)" className="text-white" />
                        <path d={pathData} fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] vector-effect-non-scaling-stroke" />

                        {/* Hover Areas: Invisible Rects covering full height for easy selection */}
                        {hourly.map((_, i) => (
                            <rect
                                key={i}
                                x={getX(i) - (width / hourly.length) / 2}
                                y={0}
                                width={width / hourly.length}
                                height={height}
                                fill="transparent"
                                className="cursor-crosshair"
                                onMouseEnter={() => setHoverIndex(i)}
                            />
                        ))}

                        {hoverIndex !== null && (
                            <g className="transition-all duration-300 ease-out pointer-events-none">
                                {/* Vertical Indicator Line */}
                                <line
                                    x1={points[hoverIndex].x}
                                    y1={paddingY}
                                    x2={points[hoverIndex].x}
                                    y2={height}
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeOpacity="0.2"
                                    strokeDasharray="4 4"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Active Point */}
                                <circle
                                    cx={points[hoverIndex].x}
                                    cy={points[hoverIndex].y}
                                    r="4"
                                    fill="white"
                                    className="shadow-[0_0_15px_rgba(255,255,255,1)]"
                                />

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

export default ForecastGraph;
