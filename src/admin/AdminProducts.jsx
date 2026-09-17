import {
  useEffect,
  useState,
} from "react";

import {
  adminApi,
} from "@/services/api";

const empty = {
  name: "",
  slug: "",
  description: "",
  category: "T-Shirts",
  price: 799,
  stock: 100,
  imageUrl:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  sizes: [
    "S",
    "M",
    "L",
    "XL",
  ],
  colors: [
    "Black",
    "White",
  ],
  active: true,
};

export default function AdminProducts() {
  const [
    items,
    setItems,
  ] = useState([]);

  const [
    form,
    setForm,
  ] = useState(empty);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

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
   * LOAD PRODUCTS
   * =========================================================
   */

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await adminApi.products();

      setItems(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        err
      );

      setError(
        err.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * IMPORTANT:
   *
   * Do NOT write:
   *
   * useEffect(load, []);
   *
   * because load() returns a Promise.
   */

  useEffect(() => {
    load();
  }, []);

  /*
   * =========================================================
   * SAVE PRODUCT
   * =========================================================
   */

  const save =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await adminApi.saveProduct(
          form
        );

        setSuccess(
          form.id
            ? "Product updated successfully."
            : "Product created successfully."
        );

        setForm({
          ...empty,
        });

        await load();
      } catch (err) {
        console.error(
          err
        );

        setError(
          err.message ||
            "Unable to save product."
        );
      } finally {
        setSaving(false);
      }
    };

  /*
   * =========================================================
   * EDIT PRODUCT
   * =========================================================
   */

  const editProduct =
    (product) => {
      setForm({
        ...product,
        sizes:
          product.sizes || [],
        colors:
          product.colors || [],
      });

      setError("");
      setSuccess("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  /*
   * =========================================================
   * CANCEL EDIT
   * =========================================================
   */

  const resetForm =
    () => {
      setForm({
        ...empty,
      });

      setError("");
      setSuccess("");
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
            Admin / Catalog
          </p>

          <h1 className="text-3xl md:text-4xl font-black mt-1">
            Products
          </h1>

          <p className="text-zinc-500 mt-2">
            Manage product catalog, pricing and stock.
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

      <div className="grid lg:grid-cols-[1fr_420px] gap-8 mt-8">

        {/* ===================================================
            PRODUCT TABLE
        =================================================== */}

        <div className="bg-white border rounded-2xl overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-zinc-500">
              Loading products...
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-zinc-500">
              No products found.
            </div>
          ) : (
            <div className="overflow-auto">

              <table className="w-full text-sm">

                <thead className="bg-zinc-50">
                  <tr className="text-left border-b">

                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      Category
                    </th>

                    <th className="px-5 py-4">
                      Price
                    </th>

                    <th className="px-5 py-4">
                      Stock
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {items.map(
                    (product) => (
                      <tr
                        className="border-b last:border-b-0 hover:bg-zinc-50"
                        key={product.id}
                      >

                        <td className="px-5 py-4">

                          <div className="font-semibold">
                            {product.name}
                          </div>

                          <div className="text-xs text-zinc-400 mt-1">
                            {product.slug}
                          </div>

                        </td>

                        <td className="px-5 py-4">
                          {product.category}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {product.stock}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              ${
                                product.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-zinc-100 text-zinc-500"
                              }
                            `}
                          >
                            {product.active
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-right">

                          <button
                            type="button"
                            className="underline font-medium"
                            onClick={() =>
                              editProduct(
                                product
                              )
                            }
                          >
                            Edit
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* ===================================================
            PRODUCT FORM
        =================================================== */}

        <form
          onSubmit={save}
          className="bg-white border rounded-2xl p-5 space-y-4 h-fit"
        >

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-bold text-lg">
                {form.id
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <p className="text-sm text-zinc-500 mt-1">
                Product catalog information
              </p>
            </div>

            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm underline"
              >
                Cancel
              </button>
            )}

          </div>

          <div>

            <label className="text-sm font-medium">
              Name
            </label>

            <input
              required
              className="border rounded-xl px-3 py-2.5 w-full mt-1"
              value={form.name}
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    name:
                      event.target.value,
                  })
              }
            />

          </div>

          <div>

            <label className="text-sm font-medium">
              Slug
            </label>

            <input
              required
              className="border rounded-xl px-3 py-2.5 w-full mt-1"
              value={form.slug}
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    slug:
                      event.target.value,
                  })
              }
            />

          </div>

          <div>

            <label className="text-sm font-medium">
              Category
            </label>

            <input
              required
              className="border rounded-xl px-3 py-2.5 w-full mt-1"
              value={form.category}
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    category:
                      event.target.value,
                  })
              }
            />

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="text-sm font-medium">
                Price
              </label>

              <input
                required
                type="number"
                min="0"
                className="border rounded-xl px-3 py-2.5 w-full mt-1"
                value={form.price}
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      price:
                        Number(
                          event.target.value
                        ),
                    })
                }
              />

            </div>

            <div>

              <label className="text-sm font-medium">
                Stock
              </label>

              <input
                required
                type="number"
                min="0"
                className="border rounded-xl px-3 py-2.5 w-full mt-1"
                value={form.stock}
                onChange={
                  (event) =>
                    setForm({
                      ...form,
                      stock:
                        Number(
                          event.target.value
                        ),
                    })
                }
              />

            </div>

          </div>

          <div>

            <label className="text-sm font-medium">
              Image URL
            </label>

            <input
              className="border rounded-xl px-3 py-2.5 w-full mt-1"
              value={
                form.imageUrl ||
                ""
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    imageUrl:
                      event.target.value,
                  })
              }
            />

          </div>

          <div>

            <label className="text-sm font-medium">
              Description
            </label>

            <textarea
              rows={4}
              className="border rounded-xl px-3 py-2.5 w-full mt-1"
              value={
                form.description ||
                ""
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
              }
            />

          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white rounded-xl px-4 py-3 w-full font-bold disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : form.id
                ? "Update Product"
                : "Save Product"}
          </button>

        </form>

      </div>

    </main>
  );
}