import React from "react";
import Register from "./Register.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.tsx";
import Dashboard from "./Dashboard.tsx";

const PageNotFound: React.FC = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
