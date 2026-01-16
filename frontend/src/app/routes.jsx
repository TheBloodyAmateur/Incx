import { createBrowserRouter, Outlet } from "react-router-dom";

import LoginPage from "../pages/login/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import BookingPage from "../pages/booking/BookingPage";
import WeatherPage from "../pages/weather/WeatherPage";
import FileStoragePage from "../pages/filestorage/FileStoragePage";
import CookieConsent from "../components/ui/CookieConsent";

// Root Layout that includes CookieConsent on every page
function RootLayout() {
    return (
        <>
            <CookieConsent />
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
