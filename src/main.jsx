import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";

import { store } from "./lib/store";
import { Provider } from "react-redux";

import { CanvasProvider } from "./hooks/useCanvas";
import { BrowserRouter } from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn(
    "VITE_GOOGLE_CLIENT_ID is missing. Google login will not work."
  );
}

createRoot(
  document.getElementById("root")
).render(
  <Provider store={store}>
    <CanvasProvider>
      <BrowserRouter>
        <GoogleOAuthProvider
          clientId={googleClientId || ""}
        >
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </CanvasProvider>
  </Provider>
);