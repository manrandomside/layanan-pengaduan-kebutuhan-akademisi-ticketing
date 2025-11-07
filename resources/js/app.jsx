import "./bootstrap";
import "../css/app.css";
import React from "react";
import { createRoot } from "react-dom/client";

function App() {
    return (
        <div className="container mt-5">
            <h1>Laravel + React Setup Complete</h1>
            <p>Ticketing System UPT LAB</p>
        </div>
    );
}

const root = createRoot(document.getElementById("app"));
root.render(<App />);
