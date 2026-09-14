import {
  LogOut,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Account() {
  const {
    user,
    logout,
    isAdmin,
  } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <main className="min-h-[70vh] bg-[#f8f8f6]">
      <div className="mx-auto max-w-4xl px-6 py-14 md:px-10">
        <div className="mb-10">
          <p className="nova-eyebrow text-zinc-400">
            MOGREN ACCOUNT
          </p>

          <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
            My Account
          </h1>

          <p className="mt-3 text-zinc-500">
            Manage your MOGREN profile.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* PROFILE SUMMARY */}
          <aside className="border border-zinc-200 bg-white p-7">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black font-display text-2xl font-bold text-white">
              {initial}
            </div>

            <h2 className="font-display mt-5 text-xl font-bold">
              {user?.name}
            </h2>

            <p className="mt-1 break-all text-sm text-zinc-500">
              {user?.email}
            </p>

            <div className="mt-5">
              <span className="inline-flex items-center gap-2 bg-zinc-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em]">
                {isAdmin && (
                  <ShieldCheck
                    size={14}
                  />
                )}

                {user?.role}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-8 flex w-full items-center justify-center gap-2 border border-zinc-300 px-4 py-3 text-sm font-semibold transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </aside>

          {/* ACCOUNT DETAILS */}
          <section className="border border-zinc-200 bg-white p-7 md:p-8">
            <h2 className="font-display text-2xl font-bold">
              Account Details
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Details associated with your
              MOGREN account.
            </p>

            <div className="mt-8 space-y-5">
              <AccountField
                icon={<User size={18} />}
                label="Name"
                value={user?.name}
              />

              <AccountField
                icon={<Mail size={18} />}
                label="Email address"
                value={user?.email}
              />

              <AccountField
                icon={
                  <ShieldCheck size={18} />
                }
                label="Account type"
                value={user?.role}
              />
            </div>

            <div className="mt-8 border-t border-zinc-200 pt-6">
              <p className="text-xs leading-6 text-zinc-400">
                Profile editing and password
                management can be added next.
                Google-authenticated accounts
                continue to use Google for
                authentication.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AccountField({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 border border-zinc-200 px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center bg-zinc-100 text-zinc-600">
        {icon}
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-400">
          {label}
        </div>

        <div className="mt-1 font-semibold text-zinc-900">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}