import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CookieConsent.css";

export default function CookieConsent() {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Always show on every route change.
        // Never remember the choice.
        setShow(true);
        console.log("Inconvenience Cookie Banner: RESETting to visible");
    }, [location.pathname]);

    const handleAccept = () => {
        // Fake accept - doesn't save anything
        setShow(false);
    };

    const handleDecline = () => {
        // Fake decline - doesn't save anything
        setShow(false);
        // If declining on internal page, back to login
        if (location.pathname !== '/') {
            navigate("/");
        }
    };

    if (!show) {
        return null;
    }

    return (
        <div className="consent-banner-overlay">
            <div className="consent-banner-modal">
                <div className="consent-banner-icon">🍪</div>
                <h2>Cookie-Zustimmung erforderlich</h2>
                <p>
                    Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern.
                    Bitte akzeptieren Sie unsere Cookie-Richtlinie, um fortzufahren.
                    Ohne Ihre Zustimmung können Sie die Website nicht nutzen.
                </p>
                <div className="consent-banner-buttons">
                    <button
                        className="consent-banner-btn consent-banner-btn-accept"
                        onClick={handleAccept}
                    >
                        Akzeptieren
                    </button>
                    <button
                        className="consent-banner-btn consent-banner-btn-decline"
                        onClick={handleDecline}
                    >
                        Ablehnen
                    </button>
                </div>
            </div>
        </div>
    );
}
