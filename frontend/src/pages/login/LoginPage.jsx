import { useState } from "react";
import LetterGlitch from "../../components/ui/LetterGlitch";
import SimpleNav from "../../components/ui/SimpleNav";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";
import "./LoginPage.css";

export default function LoginPage() {
    const [devMode, setDevMode] = useState(false);

    const [fakePassword, setFakePassword] = useState("");
    const [fakeUsername, setFakeUsername] = useState("");

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/dashboard");
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
                <h1>{devMode ? "Login (DEV)" : "Login"}</h1>

                <label>Username</label>
                <input
                    type={devMode ? "text" : "password"}
                    value={fakePassword}
                    onChange={(e) => setFakePassword(e.target.value)}
                    placeholder={devMode ? "Username" : "•••••••"}
                />

                <label>Password</label>
                <input
                    type={devMode ? "password" : "text"}
                    value={fakeUsername}
                    onChange={(e) => setFakeUsername(e.target.value)}
                    placeholder={devMode ? "••••••" : "Username"}
                />

                <button onClick={handleLogin}>Sign In</button>

                <a href="/forgot" className="forgot-link">
                    Forgot Password?
                </a>
            </div>
        </div>
    );
}
