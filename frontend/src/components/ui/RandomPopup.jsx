import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './RandomPopup.css';

export default function RandomPopup() {
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);

    // Nur auf Seiten nach Login/Landing anzeigen
    const excludedPaths = ['/', '/login'];
    const shouldShowPopups = !excludedPaths.includes(location.pathname);

    // Lade die Popup-Nachrichten aus der externen Datei
    useEffect(() => {
        fetch('/random-popups.txt')
            .then(response => response.text())
            .then(text => {
                const loadedMessages = text.split('\n').filter(line => line.trim() !== '');
                setMessages(loadedMessages);
            })
            .catch(err => {
                console.error('Fehler beim Laden der Popup-Nachrichten:', err);
            });
    }, []);

    const showRandomPopup = () => {
        if (messages.length === 0 || !shouldShowPopups) return;
        const randomIndex = Math.floor(Math.random() * messages.length);
        setCurrentMessage(messages[randomIndex]);
        setIsVisible(true);
    };

    const scheduleNextPopup = () => {
        // Nächstes Popup nach 20-40 Sekunden
        const delay = 20000 + Math.random() * 20000;
        timeoutRef.current = setTimeout(showRandomPopup, delay);
    };

    // Erstes Popup nach 10-30 Sekunden
    useEffect(() => {
        if (messages.length === 0 || !shouldShowPopups) return;

        const initialDelay = 10000 + Math.random() * 20000;
        timeoutRef.current = setTimeout(showRandomPopup, initialDelay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [messages, shouldShowPopups]);

    // Timer stoppen wenn auf excluded page gewechselt wird
    useEffect(() => {
        if (!shouldShowPopups) {
            setIsVisible(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, [shouldShowPopups]);

    const handleClose = () => {
        setIsVisible(false);
        // Nach dem Schließen: nächstes Popup in 20-40 Sekunden planen
        scheduleNextPopup();
    };

    if (!isVisible || !currentMessage || !shouldShowPopups) return null;

    return (
        <div className="random-popup-overlay">
            <div className="random-popup">
                <button className="random-popup-close" onClick={handleClose}>×</button>
                <div className="random-popup-icon">💬</div>
                <p className="random-popup-message">{currentMessage}</p>
                <button className="random-popup-ok" onClick={handleClose}>OK</button>
            </div>
        </div>
    );
}
