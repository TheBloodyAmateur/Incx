import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes.jsx";
import "../styles/global.css";
import { UXProvider } from '../context/UXContext';
import { WeatherProvider } from '../context/WeatherContext';

export default function App() {
    return (
        <UXProvider>
            <WeatherProvider>
                <RouterProvider router={router} />
            </WeatherProvider>
        </UXProvider>
    );
}