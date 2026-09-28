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

  colorVariants: [
    {
      name: "Black",
      hex: "#000000",
      imageUrl: "",
    },
    {
      name: "White",
      hex: "#ffffff",
      imageUrl: "",
    },
  ],

  garmentType: "",
  customizable: false,
  active: true,

};




const DEFAULT_COLOR_HEX = {
  black: "#000000",
  white: "#ffffff",
  navy: "#000080",
  red: "#dc2626",
  grey: "#808080",
  gray: "#808080",
  blue: "#2563eb",
  maroon: "#800000",
  olive: "#808000",
  beige: "#f5f5dc",
  cream: "#fffdd0",
};

const resolveHex = (
  value
) => {
  const text =
    String(value || "")
      .trim();

  if (
    /^#[0-9a-f]{6}$/i
      .test(text)
    ||
    /^#[0-9a-f]{3}$/i
      .test(text)
  ) {
    return text;
  }

  return (
    DEFAULT_COLOR_HEX[
      text.toLowerCase()
    ] ||
    "#cccccc"
  );
};

const buildVariantsFromProduct = (
  product
) => {
  if (
    Array.isArray(
      product?.colorVariants
    )
    &&
    product.colorVariants.length >
      0
  ) {
    return product
      .colorVariants
      .map(
        (variant) => ({
          name:
            String(
              variant?.name ||
                ""
            ),
          hex:
            variant?.hex ||
            resolveHex(
              variant?.name
            ),
          imageUrl:
            variant?.imageUrl ||
            product?.imageUrl ||
            "",
        })
      );
  }

  const colors =
    Array.isArray(
      product?.colors
    )
      ? product.colors
      : [];

  return colors
    .filter(Boolean)
    .map(
      (color) => ({
        name:
          String(color),
        hex:
          resolveHex(
            color
          ),
        imageUrl:
          product?.imageUrl ||
          "",
      })
    );
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



        const cleanVariants =
          (
            form.colorVariants ||
            []
          )
            .map(
              (variant) => ({
                name:
                  String(
                    variant?.name ||
                      ""
                  )
                    .trim(),

                hex:
                  String(
                    variant?.hex ||
                      resolveHex(
                        variant?.name
                      )
                  )
                    .trim(),

                imageUrl:
                  String(
                    variant?.imageUrl ||
                      form.imageUrl ||
                      ""
                  )
                    .trim(),
              })
            )
            .filter(
              (variant) =>
                variant.name
            );

        const payload = {
          ...form,

          colorVariants:
            cleanVariants,

          /*
           * Keep old colors list synchronized for Checkout /
           * OrderService validation.
           */
          colors:
            [
              ...new Set(
                cleanVariants
                  .map(
                    (variant) =>
                      variant.name
                  )
              ),
            ],
        };

        await adminApi.saveProduct(

          payload

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

        colorVariants:
          buildVariantsFromProduct(
            product
          ),

        garmentType:
          product.garmentType || "",

        customizable:
          Boolean(
            product.customizable
          ),
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
   * COLOR VARIANTS
   * =========================================================
   */

  const addColorVariant =
    () => {

      setForm(
        (current) => ({
          ...current,

          colorVariants: [
            ...(
              current.colorVariants ||
              []
            ),

            {
              name: "",
              hex: "#cccccc",
              imageUrl: "",
            },
          ],
        })
      );
    };


  const updateColorVariant =
    (
      index,
      field,
      value
    ) => {

      setForm(
        (current) => {

          const variants =
            [
              ...(
                current.colorVariants ||
                []
              ),
            ];

          variants[index] = {
            ...variants[index],
            [field]:
              value,
          };

          if (
            field === "name"
            &&
            (
              !variants[index].hex
              ||
              variants[index].hex ===
                "#cccccc"
            )
          ) {
            variants[index].hex =
              resolveHex(
                value
              );
          }

          return {
            ...current,
            colorVariants:
              variants,
          };
        }
      );
    };


  const removeColorVariant =
    (index) => {

      setForm(
        (current) => ({
          ...current,

          colorVariants:
            (
              current.colorVariants ||
              []
            )
              .filter(
                (
                  _,
                  variantIndex
                ) =>
                  variantIndex !==
                  index
              ),
        })
      );
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

                    <th className="px-5 py-4">
                      Designer
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
                                product.customizable
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-zinc-100 text-zinc-500"
                              }
                            `}
                          >
                            {product.customizable
                              ? product.garmentType || "Enabled"
                              : "No"}
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



                    {/* =================================================
              DESIGNER CONFIGURATION
          ================================================= */}

          <div className="border rounded-xl p-4 bg-zinc-50 space-y-4">

            <div className="flex items-start justify-between gap-4">

              <div>
                <div className="font-semibold text-sm">
                  Designer Product
                </div>

                <div className="text-xs text-zinc-500 mt-1">
                  Allow this product to be selected inside the MOGREN designer.
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form.customizable)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      customizable:
                        event.target.checked,
                      garmentType:
                        event.target.checked
                          ? form.garmentType
                          : "",
                    })
                  }
                  className="h-4 w-4"
                />

                Enabled
              </label>

            </div>

            {form.customizable && (

              <div>

                <label className="text-sm font-medium">
                  Garment Type
                </label>

                <select
                  required={form.customizable}
                  className="border rounded-xl px-3 py-2.5 w-full mt-1 bg-white"
                  value={form.garmentType || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      garmentType:
                        event.target.value,
                    })
                  }
                >
                  <option value="">
                    Select garment type
                  </option>

                  <option value="ROUND_NECK">
                    Round Neck / Crew Neck
                  </option>

                  <option value="WOMEN_TSHIRT">
                    Women's T-Shirt
                  </option>

                  <option value="WOMEN_POLO">
                    Women's Polo
                  </option>

                  <option value="HOODIE">
                    Hoodie
                  </option>
                </select>

                <div className="text-xs text-zinc-500 mt-2">
                  This tells the designer which garment mockup to render.
                </div>

              </div>

            )}

          </div>


          {/* =================================================
              COLOR VARIANTS
          ================================================= */}

          <div className="border rounded-xl p-4 space-y-4">

            <div className="flex items-start justify-between gap-4">

              <div>
                <div className="font-semibold">
                  Product Colors & Photos
                </div>

                <div className="text-xs text-zinc-500 mt-1">
                  Add every available garment color and its matching product photo.
                </div>
              </div>

              <button
                type="button"
                onClick={
                  addColorVariant
                }
                className="border border-black rounded-lg px-3 py-2 text-xs font-bold bg-white hover:bg-zinc-50"
              >
                + Add Color
              </button>

            </div>

            {(
              form.colorVariants ||
              []
            ).length === 0 && (
              <div className="text-sm text-zinc-500 border border-dashed rounded-xl p-4">
                No colors configured. Click Add Color.
              </div>
            )}

            <div className="space-y-4">

              {(
                form.colorVariants ||
                []
              ).map(
                (
                  variant,
                  index
                ) => (

                  <div
                    key={
                      `color-${index}`
                    }
                    className="border rounded-xl p-4 bg-zinc-50"
                  >

                    <div className="flex items-center justify-between gap-3 mb-3">

                      <div className="font-semibold text-sm">
                        Color {index + 1}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeColorVariant(
                            index
                          )
                        }
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>

                    </div>

                    <div className="grid grid-cols-[1fr_110px] gap-3">

                      <div>

                        <label className="text-xs font-medium">
                          Color Name
                        </label>

                        <input
                          required
                          placeholder="Black"
                          className="border rounded-xl px-3 py-2.5 w-full mt-1 bg-white"
                          value={
                            variant.name ||
                            ""
                          }
                          onChange={
                            (event) =>
                              updateColorVariant(
                                index,
                                "name",
                                event.target.value
                              )
                          }
                        />

                      </div>

                      <div>

                        <label className="text-xs font-medium">
                          Swatch
                        </label>

                        <div className="mt-1 flex items-center gap-2">

                          <input
                            type="color"
                            className="h-[42px] w-[48px] border rounded-lg bg-white p-1"
                            value={
                              /^#[0-9a-f]{6}$/i.test(
                                variant.hex ||
                                  ""
                              )
                                ? variant.hex
                                : "#cccccc"
                            }
                            onChange={
                              (event) =>
                                updateColorVariant(
                                  index,
                                  "hex",
                                  event.target.value
                                )
                            }
                          />

                          <input
                            className="min-w-0 border rounded-lg px-2 py-2.5 w-full bg-white text-xs"
                            value={
                              variant.hex ||
                              ""
                            }
                            onChange={
                              (event) =>
                                updateColorVariant(
                                  index,
                                  "hex",
                                  event.target.value
                                )
                            }
                          />

                        </div>

                      </div>

                    </div>

                    <div className="mt-3">

                      <label className="text-xs font-medium">
                        Photo URL for this Color
                      </label>

                      <input
                        placeholder="https://.../black-shirt.jpg"
                        className="border rounded-xl px-3 py-2.5 w-full mt-1 bg-white"
                        value={
                          variant.imageUrl ||
                          ""
                        }
                        onChange={
                          (event) =>
                            updateColorVariant(
                              index,
                              "imageUrl",
                              event.target.value
                            )
                        }
                      />

                    </div>

                    {(variant.imageUrl ||
                      form.imageUrl) && (

                      <div className="mt-3 flex items-center gap-3">

                        <img
                          src={
                            variant.imageUrl ||
                            form.imageUrl
                          }
                          alt={
                            variant.name ||
                            `Color ${index + 1}`
                          }
                          className="h-20 w-16 object-cover border rounded-lg bg-white"
                        />

                        <div className="text-xs text-zinc-500">
                          Shop preview for {variant.name || "this color"}
                        </div>

                      </div>

                    )}

                  </div>
                )
              )}

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
