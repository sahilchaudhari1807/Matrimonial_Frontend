import {useState} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches"
import ProfileView from "./pages/ProfileView";


function App() {
  const [token,setToken] = useState(localStorage.getItem("token")); // ✅ important
 

  return (
    <BrowserRouter>
      <Routes>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login Route */}
        <Route
          path="/login"
          element={<Login setToken={setToken}/>}
        />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard setToken={setToken}/> : <Navigate to="/login" />}
        />

        <Route path="/profile" element={<Profile/>}/>
        <Route path="/matches" element={<Matches/>}/>

        <Route path="/profile/:id" element={<ProfileView />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;