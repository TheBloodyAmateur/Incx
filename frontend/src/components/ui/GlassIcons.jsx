import { useState, useEffect, useRef } from "react";
import "./GlassIcons.css";

const gradientMapping = {
    blue: "linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))",
    purple: "linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))",
    red: "linear-gradient(hsl(3, 90%, 50%), hsl(348, 90%, 50%))",
    indigo: "linear-gradient(hsl(253, 90%, 50%), hsl(238, 90%, 50%))",
    orange: "linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))",
    green: "linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))",
    pinkviolet: "linear-gradient(135deg, #D14CFE, #7A1DFB)",
    cyanblue: "linear-gradient(135deg, #00C6FF, #0072FF)",
    tealgreen: "linear-gradient(135deg, #7CFF67, #28C99A)",
    neonviolet: "linear-gradient(135deg, #A259FF, #6A1FFF)",
    electricblue: "linear-gradient(135deg, #00B4FF, #007BFF)",
    skycyan: "linear-gradient(135deg, #4FC3FF, #49A8FF)",
    deep_magenta: "linear-gradient(135deg, #B62482, #6A1666)",
    deep_sapphire: "linear-gradient(135deg, #005A9C, #003F6B)",
    deep_teal: "linear-gradient(135deg, #008F7A, #005F59)"
};

export default function GlassIcons({ items, className }) {
    // State für Button-Positionen und Sprungzähler
    const [buttonStates, setButtonStates] = useState(() =>
        items.map(() => ({
            position: { x: 0, y: 0 },
            jumpCount: 0,
            maxJumps: Math.floor(Math.random() * 3) + 1 // 1-3 Sprünge
        }))
    );

    const containerRef = useRef(null);

    // Reset bei neuem Mount (Dashboard-Besuch)
    useEffect(() => {
        setButtonStates(items.map(() => ({
            position: { x: 0, y: 0 },
            jumpCount: 0,
            maxJumps: Math.floor(Math.random() * 3) + 1
        })));
    }, [items.length]);

    const getBackgroundStyle = (color) => {
        if (gradientMapping[color]) {
            return { background: gradientMapping[color] };
        }
        return { background: color };
    };

    const handleButtonClick = (index, originalOnClick) => {
        setButtonStates(prev => {
            const newStates = [...prev];
            const currentState = newStates[index];

            // Prüfen ob noch Sprünge übrig sind
            if (currentState.jumpCount < currentState.maxJumps) {
                // Button springt weg - zufällige Position basierend auf Viewport
                // Bewegung in alle Richtungen: horizontal, vertikal und diagonal
                const rangeX = 700; // max 700px nach links oder rechts
                const rangeY = 250; // max 250px nach oben oder unten (bleibt sichtbar)

                const newX = (Math.random() - 0.5) * 2 * rangeX; // -400 bis +400
                const newY = (Math.random() - 0.5) * 2 * rangeY; // -300 bis +300

                newStates[index] = {
                    ...currentState,
                    position: { x: newX, y: newY },
                    jumpCount: currentState.jumpCount + 1
                };
                return newStates;
            } else {
                // Alle Sprünge verbraucht - Navigation ausführen
                if (originalOnClick) {
                    originalOnClick();
                }
                return prev;
            }
        });
    };

    return (
        <div ref={containerRef} className={`icon-btns ${className || ""}`}>
            {items.map((item, index) => (
                <button
                    key={index}
                    className={`icon-btn ${item.customClass || ""}`}
                    aria-label={item.ariaLabel || item.label}
                    type="button"
                    onClick={() => handleButtonClick(index, item.onClick)}
                    style={{
                        transform: `translate(${buttonStates[index]?.position.x || 0}px, ${buttonStates[index]?.position.y || 0}px)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                >
                    <span
                        className="icon-btn__back"
                        style={getBackgroundStyle(item.color)}
                    />
                    <span className="icon-btn__front">
                        <span className="icon-btn__icon" aria-hidden="true">
                            {item.icon}
                        </span>
                    </span>
                    <span className="icon-btn__label">{item.label}</span>
                </button>
            ))}
        </div>
    );
}
