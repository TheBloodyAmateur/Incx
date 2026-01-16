import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CookieConsent.css";

export default function CookieConsent() {
    const [accepted, setAccepted] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Reset cookie consent state on every route change
    useEffect(() => {
        setAccepted(false);
    }, [location.pathname]);

    const handleAccept = () => {
        setAccepted(true);
    };

    const handleDecline = () => {
        // Navigate to login page on decline
        navigate("/");
        // Reset accepted state so popup shows again on login page
        setAccepted(false);
    };

    // Don't show overlay if already accepted
    if (accepted) {
        return null;
    }

    return (
        <div className="cookie-overlay">
            <div className="cookie-modal">
                <div className="cookie-icon">🍪</div>
                <h2>Cookie-Zustimmung erforderlich</h2>
                <p>
                    Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern.
                    Bitte akzeptieren Sie unsere Cookie-Richtlinie, um fortzufahren.
                    Ohne Ihre Zustimmung können Sie die Website nicht nutzen.
                </p>
                <div className="cookie-buttons">
                    <button
                        className="cookie-btn cookie-btn-accept"
                        onClick={handleAccept}
                    >
                        Akzeptieren
                    </button>
                    <button
                        className="cookie-btn cookie-btn-decline"
                        onClick={handleDecline}
                    >
                        Ablehnen
                    </button>
                </div>
            </div>
        </div>
    );
}
