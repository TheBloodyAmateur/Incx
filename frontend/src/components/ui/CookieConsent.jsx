import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CookieConsent.css";

export default function CookieConsent() {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');

        if (location.pathname === '/') {
            // Login Page: Only show if no decision made yet
            if (consent === 'rejected' || consent === 'accepted') {
                setShow(false);
            } else {
                setShow(true);
            }
        } else {
            // Internal Pages: Show if not explicitly accepted
            if (consent === 'accepted') {
                setShow(false);
            } else {
                setShow(true);
            }
        }
    }, [location.pathname]);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShow(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setShow(false);
        // If declining on internal page, kick to login.
        // If already on login, stay there (and popup hides).
        if (location.pathname !== '/') {
            navigate("/");
        }
    };

    if (!show) {
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
