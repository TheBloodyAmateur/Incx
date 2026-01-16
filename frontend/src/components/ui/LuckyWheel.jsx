import { useState, useRef } from "react";
import "./LuckyWheel.css";

const SEGMENTS = [5, 10, 15, 20, 25, 30];
const SEGMENT_ANGLE = 360 / SEGMENTS.length; // 60 degrees per segment

export default function LuckyWheel({ onSpinComplete }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const wheelRef = useRef(null);

    const spinWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setResult(null);

        // Random number of full rotations (5-8) plus random segment
        const fullRotations = 5 + Math.floor(Math.random() * 4);
        const randomSegment = Math.floor(Math.random() * SEGMENTS.length);
        
        // Calculate final rotation
        // We need to align so the pointer (at top) points to the middle of a segment
        const segmentRotation = randomSegment * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
        const totalRotation = rotation + (fullRotations * 360) + segmentRotation;
        
        setRotation(totalRotation);

        // Wait for spin animation to complete (4 seconds as defined in CSS)
        setTimeout(() => {
            setIsSpinning(false);
            const selectedValue = SEGMENTS[SEGMENTS.length - 1 - randomSegment];
            setResult(selectedValue);
            startCountdown(selectedValue);
        }, 4000);
    };

    const startCountdown = (seconds) => {
        setCountdown(seconds);
        
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (onSpinComplete) {
                        onSpinComplete();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="lucky-wheel-container">
            <div className="wheel-wrapper">
                <div className="wheel-pointer" />
                <div
                    ref={wheelRef}
                    className={`wheel ${isSpinning ? "spinning" : ""}`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {SEGMENTS.map((value, index) => (
                        <div
                            key={value}
                            className="wheel-segment"
                            style={{
                                transform: `rotate(${index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2}deg)`,
                            }}
                        >
                            <span>{value}s</span>
                        </div>
                    ))}
                </div>
                <div className="wheel-center" />
            </div>

            {result === null && (
                <button
                    className="spin-button"
                    onClick={spinWheel}
                    disabled={isSpinning}
                >
                    {isSpinning ? "Spinning..." : "Spin!"}
                </button>
            )}

            {result !== null && countdown !== null && (
                <div className="countdown-container">
                    <p className="result-text">Du hast {result} Sekunden bekommen!</p>
                    <p className="countdown-text">Weiterleitung in...</p>
                    <div className="countdown-number">{countdown}</div>
                </div>
            )}
        </div>
    );
}
