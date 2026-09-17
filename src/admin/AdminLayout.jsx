import {
  NavLink,
  Outlet,
  Link,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  IndianRupee,
  Store,
} from "lucide-react";

const menu = [
  {
    label: "Dashboard",
    path: "/admin",
    end: true,
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Customization Pricing",
    path: "/admin/customization-pricing",
    icon: IndianRupee,
  },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="hidden md:flex w-72 flex-col border-r bg-white">

          <div className="h-20 flex items-center px-6 border-b">
            <Link
              to="/"
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Store size={20} />
              </div>

              <div>
                <div className="font-black text-xl">
                  MOGREN
                </div>

                <div className="text-xs text-zinc-500">
                  Administration
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      rounded-xl
                      font-medium
                      transition
                      ${
                        isActive
                          ? "bg-black text-white"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
                      }
                    `
                  }
                >
                  <Icon size={18} />

                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Link
              to="/"
              className="block text-center border rounded-xl py-3 font-medium hover:bg-zinc-50"
            >
              Back to Store
            </Link>
          </div>

        </aside>

        {/* =====================================================
            MAIN AREA
        ===================================================== */}

        <div className="flex-1 min-w-0">

          {/* MOBILE HEADER */}

          <div className="md:hidden bg-white border-b px-4 py-4">
            <div className="font-black text-xl">
              MOGREN Admin
            </div>

            <div className="flex gap-2 overflow-x-auto mt-4 pb-1">

              {menu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `
                      whitespace-nowrap
                      px-3
                      py-2
                      rounded-lg
                      text-sm
                      font-medium
                      ${
                        isActive
                          ? "bg-black text-white"
                          : "border bg-white"
                      }
                    `
                  }
                >
                  {item.label}
                </NavLink>
              ))}

            </div>
          </div>

          <Outlet />

        </div>

      </div>
    </div>
  );
}