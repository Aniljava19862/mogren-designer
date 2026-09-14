import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  Package,
  ShoppingBag,
} from "lucide-react";

import { orderApi } from "@/services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErr("");

      const response = await orderApi.mine();

      if (Array.isArray(response)) {
        setOrders(response);
      } else if (Array.isArray(response?.content)) {
        setOrders(response.content);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Unable to load orders", error);

      setErr(
        error?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-[#f8f8f6]">
      <div className="mx-auto max-w-5xl px-6 py-14 md:px-10">
        <div className="mb-10">
          <p className="nova-eyebrow text-zinc-400">
            MOGREN ACCOUNT
          </p>

          <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
            My Orders
          </h1>

          <p className="mt-3 text-zinc-500">
            Track and review your MOGREN purchases.
          </p>
        </div>

        {loading && <OrdersSkeleton />}

        {!loading && err && (
          <div className="border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              {err}
            </p>

            <button
              onClick={loadOrders}
              className="mt-4 bg-black px-5 py-3 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !err &&
          orders.length === 0 && (
            <div className="flex min-h-[380px] flex-col items-center justify-center border border-zinc-200 bg-white px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                <ShoppingBag size={25} />
              </div>

              <h2 className="font-display mt-6 text-2xl font-bold">
                No orders yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                When you place an order, you'll be able
                to track it here.
              </p>

              <Link
                to="/shop"
                className="mt-6 inline-flex items-center gap-2 bg-black px-6 py-3.5 text-sm font-bold text-white"
              >
                Start Shopping
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        {!loading &&
          !err &&
          orders.length > 0 && (
            <div className="space-y-5">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
      </div>
    </main>
  );
}

function OrderCard({ order }) {
  const total =
    Number(
      order.total ??
        order.totalAmount ??
        order.grandTotal ??
        0
    );

  const createdAt =
    order.createdAt ||
    order.orderDate ||
    order.createdDate;

  const items =
    order.items ||
    order.orderItems ||
    [];

  return (
    <article className="border border-zinc-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-zinc-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="nova-eyebrow text-zinc-400">
            Order
          </div>

          <div className="font-display mt-1 text-lg font-bold">
            #{order.id}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {createdAt && (
            <div>
              <div className="text-xs text-zinc-400">
                Placed
              </div>

              <div className="mt-1 text-sm font-semibold">
                {formatDate(createdAt)}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-zinc-400">
              Total
            </div>

            <div className="mt-1 text-sm font-bold">
              ₹{total.toLocaleString("en-IN")}
            </div>
          </div>

          <StatusBadge
            status={order.status}
          />
        </div>
      </div>

      <div className="px-6 py-5">
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={
                  item.id ||
                  `${order.id}-${index}`
                }
                className="flex items-center gap-4"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-zinc-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={
                        item.productName ||
                        item.name ||
                        "Product"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package
                      size={20}
                      className="text-zinc-400"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold">
                    {item.productName ||
                      item.name ||
                      item.product?.name ||
                      "MOGREN Product"}
                  </div>

                  <div className="mt-1 text-xs text-zinc-500">
                    Qty:{" "}
                    {item.quantity || 1}
                  </div>
                </div>

                {item.price != null && (
                  <div className="font-semibold">
                    ₹
                    {Number(
                      item.price
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Order details are not available.
          </p>
        )}
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const value =
    status || "PLACED";

  const style = {
    PLACED:
      "bg-blue-50 text-blue-700",
    CONFIRMED:
      "bg-indigo-50 text-indigo-700",
    PROCESSING:
      "bg-amber-50 text-amber-700",
    SHIPPED:
      "bg-purple-50 text-purple-700",
    DELIVERED:
      "bg-emerald-50 text-emerald-700",
    CANCELLED:
      "bg-red-50 text-red-700",
  }[value] ||
    "bg-zinc-100 text-zinc-700";

  return (
    <span
      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${style}`}
    >
      {value}
    </span>
  );
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(value));
  } catch {
    return value;
  }
}

function OrdersSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="border border-zinc-200 bg-white p-6"
        >
          <div className="h-4 w-28 animate-pulse bg-zinc-200" />
          <div className="mt-3 h-6 w-40 animate-pulse bg-zinc-200" />

          <div className="mt-8 h-16 animate-pulse bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}