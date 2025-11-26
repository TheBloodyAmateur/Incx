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
    const getBackgroundStyle = (color) => {
        if (gradientMapping[color]) {
            return { background: gradientMapping[color] };
        }
        return { background: color };
    };

    return (
        <div className={`icon-btns ${className || ""}`}>
            {items.map((item, index) => (
                <button
                    key={index}
                    className={`icon-btn ${item.customClass || ""}`}
                    aria-label={item.ariaLabel || item.label}
                    type="button"
                    onClick={item.onClick}
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
