import React, { useEffect, useRef } from 'react';

// Uses direct DOM manipulation for maximum smoothness (bypassing React render cycle)
const CustomCursor = () => {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            // Update outer ring (slight delay/smoothness could be added here later)
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            }
            // Update center dot
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            }
        };

        // Add click effect listener
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
            {/* Force hide default cursor everywhere */}
            <style>{`
        * { cursor: none !important; }
      `}</style>

            {/* Outer Ring */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-150 ease-out will-change-transform"
            />
            {/* Inner Dot */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-1 h-1 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform"
            />
        </>
    );
};

export default CustomCursor;
