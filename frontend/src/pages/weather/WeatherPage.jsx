import { useEffect, useState } from "react";
import WeatherEffectsLayer from "../../components/weather/WeatherEffectsLayer";

const BACKEND_BASE_URL = "/api";

function buildBackendUrl({
    viewMode,
    latitude,
    longitude,
    overrides,
    city,
}) {
    const params = new URLSearchParams();

    if (viewMode) params.set("viewMode", viewMode);
    if (latitude != null) params.set("lat", String(latitude));
    if (longitude != null) params.set("lon", String(longitude));
    if (city) params.set("name", city);

    if (viewMode === "god" && overrides) {
        if (overrides.temperature !== "") params.set("temperature", overrides.temperature);
        if (overrides.windSpeed !== "") params.set("windSpeed", overrides.windSpeed);
        if (overrides.humidity !== "") params.set("humidity", overrides.humidity);
        if (overrides.cloudCover !== "") params.set("cloudCover", overrides.cloudCover);
        if (overrides.precipitation !== "") params.set("precipitation", overrides.precipitation);
        if (overrides.weatherMode) params.set("weatherMode", overrides.weatherMode);
    }

    const base = BACKEND_BASE_URL.endsWith("/")
        ? BACKEND_BASE_URL.slice(0, -1)
        : BACKEND_BASE_URL;

    return `${base}/weather/current?${params.toString()}`;
}

export default function WeatherPage() {
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);
    const [backendData, setBackendData] = useState(null);
    const [viewMode, setViewMode] = useState("normal");

    const [overrides, setOverrides] = useState({
        temperature: "",
        windSpeed: "",
        humidity: "",
        cloudCover: "",
        precipitation: "",
        weatherMode: "",
    });

    useEffect(() => {
        const controller = new AbortController();

        async function loadWeather() {
            setStatus("loading");
            setError(null);

            try {
                const url = buildBackendUrl({
                    viewMode,
                    latitude: 52.52,
                    longitude: 13.41,
                    overrides,
                });

                const res = await fetch(url, { signal: controller.signal });

                if (!res.ok) {
                    throw new Error(`Backend error: ${res.status} ${res.statusText}`);
                }

                const contentType = res.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    const text = await res.text();
                    throw new Error(`Unerwarteter Inhaltstyp: ${contentType}. Body: ${text.substring(0, 200)}...`);
                }

                const json = await res.json();
                setBackendData(json);
                setStatus("success");
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("Failed to load weather from backend", err);
                setError(err.message || "Unbekannter Fehler beim Laden der Wetterdaten");
                setStatus("error");
            }
        }

        loadWeather();

        return () => controller.abort();
    }, [viewMode, overrides]);

    const handleOverrideChange = (field) => (event) => {
        const value = event.target.value;
        setOverrides((prev) => ({ ...prev, [field]: value }));
    };

    const isDevMode = viewMode === "dev";
    const isGodMode = viewMode === "god";
    const isRainMode = backendData?.mode === "rain" && !isDevMode;

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "2rem",
                color: isDevMode ? "#e5e5e5" : "white",
                background: isDevMode ? "#111827" : "#020617",
                transition: "background 200ms ease, color 200ms ease",
            }}
        >
            <div style={{ position: "relative", maxWidth: "960px" }}>
                {/* Header */}
                <header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Wetter-Folterstation</h1>
                        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                            Modus: <strong>{viewMode.toUpperCase()}</strong>{" "}
                            {backendData && backendData.mode && (
                                <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", opacity: 0.8 }}>
                                    (Wettermodus: <strong>{String(backendData.mode).toUpperCase()}</strong>)
                                </span>
                            )}
                        </p>
                    </div>

                    {/* ViewMode-Toggle */}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            type="button"
                            onClick={() => setViewMode("normal")}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "999px",
                                border: "1px solid rgba(148, 163, 184, 0.7)",
                                background: viewMode === "normal" ? "#1d4ed8" : "transparent",
                                color: "white",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                            }}
                        >
                            Normal
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("dev")}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "999px",
                                border: "1px solid rgba(148, 163, 184, 0.7)",
                                background: viewMode === "dev" ? "#16a34a" : "transparent",
                                color: "white",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                            }}
                        >
                            Dev
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("god")}
                            style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "999px",
                                border: "1px solid rgba(148, 163, 184, 0.7)",
                                background: viewMode === "god" ? "#7c3aed" : "transparent",
                                color: "white",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                            }}
                        >
                            God
                        </button>
                    </div>
                </header>

                {/* Status / Fehler */}
                {status === "loading" && <p>Wetterdaten werden geladen …</p>}
                {status === "error" && (
                    <p style={{ color: "salmon" }}>
                        Fehler beim Laden der Wetterdaten: {error}
                        <br />
                        Prüfe deine Internetverbindung oder probiere es später erneut.
                    </p>
                )}

                {status === "success" && backendData && (
                    <section
                        style={{
                            display: "grid",
                            gap: "0.75rem",
                            maxWidth: "360px",
                            padding: "1rem",
                            borderRadius: "1rem",
                            background: isDevMode ? "rgba(15, 23, 42, 0.9)" : "rgba(15, 23, 42, 0.7)",
                            border: "1px solid rgba(148, 163, 184, 0.4)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        {[{
                            label: "Temperatur",
                            value: backendData.temperature != null ? `${backendData.temperature} °C` : "–",
                        }, {
                            label: "Windgeschwindigkeit",
                            value: backendData.windSpeed != null ? `${backendData.windSpeed} km/h` : "–",
                        }, {
                            label: "Luftfeuchte",
                            value: backendData.humidity != null ? `${backendData.humidity} %` : "–",
                        }, {
                            label: "Bewölkung",
                            value: backendData.cloudCover != null ? `${backendData.cloudCover} %` : "–",
                        }, {
                            label: "Niederschlag (mm)",
                            value: backendData.precipitation != null ? backendData.precipitation : "–",
                        }, {
                            label: "Wettercode",
                            value: backendData.weatherCode != null ? backendData.weatherCode : "–",
                        }].map((item) => {
                            const baseStyle = {
                                padding: "0.4rem 0.6rem",
                                borderRadius: "0.75rem",
                                background: "rgba(15, 23, 42, 0.9)",
                                border: "1px solid rgba(148, 163, 184, 0.4)",
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "0.75rem",
                                fontSize: "0.9rem",
                                position: "relative",
                            };

                            return (
                                <div key={item.label} style={baseStyle}>
                                    <span>{item.label}:</span>
                                    <span style={{ opacity: 0.9 }}>{item.value}</span>
                                </div>
                            );
                        })}

                    </section>
                )}

                {status === "idle" && <p>Bereit, das Wetter zu quälen …</p>}

                {/* God-Mode-Override-Panel */}
                {isGodMode && (
                    <section
                        style={{
                            marginTop: "2rem",
                            padding: "1rem",
                            borderRadius: "1rem",
                            background: "rgba(31, 41, 55, 0.9)",
                            border: "1px dashed rgba(129, 140, 248, 0.8)",
                            maxWidth: "420px",
                            fontSize: "0.85rem",
                        }}
                    >
                        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>God-Mode: Manuelle Wettersteuerung</h2>
                        <p style={{ marginBottom: "0.75rem", opacity: 0.85 }}>
                            Die folgenden Werte überschreiben die API-Daten im Backend. Leere Felder verwenden weiterhin
                            die echten Werte.
                        </p>

                        <div style={{ display: "grid", gap: "0.5rem" }}>
                            <label style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                <span>Temperatur (°C)</span>
                                <input
                                    type="number"
                                    value={overrides.temperature}
                                    onChange={handleOverrideChange("temperature")}
                                    placeholder={backendData?.temperature ?? "API-Wert"}
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid rgba(148, 163, 184, 0.7)",
                                        background: "rgba(15,23,42,0.9)",
                                        color: "white",
                                        fontSize: "0.8rem",
                                    }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                <span>Windgeschwindigkeit (km/h)</span>
                                <input
                                    type="number"
                                    value={overrides.windSpeed}
                                    onChange={handleOverrideChange("windSpeed")}
                                    placeholder={backendData?.windSpeed ?? "API-Wert"}
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid rgba(148, 163, 184, 0.7)",
                                        background: "rgba(15,23,42,0.9)",
                                        color: "white",
                                        fontSize: "0.8rem",
                                    }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                <span>Luftfeuchte (%)</span>
                                <input
                                    type="number"
                                    value={overrides.humidity}
                                    onChange={handleOverrideChange("humidity")}
                                    placeholder={backendData?.humidity ?? "API-Wert"}
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid rgba(148, 163, 184, 0.7)",
                                        background: "rgba(15,23,42,0.9)",
                                        color: "white",
                                        fontSize: "0.8rem",
                                    }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                <span>Bewölkung (%)</span>
                                <input
                                    type="number"
                                    value={overrides.cloudCover}
                                    onChange={handleOverrideChange("cloudCover")}
                                    placeholder={backendData?.cloudCover ?? "API-Wert"}
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid rgba(148, 163, 184, 0.7)",
                                        background: "rgba(15,23,42,0.9)",
                                        color: "white",
                                        fontSize: "0.8rem",
                                    }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                <span>Niederschlag (mm)</span>
                                <input
                                    type="number"
                                    value={overrides.precipitation}
                                    onChange={handleOverrideChange("precipitation")}
                                    placeholder={backendData?.precipitation ?? "API-Wert"}
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid rgba(148, 163, 184, 0.7)",
                                        background: "rgba(15,23,42,0.9)",
                                        color: "white",
                                        fontSize: "0.8rem",
                                    }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                <span>Wettermodus erzwingen</span>
                                <select
                                    value={overrides.weatherMode}
                                    onChange={handleOverrideChange("weatherMode")}
                                    style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "0.5rem",
                                        border: "1px solid rgba(148, 163, 184, 0.7)",
                                        background: "rgba(15,23,42,0.9)",
                                        color: "white",
                                        fontSize: "0.8rem",
                                    }}
                                >
                                    <option value="">Automatisch (aus Daten)</option>
                                    <option value="rain">Regen</option>
                                    <option value="fog">Nebel</option>
                                    <option value="wind">Wind</option>
                                    <option value="sun">Sonne</option>
                                    <option value="snow">Schnee</option>
                                    <option value="storm">Sturm</option>
                                </select>
                            </label>
                        </div>
                    </section>
                )}

                {/* Effects-Text kommt weiterhin vom Frontend, die Entscheidung welcher Modus aktiv ist aber vom Backend */}
                {status === "success" && backendData && !isDevMode && backendData.mode && (
                    <section style={{ marginTop: "2.5rem", maxWidth: "640px", fontSize: "0.9rem", lineHeight: 1.5 }}>
                        {backendData.mode === "rain" && (
                            <p>
                                Regen-Modus: Alle Wetterparameter werden später als tropfender Text nach unten fallen,
                                verschwinden und teilweise so schnell laufen, dass man sie kaum lesen kann.
                            </p>
                        )}
                        {backendData.mode === "fog" && (
                            <p>
                                Nebel-Modus: Das UI erhält einen pulsierenden Blur, Farben werden grau auf grau und Hover
                                hebt den Nebel nur ganz kurz auf.
                            </p>
                        )}
                        {backendData.mode === "wind" && (
                            <p>
                                Wind-Modus: Der Mauszeiger driftet nach rechts, Scrollen verhält sich unberechenbar und UI
                                wirkt von Windböen beeinflusst.
                            </p>
                        )}
                        {backendData.mode === "sun" && (
                            <p>
                                Sonnen-Modus: Temperatur in knallgelb auf weiß, ein wandernder Lens-Flare verdeckt
                                UI-Elemente und Hover erzeugt eine brutale Überstrahlung.
                            </p>
                        )}
                        {backendData.mode === "snow" && (
                            <p>
                                Schnee-Modus: Permanente Schneeflocken-Animation, Klicks bekommen künstliches Delay und
                                Tooltips frieren regelrecht ein.
                            </p>
                        )}
                        {backendData.mode === "storm" && (
                            <p>
                                Sturm-Modus: Die gesamte Seite wackelt horizontal, Icons und Text wackeln mit und drehen
                                sich leicht wie lose Gegenstände im Wind.
                            </p>
                        )}
                    </section>
                )}

                {/* Overlay-Effekte, liegen über allem innerhalb dieses Containers */}
                {backendData && (
                    <WeatherEffectsLayer mode={backendData.mode} devMode={isDevMode} />
                )}
            </div>
        </main>
    );
}
