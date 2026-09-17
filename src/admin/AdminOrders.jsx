import {
  useEffect,
  useState,
} from "react";

import {
  adminApi,
} from "@/services/api";

const statuses = [
  "PLACED",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

/*
 * ============================================================
 * FORMAT PRICE
 * ============================================================
 */

function formatPrice(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

/*
 * ============================================================
 * PARSE CUSTOM DESIGN
 * ============================================================
 */

function parseCustomDesign(
  customDesign
) {
  if (!customDesign) {
    return null;
  }

  try {
    if (
      typeof customDesign ===
      "string"
    ) {
      return JSON.parse(
        customDesign
      );
    }

    return customDesign;
  } catch (error) {
    console.error(
      "Unable to parse custom design",
      error
    );

    return null;
  }
}

/*
 * ============================================================
 * FIND IMAGE OBJECTS INSIDE FABRIC JSON
 * ============================================================
 */

function extractImages(
  canvasJson
) {
  if (!canvasJson) {
    return [];
  }

  const images = [];

  /*
   * Fabric JSON normally contains:
   *
   * {
   *   objects: [
   *      {
   *        type: "Image",
   *        src: "..."
   *      }
   *   ]
   * }
   */

  const walk =
    (value) => {
      if (!value) {
        return;
      }

      if (
        Array.isArray(value)
      ) {
        value.forEach(
          walk
        );

        return;
      }

      if (
        typeof value !==
        "object"
      ) {
        return;
      }

      const type =
        String(
          value.type || ""
        ).toLowerCase();

      /*
       * Handles:
       *
       * Image
       * image
       * FabricImage
       */
      if (
        type.includes(
          "image"
        )
        &&
        value.src
      ) {
        images.push({
          src:
            value.src,

          type:
            value.type,

          left:
            value.left,

          top:
            value.top,

          scaleX:
            value.scaleX,

          scaleY:
            value.scaleY,

          angle:
            value.angle,
        });
      }

      Object.values(
        value
      ).forEach(
        walk
      );
    };

  walk(
    canvasJson
  );

  /*
   * Remove duplicate image URLs.
   */

  const unique =
    [];

  const seen =
    new Set();

  images.forEach(
    (image) => {
      if (
        !seen.has(
          image.src
        )
      ) {
        seen.add(
          image.src
        );

        unique.push(
          image
        );
      }
    }
  );

  return unique;
}

/*
 * ============================================================
 * SIDE DISPLAY NAME
 * ============================================================
 */

function sideLabel(
  side
) {
  const labels = {
    front:
      "Front",

    back:
      "Back",

    left:
      "Left Sleeve",

    right:
      "Right Sleeve",
  };

  return (
    labels[side] ||
    side
  );
}

/*
 * ============================================================
 * CUSTOM DESIGN PREVIEW
 * ============================================================
 */

function CustomDesignPreview({
  customDesign,
}) {
  const design =
    parseCustomDesign(
      customDesign
    );

  if (!design) {
    return null;
  }

  const views =
    design.views || {};

  const sides = [
    "front",
    "back",
    "left",
    "right",
  ];

  const sideImages =
    sides.map(
      (side) => ({
        side,

        images:
          extractImages(
            views[side]
          ),
      })
    );

  const hasImages =
    sideImages.some(
      (item) =>
        item.images.length >
        0
    );

  return (
    <div className="mt-5 border-t pt-5">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>

          <div className="font-bold">
            Custom Design
          </div>

          <div className="text-xs text-zinc-500 mt-1">
            Customer artwork used for this order
          </div>

        </div>


        <div className="flex flex-wrap gap-2">

          {design.garmentType && (

            <span className="text-xs bg-zinc-100 rounded-full px-3 py-1.5">
              {design.garmentType}
            </span>

          )}


          {design.designedAreas
            ?.map(
              (area) => (

                <span
                  key={area}
                  className="text-xs bg-black text-white rounded-full px-3 py-1.5"
                >
                  {area}
                </span>

              )
            )}

        </div>

      </div>


      {/* ===================================================
          ARTWORK IMAGES
      =================================================== */}

      {hasImages ? (

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">

          {sideImages
            .filter(
              (item) =>
                item.images.length >
                0
            )
            .map(
              ({
                side,
                images,
              }) => (

                <div
                  key={side}
                  className="border rounded-2xl overflow-hidden bg-white"
                >

                  <div className="px-4 py-3 border-b bg-zinc-50">

                    <div className="text-sm font-bold">
                      {sideLabel(
                        side
                      )}
                    </div>

                    <div className="text-xs text-zinc-500">
                      {images.length}
                      {" "}
                      artwork
                      {images.length !== 1
                        ? "s"
                        : ""}
                    </div>

                  </div>


                  <div className="p-4 grid gap-3">

                    {images.map(
                      (
                        image,
                        index
                      ) => (

                        <div
                          key={
                            `${side}-${index}`
                          }
                          className="border rounded-xl bg-zinc-50 overflow-hidden"
                        >

                          <div className="aspect-square flex items-center justify-center p-3">

                            <img
                              src={
                                image.src
                              }
                              alt={
                                `${sideLabel(
                                  side
                                )} artwork`
                              }
                              className="max-w-full max-h-full object-contain"
                            />

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )
            )}

        </div>

      ) : (

        <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">

          Custom design data exists, but no image source was found inside the saved Fabric canvas JSON.

        </div>

      )}


      {/* ===================================================
          DESIGN INFORMATION
      =================================================== */}

      <div className="grid sm:grid-cols-3 gap-3 mt-5">

        <div className="bg-zinc-50 rounded-xl p-3">

          <div className="text-xs text-zinc-500">
            Garment
          </div>

          <div className="font-semibold text-sm mt-1">
            {design.garmentType ||
              "—"}
          </div>

        </div>


        <div className="bg-zinc-50 rounded-xl p-3">

          <div className="text-xs text-zinc-500">
            T-Shirt Color
          </div>

          <div className="flex items-center gap-2 mt-1">

            {design.tshirtColor && (

              <span
                className="w-5 h-5 rounded-full border"
                style={{
                  backgroundColor:
                    design.tshirtColor,
                }}
              />

            )}

            <span className="font-semibold text-sm">
              {design.tshirtColor ||
                "—"}
            </span>

          </div>

        </div>


        <div className="bg-zinc-50 rounded-xl p-3">

          <div className="text-xs text-zinc-500">
            Designed Areas
          </div>

          <div className="font-semibold text-sm mt-1">
            {design.designedAreas
              ?.join(", ") ||
              "—"}
          </div>

        </div>

      </div>

    </div>
  );
}

/*
 * ============================================================
 * ADMIN ORDERS
 * ============================================================
 */

export default function AdminOrders() {
  const [
    items,
    setItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /*
   * =========================================================
   * LOAD ORDERS
   * =========================================================
   */

  const load =
    async () => {
      try {
        setLoading(
          true
        );

        setError(
          ""
        );

        const data =
          await adminApi.orders();

        setItems(
          Array.isArray(
            data
          )
            ? data
            : []
        );

      } catch (
        err
      ) {

        console.error(
          err
        );

        setError(
          err.message ||
            "Unable to load orders."
        );

      } finally {

        setLoading(
          false
        );
      }
    };

  useEffect(
    () => {
      load();
    },
    []
  );

  /*
   * =========================================================
   * UPDATE STATUS
   * =========================================================
   */

  const updateStatus =
    async (
      id,
      status
    ) => {
      try {

        setUpdatingId(
          id
        );

        setError(
          ""
        );

        setSuccess(
          ""
        );

        await adminApi.updateOrder(
          id,
          status
        );

        setSuccess(
          `Order #${id} updated to ${status}.`
        );

        await load();

      } catch (
        err
      ) {

        console.error(
          err
        );

        setError(
          err.message ||
            "Unable to update order status."
        );

      } finally {

        setUpdatingId(
          null
        );
      }
    };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <main className="max-w-7xl mx-auto p-6 lg:p-10">

      {/* HEADER */}

      <div className="flex flex-wrap justify-between gap-4">

        <div>

          <p className="text-sm text-zinc-500">
            Admin / Orders
          </p>

          <h1 className="text-3xl md:text-4xl font-black mt-1">
            Orders
          </h1>

          <p className="text-zinc-500 mt-2">
            Manage customer orders, custom designs and fulfilment.
          </p>

        </div>


        <button
          type="button"
          onClick={load}
          className="border rounded-xl px-4 py-2 bg-white hover:bg-zinc-50"
        >
          Refresh
        </button>

      </div>


      {/* MESSAGES */}

      {error && (

        <div className="mt-6 border border-red-200 bg-red-50 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>

      )}


      {success && (

        <div className="mt-6 border border-green-200 bg-green-50 text-green-700 rounded-xl px-4 py-3">
          {success}
        </div>

      )}


      {/* =====================================================
          ORDER LIST
      ===================================================== */}

      <div className="mt-8 space-y-5">

        {loading ? (

          <div className="border bg-white rounded-2xl p-10 text-center text-zinc-500">
            Loading orders...
          </div>

        ) : items.length === 0 ? (

          <div className="border bg-white rounded-2xl p-10 text-center text-zinc-500">
            No orders found.
          </div>

        ) : (

          items.map(
            (order) => (

              <div
                className="bg-white border rounded-2xl p-5 md:p-6"
                key={
                  order.id
                }
              >

                {/* ORDER HEADER */}

                <div className="flex flex-wrap justify-between gap-4">

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="font-black text-lg">
                        #{order.id}
                      </span>

                      <span className="text-zinc-400">
                        ·
                      </span>

                      <span className="font-medium">
                        {order.customerEmail}
                      </span>

                    </div>


                    <p className="text-sm text-zinc-500 mt-1">

                      ₹
                      {formatPrice(
                        order.total
                      )}

                      {" · "}

                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleString()
                        : "—"}

                    </p>

                  </div>


                  <select
                    className="border rounded-xl px-3 py-2 bg-white"
                    value={
                      order.status
                    }
                    disabled={
                      updatingId ===
                      order.id
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updateStatus(
                          order.id,
                          event.target.value
                        )
                    }
                  >

                    {statuses.map(
                      (
                        status
                      ) => (

                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {status}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* TOTALS */}

                <div className="grid sm:grid-cols-4 gap-3 mt-5">

                  <div className="bg-zinc-50 rounded-xl p-3">

                    <div className="text-xs text-zinc-500">
                      Subtotal
                    </div>

                    <div className="font-bold mt-1">
                      ₹
                      {formatPrice(
                        order.subtotal
                      )}
                    </div>

                  </div>


                  <div className="bg-zinc-50 rounded-xl p-3">

                    <div className="text-xs text-zinc-500">
                      Shipping
                    </div>

                    <div className="font-bold mt-1">
                      ₹
                      {formatPrice(
                        order.shipping
                      )}
                    </div>

                  </div>


                  <div className="bg-zinc-50 rounded-xl p-3">

                    <div className="text-xs text-zinc-500">
                      Tax
                    </div>

                    <div className="font-bold mt-1">
                      ₹
                      {formatPrice(
                        order.tax
                      )}
                    </div>

                  </div>


                  <div className="bg-black text-white rounded-xl p-3">

                    <div className="text-xs text-zinc-300">
                      Total
                    </div>

                    <div className="font-bold mt-1">
                      ₹
                      {formatPrice(
                        order.total
                      )}
                    </div>

                  </div>

                </div>


                {/* =================================================
                    ITEMS
                ================================================= */}

                <div className="mt-5 border-t pt-4">

                  <div className="text-xs uppercase tracking-wide text-zinc-400 font-semibold">
                    Items
                  </div>


                  <div className="mt-3 space-y-5">

                    {order.items?.map(
                      (
                        item
                      ) => (

                        <div
                          key={
                            item.id
                          }
                          className="border rounded-2xl p-4"
                        >

                          {/* ITEM HEADER */}

                          <div className="flex flex-wrap justify-between gap-3">

                            <div>

                              <div className="font-semibold">
                                {item.productName}
                              </div>


                              <div className="text-zinc-500 text-sm mt-1">

                                Qty:
                                {" "}
                                {item.quantity}

                                {" · "}

                                Size:
                                {" "}
                                {item.size}

                                {" · "}

                                Color:
                                {" "}
                                {item.color}

                              </div>

                            </div>


                            <div className="font-bold">

                              ₹
                              {formatPrice(
                                item.unitPrice
                              )}

                            </div>

                          </div>


                          {/* CUSTOM DESIGN */}

                          {item.customDesign && (

                            <CustomDesignPreview
                              customDesign={
                                item.customDesign
                              }
                            />

                          )}

                        </div>

                      )
                    )}

                  </div>

                </div>

              </div>

            )
          )

        )}

      </div>

    </main>
  );
}