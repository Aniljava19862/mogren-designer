import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";

import {
  adminApi,
} from "@/services/api";


const GARMENT_TYPES = [
  {
    value: "ROUND_NECK",
    label: "Round Neck / Crew Neck",
  },
  {
    value: "WOMEN_TSHIRT",
    label: "Women T-Shirt",
  },
  {
    value: "WOMEN_POLO",
    label: "Women Polo",
  },
  {
    value: "HOODIE",
    label: "Hoodie",
  },
];


const PRINT_AREAS = [
  {
    value: "FRONT",
    label: "Front",
  },
  {
    value: "BACK",
    label: "Back",
  },
  {
    value: "LEFT_SLEEVE",
    label: "Left Sleeve",
  },
  {
    value: "RIGHT_SLEEVE",
    label: "Right Sleeve",
  },
];


const EMPTY_FORM = {
  garmentType: "ROUND_NECK",
  printArea: "FRONT",
  price: 100,
  active: true,
};


function garmentLabel(value) {
  return (
    GARMENT_TYPES.find(
      (item) =>
        item.value === value
    )?.label ||
    value
  );
}


function printAreaLabel(value) {
  return (
    PRINT_AREAS.find(
      (item) =>
        item.value === value
    )?.label ||
    value
  );
}


function formatPrice(value) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value || 0)
  );
}


export default function AdminCustomizationPricing() {

  const [
    items,
    setItems,
  ] = useState([]);

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

  const [
    filter,
    setFilter,
  ] = useState("ALL");

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  const [
    editingId,
    setEditingId,
  ] = useState(null);


  /*
   * =========================================================
   * LOAD
   * =========================================================
   */

  const load = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await adminApi
          .getCustomizationPricing();

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
          "Unable to load customization pricing."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    load();

  }, []);


  /*
   * =========================================================
   * FILTER
   * =========================================================
   */

  const filteredItems =
    useMemo(
      () => {

        if (
          filter === "ALL"
        ) {
          return items;
        }

        return items.filter(
          (item) =>
            item.garmentType ===
            filter
        );

      },
      [
        items,
        filter,
      ]
    );


  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */

  const resetForm =
    () => {

      setEditingId(
        null
      );

      setForm({
        ...EMPTY_FORM,
      });

      setError("");
      setSuccess("");
    };


  /*
   * =========================================================
   * EDIT
   * =========================================================
   */

  const editItem =
    (item) => {

      setEditingId(
        item.id
      );

      setForm({
        garmentType:
          item.garmentType,

        printArea:
          item.printArea,

        price:
          Number(
            item.price
          ),

        active:
          item.active,
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
   * SAVE
   * =========================================================
   */

  const save =
    async (event) => {

      event.preventDefault();

      try {

        setSaving(true);
        setError("");
        setSuccess("");

        const payload = {
          garmentType:
            form.garmentType,

          printArea:
            form.printArea,

          price:
            Number(
              form.price
            ),

          active:
            Boolean(
              form.active
            ),
        };


        if (editingId) {

          await adminApi
            .updateCustomizationPricing(
              editingId,
              payload
            );

          setSuccess(
            "Customization price updated successfully."
          );

        } else {

          await adminApi
            .createCustomizationPricing(
              payload
            );

          setSuccess(
            "Customization price created successfully."
          );
        }


        setEditingId(
          null
        );

        setForm({
          ...EMPTY_FORM,
        });

        await load();

      } catch (err) {

        console.error(
          err
        );

        setError(
          err.message ||
            "Unable to save customization pricing."
        );

      } finally {

        setSaving(false);
      }
    };


  /*
   * =========================================================
   * TOGGLE STATUS
   * =========================================================
   */

  const toggleStatus =
    async (item) => {

      try {

        setError("");
        setSuccess("");

        await adminApi
          .updateCustomizationPricingStatus(
            item.id,
            !item.active
          );

        setSuccess(
          item.active
            ? "Pricing disabled."
            : "Pricing enabled."
        );

        await load();

      } catch (err) {

        console.error(
          err
        );

        setError(
          err.message ||
            "Unable to update status."
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

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-wrap items-start justify-between gap-5">

        <div>
          <p className="text-sm text-zinc-500">
            Admin / Pricing
          </p>

          <h1 className="text-3xl md:text-4xl font-black mt-1">
            Customization Pricing
          </h1>

          <p className="text-zinc-500 mt-2 max-w-2xl">
            Configure additional printing charges
            for each garment and printable area.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="
            flex
            items-center
            gap-2
            border
            rounded-xl
            px-4
            py-2.5
            bg-white
            hover:bg-zinc-50
          "
        >
          <RefreshCw
            size={17}
          />

          Refresh
        </button>

      </div>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

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
          FORM
      ===================================================== */}

      <div className="mt-8 bg-white border rounded-2xl p-5 md:p-6">

        <div className="flex items-center justify-between gap-4">

          <div>

            <h2 className="text-lg font-bold">

              {editingId
                ? "Edit Pricing"
                : "Add Pricing"}

            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              The backend uses these values when calculating custom orders.
            </p>

          </div>


          {editingId && (

            <button
              type="button"
              onClick={resetForm}
              className="border rounded-lg p-2 hover:bg-zinc-50"
            >
              <X size={18} />
            </button>

          )}

        </div>


        <form
          onSubmit={save}
          className="
            grid
            md:grid-cols-[1fr_1fr_180px_150px]
            gap-4
            mt-6
            items-end
          "
        >

          {/* GARMENT */}

          <div>

            <label className="text-sm font-medium">
              Garment Type
            </label>

            <select
              className="border rounded-xl px-3 py-3 w-full mt-1 bg-white"
              value={
                form.garmentType
              }
              disabled={
                Boolean(editingId)
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    garmentType:
                      event.target.value,
                  })
              }
            >

              {GARMENT_TYPES.map(
                (item) => (

                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>

                )
              )}

            </select>

          </div>


          {/* AREA */}

          <div>

            <label className="text-sm font-medium">
              Print Area
            </label>

            <select
              className="border rounded-xl px-3 py-3 w-full mt-1 bg-white"
              value={
                form.printArea
              }
              disabled={
                Boolean(editingId)
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    printArea:
                      event.target.value,
                  })
              }
            >

              {PRINT_AREAS.map(
                (item) => (

                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>

                )
              )}

            </select>

          </div>


          {/* PRICE */}

          <div>

            <label className="text-sm font-medium">
              Price (₹)
            </label>

            <input
              type="number"
              min="0"
              step="1"
              required
              className="border rounded-xl px-3 py-3 w-full mt-1"
              value={
                form.price
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    price:
                      event.target.value,
                  })
              }
            />

          </div>


          {/* SAVE */}

          <button
            type="submit"
            disabled={saving}
            className="
              flex
              justify-center
              items-center
              gap-2
              bg-black
              text-white
              rounded-xl
              px-4
              py-3
              font-bold
              disabled:opacity-50
            "
          >

            {editingId
              ? (
                <>
                  <Pencil size={17} />
                  Update
                </>
              )
              : (
                <>
                  <Plus size={17} />
                  Add
                </>
              )}

          </button>

        </form>

      </div>


      {/* =====================================================
          FILTER
      ===================================================== */}

      <div className="mt-8 flex flex-wrap gap-2">

        <button
          type="button"
          onClick={
            () =>
              setFilter("ALL")
          }
          className={`
            px-4
            py-2
            rounded-xl
            text-sm
            font-medium
            border
            ${
              filter === "ALL"
                ? "bg-black text-white border-black"
                : "bg-white"
            }
          `}
        >
          All
        </button>


        {GARMENT_TYPES.map(
          (item) => (

            <button
              type="button"
              key={item.value}
              onClick={
                () =>
                  setFilter(
                    item.value
                  )
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-medium
                border
                ${
                  filter === item.value
                    ? "bg-black text-white border-black"
                    : "bg-white"
                }
              `}
            >
              {item.label}
            </button>

          )
        )}

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="mt-5 bg-white border rounded-2xl overflow-hidden">

        {loading ? (

          <div className="p-10 text-center text-zinc-500">
            Loading pricing...
          </div>

        ) : filteredItems.length === 0 ? (

          <div className="p-10 text-center text-zinc-500">
            No customization pricing found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-zinc-50">

                <tr className="text-left border-b">

                  <th className="px-5 py-4">
                    Garment
                  </th>

                  <th className="px-5 py-4">
                    Print Area
                  </th>

                  <th className="px-5 py-4">
                    Price
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredItems.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-zinc-50"
                    >

                      <td className="px-5 py-4">

                        <div className="font-semibold">
                          {garmentLabel(
                            item.garmentType
                          )}
                        </div>

                        <div className="text-xs text-zinc-400 mt-1">
                          {item.garmentType}
                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <div className="font-medium">
                          {printAreaLabel(
                            item.printArea
                          )}
                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <span className="font-bold text-base">
                          ₹{formatPrice(
                            item.price
                          )}
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={
                            () =>
                              toggleStatus(
                                item
                              )
                          }
                          className={`
                            inline-flex
                            items-center
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-bold
                            ${
                              item.active
                                ? "bg-green-100 text-green-700"
                                : "bg-zinc-100 text-zinc-500"
                            }
                          `}
                        >

                          {item.active
                            ? "Active"
                            : "Inactive"}

                        </button>

                      </td>


                      <td className="px-5 py-4">

                        <div className="flex justify-end">

                          <button
                            type="button"
                            onClick={
                              () =>
                                editItem(
                                  item
                                )
                            }
                            className="
                              flex
                              items-center
                              gap-2
                              border
                              rounded-lg
                              px-3
                              py-2
                              bg-white
                              hover:bg-zinc-50
                            "
                          >

                            <Pencil
                              size={15}
                            />

                            Edit

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </main>
  );
}