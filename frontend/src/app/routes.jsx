import { createBrowserRouter, Outlet } from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/login/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import BookingPage from "../pages/booking/BookingPage";
import WeatherPage from "../pages/weather/WeatherPage";
import FileStoragePage from "../pages/filestorage/FileStoragePage";
import CookieConsent from "../components/ui/CookieConsent";
import RandomPopup from "../components/ui/RandomPopup";

// Root Layout that includes CookieConsent and RandomPopup on every page
function RootLayout() {
    return (
        <>
            <CookieConsent />
            <RandomPopup />
            <Outlet />
        </>
    );
}

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <LandingPage />,
            },
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/dashboard",
                element: <DashboardPage />,
            },
            {
                path: "/weather",
                element: <WeatherPage />,
            },
            {
                path: "/filestorage",
                element: <FileStoragePage />,
            },
            {
                path: "/booking",
                element: <BookingPage />,
            }
        ]
    }
]);

export default router;
