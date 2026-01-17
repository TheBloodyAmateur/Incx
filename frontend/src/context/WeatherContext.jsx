import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const WeatherContext = createContext({
    weatherData: {
        temperature: null,
        windSpeed: null,
        weatherType: null,
        viewMode: 'normal',
        isActive: false
    },
    windDirection: { x: 1, y: 0 },
    lastThunderTime: 0,
    updateWeather: () => { },
    setWindDirection: () => { },
    triggerThunder: () => { },
    clearWeather: () => { }
});

function WeatherProvider({ children }) {
    const [weatherData, setWeatherData] = useState({
        temperature: null,
        windSpeed: null,
        weatherType: null,
        viewMode: 'normal',
        isActive: false
    });

    const [windDirection, setWindDirection] = useState({ x: 1, y: 0 });
    const [lastThunderTime, setLastThunderTime] = useState(0);

    const updateWeather = useCallback((data) => {
        setWeatherData({
            temperature: data.temperature ?? null,
            windSpeed: data.windSpeed ?? null,
            weatherType: data.weatherType ?? null,
            viewMode: data.viewMode ?? 'normal',
            isActive: true
        });
    }, []);

    const triggerThunder = useCallback(() => {
        setLastThunderTime(Date.now());
    }, []);

    const clearWeather = useCallback(() => {
        setWeatherData({
            temperature: null,
            windSpeed: null,
            weatherType: null,
            viewMode: 'normal',
            isActive: false
        });
    }, []);

    const value = useMemo(() => ({
        weatherData,
        windDirection,
        lastThunderTime,
        updateWeather,
        setWindDirection,
        triggerThunder,
        clearWeather
    }), [weatherData, windDirection, lastThunderTime, updateWeather, triggerThunder, clearWeather]);

    return (
        <WeatherContext.Provider value={value}>
            {children}
        </WeatherContext.Provider>
    );
}

function useWeather() {
    return useContext(WeatherContext);
}

export { WeatherProvider, useWeather };



