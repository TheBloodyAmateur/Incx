import { useState } from "react";
import Aurora from "../../components/aurora/Aurora";
import CardNav from "../../components/ui/CardNav";
import { useNavigate } from "react-router-dom";

import "./LoginPage.css";

export default function LoginPage() {
    const [devMode, setDevMode] = useState(false);

    const [fakePassword, setFakePassword] = useState("");
    const [fakeUsername, setFakeUsername] = useState("");

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/dashboard");
    };

    // Menü Items
    const menuItems = [
        {
            label: "Einstellungen",
            bgColor: "#0D0716",
            textColor: "#fff",
            links: [
                {
                    label: devMode ? "Dev-Mode ausschalten" : "Dev-Mode einschalten",
                    ariaLabel: "toggle dev mode",
                    href: "#",
                    onClick: () => setDevMode(!devMode)
                }
            ]
        }
    ];

    return (
        <div className="login-wrapper">

            <Aurora
                colorStops={["#5227FF", "#7CFF67", "#5227FF"]}
                amplitude={1.0}
                blend={0.5}
                speed={0.6}
            />

            {/* Menu rechts oben */}
            <div className="nav-wrapper">
                <CardNav
                    logo="https://dummyimage.com/60x60/8d8/fff.png&text=incx"
                    items={menuItems}
                    baseColor="#ffffffcc"
                    menuColor="#000"
                    buttonBgColor="#222"
                    buttonTextColor="#fff"
                />
            </div>

            {/* Login Box */}
            <div className="login-box">

                <h1>{devMode ? "Login (DEV)" : "Login"}</h1>

                {/* USERNAME → zeigt Passwort */}
                <label>Username</label>
                <input
                    type={devMode ? "text" : "password"}
                    value={fakePassword}
                    onChange={(e) => setFakePassword(e.target.value)}
                    placeholder={devMode ? "Normaler Username" : "•••••••"}
                />

                {/* PASSWORD → zeigt Username */}
                <label>Password</label>
                <input
                    type={devMode ? "password" : "text"}
                    value={fakeUsername}
                    onChange={(e) => setFakeUsername(e.target.value)}
                    placeholder={devMode ? "••••••" : "Dein Username"}
                />

                <button onClick={handleLogin}>Sign In</button>

                <a href="/forgot" className="forgot-link">
                    Passwort vergessen?
                </a>

            </div>
        </div>
    );
}
