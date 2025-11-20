import { useState } from "react";
import LetterGlitch from "../../components/ui/LetterGlitch";
import SimpleNav from "../../components/ui/SimpleNav";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./LoginPage.css";

export default function LoginPage() {
    const [devMode, setDevMode] = useState(false);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
                const errorData = await response.json();
                setError(errorData.message || "Authentication failed");
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            setError("An error occurred during authentication. Please check the console for more details.");
        }
    };

    return (
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
            <div className="login-box">
                <h1>{isLogin ? (devMode ? "Login (DEV)" : "Login") : "Register"}</h1>
                {error && <p className="error-message">{error}</p>}
                <label>Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <label>Password</label>
                <input
                    type={devMode ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={devMode ? "Password" : "•••••••"}
                />
                <button onClick={handleAuth}>{isLogin ? "Sign In" : "Register"}</button>
                <p onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
                    {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </p>
                <a href="/forgot" className="forgot-link">
                    Forgot Password?
                </a>
            </div>
        </div>
    );
}
