import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  ChevronDown,
  LogOut,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  Package,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function SiteHeader() {
  const { items = [] } = useCart();

  const {
    user,
    logout,
    isAuthenticated,
    isAdmin,
  } = useAuth();

  const navigate = useNavigate();

  const [accountOpen, setAccountOpen] =
    useState(false);

  const accountRef = useRef(null);

  const count = items.reduce(
    (total, item) =>
      total + (item.quantity || 1),
    0
  );

  const firstName =
    user?.name?.trim()?.split(" ")[0] ||
    "Account";

  const initial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(
          event.target
        )
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 md:px-10 lg:px-14">
        {/* BRAND */}
        <Link
          to="/"
          className="font-display text-2xl font-extrabold tracking-[-0.04em]"
        >
          <span className="font-medium text-zinc-400">
            MOGREN
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-semibold transition ${
                isActive
                  ? "text-black"
                  : "text-zinc-500 hover:text-black"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `text-sm font-semibold transition ${
                isActive
                  ? "text-black"
                  : "text-zinc-500 hover:text-black"
              }`
            }
          >
            Shop
          </NavLink>

          <NavLink
            to="/designer"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 text-sm font-semibold transition ${
                isActive
                  ? "text-black"
                  : "text-zinc-500 hover:text-black"
              }`
            }
          >
            <Sparkles size={15} />
            Customize
          </NavLink>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2">
          {/* SEARCH */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-zinc-100"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* ACCOUNT */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-zinc-100"
              aria-label="Sign in"
            >
              <User size={18} />
            </Link>
          ) : (
            <div
              ref={accountRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setAccountOpen(
                    (current) => !current
                  )
                }
                className="flex items-center gap-2 rounded-full px-2 py-1.5 transition hover:bg-zinc-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                  {initial}
                </span>

                <span className="hidden text-sm font-semibold text-zinc-800 lg:block">
                  {firstName}
                </span>

                <ChevronDown
                  size={14}
                  className={`hidden text-zinc-500 transition lg:block ${
                    accountOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-64 overflow-hidden border border-zinc-200 bg-white shadow-2xl">
                  {/* USER SUMMARY */}
                  <div className="border-b border-zinc-200 px-5 py-4">
                    <div className="font-display text-sm font-bold text-black">
                      {user?.name}
                    </div>

                    <div className="mt-1 truncate text-xs text-zinc-500">
                      {user?.email}
                    </div>
                  </div>

                  {/* MENU */}
                  <div className="p-2">
                    <Link
                      to="/orders"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
                    >
                      <Package size={17} />
                      My Orders
                    </Link>

                    <Link
                      to="/account"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
                    >
                      <Settings size={17} />
                      Account
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() =>
                          setAccountOpen(false)
                        }
                        className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
                      >
                        <ShieldCheck size={17} />
                        Admin
                      </Link>
                    )}
                  </div>

                  {/* LOGOUT */}
                  <div className="border-t border-zinc-200 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CART */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-zinc-100"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />

            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}