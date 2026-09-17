import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "@/context/AuthContext";


export default function AdminGuard() {

  const {
    user,
  } = useAuth();

  return user?.role === "ADMIN"
    ? <Outlet />
    : (
        <Navigate
          to="/login"
          replace
        />
      );
}