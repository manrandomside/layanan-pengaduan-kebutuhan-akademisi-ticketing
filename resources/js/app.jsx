import "./bootstrap";
import "../css/app.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import Router from "./Router";
import echo from "./config/echo";

// Make Echo available globally
window.Echo = echo;

function App() {
    return (
        <AuthProvider>
            <Router />
        </AuthProvider>
    );
}

const root = createRoot(document.getElementById("app"));
root.render(<App />);
