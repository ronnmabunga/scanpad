import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocalStorageProvider } from "./context/LocalStorageContext";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <LocalStorageProvider>
                <App />
            </LocalStorageProvider>
        </BrowserRouter>
    </StrictMode>
);
