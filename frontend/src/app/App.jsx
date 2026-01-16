import React, { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import "../styles/global.css";
import { UXProvider } from '../context/UXContext';

// --- GLOBAL CUSTOM CURSOR COMPONENT ---
const CustomCursor = () => {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
        const moveCursor = (e) => {
            // Smooth follow for outer ring
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            }
            // Instant follow for center dot
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
            {/* Outer Ring */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[999999] mix-blend-difference transition-transform duration-150 ease-out will-change-transform"
            />
            {/* Inner Dot */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-1 h-1 bg-white rounded-full pointer-events-none z-[999999] mix-blend-difference will-change-transform"
            />
        </>
    );
};

export default function App() {
    return (
        <UXProvider>
            <>
                <CustomCursor />
                <RouterProvider router={router} />
            </>
        </UXProvider>
    );
}