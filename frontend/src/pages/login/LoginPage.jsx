import { useState, useEffect } from "react";
import LetterGlitch from "../../components/ui/LetterGlitch";
import SimpleNav from "../../components/ui/SimpleNav";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./LoginPage.css";
import ImprovementWrapper from '../../components/imp/ImprovementWrapper';
import { useUX } from '../../context/UXContext';

export default function LoginPage() {
    const { loadImprovementsForPage } = useUX();

    useEffect(() => {
        loadImprovementsForPage('LoginPage');
    }, []);
    const [devMode, setDevMode] = useState(false);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const [crypticMessages, setCrypticMessages] = useState([]);
    const navigate = useNavigate();

    // Lade die kryptischen Fehlermeldungen aus der externen Datei
    useEffect(() => {
        fetch('/error-messages.txt')
            .then(response => response.text())
            .then(text => {
                const messages = text.split('\n').filter(line => line.trim() !== '');
                setCrypticMessages(messages);
            })
            .catch(err => {
                console.error('Fehler beim Laden der Fehlermeldungen:', err);
                // Fallback falls Datei nicht geladen werden kann
                setCrypticMessages(["Ein unbekannter Fehler ist aufgetreten."]);
            });
    }, []);

    const getRandomCrypticError = () => {
        if (crypticMessages.length === 0) {
            return "Ein mysteriöser Fehler ist aufgetreten.";
        }
        const randomIndex = Math.floor(Math.random() * crypticMessages.length);
        return crypticMessages[randomIndex];
    };

    const handleAuth = async () => {
        const url = isLogin ? "http://localhost:8080/api/auth/login" : "http://localhost:8080/api/auth/register";
        const payload = { username, password };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                navigate(`/dashboard?username=${username}`);
            } else {
                // Zeige eine zufällige kryptische Fehlermeldung statt der echten
                setError(getRandomCrypticError());
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            // Auch bei Netzwerkfehlern eine lustige Meldung zeigen
            setError(getRandomCrypticError());
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAuth();
    };

    return (
        <ImprovementWrapper>
            <div className="login-wrapper">
                <LetterGlitch
                    glitchColors={["#3A2F66", "#2E4A7F", "#0F6A77"]}
                    glitchSpeed={50}
                    outerVignette={true}
                    centerVignette={false}
                />
                <div className="logo-fixed">
                    <img src={logo} alt="incx" />
                </div>
                <div className="nav-wrapper">
                    <SimpleNav
                        devMode={devMode}
                        onDevModeToggle={setDevMode}
                    />
                </div>
                <form className="login-box" onSubmit={handleSubmit}>
                    <h1>{isLogin ? (devMode ? "Login (DEV)" : "Login") : "Register"}</h1>
                    {error && <p name="error-message" className="error-message">{error}</p>}
                    <label>Username</label>
                    <input
                        type={devMode ? "text" : "password"}
                        value={devMode ? username : password}
                        onChange={(e) => devMode ? setUsername(e.target.value) : setPassword(e.target.value)}
                        placeholder={devMode ? "Username" : "Password"}
                    />
                    <label>Password</label>
                    <input
                        type={devMode ? "password" : "text"}
                        value={devMode ? password : username}
                        onChange={(e) => devMode ? setPassword(e.target.value) : setUsername(e.target.value)}
                        placeholder={devMode ? "Password" : "Username"}
                    />
                    <button type="submit">{isLogin ? "Sign In" : "Register"}</button>
                    <p onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
                        {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                    </p>
                    <a href="/forgot" className="forgot-link">
                        Forgot Password?
                    </a>
                </form>
            </div>
        </ImprovementWrapper>
    );
}
