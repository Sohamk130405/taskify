import Layout from "../layouts";
import Home from "../pages/Home";
import Boards from "../pages/Boards";
import Tasks from "../pages/Tasks";
import NotFound from "../pages/NotFound";
import AuthPage from "../pages/AuthPage";
import Analytics from "../pages/Analytics";
import ProtectedRoute from "../components/ProtectedRoute"; // Import the ProtectedRoute component
import { Navigate } from "react-router-dom";
import Profile from "../pages/Profile";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Navigate to="/Home" />,
      },
      {
        path: "/Home",
        element: <Home />,
      },
      {
        path: "/Profile",
        element: <Profile />,
      },
      {
        path: "/Boards/:orgId",
        element: <ProtectedRoute element={<Boards />} />,
      },
      {
        path: "/Boards/:orgId/:boardId",
        element: <ProtectedRoute element={<Tasks />} />,
      },
      {
        path: "/Analytics/:orgId",
        element: <ProtectedRoute element={<Analytics />} />, // Added Analytics route
      },
      {
        path: "/auth",
        element: <AuthPage />,
      },
      {
        path: "*", // Catch-all route
        element: <NotFound />,
      },
    ],
  },
];

export default routes;
