import React from "react";
import Register from "./Register.tsx";
import { Routes, Route, HashRouter } from "react-router-dom";
import Login from "./Login.tsx";
import Dashboard from "./Dashboard.tsx";

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
