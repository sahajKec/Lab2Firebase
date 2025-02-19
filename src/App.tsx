import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register.tsx";
import Login from "./Login.tsx";
import Dashboard from "./Dashboard.tsx";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
    return (
        <Router>
            <Toaster />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
};

export default App;
