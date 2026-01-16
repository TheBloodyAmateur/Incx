import { useNavigate } from "react-router-dom";
import LetterGlitch from "../../components/ui/LetterGlitch";
import LuckyWheel from "../../components/ui/LuckyWheel";
import logo from "../../assets/logo.png";
import "./LandingPage.css";

export default function LandingPage() {
    const navigate = useNavigate();

    const handleSpinComplete = () => {
        navigate("/login");
    };

    return (
        <div className="landing-wrapper">
            <LetterGlitch
                glitchColors={["#3A2F66", "#2E4A7F", "#0F6A77"]}
                glitchSpeed={50}
                outerVignette={true}
                centerVignette={false}
            />
            <div className="landing-logo">
                <img src={logo} alt="incx" />
            </div>
            <div className="landing-content">
                <h1 className="landing-title">Willkommen bei Incx</h1>
                <p className="landing-subtitle">
                    Drehe das Glücksrad um zu erfahren, wie lange du warten musst!
                </p>
                <LuckyWheel onSpinComplete={handleSpinComplete} />
            </div>
        </div>
    );
}
