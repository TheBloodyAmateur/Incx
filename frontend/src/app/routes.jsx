import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../pages/login/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import WeatherPage from "../pages/weather/WeatherPage";
import FileStoragePage from "../pages/filestorage/FileStoragePage";
import BookingPage from "../pages/booking/BookingPage";

const router = createBrowserRouter([
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
    }
]);

export default router;
