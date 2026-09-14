import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApi } from "@/services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "MOGREN_token";
const USER_KEY = "MOGREN_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  /*
   * Normal email/password login
   */
  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await authApi.login(
        email,
        password
      );

      if (!response?.token) {
        throw new Error(
          "Login succeeded but no token was returned."
        );
      }

      localStorage.setItem(
        TOKEN_KEY,
        response.token
      );

      if (response.user) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(response.user)
        );
      }

      setUser(response.user);

      return response.user;
    } finally {
      setLoading(false);
    }
  };

  /*
   * Google login
   *
   * credential = Google ID token returned by
   * @react-oauth/google
   */
  const googleLogin = async (credential) => {
    try {
      setLoading(true);

      if (!credential) {
        throw new Error(
          "Google credential is missing."
        );
      }

      const response =
        await authApi.googleLogin(
          credential
        );

      if (!response?.token) {
        throw new Error(
          "Google login succeeded but no application token was returned."
        );
      }

      localStorage.setItem(
        TOKEN_KEY,
        response.token
      );

      if (response.user) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(response.user)
        );
      }

      setUser(response.user);

      return response.user;
    } finally {
      setLoading(false);
    }
  };

  /*
   * Registration
   */
  const register = async (data) => {
    try {
      setLoading(true);

      const response =
        await authApi.register(data);

      if (!response?.token) {
        throw new Error(
          "Registration succeeded but no token was returned."
        );
      }

      localStorage.setItem(
        TOKEN_KEY,
        response.token
      );

      if (response.user) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(response.user)
        );
      }

      setUser(response.user);

      return response.user;
    } finally {
      setLoading(false);
    }
  };

  /*
   * Logout
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setUser(null);
  };

  /*
   * Used anywhere in the UI where we need to know
   * whether a user is logged in.
   */
  const isAuthenticated =
    Boolean(
      user &&
        localStorage.getItem(TOKEN_KEY)
    );

  const isAdmin =
    user?.role === "ADMIN";

  /*
   * Keep state in sync if localStorage changes in
   * another browser tab.
   */
  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === USER_KEY ||
        event.key === TOKEN_KEY
      ) {
        try {
          const storedUser =
            localStorage.getItem(USER_KEY);

          setUser(
            storedUser
              ? JSON.parse(storedUser)
              : null
          );
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,

      login,
      googleLogin,
      register,
      logout,

      isAuthenticated,
      isAdmin,
    }),
    [
      user,
      loading,
      isAuthenticated,
      isAdmin,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}