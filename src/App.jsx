
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import ProfileView from "./pages/ProfileView";
import Chat from "./pages/Chat";
import GlobalWebSocket from "./components/GlobalWebSocket";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    return (
        <BrowserRouter>

            {/* Global WebSocket stays active on all protected pages */}
            {token && <GlobalWebSocket />}

            <Routes>

                {/* Default route */}
                <Route
                    path="/"
                    element={<Navigate to="/login" />}
                />

                {/* Login */}
                <Route
                    path="/login"
                    element={<Login setToken={setToken} />}
                />

                {/* Register */}
                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        token
                            ? <Dashboard setToken={setToken} />
                            : <Navigate to="/login" />
                    }
                />

                {/* Profile */}
                <Route
                    path="/profile"
                    element={token ? <Profile /> : <Navigate to="/login" />}
                />

                {/* Matches */}
                <Route
                    path="/matches"
                    element={token ? <Matches /> : <Navigate to="/login" />}
                />

                {/* Profile View */}
                <Route
                    path="/profile/:id"
                    element={token ? <ProfileView /> : <Navigate to="/login" />}
                />

                {/* Chat */}
                <Route
                    path="/chat"
                    element={token ? <Chat /> : <Navigate to="/login" />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
