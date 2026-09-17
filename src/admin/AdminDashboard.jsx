import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  Palette,
} from "lucide-react";

import {
  adminApi,
} from "@/services/api";


export default function AdminDashboard() {

  const [
    stats,
    setStats,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {

    adminApi
      .stats()
      .then(
        setStats
      )
      .catch(
        console.error
      )
      .finally(
        () =>
          setLoading(false)
      );

  }, []);


  const cards = [

    {
      label: "Products",
      value:
        stats.products,
      icon: Package,
    },

    {
      label: "Orders",
      value:
        stats.orders,
      icon: ShoppingBag,
    },

    {
      label: "Customers",
      value:
        stats.customers,
      icon: Users,
    },

    {
      label: "Revenue",
      value:
        `₹${Number(
          stats.revenue || 0
        ).toLocaleString(
          "en-IN"
        )}`,
      icon: IndianRupee,
    },

  ];


  return (

    <main className="max-w-7xl mx-auto p-6 lg:p-10">

      {/* HEADER */}

      <div>

        <p className="text-sm text-zinc-500">
          Administration
        </p>

        <h1 className="text-3xl md:text-4xl font-black mt-1">
          Dashboard
        </h1>

        <p className="text-zinc-500 mt-2">
          Manage your MOGREN store.
        </p>

      </div>


      {/* STATS */}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">

        {cards.map(
          (card) => {

            const Icon =
              card.icon;

            return (

              <div
                key={
                  card.label
                }
                className="bg-white border rounded-2xl p-6"
              >

                <div className="flex items-center justify-between">

                  <p className="text-sm text-zinc-500">
                    {card.label}
                  </p>

                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                    <Icon
                      size={18}
                    />
                  </div>

                </div>


                <div className="text-3xl font-black mt-4">

                  {loading
                    ? "—"
                    : (
                        card.value ??
                        "—"
                      )}

                </div>

              </div>

            );
          }
        )}

      </div>


      {/* MANAGEMENT */}

      <div className="mt-10">

        <h2 className="text-xl font-bold">
          Store Management
        </h2>


        <div className="grid md:grid-cols-3 gap-5 mt-5">

          <Link
            to="/admin/products"
            className="bg-white border rounded-2xl p-6 hover:shadow-md transition"
          >

            <Package
              size={24}
            />

            <h3 className="font-bold text-lg mt-4">
              Products
            </h3>

            <p className="text-sm text-zinc-500 mt-2">
              Add products, manage stock,
              prices and catalog details.
            </p>

          </Link>


          <Link
            to="/admin/orders"
            className="bg-white border rounded-2xl p-6 hover:shadow-md transition"
          >

            <ShoppingBag
              size={24}
            />

            <h3 className="font-bold text-lg mt-4">
              Orders
            </h3>

            <p className="text-sm text-zinc-500 mt-2">
              View customer orders and
              update fulfilment status.
            </p>

          </Link>


          <Link
            to="/admin/customization-pricing"
            className="bg-white border rounded-2xl p-6 hover:shadow-md transition"
          >

            <Palette
              size={24}
            />

            <h3 className="font-bold text-lg mt-4">
              Customization Pricing
            </h3>

            <p className="text-sm text-zinc-500 mt-2">
              Configure Front, Back and
              Sleeve printing charges.
            </p>

          </Link>

        </div>

      </div>

    </main>
  );
}