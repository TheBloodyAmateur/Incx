import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import FileStoragePage from "../pages/filestorage/FileStoragePage";

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
        path: "/filestorage",
        element: <FileStoragePage />,
    }
]);

export default router;
