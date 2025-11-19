import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../pages/login/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import BookingPage from "../pages/booking/BookingPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },
    {
        path: "/dashboard",
        element: <DashboardPage />,
    }
    ,
    {
        path: "/booking",
        element: <BookingPage />,
    }
]);

export default router;
